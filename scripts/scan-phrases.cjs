const fs = require('fs');
const path = require('path');

const PHRASES = [
  'Papan Pemuka', 'Kembali ke', 'Borang Permohonan', 'Maklumat',
  'Pengesahan', 'Tindakan', 'Sila pilih', 'Sila isi', 'Sila masukkan',
  'Pilih Lokasi', 'Pilih Kategori', 'Carian...', 'Carian Item',
  'Senarai Rekod', 'Senarai Permohonan', 'Senarai Tugasan', 'Senarai Staf',
  'Muat Turun', 'Cetak Laporan', 'Tiada rekod dijumpai', 'Tiada rekod',
  'Batal', 'Simpan', 'Kemaskini', 'Padam', 'Tutup', 'Hantar',
  'Jumlah Keseluruhan', 'Baki Semasa', 'Tarikh & Masa', 'Nama Penuh',
  'Jawatan', 'Bahagian', 'Unit', 'Catatan', 'Status Permohonan',
  'Menunggu Kelulusan', 'Diluluskan', 'Ditolak', 'Selesai',
  'Berjaya', 'Ralat', 'Gagal', 'Peringatan', 'Arahan', 'Pemandu'
];

function scan(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'dist' || e.name.startsWith('_archived')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) scan(p, fileList);
    else if (/\.(tsx|ts)$/.test(e.name)) {
      const code = fs.readFileSync(p, 'utf-8');
      const found = [];
      for (const phrase of PHRASES) {
        if (code.includes(phrase)) found.push(phrase);
      }
      if (found.length > 0) {
        fileList.push({ file: p.replace(process.cwd() + path.sep, ''), count: found.length, found });
      }
    }
  }
  return fileList;
}

const list = scan(path.join(process.cwd(), 'src'));
list.sort((a, b) => b.count - a.count);
console.log(`Total files with hardcoded Malay phrases: ${list.length}`);
list.slice(0, 40).forEach(item => {
  console.log(`${item.count.toString().padStart(2, ' ')} phrases: ${item.file}`);
});
