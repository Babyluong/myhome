const fs = require('fs');
const path = require('path');

const MALAY_WORDS = [
  'Sila', 'Tambah', 'Kemaskini', 'Padam', 'Simpan',
  'Batal', 'Tutup', 'Carian', 'Pilih', 'Tarikh',
  'Tindakan', 'Senarai', 'Maklumat', 'Catatan',
  'Jumlah', 'Semua', 'Muat turun', 'Cetak', 'Tiada rekod',
  'Pengesahan', 'Tamat', 'Borang', 'Peringatan',
  'Berjaya', 'Gagal', 'Ralat', 'Kebenaran', 'Selesai',
  'Menunggu', 'Ditolak', 'Diterima', 'Pegawai', 'Pesakit',
  'Baki', 'Penerima', 'Penghantar', 'Kenderaan', 'Pemandu',
  'Peti sejuk', 'Suhu', 'Waran', 'Perolehan', 'Pesanan',
  'Pembekal', 'Laporan', 'Statistik', 'Eksport'
];

const patterns = MALAY_WORDS.map(w => new RegExp('\\b' + w + '\\b', 'gi'));

function scanDir(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'scratch' || entry.name.startsWith('_archived')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath, results);
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      let count = 0;
      for (const p of patterns) {
        const m = content.match(p);
        if (m) count += m.length;
      }
      if (count > 8) {
        results.push({ file: fullPath.replace(process.cwd() + path.sep, ''), count });
      }
    }
  }
  return results;
}

const res = scanDir(path.join(process.cwd(), 'src'));
res.sort((a, b) => b.count - a.count);
console.log('Top 40 files with Malay occurrences:');
res.slice(0, 40).forEach(r => console.log(`${r.count.toString().padStart(4, ' ')}: ${r.file}`));
