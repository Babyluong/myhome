const fs = require('fs');
const path = require('path');

const REPLACEMENTS = [
  // --- Transporter & Logistics ---
  { from: 'Permohonan Diluluskan', to: 'Request Approved' },
  { from: 'Permohonan pengangkutan berjaya diluluskan.', to: 'Transport requisition successfully approved.' },
  { from: 'Sila nyatakan sebab penolakan permohonan.', to: 'Please state the reason for rejecting the requisition.' },
  { from: 'Pemantauan & Aktiviti Pemandu (Driver Supervision)', to: 'Driver Activity & Supervision' },
  { from: 'Cetak Laporan Aktiviti', to: 'Print Activity Report' },
  { from: 'Pilih Pemandu', to: 'Select Driver' },
  { from: 'Pilih Kenderaan', to: 'Select Vehicle' },
  { from: 'Sila pilih kenderaan dan masukkan bacaan odometer.', to: 'Please select a vehicle and enter the odometer reading.' },
  { from: 'Tugasan Ditolak', to: 'Assignment Declined' },
  { from: 'Trip ditolak disebabkan keadaan kenderaan dan dihantar ke log aduan kerosakan.', to: 'Trip declined due to vehicle condition and dispatched to maintenance log.' },
  { from: 'Tugasan Diterima', to: 'Assignment Accepted' },
  { from: 'Gagal Memuatkan Permohonan', to: 'Failed to Load Requisitions' },
  { from: 'Sila cuba sebentar lagi.', to: 'Please try again shortly.' },
  { from: 'Sila isi sebab pembatalan.', to: 'Please provide the cancellation reason.' },
  { from: 'Permohonan Dibatalkan', to: 'Requisition Cancelled' },
  { from: 'Permohonan pengangkutan berjaya dibatalkan.', to: 'Transport requisition successfully cancelled.' },
  { from: 'Cetak Laporan Rasmi', to: 'Print Official Report' },
  { from: 'Utilization Kenderaan', to: 'Fleet Vehicle Utilization' },
  { from: 'Tiada data perjalanan kenderaan ditemui.', to: 'No vehicle trip data found.' },
  { from: 'Beban Tugasan Pemandu', to: 'Driver Workload Distribution' },
  { from: 'Sahkan & Hantar', to: 'Confirm & Submit' },
  { from: 'Borang Tidak Lengkap', to: 'Incomplete Form' },
  { from: 'Sila isi tujuan, destinasi, tarikh dan masa diperlukan.', to: 'Please enter the purpose, destination, date, and required time.' },
  { from: 'Kemaskini Berjaya', to: 'Update Successful' },
  { from: 'Pemandu Bertugas', to: 'On-Duty Driver' },
  { from: 'Memuatkan maklumat kakitangan hospital...', to: 'Loading hospital personnel records...' },
  { from: 'Sila pilih kenderaan yang bermasalah.', to: 'Please select the affected vehicle.' },
  { from: 'Sila nyatakan tajuk kerosakan.', to: 'Please state the defect title.' },
  { from: 'Sila isi penerangan kerosakan secara terperinci.', to: 'Please provide detailed defect description.' },
  { from: 'Aduan kerosakan kenderaan berjaya didaftarkan.', to: 'Vehicle defect report successfully submitted.' },
  { from: 'Log & Jurnal Pergerakan Kenderaan', to: 'Vehicle Movement & Mileage Log' },
  { from: 'Cetak Laporan Log', to: 'Print Mileage Report' },
  { from: 'Gagal Memuatkan Kenderaan', to: 'Failed to Load Vehicles' },
  { from: 'Sila isi semua butiran kenderaan.', to: 'Please fill in all vehicle specifications.' },
  { from: 'Permohonan Dihantar', to: 'Requisition Submitted' },
  { from: 'Permohonan baru dihantar oleh Pemohon.', to: 'New requisition submitted by applicant.' },
  { from: 'Pre-trip Inspection & Terima Tugasan', to: 'Pre-Trip Inspection & Accept Assignment' },
  { from: 'Permohonan Baru', to: 'New Requisition' },
  { from: 'Gagal Membatalkan', to: 'Cancellation Failed' },
  { from: 'Sebab Diperlukan', to: 'Reason Required' },
  { from: 'Sila isi sebab pindaan.', to: 'Please provide a reason for the amendment.' },
  { from: 'Borang Merentas Sempadan berjaya dimuat turun.', to: 'Cross-Border Transfer Form successfully generated.' },
  { from: 'Surat Kebenaran Rentasi Sempadan berjaya dimuat turun.', to: 'Cross-Border Permission Letter successfully generated.' },
  { from: 'Ralat Cetakan', to: 'Print Error' },
  { from: 'Gagal menjana PDF.', to: 'Failed to generate PDF.' },
  { from: 'Kenderaan & Pemandu', to: 'Vehicle & Driver' },
  { from: 'Kenderaan Sahaja (Tanpa Pemandu)', to: 'Vehicle Only (Self-Drive)' },
  { from: 'Permohonan ini adalah trip merentas sempadan. Sila pilih dokumen yang ingin dicetak:', to: 'This application is a cross-border transit trip. Please select the document to print:' },

  // --- Oxygen & Cylinder ---
  { from: 'Cetak Label', to: 'Print Label' },
  { from: 'Baki Bawa Ke Hadapan (Baki Pembukaan Rasmi)', to: 'Balance Brought Forward (Official Opening Balance)' },
  { from: 'Sila masukkan kuantiti fizikal yang sah (≥ 0).', to: 'Please enter a valid physical quantity (≥ 0).' },
  { from: 'Sila masukkan kuantiti baki yang sah (≥ 0).', to: 'Please enter a valid balance quantity (≥ 0).' },
  { from: 'tabung berjaya direkodkan dalam lejar!', to: 'cylinders successfully recorded in ledger!' },
  { from: 'Sila nyatakan justifikasi permohonan selenggaraan ini...', to: 'Please state the justification for this maintenance request...' },
  { from: 'Hantar Ke Semakan', to: 'Submit for Review' },
  { from: 'Tiada data baki silinder', to: 'No cylinder balance data' },
  { from: 'Sila masukkan No. Invois / Tuntutan Bayaran Pembekal.', to: 'Please enter Supplier Invoice / Payment Claim No.' },
  { from: 'Sila masukkan Nombor Delivery Order (DO).', to: 'Please enter Delivery Order (DO) Number.' },
  { from: 'Pilih jenis silinder dan kuantiti untuk menjana aset baharu.', to: 'Select cylinder type and quantity to generate new inventory.' },
  { from: 'Pilih Jenis Silinder', to: 'Select Cylinder Type' },
  { from: 'BORANG PEMULANGAN SILINDER GAS (ANTARA FASILITI)', to: 'GAS CYLINDER RETURN FORM (INTER-FACILITY)' },
  { from: 'BORANG PENGELUARAN / INDENT SILINDER GAS (ANTARA FASILITI)', to: 'GAS CYLINDER ISSUANCE / INDENT FORM (INTER-FACILITY)' },
  { from: 'BORANG PENGELUARAN / PERMINTAAN SILINDER GAS PERUBATAN', to: 'MEDICAL GAS CYLINDER REQUISITION / ISSUANCE FORM' },
  { from: 'Sila berikan sebab atau justifikasi pemadaman rekod ini.', to: 'Please provide the reason or justification for deleting this record.' },
  { from: 'Rekod permohonan tidak dijumpai atau telah dipadam.', to: 'Requisition record not found or already deleted.' },
  { from: 'Gagal memadam permohonan silinder', to: 'Failed to delete cylinder requisition' },
  { from: 'Gagal merekodkan baki bawa ke hadapan', to: 'Failed to record balance brought forward' },
  { from: 'BORANG PERMOHONAN UNTUK PENGELUARAN PESANAN KERAJAAN', to: 'GOVERNMENT PURCHASE ORDER REQUISITION FORM' },
  { from: 'TARIKH TERIMA / RECEIVED DATE', to: 'RECEIVED DATE' },
  { from: 'MAKLUMAT PEMBEKAL / SUPPLIER INFORMATION', to: 'SUPPLIER INFORMATION' },
  { from: 'Sila pilih saiz silinder / Please select cylinder size', to: 'Please select cylinder size' },
  { from: 'Padam silinder dari audit inventori / Deleted from inventory audit', to: 'Deleted from inventory audit' },
  { from: 'Padam silinder pukal dari audit inventori / Bulk delete from inventory audit', to: 'Bulk deleted from inventory audit' },
  { from: 'sudah berada dalam senarai penerimaan!', to: 'already exists in the receiving list!' },
  { from: 'ditambah ke senarai!', to: 'added to the list!' },
  { from: 'Sila pilih pembekal.', to: 'Please select a supplier.' },
  { from: 'Sila imbas atau pilih sekurang-kurangnya satu silinder untuk diterima.', to: 'Please scan or select at least one cylinder to receive.' },
  { from: 'Gagal menghasilkan borang pesanan.', to: 'Failed to generate order form.' },
  { from: 'Maklumat tambahan jika ada...', to: 'Additional notes if applicable...' },
  { from: 'PEMANDU / PEMBAWA', to: 'DRIVER / COURIER' },
  { from: 'PEMANDU / PENGHANTAR', to: 'DRIVER / DISPATCHER' },
  { from: 'Gagal memuatkan butiran permohonan.', to: 'Failed to load requisition details.' },
  { from: 'Sila benarkan tetingkap timbul (popups) untuk mencetak borang.', to: 'Please allow pop-ups to print the form.' },
  { from: 'Padam Permohonan / Delete Record (Dilindungi Kata Laluan)', to: 'Delete Requisition Record (Password Protected)' },
  { from: 'Gagal memuatkan senarai silinder fizikal dari pangkalan data.', to: 'Failed to load physical cylinder list from database.' },
  { from: 'Tutup Borang', to: 'Close Form' },
  { from: 'Tapis senarai siri / lokasi...', to: 'Filter serial / location list...' },
  { from: 'Batal Sah', to: 'Cancel Verification' },
  { from: 'Simpan & Sahkan Rekonsiliasi', to: 'Save & Confirm Reconciliation' },
  { from: 'Padam Rekod Silinder', to: 'Delete Cylinder Record' },
  { from: 'Tersalah cipta indent / permohonan', to: 'Accidental indent / request creation' },
  { from: 'Gagal memadam rekod permohonan', to: 'Failed to delete requisition record' },
  { from: 'Sahkan & Padam Rekod', to: 'Confirm & Delete Record' },
  { from: 'Sila pastikan sekurang-kurangnya satu item silinder wujud dalam permohonan.', to: 'Please ensure at least one cylinder item exists in the request.' },
  { from: 'Gagal mengemas kini item permohonan', to: 'Failed to update requisition items' },
  { from: 'Tidak dapat mengakses kamera. Sila masukkan atau pilih silinder secara manual.', to: 'Camera inaccessible. Please enter or select cylinder manually.' },
  { from: 'telah pun diimbas/dipilih dalam permohonan ini.', to: 'already scanned/selected in this requisition.' },
  { from: 'Sila masukkan nombor siri silinder.', to: 'Please enter the cylinder serial number.' },
  { from: 'Sila pilih saiz & jenis silinder.', to: 'Please select the cylinder size & type.' },
  { from: 'Kemaskini Silinder', to: 'Update Cylinder' },
  { from: 'Kod QR dan carian sistem akan dikemaskini mengikut nombor siri ini.', to: 'QR code and system search will be updated with this serial number.' },
  { from: 'Memuatkan senarai saiz...', to: 'Loading size list...' },
  { from: 'Sila pilih sekurang-kurangnya 1 silinder untuk dipulangkan.', to: 'Please select at least 1 cylinder to return.' },
  { from: 'Senarai Silinder Kosong', to: 'Empty Cylinder Register' },
  { from: 'Cetak Senarai', to: 'Print Register' },
  { from: 'Sila benarkan pop-up untuk mencetak dokumen.', to: 'Please allow pop-ups to print the document.' },
  { from: 'Sila taip nombor siri atau sebahagian nombor siri (cth: 7072).', to: 'Please type the serial number or suffix (e.g. 7072).' },
  { from: 'Tiada silinder ditemui dengan carian', to: 'No cylinder found matching search' },
  { from: 'Ralat carian. Cuba semula.', to: 'Search error. Please try again.' },
  { from: 'Sila nyatakan atau pilih nama Fasiliti Luar Pembekal.', to: 'Please specify or select External Supplier Facility.' },
  { from: 'Sila pilih Stor / Jabatan Simpanan Penerima.', to: 'Please select Receiving Storage Unit / Department.' },
  { from: 'Sila masukkan sekurang-kurangnya satu nombor siri silinder.', to: 'Please enter at least one cylinder serial number.' },
  { from: 'Sila pilih spesifikasi / jenis silinder.', to: 'Please select cylinder specifications / type.' },
  { from: 'Pilih Jenis / Spesifikasi Silinder', to: 'Select Cylinder Type / Specs' },
  { from: 'Senarai Silinder Fizikal', to: 'Physical Cylinder List' },
  { from: 'Sila nyatakan atau pilih Fasiliti Luar penerima.', to: 'Please specify or select recipient External Facility.' },
  { from: 'Sila pilih bahagian / jabatan pengeluar.', to: 'Please select issuing department / unit.' },
  { from: 'Imbas kod QR silinder untuk jana Senarai Silinder Kosong', to: 'Scan cylinder QR code to generate Empty Cylinder Register' },
  { from: 'Silinder sedia dimasukkan ke Senarai Silinder Kosong', to: 'Cylinders ready to add to Empty Cylinder Register' },
  { from: 'Tutup Pengimbas', to: 'Close Scanner' },
  { from: 'Lihat atau cetak senarai manifest silinder kosong', to: 'View or print empty cylinder manifest' },
  { from: 'Senarai Manifest', to: 'Manifest Register' },
  { from: 'Kemaskini Butiran Silinder (No. Siri, Saiz, Injap)', to: 'Update Cylinder Details (Serial No., Size, Valve)' },
  { from: 'Padam carian', to: 'Clear search' },
  { from: 'Jumlah Armada', to: 'Total Fleet' },
  { from: 'Tiada Rekod Silinder Dijumpai', to: 'No Cylinder Records Found' },
  { from: 'Tiada rekod silinder yang sepadan dengan carian atau tapisan status semasa.', to: 'No cylinder records match current search or status filter.' },
  { from: 'Borang Pulang ke Pembekal', to: 'Supplier Return Form' },
  { from: 'Jumlah Pegangan', to: 'Total Custody' },
  { from: 'Tarikh Rujukan', to: 'Reference Date' },
  { from: 'Tiada silinder yang belum diterima semula berdasarkan kriteria carian anda.', to: 'No unreturned cylinders found matching your search criteria.' },
  { from: 'Tiada silinder pembekal tertunggak di hospital berdasarkan kriteria carian anda.', to: 'No outstanding supplier cylinders at the hospital matching criteria.' },
  { from: 'Tarikh Hantar', to: 'Dispatch Date' },
  { from: 'Pesanan pembekalan dan permohonan isian semula silinder perubatan.', to: 'Medical gas cylinder supply order and refill requisition.' },
  { from: 'Lihat Senarai', to: 'View List' },
  { from: 'Sila pilih Wad / Unit Pemohon.', to: 'Please select Requesting Ward / Unit.' },
  { from: 'Sila nyatakan atau pilih Fasiliti Luar (cth: Hospital Beaufort).', to: 'Please specify or select External Facility (e.g. Beaufort Hospital).' },
  { from: 'Sila pastikan kuantiti sekurang-kurangnya 1 untuk semua item.', to: 'Please ensure quantity is at least 1 for all items.' },
  { from: 'Ralat semasa menghantar permohonan.', to: 'Error submitting requisition.' },
  { from: 'Permohonan inden bekalan oksigen antara fasiliti kesihatan KKM.', to: 'Inter-facility oxygen supply requisition between MOH healthcare facilities.' },

  // --- Staff & Movement ---
  { from: 'Tiada rekod audit ditemui', to: 'No audit records found' },
  { from: 'Tersilap Masuk Maklumat / Rekod Bertindih', to: 'Accidental Data Entry / Duplicate Record' },
  { from: 'Pertukaran Tarikh & Masa Sesi', to: 'Session Date & Time Reschedule' },
  { from: 'Pertukaran Tarikh / Masa', to: 'Date / Time Change' },
  { from: 'Kemaskini Dokumen / Lampiran Slaid', to: 'Update Documents / Presentation Slides' },
  { from: 'Kemaskini Tajuk & Kategori', to: 'Update Title & Category' },
  { from: 'Tiada pergerakan luar, kursus, mesyuarat atau cuti direkodkan untuk tarikh ini.', to: 'No external duty, training, meeting, or leave scheduled for this date.' },
  { from: 'Ralat memuatkan senarai tarikh akhir', to: 'Error loading submission deadlines' },
  { from: 'Tarikh akhir ditandakan selesai!', to: 'Deadline marked as completed!' },
  { from: 'Sila lengkapkan tajuk dan tarikh akhir.', to: 'Please enter the title and deadline date.' },
  { from: 'Tarikh akhir serahan berjaya didaftarkan!', to: 'Submission deadline successfully created!' },
  { from: 'Gagal menyimpan tarikh akhir', to: 'Failed to save submission deadline' },
  { from: 'Gagal meluluskan permohonan cuti', to: 'Failed to approve leave application' },
  { from: 'Permohonan cuti telah ditolak.', to: 'Leave application has been rejected.' },
  { from: 'Gagal menolak permohonan', to: 'Failed to reject application' },
  { from: 'Cetak Ringkasan', to: 'Print Summary' },
  { from: 'Ralat memuatkan borang permohonan cuti', to: 'Error loading leave application form' },
  { from: 'Sila lengkapkan maklumat tarikh dan sebab cuti.', to: 'Please provide the leave dates and reason.' },
  { from: 'Permohonan cuti berjaya dihantar ke HOD untuk kelulusan!', to: 'Leave application successfully submitted to HOD for approval!' },
  { from: 'Gagal menghantar permohonan cuti', to: 'Failed to submit leave application' },
  { from: 'Borang Permohonan Cuti', to: 'Leave Application Form' },
  { from: 'Semakan Baki Kelayakan Cuti Mengikut Perintah Am Bab C & Sejarah Permohonan Cuti', to: 'General Orders Chapter C Leave Entitlement Balance & Application History' },
  { from: 'Baki Kelayakan Cuti Tahun', to: 'Annual Leave Entitlement Balance' },
  { from: 'Sejarah Permohonan Cuti', to: 'Leave Application History' },
  { from: 'Tempoh & Jumlah Hari', to: 'Duration & Total Days' },
  { from: 'Sila lengkapkan tajuk, destinasi dan tujuan pergerakan.', to: 'Please provide the movement title, destination, and purpose.' },
  { from: 'Sila nyatakan sebab / justifikasi pindaan (Wajib untuk rekod audit).', to: 'Please state the amendment justification (Mandatory for audit trail).' },
  { from: 'Sila masukkan nama dan jawatan pegawai farmasi terlibat.', to: 'Please enter the name and designation of officer involved.' },
  { from: 'Borang Pergerakan Pegawai berjaya direkodkan!', to: 'Staff Duty Movement Form successfully recorded!' },
  { from: 'Cetak Carta Organisasi Rasmi (PDF Landscape)', to: 'Print Official Organization Chart (PDF Landscape)' },
  { from: 'Cetak PDF', to: 'Print PDF' },
  { from: 'Jumlah Posisi', to: 'Total Positions' },
  { from: 'Kemaskini Posisi', to: 'Update Position' },
  { from: 'Ralat memuatkan senarai peringatan', to: 'Error loading reminders list' },
  { from: 'Sila masukkan tajuk peringatan.', to: 'Please enter the reminder title.' },
  { from: 'Tarikh Akhir Serahan', to: 'Submission Deadline' },
  { from: 'Mandatori / Tindakan segera & Audit', to: 'Mandatory / Urgent Action & Audit' },

  // --- Cross-Border ---
  { from: 'Tarikh Perjalanan diperlukan', to: 'Travel Date is required' },
  { from: 'No Pendaftaran Kenderaan diperlukan', to: 'Vehicle Registration Number is required' },
  { from: 'Tarikh Tamat Pasport Pemandu diperlukan', to: 'Driver Passport Expiry Date is required' },
  { from: 'Jumlah Permohonan', to: 'Total Requisitions' },
  { from: 'Permohonan Terkini', to: 'Recent Requisitions' },
  { from: 'Tiada rekod perjalanan ditemui.', to: 'No travel records found.' },
  { from: 'Gagal memuatkan butiran permohonan', to: 'Failed to load requisition details' },
  { from: 'Hantar Permohonan', to: 'Submit Requisition' },
  { from: 'Permohonan telah berjaya dihantar untuk kelulusan.', to: 'Requisition successfully submitted for approval.' },
  { from: 'Gagal menghantar permohonan', to: 'Failed to submit requisition' },
  { from: 'Permohonan rentasi sempadan telah diluluskan.', to: 'Cross-border transfer requisition has been approved.' },
  { from: 'Cari Permohonan', to: 'Search Requisitions' },
  { from: 'Dari Tarikh', to: 'From Date' },
  { from: 'Hingga Tarikh', to: 'To Date' },
  { from: 'Tiada rekod log padan dengan carian.', to: 'No log records match the search.' },
  { from: 'Gagal meluluskan permohonan', to: 'Failed to approve requisition' },
  { from: 'Gagal membatalkan permohonan', to: 'Failed to cancel requisition' },
  { from: 'Gagal memadam permohonan', to: 'Failed to delete requisition' },

  // --- Inventory & Pharmacy Storage ---
  { from: 'Maklumat ubat berjaya dikemaskini!', to: 'Medication details successfully updated!' },
  { from: 'Gagal menyimpan maklumat ubat', to: 'Failed to save medication details' },
  { from: 'Pilih tindakan pukal untuk mengaktifkan atau me-nyahaktifkan ubat', to: 'Select bulk action to activate or deactivate medications' },
  { from: 'Batal Pilihan', to: 'Clear Selection' },
  { from: 'Kosongkan senarai item untuk skim ini', to: 'Clear item list for this scheme' },
  { from: 'Klik untuk kemaskini stok & butiran', to: 'Click to update stock & details' },
  { from: 'Padam item ini dari inventori fasiliti', to: 'Delete this item from facility inventory' },
  { from: '-- Pilih Stor --', to: '-- Select Store --' },
  { from: '-- Pilih Rak / Kabinet --', to: '-- Select Shelf / Cabinet --' },
  { from: 'Sila masukkan nama item bukan ubat.', to: 'Please enter the non-drug item name.' },
  { from: 'sudah sedia ada dalam Katalog Utama. Sila pilih item tersebut daripada katalog.', to: 'already exists in the Master Catalogue. Please select the item from the catalogue.' },
  { from: 'Tiada baki stok dalam simpanan', to: 'No stock balance in storage' },
  { from: 'JUMLAH ITEM', to: 'TOTAL ITEMS' },
  { from: 'BAKI SEMASA', to: 'CURRENT BALANCE' },
  { from: 'Baki Awal (Qty)', to: 'Opening Balance (Qty)' },
  { from: 'Baki Akhir (Qty)', to: 'Closing Balance (Qty)' },
  { from: 'Tarikh Cetakan:', to: 'Print Date:' },
  { from: 'Jumlah Nilai Pegangan Akhir:', to: 'Total Closing Inventory Value:' },
  { from: 'Telah Luput Tarikh (Expired)', to: 'Expired' },
  { from: 'Gagal memuatkan maklumat stok hampir luput', to: 'Failed to load near-expiry stock records' },
  { from: 'Tiada rekod untuk dieksport', to: 'No records to export' },
  { from: 'Tarikh Luput', to: 'Expiry Date' },
  { from: 'Baki Hari', to: 'Days Remaining' },
  { from: 'Maklumat bukan ubat berjaya dikemaskini!', to: 'Non-drug item details successfully updated!' },
  { from: 'Gagal menyimpan maklumat bukan ubat', to: 'Failed to save non-drug item details' },
  { from: 'Pilih tindakan pukal untuk mengaktifkan atau me-nyahaktifkan item bukan ubat', to: 'Select bulk action to activate or deactivate non-drug items' },
  { from: 'Sila isi Batch No, Kuantiti dan Lokasi Simpanan!', to: 'Please fill in Batch No, Quantity, and Storage Location!' },
  { from: 'Sila pilih Batch dan isi Kuantiti Pengeluaran!', to: 'Please select Batch and enter Issuance Quantity!' },
  { from: 'Kuantiti melebihi baki tersedia! Baki tersedia:', to: 'Quantity exceeds available balance! Available balance:' },
  { from: 'Sila pilih sekurang-kurangnya 1 item untuk menetapkan lokasi.', to: 'Please select at least 1 item to assign storage location.' },
  { from: 'Sila isi nama sub-lokasi (Palet, Rak, Kabinet, Level, atau Column)', to: 'Please enter sub-location name (Pallet, Shelf, Cabinet, Level, or Column)' },
  { from: 'Gagal memuatkan senarai lokasi stor', to: 'Failed to load store location list' },
  { from: 'Baki Pembukaan Asal Ledger', to: 'Original Ledger Opening Balance' },
  { from: 'Baki Bawa Ke Hadapan', to: 'Balance Brought Forward' },
];

const TARGET_DIRS = [
  'src/modules/mytransporter',
  'src/modules/mycylinder',
  'src/components/oxygen',
  'src/modules/mystaff',
  'src/modules/mycrossborder',
  'src/modules/inventory/pages/inventory'
];

let totalModifiedFiles = 0;
let totalReplacementsMade = 0;

function processDirectory(dir) {
  const fullDir = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullDir)) return;
  const entries = fs.readdirSync(fullDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(fullDir, entry.name);
    if (entry.isDirectory()) {
      processDirectory(path.relative(process.cwd(), fullPath));
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let modified = false;
      let count = 0;

      for (const rep of REPLACEMENTS) {
        if (content.includes(rep.from)) {
          content = content.replaceAll(rep.from, rep.to);
          modified = true;
          count++;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        totalModifiedFiles++;
        totalReplacementsMade += count;
        console.log(`Updated (${count} reps): ${path.relative(process.cwd(), fullPath)}`);
      }
    }
  }
}

for (const dir of TARGET_DIRS) {
  processDirectory(dir);
}

console.log(`\nFinished! Modified ${totalModifiedFiles} files with ${totalReplacementsMade} translation replacements.`);
