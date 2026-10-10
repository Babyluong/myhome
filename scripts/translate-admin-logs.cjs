const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/modules/hub/pages/modules/admin/AdminSystemLogsTab.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace MODULE_VISUALS
content = content.replace("auth: { label: 'Sistem Log Masuk & Keselamatan'", "auth: { label: 'Authentication & Security'");
content = content.replace("myadmin: { label: 'MyAdmin (Pentadbiran)'", "myadmin: { label: 'MyAdmin (Administration)'");
content = content.replace("mystaff: { label: 'MyStaff (Pengurusan Anggota)'", "mystaff: { label: 'MyStaff (Personnel Operations)'");
content = content.replace("myformulari: { label: 'MyFormulari (Panduan Ubat)'", "myformulari: { label: 'MyFormulari (Drug Formulary)'");
content = content.replace("mykunci: { label: 'MyKunci (Buku Log Kunci)'", "mykunci: { label: 'MyKunci (Key Management)'");
content = content.replace("mysuhu: { label: 'MySuhu (Pemantauan Peti Sejuk)'", "mysuhu: { label: 'MySuhu (Cold Chain Monitoring)'");
content = content.replace("cylinder: { label: 'MyCylinder (Stok Gas Oksigen)'", "cylinder: { label: 'MyCylinder (Medical Oxygen)'");
content = content.replace("mycylinder: { label: 'MyCylinder (Stok Gas Oksigen)'", "mycylinder: { label: 'MyCylinder (Medical Oxygen)'");
content = content.replace("myperolehan: { label: 'MyPerolehan (Pesanan & Pembekal)'", "myperolehan: { label: 'MyPerolehan (Procurement & Orders)'");
content = content.replace("mytransporter: { label: 'MyTransporter (Penghantaran Logistik)'", "mytransporter: { label: 'MyTransporter (Fleet & Logistics)'");
content = content.replace("mytempahan: { label: 'MyTempahan (Tempahan Bilik & Fasiliti)'", "mytempahan: { label: 'MyTempahan (Facility & Venue Bookings)'");
content = content.replace("mypriviledging: { label: 'MyPriviledging (Kompetensi Staf)'", "mypriviledging: { label: 'MyPriviledging (Clinical Privileges)'");
content = content.replace("crossborder: { label: 'MyCrossBorder (Rujukan Antara Fasiliti)'", "crossborder: { label: 'MyCrossBorder (Cross-Border Referrals)'");
content = content.replace("pharmacy: { label: 'MyWarrant & Farmasi'", "pharmacy: { label: 'MyWarrant & Pharmacy Logistics'");
content = content.replace("users: { label: 'Urus Pengguna'", "users: { label: 'User Management'");
content = content.replace("roles: { label: 'Had Kuasa Pengguna'", "roles: { label: 'User Roles & Access'");
content = content.replace("departments: { label: 'Jabatan & Unit Hospital'", "departments: { label: 'Hospital Departments & Units'");
content = content.replace("hub: { label: 'Hub Utama Sistem'", "hub: { label: 'System Main Hub'");

// Replace action badges
content = content.replace("label: 'Log Masuk (LOGIN)',", "label: 'User Login (LOGIN)',");
content = content.replace("label: 'Log Keluar (LOGOUT)',", "label: 'User Logout (LOGOUT)',");
content = content.replace("label: 'Buka Halaman (VIEW)',", "label: 'View Page (VIEW)',");
content = content.replace("label: 'Cipta Rekod Baru (CREATE)',", "label: 'Create Record (CREATE)',");
content = content.replace("label: 'Kemaskini Data (UPDATE)',", "label: 'Update Data (UPDATE)',");
content = content.replace("label: 'Padam Rekod (DELETE)',", "label: 'Delete Record (DELETE)',");
content = content.replace("label: 'Lulus Permohonan (APPROVE)',", "label: 'Approve Request (APPROVE)',");
content = content.replace("label: 'Tolak Permohonan (REJECT)',", "label: 'Reject Request (REJECT)',");
content = content.replace("label: 'Muat Turun Laporan (EXPORT)',", "label: 'Export Report (EXPORT)',");

// Replace FIELD_LABELS
content = content.replace("delete_reason: 'Sebab Pemadaman',", "delete_reason: 'Deletion Reason',");
content = content.replace("status: 'Status Rekod',", "status: 'Record Status',");
content = content.replace("remarks: 'Catatan / Nota',", "remarks: 'Remarks / Notes',");
content = content.replace("description: 'Penerangan Tindakan',", "description: 'Action Description',");
content = content.replace("full_name: 'Nama Pegawai / Staf',", "full_name: 'Officer / Staff Name',");
content = content.replace("email: 'Alamat Emel',", "email: 'Email Address',");
content = content.replace("phone_number: 'No. Telefon',", "phone_number: 'Phone Number',");
content = content.replace("ic_number: 'No. Kad Pengenalan',", "ic_number: 'NRIC Number',");
content = content.replace("employee_id: 'No. Pekerja',", "employee_id: 'Staff ID',");
content = content.replace("jawatan: 'Jawatan Rasmi',", "jawatan: 'Official Designation',");
content = content.replace("role_id: 'Peranan / Akses',", "role_id: 'Role / Access Level',");
content = content.replace("role_assigned: 'Peranan Diberikan',", "role_assigned: 'Assigned Role',");
content = content.replace("department_id: 'Jabatan / Unit',", "department_id: 'Department / Unit',");
content = content.replace("hospital_id: 'Hospital',", "hospital_id: 'Hospital',");
content = content.replace("approver: 'Pegawai Pelulus',", "approver: 'Approving Officer',");
content = content.replace("reviewer: 'Pegawai Pemeriksa',", "reviewer: 'Reviewing Officer',");
content = content.replace("rejection_reason: 'Sebab Penolakan',", "rejection_reason: 'Rejection Reason',");
content = content.replace("temperature: 'Bacaan Suhu (°C)',", "temperature: 'Temperature (°C)',");
content = content.replace("humidity: 'Kelembapan (%)',", "humidity: 'Humidity (%)',");
content = content.replace("unit_name: 'Nama Unit / Peti Sejuk',", "unit_name: 'Unit / Refrigerator Name',");
content = content.replace("unit_id: 'Kod Unit',", "unit_id: 'Unit Code',");
content = content.replace("key_name: 'Nama Kunci',", "key_name: 'Key Name',");
content = content.replace("key_id: 'Kod Kunci',", "key_id: 'Key Code',");
content = content.replace("borrower: 'Nama Peminjam',", "borrower: 'Borrower Name',");
content = content.replace("purpose: 'Tujuan Penggunaan',", "purpose: 'Purpose of Access',");
content = content.replace("item_name: 'Nama Item / Bekalan',", "item_name: 'Item / Supply Name',");
content = content.replace("quantity: 'Kuantiti',", "quantity: 'Quantity',");
content = content.replace("po_number: 'No. Pesanan Tempatan (LO/PO)',", "po_number: 'Local Purchase Order (LPO) No.',");
content = content.replace("total_allocated: 'Jumlah Peruntukan (RM)',", "total_allocated: 'Total Allocation (RM)',");
content = content.replace("location: 'Lokasi / Wad',", "location: 'Location / Ward',");
content = content.replace("pressure_psi: 'Tekanan Gas (PSI)',", "pressure_psi: 'Gas Pressure (PSI)',");
content = content.replace("dose: 'Dos Ubat',", "dose: 'Medication Dose',");
content = content.replace("renal_adjustment: 'Pelarasan Dos Buah Pinggang',", "renal_adjustment: 'Renal Dose Adjustment',");
content = content.replace("staff_name: 'Nama Kakitangan',", "staff_name: 'Staff Name',");
content = content.replace("destination: 'Destinasi Penghantaran',", "destination: 'Delivery Destination',");
content = content.replace("urgency: 'Tahap Keutamaan',", "urgency: 'Priority Level',");
content = content.replace("permissions_count: 'Jumlah Hak Akses',", "permissions_count: 'Total Permissions',");
content = content.replace("added_permissions: 'Hak Akses Ditambah',", "added_permissions: 'Added Permissions',");

// Replace VALUE_LABELS
content = content.replace("duplicate: 'Duplikasi Rekod (Rekod Berganda)',", "duplicate: 'Duplicate Record',");
content = content.replace("completed: 'Selesai',", "completed: 'Completed',");
content = content.replace("pending: 'Menunggu Kelulusan',", "pending: 'Pending Approval',");
content = content.replace("active: 'Aktif',", "active: 'Active',");
content = content.replace("inactive: 'Tidak Aktif',", "inactive: 'Inactive',");
content = content.replace("approved: 'Diluluskan',", "approved: 'Approved',");
content = content.replace("rejected: 'Ditolak',", "rejected: 'Rejected',");
content = content.replace("in_use: 'Sedang Digunakan',", "in_use: 'In Use',");
content = content.replace("full: 'Penuh / Sedia Guna',", "full: 'Full / Ready',");
content = content.replace("empty: 'Kosong / Perlu Diisi',", "empty: 'Empty / Needs Refill',");
content = content.replace("routine: 'Rutin Biasa',", "routine: 'Routine',");
content = content.replace("urgent: 'Segera / Kecemasan',", "urgent: 'Urgent / Emergency',");
content = content.replace("normal: 'Normal / Selamat',", "normal: 'Normal / Safe',");
content = content.replace("system_admin: 'Pentadbir Sistem Utama (Super Admin)',", "system_admin: 'System Administrator (Super Admin)',");
content = content.replace("hospital_admin: 'Pentadbir Hospital',", "hospital_admin: 'Hospital Administrator',");
content = content.replace("pharmacist: 'Pegawai Farmasi',", "pharmacist: 'Pharmacist',");
content = content.replace("assistant_pharmacist: 'Penolong Pegawai Farmasi',", "assistant_pharmacist: 'Assistant Pharmacist',");
content = content.replace("storekeeper: 'Pembantu Khidmat Am Stor',", "storekeeper: 'Storekeeper',");

content = content.replace("val ? 'Ya (Aktif)' : 'Tidak (Batal)'", "val ? 'Yes (Active)' : 'No (Inactive)'");

// Human summary sentences
content = content.replace("const staffName = log.user?.full_name || 'Pegawai Sistem'", "const staffName = log.user?.full_name || 'System Operator'");
content = content.replace("const moduleName = MODULE_VISUALS[log.module?.toLowerCase()]?.label || log.module?.toUpperCase() || 'Sistem'", "const moduleName = MODULE_VISUALS[log.module?.toLowerCase()]?.label || log.module?.toUpperCase() || 'System'");
content = content.replace("return `${staffName} telah log masuk ke dalam sistem portal H.O.M.E.`", "return `${staffName} logged in to the H.O.M.E. ecosystem.`");
content = content.replace("return `${staffName} telah log keluar daripada sistem.`", "return `${staffName} logged out of the system.`");
content = content.replace("return `${staffName} telah membuka menu [${moduleName}].`", "return `${staffName} accessed menu [${moduleName}].`");
content = content.replace('return `${staffName} telah MEMADAM rekod pada modul ${moduleName} kerana "${reasonLabel}".`', 'return `${staffName} DELETED a record in ${moduleName} due to "${reasonLabel}".`');
content = content.replace('return `${staffName} telah MEMADAM satu rekod dalam modul ${moduleName}.`', 'return `${staffName} DELETED a record in ${moduleName}.`');
content = content.replace('return `Permohonan telah disemak dan DILULUSKAN oleh ${approver}.`', 'return `Request was reviewed and APPROVED by ${approver}.`');
content = content.replace('return `Permohonan telah DITOLAK oleh ${staffName}. Sebab penolakan: "${reason}".`', 'return `Request was REJECTED by ${staffName}. Reason: "${reason}".`');
content = content.replace('return `Permohonan telah DITOLAK oleh ${staffName}.`', 'return `Request was REJECTED by ${staffName}.`');
content = content.replace('return `${staffName} telah mencipta dan mendaftar satu rekod baharu dalam modul ${moduleName}.`', 'return `${staffName} created and registered a new record in ${moduleName}.`');
content = content.replace('return `${staffName} telah mengemaskini maklumat data dalam modul ${moduleName}.`', 'return `${staffName} updated data in ${moduleName}.`');
content = content.replace('return `${staffName} telah memuat turun / mengeksport fail laporan dari modul ${moduleName}.`', 'return `${staffName} downloaded / exported a report from ${moduleName}.`');
content = content.replace('return `Aktiviti ${action} telah direkodkan pada modul ${moduleName}.`', 'return `Activity ${action} was recorded in ${moduleName}.`');

// Relative time
content = content.replace("if (diffInSeconds < 60) return 'Baru sahaja'", "if (diffInSeconds < 60) return 'Just now'");
content = content.replace("return `${mins} minit lepas`", "return `${mins}m ago`");
content = content.replace("return `${hours} jam lepas`", "return `${hours}h ago`");
content = content.replace("if (days === 1) return 'Semalam'", "if (days === 1) return 'Yesterday'");
content = content.replace("return `${days} hari lepas`", "return `${days}d ago`");

// Toasts
content = content.replace("showError('Ralat', 'Gagal memuatkan rekod audit log.')", "showError('Error', 'Failed to load audit logs.')");
content = content.replace("showSuccess('Berjaya', 'Laporan Audit Log CSV berjaya dimuat turun.')", "showSuccess('Success', 'Audit Log CSV report successfully downloaded.')");
content = content.replace("showError('Ralat', 'Gagal mengeksport fail CSV.')", "showError('Error', 'Failed to export CSV file.')");
content = content.replace("showSuccess('Disalin', 'Metadata teknikal disalin ke papan keratan (clipboard).')", "showSuccess('Copied', 'Technical metadata copied to clipboard.')");

// Banner & KPI Cards
content = content.replace('<span>Rekod Audit Keselamatan & Ketelusan KKM</span>', '<span>MOH Security Audit & Transparency Trail</span>');
content = content.replace('Log Sistem & Jejak Aktiviti Kakitangan Hospital', 'System Logs & Staff Activity Trail');
content = content.replace('Pusat pemantauan telus untuk melihat kakitangan yang telah log masuk, capaian modul hospital, dan rekod aktiviti serta mutasi data dalam ekosistem H.O.M.E.', 'Centralized audit trail tracking staff authentication, hospital module access, and data modification across the H.O.M.E. ecosystem.');
content = content.replace('<p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Jumlah Rekod</p>', '<p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Total Records</p>');
content = content.replace('Audit tersimpan kekal', 'Permanent audit trail');
content = content.replace('<p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Sesi Log Masuk</p>', '<p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Login Sessions</p>');
content = content.replace('Kakitangan aktif', 'Active personnel');
content = content.replace('<p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Modul Dibuka</p>', '<p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Modules Visited</p>');
content = content.replace('Capaian modul', 'Module access');
content = content.replace('<p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Tindakan Data</p>', '<p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Data Actions</p>');
content = content.replace('Cipta, Kemaskini & Padam', 'Create, Update & Delete');

// Filter Toolbar
content = content.replace('placeholder="Cari nama kakitangan, no. IC, jawatan, modul, atau catatan..."', 'placeholder="Search staff name, IC number, designation, module, or remarks..."');
content = content.replace('aria-label="Kosongkan carian"', 'aria-label="Clear search"');
content = content.replace('title="Muat semula rekod audit"', 'title="Reload audit records"');
content = content.replace('<span>Segarkan</span>', '<span>Refresh</span>');
content = content.replace("<span>{isExporting ? 'Mengeksport...' : 'Muat Turun CSV'}</span>", "<span>{isExporting ? 'Exporting...' : 'Download CSV'}</span>");
content = content.replace('Pilihan Modul / Menu', 'Module / Menu Filter');
content = content.replace('<option value="all">Semua Modul Hospital</option>', '<option value="all">All Hospital Modules</option>');
content = content.replace('Jenis Aktiviti / Tindakan', 'Activity / Action Type');
content = content.replace('<option value="all">Semua Jenis Aktiviti</option>', '<option value="all">All Activity Types</option>');
content = content.replace('<option value="LOGIN_LOGOUT">Log Masuk & Keluar (LOGIN / LOGOUT)</option>', '<option value="LOGIN_LOGOUT">Login & Logout (LOGIN / LOGOUT)</option>');
content = content.replace('<option value="NAVIGATION">Buka Halaman / Menu (VIEW)</option>', '<option value="NAVIGATION">Page / Menu View (VIEW)</option>');
content = content.replace('<option value="CREATE">Cipta Rekod Baru (CREATE)</option>', '<option value="CREATE">Create New Record (CREATE)</option>');
content = content.replace('<option value="UPDATE">Kemaskini Maklumat (UPDATE)</option>', '<option value="UPDATE">Update Record (UPDATE)</option>');
content = content.replace('<option value="DELETE">Padam Rekod (DELETE)</option>', '<option value="DELETE">Delete Record (DELETE)</option>');
content = content.replace('<option value="APPROVE_REJECT">Kelulusan & Penolakan (APPROVE / REJECT)</option>', '<option value="APPROVE_REJECT">Approvals & Rejections (APPROVE / REJECT)</option>');
content = content.replace('<option value="EXPORT">Muat Turun Laporan (EXPORT)</option>', '<option value="EXPORT">Export Reports (EXPORT)</option>');
content = content.replace('Kakitangan / Pengguna', 'Staff / User');
content = content.replace('<option value="all">Semua Kakitangan</option>', '<option value="all">All Personnel</option>');
content = content.replace('Tempoh Masa', 'Time Period');
content = content.replace('Semua\n              </button>', 'All\n              </button>');
content = content.replace('Hari Ini\n              </button>', 'Today\n              </button>');
content = content.replace('7 Hari\n              </button>', '7 Days\n              </button>');
content = content.replace('30 Hari\n              </button>', '30 Days\n              </button>');
content = content.replace('Tapisan Aktif:', 'Active Filters:');
content = content.replace('Carian: &quot;{search}&quot;', 'Search: &quot;{search}&quot;');
content = content.replace('Modul: {MODULE_VISUALS[moduleFilter]?.label || moduleFilter}', 'Module: {MODULE_VISUALS[moduleFilter]?.label || moduleFilter}');
content = content.replace('Aktiviti: {actionFilter}', 'Action: {actionFilter}');
content = content.replace('Kakitangan Khusus', 'Specific Staff');
content = content.replace('Tarikh: {datePreset}', 'Date: {datePreset}');
content = content.replace('Kosongkan Semua Tapisan', 'Clear All Filters');

// Table Headers & Empty States
content = content.replace('Garis Masa Aktiviti ({totalRecords} Rekod)', 'Activity Timeline ({totalRecords} Records)');
content = content.replace('Halaman {page} / {totalPages}', 'Page {page} of {totalPages}');
content = content.replace('Tiada Rekod Dijumpai', 'No Records Found');
content = content.replace('Tiada aktiviti yang sepadan dengan kriteria carian atau tapisan yang dipilih.', 'No activities match the search or filter criteria.');
content = content.replace('Tetap Semula Tapisan', 'Reset Filters');
content = content.replace('<th className="p-3.5 sm:p-4 w-48">Masa & Tarikh</th>', '<th className="p-3.5 sm:p-4 w-48">Timestamp & Date</th>');
content = content.replace('<th className="p-3.5 sm:p-4 w-64">Nama Pegawai / Staf</th>', '<th className="p-3.5 sm:p-4 w-64">Officer / Staff Name</th>');
content = content.replace('<th className="p-3.5 sm:p-4 w-44">Modul / Menu</th>', '<th className="p-3.5 sm:p-4 w-44">Module / Section</th>');
content = content.replace('<th className="p-3.5 sm:p-4">Ringkasan Tindakan & Aktiviti</th>', '<th className="p-3.5 sm:p-4">Action & Activity Summary</th>');
content = content.replace('<th className="p-3.5 sm:p-4 w-36">Peranti / IP</th>', '<th className="p-3.5 sm:p-4 w-36">Device / IP</th>');
content = content.replace('<th className="p-3.5 sm:p-4 text-right w-24">Tindakan</th>', '<th className="p-3.5 sm:p-4 text-right w-24">Action</th>');
content = content.replaceAll("<span>Perincian</span>", "<span>Details</span>");
content = content.replace("Menunjukkan {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalRecords)} daripada {totalRecords} rekod", "Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalRecords)} of {totalRecords} records");
content = content.replace("<span>Sebelumnya</span>", "<span>Previous</span>");
content = content.replace("<span>Seterusnya</span>", "<span>Next</span>");

// Modal Translations
content = content.replace('Rekod Audit #{selectedLog.id}', 'Audit Record #{selectedLog.id}');
content = content.replace('Disahkan KKM', 'MOH Verified');
content = content.replace('Perincian Tindakan & Jejak Aktiviti', 'Action Details & Activity Trail');
content = content.replace('Tarikh: {formatDateTime(selectedLog.created_at)} ({formatRelativeTimeMalay(selectedLog.created_at)})', 'Timestamp: {formatDateTime(selectedLog.created_at)} ({formatRelativeTimeMalay(selectedLog.created_at)})');
content = content.replace('aria-label="Tutup tetingkap"', 'aria-label="Close modal"');
content = content.replace('Ringkasan Tindakan Pegawai', 'Staff Action Summary');
content = content.replace('Maklumat Pegawai / Staf', 'Staff / Officer Profile');
content = content.replace('Nama Penuh:', 'Full Name:');
content = content.replace('No. IC / Pekerja:', 'IC / Staff ID:');
content = content.replace('Jawatan:', 'Designation:');
content = content.replace('Pegawai Bertugas', 'Duty Officer');
content = content.replace('Alamat Emel:', 'Email Address:');
content = content.replace('Modul & Lokasi Capaian', 'Module & Access Location');
content = content.replace('Modul / Bahagian:', 'Module / Section:');
content = content.replace('Jenis Tindakan:', 'Action Type:');
content = content.replace('Alamat IP:', 'IP Address:');
content = content.replace('Peranti Digunakan:', 'Device Used:');
content = content.replace('Komputer Apple Mac (macOS)', 'Apple Mac (macOS)');
content = content.replace('Telefon Pintar iPhone (iOS)', 'iPhone Smartphone (iOS)');
content = content.replace('Komputer Windows (PC Hospital)', 'Windows PC (Hospital Workstation)');
content = content.replace('Pelayar Web', 'Web Browser');
content = content.replace('Perincian Maklumat & Perubahan Data', 'Information Details & Data Mutations');
content = content.replace('Nilai Asal / Terdahulu:', 'Previous / Initial Value:');
content = content.replace('Tiada rekod lama (Tindakan Rekod Baharu)', 'No prior record (New Record Creation)');
content = content.replace('Nilai Terkini / Catatan Tindakan:', 'Current Value / Action Record:');
content = content.replace('Tiada maklumat tambahan', 'No additional details');
content = content.replace("showTechnicalJson ? 'Sembunyikan Format JSON' : 'Papar Format JSON (Teknikal IT)'", "showTechnicalJson ? 'Hide Raw JSON' : 'View Raw JSON (Technical IT)'");
content = content.replace("<span>{isCopied ? 'Disalin' : 'Salin Data Log'}</span>", "<span>{isCopied ? 'Copied' : 'Copy Log JSON'}</span>");
content = content.replace('>Tutup</button>', '>Close</button>');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully translated AdminSystemLogsTab.tsx to 100% English!');
