// ⚡ PERFORMANCE: pdfjs-dist (~5MB) and tesseract.js (~10MB WASM) are loaded
// dynamically on first use — NOT at module load time — to prevent them from
// being bundled into the main chunk and delaying the initial app load.

type PdfjsLib = typeof import('pdfjs-dist')
type TesseractLib = typeof import('tesseract.js')

let _pdfjs: any = null
let _tesseract: any = null

async function getPdfjs(): Promise<any> {
  if (!_pdfjs) {
    const raw = await import('pdfjs-dist')
    _pdfjs = (raw as any).default || raw
    if (typeof window !== 'undefined' && _pdfjs && _pdfjs.GlobalWorkerOptions) {
      _pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`
    }
  }
  return _pdfjs
}

async function getTesseract(): Promise<any> {
  if (!_tesseract) {
    const raw = await import('tesseract.js')
    _tesseract = (raw as any).default || raw
  }
  return _tesseract
}


/**
 * Checks if a string matches the internal hospital Purchase Order format (e.g. PO-2026-0699).
 * Internal PO numbers should NEVER be treated as uploaded LPO numbers.
 */
function isInternalPoNumber(value: string): boolean {
  if (!value) return false;
  const clean = value.trim().toUpperCase();
  return /^PO[-_\s]?\d{4}[-_\s]?\d{3,5}$/i.test(clean) || /^PO-\d{4}-/i.test(clean);
}

/**
 * Extracts text from the first few pages of a PDF file and finds the genuine government LPO number.
 * Prioritizes Malaysian ePerolehan numbers (CO26..., PO26...) and AM 75E labels.
 * Strictly ignores internal hospital Purchase Order numbers (e.g. PO-2026-XXXX).
 */
export async function extractLpoNumberFromPdf(file: File): Promise<string | null> {
  try {
    const pdfjsLib = await getPdfjs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Scan up to 3 pages to find the LPO number
    const maxPages = Math.min(pdf.numPages, 3);
    let text = '';
    
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      text += ' ' + pageText;
    }

    // 1. Priority: Strict Malaysian government ePerolehan Contract Order & Direct Purchase format
    // Format: CO/PO followed by 2-digit fiscal year (e.g. 25, 26, 27) and 10 to 16 continuous digits WITHOUT hyphens
    // e.g. CO260000000515835, PO260000000583832, CO260000000479739
    const epMatch = text.match(/\b((?:CO|PO)\d{10,18})\b/i);
    if (epMatch) {
      return epMatch[1].toUpperCase();
    }

    // 2. Priority: Malaysian Government AM 75E labels (No. Dokumen, No. Dokumen Kawalan, No. Pesanan Kerajaan)
    const labelRegex = /(?:No\.?\s*Dokumen\s*(?:Kawalan)?|No\.?\s*Pesanan\s*Kerajaan|Pesanan\s*Tempatan|No\.\s*Pesanan\s*\(LPO\)|No\s*Pesanan\s*LPO|Pesanan\s*\(?LPO\)?)\s*[:\s]+([A-Z0-9\-_/]+)/i;
    const labelMatch = text.match(labelRegex);
    if (labelMatch) {
      const candidate = labelMatch[1].trim();
      if (!isInternalPoNumber(candidate)) {
        return candidate.toUpperCase();
      }
    }

    // 3. Priority: Standard manual or ministry LPO formats (e.g. LPO-..., LPO/..., EP...)
    const lpoRegex = /\b(LPO[-_\s/][A-Z0-9\-_/]{3,25})\b/i;
    const lpoMatch = text.match(lpoRegex);
    if (lpoMatch && !isInternalPoNumber(lpoMatch[1])) {
      return lpoMatch[1].toUpperCase();
    }

    const epRefRegex = /\b(EP\d{10,20})\b/i;
    const epRefMatch = text.match(epRefRegex);
    if (epRefMatch) {
      return epRefMatch[1].toUpperCase();
    }

    // 4. Fallback: CO or LPO prefix followed by at least 8 digits
    const fallbackRegex = /\b((?:CO|LPO)\s*\d{8,20})\b/i;
    const fallbackMatch = text.match(fallbackRegex);
    if (fallbackMatch) {
      const cleaned = fallbackMatch[1].replace(/\s+/g, '').toUpperCase();
      if (!isInternalPoNumber(cleaned)) {
        return cleaned;
      }
    }

    // 5. Fallback: search for any 12+ digit sequence if prefix is missing
    const digitRegex = /\b(\d{12,20})\b/;
    const digitMatch = text.match(digitRegex);
    if (digitMatch) {
      const cleaned = digitMatch[1];
      if (cleaned.startsWith('26') || cleaned.startsWith('20') || cleaned.length >= 14) {
        return cleaned;
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return null;
  }
}

/**
 * Extracts raw text from the first few pages of a PDF file.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const pdfjsLib = await getPdfjs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    // Extract text from up to 10 pages to ensure multi-item/multi-page DOs are fully parsed
    for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map((item: any) => item.str).join(' ') + ' ';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return '';
  }
}

/**
 * Parses date string in DD/MM/YYYY format to YYYY-MM-DD
 */
function parseDmyDate(dateStr: string): string | null {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return null;
}

export interface ExtractedLpoDates {
  documentDate: string | null;
  expectedDeliveryDate: string | null;
}

/**
 * Extracts document_date and expected_delivery_date from PDF text if present
 */
export async function extractDatesFromPdf(file: File): Promise<ExtractedLpoDates> {
  const result: ExtractedLpoDates = { documentDate: null, expectedDeliveryDate: null };
  try {
    const text = await extractTextFromPdf(file);
    if (!text) return result;

    // 1. Extract Tarikh Dokumen / Tarikh Pesanan (LPO)
    const docDateRegex = /(?:Tarikh\s+Dokumen|Tarikh\s+Pesanan\s*\(?LPO\)?|Tarikh\s+Pesanan)[\s\S]{0,150}?(\d{2}\/\d{2}\/\d{4})/i;
    const docDateMatch = text.match(docDateRegex);
    if (docDateMatch) {
      result.documentDate = parseDmyDate(docDateMatch[1]);
    } else {
      // General fallback to search for any date in the document, first one is usually the document date
      const generalDateRegex = /(\d{2}\/\d{2}\/\d{4})/;
      const dateMatch = text.match(generalDateRegex);
      if (dateMatch) {
        result.documentDate = parseDmyDate(dateMatch[1]);
      }
    }

    // 2. Extract expected delivery date ("Pada atau sebelum")
    const deliveryDateRegex = /Pada\s+atau\s+sebelum\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i;
    const deliveryDateMatch = text.match(deliveryDateRegex);
    if (deliveryDateMatch) {
      result.expectedDeliveryDate = parseDmyDate(deliveryDateMatch[1]);
    } else if (text.toLowerCase().includes('pada atau sebelum')) {
      const index = text.toLowerCase().indexOf('pada atau sebelum');
      const textAfter = text.substring(index, index + 200);
      const dateMatch = textAfter.match(/(\d{2}\/\d{2}\/\d{4})/);
      if (dateMatch) {
        result.expectedDeliveryDate = parseDmyDate(dateMatch[1]);
      }
    }
  } catch (error) {
    console.error('Error extracting dates from PDF:', error);
  }
  return result;
}

function cleanDocumentText(text: string): string {
  let s = text;

  // 1. Remove company registration patterns:
  // e.g. Co.Reg No:199401024117 (309798 - V), (309798-V), SSM: ..., ROC: ...
  s = s.replace(/Co\.?\s*Reg\.?\s*(?:No\.?)?[\s:]*\d+[\s\-_]*\([0-9A-Z\s\-_]+\)/gi, ' ');
  s = s.replace(/\(\s*\d{4,8}\s*[-–]\s*[A-Z]\s*\)/gi, ' ');
  s = s.replace(/\b\d{12}\b/g, ' ');

  // 2. Remove Tax / TIN numbers:
  // e.g. Tin Number : C8870258080 or TIN: C1234567890
  s = s.replace(/(?:Tin(?:\s*Number)?|Tax(?:\s*ID)?)[\s:]*[A-Z0-9]+/gi, ' ');

  // 3. Remove Delivery Order / PO / LPO / Ref patterns:
  // e.g. DELIVERY ORDER : No. D26/09-021, D26/09-021(TP), PO/LPO refs
  s = s.replace(/\b(?:DELIVERY\s+ORDER|D\/?O)[\s:]*(?:No\.?)?[\s:]*[A-Z0-9/_\-\(\)]+/gi, ' ');
  s = s.replace(/\b(?:Your\s+P\/?O(?:\s*No\.?)?|P\/?O\s*No\.?)[\s:]*[A-Z0-9/_\-]*/gi, ' ');
  s = s.replace(/\b(?:O2-REQ|PO|DO|LPO|CO)[A-Z0-9\-_/]+\b/gi, ' ');

  // 4. Remove return / request / reference codes:
  // e.g. 02 - RET - 2026828 - 3176 or 02-RET-20260828-3176
  s = s.replace(/\b\d{2}\s*[-–]\s*(?:RET|REQ)\s*[-–]\s*[\d\s\-–]+/gi, ' ');
  s = s.replace(/\bPerihal\s*:[\s\S]*?(?=(?:BANTUAN|SILINDER|Batch|Item|CODE|$))/gi, ' ');

  // 5. Remove dates DD/MM/YYYY or YYYYMMDD:
  s = s.replace(/\b\d{2}\/\d{2}\/\d{4}\b/g, ' ');
  s = s.replace(/\b(20\d{6}|19\d{6})\b/g, ' ');

  // 6. Remove batch numbers e.g. Batch No.: O1267/26 or O1269/26
  s = s.replace(/\bBatch\s*No\.?[\s:]*[A-Z0-9/_\-]+/gi, ' ');
  s = s.replace(/\b[A-Z0-9]{2,8}\/\d{2}\b/gi, ' ');

  // 7. Remove phone, fax, mobile, attention contact details:
  s = s.replace(/ATTN\s*:[\s\S]*?(?=(?:TEL|FAX|Item|CODE|Batch|$))/gi, ' ');
  s = s.replace(/\b(?:TEL|FAX|Tel|Fax)[\s:]*[\d\s\-–\(\)\/ext:,]+/gi, ' ');
  s = s.replace(/\b01\d[\s\-–]*\d{3,4}[\s\-–]*\d{4}\b/g, ' ');
  s = s.replace(/\b08\d[\s\-–]*\d{3}[\s\-–]*\d{3,4}\b/g, ' ');
  s = s.replace(/\b(?:33|34|35)\d{4}\b/g, ' ');

  // 8. Remove Malaysian address postcodes specifically in address context (e.g. 93450 Kuching, 98850 Lawas):
  s = s.replace(/\b\d{5}\s+(?:KUCHING|LAWAS|MIRI|SIBU|BINTULU|KOTA\s+KINABALU|SARAWAK|SABAH|KUALA\s+LUMPUR|SELANGOR)\b/gi, ' ');
  s = s.replace(/\b(?:SECTION|SEKSYEN|LOT|FLOOR|TINGKAT|JALAN|POSKOD|P\.O\.?\s*BOX)\s+[\d\s\-–,/]+/gi, ' ');

  // 9. Remove item sizes, units, volumes:
  // e.g. CODE SIZE : 101 - N, 8.0m³, UNIT 40, UNIT 4, 40 Total, 4 Total
  s = s.replace(/\bCODE\s*SIZE\s*:?\s*[A-Z0-9\s\-–]+/gi, ' ');
  s = s.replace(/\b\d+(\.\d+)?\s*m[3³]?\b/gi, ' ');
  s = s.replace(/\b\d+\s*(?:UNIT|PCS|BATANG|Total)\b/gi, ' ');

  // 10. Remove payment terms e.g. 30 DAYS
  s = s.replace(/\b\d+\s*DAYS\b/gi, ' ');

  // 11. Remove page indicators:
  s = s.replace(/\b(?:Page|Halaman)\s*:\s*\d+\s+(?:of|dari)\s+\d+\b/gi, ' ');

  // 12. Remove common footer boilerplate:
  s = s.replace(/Notes\s*:[\s\S]*?(?=(?:Authorised|Receipient|Tandatangan|$))/gi, ' ');
  s = s.replace(/(?:Authorised\s+Signature|Tandatangan\s+Dibenarkan)[\s\S]*?(?=(?:Receipient|Chop|$))/gi, ' ');
  s = s.replace(/(?:Receipient['’]?s\s+Chop|Cop\s+Penerima)[\s\S]*$/gi, ' ');

  return s;
}

function isValidSerialToken(cleaned: string): boolean {
  if (!cleaned) return false;

  const isNoiseWord = (lower: string): boolean => {
    const meta = new Set([
      'serial', 'no', 'number', 'numbers', 's/n', 'nomor', 'siri', 'batch',
      'filling', 'expiry', 'date', 'unit', 'silinder', 'sewaan', 'gas', 'oksigen',
      'oxygen', 'perihal', 'kegunaan', 'ambulance', 'hospital', 'borneo', 'indah', 'delivery',
      'order', 'received', 'signature', 'tandatangan', 'jumlah', 'total',
      'halaman', 'page', 'code', 'size', 'attn', 'kuching', 'sarawak', 'malaysia',
      'lawas', 'pending', 'terms', 'nota', 'catatan', 'notes', 'disediakan',
      'disahkan', 'item', 'customer', 'tel', 'fax', 'days', 'day', 'uom', 'qty',
      'bantuan', 'bhd', 'sdn', 'description'
    ]);
    return meta.has(lower);
  };

  const lower = cleaned.toLowerCase();
  if (isNoiseWord(lower)) return false;

  // Cylinder serial criteria:
  // 1. 4-8 digit numeric e.g. 011045, 80648, 26537, 57944, 0152334, 8448047
  const isNumericSerial = /^\d{4,8}$/.test(cleaned);

  // 2. Alphanumeric cylinder codes e.g. 8124A, K13937120, K13938020, K13940061
  const isAlphaNumericTag = /^[A-Z0-9]{4,12}$/i.test(cleaned) && (cleaned.match(/\d/g) || []).length >= 2;

  return isNumericSerial || isAlphaNumericTag;
}

/**
 * Accurately extracts serial numbers from oxygen delivery order documents:
 * 1. Checks for structured "Serial No." blocks first to preserve exact vendor lists.
 * 2. Fallbacks to robust document-wide sanitization to cleanly ignore non-serial metadata (company reg, taxes, postcodes, phone numbers, terms, item sizes).
 * 3. Extracts numeric (4-8 digits) and alphanumeric tags (e.g. K13937120, 8124A, 011045, 57944).
 */
export function parseSerialsFromText(text: string, applySuffix = true): string[] {
  // Method 1: Check for explicit "Serial No" blocks
  // e.g. "30 Serial No.: - 011045 - 014079 ... Batch No.:"
  const serialSectionRegex = /(?:(?:\d+\s+)?(?:Serial\s*No\.?|Nomor\s*Siri|No\.?\s*Siri|S\/N))[\s:]*([\s\S]*?)(?=(?:(?:\d+\s+)?(?:Serial\s*No\.?|Nomor\s*Siri|No\.?\s*Siri|S\/N))|Batch\s*No\.?|Perihal\s*:|Notes\s*:|Authorised|Receipient|Tandatangan|Page\s*:|Halaman\s*:|$)/gi;

  let match;
  let foundInSections = false;
  const sectionSerials: string[] = [];

  while ((match = serialSectionRegex.exec(text)) !== null) {
    const sectionBody = match[1];
    const tokens = sectionBody.split(/[\s,;|•\-–*~]+/);
    for (const token of tokens) {
      const cleaned = token.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '').trim();
      if (isValidSerialToken(cleaned)) {
        let finalSerial = cleaned.toUpperCase();
        if (!finalSerial.startsWith('SABOXY-')) {
          finalSerial = `saboxy-${finalSerial}`;
        } else {
          finalSerial = `saboxy-${finalSerial.substring(7)}`;
        }
        sectionSerials.push(finalSerial);
        foundInSections = true;
      }
    }
  }

  if (foundInSections && sectionSerials.length > 0) {
    return applySuffix ? applySameDoDuplicateSuffix(sectionSerials) : sectionSerials;
  }

  // Method 2: Fallback to whole document cleaned parsing
  const sanitized = cleanDocumentText(text);
  const tokens = sanitized.split(/[\s,;|•\-–*~]+/);
  const serialsList: string[] = [];

  for (const token of tokens) {
    const cleaned = token.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '').trim();
    if (isValidSerialToken(cleaned)) {
      let finalSerial = cleaned.toUpperCase();
      if (!finalSerial.startsWith('SABOXY-')) {
        finalSerial = `saboxy-${finalSerial}`;
      } else {
        finalSerial = `saboxy-${finalSerial.substring(7)}`;
      }
      serialsList.push(finalSerial);
    }
  }

  return applySuffix ? applySameDoDuplicateSuffix(serialsList) : serialsList;
}

/**
 * Automatically applies duplicate suffix (-A, -B, etc.) to repeated serial numbers within the same Delivery Order.
 * e.g. 1st occurrence: 'saboxy-001036', 2nd occurrence: 'saboxy-001036-A'
 */
export function applySameDoDuplicateSuffix(serialsList: string[]): string[] {
  const countMap = new Map<string, number>();
  const result: string[] = [];

  for (const serial of serialsList) {
    const upper = serial.toUpperCase();
    const count = (countMap.get(upper) || 0) + 1;
    countMap.set(upper, count);

    if (count === 1) {
      result.push(serial);
    } else {
      const letterIndex = count - 2; // 0 for 'A', 1 for 'B', etc.
      const suffixLetter = String.fromCharCode(65 + (letterIndex % 26));
      const suffix = letterIndex >= 26 ? `-${suffixLetter}${Math.floor(letterIndex / 26) + 1}` : `-${suffixLetter}`;
      result.push(`${serial}${suffix}`);
    }
  }

  return result;
}

/**
 * Extracts serial numbers from a PDF or image document (or multiple documents) using text extraction or Tesseract OCR.
 */
export async function extractSerialsFromDocument(files: File | File[]): Promise<string[]> {
  const fileList = Array.isArray(files) ? files : [files];
  const combinedSerials: string[] = [];

  for (const file of fileList) {
    try {
      if (file.type === 'application/pdf') {
        // 1. Try digital text extraction first
        const digitalText = await extractTextFromPdf(file);
        if (digitalText && digitalText.trim().length > 0) {
          const digitalSerials = parseSerialsFromText(digitalText, false);
          if (digitalSerials.length > 0) {
            combinedSerials.push(...digitalSerials);
            continue;
          }
        }
        
        // 2. Fallback to OCR on rendered pages if digital text extraction yielded nothing
        const pdfjsLib = await getPdfjs();
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        let fullOcrText = '';
        const pagesToScan = Math.min(pdf.numPages, 10);
        
        for (let i = 1; i <= pagesToScan; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); // Higher scale helps OCR accuracy
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({ canvasContext: context, viewport }).promise;
            
            const Tesseract = await getTesseract();
            const { data: { text: pageText } } = await Tesseract.recognize(canvas, 'eng');
            fullOcrText += '\n' + pageText;
          }
        }
        
        const ocrSerials = parseSerialsFromText(fullOcrText, false);
        combinedSerials.push(...ocrSerials);
      } else {
        // Image file OCR
        const Tesseract = await getTesseract();
        const { data: { text: ocrText } } = await Tesseract.recognize(file, 'eng');
        const imgSerials = parseSerialsFromText(ocrText, false);
        combinedSerials.push(...imgSerials);
      }
    } catch (error) {
      console.error(`Error extracting serial numbers from ${file.name}:`, error);
    }
  }

  if (combinedSerials.length === 0) {
    throw new Error('Failed to parse document or no serial numbers detected. Please ensure the document is clear and readable.');
  }

  return applySameDoDuplicateSuffix(combinedSerials);
}


