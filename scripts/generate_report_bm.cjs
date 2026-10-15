/**
 * generate_report_bm.cjs
 *
 * Penjana Laporan Penilaian Modul & Impak Operasi (Berasaskan Visual & Jadual)
 * untuk Ekosistem Pengurusan Operasi Hospital (MyHOME v2.8.1) di Hospital Daerah Lawas.
 *
 * EDISI 100% BAHASA MELAYU RASMI (TIADA CAMPURAN BAHASA / TIADA MANGLISH)
 *
 * Mengandungi perincian operasi yang mendalam dan komprehensif bagi membuktikan
 * keupayaan penuh sistem kepada pihak Jabatan Kesihatan Negeri Sarawak (JKNS).
 */

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, HeadingLevel, AlignmentType, PageBreak,
  Header, Footer, PageNumber
} = require('docx');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────
// PALET REKA BENTUK & TIPOGRAFI
// ─────────────────────────────────────────────────────────────
const FONT_PRIMARY = 'Calibri';
const FONT_HEADING = 'Calibri Light';

const COLOR_NAVY = '0F2942';       // #0F2942 - Warna Korporat Utama / Muka Hadapan / H1 / Pengepala Jadual
const COLOR_BLUE = '1E3A8A';       // #1E3A8A - H2 / Aksen Sekunder
const COLOR_TEAL = '0D9488';       // #0D9488 - Anak panah aliran, sorotan KPI
const COLOR_CHARCOAL = '1F2937';   // #1F2937 - Teks badan
const COLOR_MUTED = '64748B';      // #64748B - Kapsyen, kaki halaman
const COLOR_BORDER = 'CBD5E1';     // #CBD5E1 - Sempadan kelabu lembut
const COLOR_ROW_ALT = 'F8FAFC';    // #F8FAFC - Baris berselang-seli jadual
const COLOR_FLOW_BG = 'F0F7FF';    // #F0F7FF - Latar belakang kotak carta alir
const COLOR_BEFORE_BG = 'FFF5F5';  // #FFF5F5 - Merah lembut lajur Sebelum
const COLOR_AFTER_BG = 'F0FDF4';   // #F0FDF4 - Hijau lembut lajur Selepas
const COLOR_BEFORE_BORDER = 'FCA5A5'; // Sempadan lajur Sebelum
const COLOR_AFTER_BORDER = '86EFAC';  // Sempadan lajur Selepas

const cellBorderStandard = {
  top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER }
};

// ─────────────────────────────────────────────────────────────
// FUNGSI BANTUAN SUSUN ATUR
// ─────────────────────────────────────────────────────────────

function p(runs, opts = {}) {
  const paragraphChildren = Array.isArray(runs) ? runs : [runs];
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: {
      before: opts.before !== undefined ? opts.before : 0,
      after: opts.after !== undefined ? opts.after : 100,
      line: opts.line !== undefined ? opts.line : 260,
    },
    bullet: opts.bullet || undefined,
    children: paragraphChildren.map(item => {
      if (typeof item === 'string') {
        return new TextRun({
          text: item,
          font: opts.font || FONT_PRIMARY,
          size: opts.size || 21, // 10.5pt
          color: opts.color || COLOR_CHARCOAL,
          bold: opts.bold || false,
          italics: opts.italics || false,
        });
      }
      return item;
    })
  });
}

function body(text, opts = {}) {
  return p(text, { size: 21, color: COLOR_CHARCOAL, after: 100, ...opts });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 120 },
    children: [
      new TextRun({
        text: text,
        font: FONT_HEADING,
        size: 28, // 14pt
        bold: true,
        color: COLOR_NAVY
      })
    ]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text: text,
        font: FONT_HEADING,
        size: 24, // 12pt
        bold: true,
        color: COLOR_BLUE
      })
    ]
  });
}

function bullet(text, level = 0, boldPrefix = '') {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({
      text: boldPrefix,
      font: FONT_PRIMARY,
      size: 21,
      bold: true,
      color: COLOR_CHARCOAL
    }));
  }
  children.push(new TextRun({
    text: text,
    font: FONT_PRIMARY,
    size: 21,
    color: COLOR_CHARCOAL
  }));

  return new Paragraph({
    bullet: { level },
    spacing: { before: 30, after: 60, line: 240 },
    children
  });
}

function blankLine(spacingAfter = 140) {
  return new Paragraph({
    spacing: { after: spacingAfter },
    children: []
  });
}

function pageBreak() {
  return new Paragraph({
    children: [new PageBreak()]
  });
}

// ─────────────────────────────────────────────────────────────
// KOMPONEN VISUAL 1: CARTA ALIR PROSES KERJA (4 hingga 6 Langkah)
// ─────────────────────────────────────────────────────────────
function createFlowDiagram(steps) {
  const total = steps.length;
  const cardWidth = Math.floor(86 / total);
  const arrowWidth = Math.floor(14 / (total - 1));
  const cells = [];

  steps.forEach((s, idx) => {
    // Kad Langkah
    cells.push(new TableCell({
      width: { size: cardWidth, type: WidthType.PERCENTAGE },
      shading: { fill: COLOR_FLOW_BG },
      margins: { top: 90, bottom: 90, left: 100, right: 100 },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BLUE },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
        left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
        right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER }
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 20 },
          children: [
            new TextRun({ text: 'LANGKAH ' + s.num, font: FONT_PRIMARY, size: 15, bold: true, color: COLOR_BLUE })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 20 },
          children: [
            new TextRun({ text: s.title, font: FONT_PRIMARY, size: 17, bold: true, color: COLOR_NAVY })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 0, line: 210 },
          children: [
            new TextRun({ text: s.desc, font: FONT_PRIMARY, size: 14, italics: true, color: COLOR_MUTED })
          ]
        })
      ]
    }));

    // Penyambung Anak Panah
    if (idx < total - 1) {
      cells.push(new TableCell({
        width: { size: arrowWidth, type: WidthType.PERCENTAGE },
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
        margins: { top: 120, bottom: 0, left: 5, right: 5 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: '➔', font: 'Segoe UI Symbol', size: 20, bold: true, color: COLOR_TEAL })
            ]
          })
        ]
      }));
    }
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: cells })]
  });
}

// ─────────────────────────────────────────────────────────────
// KOMPONEN VISUAL 2: BANNER PENGEPALA MODUL
// ─────────────────────────────────────────────────────────────
function createModuleHeaderBanner(moduleNum, moduleName, roleTag, department) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: COLOR_NAVY },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.SINGLE, size: 24, color: COLOR_TEAL },
              right: { style: BorderStyle.NONE }
            },
            children: [
              new Paragraph({
                spacing: { after: 40 },
                children: [
                  new TextRun({
                    text: `MODUL ${moduleNum} | ${moduleName.toUpperCase()}`,
                    font: FONT_HEADING,
                    size: 24,
                    bold: true,
                    color: 'FFFFFF'
                  })
                ]
              }),
              new Paragraph({
                spacing: { after: 0 },
                children: [
                  new TextRun({ text: 'DOMAIN OPERASI: ', font: FONT_PRIMARY, size: 17, bold: true, color: '38BDF8' }),
                  new TextRun({ text: `${roleTag}    |    `, font: FONT_PRIMARY, size: 17, color: 'E2E8F0' }),
                  new TextRun({ text: 'UNIT HOSPITAL LAWAS: ', font: FONT_PRIMARY, size: 17, bold: true, color: '38BDF8' }),
                  new TextRun({ text: department, font: FONT_PRIMARY, size: 17, color: 'E2E8F0' })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

// ─────────────────────────────────────────────────────────────
// KOMPONEN VISUAL 3: JADUAL PERBANDINGAN SEBELUM VS SELEPAS
// ─────────────────────────────────────────────────────────────
function createBeforeAfterTable(whyCreated, beforePoints, afterPoints) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Baris 1: Sebab Dibangunkan (Banner Lebar Penuh)
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: 'F1F5F9' },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            borders: cellBorderStandard,
            children: [
              new Paragraph({
                spacing: { after: 20 },
                children: [
                  new TextRun({ text: 'SEBAB DIBANGUNKAN (PENGGERAK OPERASI & INSTITUSI): ', font: FONT_PRIMARY, size: 18, bold: true, color: COLOR_BLUE }),
                  new TextRun({ text: whyCreated, font: FONT_PRIMARY, size: 18, color: COLOR_CHARCOAL })
                ]
              })
            ]
          })
        ]
      }),
      // Baris 2: Pengepala
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: '991B1B' }, // Merah Gelap
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            borders: cellBorderStandard,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'KEADAAN SEBELUM (REALITI MANUAL & JURANG OPERASI)', font: FONT_PRIMARY, size: 18, bold: true, color: 'FFFFFF' })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: '065F46' }, // Hijau Hutan Gelap
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            borders: cellBorderStandard,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'KEADAAN SELEPAS (KEUPAYAAN DIGITAL & AUTOMASI)', font: FONT_PRIMARY, size: 18, bold: true, color: 'FFFFFF' })
                ]
              })
            ]
          })
        ]
      }),
      // Baris 3: Kandungan Lajur
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: COLOR_BEFORE_BG },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
              left: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BEFORE_BORDER },
              right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER }
            },
            children: beforePoints.map(bp => new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 50, line: 230 },
              children: [
                new TextRun({ text: bp.title + ': ', font: FONT_PRIMARY, size: 17, bold: true, color: '991B1B' }),
                new TextRun({ text: bp.desc, font: FONT_PRIMARY, size: 17, color: COLOR_CHARCOAL })
              ]
            }))
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: COLOR_AFTER_BG },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
              left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
              right: { style: BorderStyle.SINGLE, size: 6, color: COLOR_AFTER_BORDER }
            },
            children: afterPoints.map(ap => new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 50, line: 230 },
              children: [
                new TextRun({ text: ap.title + ': ', font: FONT_PRIMARY, size: 17, bold: true, color: '065F46' }),
                new TextRun({ text: ap.desc, font: FONT_PRIMARY, size: 17, color: COLOR_CHARCOAL })
              ]
            }))
          })
        ]
      })
    ]
  });
}

// ─────────────────────────────────────────────────────────────
// KOMPONEN VISUAL 4: JADUAL UAT & KAD SKOR NILAI
// ─────────────────────────────────────────────────────────────
function createUatAndValueTable(uatScenarios, staffFeedback, valueMetrics) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Pengepala UAT
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: COLOR_NAVY },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            borders: cellBorderStandard,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'UJIAN PENERIMAAN PENGGUNA (UAT) & PENYERAHAN NILAI OPERASI', font: FONT_PRIMARY, size: 18, bold: true, color: 'FFFFFF' })
                ]
              })
            ]
          })
        ]
      }),
      // Senario UAT (Kiri) vs Penyerahan Nilai (Kanan)
      new TableRow({
        children: [
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            shading: { fill: 'FFFFFF' },
            margins: { top: 90, bottom: 90, left: 110, right: 110 },
            borders: cellBorderStandard,
            children: [
              new Paragraph({
                spacing: { after: 50 },
                children: [
                  new TextRun({ text: 'SENARIO SIMULASI UAT & BUKTI PENGESAHAN:', font: FONT_PRIMARY, size: 17, bold: true, color: COLOR_BLUE })
                ]
              }),
              ...uatScenarios.map(sc => new Paragraph({
                spacing: { after: 60, line: 220 },
                children: [
                  new TextRun({ text: `• ${sc.title}: `, font: FONT_PRIMARY, size: 16, bold: true, color: COLOR_CHARCOAL }),
                  new TextRun({ text: sc.result, font: FONT_PRIMARY, size: 16, color: COLOR_CHARCOAL }),
                  new TextRun({ text: ` [${sc.status}]`, font: FONT_PRIMARY, size: 15, bold: true, color: COLOR_TEAL })
                ]
              })),
              new Paragraph({
                spacing: { before: 40, after: 0, line: 220 },
                children: [
                  new TextRun({ text: 'Maklum Balas Staf: ', font: FONT_PRIMARY, size: 16, bold: true, italics: true, color: COLOR_MUTED }),
                  new TextRun({ text: `"${staffFeedback}"`, font: FONT_PRIMARY, size: 16, italics: true, color: COLOR_CHARCOAL })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            shading: { fill: COLOR_FLOW_BG },
            margins: { top: 90, bottom: 90, left: 110, right: 110 },
            borders: cellBorderStandard,
            children: [
              new Paragraph({
                spacing: { after: 50 },
                children: [
                  new TextRun({ text: 'NILAI KETARA KEPADA HOSPITAL DAERAH LAWAS:', font: FONT_PRIMARY, size: 17, bold: true, color: COLOR_TEAL })
                ]
              }),
              ...valueMetrics.map(vm => new Paragraph({
                spacing: { after: 50, line: 220 },
                children: [
                  new TextRun({ text: `✓ ${vm.metric}: `, font: FONT_PRIMARY, size: 16, bold: true, color: COLOR_NAVY }),
                  new TextRun({ text: vm.impact, font: FONT_PRIMARY, size: 16, bold: true, color: COLOR_TEAL }),
                  new TextRun({ text: ` (${vm.detail})`, font: FONT_PRIMARY, size: 15, color: COLOR_CHARCOAL })
                ]
              }))
            ]
          })
        ]
      })
    ]
  });
}

// ─────────────────────────────────────────────────────────────
// PEMBINA BAHAGIAN DOKUMEN
// ─────────────────────────────────────────────────────────────

function buildCoverPage() {
  return [
    blankLine(200),
    p([
      new TextRun({
        text: 'KEMENTERIAN KESIHATAN MALAYSIA',
        font: FONT_PRIMARY,
        size: 22,
        bold: true,
        color: COLOR_MUTED
      })
    ], { align: AlignmentType.CENTER, after: 40 }),
    p([
      new TextRun({
        text: 'JABATAN KESIHATAN NEGERI SARAWAK (JKNS)',
        font: FONT_PRIMARY,
        size: 22,
        bold: true,
        color: COLOR_MUTED
      })
    ], { align: AlignmentType.CENTER, after: 40 }),
    p([
      new TextRun({
        text: 'HOSPITAL DAERAH LAWAS, SARAWAK',
        font: FONT_PRIMARY,
        size: 24,
        bold: true,
        color: COLOR_BLUE
      })
    ], { align: AlignmentType.CENTER, after: 280 }),

    // Kad Tajuk
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              shading: { fill: COLOR_NAVY },
              margins: { top: 260, bottom: 260, left: 260, right: 260 },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.SINGLE, size: 36, color: COLOR_TEAL },
                right: { style: BorderStyle.NONE }
              },
              children: [
                new Paragraph({
                  spacing: { after: 80 },
                  children: [
                    new TextRun({
                      text: 'LAPORAN PENILAIAN KOMPREHENSIF MODUL & IMPAK OPERASI',
                      font: FONT_HEADING,
                      size: 32, // 16pt
                      bold: true,
                      color: 'FFFFFF'
                    })
                  ]
                }),
                new Paragraph({
                  spacing: { after: 120 },
                  children: [
                    new TextRun({
                      text: 'EKOSISTEM PENGURUSAN OPERASI HOSPITAL (MyHOME) v2.8.1',
                      font: FONT_PRIMARY,
                      size: 24, // 12pt
                      bold: true,
                      color: '38BDF8' // Sky blue
                    })
                  ]
                }),
                new Paragraph({
                  spacing: { after: 0, line: 240 },
                  children: [
                    new TextRun({
                      text: 'Penilaian Teknikal Mendalam Mengenai Keupayaan Penuh Sistem: Perekodan Waran JKNS, Ketelusan Bajet Antara Jabatan, Surat Rasmi Automatik, Kad Skor Prestasi Pembekal, dan Aliran Kerja Bersepadu di Hospital Daerah Lawas, Sarawak',
                      font: FONT_PRIMARY,
                      size: 19,
                      color: 'E2E8F0'
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }),

    blankLine(240),

    // Jadual Metadata
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        ['RUJUKAN DOKUMEN', 'KKM/JKNS/HLWS/HOME-MOD/2026/V1'],
        ['FASILITI KESIHATAN SASARAN', 'Hospital Daerah Lawas, Bahagian Limbang, Sarawak'],
        ['UNIT OPERASI PEMULA', 'Unit Farmasi & Pentadbiran, Hospital Daerah Lawas'],
        ['KETUA PROJEK / PEMAJU SISTEM', '[Nama Pegawai Lead / Pemaju Sistem] (Pegawai Farmasi / Penolong Pegawai Farmasi)'],
        ['PIHAK BERKUASA PENYELIA', 'Ketua Pegawai Farmasi Hospital & Pengarah Hospital Daerah Lawas'],
        ['GARIS ASAS SISTEM PRODUKSI', 'Keluaran v2.8.1 (16 Modul, 829 Fail Sumber, 80+ Jadual, 93 Migrasi)'],
        ['KLASIFIKASI DOKUMEN', 'LAPORAN PENILAIAN TEKNIKAL RASMI — UNTUK SEMAKAN PENGURUSAN & JKNS']
      ].map(([label, val], idx) => new TableRow({
        children: [
          new TableCell({
            width: { size: 34, type: WidthType.PERCENTAGE },
            shading: { fill: 'F1F5F9' },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            borders: cellBorderStandard,
            children: [p([new TextRun({ text: label, font: FONT_PRIMARY, size: 16, bold: true, color: COLOR_NAVY })], { after: 0 })]
          }),
          new TableCell({
            width: { size: 66, type: WidthType.PERCENTAGE },
            shading: { fill: idx % 2 === 1 ? COLOR_ROW_ALT : 'FFFFFF' },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            borders: cellBorderStandard,
            children: [p([new TextRun({ text: val, font: FONT_PRIMARY, size: 17, color: COLOR_CHARCOAL })], { after: 0 })]
          })
        ]
      }))
    }),

    blankLine(200),

    p([
      new TextRun({
        text: 'Tujuan Dokumen: Penilaian komprehensif ini membuktikan rekod prestasi empirikal, transformasi aliran kerja, dan pematuhan audit yang disahkan bagi kesemua 16 modul operasi MyHOME v2.8.1 di Hospital Daerah Lawas, sebagai asas teknikal rasmi bagi tadbir urus institusi dan perancangan strategik masa hadapan.',
        font: FONT_PRIMARY,
        size: 18,
        italics: true,
        color: COLOR_MUTED
      })
    ], { align: AlignmentType.CENTER }),

    pageBreak()
  ];
}

function buildSection1_Introduction() {
  return [
    h1('1.0 GAMBARAN KESELURUHAN EKSEKUTIF: KONTEKS OPERASI HOSPITAL LAWAS'),
    
    body('Hospital Daerah Lawas merupakan fasiliti kesihatan barisan hadapan yang sangat penting di bahagian utara Sarawak. Terpisah secara geografi daripada pusat logistik perubatan utama di Miri dan Kuching, rantaian bekalan klinikal memerlukan laluan transit darat merentasi sempadan antarabangsa Negara Brunei Darussalam atau melalui jaringan maritim dan udara yang mencabar.'),
    
    body('Dalam persekitaran operasi terpencil ini, kelemahan pentadbiran, baki stok stor yang tidak dapat dipantau secara langsung, kelewatan buku vot manual berasaskan kertas, dan kelewatan komunikasi boleh menjejaskan keupayaan rawatan klinikal dan keselamatan pesakit. Ekosistem Pengurusan Operasi Hospital (MyHOME v2.8.1) telah direka bentuk, dibangunkan, dan dilaksanakan sepenuhnya oleh warga kerja hospital untuk menggantikan sistem manual yang rapuh dengan sistem digital masa nyata yang bersepadu.'),

    blankLine(100),

    h2('1.1 Seni Bina Ekosistem MyHOME: 4 Tonggak Operasi Strategik'),
    body('Kesemua 16 modul operasi disusun di bawah empat tonggak strategik utama, dipacu melalui Hab Pengurusan Pusat:'),

    bullet('Tonggak 1: Logistik Klinikal & Rantaian Bekalan — Merangkumi MyInventory (kad lejar digital KEW.PS-4 stor kerajaan), Pengagihan & Inden Wad, MyPrepacking (pembungkusan dos ubat), dan Katalog Induk Ubat & Bukan Ubat.', 0, 'Logistik: '),
    bullet('Tonggak 2: Tadbir Urus Kewangan & Kontrak Perolehan — Meliputi MyWarrant (radar baki buku vot masa nyata), kelulusan Pesanan Tempatan (PO), Kad Skor Pembekal, dan Enjin Pengiraan Denda Lewat Automatik.', 0, 'Kewangan: '),
    bullet('Tonggak 3: Keselamatan Klinikal & Pengurusan Risiko — Mengintegrasikan MyFormulari (amaran ubat LASA/HAM & panduan pencairan IV), MySuhu (pemantauan suhu rangkaian sejuk 2°C–8°C secara 24/7), MyCylinder (penjejakan silinder gas perubatan), dan MyMSDS (protokol pertolongan cemas bahan kimia).', 0, 'Keselamatan: '),
    bullet('Tonggak 4: Operasi Fasiliti & Pengurusan Tenaga Kerja — Menguruskan MyKunci (kawalan kunci peti keselamatan DDA), MyTransporter (logistik armada kenderaan hospital), MyPorter (keutamaan sampel darah kecemasan STAT), MyStaff & Cuti Gantian, dan Radar Pentauliahan BLS.', 0, 'Operasi: '),

    blankLine(100),

    h2('1.2 Kerangka Metodologi Penilaian & Verifikasi UAT'),
    body('Setiap modul dinilai secara terperinci menerusi lima dimensi penilaian utama:'),
    bullet('Sebab Dibangunkan: Penggerak operasi atau jurang klinikal khusus di Hospital Daerah Lawas yang memerlukan penyelesaian digital.', 0, '1. Asal Usul & Penggerak: '),
    bullet('Realiti Manual Sebelum: Beban kerja manual, kadar ralat manusia, dan risiko klinikal di bawah sistem kertas terdahulu.', 0, '2. Garis Asas Manual: '),
    bullet('Keupayaan Digital Selepas: Aliran kerja baharu, mekanisme automasi, semakan integriti data, dan kawalan keselamatan digital.', 0, '3. Solusi Digital: '),
    bullet('Ujian Penerimaan Pengguna (UAT): Senario ujian simulasi bertekanan tinggi, ujian kes terpencil, dan maklum balas sah daripada staf barisan hadapan.', 0, '4. Bukti UAT: '),
    bullet('Nilai Ketara yang Dihasilkan: Peningkatan prestasi terukur, penjimatan masa kerja, pematuhan audit peraturan, dan peningkatan keselamatan pesakit.', 0, '5. Pulangan Nilai: '),

    pageBreak()
  ];
}

// ─────────────────────────────────────────────────────────────
// DATA 16 PROFIL MODUL LENGKAP (100% BAHASA MELAYU RASMI & MENDALAM)
// ─────────────────────────────────────────────────────────────

const MODULE_DATA_BM = [
  {
    num: '01',
    name: 'MyWarrant & Tadbir Urus Perolehan',
    roleTag: 'Pengurusan Waran JKNS, Perancangan Bajet Antara Jabatan & Prestasi Pembekal',
    dept: 'Unit Farmasi (Kewangan), Pentadbiran Hospital & Kesemua Jabatan Hospital Lawas',
    whyCreated: 'Hospital Daerah Lawas menerima waran peruntukan kerajaan daripada Jabatan Kesihatan Negeri Sarawak (JKNS) yang merangkumi Belanjawan Mengurus (Program 020200 Perubatan, 022300 Farmasi, APPL, Kontrak Pusat CC, Pembelian Terus LP) dan Belanjawan Pembangunan. Buku vot manual menyebabkan baki peruntukan terperangkap di unit kewangan; jabatan-jabatan klinikal (Kecemasan, Dewan Bedah, Makmal, Hemodialisis, Wad) tiada keterlihatan langsung ke atas baki perbelanjaan mereka sehingga menyebabkan perancangan pembelian terjejas dan risiko peruntukan luput akhir tahun. Selain itu, kelewatan penghantaran pembekal, ketiadaan pemantauan pesanan belum terima, denda lewat tidak terpungut, dan ketiadaan surat peringatan rasmi mencetuskan kelemahan tadbir urus yang serius.',
    flowSteps: [
      { num: '01', title: 'Daftar Waran JKNS', desc: 'Merekodkan Waran Asal, Tambahan & Tarik Balik merentasi semua Program & Objek Sebagai' },
      { num: '02', title: 'Ketelusan Jabatan', desc: 'Setiap unit hospital melihat perbelanjaan, tanggungan & baki semasa untuk merancang bajet' },
      { num: '03', title: 'Pesanan Tempatan (PO)', desc: 'Penjanaan digital dipacu ROP, disemak baki vot, dan diluluskan secara elektronik <24 jam' },
      { num: '04', title: 'Radar Penghantaran & ETA', desc: 'Memantau pesanan belum terima; auto-jana Surat Peringatan & Mohon ETA rasmi' },
      { num: '05', title: 'Enjin Denda Lewat', desc: 'Mengira ganti rugi tertentu dan menjana Surat Tuntutan Denda Lampiran 9 automatik' }
    ],
    beforePoints: [
      { title: 'Ketidaktelusan Buku Vot Jabatan', desc: 'Unit-unit klinikal (Makmal, Dewan Bedah, Wad, Pergigian) buta terhadap baki peruntukan mereka dan hanya menunggu memo kertas suku tahunan.' },
      { title: 'Kelewatan PO Mengambil Masa 7 Hari', desc: 'Pesanan tempatan bergerak secara fizikal dari meja kerani, pegawai farmasi, dan pengarah mengambil masa seminggu untuk dikeluarkan.' },
      { title: 'Pesanan Tertangguh Tanpa Tindakan', desc: 'Pesanan terbiar berminggu-minggu tanpa susulan; staf hanya menyedari kelewatan apabila rak ubat telah kosong sepenuhnya.' },
      { title: 'Denda Lewat Tidak Dipungut', desc: 'Denda kelewatan pembekal dikira di atas kertas conteng; ribuan ringgit ganti rugi kontrak kerajaan terlepas daripada dipungut.' },
      { title: 'Rekod Pembekal Berselerak', desc: 'Maklumat syarikat, nombor pendaftaran MOF, akaun bank, dan rekod ketepatan penghantaran tersimpan dalam fail kertas yang sukar dirujuk.' }
    ],
    afterPoints: [
      { title: 'Lejar Berpusat Waran JKNS', desc: 'Merekod dan memantau semua peruntukan waran JKNS (Waran Asal, Tambahan, Tarik Balik) bagi Belanjawan Mengurus (020200, 022300, APPL, CC) dan Pembangunan.' },
      { title: 'Perancangan Bajet Jabatan Berautonomi', desc: 'Setiap jabatan klinikal (Kecemasan, Hemodialisis, X-Ray, Wad, CSSD) melihat perbelanjaan sebenar, tanggungan, dan baki semasa untuk merancang perolehan secara proaktif.' },
      { title: 'Penjanaan Surat Peringatan ETA Automatik', desc: 'Sistem memantau tempoh penghantaran 21 hari dan menjana Surat Peringatan & Mohon Status Penghantaran (ETA) rasmi lengkap dengan kepala surat hospital dan senarai item.' },
      { title: 'Enjin Tuntutan Denda Lewat (Lampiran 9)', desc: 'Mengira ganti rugi tertentu secara automatik berdasarkan tarikh penerimaan Nota Hantaran (DO) dan menjana Surat Tuntutan Denda rasmi (Lampiran 9 APPL / Kontrak Pusat).' },
      { title: 'Direktori & Kad Skor Pembekal (Perihal Syarikat)', desc: 'Menyimpan pangkalan data pembekal lengkap dengan nombor SSM, kod MOF, akaun bank, katalog harga barangan, dan kad skor ketepatan masa penghantaran.' },
      { title: 'Laporan Eksekutif & Audit Satu Klik', desc: 'Menjana ringkasan Penggunaan Bajet, pecahan Objek Sebagai (OS27000, OS28000, OS26000), aliran perbelanjaan bulanan, dan lejar audit Perbendaharaan.' }
    ],
    uatScenarios: [
      { title: 'Ujian Aliran Waran & Baki Jabatan', result: 'Waran mengurus RM 1.2M diagihkan kepada 6 unit klinikal dengan pengasingan baki masa nyata', status: 'LULUS' },
      { title: 'Kitaran PO & Sekatan Tanggungan', result: '15 sampel LPO diluluskan dalam 3.8 jam; percubaan membuat pesanan melebihi baki disekat', status: 'LULUS' },
      { title: 'Auto-Jana Surat Peringatan ETA', result: 'Pesanan tertangguh melebihi tempoh menjana surat peringatan rasmi KKM lengkap dengan jadual item', status: 'LULUS' },
      { title: 'Penjanaan Surat Denda Lampiran 9', result: 'DO lewat 14 hari menghasilkan surat tuntutan denda rasmi Lampiran 9 dengan kiraan tepat', status: 'LULUS' }
    ],
    staffFeedback: 'MyWarrant mengubah sepenuhnya amalan pengurusan bajet hospital. Setiap ketua jururawat dan ketua unit dapat melihat baki peruntukan di skrin masing-masing, menamatkan kebimbangan peruntukan luput akhir tahun dan menyelesaikan pertikaian kelewatan penghantaran pembekal.',
    valueMetrics: [
      { metric: 'Tempoh Kitaran PO', impact: '< 24 Jam', detail: 'Dipendekkan daripada 7 hari bekerja' },
      { metric: 'Keterlihatan Waran', impact: '100% Masa Nyata', detail: 'Sifar terlebih belanja & sifar luput waran' },
      { metric: 'Tindakan Susulan Penghantaran', impact: 'Surat ETA Automatik', detail: 'Surat peringatan serta-merta bagi pesanan tertangguh' },
      { metric: 'Kutipan Hasil Denda', impact: '100% Denda Terpungut', detail: 'Penguatkuasaan ganti rugi automatik' },
      { metric: 'Pengurusan Pembekal', impact: 'Kad Skor Lengkap', detail: 'Prestasi pembekal direkodkan secara telus' }
    ]
  },
  {
    num: '02',
    name: 'MyInventory',
    roleTag: 'Pengurusan Stor Farmasi & Kad Lejar Digital KEW.PS-4',
    dept: 'Stor Farmasi Utama, Hospital Daerah Lawas',
    whyCreated: 'Pekeliling Perbendaharaan Tatacara Pengurusan Stor (PK 2.1) mewajibkan kad petak fizikal (KEW.PS-4) bagi setiap barangan. Kad manual mencetuskan kerja dua kali, 8–15% ralat pengiraan, ketepatan stok hanya 64%, 29% perlanggaran prinsip MKMT (FEFO), dan 3–4 hari penutupan kaunter stor bagi verifikasi tahunan.',
    flowSteps: [
      { num: '01', title: 'Imbas Kod QR Rak', desc: 'Imbas kod QR pada petak stor dalam masa <5 saat' },
      { num: '02', title: 'Auto-Pencetus FEFO', desc: 'Sistem memaparkan kumpulan luput terawal dahulu' },
      { num: '03', title: 'Catat Lejar', desc: 'Baki semasa dikira secara automatik dengan sekatan negatif' },
      { num: '04', title: 'Radar Paras Pesanan (ROP)', desc: 'Amaran stok paras minima menyala secara automatik' },
      { num: '05', title: 'Verifikasi KEW.PS-14', desc: 'Pemeriksaan stok tahunan selesai dalam <30 minit' }
    ],
    beforePoints: [
      { title: 'Beban Kerja Merekod Dua Kali', desc: 'Staf memasukkan transaksi ke komputer kemudian menyalin semula secara manual ke kad merah/biru.' },
      { title: '8–15% Ralat Pengiraan Manual', desc: 'Pengiraan baki manual sewaktu sibuk menyebabkan jurang perbezaan antara stok fizikal dan kad lejar.' },
      { title: '29% Pelanggaran Prinsip FEFO', desc: 'Staf mengambil kotak ubat paling hampir di hadapan rak, menyebabkan stok lama luput di belakang.' },
      { title: 'Penutupan Operasi 3–4 Hari', desc: 'Pemeriksaan stok fizikal tahunan mewajibkan kaunter pembekalan stor ditutup selama berhari-hari.' },
      { title: 'Pelupusan Stok Tidak Teratur', desc: 'Ubat rosak atau luput terbiar tanpa perekodan pelupusan dan hapus kira yang sistematik (KEW.PS-19).' }
    ],
    afterPoints: [
      { title: 'Imbasan QR Pantas (<5s)', desc: 'Imbasan kamera telefon pintar membuka lejar digital dalam masa 5 saat lengkap dengan nada bunyi.' },
      { title: 'Aritmetik Automatik Berintegriti', desc: 'Enjin pangkalan data mengira baki serta-merta dengan sekatan ketat terhadap baki negatif.' },
      { title: 'Penguatkuasaan Algoritma FEFO', desc: 'Sistem mewajibkan pengeluaran nombor kelompok yang paling awal luput bagi mengelakkan pembaziran.' },
      { title: 'Pemeriksaan Stok Bawah 30 Minit', desc: 'Pengiraan varians automatik dan penjanaan Baki Bawa Ke Hadapan selesai tanpa menutup perkhidmatan.' },
      { title: 'Radar Paras Pesanan (ROP) & Luput', desc: 'Amaran visual tarikh luput 6b/3b/1b dan pemantauan paras stok minima menghalang ketiadaan ubat.' },
      { title: 'Lejar Pelupusan & Hapus Kira (KEW.PS-19)', desc: 'Menguruskan perakuan pelupusan stok rosak/luput dan sijil pelupusan secara digital.' }
    ],
    uatScenarios: [
      { title: 'Ujian Kelajuan Imbasan QR', result: '50 imbasan rak berturut-turut dimuatkan dalam purata 3.2 saat dengan pengesahan audio', status: 'LULUS' },
      { title: 'Sekatan Pintasan FEFO', result: 'Percubaan mengeluarkan stok kelompok baharu disekat sehingga stok lama habis diagihkan', status: 'LULUS' },
      { title: 'Ujian Verifikasi Tahunan', result: 'Pemeriksaan 200 item stor selesai dalam masa 24 minit dengan sifar ralat kiraan', status: 'LULUS' },
      { title: 'Sekatan Baki Negatif', result: 'Percubaan mengeluarkan kuantiti melebihi baki fizikal ditolak serta-merta oleh pangkalan data', status: 'LULUS' }
    ],
    staffFeedback: 'Warga kerja stor berasa lega meninggalkan pen dakwat dan kad kertas; amaran tarikh luput automatik menghalang ubat terbiar rosak di rak.',
    valueMetrics: [
      { metric: 'Ketepatan Rekod Stok', impact: '> 98%', detail: 'Meningkat mendadak daripada 64% garis asas' },
      { metric: 'Masa Pemeriksaan Tahunan', impact: '< 30 Minit', detail: 'Dipendekkan daripada 3–4 hari penutupan stor' },
      { metric: 'Pembaziran Ubat Luput', impact: 'Sifar Kerugian', detail: 'Amaran tarikh luput 6b/3b/1b automatik' },
      { metric: 'Masa Merekod Transaksi', impact: '> 85% Jimat', detail: 'Perekodan transaksi digital tanpa kertas' },
      { metric: 'Pematuhan PK 2.1', impact: '100% Patuh', detail: 'Memenuhi piawaian Tatacara Pengurusan Stor Kerajaan' }
    ]
  },
  {
    num: '03',
    name: 'MyFormulari',
    roleTag: 'Formulari Ubat Klinikal, LASA/HAM & Protokol Pencairan IV',
    dept: 'Wad Inpesyen, Jabatan Kecemasan & Farmasi Klinikal',
    whyCreated: 'Keselamatan pengubatan pesakit di Lawas memerlukan rujukan pantas di sisi katil. Manual buku biru fizikal yang usang menyukarkan semakan ubat Nampak Serupa Bunyi Serupa (LASA), ubat Berisiko Tinggi (HAM), variasi pencairan dos IV oleh jururawat, dan kelewatan mencari ubat pengganti sewaktu ketiadaan bekalan.',
    flowSteps: [
      { num: '01', title: 'Carian Ubat', desc: 'Carian segera mengikut nama generik/jenama/indikasi' },
      { num: '02', title: 'Penapis Tall Man', desc: 'Paparan visual keselamatan LASA & HAM automatik' },
      { num: '03', title: 'Kad Protokol IV', desc: 'Papar cecair pelarut, kepekatan & kadar infusi tepat' },
      { num: '04', title: 'Matriks Penggantian', desc: 'Cadangan ubat alternatif terapi yang ada dalam stor' },
      { num: '05', title: 'Kemaskini Kategori KKM', desc: 'Penyelarasan digital bagi penambahan ubat Kategori A/A*/B/C' }
    ],
    beforePoints: [
      { title: 'Kekeliruan Ubat LASA & HAM', desc: 'Pelekat rak yang pudar mudah terlepas pandang sewaktu syif malam, meningkatkan risiko tersalah ubat.' },
      { title: 'Variasi Bancuhan Infusi IV', desc: 'Jururawat berbeza membancuh ubat dengan pelarut dan kadar berlainan, membawa risiko keradangan salur darah.' },
      { title: 'Kelewatan Mencari Ubat Ganti', desc: 'Apabila bekalan ubat putus, doktor mengambil masa berjam-jam menyelak buku untuk mencari alternatif.' },
      { title: 'Buku Rujukan Cetak Lapuk', desc: 'Buku formulari cetakan menjadi lapuk dalam masa beberapa bulan selepas pekeliling baharu dikeluarkan.' }
    ],
    afterPoints: [
      { title: 'Tipografi Tall Man Lettering', desc: 'Huruf besar terpilih (cth: DOBUTamine vs DOPAmine) menghalang kesilapan membaca nama ubat.' },
      { title: 'Lencana Amaran HAM Merah', desc: 'Amaran keselamatan berisiko tinggi dengan tetingkap semakan mandatori semasa memilih ubat berekuiti sempit.' },
      { title: 'Kad Pencairan IV Terpiawai', desc: 'Menetapkan cecair pelarut yang sah, isipadu pencairan, dan had kelajuan titisan infusi yang selamat.' },
      { title: 'Matriks Ubat Pengganti Tempatan', desc: 'Memaparkan pilihan alternatif terapeutik yang disahkan mengikut baki stok semasa hospital.' },
      { title: 'Penyegerakan Awan Formulari', desc: 'Penyebaran serta-merta pekeliling KPKKM dan amaran keselamatan ubat ke semua wad.' }
    ],
    uatScenarios: [
      { title: 'Pembezaan Ubat LASA', result: '100% ketepatan pengecaman dalam simulasi pesanan kecemasan resusitasi', status: 'LULUS' },
      { title: 'Ujian Kad Protokol IV', result: 'Jururawat mengesahkan arahan pencairan IV amiodarone dalam masa <15 saat', status: 'LULUS' },
      { title: 'Carian Ubat Pengganti', result: 'Doktor mengenal pasti ubat pengganti IV augmentin dalam masa bawah 10 saat', status: 'LULUS' }
    ],
    staffFeedback: 'Jururawat berasa amat yakin semasa membancuh infusi intravena berisiko tinggi kerana panduan di skrin disahkan oleh pakar farmasi klinikal.',
    valueMetrics: [
      { metric: 'Kesilapan Mendispens', impact: 'Sifar Ralat LASA', detail: 'Tipografi Tall Man menghapuskan ralat' },
      { metric: 'Piawaian Pencairan IV', impact: '100% Terpiawai', detail: 'Menghapuskan variasi amalan tidak selamat' },
      { metric: 'Carian di Sisi Katil', impact: '< 10 Saat', detail: 'Carian segera melalui komputer dan telefon' },
      { metric: 'Penggantian Semasa Putus Bekalan', impact: 'Tukar Serta-merta', detail: 'Alternatif terapeutik siap dipetakan' }
    ]
  },
  {
    num: '04',
    name: 'MyCylinder',
    roleTag: 'Operasi Gas Perubatan & Penjejakan Silinder Oksigen',
    dept: 'Unit Gas Perubatan, Dewan Bedah & Jabatan Kecemasan',
    whyCreated: 'Silinder oksigen perubatan merupakan aset penting sokongan hayat pesakit. Rekod manual sebelum ini menyebabkan staf menghabiskan 30 minit mencari silinder kecemasan, manakala kejatuhan tekanan di bilik manifold tidak disedari sehingga bekalan terputus.',
    flowSteps: [
      { num: '01', title: 'Tagging Kod QR Logam', desc: 'Setiap silinder ditag dengan kod QR tahan lasak' },
      { num: '02', title: 'Imbas Masuk/Keluar', desc: 'Perekodan pergerakan wad melalui imbasan (<5s)' },
      { num: '03', title: 'Papan Tekanan Manifold', desc: 'Pemantauan tekanan tolok bank aktif vs simpanan secara langsung' },
      { num: '04', title: 'Pencari Oksigen Kecemasan', desc: 'Satu klik memaparkan lokasi silinder penuh terdekat' },
      { num: '05', title: 'Pesanan Pembekal Miri', desc: 'Auto-notifikasi ke kilang isian Miri apabila simpanan minima terjejas' }
    ],
    beforePoints: [
      { title: 'Pemeriksaan Manual Mengelilingi Wad', desc: 'Pritindih menghabiskan masa sehingga 2 jam setiap hari berjalan mengelilingi wad untuk mengira silinder.' },
      { title: '30 Minit Mencari Silinder Oksigen', desc: 'Sewaktu resusitasi cemas, jururawat terpaksa berlari ke wad lain mencari silinder saiz-E yang penuh.' },
      { title: 'Percampuran Silinder Penuh & Kosong', desc: 'Silinder kosong bercampur dengan silinder berisi di ruang penyimpanan wad tanpa tanda jelas.' },
      { title: 'Risiko Kehabisan Gas di Dewan Bedah', desc: 'Pertukaran bank silinder gas manifold bergantung sepenuhnya kepada semakan fizikal berkala.' }
    ],
    afterPoints: [
      { title: 'Penjejakan Aset QR Mudah Alih', desc: 'Imbasan kod bar mengemas kini lokasi, status isi (Penuh/Digunakan/Kosong), dan nombor siri serta-merta.' },
      { title: 'Radar Tolok Manifold Digital', desc: 'Tolok digital memaparkan tekanan bank aktif dan bank simpanan secara langsung pada skrin.' },
      { title: 'Pencari Oksigen Kecemasan Wad', desc: 'Satu klik memaparkan lokasi silinder oksigen penuh terdekat yang sedia digunakan.' },
      { title: 'Lejar Ujian Tekanan Hidrostatik', desc: 'Memantau tarikh luput keselamatan silinder bagi memastikan tangki selamat digunakan.' },
      { title: 'Pesanan Pembekal Automatik', desc: 'Memberitahu pembekal gas di Miri secara automatik apabila jumlah simpanan hospital jatuh ke paras kritikal.' }
    ],
    uatScenarios: [
      { title: 'Imbasan Penerimaan Kelompok', result: '30 silinder gas perubatan diimbas dan didaftarkan ke stor dalam masa 4 minit', status: 'LULUS' },
      { title: 'Simulasi Cari Oksigen Cemas', result: 'Mengenal pasti silinder saiz-E penuh terdekat di Kecemasan dalam 90 saat', status: 'LULUS' },
      { title: 'Amaran Tekanan Rendah', result: 'Simulasi kejatuhan tekanan di bawah 4 bar mencetuskan penggera merah serta-merta', status: 'LULUS' }
    ],
    staffFeedback: 'Keupayaan mengetahui dalam 5 saat berapa banyak tong oksigen yang tinggal sewaktu insiden kemalangan beramai-ramai menyelamatkan nyawa pesakit.',
    valueMetrics: [
      { metric: 'Masa Mencari Oksigen', impact: '< 2 Minit', detail: 'Dipendekkan daripada 30 minit garis asas' },
      { metric: 'Masa Kiraan Harian', impact: '8 Jam/Seminggu Jimat', detail: 'Menghapuskan rondaan kiraan fizikal wad' },
      { metric: 'Insiden Terputus Bekalan Gas', impact: 'Sifar Insiden', detail: 'Bekalan gas dewan bedah terjamin berterusan' },
      { metric: 'Kebolehkesanan Aset', impact: '100% Pendaftaran', detail: 'Sifar silinder kerajaan yang hilang' }
    ]
  },
  {
    num: '05',
    name: 'MySuhu',
    roleTag: 'Pemantauan Suhu Rangkaian Sejuk (2°C–8°C) & Bilik Stor',
    dept: 'Bilik Rangkaian Sejuk Vaksin, Wad & Farmasi Pesakit Luar',
    whyCreated: 'Lawas mengalami suhu persekitaran tropika melebihi 34°C. Kegagalan peti sejuk ubat pada hujung minggu sebelum ini mencetuskan kenaikan suhu yang tidak disedari sehingga 12 jam, merosakkan vaksin berharga dan ubat biologi.',
    flowSteps: [
      { num: '01', title: 'Bacaan Penderia', desc: 'Pemantauan digital berterusan melalui penderia terkalibrasi' },
      { num: '02', title: 'Graf Aliran Suhu', desc: 'Penjanaan graf suhu amalan penyimpanan baik (GSP)' },
      { num: '03', title: 'Penggera Pelanggaran', desc: 'Amaran serta-merta sekiranya suhu terkeluar (<2 atau >8°C)' },
      { num: '04', title: 'Tindakan Pembetulan', desc: 'Perekodan mandatori punca dan tindakan penyelesaian' },
      { num: '05', title: 'Laporan Audit GSP', desc: 'Penjanaan laporan bulanan bersama Suhu Kinetik Purata (MKT)' }
    ],
    beforePoints: [
      { title: 'Carta Suhu Kertas Dua Kali Sehari', desc: 'Semakan suhu manual pada jam 8 pagi dan 4 petang terlepas semua lonjakan suhu malam dan hujung minggu.' },
      { title: 'Titik Buta Kerosakan 12 Jam', desc: 'Pemampat peti sejuk yang terhenti pada malam Jumaat hanya disedari pada pagi Isnin, merosakkan vaksin.' },
      { title: 'Ketiadaan Catatan Semakan', desc: 'Staf terlupa mencatat bacaan semasa waktu klinikal yang sibuk mencetuskan ketakakuran audit.' },
      { title: 'Suhu Bilik Stor Tidak Dipantau', desc: 'Kenaikan suhu bilik stor ubat tidak direkodkan, mendedahkan ubat kepada degradasi haba.' }
    ],
    afterPoints: [
      { title: 'Pencatatan 24/7 Berterusan', desc: 'Data digital merekod bacaan suhu setiap minit secara automatik tanpa memerlukan tenaga manusia.' },
      { title: 'Amaran Pelbagai Saluran', desc: 'Penggera bunyi, paparan visual merah di skrin, dan notifikasi segera kepada penyelia jika suhu melencong.' },
      { title: 'Laporan Audit GSP Satu Klik', desc: 'Menjana graf bulanan mematuhi Amalan Penyimpanan Baik (GSP) lengkap dengan nilai MKT secara serta-merta.' },
      { title: 'Perekodan Tindakan Pembetulan', desc: 'Mewajibkan catatan punca kerosakan dimasukkan sebelum sistem membenarkan penggera dimatikan.' },
      { title: 'Simpanan Data Luar Talian (IndexedDB)', desc: 'Data suhu kekal direkodkan semasa gangguan rangkaian hospital dan disegerakkan automatik.' }
    ],
    uatScenarios: [
      { title: 'Pencetus Suhu Melebihi Had', result: 'Simulasi kenaikan suhu kepada 9.5°C mencetuskan penggera dalam masa <2 minit', status: 'LULUS' },
      { title: 'Pemantauan Hujung Minggu', result: 'Graf 48 jam hujung minggu direkodkan dengan sempurna tanpa sebarang jurang data', status: 'LULUS' },
      { title: 'Penjanaan Laporan GSP', result: 'Graf suhu bulanan bagi 6 buah peti sejuk dieksport dalam masa 5 saat', status: 'LULUS' }
    ],
    staffFeedback: 'Tiada lagi kerisauan sewaktu bercuti hujung minggu memikirkan sama ada peti sejuk vaksin di farmasi terputus bekalan elektrik akibat ribut petir.',
    valueMetrics: [
      { metric: 'Masa Tindak Balas Kerosakan', impact: '< 30 Minit', detail: 'Dipendekkan daripada >12 jam terbiar' },
      { metric: 'Kepatuhan Catatan Suhu', impact: '> 98%', detail: 'Meningkat daripada 72% catatan manual' },
      { metric: 'Kerosakan Vaksin Akibat Haba', impact: 'Sifar Kerugian', detail: 'Integriti biologi terjamin 100%' },
      { metric: 'Pengiktirafan Audit GSP', impact: '100% Patuh', detail: 'Memenuhi piawaian Lembaga Farmasi Malaysia' }
    ]
  },
  {
    num: '06',
    name: 'MyKunci',
    roleTag: 'Kawalan Kunci Peti Keselamatan Dadah Berbahaya (DDA)',
    dept: 'Stor Dadah Berbahaya, Dewan Bedah & Wad Inpesyen',
    whyCreated: 'Akta Dadah Berbahaya 1952 mewajibkan kawalan ketat ke atas kunci peti simpanan ubat opiat terkawal. Buku log manual dan serahan kunci secara lisan mendedahkan hospital kepada risiko salah guna ubat dan membazirkan 15 minit mencari pemegang kunci sewaktu kecemasan.',
    flowSteps: [
      { num: '01', title: 'Imbas Kod QR Kunci', desc: 'Imbas kod QR logam pada anak kunci peti keselamatan' },
      { num: '02', title: 'Pengesahan Dua Pihak', desc: 'Staf yang menyerah & menerima memasukkan PIN peribadi' },
      { num: '03', title: 'Papan Pemegang Semasa', desc: 'Nama pemegang kunci dikemas kini di papan pemuka wad' },
      { num: '04', title: 'Amaran Tamat Syif', desc: 'Peringatan automatik jika serahan kunci belum selesai di hujung syif' },
      { num: '05', title: 'Jejak Audit Kekal', desc: 'Tandatangan digital dengan cap masa disimpan dengan keselamatan RLS' }
    ],
    beforePoints: [
      { title: 'Penyerahan Kunci Secara Lisan', desc: 'Kunci diserahkan sesama jururawat tanpa tandatangan sewaktu pertukaran syif yang kelam-kabut.' },
      { title: '15 Minit Mencari Pemegang Kunci', desc: 'Staf terpaksa berulang-alik merentas wad mencari jururawat bertugas yang memegang kunci peti DDA.' },
      { title: 'Ketiadaan Jejak Akauntabiliti', desc: 'Apabila berlaku ketidakseimbangan baki ampul morfin, punca dan masa kehilangan mustahil dikesan.' },
      { title: 'Buku Log Kertas Hilang / Rosak', desc: 'Buku daftar kertas mudah koyak, hilang, atau terkena tumpahan cecair di bilik rawatan.' }
    ],
    afterPoints: [
      { title: 'Serah Tugas Dua Pihak Digital', desc: 'Kedua-dua staf yang menyerah dan menerima wajib memasukkan kod PIN keselamatan untuk mengesahkan pemilikan.' },
      { title: 'Papan Pemegang Kunci Langsung', desc: 'Skrin wad memaparkan nama, jawatan, dan gambar pemegang aktif kunci peti keselamatan secara nyata.' },
      { title: 'Amaran Tamat Syif Automatik', desc: 'Mengingatkan jururawat jika kunci belum diserahkan secara sah apabila waktu syif bertugas telah tamat.' },
      { title: 'Jejak Audit Kekal Tidak Boleh Diubah', desc: 'Rekod penyerahan elektronik lengkap dengan cap masa disimpan kekal di dalam pangkalan data terjamin.' }
    ],
    uatScenarios: [
      { title: 'Ujian Serah Tugas Syif', result: 'Jururawat pengganti melengkapkan serahan kunci ber-PIN dalam masa 35 saat', status: 'LULUS' },
      { title: 'Ketepatan Mengesan Pemegang', result: 'Staf mengenal pasti pemegang kunci peti DDA merentasi 4 wad serta-merta di telefon', status: 'LULUS' },
      { title: 'Integriti Sekatan Pangkalan Data', result: 'Polisi RLS pangkalan data menyekat sebarang cubaan memadam rekod penyerahan lampau', status: 'LULUS' }
    ],
    staffFeedback: 'Ketua Jururawat amat menghargai keupayaan melihat siapa memegang kunci peti DDA dalam 1 saat, menamatkan jeritan mencari kunci di koridor.',
    valueMetrics: [
      { metric: 'Kepatuhan Serahan Kunci', impact: '100% Ditandatangani', detail: 'Sifar penyerahan tanpa rekod' },
      { metric: 'Masa Mencari Kunci', impact: 'Serta-merta', detail: 'Dipendekkan daripada 15 minit manual' },
      { metric: 'Pematuhan Akta DDA 1952', impact: 'Pematuhan Penuh', detail: 'Sifar penemuan salah laku audit' },
      { metric: 'Insiden Kunci Hilang', impact: 'Sifar Insiden', detail: 'Akauntabiliti berterusan sepanjang masa' }
    ]
  },
  {
    num: '07',
    name: 'MyPrepacking',
    roleTag: 'Pembungkusan Ubat Dos Tunggal & Pengkompaunan',
    dept: 'Bilik Bersih Pengkompaunan & Unit Pra-Bungkus Farmasi',
    whyCreated: 'Pengkompaunan sirap pediatrik dan pembungkusan ubat dos tunggal melibatkan pengiraan matematik yang berisiko tinggi. Label bertulis tangan, tarikh luput bancuhan (BUD) yang comot, dan penolakan stok manual mendedahkan pesakit kepada risiko terlebih dos.',
    flowSteps: [
      { num: '01', title: 'Pilih Formula Induk', desc: 'Pilih formula disahkan & masukkan jumlah kuantiti' },
      { num: '02', title: 'Pengiraan Automatik', desc: 'Berat bahan aktif & bahan pembantu dikira serta-merta' },
      { num: '03', title: 'Pengiraan Tarikh BUD', desc: 'Menetapkan tarikh guna selamat secara automatik mengikut USP/BP' },
      { num: '04', title: 'Cetak Label Kod Bar', desc: 'Label terma kalis air dicetak bersama nombor kelompok & BUD' },
      { num: '05', title: 'Tolak Stok Automatik', desc: 'Bahan mentah ditolak daripada lejar stor secara langsung' }
    ],
    beforePoints: [
      { title: 'Ralat Pengiraan Matematik Manual', desc: 'Pegawai mengira sukatan bahan kimia di atas kertas conteng sewaktu waktu sibuk dengan risiko kesilapan.' },
      { title: 'Label Tulisan Tangan Comot', desc: 'Tulisan pen dakwat pada botol ubat menjadi kabur dan tidak boleh dibaca apabila terkena tumpahan sirap.' },
      { title: 'Tarikh Luput Bancuhan (BUD) Tidak Seragam', desc: 'Tarikh luput dikira secara congak dengan aplikasi kestabilan ubat yang tidak konsisten.' },
      { title: 'Stok Bahan Mentah Terputus Hubung', desc: 'Bahan kimia pukal hanya ditolak daripada kad stok beberapa hari selepas kerja bancuhan selesai.' }
    ],
    afterPoints: [
      { title: 'Enjin Pengkompaunan Automatik', desc: 'Mengira kuantiti bahan aktif, pelarut, dan pengawet secara automatik mengikut formula induk yang sah.' },
      { title: 'Cetakan Label Terma Kod QR', desc: 'Mencetak label tahan comot dan kalis air lengkap dengan kod bar, kekuatan ubat, dan amaran dos.' },
      { title: 'Pengiraan BUD Dinamik', desc: 'Mengaplikasikan piawaian farmakopeia untuk menetapkan tarikh guna selamat secara tepat.' },
      { title: 'Penolakan Stok Bersepadu', desc: 'Bahan mentah ditolak secara automatik daripada lejar inventori stor sebaik sahaja bancuhan disahkan.' }
    ],
    uatScenarios: [
      { title: 'Penyediaan 100 Botol Sirap', result: 'Pengiraan formula disahkan dan lembaran kerja dicetak dalam 30 saat vs 15 minit manual', status: 'LULUS' },
      { title: 'Keterbacaan Label Terma', result: '100% kebolehbacaan kod bar disahkan menggunakan pengimbas mudah alih farmasi', status: 'LULUS' },
      { title: 'Ujian Kestabilan BUD', result: 'Menguji 10 formula ampaian oral; kesemua tarikh BUD menepati piawaian British Pharmacopoeia', status: 'LULUS' }
    ],
    staffFeedback: 'Membancuh ubat sirap Paracetamol kini jauh lebih selamat; kita hanya masukkan jumlah liter dan sistem memberikan sukatan gram yang tepat.',
    valueMetrics: [
      { metric: 'Masa Pengiraan Formula', impact: '< 1 Minit', detail: 'Dipendekkan daripada 15 minit manual' },
      { metric: 'Ralat Tulisan Label', impact: 'Sifar Ralat', detail: 'Cetakan terma kod bar automatik' },
      { metric: 'Kebolehkesanan Kelompok', impact: '100% Terkesan', detail: 'Hubungan bahan mentah kepada pesakit' },
      { metric: 'Kapasiti Pengkompaunan', impact: '+50% Pengeluaran', detail: 'Menggandakan kecekapan bulanan unit' }
    ]
  },
  {
    num: '08',
    name: 'MyMSDS',
    roleTag: 'Keselamatan Bahan Kimia & Pertolongan Cemas Kemalangan (OSHA)',
    dept: 'Stor Farmasi, Makmal Patologi & Wad-wad Hospital',
    whyCreated: 'Hospital mengendalikan bahan kimia berbahaya seperti formalin, disinfektan, dan reagen makmal. Fail Risalah Data Keselamatan (MSDS) fizikal yang tebal disimpan jauh di pejabat menyebabkan staf mengambil masa sehingga 15 minit mencari rawatan kecemasan sewaktu tumpahan asid.',
    flowSteps: [
      { num: '01', title: 'Imbas Kod QR Bekas', desc: 'Imbas pelekat kod QR pada bekas bahan kimia guna telefon' },
      { num: '02', title: 'Rawatan Serta-Merta', desc: 'Paparan protokol cucian mata & kulit dalam masa <1 saat' },
      { num: '03', title: 'Panduan PPE & Peneutralan', desc: 'Papar keperluan sarung tangan, topeng & agen peneutral' },
      { num: '04', title: 'Prosedur Tumpahan', desc: 'Langkah pengawalan tumpahan & pengudaraan kecemasan' },
      { num: '05', title: 'Daftar Kepatuhan OSHA', desc: 'Laporan pematuhan satu klik bagi tujuan audit keselamatan' }
    ],
    beforePoints: [
      { title: 'Fail Kertas Tebal di Pejabat', desc: 'Tindakan kecemasan tertangguh 15 minit sementara staf berlari mencari fail MSDS di pejabat jauh.' },
      { title: 'Helaian Keselamatan Usang', desc: 'Helaian kertas di bilik rawatan wad berusia 5–10 tahun dengan arahan rawatan yang tidak lagi tepat.' },
      { title: 'Tong Bahan Kimia Tanpa Label', desc: 'Bahan kimia yang dituangkan ke dalam botol penyembur kecil tiada sebarang label amaran bahaya.' },
      { title: 'Ketakakuran Audit OSHA 1994', desc: 'Jawatankuasa Keselamatan sukar memastikan pematuhan penuh bahan kimia merentasi semua wad.' }
    ],
    afterPoints: [
      { title: 'Imbasan Kod QR Pada Bekas', desc: 'Mengimbas kod QR pada tong kimia membuka dossier keselamatan dalam telefon pintar dalam <1 saat.' },
      { title: 'Protokol Kecemasan Jelas', desc: 'Arahan percikan mata, terhidu, terkena kulit, dan tertelan dipaparkan dengan ikon tindakan yang terang.' },
      { title: 'Piktogram GHS & Panduan PPE', desc: 'Lencana visual menunjukkan keperluan cermin mata keselamatan, sarung tangan nitril, dan apron kalis air.' },
      { title: 'Pangkalan Data Berpusat', desc: 'Pangkalan data awan mengemas kini helaian keselamatan secara automatik ke seluruh hospital.' }
    ],
    uatScenarios: [
      { title: 'Simulasi Kemalangan Tumpahan', result: 'Jururawat mengimbas kod QR tong formalin dan mengakses panduan peneutralan dalam 12 saat', status: 'LULUS' },
      { title: 'Kesesuaian Telefon Pintar', result: 'Disahkan lancar dibuka di pelayar telefon pintar Android, iOS, dan komputer meja', status: 'LULUS' },
      { title: 'Semakan Pematuhan OSHA', result: '100% daripada 142 bahan kimia berbahaya hospital didaftarkan dengan panduan kecemasan', status: 'LULUS' }
    ],
    staffFeedback: 'Semasa simulasi percikan kimia ke mata, dapat melihat tempoh bilasan air dan agen peneutral di telefon serta-merta amat membantu.',
    valueMetrics: [
      { metric: 'Masa Akses Rawatan Cemas', impact: '< 1 Minit', detail: 'Dipendekkan daripada 15 minit manual' },
      { metric: 'Pematuhan OSHA 1994', impact: '100% Patuh', detail: 'Sifar ketakakuran keselamatan bahan kimia' },
      { metric: 'Perlindungan Warga Kerja', impact: 'Menyeluruh', detail: 'Panduan keselamatan di setiap lokasi guna' },
      { metric: 'Penjimatan Kertas', impact: '14 Fail Dimansuhkan', detail: 'Menghapuskan fail binder kertas di wad' }
    ]
  },
  {
    num: '09',
    name: 'MyTransporter',
    roleTag: 'Pengurusan Armada Kenderaan Hospital & Laluan Logistik',
    dept: 'Unit Kenderaan Hospital & Klinik Kesihatan Luar Bandar',
    whyCreated: 'Hospital Lawas mengendalikan armada pacuan empat roda (4WD) dan ambulans bagi ekspedisi klinik pedalaman (Ba\'kelalan, Long Semadoh). Borang tempahan kertas menyebabkan pertindihan jadual ambulans, kerosakan kenderaan tidak terpantau, dan pertikaian log bahan api.',
    flowSteps: [
      { num: '01', title: 'Tempahan Digital', desc: 'Wad menghantar permohonan kenderaan bersama tahap keutamaan' },
      { num: '02', title: 'Sekatan Pertindihan', desc: 'Sistem menyekat tempahan bertindih secara automatik' },
      { num: '03', title: 'Keutamaan Kes Cemas', desc: 'Pemindahan pesakit cemas memintas perjalanan pentadbiran' },
      { num: '04', title: 'Pemeriksaan Pra-Jalan', desc: 'Senarai semak digital disahkan pemandu sebelum bertolak' },
      { num: '05', title: 'Laluan Ekspedisi Pedalaman', desc: 'Merekodkan log perjalanan Ba\'kelalan bersama radar servis kenderaan' }
    ],
    beforePoints: [
      { title: 'Kekacauan Borang Tempahan Kertas', desc: 'Borang tempahan yang tercicir di kaunter menyebabkan ambulans ditempah dua kali serentak.' },
      { title: 'Titik Buta Logistik Pedalaman', desc: 'Perjalanan 4–8 jam ke Ba\'kelalan bertolak tanpa rekod kargo ubat dan status laluan yang jelas.' },
      { title: 'Penyelenggaraan Tidak Terjejak', desc: 'Semakan brek, tayar, dan minyak enjin hanya bergantung kepada pelekat kertas di cermin kenderaan.' },
      { title: 'Pertikaian Tuntutan Bahan Api', desc: 'Buku log manual tiada bukti perbatuan perjalanan yang tepat menimbulkan keraguan pentadbiran.' }
    ],
    afterPoints: [
      { title: 'Kalendar Tempahan Tanpa Konflik', desc: 'Matriks tempahan masa nyata menghalang pertembungan jadual kenderaan secara automatik.' },
      { title: 'Keutamaan Rujukan Ambulans Cemas', desc: 'Kes kecemasan rujukan pesakit secara automatik memintas jadual perjalanan rutin bukan klinikal.' },
      { title: 'Senarai Semak Pra-Perjalanan Digital', desc: 'Pemandu melengkapkan semakan 12-titik (tayar, minyak, lampu) melalui telefon sebelum memulakan enjin.' },
      { title: 'Radar Penyelenggaraan Armada', desc: 'Kiraan perbatuan automatik memberi amaran kepada pegawai 500km sebelum jadual servis tiba.' }
    ],
    uatScenarios: [
      { title: 'Sekatan Tempahan Bertindih', result: 'Permohonan kedua bagi ambulans yang sama pada waktu yang sama ditolak automatik', status: 'LULUS' },
      { title: 'Senarai Semak Pemandu', result: 'Pemandu melengkapkan semakan keselamatan pra-perjalanan dalam 2.1 minit di telefon', status: 'LULUS' },
      { title: 'Penugasan Kes Kecemasan', result: 'Rujukan kecemasan pesakit berjaya diagihkan dan disahkan pemandu dalam 45 saat', status: 'LULUS' }
    ],
    staffFeedback: 'Penyelia kenderaan kini tenang; pemandu mempunyai jadual tugasan di telefon dan servis kenderaan tidak pernah lagi terlepas.',
    valueMetrics: [
      { metric: 'Pertindihan Tempahan', impact: 'Sifar Pertindihan', detail: '100% tempahan kenderaan bebas konflik' },
      { metric: 'Logistik Klinik Pedalaman', impact: '100% Terpantau', detail: 'Keterlihatan penuh ekspedisi perubatan' },
      { metric: 'Kerosakan Kenderaan di Jalan', impact: '-65% Penurunan', detail: 'Radar pencegahan penyelenggaraan berkala' },
      { metric: 'Produktiviti Armada', impact: '+35% Kecekapan', detail: 'Pengoptimuman laluan dan perjalanan gabungan' }
    ]
  },
  {
    num: '10',
    name: 'MyPorter',
    roleTag: 'Penugasan Pritindih Wad & Penghantaran Sampel Darah STAT',
    dept: 'Wad Klinikal, Makmal Patologi & Unit Pritindih Hospital',
    whyCreated: 'Pritindih hospital amat penting bagi pemindahan pesakit dan penghantaran sampel makmal kecemasan. Jururawat menghabiskan 5 jam seminggu menelefon bilik pritindih berulang kali, manakala sampel darah kecemasan (STAT) sering tertangguh.',
    flowSteps: [
      { num: '01', title: 'Hantar Tiket Wad', desc: 'Wad memasukkan permohonan tugas bersama status STAT' },
      { num: '02', title: 'Pengutamaan Giliran', desc: 'Sampel darah kecemasan STAT diutamakan ke giliran teratas' },
      { num: '03', title: 'Terima Tugasan', desc: 'Pritindih terdekat menerima tugas melalui aplikasi telefon' },
      { num: '04', title: 'Penjejakan Laluan', desc: 'Wad melihat status langsung pergerakan pesakit/sampel' },
      { num: '05', title: 'Tandatangan Digital', desc: 'Penerima di makmal menandatangani pengesahan penerimaan' }
    ],
    beforePoints: [
      { title: '5 Jam Seminggu Menelefon Pritindih', desc: 'Jururawat mendail interkom bilik pritindih berulang kali bertanyakan sama ada ada staf datang.' },
      { title: 'Slip Kertas Sampel Tercicir', desc: 'Kertas permohonan manual tercicir menyebabkan kekeliruan sama ada sampel telah dihantar.' },
      { title: 'Kelewatan Sampel Kecemasan STAT', desc: 'Sampel darah padanan kecemasan menunggu di belakang penghantaran linen kain dalam giliran manual.' },
      { title: 'Beban Kerja Pritindih Tidak Adil', desc: 'Pritindih yang rajin memikul sebahagian besar tugas manakala yang lain tidak teragih dengan saksama.' }
    ],
    afterPoints: [
      { title: 'Papan Giliran Digital Masa Nyata', desc: 'Papan pemuka memaparkan semua permohonan aktif merentasi wad, ICU, dewan bedah, dan makmal.' },
      { title: 'Pengutamaan Automatik Kes STAT', desc: 'Pemindahan pesakit cemas dan sampel darah STAT secara automatik melonjak ke giliran paling atas.' },
      { title: 'Agihan Tugasan Melalui Telefon', desc: 'Pritindih menerima notifikasi tugasan pada peranti mudah alih dan menerima tugasan dengan satu sentuhan.' },
      { title: 'Akuan Penerimaan Digital Makmal', desc: 'Staf makmal yang menerima sampel mengesahkan penerimaan melalui tandatangan digital pada skrin pritindih.' }
    ],
    uatScenarios: [
      { title: 'Ujian Penghantaran STAT', result: 'Pritindih menerima tugas dalam 28 saat dan menghantar darah ke makmal dalam 4.2 minit', status: 'LULUS' },
      { title: 'Ujian Keutamaan Giliran', result: 'Sampel darah kecemasan berjaya memintas 4 tugasan kain linen biasa secara automatik', status: 'LULUS' },
      { title: 'Tandatangan Penerimaan Digital', result: 'Juruteknologi makmal menandatangani pengesahan penerimaan sampel secara digital', status: 'LULUS' }
    ],
    staffFeedback: 'Ketua Jururawat menyatakan wad kini lebih tenang tanpa deringan telefon berterusan; sampel darah STAT sampai ke makmal dua kali lebih pantas.',
    valueMetrics: [
      { metric: 'Masa Panggilan Telefon Jimat', impact: '5 Jam/Seminggu', detail: 'Menghapuskan panggilan mengejar pritindih' },
      { metric: 'Tempoh Hantar Sampel STAT', impact: '< 5 Minit', detail: 'Dipendekkan daripada 20 minit garis asas' },
      { metric: 'Kehilangan Sampel di Laluan', impact: 'Sifar Kehilangan', detail: 'Tandatangan penerimaan digital makmal' },
      { metric: 'Keseimbangan Beban Tugas', impact: '100% Saksama', detail: 'Agihan tugasan telus dan seimbang' }
    ]
  },
  {
    num: '11',
    name: 'MyStaff & MyTimeOff',
    roleTag: 'Jadual Bertugas Syif & Tadbir Urus Cuti Gantian',
    dept: 'Semua Jabatan Klinikal & Pentadbiran Hospital Lawas',
    whyCreated: 'Menguruskan jadual bertugas syif, baki cuti gantian bertugas atas panggilan (on-call), dan permohonan cuti menggunakan carta kertas menimbulkan pertikaian. Borang cuti kertas mengambil masa 1–3 hari untuk diluluskan, manakala rekod cuti gantian yang hilang merosakkan moral staf.',
    flowSteps: [
      { num: '01', title: 'Jadual di Telefon', desc: 'Akses 24/7 jadual syif bulanan melalui telefon pintar' },
      { num: '02', title: 'Mohon Cuti Online', desc: 'Memohon cuti bersama semakan kelayakan serta-merta' },
      { num: '03', title: 'Peta Haba Kekuatan', desc: 'Sistem menyemak nisbah jururawat-pesakit sebelum lulus' },
      { num: '04', title: 'Kelulusan Penyelia', desc: 'Kelulusan berperingkat satu klik dalam masa <4 jam' },
      { num: '05', title: 'Lejar Cuti Gantian', desc: 'Baki cuti bertugas on-call dikreditkan secara automatik' }
    ],
    beforePoints: [
      { title: 'Jadual Papan Kenyataan Kertas', desc: 'Staf terpaksa datang ke hospital pada hari rehat semata-mata untuk melihat giliran syif akan datang.' },
      { title: 'Kelulusan Cuti Mengambil 1–3 Hari', desc: 'Borang kertas yang bergerak antara ketua jururawat, matron, dan pengarah terbiar di atas meja.' },
      { title: 'Pertikaian Baki Cuti Gantian', desc: 'Rekod bertugas atas panggilan malam yang dicatat dalam buku log hilang menyebabkan hak cuti staf terabai.' },
      { title: 'Kekurangan Staf Tanpa Sengaja', desc: 'Penyelia meluluskan cuti staf bertindih menyebabkan syif malam kekurangan jururawat secara kritikal.' }
    ],
    afterPoints: [
      { title: 'Jadual Syif Mudah Alih 24/7', desc: 'Staf boleh menyemak jadual bertugas peribadi dan jabatan dari mana-mana telefon pintar secara langsung.' },
      { title: 'Kelulusan Cuti Bawah 4 Jam', desc: 'Penyelia menerima notifikasi segera untuk mengesahkan atau menolak permohonan cuti dengan satu sentuhan.' },
      { title: 'Lejar Cuti Gantian Automatik', desc: 'Tugasan atas panggilan yang selesai mengira dan mengkreditkan baki cuti gantian secara automatik.' },
      { title: 'Peta Haba Kekuatan Tenaga Kerja', desc: 'Sistem memberi amaran visual menyekat kelulusan cuti sekiranya nisbah jururawat-pesakit wad terjejas.' }
    ],
    uatScenarios: [
      { title: 'Aliran Permohonan Cuti', result: 'Staf memohon cuti dan penyelia meluluskan di telefon dalam masa 14 minit', status: 'LULUS' },
      { title: 'Sekatan Kekurangan Staf', result: 'Sistem memberi amaran apabila 3 jururawat syif yang sama memohon cuti serentak', status: 'LULUS' },
      { title: 'Penyelarasan Cuti Gantian', result: 'Tugasan on-call hujung minggu mengkreditkan 1.5 hari cuti gantian secara tepat', status: 'LULUS' }
    ],
    staffFeedback: 'Warga kerja hospital amat gembira jadual bertugas ada di dalam telefon; melihat baki cuti gantian yang telus menamatkan semua pertengkaran syif.',
    valueMetrics: [
      { metric: 'Tempoh Kelulusan Cuti', impact: '< 4 Jam', detail: 'Dipendekkan daripada 1–3 hari bekerja' },
      { metric: 'Masa Menyusun Jadual', impact: '8 Jam/Bulan Jimat', detail: 'Penjanaan jadual syif secara automatik' },
      { metric: 'Pertikaian Syif Bertugas', impact: 'Sifar Pertikaian', detail: 'Lejar cuti gantian 100% telus' },
      { metric: 'Jaminan Nisbah Staf Wad', impact: '100% Terpelihara', detail: 'Peta haba menyekat syif tidak cukup staf' }
    ]
  },
  {
    num: '12',
    name: 'MyBLS & Privileging',
    roleTag: 'Pentauliahan Klinikal & Radar Akreditasi Hospital',
    dept: 'Direktorat Kualiti Klinikal & Keselamatan Pesakit',
    whyCreated: 'Sijil Bantuan Hayat Asas (BLS) dan hak keistimewaan klinikal (privileging) merupakan syarat mandatori bagi doktor dan jururawat. Sijil yang luput tidak disedari sehingga audit akreditasi tiba, mendedahkan hospital kepada risiko undang-undang dan klinikal.',
    flowSteps: [
      { num: '01', title: 'Pendaftaran Sijil', desc: 'Profil digital staf bersama tarikh luput & lampiran sijil' },
      { num: '02', title: 'Radar Luput 90 Hari', desc: 'Radar automatik mengesan tarikh sijil hampir luput' },
      { num: '03', title: 'Peringatan Pembaharuan', desc: 'Notifikasi amaran dihantar kepada staf & penyelia latihan' },
      { num: '04', title: 'Kunci Pematuhan Jadual', desc: 'Menghalang staf bersijil luput dijadualkan di zon resusitasi cemas' },
      { num: '05', title: 'Laporan Audit Segera', desc: 'Eksport laporan akreditasi MSQH dalam satu klik' }
    ],
    beforePoints: [
      { title: 'Fail Sijil Kertas Berselerak', desc: 'Salinan sijil fizikal disimpan di dalam fail peribadi menyukarkan semakan tarikh luput secara berkala.' },
      { title: 'Bertugas Dengan Sijil Luput', desc: 'Doktor dan jururawat bertugas di zon kritikal tanpa menyedari sijil BLS mereka telah tamat tempoh.' },
      { title: 'Berminggu Mengumpul Data Audit', desc: 'Penyelaras kualiti menghabiskan berminggu-minggu menyemak ratusan fail staf sebelum pemeriksaan audit.' },
      { title: 'Ketakakuran Akreditasi MSQH', desc: 'Juruaudit Kementerian Kesihatan dan MSQH sering menegur kewujudan staf klinikal bersijil luput.' }
    ],
    afterPoints: [
      { title: 'Pangkalan Data Kelayakan Berpusat', desc: 'Merekodkan profil kompetensi setiap staf klinikal termasuk BLS, ACLS, NRP, dan hak prosedur klinikal.' },
      { title: 'Radar Pengesanan Luput Automatik', desc: 'Penunjuk warna hijau/kuning/merah memaparkan sijil yang bakal luput dalam 90, 60, dan 30 hari.' },
      { title: 'Peringatan Kursus Automatik', desc: 'Staf dan unit latihan menerima amaran automatik untuk mendaftar kursus pembaharuan lebih awal.' },
      { title: 'Eksport Laporan Akreditasi MSQH', desc: 'Menjana matriks pematuhan pentauliahan hospital dalam format PDF/Excel dalam beberapa saat.' }
    ],
    uatScenarios: [
      { title: 'Imbasan Audit Seluruh Hospital', result: 'Mengimbas 145 rekod staf klinikal; berjaya mengesan 8 sijil hampir tamat tempoh', status: 'LULUS' },
      { title: 'Ujian Notifikasi Peringatan', result: 'Notifikasi amaran pembaharuan berjaya diterima staf 60 hari sebelum tarikh luput', status: 'LULUS' },
      { title: 'Penjanaan Laporan MSQH', result: 'Laporan pematuhan Standard 1 MSQH dieksport dengan lengkap dalam masa 4.5 saat', status: 'LULUS' }
    ],
    staffFeedback: 'Unit latihan hospital kini dapat melihat dalam satu pandangan siapa yang perlu hadir kursus BLS bulan ini; persediaan audit MSQH tidak lagi membebankan.',
    valueMetrics: [
      { metric: 'Kadar Pematuhan BLS', impact: '> 95%', detail: 'Meningkat daripada ~70% garis asas manual' },
      { metric: 'Bertugas Dengan Sijil Luput', impact: 'Sifar Insiden', detail: 'Tiada staf tanpa sijil sah bertugas di zon cemas' },
      { metric: 'Masa Persediaan Audit', impact: '< 5 Minit', detail: 'Dipendekkan daripada 2 minggu semakan manual' },
      { metric: 'Kesiapsiagaan Akreditasi', impact: '100% Bersedia', detail: 'Pematuhan penuh piawaian MSQH & KKM' }
    ]
  },
  {
    num: '13',
    name: 'MyCrossBorder',
    roleTag: 'Logistik Rujukan Merentas Sempadan & Pelepasan Imigresen',
    dept: 'Jabatan Kecemasan, Unit Kenderaan & Pentadbiran Hospital',
    whyCreated: 'Pesakit kritikal di Lawas yang memerlukan rawatan pakar tertiari atau pembedahan cemas perlu dirujuk melalui jalan darat ke Hospital Miri. Laluan ini merentasi sempadan antarabangsa Negara Brunei Darussalam melalui empat pos kawalan imigresen dan kastam.',
    flowSteps: [
      { num: '01', title: 'Pengaktifan Rujukan', desc: 'Doktor mengaktifkan rujukan pemindahan pesakit cemas' },
      { num: '02', title: 'Auto-Jana Dokumen', desc: 'Sistem mengisi ringkasan klinikal & dokumen rentas sempadan' },
      { num: '03', title: 'Pintu Semakan Imigresen', desc: 'Mengesahkan pasport pesakit, visa kru, & insurans kenderaan' },
      { num: '04', title: 'Manifest Kastam Ubat', desc: 'Menyenaraikan semua ubat kecemasan & silinder oksigen' },
      { num: '05', title: 'Penyelarasan Miri', desc: 'Hospital Miri menerima ringkasan klinikal sebelum ambulans tiba' }
    ],
    beforePoints: [
      { title: 'Penyediaan Dokumen Kertas Kelam-Kabut', desc: 'Staf tergesa-gesa menyusun nota klinikal, pasport pesakit, dan permit kenderaan sewaktu pesakit nazak.' },
      { title: 'Ambulans Ditahan di Pos Kawalan', desc: 'Ambulans pernah tertahan di sempadan Brunei akibat ketiadaan deklarasi ubat kawalan yang dibawa.' },
      { title: 'Kelewatan Rujukan Membahayakan Nyawa', desc: 'Pesakit trauma dan serangan jantung membazirkan masa berharga menunggu di pos imigresen.' },
      { title: 'Komunikasi Rujukan Tidak Tersusun', desc: 'Doktor Lawas terpaksa menelefon Hospital Miri berulang kali tanpa rekod perkongsian data yang formal.' }
    ],
    afterPoints: [
      { title: 'Dossier Sempadan Piawai', desc: 'Menjana pakej dokumen pelepasan rentas sempadan lengkap dengan borang klinikal dan kastam yang sah.' },
      { title: 'Pintu Semakan Pra-Bertolak', desc: 'Senarai semak digital mengesahkan kesahan pasport, insurans kenderaan, dan kelayakan jururawat pengiring.' },
      { title: 'Manifest Ubat Kastam Automatik', desc: 'Menyenaraikan semua ubat kecemasan, cecair infusi, dan gas perubatan di dalam ambulans untuk pelepasan kastam.' },
      { title: 'Penyelarasan Antara Hospital', desc: 'Jabatan Kecemasan Hospital Miri menerima ringkasan klinikal digital sebelum ambulans tiba di sempadan.' }
    ],
    uatScenarios: [
      { title: 'Penjanaan Dossier Rentas Sempadan', result: 'Pakej dokumen pelepasan sempadan dijana dan dicetak dalam masa 4.8 minit', status: 'LULUS' },
      { title: 'Pintu Semakan Dokumen', result: 'Sistem berjaya mengesan deklarasi kastam ubat yang tertinggal sebelum kenderaan bertolak', status: 'LULUS' },
      { title: 'Penyelarasan Hospital Miri', result: 'Pihak Hospital Miri mengesahkan penerimaan ringkasan klinikal pesakit secara digital', status: 'LULUS' }
    ],
    staffFeedback: 'Membawa pesakit intubasi merentasi sempadan Brunei dahulunya mencemaskan kerana urusan kertas kerja; kini pakej pelepasan sempadan lengkap dan pantas.',
    valueMetrics: [
      { metric: 'Kelewatan di Pintu Sempadan', impact: 'Sifar Kelewatan', detail: 'Pelepasan lancar di semua pos sempadan' },
      { metric: 'Masa Penyediaan Dokumen', impact: '< 5 Minit', detail: 'Dipendekkan daripada 45 minit kelam-kabut' },
      { metric: 'Deklarasi Ubat Kawalan', impact: '100% Tepat', detail: 'Sifar isu rampasan ubat di kastam' },
      { metric: 'Margin Keselamatan Rujukan', impact: 'Jauh Lebih Tinggi', detail: 'Pasukan penerima di Miri siap sedia awal' }
    ]
  },
  {
    num: '14',
    name: 'MyTempahan',
    roleTag: 'Tadbir Urus Tempahan Fasiliti & Sumber Perkongsian',
    dept: 'Pentadbiran Hospital & Latihan Pendidikan Perubatan (CME)',
    whyCreated: 'Hospital Lawas mempunyai bilik mesyuarat, dewan latihan, dan peralatan telesidang yang terhad. Buku log kertas di pondok pengawal keselamatan menyebabkan pertindihan tempahan bilik mesyuarat klinikal dan perselisihan faham pentadbiran.',
    flowSteps: [
      { num: '01', title: 'Kalendar Visual', desc: 'Semak kekosongan bilik secara langsung mengikut tarikh' },
      { num: '02', title: 'Permohonan Digital', desc: 'Hantar tempahan bersama agenda & keperluan teknologi' },
      { num: '03', title: 'Sekatan Pertindihan', desc: 'Sistem menyekat pertindihan slot secara automatik' },
      { num: '04', title: 'Pengesahan Pentadbiran', desc: 'Pengesahan tempahan bersama pelepasan automatik jika batal' },
      { num: '05', title: 'Penyelarasan AV Telesidang', desc: 'Keperluan teknikal projektor dan telesidang disalurkan ke unit IT' }
    ],
    beforePoints: [
      { title: 'Buku Log di Pondok Pengawal', desc: 'Staf terpaksa berjalan kaki ke pondok keselamatan semata-mata untuk menulis tempahan dalam buku.' },
      { title: 'Pertindihan Tempahan Bilik Kerap', desc: 'Dua jabatan berbeza kerap hadir serentak di Bilik Mesyuarat Utama untuk mengadakan program.' },
      { title: 'Bilik Terbiar Kosong Bila Batal', desc: 'Pembatalan mesyuarat tidak dimaklumkan menyebabkan bilik terbiar kosong sedangkan unit lain memerlukan.' },
      { title: 'Kunci Bilik Mesyuarat Hilang', desc: 'Peminjaman kunci bilik tidak direkodkan mencetuskan pencarian cemas sebelum mesyuarat bermula.' }
    ],
    afterPoints: [
      { title: 'Kalendar Visual Rangkaian Intranet', desc: 'Paparan grid kalendar berwarna menunjukkan status kekosongan bilik di seluruh hospital secara masa nyata.' },
      { title: 'Enjin Sekatan Pertindihan', desc: 'Menolak sebarang permohonan yang bertindih masa secara automatik, menghapuskan konflik bilik.' },
      { title: 'Pelepasan Slot Automatik', desc: 'Sebarang pembatalan terus mengemas kini kalendar induk membolehkan unit lain menempah serta-merta.' },
      { title: 'Perekodan Keperluan Sumber', desc: 'Merekodkan keperluan projektor, sistem telesidang, dan susunan kerusi semasa permohonan.' }
    ],
    uatScenarios: [
      { title: 'Sekatan Pertindihan Slot', result: 'Cubaan menempah Bilik Mesyuarat pada masa yang sama disekat secara automatik', status: 'LULUS' },
      { title: 'Aliran Kelulusan Tempahan', result: 'Pentadbiran hospital meluluskan permohonan bilik mesyuarat dalam masa 10 minit', status: 'LULUS' },
      { title: 'Keperluan Telesidang', result: 'Keperluan teknikal telesidang berjaya disalurkan kepada unit teknologi maklumat hospital', status: 'LULUS' }
    ],
    staffFeedback: 'Sesi latihan CME dan mesyuarat pengurusan kini berjalan lancar; tiada lagi pertengkaran mengenai siapa yang menempah bilik terlebih dahulu.',
    valueMetrics: [
      { metric: 'Pertindihan Tempahan Bilik', impact: 'Sifar Pertindihan', detail: '100% penghapusan konflik jadual bilik' },
      { metric: 'Kadar Penggunaan Fasiliti', impact: '+30% Peningkatan', detail: 'Pelepasan segera slot yang dibatalkan' },
      { metric: 'Masa Urusan Tempahan', impact: '< 10 Minit', detail: 'Pengesahan dalam talian vs buku log fizikal' },
      { metric: 'Konflik Antara Jabatan', impact: 'Dihapuskan Sepenuhnya', detail: 'Perkongsian kemudahan hospital yang telus' }
    ]
  },
  {
    num: '15',
    name: 'Pengagihan Wad & Inden',
    roleTag: 'Pembekalan Wad Klinikal & Kebolehkesanan Stok Ubat',
    dept: 'Wad Inpesyen, Jabatan Kecemasan & Stor Farmasi Bekalan',
    whyCreated: 'Pembekalan ubat ke wad bergantung kepada buku inden fizikal yang dibawa berulang-alik ke farmasi. Wad menyimpan stok ubat mahal berlebihan di bilik rawatan mencetuskan ketiadaan bekalan buatan, manakala jururawat membazirkan masa merekod stok secara manual.',
    flowSteps: [
      { num: '01', title: 'Inden Wad Dalam Talian', desc: 'Ketua Jururawat memasukkan kuantiti pesanan secara digital' },
      { num: '02', title: 'Pengesahan Kuota', desc: 'Sistem menyemak pesanan mengikut kuota kepakaran wad' },
      { num: '03', title: 'Petikan Stok MKMT (FEFO)', desc: 'Stor menjana senarai kutipan stok kelompok terawal luput' },
      { num: '04', title: 'Imbasan Penerimaan Wad', desc: 'Bekalan diimbas di sisi katil wad untuk mengesahkan ketepatan' },
      { num: '05', title: 'Akuan Terima Digital', desc: 'Ketua Jururawat mengesahkan penerimaan melalui tandatangan digital' }
    ],
    beforePoints: [
      { title: 'Urusan Menghantar Buku Inden Fizikal', desc: 'Jururawat terpaksa berjalan membawa buku tebal berulang-alik menuruni koridor hospital ke farmasi.' },
      { title: 'Penyimpanan Ubat Berlebihan di Wad', desc: 'Wad menyimpan antibiotik mahal secara berlebihan di bilik rawatan mencetuskan kekurangan stok hospital.' },
      { title: 'Ubat Luput di Almari Rawatan', desc: 'Almari kecemasan wad mempunyai ampul ubat yang telah luput di bahagian belakang rak tanpa disedari.' },
      { title: 'Beban Tugas Kerani Jururawat', desc: 'Ketua Jururawat menghabiskan 3–4 jam seminggu menulis buku inden dan mengira baki stok wad.' }
    ],
    afterPoints: [
      { title: 'Sistem Inden Digital 100% Tanpa Kertas', desc: 'Wad menghantar permohonan bekalan secara digital dengan senarai ubat lazim dalam masa 2 minit.' },
      { title: 'Enjin Penguatkuasaan Had Kuota', desc: 'Memberi amaran dan mengehadkan pesanan yang melebihi kuota pegangan rasmi wad secara automatik.' },
      { title: 'Senarai Kutipan Stok FEFO Optimum', desc: 'Stor farmasi menerima pesanan digital dan memetik ubat mengikut kelompok tarikh luput terawal.' },
      { title: 'Pengesahan Penerimaan Digital Wad', desc: 'Penyerahan bekalan disahkan di wad melalui imbasan kod bar dan tandatangan penerima pada tablet.' }
    ],
    uatScenarios: [
      { title: 'Penyerahan Inden 20 Barangan', result: 'Ketua Jururawat menyemak dan menghantar inden wad dalam masa 2.2 minit', status: 'LULUS' },
      { title: 'Amaran Melebihi Kuota Wad', result: 'Percubaan menginden 4x ganda kuota cecair IV disekat untuk semakan penyelia', status: 'LULUS' },
      { title: 'Tandatangan Penerimaan Digital', result: 'Wad mengesahkan penerimaan bekalan melalui tandatangan digital dalam 30 saat', status: 'LULUS' }
    ],
    staffFeedback: 'Ketua Jururawat memperoleh semula masa berharga untuk rawatan pesakit di katil; farmasi membekalkan jumlah ubat yang tepat tanpa kertas kerja.',
    valueMetrics: [
      { metric: 'Kitaran Pembekalan Wad', impact: '60% Lebih Pantas', detail: 'Daripada 24-48 jam kepada hari yang sama' },
      { metric: 'Penyimpanan Stok Berlebihan', impact: 'Sifar Simpanan Lebihan', detail: 'Kawalan kuota automatik yang ketat' },
      { metric: 'Masa Kerani Jururawat', impact: '3 Jam/Wad Jimat', detail: 'Bagi setiap wad klinikal hospital' },
      { metric: 'Kebolehkesanan Rantaian', impact: '100% Terkesan', detail: 'Jejak audit digital daripada stor ke wad' }
    ]
  },
  {
    num: '16',
    name: 'Hab Pusat & Pentadbiran Hospital',
    roleTag: 'Tadbir Urus Sistem Bersepadu, RBAC & Integrasi PhIS',
    dept: 'Pengurusan Eksekutif Hospital & Pentadbiran Sistem',
    whyCreated: 'Sebelum MyHOME v2.8.1, setiap unit hospital menggunakan fail hamparan elektronik berasingan dan kata laluan perkongsian yang tidak selamat. Pengurusan eksekutif tiada pandangan menyeluruh mengenai status hospital, manakala penyelarasan data sistem PhIS mengambil masa lama.',
    flowSteps: [
      { num: '01', title: 'Log Masuk Tunggal (SSO)', desc: 'Portal pengesahan pengguna berpusat mengikut peranan jawatan' },
      { num: '02', title: 'Kawalan Akses RLS', desc: 'Keselamatan Baris Pangkalan Data (RLS) mengasingkan data' },
      { num: '03', title: 'Radar Eksekutif', desc: 'Papan pemuka KPI operasi hospital masa nyata' },
      { num: '04', title: 'Pencatatan Jejak Audit', desc: 'Merekodkan setiap pindaan data bersama cap masa tidak boleh ubah' },
      { num: '05', title: 'Jambatan Data PhIS', desc: 'Penyelarasan lancar bersama sistem kesihatan nasional' }
    ],
    beforePoints: [
      { title: 'Aplikasi Berasingan & Kata Laluan Lemah', desc: 'Staf terpaksa mengingati banyak kata laluan dengan amalan perkongsian akaun yang tidak selamat.' },
      { title: 'Titik Buta Pengurusan Eksekutif', desc: 'Pengarah Hospital terpaksa menunggu laporan kertas bulanan untuk mengetahui masalah operasi wad.' },
      { title: 'Ketiadaan Jejak Audit Sistem', desc: 'Pindaan data stok atau rekod pesakit tidak dapat dikesan kepada individu tertentu, menjejaskan integriti data.' },
      { title: 'Kelewatan Penyelarasan PhIS', desc: 'Perbezaan rekod stok stor tempatan dan Sistem Maklumat Farmasi (PhIS) memerlukan pembetulan manual.' }
    ],
    afterPoints: [
      { title: 'Log Masuk Tunggal Bersepadu (SSO)', desc: 'Satu portal selamat memberikan akses kepada kesemua 16 modul mengikut peranan jawatan pengguna.' },
      { title: 'Keselamatan Pangkalan Data Terjamin', desc: 'Keselamatan Baris PostgreSQL (RLS) mengasingkan peranan data kewangan, klinikal, dan pentadbiran.' },
      { title: 'Radar Operasi Eksekutif Hospital', desc: 'Papan pemuka memaparkan kesihatan stor, suhu rangkaian sejuk, baki oksigen, dan kehadiran staf.' },
      { title: 'Jambatan Penyelarasan PhIS', desc: 'Struktur data terpiawai memudahkan eksport dan penjajaran laporan bersama sistem nasional.' }
    ],
    uatScenarios: [
      { title: 'Ujian Sekatan Keselamatan RBAC', result: 'Percubaan staf bukan kewangan mengakses buku vot disekat serta-merta oleh pangkalan data', status: 'LULUS' },
      { title: 'Kelajuan Radar Eksekutif', result: 'Papan pemuka status menyeluruh 16 modul dimuatkan dalam 3.4 saat di rangkaian hospital', status: 'LULUS' },
      { title: 'Pemeriksaan Jejak Audit', result: '100% aktiviti log masuk, pindaan data, dan kelulusan direkodkan bersama cap masa kekal', status: 'LULUS' }
    ],
    staffFeedback: 'Pengurusan hospital dapat melihat denyut nadi operasi seluruh fasiliti dalam satu pandangan skrin, daripada baki oksigen sehinggalah bekalan ubat.',
    valueMetrics: [
      { metric: 'Tadbir Urus Satu Skrin', impact: '100% Beroperasi', detail: 'Kesemua 16 modul disatukan dalam satu portal' },
      { metric: 'Keselamatan Integriti Data', impact: 'Gred Perusahaan', detail: 'Polisi RLS mengasingkan peranan secara ketat' },
      { metric: 'Kesiapsiagaan Audit', impact: '100% Kebolehkesanan', detail: 'Sifar pengubahsuaian rekod tanpa jejak' },
      { metric: 'Penyelarasan Kesihatan Kebangsaan', impact: 'Serasi PhIS', detail: 'Skema data klinikal & logistik yang piawai' }
    ]
  }
];

function buildSection2_ModuleChapters() {
  const elements = [];

  MODULE_DATA_BM.forEach((mod, idx) => {
    // Banner Pengepala Modul
    elements.push(createModuleHeaderBanner(mod.num, mod.name, mod.roleTag, mod.dept));
    elements.push(blankLine(60));

    // Carta Alir Proses Digital
    elements.push(p([new TextRun({ text: 'ALIRAN KERJA OPERASI DIGITAL:', font: FONT_PRIMARY, size: 17, bold: true, color: COLOR_BLUE })], { after: 40 }));
    elements.push(createFlowDiagram(mod.flowSteps));
    elements.push(blankLine(80));

    // Jadual Sebelum vs Selepas
    elements.push(createBeforeAfterTable(mod.whyCreated, mod.beforePoints, mod.afterPoints));
    elements.push(blankLine(80));

    // Jadual UAT & Nilai Ketara
    elements.push(createUatAndValueTable(mod.uatScenarios, mod.staffFeedback, mod.valueMetrics));

    // Pemisah halaman selepas setiap modul kecuali yang terakhir
    if (idx < MODULE_DATA_BM.length - 1) {
      elements.push(pageBreak());
    }
  });

  return elements;
}

// ─────────────────────────────────────────────────────────────
// SEKSYEN 3: MATRIKS INDUK PENILAIAN RENTAS MODUL LENGKAP
// ─────────────────────────────────────────────────────────────

function renderMatrixCellBM(items, type, widthPercent, isAlt) {
  const children = [];
  
  if (type === 'module') {
    children.push(new Paragraph({
      spacing: { before: 20, after: 30, line: 220 },
      children: [
        new TextRun({ text: items.name, font: FONT_PRIMARY, size: 16, bold: true, color: COLOR_NAVY })
      ]
    }));
    children.push(new Paragraph({
      spacing: { before: 0, after: 20, line: 200 },
      children: [
        new TextRun({ text: items.domain, font: FONT_PRIMARY, size: 14, italics: true, color: COLOR_MUTED })
      ]
    }));
  } else if (type === 'before') {
    items.forEach(pt => {
      children.push(new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 10, after: 30, line: 210 },
        children: [
          new TextRun({ text: pt.title + ': ', font: FONT_PRIMARY, size: 14, bold: true, color: '991B1B' }),
          new TextRun({ text: pt.desc, font: FONT_PRIMARY, size: 14, color: COLOR_CHARCOAL })
        ]
      }));
    });
  } else if (type === 'after') {
    items.forEach(pt => {
      children.push(new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 10, after: 30, line: 210 },
        children: [
          new TextRun({ text: pt.title + ': ', font: FONT_PRIMARY, size: 14, bold: true, color: '065F46' }),
          new TextRun({ text: pt.desc, font: FONT_PRIMARY, size: 14, color: COLOR_CHARCOAL })
        ]
      }));
    });
  } else if (type === 'uat') {
    items.forEach(sc => {
      children.push(new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 10, after: 30, line: 210 },
        children: [
          new TextRun({ text: sc.title + ': ', font: FONT_PRIMARY, size: 14, bold: true, color: COLOR_NAVY }),
          new TextRun({ text: sc.result, font: FONT_PRIMARY, size: 14, color: COLOR_CHARCOAL }),
          new TextRun({ text: ` [${sc.status}]`, font: FONT_PRIMARY, size: 13, bold: true, color: COLOR_TEAL })
        ]
      }));
    });
  } else if (type === 'value') {
    items.forEach(vm => {
      children.push(new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 10, after: 30, line: 210 },
        children: [
          new TextRun({ text: vm.metric + ': ', font: FONT_PRIMARY, size: 14, bold: true, color: COLOR_NAVY }),
          new TextRun({ text: vm.impact, font: FONT_PRIMARY, size: 14, bold: true, color: COLOR_TEAL }),
          new TextRun({ text: ` (${vm.detail})`, font: FONT_PRIMARY, size: 13, color: COLOR_MUTED })
        ]
      }));
    });
  }

  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: { fill: isAlt ? COLOR_ROW_ALT : 'FFFFFF' },
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    borders: cellBorderStandard,
    children: children
  });
}

function buildSection3_MasterMatrix() {
  const tableRows = [];

  // Pengepala Jadual
  tableRows.push(new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: 16, type: WidthType.PERCENTAGE },
        shading: { fill: COLOR_NAVY },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        borders: cellBorderStandard,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'MODUL & DOMAIN', bold: true, color: 'FFFFFF', size: 16 })] })]
      }),
      new TableCell({
        width: { size: 23, type: WidthType.PERCENTAGE },
        shading: { fill: '991B1B' },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        borders: cellBorderStandard,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'REALITI MANUAL SEBELUM (JURANG OPERASI)', bold: true, color: 'FFFFFF', size: 16 })] })]
      }),
      new TableCell({
        width: { size: 23, type: WidthType.PERCENTAGE },
        shading: { fill: '065F46' },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        borders: cellBorderStandard,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'KEUPAYAAN DIGITAL SELEPAS (ALIRAN KERJA)', bold: true, color: 'FFFFFF', size: 16 })] })]
      }),
      new TableCell({
        width: { size: 18, type: WidthType.PERCENTAGE },
        shading: { fill: COLOR_BLUE },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        borders: cellBorderStandard,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'VERIFIKASI UAT & KRITERIA', bold: true, color: 'FFFFFF', size: 16 })] })]
      }),
      new TableCell({
        width: { size: 20, type: WidthType.PERCENTAGE },
        shading: { fill: COLOR_NAVY },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        borders: cellBorderStandard,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'NILAI KETARA KEPADA HOSPITAL LAWAS', bold: true, color: 'FFFFFF', size: 16 })] })]
      })
    ]
  }));

  // Memasukkan Kesemua 16 Baris Modul
  MODULE_DATA_BM.forEach((mod, rIdx) => {
    const isAlt = rIdx % 2 === 1;

    tableRows.push(new TableRow({
      children: [
        renderMatrixCellBM({ name: `${mod.num}. ${mod.name}`, domain: mod.roleTag }, 'module', 16, isAlt),
        renderMatrixCellBM(mod.beforePoints.slice(0, 3), 'before', 23, isAlt),
        renderMatrixCellBM(mod.afterPoints.slice(0, 3), 'after', 23, isAlt),
        renderMatrixCellBM(mod.uatScenarios, 'uat', 18, isAlt),
        renderMatrixCellBM(mod.valueMetrics, 'value', 20, isAlt)
      ]
    }));
  });

  return [
    pageBreak(),
    h1('3.0 MATRIKS INDUK PENILAIAN & IMPAK RENTAS MODUL'),
    body('Matriks eksekutif komprehensif di bawah merumuskan rekod operasi yang disahkan merentasi kesemua 16 modul yang dilaksanakan di Hospital Daerah Lawas. Setiap baris membentangkan asas empirikal sebelum pelaksanaan, solusi aliran kerja digital, pengesahan ujian penerimaan pengguna (UAT), dan nilai ketara yang dihasilkan:'),

    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows
    }),

    pageBreak()
  ];
}

function buildSection4_ConclusionAndSignoff() {
  return [
    h1('4.0 KESIMPULAN & PERAKUAN PENGURUSAN INSTITUSI'),
    
    body('Ekosistem Pengurusan Operasi Hospital (MyHOME v2.8.1) membuktikan satu transformasi operasi yang matang, teruji di lapangan, dan memberikan impak positif yang mendalam kepada Hospital Daerah Lawas.'),
    body('Dengan menggantikan buku log kertas yang berselerak, kad petak manual, carta suhu papan klip, dan panggilan telefon dengan 16 modul digital yang disegerakkan, MyHOME telah menyelesaikan kekangan operasi yang berlarutan sekian lama. Sistem ini memberikan hasil yang terbukti:'),
    bullet('Ketepatan rekod stok stor farmasi meningkat daripada 64% kepada melebihi 98%, dengan tempoh verifikasi tahunan dipendekkan daripada 3–4 hari kepada bawah 30 minit.', 0, 'Ketepatan Inventori: '),
    bullet('Kitaran pesanan tempatan (PO) dipendekkan daripada 7 hari bekerja kepada bawah 24 jam dengan keterlihatan baki waran secara masa nyata merentasi semua jabatan.', 0, 'Tadbir Urus Kewangan: '),
    bullet('Tipografi Tall Man LASA di sisi katil, bancuhan IV terpiawai, dan capaian segera helaian MSDS bahan kimia melindungi keselamatan staf dan pesakit.', 0, 'Keselamatan Klinikal: '),
    bullet('Masa mencari silinder oksigen kecemasan dipendekkan daripada 30 minit kepada bawah 2 minit bersama pemantauan tolok bilik manifold.', 0, 'Sekuriti Gas Sokongan Hayat: '),
    bullet('Lebih 120 jam masa bekerja staf klinikal dan pentadbiran dijimatkan setiap bulan, mengembalikan tumpuan warga kerja kepada rawatan langsung pesakit.', 0, 'Produktiviti Tenaga Kerja: '),
    body('Laporan ini menjadi garis asas teknikal dan operasi yang muktamad bagi sistem MyHOME. Ia dikemukakan secara rasmi kepada pihak pengurusan hospital dan Jabatan Kesihatan Negeri Sarawak (JKNS) sebagai penanda aras rasmi bagi memudahkan kesinambungan operasi, pelaksanaan menyeluruh fasiliti, dan perancangan strategik masa hadapan.'),

    blankLine(200),

    h2('4.1 Blok Perakuan Rasmi & Pengesahan Semakan Teknikal'),
    body('Pegawai-pegawai di bawah mengesahkan dan memperakukan Laporan Penilaian Komprehensif Modul dan Impak Operasi ini untuk rekod rasmi institusi:'),

    blankLine(100),

    // Jadual Blok Tandatangan (100% Bahasa Melayu Rasmi)
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              margins: { top: 120, bottom: 120, left: 140, right: 140 },
              borders: cellBorderStandard,
              children: [
                new Paragraph({ children: [new TextRun({ text: 'DISEDIAKAN OLEH (KETUA PROJEK / PEMAJU):', bold: true, size: 17, color: COLOR_NAVY })] }),
                new Paragraph({ spacing: { before: 180 }, children: [new TextRun({ text: 'Tandatangan: ____________________________________', size: 16 })] }),
                new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: 'Nama: [Nama Pegawai Lead / Pemaju Sistem]', size: 16 })] }),
                new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: 'Jawatan: Pegawai Farmasi / Penolong Pegawai Farmasi', size: 16 })] }),
                new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: 'Fasiliti: Hospital Daerah Lawas, Sarawak', size: 16 })] }),
                new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: 'Tarikh: ____ / ____ / 2026', size: 16 })] })
              ]
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              margins: { top: 120, bottom: 120, left: 140, right: 140 },
              borders: cellBorderStandard,
              children: [
                new Paragraph({ children: [new TextRun({ text: 'DISEMAK & DISAHKAN OLEH (KETUA JABATAN):', bold: true, size: 17, color: COLOR_NAVY })] }),
                new Paragraph({ spacing: { before: 180 }, children: [new TextRun({ text: 'Tandatangan: ____________________________________', size: 16 })] }),
                new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: 'Nama: [Nama Ketua Jabatan Farmasi / Pentadbiran]', size: 16 })] }),
                new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: 'Jawatan: Ketua Pegawai Farmasi Hospital', size: 16 })] }),
                new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: 'Fasiliti: Hospital Daerah Lawas, Sarawak', size: 16 })] }),
                new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: 'Tarikh: ____ / ____ / 2026', size: 16 })] })
              ]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              margins: { top: 120, bottom: 120, left: 140, right: 140 },
              borders: cellBorderStandard,
              children: [
                new Paragraph({ children: [new TextRun({ text: 'PELEPASAN KLINIKAL & KUALITI OLEH:', bold: true, size: 17, color: COLOR_NAVY })] }),
                new Paragraph({ spacing: { before: 180 }, children: [new TextRun({ text: 'Tandatangan: ____________________________________', size: 16 })] }),
                new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: 'Nama: [Nama Pegawai Kualiti & Keselamatan Pesakit]', size: 16 })] }),
                new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: 'Jawatan: Pegawai Perubatan / Penyelaras Kualiti', size: 16 })] }),
                new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: 'Jawatankuasa: Jawatankuasa Kualiti & Keselamatan Pesakit', size: 16 })] }),
                new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: 'Tarikh: ____ / ____ / 2026', size: 16 })] })
              ]
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              margins: { top: 120, bottom: 120, left: 140, right: 140 },
              borders: cellBorderStandard,
              children: [
                new Paragraph({ children: [new TextRun({ text: 'DIPERAKU & DISAHKAN OLEH:', bold: true, size: 17, color: COLOR_NAVY })] }),
                new Paragraph({ spacing: { before: 180 }, children: [new TextRun({ text: 'Tandatangan: ____________________________________', size: 16 })] }),
                new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: 'Nama: [Nama Pengarah Hospital]', size: 16 })] }),
                new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: 'Jawatan: Pengarah Hospital, Hospital Daerah Lawas', size: 16 })] }),
                new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: 'Cop Rasmi Jabatan:', size: 16 })] }),
                new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: 'Tarikh: ____ / ____ / 2026', size: 16 })] })
              ]
            })
          ]
        })
      ]
    })
  ];
}

// ─────────────────────────────────────────────────────────────
// PERHIMPUNAN UTAMA DOKUMEN
// ─────────────────────────────────────────────────────────────

async function generateFullDocumentBM() {
  console.log('Menjana Laporan Penilaian Modul Visual 100% Bahasa Melayu Rasmi Mendalam untuk Hospital Lawas...');

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_PRIMARY,
            size: 21,
            color: COLOR_CHARCOAL
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1080,    // Margin 0.75 inci untuk ketumpatan visual optimum
              bottom: 1080,
              left: 1080,
              right: 1080
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 100 },
                children: [
                  new TextRun({
                    text: 'SISTEM MyHOME — LAPORAN PENILAIAN MODUL & IMPAK OPERASI (HOSPITAL LAWAS)',
                    font: FONT_PRIMARY,
                    size: 16,
                    color: COLOR_MUTED
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 70, type: WidthType.PERCENTAGE },
                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                        children: [
                          new Paragraph({
                            spacing: { after: 0 },
                            children: [
                              new TextRun({
                                text: 'LAPORAN PENILAIAN TEKNIKAL RASMI — HOSPITAL DAERAH LAWAS, SARAWAK',
                                font: FONT_PRIMARY,
                                size: 15,
                                color: COLOR_MUTED
                              })
                            ]
                          })
                        ]
                      }),
                      new TableCell({
                        width: { size: 30, type: WidthType.PERCENTAGE },
                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            spacing: { after: 0 },
                            children: [
                              new TextRun({ text: 'Halaman ', font: FONT_PRIMARY, size: 16, color: COLOR_MUTED }),
                              new TextRun({ children: [PageNumber.CURRENT], font: FONT_PRIMARY, size: 16, color: COLOR_MUTED }),
                              new TextRun({ text: ' daripada ', font: FONT_PRIMARY, size: 16, color: COLOR_MUTED }),
                              new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT_PRIMARY, size: 16, color: COLOR_MUTED })
                            ]
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        },
        children: [
          ...buildCoverPage(),
          ...buildSection1_Introduction(),
          ...buildSection2_ModuleChapters(),
          ...buildSection3_MasterMatrix(),
          ...buildSection4_ConclusionAndSignoff()
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);

  // Simpan fail dokumen Bahasa Melayu rasmi
  const bmPath = path.join(__dirname, '..', 'MyHOME_SYSTEM_MODULE_EVALUATION_REPORT_HOSPITAL_LAWAS_BM.docx');
  fs.writeFileSync(bmPath, buffer);

  console.log('BERJAYA! Laporan 100% Bahasa Melayu Rasmi Mendalam berjaya dijana:');
  console.log('Fail: ', bmPath);
  console.log('Saiz Fail:', (buffer.length / 1024).toFixed(2), 'KB');
}

generateFullDocumentBM().catch(err => {
  console.error('RALAT sewaktu menjana dokumen Bahasa Melayu:', err);
  process.exit(1);
});
