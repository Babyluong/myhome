# Pelan Seni Bina & Pelaksanaan: Katalog Induk Persediaan Dalaman (Oral Galenikal/Ekstemporanus) & Persediaan Luaran (Topikal/Antiseptik/Pencairan) KKM Malaysia

**Versi Dokumen:** 2.0.0  
**Modul Sasaran:** `MyPrepacking` (Katalog Persediaan Dalaman, Persediaan Luaran, Unit Galenikal & Pembungkusan Semula)  
**Pengarang:** Senior Staff Systems & Infrastructure Engineer (Google/Enterprise Tier)  
**Status:** Menunggu Kelulusan Pengguna (*Pending Approval*)  
**Pematuhan Mandat:**
- Panduan Amalan Pembancuhan Ekstemporanus Farmasi KKM (*Good Preparation Practice - GPP KKM*)
- Akta Racun 1952 & Peraturan-Peraturan Racun (Bahan Psikotropik) 1989
- Akta Dadah Berbahaya 1952 (*Dangerous Drugs Act - DDA*) untuk Morfin Akueus
- Standard Kawalan Jangkitan & Garis Panduan Antiseptik/Disinfektan Hospital KKM
- Mandat Ketat *Zero-Mock & 100% Real Database Parity* (`.agents/AGENTS.md`)
- Standard Reka Bentuk *Anti-Slop & Luxury UI (Linear/Stripe Grade)* (`.agents/skills/luxury-ui/SKILL.md`)

---

## 1. Ringkasan Eksekutif & Justifikasi Klinikal

### 1.1 Masalah Operasi di Hospital KKM
Dalam amalan farmasi hospital Kementerian Kesihatan Malaysia (seperti Hospital Lawas), **Persediaan Dalaman** (*Internal / Oral Compounding*) dan **Persediaan Luaran** (*External / Topical Antiseptics & Dilutions*) mempunyai ciri unik yang **tidak terdapat dalam katalog ubat komersial biasa (MyInventory / Formulari Komersial)**:

1. **Bukan Ubat Siap Kilang (*Commercial Finished Product*)**:
   - Ubat seperti **Aqueous Morphine**, **Sirap Ringkas BP**, **Campuran Sodium Bikarbonat**, dan **Campuran Kalium Klorida** dibancuh sendiri oleh unit galenikal/ekstemporanus farmasi menggunakan serbuk bahan aktif asas (*raw Active Pharmaceutical Ingredients - API*), sirap pembawa, atau stok pekat.
   - Cecair antiseptik seperti **Alcohol 70%**, **Alcohol 70% with 0.5% Chlorhexidine**, **Chlorhexidine 1:200**, **Acriflavine 0.1%**, dan **Potassium Permanganate (KMnO4) 1:8000** dihasilkan melalui proses pencairan pukal (*bulk dilution*) dari stok industri (contoh: IMS 95% atau Chlorhexidine 20% pekat).
2. **Kekosongan Rekod dalam Katalog Semasa**:
   - Oleh kerana item ini tiada dalam senarai pembekal komersial, tab *Persediaan Dalaman* dan *Persediaan Luaran* kini memaparkan `0 Item` (rujuk imej pengguna).
   - Mengharuskan pegawai farmasi menaip satu persatu setiap formula, ramuan, BUD (*Beyond-Use Date*), dan arahan penyimpanan dari awal adalah tidak praktikal, melambatkan operasi, dan terdedah kepada kesilapan transkripsi dos klinikal.
3. **Keperluan Sistem Aktifkan / Nyahaktifkan (*Facility-Level Toggle*)**:
   - Tidak semua hospital menghasilkan setiap satu formula. Hospital Daerah (seperti Hospital Lawas) mungkin hanya membancuh 10 daripada 40 formula kebangsaan (contoh: aktifkan Morfin Akueus dan Alkohol 70%, tetapi nyahaktifkan Formalin 10% atau Kaptopril Sirap).
   - Pengguna memerlukan satu **suis togol pantas (Aktif / Nyahaktif)** bagi setiap formula rasmi KKM. Apabila diaktifkan, formula tersebut terus muncul dalam barisan produksi batch (*prepack batches*), lejar Kad Petak KEW.PS-4, dan studio cetakan label.

---

## 2. Rajah ASCII: Topologi & Aliran Aliran Kerja Sistem

### 2.1 Aliran Kerja Galenikal, Pembancuhan & Pengaktifan Hospital KKM

```
+====================================================================================================+
|                     ALIRAN KERJA FORMULASI GALENIKAL & EKSTEMPORANUS KKM                           |
+====================================================================================================+

   [ Pangkalan Data Induk Formulasi KKM (40+ Formula Rasmi Kebangsaan) ]
   (Aqueous Morphine, Alcohol 70%, Chlorhexidine, Sodium Bicarb, Acriflavine, dll.)
                                    |
                                    | Sinkronisasi Automatik ke Fasiliti (Supabase: prepack_items)
                                    v
+----------------------------------------------------------------------------------------------------+
|                         PENGURUSAN KATALOG FASILITI HOSPITAL LAWAS                                  |
|                                                                                                    |
|    Tab: Persediaan Dalaman (Oral)                   Tab: Persediaan Luaran (Topikal/Antiseptik)    |
|    ---------------------------------------          -------------------------------------------    |
|    [✓] Morfin Akueus 10mg/5ml  --> AKTIF            [✓] Alcohol 70%               --> AKTIF        |
|    [✓] Sirap Ringkas BP        --> AKTIF            [✓] Chlorhexidine 0.5% in 70% --> AKTIF        |
|    [ ] Kaptopril 1mg/ml        --> NYAHAKTIF        [✓] Acriflavine 0.1% Lotion   --> AKTIF        |
|    [ ] Fenobarbital 20mg/5ml   --> NYAHAKTIF        [ ] Formalin 10% Penimbal     --> NYAHAKTIF    |
+----------------------------------------------------------------------------------------------------+
                                    |
          +-------------------------+-------------------------+
          | (Hanya formula berstatus 'active' dipaparkan)     |
          v                                                   v
+-----------------------------------+   +------------------------------------------------------------+
|   PENGELUARAN BATCH (PREPACK)     |   |               STUDIO CETAKAN LABEL PEK & BOTOL             |
|   - PrepackBatchCreateModal       |   |   - Label Amber (Dalaman: "UNTUK KEGUNAAN DALAMAN")        |
|   - Kiraan bahan mentah & kuantiti|   |   - Label Merah (Luaran: "UNTUK KEGUNAAN LUAR SAHAJA")     |
|   - Rekod Nombor Batch & BUD KKM  |   |   - Kod QR & Standard Akta Racun / Dadah Berbahaya         |
+-----------------------------------+   +------------------------------------------------------------+
                                    |
                                    v
+----------------------------------------------------------------------------------------------------+
|                      LEJAR KAD PETAK KEW.PS-4 & AGIHAN WAD / KLINIK                                |
|   - Agihan ke Wad Lelaki, Wad Perempuan, Farmasi Pesakit Luar, ETU, OT                             |
+----------------------------------------------------------------------------------------------------+
```

### 2.2 Reka Bentuk Antaramuka (*UI Wireframe*) Tab Persediaan Dalaman & Luaran

```
+----------------------------------------------------------------------------------------------------+
|  [ Kad Induk Modul: Persediaan Dalaman / Luaran ]                                                  |
|                                                                                                    |
|  [ Persediaan Dalaman (14 Aktif / 20) ]    [ Persediaan Luaran (16 Aktif / 22) ]                   |
|                                                                                                    |
|  +----------------------------------------------------------------------------------------------+  |
|  | [🔍 Cari formula, kod item, atau bahan aktif...]   [Penapis: Semua | Aktif Sahaja | Nyahaktif] |  |
|  +----------------------------------------------------------------------------------------------+  |
|                                                                                                    |
|  SENARAI FORMULASI STANDARD KKM (DISEGERIKAN KE PANGKALAN DATA SUPABASE):                          |
|  +--------------+---------------------------------------+-------------+----------+--------------+  |
|  | KOD ITEM     | NAMA PERSEDIAAN & FORMULA             | KEKUATAN    | BUD      | STATUS GUNA  |  |
|  +--------------+---------------------------------------+-------------+----------+--------------+  |
|  | INT-MORF-001 | Aqueous Morphine Mixture              | 10 mg/5 ml  | 14 Hari  | [  AKTIF  ●] |  |
|  |              | Bahan: Morphine HCl + Syrup BP + Aq   | (Botol Amber)          |              |  |
|  +--------------+---------------------------------------+-------------+----------+--------------+  |
|  | INT-SOD-002  | Sodium Bicarbonate Mixture BP         | 1 g/10 ml   | 1 Bulan  | [  AKTIF  ●] |  |
|  |              | Bahan: NaHCO3 + Aq Menth Pip          | (Botol Kaca)           |              |  |
|  +--------------+---------------------------------------+-------------+----------+--------------+  |
|  | EXT-ALC-001  | Alcohol 70% v/v (Pencairan Etanol)    | 70% v/v     | 6 Bulan  | [  AKTIF  ●] |  |
|  |              | Bahan: IMS/Etanol 95% + Air Suling    | (Botol HD)             |              |  |
|  +--------------+---------------------------------------+-------------+----------+--------------+  |
|  | EXT-CHX-002  | Chlorhexidine 0.5% in 70% Alcohol     | 0.5% w/v    | 3 Bulan  | [  AKTIF  ●] |  |
|  |              | Bahan: CHX 20% + Etanol 70% + Pewarna | (Skin Prep)            |              |  |
|  +--------------+---------------------------------------+-------------+----------+--------------+  |
|  | EXT-ACR-003  | Acriflavine 0.1% Lotion (Losyen Kuning)| 0.1% w/v   | 6 Bulan  | [  AKTIF  ●] |  |
|  |              | Bahan: Acriflavine serbuk + Air Suling| (Topikal)              |              |  |
|  +--------------+---------------------------------------+-------------+----------+--------------+  |
|  | EXT-FOR-010  | Formalin 10% Neutral Buffered         | 10% v/v     | 1 Tahun  | [○ NYAHAKTIF]|  |
|  |              | (Spesimen Makmal Histopatologi)       | (Botol Khas)           |              |  |
|  +--------------+---------------------------------------+-------------+----------+--------------+  |
|                                                                                                    |
|  [⚡ Aktifkan Semua]   [⚡ Nyahaktifkan Semua]            Paparan: 20 rekod formulasi kebangsaan   |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Penyelidikan Mendalam: Pangkalan Data Induk Formulasi KKM (*Research Database*)

Kami telah mengkompilasikan spesifikasi formulasi rasmi KKM merangkumi 42 persediaan standard yang diguna pakai di hospital-hospital seluruh Malaysia:

### 3.1 Persediaan Dalaman (Oral Galenikal & Ekstemporanus) — 20 Formulasi Utama

| No | Kod Item KKM | Nama Formulasi & Spesifikasi | Kekuatan / Dos | Bentuk Dos | Bekas Pembungkusan | Hayat Simpanan (BUD) | Arahan Khas & Label Mandatori |
|:---|:---|:---|:---|:---|:---|:---|:---|
| 1 | `INT-MORF-001` | **Aqueous Morphine Mixture 10 mg / 5 ml** | 10 mg / 5 ml | Sirap / Larutan | Botol Amber Kaca | 14 Hari (atau 1 Bulan berpenyejuk) | RACUN BERBAHAYA (DDA). Simpan terlindung cahaya. |
| 2 | `INT-MORF-002` | **Aqueous Morphine Mixture 5 mg / 5 ml** | 5 mg / 5 ml | Sirap / Larutan | Botol Amber Kaca | 14 Hari | RACUN BERBAHAYA (DDA). Simpan terlindung cahaya. |
| 3 | `INT-MORF-003` | **Aqueous Morphine Mixture 2 mg / 5 ml** | 2 mg / 5 ml | Sirap / Larutan | Botol Amber Kaca | 14 Hari | RACUN BERBAHAYA (DDA). Dos rendah paliatif. |
| 4 | `INT-SYR-001` | **Syrupus Simplex BP (Sirap Ringkas 66.7%)** | 66.7% w/w | Sirap Pembawa | Botol Amber Plastik | 3 Bulan | Pembawa manis asas bagi bancuhan oral ekstemporanus. |
| 5 | `INT-SOD-001` | **Sodium Bicarbonate Mixture BP (Mixtura Sodii Bicarb)** | 1 g / 10 ml | Larutan Oral | Botol Amber | 1 Bulan | Goncang sebelum guna. Pengalkali air kencing & antasid. |
| 6 | `INT-POT-001` | **Potassium Chloride Mixture (Mixtura Kalii Chloridi)** | 1 g / 10 ml (13.4 mmol K+) | Sirap / Larutan | Botol Amber | 1 Bulan | Ambil selepas makan. Elakkan ketidakselesaan gastrik. |
| 7 | `INT-MMT-001` | **Magnesium Trisilicate Mixture BP (MMT)** | Standard BP | Suspensi Oral | Botol Amber | 1 Bulan | Goncang sebelum guna. Antasid refluks & gastritis. |
| 8 | `INT-CHL-001` | **Chloral Hydrate Elixir / Solution** | 500 mg / 5 ml | Larutan Oral | Botol Amber | 14 Hari | Sedasi prosedur pediatrik. Simpan bawah 25°C. |
| 9 | `INT-PCM-001` | **Paediatric Paracetamol Suspension** | 120 mg / 5 ml | Suspensi Oral | Botol Amber | 1 Bulan | Goncang dengan baik sebelum setiap dos. |
| 10 | `INT-SPN-001` | **Spironolactone Paediatric Suspension** | 5 mg / ml | Suspensi Oral | Botol Amber | 60 Hari (Peti sejuk 2-8°C) | Rawatan kegagalan jantung & edema neonat. |
| 11 | `INT-SIL-001` | **Sildenafil Paediatric Suspension** | 2.5 mg / ml | Suspensi Oral | Botol Amber | 30 Hari | Hipertensi pulmonari pediatrik. Lindungi cahaya. |
| 12 | `INT-OMP-001` | **Omeprazole Oral Suspension (in 8.4% NaHCO3)** | 2 mg / ml | Suspensi Oral | Botol Amber | 14 Hari (Peti sejuk 2-8°C) | Goncang sebelum guna. Simpan sentiasa dalam peti sejuk. |
| 13 | `INT-FUR-001` | **Furosemide Oral Solution / Suspension** | 2 mg / ml | Larutan Oral | Botol Amber | 30 Hari | Diuretik pediatrik. Lindungi dari cahaya. |
| 14 | `INT-CAP-001` | **Captopril Oral Solution (with Ascorbic Acid)** | 1 mg / ml | Larutan Oral | Botol Amber | 14 Hari (Peti sejuk 2-8°C) | Antihipertensi pediatrik. Cepat teroksida jika panas. |
| 15 | `INT-PHN-001` | **Phenobarbital Oral Solution** | 20 mg / 5 ml | Larutan Oral | Botol Amber | 1 Bulan | Antikonvulsan. Simpan terlindung cahaya. |
| 16 | `INT-UDC-001` | **Ursodeoxycholic Acid (UDCA) Suspension** | 50 mg / ml | Suspensi Oral | Botol Amber | 30 Hari | Rawatan kolestasis hepatik neonat/kanak-kanak. |
| 17 | `INT-HCT-001` | **Hydrochlorothiazide Paediatric Suspension** | 2 mg / ml | Suspensi Oral | Botol Amber | 30 Hari | Diuretik tiazida pediatrik. Goncang sebelum guna. |
| 18 | `INT-PRP-001` | **Propranolol Paediatric Oral Solution** | 1 mg / ml | Larutan Oral | Botol Amber | 30 Hari | Rawatan hemangioma infantil & aritmia. |
| 19 | `INT-ZNC-001` | **Zinc Sulphate Oral Solution** | 10 mg Zn / 5 ml | Larutan Oral | Botol Amber | 1 Bulan | Suplemen zink untuk cirit-birit pediatrik. |
| 20 | `INT-CIT-001` | **Citric Acid & Sodium Citrate Solution (Bicitra)** | 1 mmol Na / ml | Larutan Oral | Botol Kaca | 3 Bulan | Rawatan asidosis metabolik & batu karang asid urik. |

---

### 3.2 Persediaan Luaran (Topikal, Antiseptik, Pencairan & Losyen) — 22 Formulasi Utama

| No | Kod Item KKM | Nama Formulasi & Spesifikasi | Kekuatan / Dos | Bentuk Dos | Bekas Pembungkusan | Hayat Simpanan (BUD) | Arahan Khas & Label Mandatori |
|:---|:---|:---|:---|:---|:---|:---|:---|
| 1 | `EXT-ALC-001` | **Alcohol 70% v/v (Pencairan Etanol Tulen)** | 70% v/v | Cecair Topikal | Botol HDPE / Kaca | 6 Bulan | UNTUK KEGUNAAN LUAR SAHAJA. MUDAH TERBAKAR. |
| 2 | `EXT-ALC-002` | **Alcohol 70% with Chlorhexidine Gluconate 0.5% (Skin Prep)** | 0.5% w/v in 70% | Cecair Topikal (Merah Jambu/Jernih) | Botol HDPE | 3 Bulan | UNTUK KEGUNAAN LUAR SAHAJA. Antiseptik kulit pra-pembedahan. |
| 3 | `EXT-CHX-001` | **Chlorhexidine Gluconate 2% in 70% Alcohol** | 2% w/v in 70% | Cecair Topikal | Botol HDPE | 3 Bulan | UNTUK KEGUNAAN LUAR SAHAJA. Prosedur 'Central Line Bundle'. |
| 4 | `EXT-CHX-002` | **Chlorhexidine 4% Surgical Scrub (Sentalan Pembedahan)** | 4% w/v | Sabun Cecair Antiseptik | Botol Pam Dispenser | 6 Bulan | UNTUK KEGUNAAN LUAR SAHAJA. Sentalan tangan pembedahan OT. |
| 5 | `EXT-CHX-003` | **Chlorhexidine 1:200 Aqueous Solution (0.05% w/v)** | 0.05% w/v (1:200) | Larutan Akueus | Botol Kaca Steril | 1 Bulan | UNTUK KEGUNAAN LUAR SAHAJA. Cuci luka & irigasi. |
| 6 | `EXT-CHX-004` | **Chlorhexidine 1:20 Aqueous Concentrated Stock** | 0.5% w/v (1:20) | Larutan Pekat | Botol HDPE | 3 Bulan | UNTUK KEGUNAAN LUAR SAHAJA. Disinfeksi peralatan wad. |
| 7 | `EXT-ACR-001` | **Acriflavine 0.1% Lotion (Losyen Kuning / Yellow Lotion)** | 0.1% w/v | Losyen Antiseptik | Botol Kaca Amber | 6 Bulan | UNTUK KEGUNAAN LUAR SAHAJA. Rawatan luka melecur & antiseptik. |
| 8 | `EXT-KMN-001` | **Potassium Permanganate (KMnO4) Solution 1:8,000** | 1:8,000 w/v | Larutan Topikal Ungu | Botol Kaca Amber | 14 Hari | UNTUK KEGUNAAN LUAR SAHAJA. Rendaman ekzema & jangkitan kulat. |
| 9 | `EXT-KMN-002` | **Potassium Permanganate (KMnO4) Solution 1:10,000** | 1:10,000 w/v | Larutan Topikal Ungu Cair | Botol Kaca Amber | 14 Hari | UNTUK KEGUNAAN LUAR SAHAJA. Basuhan luka lembut. |
| 10 | `EXT-NSL-001` | **Normal Saline (Sodium Chloride 0.9%) for Irrigation** | 0.9% w/v | Larutan Irigasi Steril | Botol Pengairan 500ml | 24 Jam selepas buka | UNTUK KEGUNAAN LUAR SAHAJA. Cuci luka & pundi kencing. |
| 11 | `EXT-PVI-001` | **Povidone Iodine 10% Solution (Akueus)** | 10% w/v | Larutan Antiseptik | Botol Amber | 6 Bulan | UNTUK KEGUNAAN LUAR SAHAJA. Basuhan luka septic. |
| 12 | `EXT-PVI-002` | **Povidone Iodine 1% Dilution (1:10)** | 1% w/v | Larutan Akueus Cair | Botol Amber | 14 Hari | UNTUK KEGUNAAN LUAR SAHAJA. Irigasi mukosa & luka sensitif. |
| 13 | `EXT-H2O-001` | **Hydrogen Peroxide 3% Solution (10 Volume)** | 3% w/v (10 vol) | Larutan Topikal | Botol Gelap | 1 Bulan | UNTUK KEGUNAAN LUAR SAHAJA. Debridemen tisu luka bernanah. |
| 14 | `EXT-H2O-002` | **Hydrogen Peroxide 6% Solution (20 Volume)** | 6% w/v (20 vol) | Larutan Topikal | Botol Gelap | 1 Bulan | UNTUK KEGUNAAN LUAR SAHAJA. Pembersihan luka kronik. |
| 15 | `EXT-SAL-001` | **Salicylic Acid 2% in Aqueous Cream / WSP** | 2% w/w | Salap / Krim | Jar Bekas Salap | 3 Bulan | UNTUK KEGUNAAN LUAR SAHAJA. Keratolitik ekzema & psoriasis. |
| 16 | `EXT-SAL-002` | **Salicylic Acid 5% in White Soft Paraffin** | 5% w/w | Salap | Jar Bekas Salap | 3 Bulan | UNTUK KEGUNAAN LUAR SAHAJA. Psoriasis plak tebal. |
| 17 | `EXT-LPC-001` | **Coal Tar Ointment (LPC 5% in White Soft Paraffin)** | 5% w/w | Salap Hitam | Jar Bekas Salap | 3 Bulan | UNTUK KEGUNAAN LUAR SAHAJA. Terapi psoriasis kronik. |
| 18 | `EXT-ZNC-001` | **Zinc Oxide Paste BP (Pasta Zink 25%)** | 25% w/w | Pes Tebal | Jar Bekas Salap | 6 Bulan | UNTUK KEGUNAAN LUAR SAHAJA. Perlindungan kulit ruam lampin/stoma. |
| 19 | `EXT-URE-001` | **Urea 10% in Aqueous Cream** | 10% w/w | Krim Pelembap | Jar Bekas Krim | 3 Bulan | UNTUK KEGUNAAN LUAR SAHAJA. Rawatan iktiosis & xerosis teruk. |
| 20 | `EXT-LPW-001` | **Liquid Paraffin 50% in White Soft Paraffin (50:50 Ointment)**| 50:50 w/w | Salap Emolien | Jar Bekas Salap | 6 Bulan | UNTUK KEGUNAAN LUAR SAHAJA. Emolien intensif ekzema atopik. |
| 21 | `EXT-CAL-001` | **Calamine Lotion BP** | Standard BP | Losyen Topikal | Botol Amber | 6 Bulan | UNTUK KEGUNAAN LUAR SAHAJA. Goncang sebelum guna. Rawatan gatal. |
| 22 | `EXT-HYP-001` | **Sodium Hypochlorite 0.5% (Pencairan Klorin 1:10)** | 0.5% w/v Chlorine | Cecair Disinfektan | Botol HDPE | 7 Hari | BANCUHAN SEGAR. Tumpahan darah & dekontaminasi permukaan. |

---

## 4. Seni Bina Teknikal & Pelaksanaan

### 4.1 Komponen & Fail Yang Terlibat

1. **`src/modules/myprepacking/data/kkmGalenicalMasterDatabase.ts` (Fail Data Induk Baharu)**:
   - Mengandungi kamus lengkap 42 persediaan standard KKM di atas bersama kod, nama rasmi, ramuan aktif, kekuatan, BUD, dan arahan label.
2. **`src/modules/myprepacking/services/prepackService.ts`**:
   - Fungsi `syncHospitalGalenicalCatalog(hospitalId)`: Memasukkan semua 42 formulasi ini ke dalam pangkalan data `prepack_items` Supabase bagi hospital aktif jika rekod belum wujud.
   - Fungsi `togglePrepackItemActiveStatus(itemId, newStatus)`: Mengemaskini status `active` $\leftrightarrow$ `inactive` dalam masa nyata pada Supabase.
   - Fungsi `bulkUpdateGalenicalStatus(hospitalId, packType, newStatus)`: Membolehkan operasi *Aktifkan Semua* atau *Nyahaktifkan Semua* dengan satu klik.
3. **`src/modules/myprepacking/pages/PrepackItemListPage.tsx`**:
   - Menghapuskan kekosongan rekod dengan memuatkan senarai induk KKM.
   - Penambahan lajur **Status Penggunaan Fasiliti (*Facility Activation Toggle*)** dengan suis togol moden (*switch slider* bergaya Linear/Apple).
   - Penapis pintar: `Semua (20)`, `Aktif Sahaja (14)`, `Tidak Digunakan (6)`.
   - Lencana ringkasan di tab atas: memaparkan nisbah aktif, contohnya `Persediaan Dalaman (14 Aktif)`.
4. **`src/modules/myprepacking/components/PrepackItemModal.tsx`**:
   - Menambah pilihan carian pantas daripada Katalog Galenikal KKM apabila berada dalam mod `internal` atau `external`.

---

## 5. Skop Pelaksanaan

### Perkara Yang AKAN Dibuat:
- [x] Menyediakan kamus data rasmi KKM lengkap bagi 42 persediaan dalaman dan luaran.
- [x] Menyegerakan data induk ke jadual `prepack_items` Supabase dengan pematuhan *Zero-Mock Mandate*.
- [x] Menyediakan suis togol Aktif / Nyahaktif pantas pada setiap baris item dalam paparan senarai.
- [x] Menyediakan butang *Aktifkan Semua* / *Nyahaktifkan Semua* bagi kemudahan fasiliti.
- [x] Mengintegrasikan status aktif secara langsung ke dalam modal pembuatan batch (`PrepackBatchCreateModal`) supaya hanya item yang aktif boleh dibancuh.

### Perkara Yang TIDAK Dibuat (*Out of Scope*):
- Tidak mengubah logik modul `MyInventory` komersial (item ini kekal di bawah pengurusan `MyPrepacking` & Galenikal).
- Tidak mencipta rekod pengguna atau audit palsu.

---

## 6. Andaian & Risiko

### Andaian:
1. Hospital Lawas menggunakan kod piawai `INT-XXX` bagi persediaan dalaman dan `EXT-XXX` bagi persediaan luaran untuk membezakan daripada kod komersial `D02.XXXX`.
2. Semua persediaan luaran diwajibkan menggunakan amaran teks merah mengikut undang-undang racun KKM.

### Risiko & Mitigasi:
- **Risiko**: Pertembungan `item_code` jika hospital telah mendaftar kod yang sama secara manual.  
  **Mitigasi**: Logik *upsert* memeriksa kewujudan `item_code` dan `hospital_id` sebelum menyuntik data induk.

---

Ready to proceed — should I go ahead?
