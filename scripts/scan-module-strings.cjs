const fs = require('fs');
const path = require('path');

const targetModule = process.argv[2] || 'src/modules/mytransporter';

function checkDir(d) {
  const entries = fs.readdirSync(d, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) checkDir(p);
    else if (/\.(tsx|ts)$/.test(e.name)) {
      const code = fs.readFileSync(p, 'utf-8');
      const matches = code.match(/['"`][^'"`\n\r]{2,80}['"`]/g) || [];
      const malayMatches = matches.filter(m => /\b(Sila|Borang|Maklumat|Pengesahan|Tindakan|Pilih|Carian|Senarai|Muat Turun|Cetak|Tiada rekod|Batal|Simpan|Kemaskini|Padam|Tutup|Hantar|Jumlah|Baki|Tarikh|Pemandu|Kenderaan|Tugasan|Penolakan|Permohonan)\b/i.test(m));
      if (malayMatches.length > 0) {
        console.log(`${p.replace(process.cwd() + path.sep, '')}: ${malayMatches.length} strings`);
        console.log('   Sample:', malayMatches.slice(0, 5).join(', '));
      }
    }
  }
}

checkDir(targetModule);
