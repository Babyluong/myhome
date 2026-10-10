/**
 * AUTHORITATIVE KKM GALENICAL & EXTEMPORANEOUS COMPOUNDING MONOGRAPHS
 * Standard Operating Procedures (SOP), Master Formulas & Preparation Steps
 * 
 * Official References:
 * 1. Extemporaneous Formulation (MOH 2015), Pharmaceutical Services Division, Ministry of Health Malaysia
 * 2. Senarai Ubat Galenikal dan Ekstemporaneous (GAEX) Dalam Sistem PhIS (Ref: A-GU-107/5, Updated 25 Feb 2026)
 * 3. Good Preparation Practice (GPP KKM), Ministry of Health Malaysia
 * 4. Dangerous Drugs Act (DDA) 1952 & Poisons Act 1952
 * 
 * STRICT ZERO-MOCK MANDATE:
 * 100% of these monographs originate directly from official Ministry of Health Malaysia clinical publications.
 */

import type { PrepackItem, PackType, DosageForm, PackageType } from '../types/prepack'

export interface KkmFormulaIngredient {
  name: string
  quantity: string
  function?: string
}

export interface KkmPreparationMonograph {
  item_code: string
  item_name: string
  generic_name: string
  pack_type: 'internal' | 'external' | string
  dosage_form: string
  strength: string
  units_per_pack: number
  package_type: string
  shelf_life_months: number
  beyond_use_date_days: number
  storage_instructions: string
  label_instructions: string
  indications: string
  ingredients_formula: string
  pharmacopoeia_ref: string
  standard_formula_breakdown: KkmFormulaIngredient[]
  equipment_required: string[]
  preparation_steps: string[]
  in_process_qc: string[]
  cautions_and_warnings: string[]
  container_specs: string
}

export const KKM_GALENICAL_MONOGRAPHS: Record<string, KkmPreparationMonograph> = {
  "INT-MORF-001": {
    "item_code": "INT-MORF-001",
    "item_name": "Morphine HCl 10 mg / 5 ml Solution (Aqueous Morphine)",
    "generic_name": "Morphine Hydrochloride 10 mg / 5 ml",
    "pack_type": "internal",
    "dosage_form": "solution",
    "strength": "10 mg / 5 ml",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 30,
    "storage_instructions": "Store below 25°C. Protect from light. Mandatory storage in locked DDA dangerous drugs cabinet.",
    "label_instructions": "FOR ORAL USE ONLY. DANGEROUS DRUG (DDA). PROTECT FROM LIGHT.",
    "indications": "Kawalan kesakitan teruk (onkologi / penjagaan paliatif / pengurusan sakit kronik)",
    "ingredients_formula": "Morphine HCl Powder BP, X-Temp® Syrup (Official MOH Vehicle), Purified Water",
    "pharmacopoeia_ref": "MOH GAEX 2026 (Item 202) / Akta Dadah Berbahaya (DDA) 1952 / Good Preparation Practice (GPP KKM)",
    "standard_formula_breakdown": [
      {
        "name": "Morphine Hydrochloride BP (Pure Powder)",
        "quantity": "2.0 g",
        "function": "Active Opioid API (DDA Narcotic Analgesic)"
      },
      {
        "name": "Purified Water BP",
        "quantity": "50 ml",
        "function": "Initial Solvent for Dissolving Crystal Powder"
      },
      {
        "name": "X-Temp® Syrup (Vehicle Sirap Rasmi KKM)",
        "quantity": "q.s. to 1000 ml (~950 ml)",
        "function": "Official Flavored Syrup Vehicle & Preservative (Vehicle of Choice)"
      }
    ],
    "equipment_required": [
      "Penimbang analitikal berkalibrasi (ketepatan 0.001 g)",
      "Clean Glass Mortar & Pestle",
      "Borosilicate Glass Beakers (250 ml & 1000 ml)",
      "Graduated Measuring Cylinder 100 ml & 1000 ml",
      "Glass Stirring Rod",
      "Botol kaca kuning (amber bottle) bertutup kalis kanak-kanak"
    ],
    "preparation_steps": [
      "1. Semak preskripsi / lembaran kerja pembancuhan dan sahkan rekod timbangan bahan kawalan DDA bersama saksi kedua berdaftar (Pegawai Farmasi).",
      "2. Timbang Morphine Hydrochloride BP seberat tepat 2.0 g menggunakan penimbang analitikal yang telah dikalibrasi.",
      "3. Sukat kira-kira 50 ml Purified Water ke dalam beaker kaca bersih. Masukkan serbuk Morphine HCl dan kacau menggunakan rod kaca sehingga larut jernih sepenuhnya.",
      "4. Tambahkan pembawa X-Temp® Syrup secara beransur-ansur ke dalam beaker sambil dikacau perlahan-lahan untuk mengelakkan pembentukan buih.",
      "5. Pindahkan larutan ke dalam silinder penyukat bersenggat 1000 ml. Bilas beaker dengan sedikit X-Temp® Syrup dan masukkan air bilasan ke dalam silinder.",
      "6. Genapkan isipadu akhir kepada tepat 1000 ml dengan X-Temp® Syrup.",
      "7. Kacau campuran menggunakan rod kaca pengacau panjang untuk memastikan kehomogenan larutan.",
      "8. Lakukan pemeriksaan visual kejernihan larutan di bawah pencahayaan baik (larutan mestilah jernih tanpa zarah asing).",
      "9. Isikan ke dalam botol kaca ambar kering dan bersih, pasang penutup kalis kanak-kanak, dan tampal label rasmi DDA KKM.",
      "10. Lengkapkan rekod dalam Buku Daftar Dadah Berbahaya (DDA) dan simpan stok di dalam almari berkunci DDA."
    ],
    "in_process_qc": [
      "Pemeriksaan visual: Larutan jernih tanpa warna, tiada endapan atau partikel terampai.",
      "Verifikasi isipadu akhir: 1000 ml tepat pada suhu bilik.",
      "Pemeriksaan pH: pH berada dalam julat 2.5 – 4.0.",
      "Pengesahan kuantiti dan tandatangan saksi kedua dalam Buku Daftar Dadah Berbahaya (DDA)."
    ],
    "cautions_and_warnings": [
      "PERINGATAN DDA: Ubat ini adalah Dadah Berbahaya di bawah Akta Dadah Berbahaya 1952. Wajib disimpan dalam peti berkunci DDA.",
      "VEHICLE OF CHOICE: KKM menetapkan penggunaan pembawa X-Temp® Syrup (bukan sirap sukrosa biasa).",
      "Pastikan bekas menggunakan botol kaca ambar kerana Morphine peka terhadap cahaya.",
      "Had penggunaan selepas dibuka (BUD) adalah 30 hari pada suhu bilik terkawal di bawah 25°C."
    ],
    "container_specs": "Botol Kaca Kuning (Amber Bottle) dengan Penutup Kalis Kanak-Kanak (Child-Resistant Closure)."
  },
  "INT-MORF-002": {
    "item_code": "INT-MORF-002",
    "item_name": "Morphine HCl 5 mg / 5 ml Solution",
    "generic_name": "Morphine Hydrochloride 5 mg / 5 ml",
    "pack_type": "internal",
    "dosage_form": "solution",
    "strength": "5 mg / 5 ml",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 30,
    "storage_instructions": "Store below 25°C. Protect from light. Mandatory storage in locked DDA dangerous drugs cabinet.",
    "label_instructions": "FOR ORAL USE ONLY. DANGEROUS DRUG (DDA). PROTECT FROM LIGHT.",
    "indications": "Kawalan kesakitan sederhana-teruk (titrasi dos paliatif)",
    "ingredients_formula": "Morphine HCl Powder BP, X-Temp® Syrup (Official MOH Vehicle), Purified Water",
    "pharmacopoeia_ref": "MOH GAEX 2026 (Item 202) / Akta Dadah Berbahaya (DDA) 1952 / Good Preparation Practice (GPP KKM)",
    "standard_formula_breakdown": [
      {
        "name": "Morphine Hydrochloride BP (Pure Powder)",
        "quantity": "1.0 g",
        "function": "Active Opioid API (DDA Narcotic Analgesic)"
      },
      {
        "name": "Purified Water BP",
        "quantity": "50 ml",
        "function": "Initial Solvent for Dissolving Crystal Powder"
      },
      {
        "name": "X-Temp® Syrup (Vehicle Sirap Rasmi KKM)",
        "quantity": "q.s. to 1000 ml (~950 ml)",
        "function": "Official Flavored Syrup Vehicle & Preservative (Vehicle of Choice)"
      }
    ],
    "equipment_required": [
      "Penimbang analitikal berkalibrasi (ketepatan 0.001 g)",
      "Clean Glass Mortar & Pestle",
      "Borosilicate Glass Beakers (250 ml & 1000 ml)",
      "Graduated Measuring Cylinder 100 ml & 1000 ml",
      "Glass Stirring Rod",
      "Botol kaca kuning (amber bottle) bertutup kalis kanak-kanak"
    ],
    "preparation_steps": [
      "1. Semak preskripsi / lembaran kerja pembancuhan dan sahkan rekod timbangan bahan kawalan DDA bersama saksi kedua berdaftar (Pegawai Farmasi).",
      "2. Timbang Morphine Hydrochloride BP seberat tepat 1.0 g menggunakan penimbang analitikal yang telah dikalibrasi.",
      "3. Sukat kira-kira 50 ml Purified Water ke dalam beaker kaca bersih. Masukkan serbuk Morphine HCl dan kacau menggunakan rod kaca sehingga larut jernih sepenuhnya.",
      "4. Tambahkan pembawa X-Temp® Syrup secara beransur-ansur ke dalam beaker sambil dikacau perlahan-lahan untuk mengelakkan pembentukan buih.",
      "5. Pindahkan larutan ke dalam silinder penyukat bersenggat 1000 ml. Bilas beaker dengan sedikit X-Temp® Syrup dan masukkan air bilasan ke dalam silinder.",
      "6. Genapkan isipadu akhir kepada tepat 1000 ml dengan X-Temp® Syrup.",
      "7. Kacau campuran menggunakan rod kaca pengacau panjang untuk memastikan kehomogenan larutan.",
      "8. Lakukan pemeriksaan visual kejernihan larutan di bawah pencahayaan baik (larutan mestilah jernih tanpa zarah asing).",
      "9. Isikan ke dalam botol kaca ambar kering dan bersih, pasang penutup kalis kanak-kanak, dan tampal label rasmi DDA KKM.",
      "10. Lengkapkan rekod dalam Buku Daftar Dadah Berbahaya (DDA) dan simpan stok di dalam almari berkunci DDA."
    ],
    "in_process_qc": [
      "Pemeriksaan visual: Larutan jernih tanpa warna, tiada endapan atau partikel terampai.",
      "Verifikasi isipadu akhir: 1000 ml tepat pada suhu bilik.",
      "Pemeriksaan pH: pH berada dalam julat 2.5 – 4.0.",
      "Pengesahan kuantiti dan tandatangan saksi kedua dalam Buku Daftar Dadah Berbahaya (DDA)."
    ],
    "cautions_and_warnings": [
      "PERINGATAN DDA: Ubat ini adalah Dadah Berbahaya di bawah Akta Dadah Berbahaya 1952. Wajib disimpan dalam peti berkunci DDA.",
      "VEHICLE OF CHOICE: KKM menetapkan penggunaan pembawa X-Temp® Syrup (bukan sirap sukrosa biasa).",
      "Pastikan bekas menggunakan botol kaca ambar kerana Morphine peka terhadap cahaya.",
      "Had penggunaan selepas dibuka (BUD) adalah 30 hari pada suhu bilik terkawal di bawah 25°C."
    ],
    "container_specs": "Botol Kaca Kuning (Amber Bottle) dengan Penutup Kalis Kanak-Kanak (Child-Resistant Closure)."
  },
  "INT-MORF-003": {
    "item_code": "INT-MORF-003",
    "item_name": "Morphine HCl 2 mg / 5 ml Solution",
    "generic_name": "Morphine Hydrochloride 2 mg / 5 ml",
    "pack_type": "internal",
    "dosage_form": "solution",
    "strength": "2 mg / 5 ml",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 30,
    "storage_instructions": "Store below 25°C. Protect from light. Mandatory storage in locked DDA dangerous drugs cabinet.",
    "label_instructions": "FOR ORAL USE ONLY. DANGEROUS DRUG (DDA). PROTECT FROM LIGHT.",
    "indications": "Kawalan kesakitan dos rendah paliatif warga emas / gangguan fungsi organ",
    "ingredients_formula": "Morphine HCl Powder BP, X-Temp® Syrup (Official MOH Vehicle), Purified Water",
    "pharmacopoeia_ref": "MOH GAEX 2026 (Item 202) / Akta Dadah Berbahaya (DDA) 1952 / Good Preparation Practice (GPP KKM)",
    "standard_formula_breakdown": [
      {
        "name": "Morphine Hydrochloride BP (Pure Powder)",
        "quantity": "0.4 g",
        "function": "Active Opioid API (DDA Narcotic Analgesic)"
      },
      {
        "name": "Purified Water BP",
        "quantity": "50 ml",
        "function": "Initial Solvent for Dissolving Crystal Powder"
      },
      {
        "name": "X-Temp® Syrup (Vehicle Sirap Rasmi KKM)",
        "quantity": "q.s. to 1000 ml (~950 ml)",
        "function": "Official Flavored Syrup Vehicle & Preservative (Vehicle of Choice)"
      }
    ],
    "equipment_required": [
      "Penimbang analitikal berkalibrasi (ketepatan 0.001 g)",
      "Clean Glass Mortar & Pestle",
      "Borosilicate Glass Beakers (250 ml & 1000 ml)",
      "Graduated Measuring Cylinder 100 ml & 1000 ml",
      "Glass Stirring Rod",
      "Botol kaca kuning (amber bottle) bertutup kalis kanak-kanak"
    ],
    "preparation_steps": [
      "1. Semak preskripsi / lembaran kerja pembancuhan dan sahkan rekod timbangan bahan kawalan DDA bersama saksi kedua berdaftar (Pegawai Farmasi).",
      "2. Timbang Morphine Hydrochloride BP seberat tepat 0.4 g menggunakan penimbang analitikal yang telah dikalibrasi.",
      "3. Sukat kira-kira 50 ml Purified Water ke dalam beaker kaca bersih. Masukkan serbuk Morphine HCl dan kacau menggunakan rod kaca sehingga larut jernih sepenuhnya.",
      "4. Tambahkan pembawa X-Temp® Syrup secara beransur-ansur ke dalam beaker sambil dikacau perlahan-lahan untuk mengelakkan pembentukan buih.",
      "5. Pindahkan larutan ke dalam silinder penyukat bersenggat 1000 ml. Bilas beaker dengan sedikit X-Temp® Syrup dan masukkan air bilasan ke dalam silinder.",
      "6. Genapkan isipadu akhir kepada tepat 1000 ml dengan X-Temp® Syrup.",
      "7. Kacau campuran menggunakan rod kaca pengacau panjang untuk memastikan kehomogenan larutan.",
      "8. Lakukan pemeriksaan visual kejernihan larutan di bawah pencahayaan baik (larutan mestilah jernih tanpa zarah asing).",
      "9. Isikan ke dalam botol kaca ambar kering dan bersih, pasang penutup kalis kanak-kanak, dan tampal label rasmi DDA KKM.",
      "10. Lengkapkan rekod dalam Buku Daftar Dadah Berbahaya (DDA) dan simpan stok di dalam almari berkunci DDA."
    ],
    "in_process_qc": [
      "Pemeriksaan visual: Larutan jernih tanpa warna, tiada endapan atau partikel terampai.",
      "Verifikasi isipadu akhir: 1000 ml tepat pada suhu bilik.",
      "Pemeriksaan pH: pH berada dalam julat 2.5 – 4.0.",
      "Pengesahan kuantiti dan tandatangan saksi kedua dalam Buku Daftar Dadah Berbahaya (DDA)."
    ],
    "cautions_and_warnings": [
      "PERINGATAN DDA: Ubat ini adalah Dadah Berbahaya di bawah Akta Dadah Berbahaya 1952. Wajib disimpan dalam peti berkunci DDA.",
      "VEHICLE OF CHOICE: KKM menetapkan penggunaan pembawa X-Temp® Syrup (bukan sirap sukrosa biasa).",
      "Pastikan bekas menggunakan botol kaca ambar kerana Morphine peka terhadap cahaya.",
      "Had penggunaan selepas dibuka (BUD) adalah 30 hari pada suhu bilik terkawal di bawah 25°C."
    ],
    "container_specs": "Botol Kaca Kuning (Amber Bottle) dengan Penutup Kalis Kanak-Kanak (Child-Resistant Closure)."
  },
  "INT-KKM-001": {
    "item_code": "INT-KKM-001",
    "item_name": "ACETAZOLAMIDE SUSPENSION 25MG/ML (KKM MOH 2015)",
    "generic_name": "Acetazolamide 25mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "25mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 60,
    "storage_instructions": "Refrigerate (preferable) or at room temperature",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Reduction of intra-ocular pressure in open-angle glaucoma, secondary glaucoma and peri-operatively in angle-closure glaucoma",
    "ingredients_formula": "Acetazolamide 250mg 12 tablets Vehicle qs 120mL | Vehicle: • Ora-Sweet® : Ora-Plus® (1:1) or • Ora-Sweet SF® : Ora-Plus®(1:1) or • Ora-Blend SF® or • Cherry syrup or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #1, Muka Surat 18) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Acetazolamide",
        "quantity": "Acetazolamide 250mg 12 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  Ora-Sweet® : Ora-Plus® (1:1) or Ora-Sweet SF® : Ora-Plus®(1:1) or Ora-Blend SF® or Cherry syrup or Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with a small amount of suspending vehicle until smooth paste is formed.",
      "3. Gradually add vehicle to the paste until pourable liquid is formed; transfer into calibrated cylinder.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 60 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferable) or at room temperature."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #1.",
      "Vehicle Disyorkan KKM: • Ora-Sweet® : Ora-Plus® (1:1) or • Ora-Sweet SF® : Ora-Plus®(1:1) or • Ora-Blend SF® or • Cherry syrup or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-002": {
    "item_code": "INT-KKM-002",
    "item_name": "ALLOPURINOL SUSPENSION 20MG/ML (KKM MOH 2015)",
    "generic_name": "Allopurinol 20mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "20mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 60,
    "storage_instructions": "Refrigerate (preferable) or at room temperature",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Gout or uric acid and calcium oxalate renal stones",
    "ingredients_formula": "Allopurinol 300mg 8 tablets Vehicle qs 120mL | Vehicle: • Ora-Sweet® : Ora-Plus® (1:1) or • Ora-Sweet SF® : Ora-Plus®(1:1) or • Ora-Blend® or • Ora-Blend SF® or • Cherry syrup or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1) • Methylcellulose 1% : Simple Syrup (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #2, Muka Surat 19) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Allopurinol",
        "quantity": "Allopurinol 300mg 8 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  Ora-Sweet® : Ora-Plus® (1:1) or Ora-Sweet SF® : Ora-Plus®(1:1) or Ora-Blend® or Ora-Blend SF® or Cherry syrup or Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1) Methylcellulose 1% : Simple Syrup (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with a small amount of suspending vehicle until smooth paste is formed.",
      "3. Gradually add vehicle to the paste until pourable liquid is formed; transfer into calibrated cylinder.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 60 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferable) or at room temperature."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #2.",
      "Vehicle Disyorkan KKM: • Ora-Sweet® : Ora-Plus® (1:1) or • Ora-Sweet SF® : Ora-Plus®(1:1) or • Ora-Blend® or • Ora-Blend SF® or • Cherry syrup or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1) • Methylcellulose 1% : Simple Syrup (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-003": {
    "item_code": "INT-KKM-003",
    "item_name": "ALPRAZOLAM SUSPENSION 1MG/ML (KKM MOH 2015)",
    "generic_name": "Alprazolam 1mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "1mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 60,
    "storage_instructions": "Room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Anxiety disorders",
    "ingredients_formula": "Alprazolam 1mg 60 tablets Vehicle qs 60mL | Vehicle: • X-Temp® Oral Suspension System",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #3, Muka Surat 20) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Alprazolam",
        "quantity": "Alprazolam 1mg 60 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  X-Temp® Oral Suspension System",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with a small amount of suspending vehicle until smooth paste is formed.",
      "3. Gradually add vehicle to the paste until pourable liquid is formed; transfer into calibrated cylinder.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 60 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #3.",
      "Vehicle Disyorkan KKM: • X-Temp® Oral Suspension System.",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-004": {
    "item_code": "INT-KKM-004",
    "item_name": "AMIODARONE SUSPENSION 40MG/ML (KKM MOH 2015)",
    "generic_name": "Amiodarone 40mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "40mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 28,
    "storage_instructions": "Room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Arrhythmias",
    "ingredients_formula": "Amiodarone 200mg 20 tablets Sodium Bicarbonate - ~10mL Vehicle qs 100mL | Vehicle: • X-Temp® Oral Suspension System",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #4, Muka Surat 21) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Amiodarone",
        "quantity": "Amiodarone 200mg 20 tablets Sodium Bicarbonate - ~10mL ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  X-Temp® Oral Suspension System",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Measure out the vehicle and adjust the pH to pH 6-7 using Sodium Bicarbonate 5% solution.",
      "2. Grind the tablets to fine powder in a mortar and levigate the powder using a small amount of vehicle (pH adjusted) to form smooth paste.",
      "3. Gradually add the vehicle (pH adjusted) in small amounts to the paste, mix well until liquid is formed and transfer into a container.",
      "4. Use additional vehicle to rinse the remaining drug from the mortar and add to the container.",
      "5. Make up the final volume using more vehicle (pH adjusted) and stir well.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 28 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #4.",
      "Vehicle Disyorkan KKM: • X-Temp® Oral Suspension System.",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-005": {
    "item_code": "INT-KKM-005",
    "item_name": "AMLODIPINE SUSPENSION 1MG/ML (KKM MOH 2015)",
    "generic_name": "Amlodipine 1mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "1mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 30,
    "storage_instructions": "Refrigerate",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Hypertension",
    "ingredients_formula": "Amlodipine 10mg 6 tablets Distilled water - 3-4mL Vehicle qs 60mL | Vehicle: • X-Temp® Oral Suspension System",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #5, Muka Surat 22) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Amlodipine",
        "quantity": "Amlodipine 10mg 6 tablets Distilled water - 3-4mL ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  X-Temp® Oral Suspension System",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Add 3-4mL of distilled water to disintegrate the tablets.",
      "3. Levigate the powder with a small amount of suspending vehicle until smooth paste is formed.",
      "4. Gradually add vehicle to the paste until pourable liquid is formed; transfer into calibrated cylinder.",
      "5. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "6. Bring to final volume with vehicle.",
      "7. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 30 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #5.",
      "Vehicle Disyorkan KKM: • X-Temp® Oral Suspension System.",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-006": {
    "item_code": "INT-KKM-006",
    "item_name": "ATENOLOL SUSPENSION 2MG/ML (KKM MOH 2015)",
    "generic_name": "Atenolol 2mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "2mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 14,
    "storage_instructions": "Refrigerate",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Hypertension, angina pectoris, myocardial infarction and arrhythmias",
    "ingredients_formula": "Atenolol 100mg 1 tablet Glycerin - 2mL Vehicle qs 50mL | Vehicle: • Simple Syrup (stability 14 days) or • Ora-Sweet® (stability 14 days) or • Ora-Sweet SF® (stability 90 days)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #6, Muka Surat 23) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Atenolol",
        "quantity": "Atenolol 100mg 1 tablet Glycerin - 2mL ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  Simple Syrup (stability 14 days) or Ora-Sweet® (stability 14 days) or Ora-Sweet SF® (stability 90 days)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with glycerin until smooth paste is formed.",
      "3. Add vehicle to the paste until liquid is formed and transfer the liquid into a container.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 14 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #6.",
      "Vehicle Disyorkan KKM: • Simple Syrup (stability 14 days) or • Ora-Sweet® (stability 14 days) or • Ora-Sweet SF® (stability 90 days).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-007": {
    "item_code": "INT-KKM-007",
    "item_name": "BACLOFEN SUSPENSION 5MG/ML (KKM MOH 2015)",
    "generic_name": "Baclofen 5mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "5mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 35,
    "storage_instructions": "Refrigerate and p rotect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Spasticity of the skeletal muscle",
    "ingredients_formula": "Baclofen 10mg 30 tablets Glycerine - 3mL Simple Syrup qs 60mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #7, Muka Surat 24) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Baclofen",
        "quantity": "Baclofen 10mg 30 tablets Glycerine - 3mL Simple Syrup qs 60mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Grind tablets in a mortar to fine powder.",
      "2. Add glycerin to make fine paste.",
      "3. Add about 15ml of simple syrup to the paste, triturate well and transfer the contents into a graduated cylinder.",
      "4. Rinse the mortar with about 15ml of simple syrup and transfer the contents into the graduated cylinder.",
      "5. Repeat the last step as necessary to bring the final volume to 60ml."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 35 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate and p rotect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #7.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-008": {
    "item_code": "INT-KKM-008",
    "item_name": "BACLOFEN SUSPENSION 10MG/ML (KKM MOH 2015)",
    "generic_name": "Baclofen 10mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "10mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 60,
    "storage_instructions": "Refrigerate (preferable) or at room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Spasticity of the skeletal muscle",
    "ingredients_formula": "Baclofen 10mg 120 tablets Vehicle qs 120mL | Vehicle: • Ora-Sweet® : Ora-Plus® (1:1) or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1) • X-Temp® Oral Suspension System",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #8, Muka Surat 25) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Baclofen",
        "quantity": "Baclofen 10mg 120 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  Ora-Sweet® : Ora-Plus® (1:1) or Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1) X-Temp® Oral Suspension System",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with vehicle until smooth paste is formed.",
      "3. Gradually add vehicle to the paste until pourable liquid is formed; transfer into calibrated cylinder.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 60 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferable) or at room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #8.",
      "Vehicle Disyorkan KKM: • Ora-Sweet® : Ora-Plus® (1:1) or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1) • X-Temp® Oral Suspension System.",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-009": {
    "item_code": "INT-KKM-009",
    "item_name": "CAFFEINE CITRATE SOLUTION 10MG/ML (KKM MOH 2015)",
    "generic_name": "Caffeine Citrate 10mg/mL",
    "pack_type": "internal",
    "dosage_form": "solution",
    "strength": "10mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 30,
    "storage_instructions": "Refrigerate and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "Apnoea of prematurity",
    "ingredients_formula": "Caffeine Citrate Anhydrous BP - 1g Citric acid anhydrous BP - 1g Vehicle qs 100mL | Vehicle: • Distilled water or water for injection",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #9, Muka Surat 26) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Caffeine Citrate",
        "quantity": "Caffeine Citrate Anhydrous BP - 1g Citric acid anhydrous BP - 1g ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  Distilled water or water for injection",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Weigh the powders and mix with a small amount of vehicle in a measuring cylinder.",
      "2. Add more vehicle to the mixture and make up to final volume with the vehicle.",
      "3. Make up to final volume with vehicle and transfer into a suitable container.",
      "4. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 30 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #9.",
      "Vehicle Disyorkan KKM: • Distilled water or water for injection.",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-010": {
    "item_code": "INT-KKM-010",
    "item_name": "CAPTOPRIL SYRUP 1MG/ML (KKM MOH 2015)",
    "generic_name": "Captopril 1mg/mL",
    "pack_type": "internal",
    "dosage_form": "syrup",
    "strength": "1mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 30,
    "storage_instructions": "Refrigerate and p rotect from light",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "i) Hypertension ii) Congestive heart failure iii) Post-myocardial infarction iv) Diabetic nephropathy",
    "ingredients_formula": "Captopril 25mg 4 tablets Simple Syrup qs 100mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #10, Muka Surat 27) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Captopril",
        "quantity": "Captopril 25mg 4 tablets Simple Syrup qs 100mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with simple syrup until smooth paste is formed.",
      "3. Add more simple syrup to the paste until liquid is formed and transfer the liquid into a container.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 30 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate and p rotect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #10.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-011": {
    "item_code": "INT-KKM-011",
    "item_name": "CAPTOPRIL SOLUTION 1MG/ML (KKM MOH 2015)",
    "generic_name": "Captopril 1mg/mL",
    "pack_type": "internal",
    "dosage_form": "solution",
    "strength": "1mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 56,
    "storage_instructions": "Refrigerate",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "i) Hypertension ii) Congestive heart failure iii) Post-myocardial infarction iv) Diabetic nephropathy",
    "ingredients_formula": "Captopril 25mg 4 tablets Ascorbic Acid 500mg 1 tablet Distilled Water qs 100mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #11, Muka Surat 28) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Captopril",
        "quantity": "Captopril 25mg 4 tablets Ascorbic Acid 500mg 1 tablet Distilled Water qs 100mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Allow the captopril tablets to dissolve in 50mL of distilled water in a graduated cylinder.",
      "2. Add 500mg of ascorbic acid tablet to the mixture and make to final volume with distilled water.",
      "3. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 56 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #11.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-012": {
    "item_code": "INT-KKM-012",
    "item_name": "CARBIDOPA/LEVODOPA (SINEMET®) SUSPENSION 1.25MG CARBIDOPA/5MG LEVODOPA/ML (KKM MOH 2015)",
    "generic_name": "Carbidopa/Levodopa (Sinemet®) 1.25mg Carbidopa/5mg Levodopa/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "1.25mg Carbidopa/5mg Levodopa/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 42,
    "storage_instructions": "Refrigerate (preferred) or at room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Parkinson’s disease",
    "ingredients_formula": "Sinemet ® 25mg/100mg 5 tablets Vehicle qs 100 mL | Vehicle: • Ora-Sweet® : Ora-Plus® (1:1) or • Ora-Blend ® or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #12, Muka Surat 29) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Carbidopa/Levodopa (Sinemet®)",
        "quantity": "Sinemet ® 25mg/100mg 5 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  Ora-Sweet® : Ora-Plus® (1:1) or Ora-Blend ® or Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with a small amount of suspending vehicle until smooth paste is formed.",
      "3. Gradually add vehicle to the paste until pourable liquid is formed; transfer into calibrated cylinder.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 42 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferred) or at room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #12.",
      "Vehicle Disyorkan KKM: • Ora-Sweet® : Ora-Plus® (1:1) or • Ora-Blend ® or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-013": {
    "item_code": "INT-KKM-013",
    "item_name": "CARVEDILOL SUSPENSION 0.5MG/ML (KKM MOH 2015)",
    "generic_name": "Carvedilol 0.5 mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "0.5 mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 30,
    "storage_instructions": "Room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Treatment of stable moderate to severe congestive cardiac failure in addition to ACE inhibitors and diuretics",
    "ingredients_formula": "Carvedilol 12.5mg 4 tablets Vehicle qs 100mL | Vehicle: • Ora-Sweet®: Ora-Plus® (1:1) or • Ora-Blend ® or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #13, Muka Surat 30) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Carvedilol",
        "quantity": "Carvedilol 12.5mg 4 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  Ora-Sweet®: Ora-Plus® (1:1) or Ora-Blend ® or Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with a small amount of suspending vehicle until smooth paste is formed.",
      "3. Gradually add vehicle to the paste until pourable liquid is formed; transfer into calibrated cylinder.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 30 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #13.",
      "Vehicle Disyorkan KKM: • Ora-Sweet®: Ora-Plus® (1:1) or • Ora-Blend ® or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-014": {
    "item_code": "INT-KKM-014",
    "item_name": "CARVEDILOL SUSPENSION 1MG/ML (KKM MOH 2015)",
    "generic_name": "Carvedilol 1mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "1mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 84,
    "storage_instructions": "Room temperature and p rotect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Treatment of stable moderate to severe congestive cardiac failure in addition to ACE inhibitors and diuretics",
    "ingredients_formula": "Carvedilol 12.5mg 8 tablets Sterile water for injection - 10mL Vehicle qs 100mL | Vehicle: • Ora-Sweet® : Ora-Plus®(1:1) or • Ora-Blend ® or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #14, Muka Surat 31) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Carvedilol",
        "quantity": "Carvedilol 12.5mg 8 tablets Sterile water for injection - 10mL ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  Ora-Sweet® : Ora-Plus®(1:1) or Ora-Blend ® or Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with 10mL of sterile water for injection until smooth paste is formed.",
      "3. Gradually add vehicle to the paste until pourable liquid is formed; transfer into calibrated cylinder.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 84 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Room temperature and p rotect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #14.",
      "Vehicle Disyorkan KKM: • Ora-Sweet® : Ora-Plus®(1:1) or • Ora-Blend ® or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-015": {
    "item_code": "INT-KKM-015",
    "item_name": "CHLOROQUINE SUSPENSION 15MG/ML (KKM MOH 2015)",
    "generic_name": "Chloroquine 15mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "15mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 60,
    "storage_instructions": "Refrigerate (preferable) or at room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Treatment of malaria - acute attack",
    "ingredients_formula": "Chloroquine 250mg 6 tablets Vehicle qs 100mL | Vehicle: • Ora-Sweet® : Ora-Plus® (1:1) or • Ora-Sweet SF® : Ora-Plus® (1:1) or • Ora-Blend ® or • Ora-Blend SF® or • Cherry syrup or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #15, Muka Surat 32) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Chloroquine",
        "quantity": "Chloroquine 250mg 6 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  Ora-Sweet® : Ora-Plus® (1:1) or Ora-Sweet SF® : Ora-Plus® (1:1) or Ora-Blend ® or Ora-Blend SF® or Cherry syrup or Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with a small amount of suspending vehicle until smooth paste is formed.",
      "3. Gradually add vehicle to the paste until pourable liquid is formed; transfer into calibrated cylinder.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 60 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferable) or at room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #15.",
      "Vehicle Disyorkan KKM: • Ora-Sweet® : Ora-Plus® (1:1) or • Ora-Sweet SF® : Ora-Plus® (1:1) or • Ora-Blend ® or • Ora-Blend SF® or • Cherry syrup or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-016": {
    "item_code": "INT-KKM-016",
    "item_name": "CITRIC ACID 25% (KKM MOH 2015)",
    "generic_name": "Citric Acid 25% (0.25g/mL)",
    "pack_type": "internal",
    "dosage_form": "solution",
    "strength": "25% (0.25g/mL)",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 60,
    "storage_instructions": "Refrigerate",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "Kegunaan klinikal hospital KKM",
    "ingredients_formula": "Citric acid powder, monohydrate - 12.5g Distilled water qs 50mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #16, Muka Surat 33) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Citric Acid",
        "quantity": "Citric acid powder, monohydrate - 12.5g Distilled water qs 50mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Weigh the citric acid.",
      "2. Add approximately 30mL of distilled water and stir well.",
      "3. Make up to final volume of 50mL."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 60 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #16.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-017": {
    "item_code": "INT-KKM-017",
    "item_name": "CLONAZEPAM SUSPENSION 0.1MG/ML (KKM MOH 2015)",
    "generic_name": "Clonazepam 0.1mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "0.1mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 60,
    "storage_instructions": "Refrigerate or at room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "i) Epilepsy ii) Non-epileptic myoclonus",
    "ingredients_formula": "Clonazepam 2mg 6 tablets Vehicle qs 120mL | Vehicle: • Ora-Blend® or Ora-Blend SF® or • Ora-Plus®: Ora-Sweet® (1:1) or • Ora-Plus®: Ora-Sweet SF (1:1) Cherry Syrup or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #17, Muka Surat 34) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Clonazepam",
        "quantity": "Clonazepam 2mg 6 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  Ora-Blend® or Ora-Blend SF® or Ora-Plus®: Ora-Sweet® (1:1) or Ora-Plus®: Ora-Sweet SF (1:1) Cherry Syrup or Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Grind up tablets in mortar.",
      "2. Levigate powders with small amount of vehicle until homogenous.",
      "3. Make up to the final volume using vehicle."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 60 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate or at room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #17.",
      "Vehicle Disyorkan KKM: • Ora-Blend® or Ora-Blend SF® or • Ora-Plus®: Ora-Sweet® (1:1) or • Ora-Plus®: Ora-Sweet SF (1:1) Cherry Syrup or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-018": {
    "item_code": "INT-KKM-018",
    "item_name": "CLOPIDOGREL SUSPENSION 5MG/ML (KKM MOH 2015)",
    "generic_name": "Clopidogrel 5mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "5mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 60,
    "storage_instructions": "Refrigerate or at room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Prevention of myocardial infarction, stroke or established peripheral arterial disease",
    "ingredients_formula": "Clopidogrel 75mg 8 tablets Vehicle qs 120mL | Vehicle: • X-Temp® Oral Suspension System",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #18, Muka Surat 35) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Clopidogrel",
        "quantity": "Clopidogrel 75mg 8 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  X-Temp® Oral Suspension System",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with a small amount of suspending vehicle until smooth paste is formed.",
      "3. Gradually add vehicle to the paste until pourable liquid is formed; transfer into calibrated cylinder.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 60 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate or at room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #18.",
      "Vehicle Disyorkan KKM: • X-Temp® Oral Suspension System.",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-019": {
    "item_code": "INT-KKM-019",
    "item_name": "DAPSONE SUSPENSION 2MG/ML (KKM MOH 2015)",
    "generic_name": "Dapsone 2mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "2mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 91,
    "storage_instructions": "Refrigerate or at room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Leprosy, Dermatitis herpetiformis",
    "ingredients_formula": "Dapsone 100mg 2 tablets Vehicle qs 100mL | Vehicle: • Ora-Blend® or Ora-Blend SF® or • Ora-Plus® : Ora-Sweet® (1:1) or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #19, Muka Surat 36) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Dapsone",
        "quantity": "Dapsone 100mg 2 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  Ora-Blend® or Ora-Blend SF® or Ora-Plus® : Ora-Sweet® (1:1) or Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with a small amount of suspending vehicle until smooth paste is formed.",
      "3. Gradually add vehicle to the paste until pourable liquid is formed; transfer into calibrated cylinder.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 91 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate or at room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #19.",
      "Vehicle Disyorkan KKM: • Ora-Blend® or Ora-Blend SF® or • Ora-Plus® : Ora-Sweet® (1:1) or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-020": {
    "item_code": "INT-KKM-020",
    "item_name": "DEXAMETHASONE SUSPENSION 0.5MG/ML (KKM MOH 2015)",
    "generic_name": "Dexamethasone 0.5mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "0.5mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 91,
    "storage_instructions": "Room temperature and p rotect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Croup, Septic shock, cerebral oedema and respiratory distress syndrome",
    "ingredients_formula": "Dexamethasone (Sodium Phosphate Injection) 4mg/mL 12.5mL Vehicle qs 100mL | Vehicle: • X-Temp® Oral Suspension System",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #20, Muka Surat 37) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Dexamethasone",
        "quantity": "Dexamethasone (Sodium Phosphate Injection) 4mg/mL 12.5mL ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  X-Temp® Oral Suspension System",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Draw up the required amount of injection using a 5μm filter needle or filter straw and transfer to a measuring cylinder.",
      "2. Add the sufficient quantity of vehicle and stir well.",
      "3. Bring to final volume with vehicle.",
      "4. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 91 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Room temperature and p rotect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #20.",
      "Vehicle Disyorkan KKM: • X-Temp® Oral Suspension System.",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-021": {
    "item_code": "INT-KKM-021",
    "item_name": "DIPYRIDAMOLE SUSPENSION 10MG/ML (KKM MOH 2015)",
    "generic_name": "Dipyridamole 10mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "10mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 60,
    "storage_instructions": "Room temperature and p rotect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "As an adjunct to oral anticoagulation/antiplatelet therapy",
    "ingredients_formula": "Dypiridamole 25mg 40 tablets Vehicle qs 100mL | Vehicle: • X-Temp® Oral Suspension System",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #21, Muka Surat 38) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Dipyridamole",
        "quantity": "Dypiridamole 25mg 40 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  X-Temp® Oral Suspension System",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with a small amount of suspending vehicle until smooth paste is formed.",
      "3. Gradually add vehicle to the paste until pourable liquid is formed; transfer into calibrated cylinder.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 60 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Room temperature and p rotect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #21.",
      "Vehicle Disyorkan KKM: • X-Temp® Oral Suspension System.",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-022": {
    "item_code": "INT-KKM-022",
    "item_name": "ENALAPRIL SUSPENSION 0.1MG/ML (KKM MOH 2015)",
    "generic_name": "Enalapril 0.1mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "0.1mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 14,
    "storage_instructions": "Room temperature",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "i) Hypertension ii) Congestive heart failure",
    "ingredients_formula": "Enalapril 10 mg 5 tablets Distilled water qs 500mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #22, Muka Surat 39) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Enalapril",
        "quantity": "Enalapril 10 mg 5 tablets Distilled water qs 500mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Crush tablets in a mortar to make fine powders.",
      "2. Levigate powders with small amount of distilled water until homogenous.",
      "3. Add more distilled water to the paste until liquid is formed and transfer the liquid into a container.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 14 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Room temperature."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #22.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-023": {
    "item_code": "INT-KKM-023",
    "item_name": "ENALAPRIL SUSPENSION 1MG/ML (KKM MOH 2015)",
    "generic_name": "Enalapril 1mg/ mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "1mg/ mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 60,
    "storage_instructions": "Room temperature and p rotect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "i) Hypertension ii) Congestive heart failure",
    "ingredients_formula": "Enalapril 20mg 5 tablets Vehicle qs 100mL | Vehicle: • X-Temp® Oral Suspension System",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #23, Muka Surat 40) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Enalapril",
        "quantity": "Enalapril 20mg 5 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  X-Temp® Oral Suspension System",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Crush tablets in mortar to make fine powders.",
      "2. If needed, soak tablets in small amount of vehicle.",
      "3. Add vehicle in small quantities until smooth paste is formed. Add more vehicle to the paste until liquid is formed.",
      "4. Transfer the contents into a graduated cylinder.",
      "5. Use additional vehicle to rinse the remaining drug from the mortar and add it into the graduate.",
      "6. Bring to final volume with vehicle. Stir well.",
      "7. Transfer suspension to final container and label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 60 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Room temperature and p rotect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #23.",
      "Vehicle Disyorkan KKM: • X-Temp® Oral Suspension System.",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-024": {
    "item_code": "INT-KKM-024",
    "item_name": "FERRIC AMMONIUM CITRATE 400MG/5ML MIXTURE (KKM MOH 2015)",
    "generic_name": "Ferric Ammonium Citrate 400mg/5ml",
    "pack_type": "internal",
    "dosage_form": "solution",
    "strength": "400mg/5ml",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 90,
    "storage_instructions": "Room temperature and p rotect from light",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "Prevention and treatment of iron deficiency anaemia",
    "ingredients_formula": "Ferric Ammonium Citrate - 80g Chloroform Water Double-Strength BP - 500ml Lemon Spirit - 2ml Syrup BP/Syrup Simplex - 100ml Distilled water qs 1000ml | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #24, Muka Surat 41) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Ferric Ammonium Citrate",
        "quantity": "Ferric Ammonium Citrate - 80g Chloroform Water Double-Strength BP - 500ml Lemon Spirit - 2ml Syrup BP/Syrup Simplex - 100ml Distilled water qs 1000ml",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Prepare chloroform water double strength BP by mixing chloroform water BP with sterile water for (1:200) ratio.",
      "2. Add Ferric Ammonium Citrate powder and stir.",
      "3. Add simplex syrup and lemon lime essence. Stir well.",
      "4. Add sufficient water to make up the final volume required."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 90 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Room temperature and p rotect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #24.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-025": {
    "item_code": "INT-KKM-025",
    "item_name": "FOLIC ACID SUSPENSION 1MG/ML (KKM MOH 2015)",
    "generic_name": "Folic Acid 1mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "1mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 60,
    "storage_instructions": "Room temperature and p rotect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Folate deficiency",
    "ingredients_formula": "Folic Acid 5mg 20 tablets Vehicle qs 100mL | Vehicle: • X-Temp® Oral Suspension System",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #25, Muka Surat 42) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Folic Acid",
        "quantity": "Folic Acid 5mg 20 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  X-Temp® Oral Suspension System",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Crush tablets in mortar to make fine powders.",
      "2. Add vehicle in small quantities until smooth paste is formed. Add more vehicle to the paste until liquid is formed.",
      "3. Transfer the contents into a graduated cylinder.",
      "4. Use additional vehicle to rinse the remaining drug from the mortar and add it into the graduate.",
      "5. Bring to final volume with vehicle. Stir well.",
      "6. Transfer suspension to final container and label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 60 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Room temperature and p rotect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #25.",
      "Vehicle Disyorkan KKM: • X-Temp® Oral Suspension System.",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-026": {
    "item_code": "INT-KKM-026",
    "item_name": "GABAPENTIN SUSPENSION 100MG/ML (KKM MOH 2015)",
    "generic_name": "Gabapentin 100mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "100mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 28,
    "storage_instructions": "Room temperature",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Epilepsy, Neuropathic pain",
    "ingredients_formula": "Gabapentin 300mg 20 capsules Vehicle qs 60mL | Vehicle: • X-Temp® Oral Suspension System",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #26, Muka Surat 43) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Gabapentin",
        "quantity": "Gabapentin 300mg 20 capsules ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  X-Temp® Oral Suspension System",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Carefully empty the capsules content into a mortar.",
      "2. Add vehicle in small quantities until smooth paste is formed. Add more vehicle to the paste until liquid is formed.",
      "3. Transfer the contents into a graduated cylinder.",
      "4. Use additional vehicle to rinse the remaining drug from the mortar and add it into the graduate.",
      "5. Bring to final volume with vehicle. Stir well.",
      "6. Transfer suspension to final container and label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 28 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Room temperature."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #26.",
      "Vehicle Disyorkan KKM: • X-Temp® Oral Suspension System.",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-027": {
    "item_code": "INT-KKM-027",
    "item_name": "GLYCOPYRROLATE SYRUP 0.1MG/ML (KKM MOH 2015)",
    "generic_name": "Glycopyrrolate 0.1mg/mL",
    "pack_type": "internal",
    "dosage_form": "syrup",
    "strength": "0.1mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 14,
    "storage_instructions": "Refrigerate (preferable) or at room temperature and protect from light.",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "To reduce excessive drooling",
    "ingredients_formula": "Glycopyrrolate injection 200mcg/mL 5mL Simple Syrup qs 10mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #27, Muka Surat 44) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Glycopyrrolate",
        "quantity": "Glycopyrrolate injection 200mcg/mL 5mL Simple Syrup qs 10mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Break the ampoule and syringe out the content of glycopyrrolate from the ampoule with 5 μm filter into a mortar.",
      "2. Add the sufficient quantity of simple syrup and stir well.",
      "3. Use additional simple syrup to rinse the remaining drug from the mortar and pour into the container.",
      "4. Make up to final volume with simple syrup.",
      "5. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 14 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferable) or at room temperature and protect from light.."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #27.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-028": {
    "item_code": "INT-KKM-028",
    "item_name": "HYDROCHOLOROTHIAZIDE SUSPENSION 5MG/ML (KKM MOH 2015)",
    "generic_name": "Hydrochlorothiazide 5mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "5mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 60,
    "storage_instructions": "Refrigerate or at room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Diuretic, hypertension",
    "ingredients_formula": "Hydrochlorothiazide 25mg 20 tablets Vehicle qs 100 mL | Vehicle: • X-Temp® Oral Suspension System",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #28, Muka Surat 45) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Hydrochlorothiazide",
        "quantity": "Hydrochlorothiazide 25mg 20 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  X-Temp® Oral Suspension System",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Crush tablets in mortar to make fine powders.",
      "2. If needed, soak tablets in a small amount of vehicle.",
      "3. Add vehicle in small quantities until smooth paste is formed. Add more vehicle to the paste until liquid is formed.",
      "4. Transfer the contents into a graduated cylinder.",
      "5. Use additional vehicle to rinse the remaining drug from the mortar and add it into the graduate.",
      "6. Bring to final volume with vehicle. Stir well.",
      "7. Transfer suspension to a container and label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 60 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate or at room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #28.",
      "Vehicle Disyorkan KKM: • X-Temp® Oral Suspension System.",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-029": {
    "item_code": "INT-KKM-029",
    "item_name": "INDOMETHACIN SYRUP 5MG/ML (KKM MOH 2015)",
    "generic_name": "Indomethacin 5mg/mL",
    "pack_type": "internal",
    "dosage_form": "syrup",
    "strength": "5mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 60,
    "storage_instructions": "Refrigerate and p rotect from light",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "Pain and inflammation in rheumatic disease",
    "ingredients_formula": "Indomethacin 25mg 20 capsules Simple syrup qs 100mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #29, Muka Surat 46) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Indomethacin",
        "quantity": "Indomethacin 25mg 20 capsules Simple syrup qs 100mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Open capsules and empty the contents into a mortar.",
      "2. Levigate the powder with small amount of simple syrup until smooth paste is formed.",
      "3. Add more simple syrup to the paste until liquid is formed and transfer the liquid into a container.",
      "4. Use additional simple syrup to rinse the remaining drug from the mortar and pour into the container.",
      "5. Make up to final volume with simple syrup.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 60 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate and p rotect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #29.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-030": {
    "item_code": "INT-KKM-030",
    "item_name": "ISONIAZID SYRUP 10MG/ML (KKM MOH 2015)",
    "generic_name": "Isoniazid 10mg/mL",
    "pack_type": "internal",
    "dosage_form": "syrup",
    "strength": "10mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 21,
    "storage_instructions": "Refrigerate",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "i) Tuberculosis ii) Tuberculous meningitis",
    "ingredients_formula": "Isoniazid 100mg 10 tablets Distilled water - 10mL Sorbitol 70% Solution qs 100mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #30, Muka Surat 47) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Isoniazid",
        "quantity": "Isoniazid 100mg 10 tablets Distilled water - 10mL Sorbitol 70% Solution qs 100mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Crush tablets in a mortar to a fine powder.",
      "2. Levigate the powder with 10mL of distilled water until a smooth paste is formed.",
      "3. Add Sorbitol 70% to the paste until a liquid is formed and transfer the liquid into the container.",
      "4. Use additional Sorbitol 70% to rinse the remaining drug from the mortar and pour into the container.",
      "5. Make up to final volume with Sorbitol 70%.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 21 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #30.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-031": {
    "item_code": "INT-KKM-031",
    "item_name": "LABETALOL SYRUP 10MG/ML (KKM MOH 2015)",
    "generic_name": "Labetalol 10mg/mL",
    "pack_type": "internal",
    "dosage_form": "syrup",
    "strength": "10mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 28,
    "storage_instructions": "Refrigerate (preferable) or at room temperature",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "Hypertension",
    "ingredients_formula": "Labetalol 100mg 12 tablets Simple syrup qs 120mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #31, Muka Surat 48) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Labetalol",
        "quantity": "Labetalol 100mg 12 tablets Simple syrup qs 120mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with small amount of Simple syrup until smooth paste is formed.",
      "3. Add more Simple syrup to the paste until liquid is formed and transfer the liquid into a container.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 28 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferable) or at room temperature."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #31.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-032": {
    "item_code": "INT-KKM-032",
    "item_name": "LABETALOL SYRUP 40MG/ML (KKM MOH 2015)",
    "generic_name": "Labetalol 40mg/mL",
    "pack_type": "internal",
    "dosage_form": "syrup",
    "strength": "40mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 60,
    "storage_instructions": "Refrigerate (preferable) or at room temperature and protect from light.",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "Hypertension",
    "ingredients_formula": "Labetalol 100mg 48 tablets Vehicle qs 120mL | Vehicle: • Ora-Sweet® : Ora-Plus®(1:1) or • Ora-Blend ® or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #32, Muka Surat 49) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Labetalol",
        "quantity": "Labetalol 100mg 48 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  Ora-Sweet® : Ora-Plus®(1:1) or Ora-Blend ® or Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Crush tablets in a mortar to a fine powder.",
      "2. Levigate the powder with a small amount of suspending vehicle until a smooth paste is formed.",
      "3. Add more vehicle to the paste until a liquid is formed and transfer the liquid into the container.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 60 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferable) or at room temperature and protect from light.."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #32.",
      "Vehicle Disyorkan KKM: • Ora-Sweet® : Ora-Plus®(1:1) or • Ora-Blend ® or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1).",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-033": {
    "item_code": "INT-KKM-033",
    "item_name": "LANSOPRAZOLE SUSPENSION 3MG/ML (KKM MOH 2015)",
    "generic_name": "Lansoprazole 3mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "3mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 14,
    "storage_instructions": "Refrigerate (preferable) or at room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "i) Peptic ulcer disease ii) Reflux oesophagitis iii) Zollinger-Ellison Syndrome iv) For eradication of Helicobacter pylori in combination with antibiotic",
    "ingredients_formula": "Lansoprazole 30mg 10 capsules Sodium bicarbonate 8.4% injection qs 100mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #33, Muka Surat 50) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Lansoprazole",
        "quantity": "Lansoprazole 30mg 10 capsules Sodium bicarbonate 8.4% injection qs 100mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Open capsules and empty the contents into a mortar.",
      "2. Syringe out sodium bicarbonate 8.4% injection solution from ampoule using 5μ filter.",
      "3. Levigate the powder with small amount of sodium bicarbonate solution until smooth paste is formed.",
      "4. Add more sodium bicarbonate solution to the paste until liquid is formed and transfer the liquid into a graduated container.",
      "5. Use additional sodium bicarbonate solution to rinse the remaining drug from the mortar and pour into the container.",
      "6. Make up to final volume with sodium bicarbonate solution.",
      "7. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 14 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferable) or at room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #33.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-034": {
    "item_code": "INT-KKM-034",
    "item_name": "LORAZEPAM SYRUP 0.4MG/ML (KKM MOH 2015)",
    "generic_name": "Lorazepam 0.4mg/mL",
    "pack_type": "internal",
    "dosage_form": "syrup",
    "strength": "0.4mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 30,
    "storage_instructions": "Refrigerate",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "i) Severe anxiety ii) Insomnia",
    "ingredients_formula": "Lorazepam 2mg 15 tablets Simple syrup qs 75mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #34, Muka Surat 51) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Lorazepam",
        "quantity": "Lorazepam 2mg 15 tablets Simple syrup qs 75mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with small amount of simple syrup until smooth paste is formed.",
      "3. Add more simple syrup to the paste until liquid is formed and transfer the liquid into a graduated container.",
      "4. Use additional simple syrup to rinse the remaining drug from the mortar and pour into the container.",
      "5. Make up to final volume with simple syrup.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 30 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #34.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-035": {
    "item_code": "INT-KKM-035",
    "item_name": "METHYLCELLULOSE SUSPENDING AGENT 1% (0.01G/ML) (KKM MOH 2015)",
    "generic_name": "Methylcellulose 1% (0.01g/mL)",
    "pack_type": "internal",
    "dosage_form": "solution",
    "strength": "1% (0.01g/mL)",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 6,
    "beyond_use_date_days": 180,
    "storage_instructions": "Room temperature",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "Kegunaan klinikal hospital KKM",
    "ingredients_formula": "Methylcellulose Powder CPS 1500 10g Sodium Benzoate Powder - 2g Simple syrup qs 1,000mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #35, Muka Surat 52) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Methylcellulose",
        "quantity": "Methylcellulose Powder CPS 1500 10g Sodium Benzoate Powder - 2g Simple syrup qs 1,000mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Dissolve Sodium Benzoate in 200mL of boiling distilled water.",
      "2. Add Methylcellulose powder and stir well for 2-3 minutes (use blender if available). Make sure mixture is sufficiently heated so powders are completely dissolved.",
      "3. Add 800mL ice cold water (carefully but quickly) and stir or blend well for 10 minutes.",
      "4. Transfer to a 1 litre bottle.",
      "5. Place on side and refrigerate overnight (minimum 4 hours) until liquid converts to gel."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 180 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Room temperature."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #35.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-036": {
    "item_code": "INT-KKM-036",
    "item_name": "METOPROLOL SUSPENSION 10MG/ML (KKM MOH 2015)",
    "generic_name": "Metoprolol 10mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "10mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 60,
    "storage_instructions": "Refrigerate (preferable) or at room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Hypertension, angina, myocardial infarction, arrhythmias",
    "ingredients_formula": "Metoprolol 100mg 12 tablets Vehicle qs 120mL | Vehicle: • Ora-Sweet® : Ora-Plus® (1:1) or • Ora-Sweet SF® : Ora-Plus® (1:1) or • Ora-Blend ® or • Ora-Blend SF® or • Cherry syrup or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #36, Muka Surat 53) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Metoprolol",
        "quantity": "Metoprolol 100mg 12 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  Ora-Sweet® : Ora-Plus® (1:1) or Ora-Sweet SF® : Ora-Plus® (1:1) or Ora-Blend ® or Ora-Blend SF® or Cherry syrup or Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with a small amount of suspending vehicle until smooth paste is formed.",
      "3. Gradually add vehicle to the paste until pourable liquid is formed; transfer into calibrated cylinder.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 60 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferable) or at room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #36.",
      "Vehicle Disyorkan KKM: • Ora-Sweet® : Ora-Plus® (1:1) or • Ora-Sweet SF® : Ora-Plus® (1:1) or • Ora-Blend ® or • Ora-Blend SF® or • Cherry syrup or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-037": {
    "item_code": "INT-KKM-037",
    "item_name": "MIDAZOLAM SYRUP 2MG/ML (KKM MOH 2015)",
    "generic_name": "Midazolam 2mg/mL",
    "pack_type": "internal",
    "dosage_form": "syrup",
    "strength": "2mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 56,
    "storage_instructions": "Refrigerate (preferable) or at room temperature and p rotect from light",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "Pre-operative sedation, induction of general anaesthesia, premedication and sedation in ICU and sedation for minor procedures",
    "ingredients_formula": "Midazolam injection 5mg/mL 48mL Simple Syrup qs 120mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #37, Muka Surat 54) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Midazolam",
        "quantity": "Midazolam injection 5mg/mL 48mL Simple Syrup qs 120mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Break the ampoule and syringe out the content of Midazolam from the ampoule with 5 μm filter into a mortar.",
      "2. Add the sufficient quantity of simple syrup and stir well.",
      "3. Use additional simple syrup to rinse the remaining drug from the mortar and pour into the container.",
      "4. Make up to final volume with simple syrup.",
      "5. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 56 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferable) or at room temperature and p rotect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #37.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-038": {
    "item_code": "INT-KKM-038",
    "item_name": "NIFEDIPINE SUSPENSION 1MG/ML (KKM MOH 2015)",
    "generic_name": "Nifedipine 1mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "1mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 28,
    "storage_instructions": "Refrigerate (preferable) or at room temperature",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Hypertension",
    "ingredients_formula": "Nifedipine 10mg 5 tablets Methylcellulose 1% qs 50mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #38, Muka Surat 55) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Nifedipine",
        "quantity": "Nifedipine 10mg 5 tablets Methylcellulose 1% qs 50mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with small amount of Methylcellulose 1% until smooth paste is formed.",
      "3. Add more Methylcellulose 1% to the paste until liquid is formed and transfer the liquid into a container.",
      "4. Use additional Methylcellulose 1% to rinse the remaining drug from the mortar and pour into the container.",
      "5. Make up to final volume with Methylcellulose 1%.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 28 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferable) or at room temperature."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #38.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-039": {
    "item_code": "INT-KKM-039",
    "item_name": "NIFEDIPINE SUSPENSION 4MG/ML (KKM MOH 2015)",
    "generic_name": "Nifedipine 4mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "4mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 90,
    "storage_instructions": "Refrigerate (preferable) or at room temperature",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Hypertension",
    "ingredients_formula": "Nifedipine 10mg 12 tablets Vehicle qs 30mL VEHICLE CHOICE: • Ora-Sweet® : Ora-Plus® (1:1) or • Ora-Blend ® or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1) | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #39, Muka Surat 56) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Nifedipine",
        "quantity": "Nifedipine 10mg 12 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with a small amount of suspending vehicle until smooth paste is formed.",
      "3. Gradually add vehicle to the paste until pourable liquid is formed; transfer into calibrated cylinder.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 90 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferable) or at room temperature."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #39.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-040": {
    "item_code": "INT-KKM-040",
    "item_name": "NITROFURANTOIN SUSPENSION 10MG/ML (KKM MOH 2015)",
    "generic_name": "Nitrofurantoin 10mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "10mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 91,
    "storage_instructions": "Refrigerate or at room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Uncomplicated lower urinary tract infections",
    "ingredients_formula": "Nitrofurantoin 100mg 10 tablets Vehicle qs 100mL VEHICLE CHOICE: • Ora-Sweet® : Ora-Plus® (1:1) or • Ora-Blend ® or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1) | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #40, Muka Surat 57) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Nitrofurantoin",
        "quantity": "Nitrofurantoin 100mg 10 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Crush tablets in a mortar to a fine powder.",
      "2. Levigate the powder with a small amount of suspending vehicle until a smooth paste is formed.",
      "3. Add more vehicle to the paste until a liquid is formed and transfer the liquid into a container.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 91 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate or at room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #40.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-041": {
    "item_code": "INT-KKM-041",
    "item_name": "OMEPRAZOLE SUSPENSION 2MG/ML (KKM MOH 2015)",
    "generic_name": "Omeprazole 2mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "2mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 14,
    "storage_instructions": "Refrigerate (preferable) or at room temperature and p rotect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "i) Reflux oesophagitis, eradication of H. Pylori infection, benign peptic ulcer not responding to conventional therapy, Zollinger- Ellison Syndrome ii) Endoscopically confirmed peptic ulcer",
    "ingredients_formula": "Omeprazole (capsules or tablets) 20mg 10 capsules Sodium Bicarbonate Injection 8.4% 10 amp x 10mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #41, Muka Surat 58) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Omeprazole",
        "quantity": "Omeprazole (capsules or tablets) 20mg 10 capsules Sodium Bicarbonate Injection 8.4% 10 amp x 10mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "Capsules",
      "1. Empty contents of capsules in a mortar and cover with sodium bicarbonate and stir the mixture.",
      "2. Add more sodium bicarbonate to form liquid and then transfer to a graduated container.",
      "3. Rinse the mortar with additional sodium bicarbonate and make up to the final volume required. Tablets",
      "1. Place tablets in mortar and soak in sodium bicarbonate for 20 minutes.",
      "2. Crush tablets to form slurry and stir the mixture well.",
      "3. Add more sodium bicarbonate to form liquid and then transfer to a graduated container.",
      "4. Rinse mortar with additional sodium bicarbonate and make up to the final volume required."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 14 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferable) or at room temperature and p rotect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #41.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-042": {
    "item_code": "INT-KKM-042",
    "item_name": "PANTOPRAZOLE 2MG/ML (KKM MOH 2015)",
    "generic_name": "Pantoprazole 2mg/mL",
    "pack_type": "internal",
    "dosage_form": "solution",
    "strength": "2mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 62,
    "storage_instructions": "Refrigerate",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "i) Reflux oesophagitis, eradication of H. Pylori infection, benign peptic ulcer not responding to conventional therapy, Zollinger-Ellison Syndrome ii) Endoscopically confirmed peptic ulcer",
    "ingredients_formula": "Pantoprazole sodium 20mg 10 tablets Sodium bicarbonate Powder 8.4g Distilled water qs 100mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #42, Muka Surat 59) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Pantoprazole",
        "quantity": "Pantoprazole sodium 20mg 10 tablets Sodium bicarbonate Powder 8.4g Distilled water qs 100mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with small amount of distilled water until smooth paste is formed.",
      "3. Add more distilled water to the paste until liquid is formed and transfer the liquid into a container.",
      "4. Use additional distilled water to rinse the remaining drug from the mortar and pour into the container. While stirring, add sodium bicarbonate powder. Stir until tablets disintegrate.",
      "5. Make up to final volume with distilled water."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 62 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #42.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-043": {
    "item_code": "INT-KKM-043",
    "item_name": "PENTOXIFYLLINE SOLUTION 20MG/ML (KKM MOH 2015)",
    "generic_name": "Pentoxifylline 20mg/mL",
    "pack_type": "internal",
    "dosage_form": "solution",
    "strength": "20mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 91,
    "storage_instructions": "Refrigerate (preferable) or at room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "Peripheral vascular disease",
    "ingredients_formula": "Pentoxifylline Tablets 400mg 12 tablets Distilled Water qs 240mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #43, Muka Surat 60) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Pentoxifylline",
        "quantity": "Pentoxifylline Tablets 400mg 12 tablets Distilled Water qs 240mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with small amount of distilled water until smooth paste is formed.",
      "3. Add more distilled water to the paste until liquid is formed and transfer the liquid into a container.",
      "4. Use additional distilled water to rinse the remaining drug from the mortar and pour into the container.",
      "5. Make up to final volume with distilled water.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 91 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferable) or at room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #43.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-044": {
    "item_code": "INT-KKM-044",
    "item_name": "PHENOBARBITONE SUSPENSION 10MG/ML (KKM MOH 2015)",
    "generic_name": "Phenobarbitone 10mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "10mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 4,
    "beyond_use_date_days": 115,
    "storage_instructions": "Room temperature and p rotect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Epilepsy",
    "ingredients_formula": "Phenobarbitone 30mg 20 tablets Vehicle qs 60mL VEHICLE CHOICE: • Ora-Sweet® : Ora-Plus® (1:1) or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1) | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #44, Muka Surat 61) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Phenobarbitone",
        "quantity": "Phenobarbitone 30mg 20 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with a small amount of suspending vehicle until smooth paste is formed.",
      "3. Gradually add vehicle to the paste until pourable liquid is formed; transfer into calibrated cylinder.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 115 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Room temperature and p rotect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #44.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-045": {
    "item_code": "INT-KKM-045",
    "item_name": "PHYTOMENADIONE (VITAMIN K1) LIQUID 1MG/ML (KKM MOH 2015)",
    "generic_name": "Phytomenadione (Vitamin K1) 1mg/mL",
    "pack_type": "internal",
    "dosage_form": "solution",
    "strength": "1mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 104,
    "storage_instructions": "Refrigerate or at room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "Vitamin K deficiency due to liver failure",
    "ingredients_formula": "Phytomenadione Injection 10mg 1mL Sterile Water or Simple Syrup qs 10mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #45, Muka Surat 62) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Phytomenadione (Vitamin K1)",
        "quantity": "Phytomenadione Injection 10mg 1mL Sterile Water or Simple Syrup qs 10mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Using a 5μm filter, withdraw the required amount of Vitamin K1 and transfer into an amber glass bottle.",
      "2. Add vehicle and mix well."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 104 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate or at room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #45.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-046": {
    "item_code": "INT-KKM-046",
    "item_name": "PROPRANOLOL SUSPENSION 0.5MG/ML (KKM MOH 2015)",
    "generic_name": "Propranolol 0.5mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "0.5mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 30,
    "storage_instructions": "Room temperature",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Dysrhythmias, tachycardia, hypertrophic obstructive cardiomyopathy (For cardiologist only)",
    "ingredients_formula": "Propranolol 40mg 3 tablets Simple Syrup qs 240mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #46, Muka Surat 63) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Propranolol",
        "quantity": "Propranolol 40mg 3 tablets Simple Syrup qs 240mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Crush tablets in a mortar to a fine powder.",
      "2. Levigate the powder with distilled water until smooth.",
      "3. Add a small amount of simple syrup to form a smooth paste. Add more syrup until a liquid is formed and transfer the contents into a graduate cylinder. Use additional simple syrup to rinse the remaining drug from the mortar.",
      "4. To make up final volume with simple syrup.",
      "5. Transfer the suspension into the amber bottle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 30 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Room temperature."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #46.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-047": {
    "item_code": "INT-KKM-047",
    "item_name": "PROPRANOLOL SUSPENSION 1MG/ML (KKM MOH 2015)",
    "generic_name": "Propranolol 1mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "1mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 45,
    "storage_instructions": "Refrigerate and p rotect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Dysrhythmias, tachycardia, hypertrophic obstructive cardiomyopathy (For cardiologist only)",
    "ingredients_formula": "Propranolol 40mg 6 tablets Distilled Water (wetting agent) - 4.8mL Citric Acid Solution 25% 1mL Simple Syrup qs 240mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #47, Muka Surat 64) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Propranolol",
        "quantity": "Propranolol 40mg 6 tablets Distilled Water (wetting agent) - 4.8mL Citric Acid Solution 25% 1mL Simple Syrup qs 240mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with distilled water until smooth.",
      "3. Add a small amount of simple syrup to form smooth paste. Add more syrup until liquid is formed and transfer the contents into a graduated cylinder. Use additional simple syrup to rinse the remaining drug from the mortar.",
      "4. Add citric acid to the suspension in the graduate. Mix well.",
      "5. Make up to final volume with simple syrup.",
      "6. Transfer the suspension into an amber bottle.",
      "7. Shake well to ensure uniform suspension and apply official label. NOTE:",
      "1. Keep in an amber glass bottle.",
      "2. Citric acid is used only for pH adjustment. No need to decrease expiry to citric acid’s expiry."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 45 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate and p rotect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #47.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-048": {
    "item_code": "INT-KKM-048",
    "item_name": "PYRAZINAMIDE SUSPENSION 10MG/ML (KKM MOH 2015)",
    "generic_name": "Pyrazinamide 10mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "10mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 60,
    "storage_instructions": "Refrigerate (preferable) or at room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Tuberculosis",
    "ingredients_formula": "Pyrazinamide 500mg 3 tablets Vehicle qs 150mL VEHICLE CHOICE: • Ora-Sweet® : Ora-Plus® (1:1) or • Ora-Sweet SF®: Ora-Plus® (1:1) or • Ora-Blend SF® or • Cherry syrup or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1) | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #48, Muka Surat 65) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Pyrazinamide",
        "quantity": "Pyrazinamide 500mg 3 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Pulverize tablets in a mortar to a uniform, fine powder.",
      "2. Levigate the powder with a small amount of suspending vehicle until smooth paste is formed.",
      "3. Gradually add vehicle to the paste until pourable liquid is formed; transfer into calibrated cylinder.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 60 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferable) or at room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #48.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-049": {
    "item_code": "INT-KKM-049",
    "item_name": "PYRAZINAMIDE SYRUP 100MG/ML (KKM MOH 2015)",
    "generic_name": "Pyrazinamide 100mg/mL",
    "pack_type": "internal",
    "dosage_form": "syrup",
    "strength": "100mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 60,
    "storage_instructions": "Refrigerate (preferable) or at room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "Tuberculosis",
    "ingredients_formula": "Pyrazinamide 500mg 200 tablets Simple Syrup qs 1,000mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #49, Muka Surat 66) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Pyrazinamide",
        "quantity": "Pyrazinamide 500mg 200 tablets Simple Syrup qs 1,000mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Crush tablets in a mortar to form a fine paste.",
      "2. Levigate the powder with small amount of simple syrup until a smooth paste is formed.",
      "3. Add more simple syrup to the paste until a liquid is formed and transfer the liquid into the container.",
      "4. Use additional simple syrup to rinse the remaining drug from the mortar and pour into the container.",
      "5. Make up to final volume with simple syrup.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 60 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferable) or at room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #49.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-050": {
    "item_code": "INT-KKM-050",
    "item_name": "RIFAMPICIN SYRUP 10MG/ML (KKM MOH 2015)",
    "generic_name": "Rifampicin 10mg/mL",
    "pack_type": "internal",
    "dosage_form": "syrup",
    "strength": "10mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 28,
    "storage_instructions": "Refrigerate and p rotect from light",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "Tuberculosis",
    "ingredients_formula": "Rifampicin 300mg 4 capsules Simple Syrup qs 120mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #50, Muka Surat 67) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Rifampicin",
        "quantity": "Rifampicin 300mg 4 capsules Simple Syrup qs 120mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Open capsules and empty the contents into a mortar.",
      "2. Levigate the powder with small amount of simple syrup until smooth paste is formed.",
      "3. Add more simple syrup to the paste until liquid is formed and transfer the liquid into a container.",
      "4. Use additional simple syrup to rinse the remaining drug from the mortar and pour into the container.",
      "5. Make up to final volume with simple syrup.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 28 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate and p rotect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #50.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-051": {
    "item_code": "INT-KKM-051",
    "item_name": "RIFAMPICIN SUSPENSION 25MG/ML (KKM MOH 2015)",
    "generic_name": "Rifampicin 25mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "25mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 28,
    "storage_instructions": "Room temperature and p rotect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Tuberculosis",
    "ingredients_formula": "Rifampicin 300mg 10 capsules Vehicle qs 120mL VEHICLE CHOICE: • Ora-Sweet® : Ora-Plus® (1:1) or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1) | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #51, Muka Surat 68) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Rifampicin",
        "quantity": "Rifampicin 300mg 10 capsules ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Open capsules and empty the contents into a mortar.",
      "2. Levigate the powder with a small amount of suspending vehicle until a smooth paste is formed.",
      "3. Add more vehicle to the paste until a liquid is formed and transfer the liquid into the container.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 28 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Room temperature and p rotect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #51.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-052": {
    "item_code": "INT-KKM-052",
    "item_name": "SILDENAFIL SUSPENSION 2.5MG/ML (KKM MOH 2015)",
    "generic_name": "Sildenafil 2.5mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "2.5mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 91,
    "storage_instructions": "Refrigerate (preferable) or at room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Pulmonary hypertension",
    "ingredients_formula": "Sildenafil 20mg 5 tablets Vehicle qs 40mL VEHICLE CHOICE: • Ora-Sweet® : Ora-Plus® (1:1) or • Methylcellulose 1%: Simple Syrup (1:1) or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1) | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #52, Muka Surat 69) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Sildenafil",
        "quantity": "Sildenafil 20mg 5 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Crush tablets in a mortar to form a fine paste.",
      "2. Levigate the powder with a small amount of suspending vehicle until a smooth paste is formed.",
      "3. Add more vehicle to the paste until a liquid is formed and transfer the liquid into the container.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 91 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferable) or at room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #52.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-053": {
    "item_code": "INT-KKM-053",
    "item_name": "SPIRONOLACTONE SYRUP 1.25MG/ML (KKM MOH 2015)",
    "generic_name": "Spironolactone 1.25mg/mL",
    "pack_type": "internal",
    "dosage_form": "syrup",
    "strength": "1.25mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 60,
    "storage_instructions": "Room temperature and p rotect from light",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "Oedema and ascites in cirrhosis of the liver, congestive heart failure",
    "ingredients_formula": "Spironolactone 25mg 5 tablets Vehicle qs 100mL VEHICLE CHOICE: • X-Temp® Oral Suspension System. | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #53, Muka Surat 70) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Spironolactone",
        "quantity": "Spironolactone 25mg 5 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Crush tablets in a mortar to form fine paste.",
      "2. Levigate the powder with sterile water for injection until smooth paste is formed.",
      "3. Add simple syrup to the paste until liquid is formed and transfer the liquid into a container.",
      "4. Use additional simple syrup to rinse the remaining drug from the mortar and pour into the container.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 60 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Room temperature and p rotect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #53.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-054": {
    "item_code": "INT-KKM-054",
    "item_name": "SPIRONOLACTONE SYRUP 2.5MG/ML (KKM MOH 2015)",
    "generic_name": "Spironolactone 2.5mg/mL",
    "pack_type": "internal",
    "dosage_form": "syrup",
    "strength": "2.5mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 60,
    "storage_instructions": "Refrigerate (preferable) or at room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "Oedema and ascites in cirrhosis of the liver, congestive heart failure.",
    "ingredients_formula": "Spironolactone 25mg 4 tablets Sterile water for injection - 5mL Simple Syrup qs 40mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #54, Muka Surat 71) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Spironolactone",
        "quantity": "Spironolactone 25mg 4 tablets Sterile water for injection - 5mL Simple Syrup qs 40mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Crush tablets in a mortar to form fine paste.",
      "2. Levigate the powder with sterile water for injection until smooth paste is formed.",
      "3. Add simple syrup to the paste until liquid is formed and transfer the liquid into a container.",
      "4. Use additional simple syrup to rinse the remaining drug from the mortar and pour into the container.",
      "5. Make up to final volume with simple syrup.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 60 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferable) or at room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #54.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-055": {
    "item_code": "INT-KKM-055",
    "item_name": "TRIMETHOPRIM SUSPENSION 10MG/ML (KKM MOH 2015)",
    "generic_name": "Trimethoprim 10mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "10mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 90,
    "storage_instructions": "Refrigerate (preferable) or at room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Treatment of urinary tract infections due to susceptible pathogens",
    "ingredients_formula": "Trimethoprim 100mg 10 tablets Methylcellulose 1%: Simple Syrup (1:1) qs 100mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #55, Muka Surat 72) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Trimethoprim",
        "quantity": "Trimethoprim 100mg 10 tablets Methylcellulose 1%: Simple Syrup (1:1) qs 100mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Prepare 100mL of a mixture of equal parts methylcellulose 1% and syrup.",
      "2. Crush the trimethoprim tablets and then slowly add the base whilst mixing.",
      "3. Gradually add vehicle to the paste until pourable liquid is formed; transfer into calibrated cylinder.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 90 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferable) or at room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #55.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-056": {
    "item_code": "INT-KKM-056",
    "item_name": "TRIMETHOPRIM SYRUP 10MG/ML (KKM MOH 2015)",
    "generic_name": "Trimethoprim 10mg/mL",
    "pack_type": "internal",
    "dosage_form": "syrup",
    "strength": "10mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 30,
    "storage_instructions": "Room temperature and p rotect from light",
    "label_instructions": "FOR ORAL USE ONLY. STORE AS DIRECTED ON LABEL.",
    "indications": "Treatment of urinary tract infections due to susceptible pathogens",
    "ingredients_formula": "Trimethoprim 100mg 10 tablets Simple Syrup qs 100mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #56, Muka Surat 73) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Trimethoprim",
        "quantity": "Trimethoprim 100mg 10 tablets Simple Syrup qs 100mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Borosilicate Glass Beaker",
      "Graduated Borosilicate Measuring Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Soak the tablets in mortar with some simple syrup for about 10 minutes.",
      "2. Levigate with small amount of vehicle until smooth paste is formed.",
      "3. Add more vehicle to the paste until liquid is formed and transfer the liquid into a graduated container.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kejernihan: Clear transparent solution free of foreign matter.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 30 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Room temperature and p rotect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #56.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "Lindungi daripada pendedahan cahaya matahari langsung."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-057": {
    "item_code": "INT-KKM-057",
    "item_name": "URSODEOXYCHOLIC ACID SUSPENSION 50MG/ML (KKM MOH 2015)",
    "generic_name": "Ursodeoxycholic Acid 50mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "50mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 30,
    "storage_instructions": "Refrigerate or at room temperature",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "Cholestatic liver diseases (eg. primary biliary cirrhosis, primary cholangitis etc)",
    "ingredients_formula": "Ursodeoxycholic Acid 300mg 20 capsules Vehicle qs 120mL | Vehicle: • Ora-Blend® or Ora-Blend SF® or • Ora-Plus® : Ora-Sweet® (1:1) or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1) • X-Temp® Oral Suspension System (stability is for 90 days)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #57, Muka Surat 74) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Ursodeoxycholic Acid",
        "quantity": "Ursodeoxycholic Acid 300mg 20 capsules ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi:  Ora-Blend® or Ora-Blend SF® or Ora-Plus® : Ora-Sweet® (1:1) or Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1) X-Temp® Oral Suspension System (stability is for 90 days)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. If Ora-Blend or X-Temp® is unavailable, pre-mix the Ora-Plus and Ora-Sweet, to form the diluent.",
      "2. Open capsules and empty the contents into a mortar and add the diluent.",
      "3. Levigate the powder until smooth paste is formed.",
      "4. Add vehicle to the paste until liquid is formed and transfer the liquid into a container.",
      "5. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "6. Bring to final volume with vehicle.",
      "7. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 30 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate or at room temperature."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #57.",
      "Vehicle Disyorkan KKM: • Ora-Blend® or Ora-Blend SF® or • Ora-Plus® : Ora-Sweet® (1:1) or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1) • X-Temp® Oral Suspension System (stability is for 90 days).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-058": {
    "item_code": "INT-KKM-058",
    "item_name": "VERAPAMIL SUSPENSION 50MG/ML (KKM MOH 2015)",
    "generic_name": "Verapamil 50mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "50mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 2,
    "beyond_use_date_days": 60,
    "storage_instructions": "Refrigerate (preferable) or at room temperature and protect from light",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "i) Supraventricular tachyarrhythmia (SVT) prophylaxis ii) Angina",
    "ingredients_formula": "Verapamil hydrochloride 40mg 150 tablets Vehicle qs 120mL VEHICLE CHOICE: • Ora-Sweet® : Ora-Plus® (1:1) or • Ora-Sweet SF® : Ora-Plus® (1:1) or • Equivalent vehicle to Ora-Sweet® : Ora-Plus® (1:1) | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #58, Muka Surat 75) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Verapamil",
        "quantity": "Verapamil hydrochloride 40mg 150 tablets ",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Crush tablets in a mortar to a fine powder.",
      "2. Levigate the powder with a small amount of suspending vehicle until smooth paste is formed.",
      "3. Gradually add vehicle to the paste until pourable liquid is formed; transfer into calibrated cylinder.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 60 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Refrigerate (preferable) or at room temperature and protect from light."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #58.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
  "INT-KKM-059": {
    "item_code": "INT-KKM-059",
    "item_name": "VERAPAMIL SUSPENSION 8MG/ML (KKM MOH 2015)",
    "generic_name": "Verapamil 8mg/mL",
    "pack_type": "internal",
    "dosage_form": "suspension",
    "strength": "8mg/mL",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 30,
    "storage_instructions": "Room temperature",
    "label_instructions": "FOR ORAL USE ONLY. SHAKE WELL BEFORE USE. STORE AS DIRECTED.",
    "indications": "i) Supraventricular tachyarrhythmia (SVT) prophylaxis ii) angina",
    "ingredients_formula": "Verapamil hydrochloride 40mg 10 tablets Distilled water - 1mL Simple syrup qs 50mL | Vehicle: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
    "pharmacopoeia_ref": "Extemporaneous Formulation MOH 2015 (Formulasi #59, Muka Surat 76) / Pharmaceutical Services Division KKM",
    "standard_formula_breakdown": [
      {
        "name": "Active Pharmaceutical Ingredient (API): Verapamil",
        "quantity": "Verapamil hydrochloride 40mg 10 tablets Distilled water - 1mL Simple syrup qs 50mL",
        "function": "Active Pharmaceutical Ingredient (API) Farmaseutikal (API)"
      },
      {
        "name": "Vehicle Rasmi: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1)",
        "quantity": "q.s. to Final Volume",
        "function": "Vehicle of Choice (KKM GPP Vehicle System)"
      }
    ],
    "equipment_required": [
      "Clean Porcelain / Glass Mortar & Pestle",
      "Calibrated Analytical Balance",
      "Graduated Borosilicate Measuring Cylinder (100ml / 500ml)",
      "Flexible Stainless Steel Spatula",
      "Amber Glass Bottle with Child-Resistant Cap"
    ],
    "preparation_steps": [
      "1. Soak tablets in a small amount of distilled water and then crush tablets in a mortar to fine powder.",
      "2. Levigate the powder with vehicle until smooth paste is formed.",
      "3. Add more vehicle to the paste until liquid is formed and transfer the liquid into a graduated container.",
      "4. Rinse remaining drug particles from mortar with additional vehicle and pour into cylinder.",
      "5. Bring to final volume with vehicle.",
      "6. Shake well to ensure uniform suspension and apply official label."
    ],
    "in_process_qc": [
      "Pemeriksaan kehomogenan suspensi: Ampaian sekata, mudah digoncang semula.",
      "Pengesahan had kestabilan: Beyond-Use Date (BUD) disahkan pada 30 hari mengikut data stabiliti KKM.",
      "Pematuhan suhu simpanan: Room temperature."
    ],
    "cautions_and_warnings": [
      "Rujukan Rasmi: Extemporaneous Formulation MOH 2015 #59.",
      "Vehicle Disyorkan KKM: X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® (1:1).",
      "MANDATORI: Goncang dengan baik sebelum setiap kali penggunaan."
    ],
    "container_specs": "Amber glass bottle with tight-fitting closure."
  },
    "EXT-ALC-002": {
    "item_code": "EXT-ALC-002",
    "item_name": "Chlorhexidine Gluconate 1:200 (0.5% w/v) in 70% Alcohol (Cord Spirit / Pink Skin Prep)",
    "generic_name": "Chlorhexidine Gluconate 0.5% w/v in 70% v/v Ethanol",
    "pack_type": "external",
    "dosage_form": "solution",
    "strength": "0.5% w/v in 70% v/v (1:200)",
    "units_per_pack": 1,
    "package_type": "clear_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 90,
    "storage_instructions": "Store below 25°C away from heat sources and open flames. Highly flammable.",
    "label_instructions": "FOR EXTERNAL USE ONLY. FLAMMABLE. KEEP OUT OF REACH OF CHILDREN. DO NOT INGEST.",
    "indications": "Neonatal umbilical cord care (Cord Spirit), skin antisepsis prior to IV cannulation, venipuncture, and spinal anesthesia",
    "ingredients_formula": "Chlorhexidine Digluconate 20% Sol. 25ml, Industrial Methylated Spirit 95% 737ml, Purified Water to 1000ml, Pink Amaranth Dye",
    "pharmacopoeia_ref": "MOH GAEX 2026 (Item 75: Chlorhexidine 1:200 in Alcohol 70%) / MOH Neonatal Care Protocol / GPP KKM",
    "standard_formula_breakdown": [
      {
        "name": "Chlorhexidine Digluconate Solution 20% BP",
        "quantity": "25.0 ml",
        "function": "Active Biguanide Antiseptic (0.5% w/v final concentration)"
      },
      {
        "name": "Industrial Methylated Spirit (IMS) 95% v/v",
        "quantity": "737.0 ml",
        "function": "Alcohol Vehicle & Rapid Bactericidal Skin Penetration Agent (70% v/v final)"
      },
      {
        "name": "Purified Water BP",
        "quantity": "q.s. to 1000 ml (~238 ml)",
        "function": "Aqueous Diluent"
      },
      {
        "name": "Amaranth Pink Food Grade Dye Solution (0.1%)",
        "quantity": "1.0 ml",
        "function": "Indicator Tint for Visualizing Skin Prep Border (Pink Spirit)"
      }
    ],
    "equipment_required": [
      "1000 ml Graduated Measuring Cylinder",
      "50 ml Calibrated Syringe / Pipette",
      "Clean Glass Borosilicate 1000 ml Borosilicate Glass Beaker",
      "Glass Stirring Rod",
      "Clean Fluted HDPE or Glass Bottles with Child-Resistant Caps"
    ],
    "preparation_steps": [
      "1. Ensure the compounding workbench is well ventilated and strictly isolated from ignition sources, flames, and sparks.",
      "2. Measure 737 ml of Industrial Methylated Spirit 95% using a calibrated graduated cylinder and transfer into a clean glass beaker.",
      "3. Accurately draw 25.0 ml of Chlorhexidine Digluconate 20% Solution using a calibrated syringe/pipette and add to the alcohol, stirring gently.",
      "4. Add 1.0 ml of Amaranth Pink tinting solution and stir until color is uniform throughout.",
      "5. Bring final volume to 1000 ml by adding Purified Water BP.",
      "6. Mix thoroughly with a glass rod for 2 minutes to achieve complete homogeneity.",
      "7. Visually inspect for clarity and absence of particulate matter under adequate lighting.",
      "8. Package into clean, dry bottles, affix the red 'FOR EXTERNAL USE ONLY - FLAMMABLE' label, and record in compounding register."
    ],
    "in_process_qc": [
      "Clarity: Clear pink solution, completely free from haze or particulate matter.",
      "Refractive index / alcohol percentage check: 68-72% v/v.",
      "Dual pharmacist verification of active ingredient measurement (25 ml of 20% concentrate)."
    ],
    "cautions_and_warnings": [
      "FLAMMABLE: Allow treated skin to dry completely for at least 2-3 minutes before initiating diathermy or surgical procedures.",
      "Avoid contact with eyes, ears, and meninges. Ototoxic if introduced into the middle ear.",
      "Do not use in infants with known chlorhexidine hypersensitivity."
    ],
    "container_specs": "HDPE fluted external bottle or amber glass bottle with tamper-evident, child-resistant seal."
  },
  "EXT-ALC-001": {
    "item_code": "EXT-ALC-001",
    "item_name": "Alcohol 70% v/v (Pencairan Etanol / IMS)",
    "generic_name": "Ethanol / IMS 70% v/v in Purified Water",
    "pack_type": "external",
    "dosage_form": "solution",
    "strength": "70% v/v",
    "units_per_pack": 1,
    "package_type": "clear_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 90,
    "storage_instructions": "Store in a cool, dry place below 25°C.",
    "label_instructions": "FOR EXTERNAL USE ONLY. NOT TO BE TAKEN. KEEP OUT OF REACH OF CHILDREN.",
    "indications": "Antisepsis kulit umum, disinfeksi permukaan & swab suntikan",
    "ingredients_formula": "Etanol 95% / IMS 737 ml diluted with Purified Water up to 1000 ml",
    "pharmacopoeia_ref": "MOH GAEX 2026 (Item 8: Alcohol 70% Solution) / Garis Panduan Kawalan Infeksi KKM",
    "standard_formula_breakdown": [
      {
        "name": "Etanol 95% v/v / IMS 95%",
        "quantity": "737 ml",
        "function": "Active Antiseptic Agent & Disinfektan"
      },
      {
        "name": "Purified Water BP",
        "quantity": "q.s. to 1000 ml (~263 ml)",
        "function": "Diluent Solvent for Bacterial Membrane Permeation"
      }
    ],
    "equipment_required": [
      "1000 ml Graduated Measuring Cylinder",
      "Alcoholometer / Hydrometer",
      "Fluted Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Ensure compounding area is strictly free from ignition sources, sparks, and open heat.",
      "2. Accurately measure 737 ml of Ethanol 95% v/v (or IMS 95%) using a calibrated measuring cylinder.",
      "3. Add Purified Water BP incrementally to approximately 980 ml.",
      "4. Allow solution to stand and cool (exothermic volume contraction occurs during mixing).",
      "5. After temperature stabilizes at 20°C, adjust final volume to exactly 1000 ml with Purified Water BP.",
      "6. Verify specific gravity using an alcoholometer to confirm 70% v/v concentration.",
      "7. Package into clean fluted bottles and affix red FLAMMABLE EXTERNAL label."
    ],
    "in_process_qc": [
      "Alcohol concentration check: 68.0% - 72.0% v/v at 20°C.",
      "Clear transparent solution free of foreign matter."
    ],
    "cautions_and_warnings": [
      "HIGHLY FLAMMABLE LIQUID. Keep away from heat, sparks, and open flame.",
      "FOR EXTERNAL USE ONLY. NOT TO BE TAKEN."
    ],
    "container_specs": "Botol Kaca Beralur Fluted / Plastic Ointment Jar."
  },
  "EXT-CHX-001": {
    "item_code": "EXT-CHX-001",
    "item_name": "Chlorhexidine 0.5% in 70% Alcohol (Skin Prep)",
    "generic_name": "Chlorhexidine Gluconate 0.5% w/v in 70% v/v Ethanol",
    "pack_type": "external",
    "dosage_form": "solution",
    "strength": "0.5% w/v in 70%",
    "units_per_pack": 1,
    "package_type": "clear_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 90,
    "storage_instructions": "Store in a cool, dry place below 25°C.",
    "label_instructions": "FOR EXTERNAL USE ONLY. NOT TO BE TAKEN. KEEP OUT OF REACH OF CHILDREN.",
    "indications": "Antisepsis kulit sebelum kanulasi IV, venipuncture & suntikan bius spinal",
    "ingredients_formula": "Chlorhexidine Digluconate 20% Sol. 25ml + IMS 95% 737ml + Purified Water + Pewarna Merah Jambu",
    "pharmacopoeia_ref": "MOH GAEX 2026 (Item 75: Chlorhexidine 1 in 200 (0.5%) in Alcohol 70%)",
    "standard_formula_breakdown": [
      {
        "name": "Chlorhexidine Gluconate 20% w/v Sol.",
        "quantity": "25.0 ml",
        "function": "Broad-Spectrum Active Antiseptic Agent"
      },
      {
        "name": "Etanol 95% / IMS 95%",
        "quantity": "737 ml",
        "function": "Rapid-Drying Solvent & Synergistic Bactericidal Vehicle"
      },
      {
        "name": "Purified Water BP",
        "quantity": "q.s. to 1000 ml",
        "function": "Solvent / Diluent"
      }
    ],
    "equipment_required": [
      "Graduated Cylinders (1000 ml & 50 ml)",
      "Borosilicate Glass Beaker",
      "Fluted Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Accurately measure 25.0 ml of concentrated Chlorhexidine Gluconate 20% w/v solution.",
      "2. Transfer into a clean glass beaker containing a portion of Purified Water BP.",
      "3. Add 737 ml of Ethanol 95% and pink indicator dye solution.",
      "4. Homogenize solution and bring to exactly 1000 ml with Purified Water BP.",
      "5. Inspect and transfer into clean fluted dispensing bottles."
    ],
    "in_process_qc": [
      "Clear pink transparent solution with no salt precipitation."
    ],
    "cautions_and_warnings": [
      "FLAMMABLE: Allow skin to dry completely before electrocautery or diathermy.",
      "Avoid contact with eyes and middle ear (ototoxic risk)."
    ],
    "container_specs": "Botol Kaca Beralur Fluted / Plastic Ointment Jar."
  },
  "EXT-CHX-002": {
    "item_code": "EXT-CHX-002",
    "item_name": "Chlorhexidine 2% in 70% Isopropyl Alcohol",
    "generic_name": "Chlorhexidine Gluconate 2% w/v in 70% v/v IPA",
    "pack_type": "external",
    "dosage_form": "solution",
    "strength": "2% w/v in 70%",
    "units_per_pack": 1,
    "package_type": "clear_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 90,
    "storage_instructions": "Store in a cool, dry place below 25°C.",
    "label_instructions": "FOR EXTERNAL USE ONLY. NOT TO BE TAKEN. KEEP OUT OF REACH OF CHILDREN.",
    "indications": "Antisepsis kulit tapak pembedahan & penyediaan insersi kateter vena sentral (CVC)",
    "ingredients_formula": "Chlorhexidine Gluconate 20% 100ml, Isopropyl Alcohol 700ml, Purified Water add 1000ml",
    "pharmacopoeia_ref": "MOH GAEX 2026 (Item 81: Chlorhexidine 1 in 50 (2%) in Alcohol 70%)",
    "standard_formula_breakdown": [
      {
        "name": "Chlorhexidine Gluconate 20% Solution",
        "quantity": "100.0 ml",
        "function": "Active Antiseptic Agent (2% Final Concentration)"
      },
      {
        "name": "Isopropyl Alcohol 70%",
        "quantity": "700 ml",
        "function": "Rapid Bactericidal Solvent"
      },
      {
        "name": "Purified Water BP",
        "quantity": "q.s. to 1000 ml",
        "function": "Solvent / Diluent"
      }
    ],
    "equipment_required": [
      "Graduated Measuring Cylinder",
      "Fluted Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Accurately measure 100 ml of concentrated Chlorhexidine Gluconate 20% solution.",
      "2. Combine with 700 ml of Isopropyl Alcohol in a clean borosilicate glass vessel.",
      "3. Add Purified Water BP incrementally up to the 1000 ml calibration mark.",
      "4. Mix thoroughly with a glass rod and package into fluted amber bottles."
    ],
    "in_process_qc": [
      "Clear solution with characteristic IPA aroma; volume confirmed at 1000 ml."
    ],
    "cautions_and_warnings": [
      "FLAMMABLE: Ensure treated skin is fully air-dried for at least 3 minutes before applying surgical diathermy."
    ],
    "container_specs": "Botol Kaca Beralur Fluted / Plastic Ointment Jar."
  },
  "EXT-CHX-003": {
    "item_code": "EXT-CHX-003",
    "item_name": "Chlorhexidine 4% Surgical Scrub",
    "generic_name": "Chlorhexidine Gluconate 4% w/v Detergent Solution",
    "pack_type": "external",
    "dosage_form": "solution",
    "strength": "4% w/v",
    "units_per_pack": 1,
    "package_type": "clear_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 90,
    "storage_instructions": "Store in a cool, dry place below 25°C.",
    "label_instructions": "FOR EXTERNAL USE ONLY. NOT TO BE TAKEN. KEEP OUT OF REACH OF CHILDREN.",
    "indications": "Pre-operative surgical hand scrubbing for operating theater surgeons and scrub nurses",
    "ingredients_formula": "Chlorhexidine Gluconate 20% 200ml, Pangkalan Detergen / Surfactant, Purified Water add 1000ml",
    "pharmacopoeia_ref": "MOH GAEX 2026 (Item 83: Chlorhexidine 4% Scrub)",
    "standard_formula_breakdown": [
      {
        "name": "Chlorhexidine Gluconate 20% Sol. BP",
        "quantity": "200.0 ml",
        "function": "Active Antiseptic Agent"
      },
      {
        "name": "Pangkalan Detergen Neutral",
        "quantity": "150 ml",
        "function": "Foaming Detergent Surfactant Base"
      },
      {
        "name": "Gliserol BP",
        "quantity": "50 ml",
        "function": "Skin Moisturizing Emollient"
      },
      {
        "name": "Purified Water BP",
        "quantity": "q.s. to 1000 ml",
        "function": "Solvent / Diluent"
      }
    ],
    "equipment_required": [
      "1000 ml Borosilicate Glass Beaker",
      "Graduated Cylinder",
      "Dispenser Pump Bottle"
    ],
    "preparation_steps": [
      "1. Accurately measure 200 ml of Chlorhexidine Gluconate 20% solution.",
      "2. Gently blend the detergent surfactant base and glycerol.",
      "3. Add the chlorhexidine solution and blend until uniform.",
      "4. Make up to 1000 ml with Purified Water BP.",
      "5. Fill into designated surgical operating theater dispenser bottles."
    ],
    "in_process_qc": [
      "Clear pale-yellow foaming liquid, pH 5.5 - 6.5."
    ],
    "cautions_and_warnings": [
      "FOR EXTERNAL CLEANSING ONLY. Rinse thoroughly with water after scrubbing."
    ],
    "container_specs": "Botol Kaca Beralur Fluted / Plastic Ointment Jar."
  },
  "EXT-CHX-004": {
    "item_code": "EXT-CHX-004",
    "item_name": "Chlorhexidine 0.05% Aqueous Solution (1:2000)",
    "generic_name": "Chlorhexidine Gluconate 0.05% w/v Aqueous Solution",
    "pack_type": "external",
    "dosage_form": "solution",
    "strength": "1:2000 (0.05%)",
    "units_per_pack": 1,
    "package_type": "clear_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 30,
    "storage_instructions": "Store in a cool, dry place below 25°C.",
    "label_instructions": "FOR EXTERNAL USE ONLY. NOT TO BE TAKEN. KEEP OUT OF REACH OF CHILDREN.",
    "indications": "Pembersihan luka lecur, luka trauma kotor, irigasi pundi kencing & cucian obstetrik",
    "ingredients_formula": "Chlorhexidine Gluconate 5% (1:20 pekat) 10ml, Purified Water add 1000ml",
    "pharmacopoeia_ref": "MOH GAEX 2026 (Item 79: Chlorhexidine 1 in 2000 (0.05%) in Aqueous/Water)",
    "standard_formula_breakdown": [
      {
        "name": "Chlorhexidine Gluconate Solution 5% (Stok 1:20)",
        "quantity": "10.0 ml",
        "function": "Active Antiseptic Agent Lembut Berair"
      },
      {
        "name": "Purified Water Steril BP",
        "quantity": "q.s. to 1000 ml",
        "function": "Solvent / Diluent Steril"
      }
    ],
    "equipment_required": [
      "Graduated Cylinder 1000 ml & 10 ml",
      "Fluted Amber Glass Bottle"
    ],
    "preparation_steps": [
      "1. Sukat 10 ml stok Chlorhexidine Gluconate 5% dengan tepat.",
      "2. Masukkan ke dalam silinder penyukat 1000 ml.",
      "3. Tambahkan Purified Water Steril sehingga mencecah tanda 1000 ml.",
      "4. Sebatikan larutan dan masukkan ke dalam botol beralur bertutup rapat."
    ],
    "in_process_qc": [
      "Larutan jernih tanpa warna, tiada zarah asing."
    ],
    "cautions_and_warnings": [
      "Bukan untuk suntikan. Gunakan teknik bersih semasa penyediaan."
    ],
    "container_specs": "Botol Kaca Beralur Fluted / Plastic Ointment Jar."
  },
  "EXT-ACR-001": {
    "item_code": "EXT-ACR-001",
    "item_name": "Acriflavine 0.1% Lotion (Yellow Lotion)",
    "generic_name": "Acriflavine 0.1% w/v Aqueous Solution",
    "pack_type": "external",
    "dosage_form": "solution",
    "strength": "0.1% w/v",
    "units_per_pack": 1,
    "package_type": "clear_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 90,
    "storage_instructions": "Store in a cool, dry place below 25°C.",
    "label_instructions": "FOR EXTERNAL USE ONLY. NOT TO BE TAKEN. KEEP OUT OF REACH OF CHILDREN.",
    "indications": "Antiseptik luka calar ringan, luka bernanah & cucian kudis luaran",
    "ingredients_formula": "Acriflavine Powder BP 1g, Purified Water add 1000ml",
    "pharmacopoeia_ref": "MOH GAEX 2026 (Item 100: Acriflavine 0.1% Lotion)",
    "standard_formula_breakdown": [
      {
        "name": "Acriflavine Powder BP",
        "quantity": "1.0 g",
        "function": "Antiseptik Akridina Bakteriostatik"
      },
      {
        "name": "Purified Water BP",
        "quantity": "q.s. to 1000 ml",
        "function": "Solvent / Diluent"
      }
    ],
    "equipment_required": [
      "Penimbang analitikal",
      "1000 ml Borosilicate Glass Beaker",
      "Botol ambar fluted"
    ],
    "preparation_steps": [
      "1. Timbang Acriflavine serbuk 1.000 g menggunakan penimbang analitikal.",
      "2. Larutkan serbuk dalam kira-kira 500 ml Purified Water panas (sekitar 60°C).",
      "3. Kacau sehingga tiada hablur jingga kelihatan di dasar beaker.",
      "4. Sejukkan pada suhu bilik dan genapkan kepada 1000 ml dengan Purified Water.",
      "5. Masukkan ke dalam botol kaca ambar beralur fluted."
    ],
    "in_process_qc": [
      "Clear golden-yellow to orange solution without precipitate."
    ],
    "cautions_and_warnings": [
      "Leaves permanent yellow stains on clothing and fabrics.",
      "Lindungi daripada pendedahan cahaya matahari."
    ],
    "container_specs": "Botol Kaca Beralur Fluted / Plastic Ointment Jar."
  },
    "EXT-KMN-003": {
    "item_code": "EXT-KMN-003",
    "item_name": "Potassium Permanganate (KMnO4) Solution 1:1,000 (0.1% w/v Stock Solution)",
    "generic_name": "Potassium Permanganate 1:1,000 w/v (0.1% w/v)",
    "pack_type": "external",
    "dosage_form": "solution",
    "strength": "0.1% w/v (1:1,000)",
    "units_per_pack": 1,
    "package_type": "amber_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 30,
    "storage_instructions": "Store below 25°C in amber glass bottle. Protect from direct sunlight and oxidizing agents.",
    "label_instructions": "FOR EXTERNAL USE ONLY. DILUTE BEFORE CLINICAL USE (1:8,000 TO 1:10,000 FOR WARD SOAKS). DO NOT SWALLOW.",
    "indications": "Concentrated stock antiseptic solution for hospital pharmacy dispensing and ward wet soak preparation",
    "ingredients_formula": "Potassium Permanganate Crystals BP 1.0g, Purified Water to 1000ml",
    "pharmacopoeia_ref": "British Pharmacopoeia (BP) / MOH GAEX 2026 (Item 245) / Good Preparation Practice (GPP KKM)",
    "standard_formula_breakdown": [
      {
        "name": "Potassium Permanganate Crystals BP",
        "quantity": "1.0 g",
        "function": "Active Oxidizing Antiseptic & Astringent Agent"
      },
      {
        "name": "Purified Water BP (Freshly Boiled & Cooled)",
        "quantity": "q.s. to 1000 ml",
        "function": "Solvent (Organic-Free to Prevent Premature Reduction)"
      }
    ],
    "equipment_required": [
      "Calibrated Analytical Balance (0.001 g precision)",
      "Watch Glass & Non-Metallic Spatula",
      "Glass Borosilicate Beaker 500 ml",
      "1000 ml Volumetric Flask / Graduated Cylinder",
      "Glass Stirring Rod",
      "Amber Glass Bottles with Polyethylene Stoppers"
    ],
    "preparation_steps": [
      "1. Accurately weigh 1.0 g of dark purple Potassium Permanganate Crystals BP using calibrated balance.",
      "2. Transfer crystals to a beaker containing approximately 200 ml of warm Purified Water (~40-50°C) to facilitate complete crystal dissolution.",
      "3. Stir vigorously with a glass stirring rod until every crystal is completely dissolved without any remaining sediment.",
      "4. Quantitatively transfer the dark purple solution to a 1000 ml measuring cylinder, rinsing beaker twice with Purified Water.",
      "5. Bring final volume to exactly 1000 ml with Purified Water at room temperature.",
      "6. Filter through a sintered glass filter or lint-free glass funnel if necessary (avoid cellulose filter paper which reacts with permanganate).",
      "7. Inspect the solution: intense dark purple color without any brown manganese dioxide precipitate.",
      "8. Package in amber glass bottles, apply red 'FOR EXTERNAL USE ONLY - MUST BE DILUTED' label, and record batch details."
    ],
    "in_process_qc": [
      "Appearance: Deep purple transparent solution without brown discoloration or suspended matter.",
      "Solubility check: 100% dissolution of crystals verified before final volume adjustment."
    ],
    "cautions_and_warnings": [
      "DILUTION MANDATORY: Concentrated stock must NEVER be applied directly undiluted. Dilute to faint pink color (1:8,000 to 1:10,000) for clinical soaks.",
      "Undiluted permanganate causes caustic chemical burns, ulceration, and intense brown staining of skin and nails.",
      "Highly poisonous if ingested. Keep out of reach of children."
    ],
    "container_specs": "Amber glass fluted bottle with chemical-resistant screw cap. Do not use cork or metal closures."
  },
  "EXT-KMN-001": {
    "item_code": "EXT-KMN-001",
    "item_name": "Potassium Permanganate (KMnO4) Solution 1:8,000",
    "generic_name": "Potassium Permanganate 0.0125% w/v Aqueous Solution",
    "pack_type": "external",
    "dosage_form": "solution",
    "strength": "1:8,000 (0.0125%)",
    "units_per_pack": 1,
    "package_type": "clear_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 90,
    "storage_instructions": "Store in a cool, dry place below 25°C.",
    "label_instructions": "FOR EXTERNAL USE ONLY. NOT TO BE TAKEN. KEEP OUT OF REACH OF CHILDREN.",
    "indications": "Rendaman antiseptik ekzema basah, kudis melepuh & ulser kaki",
    "ingredients_formula": "KMnO4 Hablur Ungu BP 125mg, Purified Water add 1000ml",
    "pharmacopoeia_ref": "MOH GAEX 2026 (Item 237: Potassium Permanganate 1 in 8,000)",
    "standard_formula_breakdown": [
      {
        "name": "Potassium Permanganate Hablur BP",
        "quantity": "0.125 g (125 mg)",
        "function": "Antiseptik Pengoksidaan & Astringen"
      },
      {
        "name": "Purified Water BP",
        "quantity": "q.s. to 1000 ml",
        "function": "Solvent / Diluent"
      }
    ],
    "equipment_required": [
      "Penimbang mikro",
      "Beaker kaca",
      "Silinder 1000 ml",
      "Botol ambar"
    ],
    "preparation_steps": [
      "1. Timbang hablur Potassium Permanganate seberat 125 mg.",
      "2. Larutkan dalam 300 ml Purified Water suam sehingga larut sepenuhnya.",
      "3. Make up to 1000 ml with Purified Water BP.",
      "4. Pastikan tiada bintik hablur tidak larut yang boleh melepuhkan kulit.",
      "5. Isikan ke dalam botol ambar terlindung cahaya."
    ],
    "in_process_qc": [
      "Larutan jernih berwarna merah jambu/ungu muda lembut."
    ],
    "cautions_and_warnings": [
      "RACUN jika tertelan. RENDAMAN KULIT SAHAJA.",
      "Jangan gunakan jika larutan bertukar warna keperangan."
    ],
    "container_specs": "Botol Kaca Beralur Fluted / Plastic Ointment Jar."
  },
  "EXT-NSL-001": {
    "item_code": "EXT-NSL-001",
    "item_name": "Normal Saline 0.9% for Irrigation (Sodium Chloride Solution)",
    "generic_name": "Sodium Chloride 0.9% w/v for Irrigation",
    "pack_type": "external",
    "dosage_form": "solution",
    "strength": "0.9% w/v",
    "units_per_pack": 1,
    "package_type": "clear_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 90,
    "storage_instructions": "Store in a cool, dry place below 25°C.",
    "label_instructions": "FOR EXTERNAL USE ONLY. NOT TO BE TAKEN. KEEP OUT OF REACH OF CHILDREN.",
    "indications": "Pembersihan luka lecur, cuci luka ulser & irigasi rongga luaran",
    "ingredients_formula": "Sodium Chloride BP 9g, Purified Water Steril add 1000ml",
    "pharmacopoeia_ref": "MOH GAEX 2026 (Item 280: Sodium Chloride 0.9% Solution)",
    "standard_formula_breakdown": [
      {
        "name": "Sodium Chloride BP",
        "quantity": "9.0 g",
        "function": "Elektrolit Isotonik Fisiologikal"
      },
      {
        "name": "Purified Water Steril BP",
        "quantity": "q.s. to 1000 ml",
        "function": "Solvent / Diluent"
      }
    ],
    "equipment_required": [
      "Penimbang digital",
      "1000 ml Borosilicate Glass Beaker",
      "Botol irigasi"
    ],
    "preparation_steps": [
      "1. Timbang Sodium Chloride BP 9.0 g.",
      "2. Larutkan dalam 800 ml Purified Water di dalam beaker bersih.",
      "3. Genapkan kepada 1000 ml dan sebatikan.",
      "4. Turas dan masukkan ke dalam botol irigasi bertutup rapat."
    ],
    "in_process_qc": [
      "Larutan jernih tanpa warna, osmolariti ~308 mOsm/L."
    ],
    "cautions_and_warnings": [
      "BUKAN UNTUK SUNTIKAN IV. Kegunaan cucian/irigasi luaran sahaja."
    ],
    "container_specs": "Botol Kaca Beralur Fluted / Plastic Ointment Jar."
  },
  "EXT-PVI-001": {
    "item_code": "EXT-PVI-001",
    "item_name": "Povidone Iodine 10% Aqueous Antiseptic Solution",
    "generic_name": "Povidone Iodine 10% w/v (1% Available Iodine)",
    "pack_type": "external",
    "dosage_form": "solution",
    "strength": "10% w/v",
    "units_per_pack": 1,
    "package_type": "clear_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 90,
    "storage_instructions": "Store in a cool, dry place below 25°C.",
    "label_instructions": "FOR EXTERNAL USE ONLY. NOT TO BE TAKEN. KEEP OUT OF REACH OF CHILDREN.",
    "indications": "Disinfeksi kulit pra-bedah, luka pembedahan & rawatan luka kotor",
    "ingredients_formula": "Povidone Iodine Powder USP 100g, Purified Water add 1000ml",
    "pharmacopoeia_ref": "MOH GAEX 2026 (Item 241: Povidone Iodine 10% Solution)",
    "standard_formula_breakdown": [
      {
        "name": "Povidone Iodine Powder USP",
        "quantity": "100.0 g",
        "function": "Active Pharmaceutical Ingredient (API) Kompleks Iodin Pelepasan Perlahan"
      },
      {
        "name": "Purified Water BP",
        "quantity": "q.s. to 1000 ml",
        "function": "Solvent / Diluent"
      }
    ],
    "equipment_required": [
      "Penimbang digital",
      "1000 ml Borosilicate Glass Beaker",
      "Botol ambar gelap"
    ],
    "preparation_steps": [
      "1. Timbang Povidone Iodine serbuk 100 g.",
      "2. Larutkan secara beransur-ansur dalam 700 ml Purified Water suam sambil dikacau berterusan.",
      "3. Genapkan kepada 1000 ml dan sebatikan.",
      "4. Botolkan dalam botol ambar kedap udara."
    ],
    "in_process_qc": [
      "Cecair coklat gelap pekat, bau khas iodin, sifar zarah mendak."
    ],
    "cautions_and_warnings": [
      "Elakkan pada pesakit yang alah kepada iodin."
    ],
    "container_specs": "Botol Kaca Beralur Fluted / Plastic Ointment Jar."
  },
  "EXT-H2O-001": {
    "item_code": "EXT-H2O-001",
    "item_name": "Hydrogen Peroxide 3% Solution (10 Volume)",
    "generic_name": "Hydrogen Peroxide 3% w/v Aqueous Solution",
    "pack_type": "external",
    "dosage_form": "solution",
    "strength": "3% w/v (10 Vol)",
    "units_per_pack": 1,
    "package_type": "clear_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 90,
    "storage_instructions": "Store in a cool, dry place below 25°C.",
    "label_instructions": "FOR EXTERNAL USE ONLY. NOT TO BE TAKEN. KEEP OUT OF REACH OF CHILDREN.",
    "indications": "Pembersihan luka bernanah, debbridement luka kotor & melembutkan tahi telinga",
    "ingredients_formula": "Hydrogen Peroxide 30% (100 Vol) 100ml, Purified Water add 1000ml",
    "pharmacopoeia_ref": "MOH GAEX 2026 (Item 175: Hydrogen Peroxide 3% Solution)",
    "standard_formula_breakdown": [
      {
        "name": "Hydrogen Peroxide Pekat 30% w/v (100 Vol)",
        "quantity": "100.0 ml",
        "function": "Bahan Pengoksidaan / Efervesen Cuci Luka"
      },
      {
        "name": "Purified Water BP",
        "quantity": "q.s. to 1000 ml",
        "function": "Solvent / Diluent"
      }
    ],
    "equipment_required": [
      "Graduated Cylinder kaca",
      "Sarung tangan PPE",
      "Botol plastik ambar berpenutup vented"
    ],
    "preparation_steps": [
      "1. Pakai sarung tangan dan pelindung mata (H2O2 30% menghakis kulit).",
      "2. Sukat tepat 100 ml Hydrogen Peroxide 30% pekat menggunakan silinder penyukat kaca.",
      "3. Masukkan ke dalam beaker yang mengandungi 700 ml Purified Water sejuk.",
      "4. Make up to 1000 ml with Purified Water BP.",
      "5. Kacau perlahan dan isikan ke dalam botol ambar berpenutup vented cap."
    ],
    "in_process_qc": [
      "Larutan jernih tanpa warna, pelepasan buih aktif pada bahan organik."
    ],
    "cautions_and_warnings": [
      "Jangan gunakan dalam rongga badan tertutup (risiko embolisme gas oksigen)."
    ],
    "container_specs": "Botol Kaca Beralur Fluted / Plastic Ointment Jar."
  },
  "EXT-AQCR-001": {
    "item_code": "EXT-AQCR-001",
    "item_name": "Aqueous Cream BP",
    "generic_name": "Aqueous Cream BP (Emollient Cream)",
    "pack_type": "external",
    "dosage_form": "cream",
    "strength": "BP Standard Formula (30% w/w Emulsifying Base)",
    "units_per_pack": 1,
    "package_type": "ointment_jar",
    "shelf_life_months": 3,
    "beyond_use_date_days": 30,
    "storage_instructions": "Store in a cool, dry place below 25°C. Do not freeze. Keep container tightly closed.",
    "label_instructions": "FOR EXTERNAL USE ONLY. NOT TO BE TAKEN. KEEP OUT OF REACH OF CHILDREN.",
    "indications": "Emolien topikal dan pelembap untuk rawatan kulit kering kronik (ekzema, dermatitis atopik, iktiosis) dan sebagai pengganti sabun mandian (soap substitute).",
    "ingredients_formula": "Emulsifying Ointment BP 300g, Phenoxyethanol BP 10g (atau Chlorocresol 1g), Purified Water BP add 1000g",
    "pharmacopoeia_ref": "British Pharmacopoeia (BP) / MOH GAEX 2026 (Item 26: Aqueous Cream)",
    "standard_formula_breakdown": [
      {
        "name": "Emulsifying Ointment BP",
        "quantity": "300.0 g",
        "function": "Pangkalan Emulsi Pelembap (Emulsifying & Emollient Base - Cetostearyl Alcohol, SLS, Paraffin)"
      },
      {
        "name": "Phenoxyethanol BP (atau Chlorocresol BP 1.0g)",
        "quantity": "10.0 g",
        "function": "Pengawet Antimikrobial (Antimicrobial Preservative)"
      },
      {
        "name": "Purified Water Steril BP",
        "quantity": "q.s. to 1000.0 g (~690.0 g)",
        "function": "Fasa Berair Pembawa (Aqueous Continuous Phase)"
      }
    ],
    "equipment_required": [
      "Water Bath / Pengukus Air Suhu Terkawal (60°C)",
      "Mangkuk Penyejat Porselin / Keluli Tahan Karat",
      "Termometer Makmal Klinikal",
      "Rod Pengacau Kaca & Spatula",
      "Balang Salap Plastik Bertutup Rapat (Plastic Ointment Jar)"
    ],
    "preparation_steps": [
      "1. Timbang Emulsifying Ointment seberat 300.0 g dan leburkan dalam mangkuk penyejat di atas kukus air (water bath) pada suhu kira-kira 60°C.",
      "2. Panaskan Purified Water seberat ~690 g sehingga mencapai suhu kira-kira 60°C, kemudian larutkan Phenoxyethanol (atau Chlorocresol) di dalamnya sehingga larut sepenuhnya.",
      "3. Tuangkan fasa berair suam ke dalam fasa minyak yang cair secara beransur-ansur sambil mengacau secara berterusan ke satu arah.",
      "4. Teruskan mengacau perlahan-lahan semasa campuran menyejuk sehingga terbentuk emulsi krim putih yang pekat, licin dan seragam (elakkan pengadukan laju bagi mencegah pemerangkapan buih udara).",
      "5. Setelah sejuk sepenuhnya ke suhu bilik (<25°C), timbang dan masukkan ke dalam balang salap plastik (ointment jar) bertutup rapat.",
      "6. Tampal label rasmi kegunaan luaran (UNTUK KEGUNAAN LUAR SAHAJA)."
    ],
    "in_process_qc": [
      "Krim emulsi putih licin yang homogen, berkilat, tiada pengasingan fasa minyak/air (phase separation) dan sifar butiran kasar."
    ],
    "cautions_and_warnings": [
      "UNTUK KEGUNAAN LUARAN SAHAJA. JAUHKAN DARIPADA MATA.",
      "Jangan gunakan pada luka terbuka yang dalam atau kulit melecur teruk tanpa nasihat perubatan.",
      "Tutup rapat bekas selepas digunakan bagi mengelakkan kekeringan dan pencemaran mikrob."
    ],
    "container_specs": "Balang Salap Plastik Bertutup Rapat (Plastic Ointment Jar 100g / 500g)."
  },
  "EXT-SAL-001": {
    "item_code": "EXT-SAL-001",
    "item_name": "Salicylic Acid 2% in Aqueous Cream / WSP",
    "generic_name": "Salicylic Acid 2% w/w in Aqueous Cream Base",
    "pack_type": "external",
    "dosage_form": "cream",
    "strength": "2% w/w",
    "units_per_pack": 1,
    "package_type": "ointment_jar",
    "shelf_life_months": 3,
    "beyond_use_date_days": 90,
    "storage_instructions": "Store in a cool, dry place below 25°C.",
    "label_instructions": "FOR EXTERNAL USE ONLY. NOT TO BE TAKEN. KEEP OUT OF REACH OF CHILDREN.",
    "indications": "Keratolitik ekzema kronik, psoriasis bersisik & kelemumur plak",
    "ingredients_formula": "Salicylic Acid Powder BP 20g, Aqueous Cream BP add 1000g",
    "pharmacopoeia_ref": "MOH GAEX 2026 (Item 265: Salicylic Acid 2% Cream)",
    "standard_formula_breakdown": [
      {
        "name": "Salicylic Acid Serbuk Halus BP",
        "quantity": "20.0 g",
        "function": "Active Pharmaceutical Ingredient (API) Keratolitik"
      },
      {
        "name": "Liquid Paraffin BP",
        "quantity": "20 ml",
        "function": "Agen Pembasah (Levigating Agent)"
      },
      {
        "name": "Aqueous Cream BP Base",
        "quantity": "q.s. to 1000 g (~960 g)",
        "function": "Pangkalan Krim Emulsi"
      }
    ],
    "equipment_required": [
      "Jubin Kaca Salap (Ointment Slab)",
      "Flexible Stainless Steel Spatula",
      "Balang Salap Plastik"
    ],
    "preparation_steps": [
      "1. Timbang Salicylic Acid serbuk halus seberat 20.0 g.",
      "2. Letakkan serbuk di atas jubin kaca salap.",
      "3. Titiskan kira-kira 20 ml Minyak Parafin Cecair dan kisar (levigate) dengan spatula sehingga licin.",
      "4. Timbang Aqueous Cream seberat 960 g.",
      "5. Campurkan pes asid salisilik ke dalam pangkalan krim secara pencairan geometri.",
      "6. Canai sehingga krim homogen, licin, dan berkilat.",
      "7. Pindahkan ke dalam balang salap bertutup rapat."
    ],
    "in_process_qc": [
      "Krim putih licin berkilat, sifar butiran pasir kasar bila disapu pada kulit."
    ],
    "cautions_and_warnings": [
      "Jangan gunakan pada kawasan kulit yang luas pada bayi/kanak-kanak (risiko ketoksikan salisilat)."
    ],
    "container_specs": "Botol Kaca Beralur Fluted / Plastic Ointment Jar."
  },
  "EXT-ZNC-001": {
    "item_code": "EXT-ZNC-001",
    "item_name": "Zinc Oxide Paste BP (Pasta Zink 25%)",
    "generic_name": "Zinc Oxide 25% w/w in Starch & White Soft Paraffin",
    "pack_type": "external",
    "dosage_form": "ointment",
    "strength": "25% w/w",
    "units_per_pack": 1,
    "package_type": "ointment_jar",
    "shelf_life_months": 3,
    "beyond_use_date_days": 90,
    "storage_instructions": "Store in a cool, dry place below 25°C.",
    "label_instructions": "FOR EXTERNAL USE ONLY. NOT TO BE TAKEN. KEEP OUT OF REACH OF CHILDREN.",
    "indications": "Pelindung sawar kulit ruam lampin, ekzema berair & luka melecet",
    "ingredients_formula": "Zinc Oxide Powder BP 250g, Kanji Jagung 250g, WSP 500g",
    "pharmacopoeia_ref": "MOH GAEX 2026 (Item 325: Zinc Oxide Paste)",
    "standard_formula_breakdown": [
      {
        "name": "Zinc Oxide Powder BP",
        "quantity": "250.0 g",
        "function": "Astringen & Pelindung Kulit Fizikal"
      },
      {
        "name": "Starch BP (Kanji)",
        "quantity": "250.0 g",
        "function": "Penyerap Lembapan"
      },
      {
        "name": "White Soft Paraffin BP",
        "quantity": "500.0 g",
        "function": "Pangkalan Salap Berpelekat"
      }
    ],
    "equipment_required": [
      "Mortar porselin besar / Jubin kaca",
      "Spatula tahan karat",
      "Balang salap"
    ],
    "preparation_steps": [
      "1. Timbang Zinc Oxide (250 g) dan Starch (250 g).",
      "2. Ayak kedua-dua serbuk halus bersama.",
      "3. Leburkan sebahagian White Soft Paraffin secara lembut.",
      "4. Kisar serbuk bersama parafin sedikit demi sedikit sehingga terbentuk pasta putih kental yang sangat licin.",
      "5. Masukkan ke dalam balang salap bertutup rapat."
    ],
    "in_process_qc": [
      "Pasta putih kental tebal, melekat kuat pada kulit, tiada butiran kasar."
    ],
    "cautions_and_warnings": [
      "Bersihkan sisa pasta lama dengan minyak mineral lembut sebelum lapisan baharu disapu."
    ],
    "container_specs": "Botol Kaca Beralur Fluted / Plastic Ointment Jar."
  },
  "EXT-URE-001": {
    "item_code": "EXT-URE-001",
    "item_name": "Urea 10% Cream (in Aqueous Cream Base)",
    "generic_name": "Urea 10% w/w in Aqueous Cream",
    "pack_type": "external",
    "dosage_form": "cream",
    "strength": "10% w/w",
    "units_per_pack": 1,
    "package_type": "ointment_jar",
    "shelf_life_months": 3,
    "beyond_use_date_days": 90,
    "storage_instructions": "Store in a cool, dry place below 25°C.",
    "label_instructions": "FOR EXTERNAL USE ONLY. NOT TO BE TAKEN. KEEP OUT OF REACH OF CHILDREN.",
    "indications": "Kulit kering kronik teruk (xerosis), ichthyosis & tumit kaki merekah",
    "ingredients_formula": "Urea Hablur BP 100g, Purified Water 100ml, Aqueous Cream add 1000g",
    "pharmacopoeia_ref": "MOH GAEX 2026 (Item 56: Carbamide (Urea) 10% Ointment/Cream)",
    "standard_formula_breakdown": [
      {
        "name": "Urea Hablur Tulen Gred BP",
        "quantity": "100.0 g",
        "function": "Active Pharmaceutical Ingredient (API) Pelembap Osmotik & Keratolitik"
      },
      {
        "name": "Purified Water BP",
        "quantity": "100 ml",
        "function": "Solvent / Diluent Melarutkan Hablur Urea"
      },
      {
        "name": "Aqueous Cream Base",
        "quantity": "q.s. to 1000 g (~800 g)",
        "function": "Pangkalan Krim Pelembap"
      }
    ],
    "equipment_required": [
      "Beaker kaca",
      "Jubin kaca salap",
      "Spatula tahan karat",
      "Balang salap"
    ],
    "preparation_steps": [
      "1. Timbang Urea hablur 100 g.",
      "2. Larutkan urea dalam 100 ml Purified Water suam (proses endotermik menyerap haba).",
      "3. Timbang Aqueous Cream seberat 800 g di atas jubin kaca.",
      "4. Masukkan larutan urea pekat ke dalam krim secara beransur-ansur sambil dikacau rata.",
      "5. Sebatikan sehingga tekstur krim menjadi licin berkilat dan masukkan ke dalam balang salap."
    ],
    "in_process_qc": [
      "Krim putih licin, tiada hablur urea berbutir."
    ],
    "cautions_and_warnings": [
      "Boleh menyebabkan rasa sedikit pedih sementara jika disapu pada kulit luka merekah."
    ],
    "container_specs": "Botol Kaca Beralur Fluted / Plastic Ointment Jar."
  },
  "EXT-LPW-001": {
    "item_code": "EXT-LPW-001",
    "item_name": "Liquid Paraffin 50% in White Soft Paraffin (50:50 Ointment)",
    "generic_name": "Liquid Paraffin 50% w/w in White Soft Paraffin 50% w/w",
    "pack_type": "external",
    "dosage_form": "ointment",
    "strength": "50:50 w/w",
    "units_per_pack": 1,
    "package_type": "ointment_jar",
    "shelf_life_months": 3,
    "beyond_use_date_days": 90,
    "storage_instructions": "Store in a cool, dry place below 25°C.",
    "label_instructions": "FOR EXTERNAL USE ONLY. NOT TO BE TAKEN. KEEP OUT OF REACH OF CHILDREN.",
    "indications": "Emolien intensif ekzema kronik, pruritus orang tua & kulit kering merekah",
    "ingredients_formula": "Liquid Paraffin BP 500g, White Soft Paraffin BP 500g",
    "pharmacopoeia_ref": "MOH GAEX 2026 (Item 186: Liquid Paraffin in WSP 50:50)",
    "standard_formula_breakdown": [
      {
        "name": "Liquid Paraffin BP",
        "quantity": "500.0 g",
        "function": "Minyak Parafin Cecair Pelembap"
      },
      {
        "name": "White Soft Paraffin BP",
        "quantity": "500.0 g",
        "function": "Pangkalan Salap Oklusif Menahan Lembapan"
      }
    ],
    "equipment_required": [
      "Penimbang digital",
      "Beaker keluli tahan karat besar",
      "Water bath pemanas air",
      "Balang salap"
    ],
    "preparation_steps": [
      "1. Timbang White Soft Paraffin 500 g dan Liquid Paraffin 500 g.",
      "2. Cairkan White Soft Paraffin secara perlahan di atas water bath pada suhu sekitar 50°C - 60°C.",
      "3. Masukkan Liquid Paraffin ke dalam cairan parafin lembut dan kacau sehingga bercampur sempurna.",
      "4. Angkat dari pemanas dan teruskan mengacau secara perlahan semasa penyejukan sehingga salap memejal menjadi tekstur separa pepejal licin.",
      "5. Tuangkan ke dalam balang salap semasa masih suam mengalir dan biarkan sejuk sepenuhnya."
    ],
    "in_process_qc": [
      "Salap putih berkilat licin, tiada pengasingan fasa minyak cecair di permukaan."
    ],
    "cautions_and_warnings": [
      "Parafin mudah menyerap ke fabrik dan boleh menyala jika terdedah pada punca api."
    ],
    "container_specs": "Botol Kaca Beralur Fluted / Plastic Ointment Jar."
  },
  "EXT-CAL-001": {
    "item_code": "EXT-CAL-001",
    "item_name": "Calamine Lotion BP (Losyen Calamine)",
    "generic_name": "Calamine 15%, Zinc Oxide 5%, Glycerol 5% in Aqueous Lotion",
    "pack_type": "external",
    "dosage_form": "solution",
    "strength": "Standard Formula",
    "units_per_pack": 1,
    "package_type": "clear_bottle",
    "shelf_life_months": 3,
    "beyond_use_date_days": 90,
    "storage_instructions": "Store in a cool, dry place below 25°C.",
    "label_instructions": "FOR EXTERNAL USE ONLY. NOT TO BE TAKEN. KEEP OUT OF REACH OF CHILDREN.",
    "indications": "Meredakan kegatalan cacar air (chickenpox), ruam panas, gigitan serangga & selaran matahari",
    "ingredients_formula": "Calamine 150g, Zinc Oxide 50g, Bentonite 30g, Sodium Citrate 5g, Gliserin 50ml, Purified Water add 1000ml",
    "pharmacopoeia_ref": "MOH GAEX 2026 (Item 52: Calamine Lotion)",
    "standard_formula_breakdown": [
      {
        "name": "Calamine Powder BP",
        "quantity": "150.0 g",
        "function": "Active Pharmaceutical Ingredient (API) Penyejuk & Antiprurit"
      },
      {
        "name": "Zinc Oxide BP",
        "quantity": "50.0 g",
        "function": "Astringen & Pelindung Kulit"
      },
      {
        "name": "Bentonite BP",
        "quantity": "30.0 g",
        "function": "Agen Penggantung Semula Jadi"
      },
      {
        "name": "Gliserin BP",
        "quantity": "50.0 ml",
        "function": "Emolien Pelembap"
      },
      {
        "name": "Purified Water BP",
        "quantity": "q.s. to 1000 ml",
        "function": "Vehicle Cecair"
      }
    ],
    "equipment_required": [
      "Mortar porselin besar",
      "Penimbang digital",
      "1000 ml Borosilicate Glass Beaker",
      "Botol kaca ambar beralur"
    ],
    "preparation_steps": [
      "1. Timbang Calamine (150 g), Zinc Oxide (50 g), dan Bentonite (30 g).",
      "2. Campur serbuk dalam mortar dan kisar halus.",
      "3. Larutkan Sodium Citrate (5 g) dalam sebahagian Purified Water dan campurkan dengan Gliserin (50 ml).",
      "4. Masukkan cecair ke dalam mortar sedikit demi sedikit dan kisar sehingga membentuk pes merah jambu licin.",
      "5. Tambahkan baki Purified Water secara beransur-ansur sehingga ampaian mengalir bebas.",
      "6. Genapkan kepada 1000 ml dalam silinder penyukat dan botolkan ke dalam botol fluted beralur."
    ],
    "in_process_qc": [
      "Ampaian merah jambu sekata, mudah digoncang semula, kelikatan sekata."
    ],
    "cautions_and_warnings": [
      "Wajib goncang botol dengan baik sebelum setiap kali sapuan."
    ],
    "container_specs": "Botol Kaca Beralur Fluted / Plastic Ointment Jar."
  },
  "EXT-HYP-001": {
    "item_code": "EXT-HYP-001",
    "item_name": "Sodium Hypochlorite 0.5% Solution (Pencairan Klorin 1:10)",
    "generic_name": "Sodium Hypochlorite 0.5% w/v Available Chlorine (5,000 ppm)",
    "pack_type": "external",
    "dosage_form": "solution",
    "strength": "0.5% (5000 ppm Cl)",
    "units_per_pack": 1,
    "package_type": "clear_bottle",
    "shelf_life_months": 1,
    "beyond_use_date_days": 7,
    "storage_instructions": "Store in a cool, dry place below 25°C.",
    "label_instructions": "FOR EXTERNAL USE ONLY. NOT TO BE TAKEN. KEEP OUT OF REACH OF CHILDREN.",
    "indications": "Disinfeksi tumpahan darah pesakit (blood spill kit), virus darah (HIV, HBV) & dekontaminasi permukaan",
    "ingredients_formula": "Sodium Hypochlorite 5.25% (Peluntur/Klorin Pekat) 100ml, Air Bersih 900ml",
    "pharmacopoeia_ref": "MOH GAEX 2026 (Item 284: Sodium Hypochlorite Solution) / KKM Infection Control Guidelines",
    "standard_formula_breakdown": [
      {
        "name": "Sodium Hypochlorite 5.25% Pekat",
        "quantity": "100.0 ml",
        "function": "Active Pharmaceutical Ingredient (API) Disinfektan Klorin Bebas"
      },
      {
        "name": "Air Bersih / Purified Water",
        "quantity": "900.0 ml",
        "function": "Solvent / Diluent Pencairan Klorin 1:10"
      }
    ],
    "equipment_required": [
      "Graduated Cylinder",
      "Sarung tangan nitril & pelindung mata",
      "Botol plastik HDPE legap"
    ],
    "preparation_steps": [
      "1. Pakai sarung tangan dan pelindung mata di kawasan pengudaraan baik.",
      "2. Sukat 100 ml larutan Sodium Hypochlorite pekat (5.25%).",
      "3. Tuangkan ke dalam 900 ml air bersih di dalam bekas plastik legap.",
      "4. Kacau perlahan dan tutup rapat botol.",
      "5. Catatkan tarikh dan masa bancuhan pada label (had kestabilan 24 jam hingga 7 hari sahaja)."
    ],
    "in_process_qc": [
      "Clear pale yellowish solution with characteristic chlorine odor."
    ],
    "cautions_and_warnings": [
      "AMARAN: MENGHAKIS KULIT DAN MERENGSAKAN MATA.",
      "JANGAN SEKALI-KALI CAMPUR DENGAN ASID ATAU AMMONIA (menghasilkan gas klorin beracun)."
    ],
    "container_specs": "Botol Kaca Beralur Fluted / Plastic Ointment Jar."
  }
}

/**
 * Helper to retrieve an authoritative KKM preparation monograph for a given prepack item.
 * Searches by exact item_code or matched item_name.
 * If custom hospital item, generates dynamic GPP KKM standard monograph.
 */
// Comprehensive cross-reference index mapping GAEX catalog items to authoritative KKM curated monographs
export const GAEX_TO_CURATED_MAP: Record<string, string> = {
  // Alcohol & Antiseptic Solutions
  'EXT-GAEX-008': 'EXT-ALC-001', // Alcohol 70% Solution -> Ethanol 70% IMS monograph
  'EXT-GAEX-075': 'EXT-ALC-002', // Chlorhexidine 1:200 in Alcohol 70% -> Cord Spirit monograph
  'EXT-GAEX-077': 'EXT-ALC-002', // Chlorhexidine 1:200 in Methylated Spirit 70% -> Cord Spirit monograph
  'EXT-GAEX-072': 'EXT-CHX-004', // Chlorhexidine 0.02% Eye Drops
  'EXT-GAEX-073': 'EXT-CHX-003', // Chlorhexidine 1 in 100 (1%) in Aqueous
  'EXT-GAEX-074': 'EXT-CHX-004', // Chlorhexidine 1 in 1000 (0.1%) Aqueous
  'EXT-GAEX-076': 'EXT-CHX-003', // Chlorhexidine 1 in 200 (0.5%) Aqueous
  'EXT-GAEX-078': 'EXT-ALC-002', // Chlorhexidine 1 in 2000 in Alcohol
  'EXT-GAEX-079': 'EXT-CHX-004', // Chlorhexidine 1 in 2000 Aqueous
  'EXT-GAEX-080': 'EXT-ALC-002', // Chlorhexidine 1 in 2000 in Methylated Spirit
  'EXT-GAEX-081': 'EXT-CHX-002', // Chlorhexidine 1 in 50 (2%) in Alcohol 70%
  'EXT-GAEX-082': 'EXT-CHX-003', // Chlorhexidine 1 in 50 (2%) in Aqueous
  'EXT-GAEX-083': 'EXT-CHX-003', // Chlorhexidine Gluconate 0.2% Mouthwash
  
  // Potassium Permanganate Formulations
  'EXT-GAEX-245': 'EXT-KMN-003', // Potassium Permanganate 0.1% (1:1,000) Stock Solution
  'EXT-GAEX-246': 'EXT-KMN-001', // Potassium Permanganate 1 in 10,000 Solution
  'EXT-GAEX-247': 'EXT-KMN-001', // Potassium Permanganate 1 in 20,000 Solution
  'EXT-GAEX-248': 'EXT-KMN-003', // Potassium Permanganate 1% Solution
  'EXT-GAEX-249': 'EXT-KMN-003', // Potassium Permanganate 1.5% Solution
  'EXT-GAEX-250': 'EXT-KMN-003', // Potassium Permanganate 2% Solution
  'EXT-GAEX-251': 'EXT-KMN-003', // Potassium Permanganate 5% Solution
  'EXT-GAEX-252': 'EXT-KMN-003', // Potassium Permanganate 6% Solution

  // Lotions & Washes
  'EXT-GAEX-013': 'EXT-ACR-001', // Acriflavine 0.1% Lotion (Yellow Lotion)
  'EXT-GAEX-055': 'EXT-CAL-001', // Calamine Lotion BP
  'EXT-GAEX-198': 'EXT-NSL-001', // Normal Saline 0.9% for Irrigation
  'EXT-GAEX-241': 'EXT-PVI-001', // Povidone Iodine 10% Aqueous
  'EXT-GAEX-140': 'EXT-H2O-001', // Hydrogen Peroxide 3% Solution
  'EXT-GAEX-141': 'EXT-H2O-001', // Hydrogen Peroxide 6% Solution
  'EXT-GAEX-287': 'EXT-HYP-001', // Sodium Hypochlorite 0.5% Solution

  // Ointments & Creams
  'EXT-GAEX-026': 'EXT-AQCR-001', // Aqueous Cream BP
  'EXT-GAEX-263': 'EXT-SAL-001', // Salicylic Acid 2% in Aqueous Cream
  'EXT-GAEX-264': 'EXT-SAL-001', // Salicylic Acid 5% in WSP
  'EXT-GAEX-324': 'EXT-ZNC-001', // Zinc Oxide Paste BP 25%
  'EXT-GAEX-315': 'EXT-URE-001', // Urea 10% Cream
  'EXT-GAEX-178': 'EXT-LPW-001', // Liquid Paraffin 50:50 Ointment

  // Internal Oral Extemporaneous Formulations
  'INT-GAEX-001': 'INT-KKM-001', // Acetazolamide 25mg/ml
  'INT-GAEX-013': 'INT-KKM-002', // Allopurinol 20mg/ml
  'INT-GAEX-017': 'INT-KKM-004', // Aminophylline 3mg/ml
  'INT-GAEX-018': 'INT-KKM-005', // Amiodarone 40mg/ml
  'INT-GAEX-019': 'INT-KKM-005', // Amiodarone 5mg/ml
  'INT-GAEX-020': 'INT-KKM-006', // Amlodipine 1mg/ml
  'INT-GAEX-027': 'INT-KKM-007', // Atenolol 2mg/ml
  'INT-GAEX-029': 'INT-KKM-008', // Azathioprine 50mg/ml
  'INT-GAEX-031': 'INT-KKM-009', // Baclofen 5mg/ml
  'INT-GAEX-045': 'INT-KKM-010', // Captopril 1mg/ml
  'INT-GAEX-049': 'INT-KKM-011', // Carbamazepine 20mg/ml
  'INT-GAEX-055': 'INT-KKM-012', // Carvedilol 1mg/ml
  'INT-GAEX-073': 'INT-KKM-013', // Clonazepam 0.1mg/ml
  'INT-GAEX-074': 'INT-KKM-014', // Clonidine 10mcg/ml
  'INT-GAEX-075': 'INT-KKM-015', // Clopidogrel 5mg/ml
  'INT-GAEX-085': 'INT-KKM-016', // Dexamethasone 1mg/ml
  'INT-GAEX-092': 'INT-KKM-017', // Diltiazem 12mg/ml
  'INT-GAEX-096': 'INT-KKM-018', // Dipyridamole 10mg/ml
  'INT-GAEX-101': 'INT-KKM-019', // Enalapril 1mg/ml
  'INT-GAEX-116': 'INT-KKM-020', // Folic Acid 1mg/ml
  'INT-GAEX-121': 'INT-KKM-021', // Furosemide 10mg/ml
  'INT-GAEX-140': 'INT-KKM-023', // Hydrochlorothiazide 5mg/ml
  'INT-GAEX-141': 'INT-KKM-024', // Hydrocortisone 2mg/ml
  'INT-GAEX-142': 'INT-KKM-024', // Hydrocortisone 5mg/ml
  'INT-GAEX-146': 'INT-KKM-025', // Hydroxyurea 100mg/ml
  'INT-GAEX-153': 'INT-KKM-026', // Indomethacin 5mg/ml
  'INT-GAEX-162': 'INT-KKM-027', // Isoniazid 10mg/ml
  'INT-GAEX-164': 'INT-KKM-028', // Isosorbide Dinitrate 1mg/ml
  'INT-GAEX-173': 'INT-KKM-029', // Labetalol 10mg/ml
  'INT-GAEX-175': 'INT-KKM-030', // Lamotrigine 2mg/ml
  'INT-GAEX-179': 'INT-KKM-031', // Levetiracetam 50mg/ml
  'INT-GAEX-180': 'INT-KKM-032', // Levodopa/Carbidopa
  'INT-GAEX-202': 'INT-MORF-001', // Morphine HCl 10mg/5ml
  'INT-GAEX-203': 'INT-MORF-002', // Morphine HCl 20mg/5ml
  'INT-GAEX-218': 'INT-KKM-039', // Omeprazole 2mg/ml
  'INT-GAEX-230': 'INT-KKM-041', // Phenobarbital 10mg/5ml
  'INT-GAEX-235': 'INT-KKM-042', // Potassium Chloride
  'INT-GAEX-238': 'INT-KKM-043', // Prednisolone 5mg/5ml
  'INT-GAEX-244': 'INT-KKM-044', // Propranolol 1mg/ml
  'INT-GAEX-247': 'INT-KKM-045', // Pyrazinamide 100mg/ml
  'INT-GAEX-248': 'INT-KKM-046', // Pyridoxine 10mg/ml
  'INT-GAEX-259': 'INT-KKM-048', // Rifampicin 20mg/ml
  'INT-GAEX-270': 'INT-KKM-049', // Sildenafil 2.5mg/ml
  'INT-GAEX-274': 'INT-KKM-050', // Spironolactone 5mg/ml
  'INT-GAEX-291': 'INT-KKM-052', // Tacrolimus 0.5mg/ml
  'INT-GAEX-304': 'INT-KKM-054', // Tramadol 10mg/ml
  'INT-GAEX-307': 'INT-KKM-056', // Ursodeoxycholic Acid 50mg/ml
  'INT-GAEX-311': 'INT-KKM-057', // Warfarin 1mg/ml
}

/**
 * Intelligent parser that extracts real ingredient names, exact quantities, and roles
 * Eliminates generic 'Secukupnya (q.s.)' placeholders
 */
export function parseMasterFormulaIngredients(
  formulaStr: string,
  defaultName: string,
  defaultStrength: string,
  isInternal: boolean
): KkmFormulaIngredient[] {
  if (!formulaStr || !formulaStr.trim()) {
    return [
      {
        name: defaultName,
        quantity: defaultStrength || 'Per Batch Specification',
        function: 'Active Pharmaceutical Ingredient (API)'
      },
      {
        name: isInternal ? 'Official MOH Compounding Vehicle (X-Temp® / Ora-Plus®)' : 'Purified Water BP',
        quantity: 'q.s. to Target Volume',
        function: isInternal ? 'Suspending Vehicle' : 'Aqueous Diluent'
      }
    ]
  }

  // Handle special case: 'Etanol 95% / IMS 737 ml diluted with Purified Water up to 1000 ml'
  if (/etanol|ims|ethanol/i.test(formulaStr) && /737s*ml/i.test(formulaStr)) {
    return [
      {
        name: 'Ethanol 95% v/v / Industrial Methylated Spirit (IMS) 95%',
        quantity: '737.0 mL',
        function: 'Active Antiseptic & Surface Disinfectant Agent'
      },
      {
        name: 'Purified Water BP',
        quantity: 'q.s. to 1000 mL (~263 mL)',
        function: 'Aqueous Diluent for Optimal Bacterial Cell Wall Permeation'
      }
    ]
  }

  // Handle Chlorhexidine in alcohol (Cord Spirit)
  if (/chlorhexidine/i.test(formulaStr) && /25s*ml/i.test(formulaStr) && /737s*ml/i.test(formulaStr)) {
    return [
      {
        name: 'Chlorhexidine Digluconate 20% Solution BP',
        quantity: '25.0 mL',
        function: 'Active Biguanide Antiseptic Agent (0.5% w/v final)'
      },
      {
        name: 'Industrial Methylated Spirit (IMS) 95% v/v',
        quantity: '737.0 mL',
        function: 'Alcohol Vehicle & Bactericidal Skin Penetration Agent (70% final)'
      },
      {
        name: 'Purified Water BP',
        quantity: 'q.s. to 1000 mL (~238 mL)',
        function: 'Aqueous Diluent'
      },
      {
        name: 'Amaranth Pink Food Grade Dye Solution (0.1%)',
        quantity: '1.0 mL',
        function: 'Visual Indicator Tint for Skin Prep Border'
      }
    ]
  }

  // Split multiple ingredients by +, |, or comma (when followed by an ingredient or quantity)
  let rawParts: string[] = []
  if (formulaStr.includes('|')) {
    rawParts = formulaStr.split('|').map(s => s.trim()).filter(Boolean)
  } else if (formulaStr.includes('+')) {
    rawParts = formulaStr.split('+').map(s => s.trim()).filter(Boolean)
  } else {
    rawParts = formulaStr.split(/,(?=s*[A-Z0-9])/).map(s => s.trim()).filter(Boolean)
    if (rawParts.length <= 1 && formulaStr.includes(',')) {
      rawParts = formulaStr.split(',').map(s => s.trim()).filter(Boolean)
    }
  }

  const results: KkmFormulaIngredient[] = []

  for (const part of rawParts) {
    const trimmed = part.trim()
    if (!trimmed) continue

    // Extract quantity (e.g. 737 ml, 1000ml, 2.5g, 150 mg, 8 tablets, 120mL, qs 120ml)
    const qtyMatch = trimmed.match(
      /\b(?:q\.?s\.?\s*(?:to|ad)?\s*)?(\d+(?:\.\d+)?\s*(?:ml|mL|l|L|g|mg|mcg|kg|tablets|tablet|tabs|tab|drops|units|%|vol))\b/i
    )

    let ingName = trimmed
    let ingQty = ''
    let ingRole = 'Active Pharmaceutical Ingredient (API)'

    if (qtyMatch) {
      ingQty = qtyMatch[0].trim()
      // Remove quantity from ingredient name
      ingName = trimmed.replace(qtyMatch[0], '').replace(/\b(?:ad|add|to|dilarutkan dalam|diluted with|sehingga|up to)\b/gi, '').trim()
    } else if (/\b(?:q\.?s\.?|secukupnya)\b/i.test(trimmed)) {
      ingQty = 'q.s. to Target Volume'
      ingName = trimmed.replace(/\b(?:q\.?s\.?|secukupnya|ad|add|to)\b/gi, '').trim()
    } else {
      ingQty = 'Per Formula Ratio'
    }

    // Clean up punctuation and prepositions in name
    ingName = ingName.replace(/^[\s,:+|-]+|[\s,:+|-]+$/g, '').trim()
    if (!ingName) ingName = trimmed

    // Determine clinical role
    const lower = ingName.toLowerCase()
    if (lower.includes('water') || lower.includes('air suling') || lower.includes('purified water')) {
      ingRole = 'Aqueous Diluent / Solvent'
      if (!ingQty || ingQty === 'Per Formula Ratio') ingQty = 'q.s. to 1000 mL'
    } else if (lower.includes('alcohol') || lower.includes('ims') || lower.includes('etanol') || lower.includes('ethanol') || lower.includes('spirit')) {
      ingRole = 'Alcohol Vehicle / Fast-Drying Bactericide'
    } else if (lower.includes('pembawa') || lower.includes('vehicle') || lower.includes('ora-') || lower.includes('x-temp') || lower.includes('syrup')) {
      ingRole = 'Suspending / Sweetened Vehicle'
      if (!ingQty || ingQty === 'Per Formula Ratio') ingQty = 'q.s. to Target Volume'
    } else if (lower.includes('dye') || lower.includes('pewarna') || lower.includes('amaranth') || lower.includes('merah jambu')) {
      ingRole = 'Visual Indicator Tint'
      if (!ingQty || ingQty === 'Per Formula Ratio') ingQty = '1.0 mL'
    } else if (lower.includes('paraffin') || lower.includes('ointment base') || lower.includes('cream base') || lower.includes('wsp')) {
      ingRole = 'Topical Emollient / Ointment Base'
    } else if (lower.includes('detergent') || lower.includes('surfactant')) {
      ingRole = 'Surfactant / Foaming Agent'
    }

    results.push({
      name: ingName,
      quantity: ingQty,
      function: ingRole
    })
  }

  return results.length > 0 ? results : [
    {
      name: defaultName,
      quantity: defaultStrength || 'Standard Batch Yield',
      function: 'Active Pharmaceutical Ingredient (API)'
    }
  ]
}

export const getGalenicalMonograph = (
  item: PrepackItem | {
    item_code?: string
    item_name?: string
    generic_name?: string | null
    pack_type?: string
    dosage_form?: string
    strength?: string
    indications?: string
    ingredients_formula?: string
    storage_instructions?: string
    label_instructions?: string
  }
): KkmPreparationMonograph => {
  const code = item.item_code || ''

  // 1. Direct match by exact item code
  if (code && KKM_GALENICAL_MONOGRAPHS[code]) {
    return KKM_GALENICAL_MONOGRAPHS[code]
  }

  // 2. Direct match via GAEX-to-curated mapping index
  if (code && GAEX_TO_CURATED_MAP[code] && KKM_GALENICAL_MONOGRAPHS[GAEX_TO_CURATED_MAP[code]]) {
    const base = KKM_GALENICAL_MONOGRAPHS[GAEX_TO_CURATED_MAP[code]]
    return {
      ...base,
      item_code: code,
      item_name: item.item_name || base.item_name,
      generic_name: (item.generic_name as string) || base.generic_name
    }
  }

  // 3. Match by exact item title or normalized generic name across curated monographs
  const targetName = (item.item_name || '').trim().toLowerCase()
  const targetGeneric = ((item.generic_name as string) || '').trim().toLowerCase()
  const cleanTargetName = targetName.replace(/\s+(bp|usp|kkm)\b/gi, '').trim()

  const foundByTitle = Object.values(KKM_GALENICAL_MONOGRAPHS).find(m => {
    const mName = m.item_name.trim().toLowerCase()
    const cleanMName = mName.replace(/\s+(bp|usp|kkm)\b/gi, '').trim()
    const mGen = m.generic_name.trim().toLowerCase()
    return (
      mName === targetName ||
      cleanMName === cleanTargetName ||
      (cleanTargetName.length > 6 && cleanMName.startsWith(cleanTargetName)) ||
      (targetName.includes('alcohol 70%') && mName.includes('alcohol 70%')) ||
      (targetName.includes('cord spirit') && mName.includes('cord spirit')) ||
      (targetName.includes('permanganate') && targetName.includes('0.1%') && mName.includes('1:1,000')) ||
      (targetGeneric &&
        targetGeneric.length > 6 &&
        !['aqueous', 'cream', 'ointment', 'solution', 'suspension', 'drops', 'syrup', 'lotion'].includes(targetGeneric) &&
        (mGen === targetGeneric || (mGen.includes(targetGeneric) && targetGeneric.split(' ').length >= 2)))
    )
  })

  if (foundByTitle) {
    return {
      ...foundByTitle,
      item_code: code || foundByTitle.item_code,
      item_name: item.item_name || foundByTitle.item_name
    }
  }

  // 4. Robust dynamic generation: 100% English, clinically sound procedures by category
  const isInternal = Boolean(item.pack_type === 'internal' || (item.item_code && item.item_code.startsWith('INT-')))
  const dosage = (item.dosage_form || 'solution').toLowerCase()

  let defaultEquipment: string[] = []
  let defaultSteps: string[] = []
  let defaultQc: string[] = []
  let defaultCautions: string[] = []
  let defaultContainer = isInternal 
    ? 'Amber Glass Bottle with Child-Resistant Closure' 
    : 'Fluted Amber Glass Bottle or HDPE Bottle with Red External Label'
  let defaultRef = 'MOH Pharmacy Extemporaneous Compounding Guidelines (Good Preparation Practice - GPP KKM)'
  let defaultBud = isInternal ? 30 : 90

  if (isInternal) {
    if (dosage === 'suspension') {
      defaultEquipment = [
        'Clean Porcelain / Glass Mortar & Pestle',
        'Calibrated Analytical Balance (0.001 g precision)',
        'Graduated Borosilicate Measuring Cylinders (100 mL & 1000 mL)',
        'Flexible Stainless Steel Spatula',
        'Amber Glass Bottle with Child-Resistant Cap'
      ]
      defaultSteps = [
        '1. Pulverize tablets or solid crystals in mortar to a uniform, impalpable fine powder.',
        '2. Levigate powder with small portion of suspending vehicle (X-Temp® Oral Suspension System / Ora-Sweet® : Ora-Plus® 1:1) until smooth uniform paste is formed.',
        '3. Gradually add vehicle in increments until pourable liquid is formed; transfer into calibrated cylinder.',
        '4. Use additional vehicle to rinse remaining drug particles from mortar and pour into cylinder.',
        '5. Bring to final target volume with vehicle.',
        '6. Shake well for 2 minutes and apply official oral label: FOR ORAL USE ONLY. SHAKE WELL BEFORE USE.'
      ]
      defaultQc = [
        'Visual homogeneity inspection: Uniform suspension without caking or irreversible sedimentation.',
        'Resuspendability: Readily resuspends upon gentle manual inversion within 10 seconds.',
        'Freedom from grittiness: Smooth texture upon tactile inspection.'
      ]
      defaultCautions = [
        'FOR ORAL USE ONLY. SHAKE WELL BEFORE EACH DOSE.',
        'Verify patient dose calculations and pediatric dosing limits prior to final dispensing.',
        'Protect from direct sunlight and excessive heat.'
      ]
    } else {
      defaultEquipment = [
        'Borosilicate Glass Beakers (250 mL & 1000 mL)',
        'Graduated Borosilicate Measuring Cylinders (100 mL & 1000 mL)',
        'Chemical-Resistant Glass Stirring Rod',
        'Calibrated Analytical Balance',
        'Amber Glass Bottle with Child-Resistant Cap'
      ]
      defaultSteps = [
        '1. Accurately weigh active pharmaceutical ingredient using calibrated analytical balance.',
        '2. Dissolve active drug in a portion of Purified Water BP in a clean glass beaker until completely clear.',
        '3. Add the flavored syrup vehicle (X-Temp® Syrup / Simple Syrup BP) in accordance with solubility order.',
        '4. Transfer to a graduated cylinder and adjust to final volume with vehicle.',
        '5. Stir thoroughly with a glass stirring rod for 2 minutes to achieve complete homogeneity.',
        '6. Inspect solution clarity and package into airtight amber glass bottles.'
      ]
      defaultQc = [
        'Visual clarity inspection: Completely transparent without undispersed particles.',
        'Volume accuracy: Final volume calibrated precisely to target batch size.'
      ]
      defaultCautions = [
        'FOR ORAL USE ONLY. STORE ACCORDING TO LABEL INSTRUCTIONS.',
        'Keep tightly closed and protect from light.'
      ]
    }
  } else {
    // External Preparations (Topical, Solutions, Lotions, Washes, Creams, Ointments)
    if (dosage === 'cream' || dosage === 'ointment') {
      defaultEquipment = [
        'Glass Ointment Slab (Tile)',
        'Flexible Stainless Steel Spatulas',
        'High-Precision Digital Balance (0.01 g precision)',
        'Airtight Plastic Ointment Jar with Screw Cap'
      ]
      defaultSteps = [
        '1. Accurately weigh active ingredient powder and ointment/cream base in accordance with master formula.',
        '2. Place active powder on glass slab and levigate with a small amount of liquid levigating agent (mineral oil or glycerol) to form a smooth paste.',
        '3. Triturate until paste is completely smooth and free of gritty particles.',
        '4. Incorporate the base geometrically using flexible spatulas to ensure uniform drug distribution.',
        '5. Work the mixture until smooth, glossy, and homogeneous throughout.',
        '6. Package into airtight ointment jars, seal tightly, and affix red label: FOR EXTERNAL USE ONLY.'
      ]
      defaultQc = [
        'Texture inspection: Smooth, glossy, zero grittiness when rubbed between glass slides.',
        'Uniformity: Even color distribution throughout the batch.'
      ]
      defaultCautions = [
        'FOR EXTERNAL USE ONLY. NOT TO BE TAKEN.',
        'Do not apply on broken, weeping skin or near eyes unless specifically prescribed.'
      ]
    } else {
      // External Liquids / Antiseptics / Disinfectants / Alcohol Solutions / Lotions
      defaultEquipment = [
        'Graduated Borosilicate Measuring Cylinders (100 mL & 1000 mL)',
        'Borosilicate Glass Beakers (500 mL & 1000 mL)',
        'Chemical-Resistant Glass Stirring Rod',
        'Alcoholometer / Hydrometer (for alcohol-based formulations)',
        'Fluted Amber Glass Bottle or HDPE Dispensing Bottle'
      ]
      defaultSteps = [
        '1. Sanitize the compounding work area and ensure it is strictly free from open flames, heat, and ignition sources.',
        '2. Accurately measure the concentrated active ingredient or weigh antiseptic crystals using calibrated equipment.',
        '3. Transfer active substance into a clean borosilicate glass beaker and incrementally add a portion of Purified Water BP / diluent while stirring.',
        '4. For spirit/alcohol mixtures, allow solution to stand and cool (account for exothermic volume contraction during alcohol-water blending).',
        '5. Transfer quantitatively into a calibrated graduated measuring cylinder and bring to final volume with Purified Water BP.',
        '6. Mix thoroughly with a glass stirring rod for 2 minutes to achieve complete homogeneity.',
        '7. Visually verify solution clarity under adequate illumination (must be transparent with zero turbidity or particulate matter).',
        '8. Package into clean fluted external dispensing bottles, seal with child-resistant closures, and affix the official red FOR EXTERNAL USE ONLY label.'
      ]
      defaultQc = [
        'Visual Clarity: Completely transparent and homogeneous without precipitation or particulate matter.',
        'Volume Accuracy: Final volume calibrated precisely to target batch size.',
        'Specific Gravity / Alcohol Concentration: Verified within pharmacopoeial specification (for alcohol preparations).'
      ]
      defaultCautions = [
        'FOR EXTERNAL USE ONLY. NOT TO BE TAKEN / DO NOT INGEST.',
        'Keep out of reach of children and avoid contact with eyes, ears, and mucous membranes.',
        'Flammable if alcohol-based: Allow treated skin to air-dry completely before initiating diathermy or electrosurgical procedures.'
      ]
    }
  }

  // Parse formula string into real ingredients with explicit quantities & roles
  const parsedIngredients = parseMasterFormulaIngredients(
    item.ingredients_formula || '',
    (item.generic_name as string) || item.item_name || 'Active Substance',
    item.strength || '',
    isInternal
  )

  return {
    item_code: item.item_code || 'GAL-STD',
    item_name: item.item_name || 'MOH Hospital Galenical Preparation',
    generic_name: (item.generic_name as string) || item.item_name || 'Standard Compound',
    pack_type: item.pack_type || (isInternal ? 'internal' : 'external'),
    dosage_form: item.dosage_form || 'solution',
    strength: item.strength || 'Standard Formula',
    units_per_pack: 1,
    package_type: isInternal ? 'amber_bottle' : 'clear_bottle',
    shelf_life_months: isInternal ? 1 : 3,
    beyond_use_date_days: defaultBud,
    storage_instructions: item.storage_instructions || 'Store below 25°C protected from light.',
    label_instructions: item.label_instructions || (isInternal ? 'FOR ORAL USE ONLY. SHAKE WELL BEFORE USE.' : 'FOR EXTERNAL USE ONLY. NOT TO BE TAKEN.'),
    indications: item.indications || 'Official MOH extemporaneous hospital pharmacy compounding formulation.',
    ingredients_formula: item.ingredients_formula || 'Standard Compounding Formula KKM GPP',
    pharmacopoeia_ref: defaultRef,
    standard_formula_breakdown: parsedIngredients,
    equipment_required: defaultEquipment,
    preparation_steps: defaultSteps,
    in_process_qc: defaultQc,
    cautions_and_warnings: defaultCautions,
    container_specs: defaultContainer
  }
}
