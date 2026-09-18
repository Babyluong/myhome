import { PaediatricDrugPreset } from '../types/paediatricDoseTypes'

export const DEFAULT_KKM_PAEDIATRIC_PRESETS: PaediatricDrugPreset[] = [
  {
    id: 'amoxicillin',
    drugName: 'Amoxicillin Syrup / IV',
    category: 'Penicillin',
    route: 'Oral/IV',
    source: 'KKM_STANDARD',
    indications: [
      {
        id: 'amox-cap',
        name: 'Pneumonia (CAP Ringan) / Jangkitan Standard',
        doseFormula: '40 - 50 mg/kg/hari dibahagi TDS',
        calculationMode: 'daily_divided',
        doseMgPerKg: 45,
        doseRangeLabel: '40 - 50 mg/kg/hari',
        dividedTimesPerDay: 3,
        frequencyLabel: 'TDS (Setiap 8 Jam)',
        maxDailyDoseMg: 1500,
        maxSingleDoseMg: 500,
        standardFormulations: [
          { label: 'Suspensi 125mg / 5mL (25mg/mL)', mgPerMl: 25 },
          { label: 'Suspensi Forte 250mg / 5mL (50mg/mL)', mgPerMl: 50 }
        ],
        clinicalAdvice: 'Beri selepas makan. Goncang botol dengan baik sebelum pemberian. Habiskan dalam 7 hari selepas bancuhan.'
      },
      {
        id: 'amox-aom',
        name: 'Otitis Media Akut (AOM) / Rintangan Pneumokokal (Dos Tinggi)',
        doseFormula: '80 - 90 mg/kg/hari dibahagi BD/TDS',
        calculationMode: 'daily_divided',
        doseMgPerKg: 85,
        doseRangeLabel: '80 - 90 mg/kg/hari',
        dividedTimesPerDay: 3,
        frequencyLabel: 'TDS (Setiap 8 Jam)',
        maxDailyDoseMg: 3000,
        maxSingleDoseMg: 1000,
        standardFormulations: [
          { label: 'Suspensi Forte 250mg / 5mL (50mg/mL)', mgPerMl: 50 }
        ],
        clinicalAdvice: 'Dos tinggi disyorkan untuk jangkitan telinga tengah dan kuman Streptococcus pneumoniae rintang.'
      }
    ]
  },
  {
    id: 'co-amoxiclav',
    drugName: 'Amoxicillin/Clavulanate (Augmentin)',
    category: 'Beta-Lactamase Inhibitor',
    route: 'Oral/IV',
    source: 'KKM_STANDARD',
    indications: [
      {
        id: 'aug-std',
        name: 'Jangkitan Respiratori / Gigitan / UTI Ringan (Standard)',
        doseFormula: '30 - 45 mg/kg/hari (amoxicillin) dibahagi TDS/BD',
        calculationMode: 'daily_divided',
        doseMgPerKg: 40,
        doseRangeLabel: '30 - 45 mg/kg/hari',
        dividedTimesPerDay: 3,
        frequencyLabel: 'TDS (Setiap 8 Jam)',
        maxDailyDoseMg: 1875,
        maxSingleDoseMg: 625,
        standardFormulations: [
          { label: 'Syrup 156.25mg / 5mL (Amox 125mg/5mL = 25mg/mL)', mgPerMl: 25 },
          { label: 'Syrup Forte 312.5mg / 5mL (Amox 250mg/5mL = 50mg/mL)', mgPerMl: 50 },
          { label: 'Suspension BID 228.5mg / 5mL (Amox 200mg/5mL = 40mg/mL)', mgPerMl: 40 },
          { label: 'Suspension BID Forte 457mg / 5mL (Amox 400mg/5mL = 80mg/mL)', mgPerMl: 80 }
        ],
        clinicalAdvice: 'Wajib ambil bersama makanan bagi mengurangkan kesan sampingan loya dan cirit-birit.'
      },
      {
        id: 'aug-high',
        name: 'CAP Sederhana / Sinusitis Akut / Jangkitan Berat (Dos Tinggi)',
        doseFormula: '80 - 90 mg/kg/hari amoxicillin component dibahagi BD',
        calculationMode: 'daily_divided',
        doseMgPerKg: 90,
        doseRangeLabel: '80 - 90 mg/kg/hari',
        dividedTimesPerDay: 2,
        frequencyLabel: 'BD (Setiap 12 Jam)',
        maxDailyDoseMg: 3200,
        maxSingleDoseMg: 1600,
        standardFormulations: [
          { label: 'Suspension BID Forte 457mg / 5mL (Amox 400mg/5mL = 80mg/mL)', mgPerMl: 80 }
        ],
        clinicalAdvice: 'Gunakan formulasi nisbah 7:1 (Suspension BID) untuk dos tinggi bagi mengelakkan dos berlebihan asid klavulanik.'
      }
    ]
  },
  {
    id: 'cloxacillin',
    drugName: 'Cloxacillin Syrup / IV',
    category: 'Antistaphylococcal Penicillin',
    route: 'Oral/IV',
    source: 'KKM_STANDARD',
    indications: [
      {
        id: 'clox-oral',
        name: 'Jangkitan Kulit / Impetigo / Selulitis Ringan (Oral)',
        doseFormula: '50 mg/kg/hari dibahagi QID (4 dos)',
        calculationMode: 'daily_divided',
        doseMgPerKg: 50,
        doseRangeLabel: '50 mg/kg/hari',
        dividedTimesPerDay: 4,
        frequencyLabel: 'QID (Setiap 6 Jam)',
        maxDailyDoseMg: 2000,
        maxSingleDoseMg: 500,
        standardFormulations: [
          { label: 'Syrup 125mg / 5mL (25mg/mL)', mgPerMl: 25 }
        ],
        clinicalAdvice: 'Ambil sekurang-kurangnya 1 jam sebelum makan atau 2 jam selepas makan (perut kosong) untuk penyerapan optimum.'
      },
      {
        id: 'clox-iv',
        name: 'SSSS / Artritis Septik / Osteomielitis Teruk (IV Parenteral)',
        doseFormula: '100 - 200 mg/kg/hari dibahagi Q6H (IV)',
        calculationMode: 'daily_divided',
        doseMgPerKg: 150,
        doseRangeLabel: '100 - 200 mg/kg/hari',
        dividedTimesPerDay: 4,
        frequencyLabel: 'IV Q6H (Setiap 6 Jam)',
        maxDailyDoseMg: 8000,
        maxSingleDoseMg: 2000,
        clinicalAdvice: 'IV bolus perlahan dalam tempoh 3-5 minit atau infusi 30 minit. Pantau tapak IV untuk flebitis.'
      }
    ]
  },
  {
    id: 'ceftriaxone',
    drugName: 'Ceftriaxone IV / IM',
    category: '3rd Gen Cephalosporin',
    route: 'IV',
    source: 'KKM_STANDARD',
    indications: [
      {
        id: 'ctx-std',
        name: 'Pneumonia Teruk / Pielonefritis / Sepsis (Standard Inpatient)',
        doseFormula: '50 - 80 mg/kg/hari sekali sehari (OD)',
        calculationMode: 'daily_divided',
        doseMgPerKg: 75,
        doseRangeLabel: '50 - 80 mg/kg/hari',
        dividedTimesPerDay: 1,
        frequencyLabel: 'OD (Sekali Sehari)',
        maxDailyDoseMg: 2000,
        maxSingleDoseMg: 2000,
        clinicalAdvice: 'Infusi IV perlahan selama 30 minit. KONTRAINDIKASI pada neonat umur < 28 hari bersama kalsium IV.'
      },
      {
        id: 'ctx-meningitis',
        name: 'Meningitis Bakteria Pediatrik (Dos Tinggi CNS)',
        doseFormula: '100 mg/kg/hari (dibahagi Q12H atau OD)',
        calculationMode: 'daily_divided',
        doseMgPerKg: 100,
        doseRangeLabel: '100 mg/kg/hari',
        dividedTimesPerDay: 2,
        frequencyLabel: 'Q12H (Setiap 12 Jam)',
        maxDailyDoseMg: 4000,
        maxSingleDoseMg: 2000,
        clinicalAdvice: 'Dos berganda diperlukan untuk menembusi cecair serebrospinal (CSF). Berikan steroid dexamethasone sebelum dos pertama.'
      }
    ]
  },
  {
    id: 'cefotaxime',
    drugName: 'Cefotaxime IV (Pilihan Utama Neonat & Bayi)',
    category: '3rd Gen Cephalosporin',
    route: 'IV',
    source: 'KKM_STANDARD',
    indications: [
      {
        id: 'ctx-neo',
        name: 'Sepsis Neonat / Bayi Muda < 3 Bulan',
        doseFormula: '50 mg/kg/dos Q8H (150 mg/kg/hari)',
        calculationMode: 'per_dose',
        doseMgPerKg: 50,
        doseRangeLabel: '50 mg/kg/dos Q8H',
        dividedTimesPerDay: 3,
        frequencyLabel: 'Q8H (Setiap 8 Jam)',
        maxDailyDoseMg: 6000,
        maxSingleDoseMg: 2000,
        clinicalAdvice: 'Paling selamat untuk neonat kerana tidak mengganggu metabolisme bilirubin (tiada risiko kernicterus).'
      },
      {
        id: 'ctx-men',
        name: 'Meningitis Neonatal / Pediatrik',
        doseFormula: '50 mg/kg/dos Q6H (200 mg/kg/hari)',
        calculationMode: 'per_dose',
        doseMgPerKg: 50,
        doseRangeLabel: '50 mg/kg/dos Q6H',
        dividedTimesPerDay: 4,
        frequencyLabel: 'Q6H (Setiap 6 Jam)',
        maxDailyDoseMg: 8000,
        maxSingleDoseMg: 2000,
        clinicalAdvice: 'Berikan dos setiap 6 jam untuk memastikan kepekatan terapeutik berterusan dalam CSF.'
      }
    ]
  },
  {
    id: 'cefuroxime',
    drugName: 'Cefuroxime Axetil Syrup / IV',
    category: '2nd Gen Cephalosporin',
    route: 'Oral/IV',
    source: 'KKM_STANDARD',
    indications: [
      {
        id: 'cxm-oral',
        name: 'Jangkitan Saluran Pernafasan / ENT / UTI (Oral)',
        doseFormula: '10 - 15 mg/kg/dos PO BD (20 - 30 mg/kg/hari)',
        calculationMode: 'per_dose',
        doseMgPerKg: 15,
        doseRangeLabel: '10 - 15 mg/kg/dos BD',
        dividedTimesPerDay: 2,
        frequencyLabel: 'BD (Setiap 12 Jam Selepas Makan)',
        maxDailyDoseMg: 1000,
        maxSingleDoseMg: 500,
        standardFormulations: [
          { label: 'Suspensi 125mg / 5mL (25mg/mL)', mgPerMl: 25 }
        ],
        clinicalAdvice: 'Ambil bersama makanan bagi meningkatkan penyerapan bioavailabiliti dan mengurangkan rasa pahit.'
      },
      {
        id: 'cxm-iv',
        name: 'Jangkitan Sederhana / Teruk Inpatient (IV)',
        doseFormula: '20 - 30 mg/kg/dos IV Q8H (60 - 100 mg/kg/hari)',
        calculationMode: 'per_dose',
        doseMgPerKg: 25,
        doseRangeLabel: '20 - 30 mg/kg/dos Q8H',
        dividedTimesPerDay: 3,
        frequencyLabel: 'IV Q8H (Setiap 8 Jam)',
        maxDailyDoseMg: 4500,
        maxSingleDoseMg: 1500,
        clinicalAdvice: 'Suntik IV bolus perlahan 3-5 min atau infusi 30 minit.'
      }
    ]
  },
  {
    id: 'azithromycin',
    drugName: 'Azithromycin Syrup / Tab',
    category: 'Macrolide',
    route: 'Oral',
    source: 'KKM_STANDARD',
    indications: [
      {
        id: 'azm-std',
        name: 'Pneumonia Atipikal / Disenteri / Batuk Kokol (Pertussis)',
        doseFormula: '10 mg/kg OD (D1), kemudian 5 mg/kg OD (D2-5)',
        calculationMode: 'daily_divided',
        doseMgPerKg: 10,
        doseRangeLabel: '10 mg/kg OD (Hari 1)',
        dividedTimesPerDay: 1,
        frequencyLabel: 'OD (Sekali Sehari x 5 Hari)',
        maxDailyDoseMg: 500,
        maxSingleDoseMg: 500,
        standardFormulations: [
          { label: 'Suspensi 200mg / 5mL (40mg/mL)', mgPerMl: 40 }
        ],
        clinicalAdvice: 'Ambil 1 jam sebelum atau 2 jam selepas makan. Hari 1 beri 10mg/kg, diikuti 5mg/kg sekali sehari pada Hari ke-2 hingga ke-5.'
      }
    ]
  },
  {
    id: 'gentamicin',
    drugName: 'Gentamicin IV / IM',
    category: 'Aminoglycoside',
    route: 'IV',
    source: 'KKM_STANDARD',
    indications: [
      {
        id: 'gent-std',
        name: 'Sepsis Gram-Negatif / UTI / Sepsis Neonat',
        doseFormula: '5 - 7.5 mg/kg OD (Neonat: 4-5 mg/kg Q24-36H)',
        calculationMode: 'daily_divided',
        doseMgPerKg: 6,
        doseRangeLabel: '5 - 7.5 mg/kg OD',
        dividedTimesPerDay: 1,
        frequencyLabel: 'OD (Sekali Sehari Infusi 30 min)',
        maxDailyDoseMg: 360,
        maxSingleDoseMg: 360,
        clinicalAdvice: 'Wajib lakukan pemantauan TDM (Therapeutic Drug Monitoring) paras palung (trough < 1 mcg/mL) dan semak fungsi ginjal (Serum Creatinine).'
      }
    ]
  },
  {
    id: 'metronidazole',
    drugName: 'Metronidazole Syrup / IV',
    category: 'Nitroimidazole (Anaerobic)',
    route: 'Oral/IV',
    source: 'KKM_STANDARD',
    indications: [
      {
        id: 'mtz-std',
        name: 'Apendisitis Terperforasi / Peritonitis / Jangkitan Anaerob',
        doseFormula: '7.5 - 10 mg/kg/dos Q8H (22.5 - 30 mg/kg/hari)',
        calculationMode: 'per_dose',
        doseMgPerKg: 7.5,
        doseRangeLabel: '7.5 - 10 mg/kg/dos Q8H',
        dividedTimesPerDay: 3,
        frequencyLabel: 'Q8H / TDS (Setiap 8 Jam)',
        maxDailyDoseMg: 1500,
        maxSingleDoseMg: 500,
        standardFormulations: [
          { label: 'Suspensi 200mg / 5mL (40mg/mL)', mgPerMl: 40 }
        ],
        clinicalAdvice: 'Ambil bersama makanan bagi mengelakkan rasa logam dan ketidakselesaan perut.'
      }
    ]
  },
  {
    id: 'cephalexin',
    drugName: 'Cephalexin Syrup',
    category: '1st Gen Cephalosporin',
    route: 'Oral',
    source: 'KKM_STANDARD',
    indications: [
      {
        id: 'cpx-std',
        name: 'Sistitis Pediatrik / Jangkitan Kulit Ringan',
        doseFormula: '25 - 50 mg/kg/hari dibahagi TDS/QID',
        calculationMode: 'daily_divided',
        doseMgPerKg: 40,
        doseRangeLabel: '25 - 50 mg/kg/hari',
        dividedTimesPerDay: 3,
        frequencyLabel: 'TDS (Setiap 8 Jam)',
        maxDailyDoseMg: 2000,
        maxSingleDoseMg: 500,
        standardFormulations: [
          { label: 'Suspensi 125mg / 5mL (25mg/mL)', mgPerMl: 25 },
          { label: 'Suspensi Forte 250mg / 5mL (50mg/mL)', mgPerMl: 50 }
        ],
        clinicalAdvice: 'Alternatif yang sangat baik bagi pesakit yang tidak tahan rasa pahit cloxacillin.'
      }
    ]
  },
  {
    id: 'meropenem',
    drugName: 'Meropenem IV',
    category: 'Carbapenem',
    route: 'IV',
    source: 'KKM_STANDARD',
    indications: [
      {
        id: 'mero-std',
        name: 'Sepsis Teruk / Jangkitan Intra-Abdominal / Neutropenia Demam',
        doseFormula: '20 mg/kg/dos IV Q8H (60 mg/kg/hari)',
        calculationMode: 'per_dose',
        doseMgPerKg: 20,
        doseRangeLabel: '20 mg/kg/dos Q8H',
        dividedTimesPerDay: 3,
        frequencyLabel: 'IV Q8H (Setiap 8 Jam)',
        maxDailyDoseMg: 3000,
        maxSingleDoseMg: 1000,
        clinicalAdvice: 'Infusi berterusan atau 30 minit. Simpan ubat terpelihara (restricted antibiotic).'
      },
      {
        id: 'mero-men',
        name: 'Meningitis Pediatrik / Jangkitan Pseudomonas Teruk',
        doseFormula: '40 mg/kg/dos IV Q8H (120 mg/kg/hari)',
        calculationMode: 'per_dose',
        doseMgPerKg: 40,
        doseRangeLabel: '40 mg/kg/dos Q8H (Dos Tinggi CNS)',
        dividedTimesPerDay: 3,
        frequencyLabel: 'IV Q8H (Setiap 8 Jam)',
        maxDailyDoseMg: 6000,
        maxSingleDoseMg: 2000,
        clinicalAdvice: 'Dos tinggi maksimum untuk penetrasi sawar darah otak CSF.'
      }
    ]
  },
  {
    id: 'vancomycin',
    drugName: 'Vancomycin IV',
    category: 'Glycopeptide',
    route: 'IV',
    source: 'KKM_STANDARD',
    indications: [
      {
        id: 'vanc-std',
        name: 'Jangkitan MRSA Teruk / Sepsis Kateter Inpatient',
        doseFormula: '15 mg/kg/dos IV Q6-8H (45 - 60 mg/kg/hari)',
        calculationMode: 'per_dose',
        doseMgPerKg: 15,
        doseRangeLabel: '15 mg/kg/dos Q6-8H',
        dividedTimesPerDay: 4,
        frequencyLabel: 'IV Q6H (Setiap 6 Jam)',
        maxDailyDoseMg: 2000,
        maxSingleDoseMg: 500,
        clinicalAdvice: 'Wajib infusi perlahan ≥ 60 minit (elak Red Man Syndrome). TDM paras palung sasaran 10-15 mcg/mL (atau 15-20 mcg/mL untuk MRSA teruk/meningitis).'
      }
    ]
  },
  {
    id: 'paracetamol',
    drugName: 'Paracetamol Syrup / IV',
    category: 'Analgesic & Antipyretic',
    route: 'Oral/IV',
    source: 'KKM_STANDARD',
    indications: [
      {
        id: 'pcm-std',
        name: 'Demam & Kesakitan Pediatrik (Standard)',
        doseFormula: '15 mg/kg/dos setiap 4 - 6 jam PRN (Maks: 60 mg/kg/hari)',
        calculationMode: 'per_dose',
        doseMgPerKg: 15,
        doseRangeLabel: '15 mg/kg/dos Q4-6H PRN',
        dividedTimesPerDay: 4,
        frequencyLabel: 'Q4-6H PRN (Maks 4 kali sehari)',
        maxDailyDoseMg: 4000,
        maxSingleDoseMg: 1000,
        standardFormulations: [
          { label: 'Sirap 120mg / 5mL (24mg/mL)', mgPerMl: 24 },
          { label: 'Sirap Forte 250mg / 5mL (50mg/mL)', mgPerMl: 50 },
          { label: 'Infusi IV 10mg / 1mL (10mg/mL)', mgPerMl: 10 }
        ],
        clinicalAdvice: 'Maksimum 60 mg/kg/hari. Berikan selang masa sekurang-kurangnya 4 jam antara setiap dos untuk mengelakkan risiko ketoksikan hepatotoksik.'
      }
    ]
  },
  {
    id: 'ibuprofen',
    drugName: 'Ibuprofen Suspension',
    category: 'NSAID / Antiinflammatory',
    route: 'Oral',
    source: 'KKM_STANDARD',
    indications: [
      {
        id: 'ibup-std',
        name: 'Demam Tinggi & Keradangan Akut (Umur ≥ 3 Bulan & Berat ≥ 5 kg)',
        doseFormula: '5 - 10 mg/kg/dos setiap 6 - 8 jam selepas makan',
        calculationMode: 'per_dose',
        doseMgPerKg: 10,
        doseRangeLabel: '5 - 10 mg/kg/dos TDS',
        dividedTimesPerDay: 3,
        frequencyLabel: 'TDS (Setiap 8 Jam Selepas Makan)',
        maxDailyDoseMg: 2400,
        maxSingleDoseMg: 400,
        standardFormulations: [
          { label: 'Suspensi 100mg / 5mL (20mg/mL)', mgPerMl: 20 }
        ],
        clinicalAdvice: 'Wajib ambil selepas makan. KONTRAINDIKASI pada bayi < 3 bulan / < 5 kg, asma aktif, dan demam disyaki Denggi.'
      }
    ]
  },
  {
    id: 'salbutamol',
    drugName: 'Salbutamol Syrup',
    category: 'Beta-2 Agonist (Bronchodilator)',
    route: 'Oral',
    source: 'KKM_STANDARD',
    indications: [
      {
        id: 'salb-std',
        name: 'Bronkospasme / Batuk Berkahak Asma Ringan',
        doseFormula: '0.1 - 0.15 mg/kg/dos PO setiap 8 jam',
        calculationMode: 'per_dose',
        doseMgPerKg: 0.12,
        doseRangeLabel: '0.1 - 0.15 mg/kg/dos TDS',
        dividedTimesPerDay: 3,
        frequencyLabel: 'TDS (Setiap 8 Jam)',
        maxDailyDoseMg: 12,
        maxSingleDoseMg: 4,
        standardFormulations: [
          { label: 'Sirap 2mg / 5mL (0.4mg/mL)', mgPerMl: 0.4 }
        ],
        clinicalAdvice: 'Boleh menyebabkan takikardia dan gegaran tangan tremor ringan. MDI Inhaler melalui spacer lebih diutamakan bagi asma akut.'
      }
    ]
  },
  {
    id: 'cetirizine',
    drugName: 'Cetirizine Syrup',
    category: 'Antihistamine (2nd Gen Non-Sedating)',
    route: 'Oral',
    source: 'KKM_STANDARD',
    indications: [
      {
        id: 'cet-std',
        name: 'Rinitis Alergik & Urtikaria Alahan (Umur ≥ 6 Bulan)',
        doseFormula: '0.25 mg/kg/dos sekali atau dua kali sehari',
        calculationMode: 'per_dose',
        doseMgPerKg: 0.25,
        doseRangeLabel: '0.25 mg/kg/dos OD',
        dividedTimesPerDay: 1,
        frequencyLabel: 'OD (Sekali Sehari Waktu Malam)',
        maxDailyDoseMg: 10,
        maxSingleDoseMg: 10,
        standardFormulations: [
          { label: 'Sirap 5mg / 5mL (1mg/mL)', mgPerMl: 1 }
        ],
        clinicalAdvice: 'Umur 6 bln - 2 thn: 2.5mg OD; Umur 2 - 5 thn: 2.5 - 5mg OD; Umur ≥ 6 thn: 10mg OD.'
      }
    ]
  },
  {
    id: 'ondansetron',
    drugName: 'Ondansetron Syrup / IV',
    category: '5-HT3 Antiemetic',
    route: 'Oral/IV',
    source: 'KKM_STANDARD',
    indications: [
      {
        id: 'ond-std',
        name: 'Loya & Muntah Akut / Gastroenteritis / Kemoterapi (CINV)',
        doseFormula: '0.15 mg/kg/dos IV/Oral setiap 8 jam',
        calculationMode: 'per_dose',
        doseMgPerKg: 0.15,
        doseRangeLabel: '0.15 mg/kg/dos TDS',
        dividedTimesPerDay: 3,
        frequencyLabel: 'TDS / Q8H (Maks 3 Kali Sehari)',
        maxDailyDoseMg: 24,
        maxSingleDoseMg: 8,
        standardFormulations: [
          { label: 'Sirap 4mg / 5mL (0.8mg/mL)', mgPerMl: 0.8 },
          { label: 'Injeksi IV 2mg / 1mL (2mg/mL)', mgPerMl: 2 }
        ],
        clinicalAdvice: 'Antiemetik pilihan utama pediatrik yang selamat dan berkesan tinggi. Maksimum 8mg per dos.'
      }
    ]
  },
  {
    id: 'prednisolone',
    drugName: 'Prednisolone Syrup / Tablet',
    category: 'Systemic Corticosteroid',
    route: 'Oral',
    source: 'KKM_STANDARD',
    indications: [
      {
        id: 'pred-std',
        name: 'Eksaserbasi Asma Akut Pediatrik / Croup',
        doseFormula: '1 - 2 mg/kg/hari PO sekali sehari (pagi) x 3-5 hari',
        calculationMode: 'daily_divided',
        doseMgPerKg: 1.5,
        doseRangeLabel: '1 - 2 mg/kg/hari OD',
        dividedTimesPerDay: 1,
        frequencyLabel: 'OD (Sekali Sehari Pagi x 3-5 Hari)',
        maxDailyDoseMg: 60,
        maxSingleDoseMg: 60,
        standardFormulations: [
          { label: 'Sirap 15mg / 5mL (3mg/mL)', mgPerMl: 3 }
        ],
        clinicalAdvice: 'Ambil pada waktu pagi bersama makanan. Kursus pendek 3-5 hari tidak memerlukan tapering dos.'
      }
    ]
  }
]
