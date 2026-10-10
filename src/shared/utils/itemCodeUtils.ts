/**
 * Genuine MDC / KKM Item Code Normalization & Resolution Utility
 * 
 * STRICT ZERO-MOCK MANDATE:
 * 1. Zero synthetic or mock item codes (never generate or display 'CC...', 'CC-...', 'MOCK...', etc.).
 * 2. Real database parity: adhere strictly to official MOH / KKM MDC formats.
 * 3. Exact codes for authoritative drugs:
 *    - Fenofibrate 145mg Tablet/Kapsul -> C10AB05000T1002XX
 *    - Olanzapine 5 mg Tablet         -> N05AH03000T1001XX.01
 *    - Olanzapine 10 mg Tablet        -> N05AH03000T1002XX.01
 * 4. Hyphenated / placeholder codes (e.g. C10AB05-000-T10-02-XXX) are normalized to genuine catalog codes.
 */

/**
 * Checks whether an item code is a synthetic or mock code
 */
export function isSyntheticMockCode(rawCode?: string | null): boolean {
  if (!rawCode) return true;
  const code = String(rawCode).trim().toUpperCase();
  if (!code || code === '-' || code === '—' || code === 'N/A' || code === 'NA' || code === 'NIL' || code === 'NULL' || code === 'UNKNOWN' || code === 'UNDEFINED') {
    return true;
  }
  // Any synthetic code starting with 'CC' (e.g., CCFENOFIBRATE..., CC-FENOFIBRATE..., CC1FNB..., etc.)
  if (code.startsWith('CC-') || code.startsWith('CC')) {
    return true;
  }
  // Generic mock prefixes
  if (code.startsWith('MOCK') || code.startsWith('TEST') || code.startsWith('DUMMY') || code.startsWith('TEMP')) {
    return true;
  }
  // Incomplete placeholder codes
  if (code.endsWith('XXX') || code.includes('-XXX')) {
    return true;
  }
  return false;
}

/**
 * Normalizes an item code to official KKM / MOH MDC format, rejecting any mock codes
 */
export function normalizeRealMdcCode(rawCode?: string | null, itemName?: string | null): string {
  const name = (itemName || '').trim().toLowerCase();
  let code = (rawCode || '').trim();

  // 1. Authoritative mapping for known drugs
  if (name.includes('fenofibrate') && (name.includes('145mg') || name.includes('145 mg'))) {
    return 'C10AB05000T1002XX';
  }
  if (name.includes('olanzapine')) {
    if (name.includes('5mg') || name.includes('5 mg')) {
      return 'N05AH03000T1001XX.01';
    }
    if (name.includes('10mg') || name.includes('10 mg')) {
      return 'N05AH03000T1002XX.01';
    }
  }

  // 2. Reject synthetic mock codes (CC..., MOCK..., etc.)
  if (isSyntheticMockCode(code)) {
    return '';
  }

  // 3. Normalize hyphenated KKM / MOH MDC codes (e.g., C10AB05-000-T10-02-XXX -> C10AB05000T1002XX)
  if (code.includes('-') && /^[A-Z][0-9]{2}[A-Z]/i.test(code)) {
    let cleaned = code.replace(/-/g, '');
    if (cleaned.endsWith('XXXX')) {
      cleaned = cleaned.replace(/XXXX$/, 'XX');
    } else if (cleaned.endsWith('XXX')) {
      cleaned = cleaned.replace(/XXX$/, 'XX');
    }
    return cleaned;
  }

  // 4. Strip trailing XXX placeholder if present
  if (code.endsWith('XXXX')) {
    return code.replace(/XXXX$/, 'XX');
  }
  if (code.endsWith('XXX')) {
    return code.replace(/XXX$/, 'XX');
  }

  return code;
}

/**
 * Asynchronously resolves a genuine item code from Supabase catalogs
 */
export async function resolveGenuineItemCode(
  supabaseClient: any,
  item: {
    item_code?: string | null;
    drug_code?: string | null;
    item_name?: string | null;
    drug_name?: string | null;
    item_type?: string | null;
    item_id?: string | null;
  }
): Promise<string> {
  const currentCode = (item.item_code || item.drug_code || '').trim();
  const itemName = (item.item_name || item.drug_name || '').trim();

  // 1. Check authoritative mapping first
  const normalized = normalizeRealMdcCode(currentCode, itemName);
  if (normalized && !isSyntheticMockCode(normalized)) {
    return normalized;
  }

  // If current code is already genuine, clean, and not synthetic, return it
  if (currentCode && !isSyntheticMockCode(currentCode) && !currentCode.includes('-')) {
    return currentCode;
  }

  // 2. Query Supabase drugs / non_drugs catalog by targeted item name
  if (itemName && itemName !== 'Unknown Item') {
    try {
      const isDrug = item.item_type !== 'non_drug';
      const table = isDrug ? 'drugs' : 'non_drugs';
      const nameCol = isDrug ? 'drug_name' : 'item_name';
      const codeCol = isDrug ? 'drug_code' : 'item_code';

      // Extract significant word
      const words = itemName.replace(/[\(\)\/\+,\.-]/g, ' ').split(/\s+/).filter(w => w.length >= 3);
      const searchWord = words[0] || itemName;

      const { data: candidates } = await supabaseClient
        .from(table)
        .select('*')
        .ilike(nameCol, `%${searchWord}%`)
        .not(codeCol, 'ilike', 'CC%')
        .not(codeCol, 'ilike', 'MOCK%')
        .not(codeCol, 'ilike', '%-XXX%')
        .limit(50);

      if (candidates && candidates.length > 0) {
        const normTarget = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Extract dosage numbers (e.g. 145mg, 100mg, 1g) to match exact strength
        const strengthMatches = itemName.toLowerCase().match(/\d+(\.\d+)?\s*(mg|g|mcg|ml|iu|%)/g) || [];
        const targetStrengths = strengthMatches.map(s => s.replace(/\s+/g, ''));

        // Rank candidates
        const scoredCandidates = candidates.map((c: any) => {
          const rawCandidateCode = (c[codeCol] || c.drug_code || c.item_code || '').trim();
          if (isSyntheticMockCode(rawCandidateCode)) return { candidate: c, score: -1, code: '' };

          const cleanCode = normalizeRealMdcCode(rawCandidateCode, c[nameCol]);
          if (!cleanCode || isSyntheticMockCode(cleanCode)) return { candidate: c, score: -1, code: '' };

          const cName = (c[nameCol] || '').toLowerCase();
          const cNorm = cName.replace(/[^a-z0-9]/g, '');

          let score = 0;
          if (cNorm === normTarget) score += 100;
          else if (cNorm.includes(normTarget) || normTarget.includes(cNorm)) score += 50;

          // Check strength match
          const cStrengthMatches = cName.match(/\d+(\.\d+)?\s*(mg|g|mcg|ml|iu|%)/g) || [];
          const cStrengths = cStrengthMatches.map((s: string) => s.replace(/\s+/g, ''));
          const matchingStrengths = targetStrengths.filter(s => cStrengths.includes(s));
          if (targetStrengths.length > 0 && matchingStrengths.length === targetStrengths.length) {
            score += 40;
          }

          // Prefer standard ATC format (e.g., C10AB...) over KPK
          if (/^[A-Z][0-9]{2}[A-Z]/.test(cleanCode)) score += 10;

          return { candidate: c, score, code: cleanCode };
        }).filter((sc: any) => sc.score > 0);

        scoredCandidates.sort((a: any, b: any) => b.score - a.score);

        if (scoredCandidates.length > 0 && scoredCandidates[0].code) {
          return scoredCandidates[0].code;
        }
      }
    } catch (_err) {
      // Ignore lookup failure and fallback
    }
  }

  // 3. Fallback: only return current code if it is NOT a synthetic mock code
  return (!isSyntheticMockCode(currentCode)) ? currentCode : '';
}
