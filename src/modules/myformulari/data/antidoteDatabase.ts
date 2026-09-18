// src/modules/myformulari/data/antidoteDatabase.ts
import { AntidoteEntry, PRNContactInfo } from '../types/antidoteTypes'

export const PRN_CONTACT_INFO: PRNContactInfo = {
  centerName: 'Pusat Racun Negara (PRN) - Universiti Sains Malaysia / KKM',
  hotlines: ['04-657 0099', '04-653 6999'],
  tollFree: '1-800-88-8099',
  telegram: '@khidmatnasihatkeracunanPRN',
  email: 'prnnet@usm.my',
  operatingHours: {
    weekdays: 'Isnin - Jumaat: 08:00 PG - 10:00 MLM (Pegawai Toksikologi bertugas)',
    weekendsAndHolidays: 'Sabtu, Ahad & Cuti Umum: 08:00 PG - 05:00 PTG',
    afterHours: 'Luar waktu operasi: Hubungi Pegawai Perubatan Kecemasan / Pakar Kecemasan On-Call Hospital Negeri'
  }
}

export const KKM_ANTIDOTE_DATABASE: AntidoteEntry[] = [
  {
    id: 'antidote-warfarin',
    toxicAgent: 'Warfarin & Coumarin Anticoagulants',
    toxicAgentCategory: 'Anticoagulants & Hematology',
    commonExposureExamples: ['Warfarin (Coumadin)', 'Superwarfarin (Brodifacoum / Rodenticide)'],
    primaryAntidote: 'Phytomenadione (Vitamin K1) & 4-Factor PCC',
    brandNames: ['Beriplex P/N', 'Octaplex', 'Konakion MM'],
    secondaryOrAdjunctAntidotes: ['Fresh Frozen Plasma (FFP 15 mL/kg jika PCC tiada)', 'Tranexamic Acid (TXA)'],
    stockTier: 'List A',
    urgencyLevel: 'IMMEDIATE (<15-30 mins)',
    stockLocations: ['Zon Merah Jabatan Kecemasan (ED Resus)', 'Dewan Bedah (OT)', 'Bank Darah / Farmasi 24 Jam'],
    mechanismOfReversal: '4F-PCC membekalkan faktor pembekuan II, VII, IX, X serta Protein C & S yang terpekad untuk memulihkan hemostasis dalam 15 minit. Vitamin K1 memangkinkan sintesis endogen faktor pembekuan bergantung-vitamin K di hati secara berterusan (onset 6-12 jam).',
    clinicalTriggersAndIndications: [
      'Pendarahan major atau mengancam nyawa (intrakranial, retroperitoneal, saluran gastrousus masif)',
      'Pembedahan kecemasan / invasif mandatori dalam tempoh < 6 jam',
      'INR > 10.0 tanpa pendarahan (diberikan Vitamin K1 oral/IV sahaja)',
      'Keracunan racun tikus superwarfarin (brodifacoum) dengan koagulopati berpanjangan'
    ],
    dosingProtocol: {
      adultInitial: 'Beriplex 4F-PCC dos mengikut baseline INR: (INR 2.0-3.9: 25 IU/kg, Maks 2,500 IU; INR 4.0-6.0: 35 IU/kg, Maks 3,500 IU; INR > 6.0: 50 IU/kg, Maks 5,000 IU). Diberikan bersama Vitamin K1 5 - 10 mg IV perlahan.',
      adultMaintenance: 'Vitamin K1 5 - 10 mg IV/oral setiap 12-24 jam jika INR masih meningkat pada hari berikutnya (terutamanya superwarfarin yang memerlukan dos tinggi berminggu-minggu).',
      pediatricInitial: 'Vitamin K1 0.25 - 0.3 mg/kg IV perlahan (Maks 5-10 mg). 4F-PCC: 25 - 50 IU/kg IV (atas nasihat Pakar Hematologi Pediatrik).',
      dilutionAndRoute: 'Beriplex dibancuh dengan pelarut WFI yang disediakan. Vitamin K1 dilarutkan dalam 100 mL Normal Saline 0.9% atau D5W.',
      administrationRate: 'Beriplex: Mula 1 mL/min (25 IU/min), tingkatkan sehingga maks 8 mL/min (200 IU/min). Vitamin K1: Infusi perlahan selama 20 - 30 minit.'
    },
    specialProtocols: [
      {
        title: 'Langkah Pemberian 4F-PCC + Vitamin K1 Pantas',
        description: 'Protokol kecemasan pendarahan intrakranial berkaitan warfarin',
        items: [
          'Ambil sampel darah segera untuk baseline PT/INR, FBC, dan kumpulan darah (GXM).',
          'Jangan tangguhkan PCC sementara menunggu keputusan INR jika pendarahan intrakranial disahkan pada CT scan (gunakan dos empirik 35-50 IU/kg).',
          'Suntik Vitamin K1 10 mg IV infusi serentak dengan PCC untuk mengelakkan lonjakan semula INR selepas 6-8 jam (apabila PCC dimetabolismekan).',
          'Ulang ujian INR pada 15-30 minit selepas tamat infusi PCC (sasaran INR <= 1.5).'
        ]
      }
    ],
    monitoringAndEndpoints: {
      parameters: ['INR & PT (pada 30 minit, 4 jam, 12 jam)', 'Hemoglobin / Hematokrit bersiri', 'Tanda-tanda hemostasis klinikal', 'Tekanan darah & tanda vital'],
      targetEndpoints: ['INR <= 1.5', 'Pendarahan aktif berhenti sepenuhnya', 'Hemodinamik pesakit stabil'],
      frequency: 'Setiap 15-30 minit pasca infusi, kemudian setiap 4-6 jam selama 24 jam pertama'
    },
    criticalWarningsAndCautions: [
      'AMARAN: DILARANG menyuntik Vitamin K1 secara IV bolus laju (risiko renjatan anafilaktoid maut dan henti jantung).',
      'Risiko trombosis (DVT, PE, strok iskemik) selepas pemberian 4F-PCC pada pesakit dengan injap jantung mekanikal.'
    ],
    storageCondition: 'Beriplex: Simpan di bawah 25°C. Jangan bekukan. Lindungi daripada cahaya. Vitamin K1: Simpan di bawah 25°C.',
    prnConsultationAdvised: false,
    fukkmPrescriberCategory: 'A*',
    mohReferenceGuide: 'CPG Anticoagulation MOH & Garis Panduan Penggunaan Darah KKM'
  },
  {
    id: 'antidote-dabigatran',
    toxicAgent: 'Dabigatran Etexilate (Direct Thrombin Inhibitor - DOAC)',
    toxicAgentCategory: 'Anticoagulants & Hematology',
    commonExposureExamples: ['Dabigatran (Pradaxa)'],
    primaryAntidote: 'Idarucizumab',
    brandNames: ['Praxbind'],
    secondaryOrAdjunctAntidotes: ['Tranexamic Acid (TXA)', 'Hemodialisis (dabigatran boleh didialisis ~60%)'],
    stockTier: 'List B',
    urgencyLevel: 'URGENT (<2 hours)',
    stockLocations: ['Farmasi Pusat 24 Jam', 'Zon Merah ED (Pusat Rawatan Strok & Trauma Tertier)'],
    mechanismOfReversal: 'Fragmen antibodi monoklonal manusia (Fab) yang mengikat molekul dabigatran bebas dan terikat trombin dengan afiniti ~350 kali ganda lebih kuat berbanding trombin, meneutralkan kesan antikoagulan dalam masa beberapa minit.',
    clinicalTriggersAndIndications: [
      'Pendarahan major yang tidak terkawal atau mengancam nyawa (cth: pendarahan intraserebral, GI)',
      'Pembedahan kecemasan / prosedur invasif yang tidak boleh ditangguhkan > 8 jam'
    ],
    dosingProtocol: {
      adultInitial: '5.0 g IV jumlah dos, diberikan sebagai DUA vial berturutan (2.5 g / 50 mL setiap satu).',
      adultMaintenance: 'Dos kedua 5.0 g hanya diberikan jika berlaku pendarahan berulang yang klinikal bersama pemanjangan semula masa pembekuan.',
      dilutionAndRoute: 'Sedia diguna tanpa perlu dilarutkan. Berikan secara infusi IV terus atau suntikan bolus IV berturutan.',
      administrationRate: 'Setiap vial 2.5 g diinfusi selama 5 - 10 minit secara berturut-turut.'
    },
    monitoringAndEndpoints: {
      parameters: ['aPTT (activated Partial Thromboplastin Time)', 'Thrombin Time (TT) / Diluted Thrombin Time (dTT)', 'Hemostasis klinikal'],
      targetEndpoints: ['Normalisasi aPTT dan TT dalam 5-10 minit', 'Pendarahan klinikal terkawal'],
      frequency: 'Semak aPTT pada 15-30 minit selepas pemberian dan pada 12-24 jam'
    },
    criticalWarningsAndCautions: [
      'Pemberian Idarucizumab mendedahkan semula pesakit kepada risiko tromboembolisme penyakit asal. Sambung terapi antikoagulan semula sebaik sahaja hemostasis dicapai.',
      'Praxbind mengandungi sorbitol; berhati-hati pada pesakit dengan intoleransi fruktosa keturunan.'
    ],
    storageCondition: 'Simpan di dalam peti sejuk pada suhu 2°C - 8°C. Jangan bekukan atau goncang kuat. Lindungi daripada cahaya.',
    prnConsultationAdvised: false,
    fukkmPrescriberCategory: 'A*',
    mohReferenceGuide: 'FUKKM & Clinical Guidance for DOAC Reversal KKM'
  },
  {
    id: 'antidote-apixaban-rivaroxaban',
    toxicAgent: 'Apixaban & Rivaroxaban (Factor Xa Inhibitors - DOACs)',
    toxicAgentCategory: 'Anticoagulants & Hematology',
    commonExposureExamples: ['Rivaroxaban (Xarelto)', 'Apixaban (Eliquis)', 'Edoxaban (Lixiana)'],
    primaryAntidote: '4-Factor PCC (Beriplex / Octaplex) ± Andexanet Alfa',
    brandNames: ['Beriplex P/N', 'Octaplex', 'Ondexxya / Andexxa (Akses Khas)'],
    secondaryOrAdjunctAntidotes: ['Tranexamic Acid 1 g IV bolus', 'Karbon Aktif (jika dos diambil < 2 jam)'],
    stockTier: 'List B',
    urgencyLevel: 'URGENT (<2 hours)',
    stockLocations: ['Bank Darah / Farmasi 24 Jam', 'Zon Merah ED Tertier'],
    mechanismOfReversal: '4F-PCC memintas perencatan Faktor Xa dengan membekalkan lebihan substrat prothrombin (Faktor II) dan faktor pembekuan aktif. Andexanet alfa bertindak sebagai protein umpan (decoy) rekombinan yang mengikat perencat Faktor Xa secara langsung.',
    clinicalTriggersAndIndications: [
      'Pendarahan major mengancam nyawa (intrakranial, perdarahan masif saluran pencernaan)',
      'Pembedahan kecemasan major dalam tempoh < 6 jam selepas pengambilan dos terakhir DOAC'
    ],
    dosingProtocol: {
      adultInitial: '4F-PCC: 50 IU/kg IV (atau dos tetap 2,000 IU) diinfusi perlahan. Diberikan bersama Tranexamic Acid 1.0 g IV.',
      adultMaintenance: 'Andexanet alfa (jika ada): Dos rendah (400 mg bolus + 4 mg/min x 2 jam) atau Dos tinggi (800 mg bolus + 8 mg/min x 2 jam) mengikut dos dan masa ubat terakhir.',
      dilutionAndRoute: '4F-PCC dilarutkan dalam WFI. Infusi IV perlahan.',
      administrationRate: 'Maksimum 8 mL/min (200 IU/min).'
    },
    monitoringAndEndpoints: {
      parameters: ['Anti-Factor Xa activity (jika ada kalibrasi spesifik)', 'PT / aPTT', 'Tanda hemostasis klinikal'],
      targetEndpoints: ['Pendarahan aktif berhenti', 'Hemodinamik stabil'],
      frequency: 'Pemantauan klinikal berterusan di ICU / Resus'
    },
    criticalWarningsAndCautions: [
      'Ujian rutin PT/INR dan aPTT TIDAK berkorelasi secara kuantitatif dengan kepekatan darah Rivaroxaban atau Apixaban.',
      'Hemodialisis TIDAK berkesan untuk Rivaroxaban/Apixaban kerana kadar ikatan protein plasma yang sangat tinggi (> 85-95%).'
    ],
    storageCondition: '4F-PCC: Simpan di bawah 25°C. Andexanet: 2°C - 8°C.',
    prnConsultationAdvised: false,
    fukkmPrescriberCategory: 'A*',
    mohReferenceGuide: 'National Anticoagulant Guidelines & Formulari KKM'
  },
  {
    id: 'antidote-heparin',
    toxicAgent: 'Heparin (UFH) & Low-Molecular-Weight Heparin (Enoxaparin / LMWH)',
    toxicAgentCategory: 'Anticoagulants & Hematology',
    commonExposureExamples: ['Unfractionated Heparin (UFH)', 'Enoxaparin (Clexane)', 'Fondaparinux (Arixtra - pembalikan separa)'],
    primaryAntidote: 'Protamine Sulphate',
    brandNames: ['Protamine Injection KKM'],
    stockTier: 'List A',
    urgencyLevel: 'IMMEDIATE (<15-30 mins)',
    stockLocations: ['Zon Merah ED', 'Dewan Bedah (OT)', 'ICU', 'Unit Hemodialisis', 'Makmal Kateterisasi (Cath Lab)'],
    mechanismOfReversal: 'Peptida polikationik yang sangat beralkali yang membentuk kompleks garam neutral elektrostatik yang stabil dan tidak aktif secara biologi bersama molekul heparin yang berasid.',
    clinicalTriggersAndIndications: [
      'Pendarahan major aktif semasa terapi infusi heparin atau selepas pembedahan pintasan kardiopulmonari (CPB)',
      'Terlebih dos heparin secara tidak sengaja (overdose)',
      'Pembedahan kecemasan serta-merta pada pesakit yang menerima heparin dos penuh'
    ],
    dosingProtocol: {
      adultInitial: 'Pembalikan UFH: 1.0 mg Protamina bagi setiap 100 unit Heparin yang diberikan dalam 2 jam terakhir (Maks 50 mg dos tunggal). Jika heparin dihentikan > 60 minit: beri 0.5 mg/100 unit. Pembalikan Enoxaparin (LMWH): 1.0 mg Protamina bagi setiap 1.0 mg (100 anti-Xa IU) enoxaparin (diberi < 8 jam).',
      adultMaintenance: 'Jika pendarahan berterusan selepas 2-4 jam, dos kedua 0.5 mg Protamina per 100 unit heparin boleh dipertimbangkan.',
      pediatricInitial: '1.0 mg Protamina bagi setiap 100 unit Heparin secara IV perlahan.',
      maxDose: 'Maksimum 50 mg dalam satu dos tunggal.',
      dilutionAndRoute: 'Boleh diberikan tanpa pencairan atau dicairkan dalam 50-100 mL Normal Saline 0.9%.',
      administrationRate: 'Suntikan IV perlahan selama SEKURANG-KURANGNYA 10 minit (Kadar tidak melebihi 5 mg/minit).'
    },
    monitoringAndEndpoints: {
      parameters: ['aPTT (sasaran baseline 30-40 saat)', 'Activated Clotting Time (ACT di OT/Cath lab: sasaran 100-140s)', 'Tekanan darah semasa suntikan'],
      targetEndpoints: ['Normalisasi aPTT / ACT', 'Penghentian pendarahan'],
      frequency: 'Semak aPTT/ACT pada 5-15 minit selepas infusi Protamina'
    },
    criticalWarningsAndCautions: [
      'AMARAN KESELAMATAN TINGGI: Suntikan bolus laju menyebabkan HIPOTENSI TERUK, BRADIkARDIA MAUT, dan HIPERTENSI PULMONARI AKUT.',
      'Risiko anafilaksis tinggi pada pesakit dengan alahan ikan/makanan laut, pengguna insulin NPH (mengandungi protamina), atau lelaki selepas vasektomi.'
    ],
    storageCondition: 'Simpan di bawah 25°C atau dalam peti sejuk 2°C - 8°C (mengikut pengilang). Lindungi daripada cahaya.',
    prnConsultationAdvised: false,
    fukkmPrescriberCategory: 'A',
    mohReferenceGuide: 'FUKKM & Panduan Transfusi Darah / Prosedur Kardiologi Kebangsaan'
  },
  {
    id: 'antidote-paracetamol',
    toxicAgent: 'Paracetamol (Acetaminophen / APAP)',
    toxicAgentCategory: 'Analgesics & Antipyretics',
    commonExposureExamples: ['Panadol (500mg/650mg)', 'Uphamol', 'Syrup Paracetamol', 'Ubat Batuk Kombinasi'],
    primaryAntidote: 'N-Acetylcysteine (NAC)',
    brandNames: ['Parvolex', 'NAC Injection KKM', 'Fluimucil (Oral)'],
    stockTier: 'List A',
    urgencyLevel: 'IMMEDIATE (<15-30 mins)',
    stockLocations: ['Semua Jabatan Kecemasan (ED)', 'Wad Perubatan & Kanak-kanak', 'Farmasi Pusat'],
    mechanismOfReversal: 'Membekalkan prekursor sistina untuk menghasilkan semula stor glutation hepar yang susut; mengkonjugasikan metabolit toksik N-acetyl-p-benzoquinone imine (NAPQI) secara terus menjadi sebatian tidak toksik; bertindak sebagai antioksidan pemusnah radikal bebas.',
    clinicalTriggersAndIndications: [
      'Pengambilan akut >= 150 mg/kg (atau >= 7.5 g pada orang dewasa)',
      'Paras serum Paracetamol pada 4 jam berada pada atau di atas garis rawatan Nomogram Rumack-Matthew (150 mcg/mL pada 4 jam)',
      'Pesakit berisiko tinggi (alkoholik kronik, malnutrisi, inducer CYP2E1): ambang rawatan diturunkan kepada 100 mg/kg',
      'Pengambilan dos bertingkat (staggered overdose) atau pembentangan lewat dengan enzim ALT/AST meningkat'
    ],
    dosingProtocol: {
      adultInitial: 'Regimen 3-Bag KKM Standard (Jumlah 300 mg/kg dalam 21 jam): Bag 1: 150 mg/kg dalam 200 mL D5W/NS selama 1 jam. Bag 2: 50 mg/kg dalam 500 mL D5W/NS selama 4 jam. Bag 3: 100 mg/kg dalam 1,000 mL D5W/NS selama 16 jam.',
      adultMaintenance: 'Jika paras paracetamol masih dikesan, ALT meningkat, atau INR > 1.3 pada akhir Bag 3: Teruskan Bag 3 (100 mg/kg setiap 16 jam atau 6.25 mg/kg/jam) sehingga ALT menurun dan INR < 1.3.',
      pediatricInitial: 'Jumlah dos 300 mg/kg (kira volum cecair berasaskan berat: Bag 1 dalam 3 mL/kg D5W over 1j; Bag 2 dalam 7 mL/kg D5W over 4j; Bag 3 dalam 14 mL/kg D5W over 16j) untuk mengelakkan lebihan cecair / hiponatremia.',
      dilutionAndRoute: 'D5W (Dextrose 5%) adalah pelarut pilihan (atau 0.9% Normal Saline). Diberikan melalui infusi IV berterusan.',
      administrationRate: 'Bag 1: 1 jam; Bag 2: 4 jam; Bag 3: 16 jam.'
    },
    specialProtocols: [
      {
        title: 'Regimen 2-Bag SNAP (Simplified / Scottish & Newcastle)',
        description: 'Protokol alternatif moden KKM untuk mengurangkan reaksi anafilaktoid dan ralat jururawat',
        items: [
          'Bag 1: 100 mg/kg dalam 200 mL D5W diinfusi selama 2 jam (100 mL/jam).',
          'Bag 2: 200 mg/kg dalam 1,000 mL D5W diinfusi selama 10 jam (100 mL/jam).',
          'Jumlah dos sama (300 mg/kg) dalam tempoh 12 jam. Kadar reaksi alahan menurun secara signifikan.'
        ]
      },
      {
        title: 'Pengendalian Reaksi Anafilaktoid Bukan-IgE Semasa Bag 1',
        description: 'Berlaku pada ~10-15% pesakit semasa infusi laju Bag 1',
        items: [
          'Tanda: Kemerahan muka (flushing), kegatalan, ruam urtikaria, bronkospasma ringan, loya.',
          'Tindakan: Hentikan infusi NAC selama 15 minit.',
          'Berikan IV Chlorpheniramine 10 mg + IV Hydrocortisone 100 mg (nebulized Salbutamol jika berdehit).',
          'Mulakan semula infusi NAC pada KADAR SEPARUH (50%) daripada kadar asal. JANGAN batalkan terapi NAC.'
        ]
      }
    ],
    monitoringAndEndpoints: {
      parameters: ['Paras Paracetamol serum (diambil tepat 4 jam pasca-pengambilan)', 'ALT & AST', 'INR & PT', 'Urea, Elektrolit & Kreatinin', 'Venous Blood Gas (pH & laktat)'],
      targetEndpoints: ['Paras Paracetamol tidak dikesan (< 10 mg/L)', 'ALT/AST normal atau menurun > 50%', 'INR <= 1.3', 'Pesakit pulih secara klinikal'],
      frequency: 'Ujian darah ulangan diambil 2-4 jam sebelum tamat Bag 3'
    },
    criticalWarningsAndCautions: [
      'Jangan tangguhkan pemberian NAC sementara menunggu keputusan makmal jika pesakit tiba > 8 jam selepas pengambilan atau dos terbukti toksik.',
      'Efikasi pencegahan kerosakan hati adalah 100% jika NAC dimulakan dalam masa 8 jam pertama.'
    ],
    storageCondition: 'Simpan di bawah 25°C. Lindungi daripada beku.',
    prnConsultationAdvised: true,
    fukkmPrescriberCategory: 'B',
    mohReferenceGuide: 'National Antidote Stockholding Guidelines & CPG Toxicology KKM'
  },
  {
    id: 'antidote-opioids',
    toxicAgent: 'Opioid Analgesics & Narcotics',
    toxicAgentCategory: 'Sedatives, Opioids & CNS',
    commonExposureExamples: ['Morphine', 'Fentanyl', 'Methadone', 'Tramadol', 'Oxycodone', 'Heroin', 'Codeine'],
    primaryAntidote: 'Naloxone Hydrochloride',
    brandNames: ['Narcan', 'Naloxone Injection KKM'],
    stockTier: 'List A',
    urgencyLevel: 'IMMEDIATE (<15-30 mins)',
    stockLocations: ['Semua Troli Resusitasi (Code Red)', 'Zon Merah ED', 'ICU', 'Wad', 'Ambulans KKM'],
    mechanismOfReversal: 'Antagonis kompetitif tulen pada reseptor opioid mu (μ), kappa (κ), dan delta (δ), menggantikan agonis opioid dan memulihkan depresi pernafasan dalam masa 1-2 minit.',
    clinicalTriggersAndIndications: [
      'Toxidrome Opioid: Depresi pernafasan teruk (Kadar Pernafasan < 8-10 nafas/minit, hipoksemia, sianosis)',
      'Penurunan tahap kesedaran (GCS menurun) bersama pupil miosis (pinpoint pupils)',
      'Henti nafas atau henti jantung disyaki akibat dos berlebihan opioid'
    ],
    dosingProtocol: {
      adultInitial: 'Pesakit Bernafas Spontan: Titrasi dos rendah 0.04 - 0.1 mg IV setiap 2-3 minit sehingga pernafasan spontan pulih (RR > 10-12/min). Pesakit Apnea / Henti Jantung: 0.4 - 2.0 mg IV bolus pantas, ulangi setiap 2-3 minit sehingga maks 10 mg.',
      adultMaintenance: 'Infusi Berterusan (untuk opioid bertindak panjang seperti Methadone): Berikan 2/3 daripada dos bolus awal yang berjaya setiap jam dalam Normal Saline atau D5W.',
      pediatricInitial: '0.01 - 0.1 mg/kg IV / IM / IO (Maks 2.0 mg setiap dos); ulangi setiap 2-3 minit jika tiada respons.',
      dilutionAndRoute: 'Boleh diberikan IV bolus, IM, SC, Intranasal (2 mg), atau melalui tiub endotrakeal jika tiada akses vena.',
      administrationRate: 'IV bolus perlahan (pesakit sedar) atau bolus pantas (henti jantung).'
    },
    monitoringAndEndpoints: {
      parameters: ['Kadar Pernafasan (RR >= 12 nafas/min)', 'SpO2 & gas darah', 'Tahap Kesedaran (GCS)', 'Tanda sindrom tarikan opioid'],
      targetEndpoints: ['Pernafasan spontan mencukupi tanpa bantuan', 'SpO2 > 95% pada udara bilik'],
      frequency: 'Pantau tanda vital setiap 5-10 minit untuk 1 jam pertama, kemudian setiap 30 minit'
    },
    criticalWarningsAndCautions: [
      'AMARAN JANGKA HAYAT PENDEK: Jangka hayat separuh Naloxone hanya 30 - 90 MINIT, sedangkan opioid (Methadone, Tramadol Sustained-Release) boleh bertindak sehingga 24-48 jam. Risiko depresi pernafasan berulang (rebound) adalah tinggi!',
      'Jangan berikan dos berlebihan secara mendadak kepada penagih opioid kronik kerana ia akan mencetuskan sindrom tarikan akut yang ganas (acute withdrawal, edema paru-paru akut, hipertensi teruk, muntah).'
    ],
    storageCondition: 'Simpan di bawah 25°C. Lindungi daripada cahaya matahari langsung.',
    prnConsultationAdvised: false,
    fukkmPrescriberCategory: 'B',
    mohReferenceGuide: 'FUKKM & Protocols in Emergency Medicine KKM'
  },
  {
    id: 'antidote-benzodiazepines',
    toxicAgent: 'Benzodiazepines',
    toxicAgentCategory: 'Sedatives, Opioids & CNS',
    commonExposureExamples: ['Diazepam (Valium)', 'Midazolam (Dormicum)', 'Alprazolam (Xanax)', 'Clonazepam', 'Lorazepam'],
    primaryAntidote: 'Flumazenil',
    brandNames: ['Anexate'],
    stockTier: 'List A',
    urgencyLevel: 'IMMEDIATE (<15-30 mins)',
    stockLocations: ['Zon Merah ED', 'Dewan Bedah (OT)', 'Bilik Prosedur Endoskopi', 'ICU'],
    mechanismOfReversal: 'Antagonis kompetitif pada tapak pengikatan benzodiazepin di kompleks reseptor GABA-A dalam sistem saraf pusat.',
    clinicalTriggersAndIndications: [
      'Pembalikan sedasi prosedur selepas pembedahan / endoskopi',
      'Terlebih dos benzodiazepin tulen dengan depresi pernafasan atau koma'
    ],
    dosingProtocol: {
      adultInitial: '0.2 mg IV disuntik selama 15-30 saat. Jika tahap kesedaran belum dicapai selepas 60 saat, berikan 0.3 mg IV. Dos seterusnya: 0.5 mg IV setiap 60 saat sehingga dos kumulatif maksimum 3.0 mg.',
      adultMaintenance: 'Infusi berterusan: 0.1 - 0.4 mg/jam dalam D5W atau 0.9% Normal Saline.',
      pediatricInitial: '0.01 mg/kg IV (Maks 0.2 mg) over 15 saat; ulangi 0.01 mg/kg selang 60 saat (Maks kumulatif 1.0 mg).',
      maxDose: '3.0 mg dos kumulatif.',
      dilutionAndRoute: 'Suntikan IV terus tanpa pencairan atau infusi perlahan.'
    },
    monitoringAndEndpoints: {
      parameters: ['Tahap kesedaran (GCS)', 'Pernafasan spontan', 'Aktiviti sawan'],
      targetEndpoints: ['Pesakit sedar dan bernafas secara spontan', 'Refleks saluran pernafasan pulih'],
      frequency: 'Setiap 5 minit semasa titrasi dos'
    },
    criticalWarningsAndCautions: [
      'KONTRAINDIKASI MUTLAK: DILARANG memberikan Flumazenil pada koma yang tidak diketahui puncanya (undifferentiated coma) atau pengambilan bersama ubat pro-konvulsan (cth: Antidepresan Trisiklik / TCA, Bupropion, Tramadol, Theophylline) kerana boleh mencetuskan SAWAN STATUS EPILEPTIKUS MAUT yang kebal ubat.',
      'KONTRAINDIKASI pada pesakit epilepsi atau pengguna benzodiazepin kronik (mencetuskan sindrom tarikan akut dan sawan).'
    ],
    storageCondition: 'Simpan di bawah 25°C.',
    prnConsultationAdvised: true,
    fukkmPrescriberCategory: 'A',
    mohReferenceGuide: 'FUKKM & Emergency Toxicology Clinical Protocols'
  },
  {
    id: 'antidote-tca',
    toxicAgent: 'Tricyclic Antidepressants (TCAs)',
    toxicAgentCategory: 'Sedatives, Opioids & CNS',
    commonExposureExamples: ['Amitriptyline', 'Dothiepin', 'Imipramine', 'Clomipramine', 'Nortriptyline'],
    primaryAntidote: 'Sodium Bicarbonate 8.4% (1.0 mmol/mL)',
    brandNames: ['Sodium Bicarbonate 8.4% Infusion KKM'],
    secondaryOrAdjunctAntidotes: ['Intralipid 20% (jika henti jantung / aritmia refraktori)', 'Magnesium Sulphate'],
    stockTier: 'List A',
    urgencyLevel: 'IMMEDIATE (<15-30 mins)',
    stockLocations: ['Semua Troli Resusitasi Kod Merah', 'Zon Merah ED', 'ICU'],
    mechanismOfReversal: 'Beban ion natrium (sodium loading) membuka semula saluran natrium pantas jantung (Phase 0 depolarization) yang disekat oleh TCA. Pengalkalian darah sistemik (pH 7.45-7.55) menukarkan TCA kepada bentuk tidak berion, mengurangkan pengikatan toksin pada reseptor miokardium.',
    clinicalTriggersAndIndications: [
      'Pelebaran kompleks QRS > 100 ms pada ECG (meramalkan risiko sawan)',
      'Pelebaran QRS > 160 ms (meramalkan risiko aritmia ventrikular maut / VT / VF)',
      'Gelombang R terminal pada lead aVR >= 3 mm atau nisbah R/S pada aVR > 0.7',
      'Hipotensi refraktori atau aritmia ventrikular'
    ],
    dosingProtocol: {
      adultInitial: '1.0 - 2.0 mmol/kg (50 - 100 mL Sodium Bicarbonate 8.4%) IV bolus pantas selama 2-3 minit. Ulangi setiap 3-5 minit sehingga QRS mengecil < 100 ms dan tekanan darah stabil.',
      adultMaintenance: 'Infusi Berterusan Isotonik: Campurkan 100 - 150 mL Sodium Bicarbonate 8.4% ke dalam 850 - 900 mL D5W (larutan ~150 mmol/L) dan infusi pada kadar 150 - 250 mL/jam.',
      pediatricInitial: '1.0 - 2.0 mmol/kg (cairkan 1:1 dengan WFI untuk bayi menjadi 4.2%) IV perlahan over 3-5 minit.',
      dilutionAndRoute: 'Bolus 8.4% terus untuk kecemasan, atau dicairkan dalam D5W untuk infusi berterusan.'
    },
    monitoringAndEndpoints: {
      parameters: ['ECG 12-lead bersiri (lebar QRS & aVR)', 'Arterial Blood Gas (pH darah & bikarbonat)', 'Serum Kalium (K+)', 'Serum Natrium (Na+)'],
      targetEndpoints: ['QRS interval < 100 ms', 'pH arteri dikekalkan antara 7.45 - 7.55 (JANGAN LEBIHI 7.55-7.60)', 'K+ dikekalkan 4.0 - 4.5 mmol/L'],
      frequency: 'ECG setiap 15-30 minit dan ABG setiap 1-2 jam'
    },
    criticalWarningsAndCautions: [
      'Alkalosis metabolik mendorong ion kalium masuk ke dalam sel secara agresif. Tambah gantian KCl dalam cecair IV untuk mengelakkan hipokalemia teruk yang mencetuskan aritmia.',
      'ELAKKAN ubat antiaritmia Kelas IA (Procainamide) dan Kelas IC (Flecainide) serta Amiodarone kerana ia memburukkan lagi sekatan saluran natrium.'
    ],
    storageCondition: 'Simpan di bawah 25°C.',
    prnConsultationAdvised: false,
    fukkmPrescriberCategory: 'B',
    mohReferenceGuide: 'MOH Toxicology Protocol & Emergency Cardiac Care Manual'
  },
  {
    id: 'antidote-digoxin',
    toxicAgent: 'Digoxin & Cardiac Glycosides (Pokok Bintaro / Digitalis)',
    toxicAgentCategory: 'Cardiovascular & Inotropes',
    commonExposureExamples: ['Digoxin (Lanoxin)', 'Pokok Bintaro (Cerbera odollam / Pong-pong)', 'Oleander (Nerium oleander)'],
    primaryAntidote: 'Digoxin-Specific Fab Antibody Fragments',
    brandNames: ['DigiFab', 'Digibind'],
    secondaryOrAdjunctAntidotes: ['Atropine (untuk bradikardia)', 'Phenytoin / Lignocaine (untuk aritmia ventrikular)'],
    stockTier: 'List B',
    urgencyLevel: 'URGENT (<2 hours)',
    stockLocations: ['Farmasi Pusat 24 Jam', 'Depot Antidot Negeri (List C Hub)'],
    mechanismOfReversal: 'Fragmen antibodi Fab ovina mengikat molekul digoksin bebas dalam ruang vaskular dengan afiniti sangat tinggi, menghasilkan kompleks Fab-digoksin yang lengai untuk dikumuhkan oleh buah pinggang dan menarik digoksin keluar daripada reseptor miokardium.',
    clinicalTriggersAndIndications: [
      'Aritmia ventrikular mengancam nyawa (VT, VF, asistol) atau blok AV darjah tinggi yang tidak responsif kepada Atropine',
      'Hiperkalemia teruk: Paras Serum Kalium > 5.0 - 5.5 mmol/L dalam ketoksikan akut (petanda kematian terpenting)',
      'Pengambilan akut > 10 mg pada dewasa (> 4 mg pada kanak-kanak) atau paras serum digoxin > 10-15 ng/mL'
    ],
    dosingProtocol: {
      adultInitial: 'Kecemasan Henti Jantung / Aritmia Maut: 10 - 20 vial (400 - 800 mg) IV bolus pantas. Ketoksikan Kronik Teruk: 3 - 6 vial (120 - 240 mg) diinfusi dalam 100 mL 0.9% NS selama 30 minit. Jika dos diketahui: Bilangan Vial = [Dose Ditelan (mg) x 0.8] / 0.5 mg/vial.',
      pediatricInitial: 'Empirik: 1 - 2 vial (40 - 80 mg) IV perlahan over 30 minit.',
      dilutionAndRoute: 'Setiap vial dilarutkan dalam 4 mL WFI, kemudian dicampur dalam 100 mL Normal Saline 0.9%.'
    },
    monitoringAndEndpoints: {
      parameters: ['Irama jantung ECG berterusan', 'Serum Kalium (K+)', 'Status hemodinamik'],
      targetEndpoints: ['Pemulihan ritma sinus normal', 'Penurunan paras kalium kepada normal', 'Kestabilan tekanan darah'],
      frequency: 'Pemantauan ECG berterusan di wad ICU / CCU'
    },
    criticalWarningsAndCautions: [
      'AMARAN MAKMAL PENTING: Paras serum digoksin akan MENINGKAT TINGGI secara palsu selepas pemberian DigiFab (mengukur digoksin terikat Fab yang tidak aktif). DILARANG mengulang ujian paras digoksin rutin selama 1-2 minggu.',
      'ELAKKAN pemberian Kalsium IV (Calcium Chloride/Gluconate) pada ketoksikan digoksin disyaki (risiko henti jantung sistolik "stone heart").'
    ],
    storageCondition: 'Simpan di dalam peti sejuk pada suhu 2°C - 8°C.',
    prnConsultationAdvised: true,
    fukkmPrescriberCategory: 'A*',
    mohReferenceGuide: 'National Antidote Stockholding Guidelines & PRN Consultation Manual'
  },
  {
    id: 'antidote-beta-blockers',
    toxicAgent: 'Beta-Adrenergic Antagonists (Beta-Blockers)',
    toxicAgentCategory: 'Cardiovascular & Inotropes',
    commonExposureExamples: ['Propranolol', 'Atenolol', 'Metoprolol', 'Bisoprolol', 'Sotalol', 'Carvedilol'],
    primaryAntidote: 'Glucagon + HIET (High-Dose Insulin) + Calcium Gluconate',
    brandNames: ['Glucagon HypoKit', 'Actrapid (Insulin)', 'Intralipid 20% (untuk Propranolol)'],
    secondaryOrAdjunctAntidotes: ['Adrenaline / Noradrenaline', 'Intralipid 20%'],
    stockTier: 'List A',
    urgencyLevel: 'IMMEDIATE (<15-30 mins)',
    stockLocations: ['Zon Merah ED', 'ICU', 'Farmasi Pusat'],
    mechanismOfReversal: 'Glukagon merangsang reseptor bukan-adrenergik glukagon yang mengaktifkan adenilat siklase dan meningkatkan cAMP intraselular, memintas reseptor beta yang disekat. HIET (Terapi Insulin Dos Tinggi) menukar metabolisme miokardium kepada karbohidrat dan meningkatkan kontraktiliti kalsium intrasel.',
    clinicalTriggersAndIndications: [
      'Bradikardia bergejala teruk (HR < 50 bpm) dan hipotensi refraktori (MAP < 65 mmHg) yang tidak respons kepada cecair dan atropine',
      'Renjatan kardiogenik akibat dos berlebihan penyekat beta'
    ],
    dosingProtocol: {
      adultInitial: '1. Glukagon: 3.0 - 5.0 mg (50 mcg/kg) IV bolus perlahan over 2-3 minit. Jika berkesan, mulakan infusi 2.0 - 5.0 mg/jam. 2. HIET (Insulin Dos Tinggi): Regular Insulin (Actrapid) 1.0 unit/kg IV bolus bersama 50 mL Dextrose 50% (D50%), diikuti infusi 1.0 unit/kg/jam (titrasi sehingga 2.0-5.0 unit/kg/jam). 3. Kalsium Glukonat 10%: 30 - 60 mL IV over 10 minit.',
      adultMaintenance: 'Kekalkan infusi D10W atau D20W untuk mengekalkan glukosa darah 6.0 - 11.0 mmol/L.',
      pediatricInitial: 'Glukagon 50 mcg/kg IV (Maks 5 mg). HIET: 1.0 unit/kg bolus insulin + 0.5-1.0 g/kg Dextrose, kemudian infusi 1.0 unit/kg/jam.',
      dilutionAndRoute: 'Glukagon dibancuh dengan pelarut khas; Insulin diinfusi melalui syringe pump.'
    },
    monitoringAndEndpoints: {
      parameters: ['Tekanan Darah & MAP (sasaran MAP >= 65 mmHg)', 'Kadar Nadi (HR > 50 bpm)', 'Glukosa Darah Kapilari (setiap 15-30 minit)', 'Serum Kalium (setiap jam)'],
      targetEndpoints: ['Hemodinamik stabil', 'Perfusi tisu pulih (laktat menurun, pengeluaran urin mencukupi)'],
      frequency: 'Pantau glukosa darah setiap 15-30 minit untuk 2 jam pertama, kemudian setiap jam'
    },
    criticalWarningsAndCautions: [
      'Glukagon dos tinggi kerap menyebabkan muntah teruk. Sediakan profilaksis antiemetik (IV Ondansetron 8 mg) dan kawal saluran pernafasan.',
      'Pantau hipokalemia semasa terapi HIET; tambah gantian Kalium hanya jika K+ < 2.8-3.0 mmol/L.'
    ],
    storageCondition: 'Glucagon: 2°C - 8°C (atau < 25°C sebelum dibancuh). Insulin: 2°C - 8°C.',
    prnConsultationAdvised: true,
    fukkmPrescriberCategory: 'A',
    mohReferenceGuide: 'Malaysian Emergency Medicine Protocols on Cardiovascular Toxicology'
  },
  {
    id: 'antidote-ccb',
    toxicAgent: 'Calcium Channel Blockers (CCBs)',
    toxicAgentCategory: 'Cardiovascular & Inotropes',
    commonExposureExamples: ['Verapamil', 'Diltiazem', 'Amlodipine', 'Nifedipine', 'Felodipine'],
    primaryAntidote: 'Calcium Gluconate 10% / Chloride + HIET + Noradrenaline',
    brandNames: ['Calcium Gluconate 10% KKM', 'Actrapid', 'Intralipid 20%'],
    secondaryOrAdjunctAntidotes: ['Vasopressin / Epinephrine', 'Intralipid 20% (untuk renjatan refraktori)'],
    stockTier: 'List A',
    urgencyLevel: 'IMMEDIATE (<15-30 mins)',
    stockLocations: ['Zon Merah ED', 'ICU', 'Dewan Bedah'],
    mechanismOfReversal: 'Ion kalsium ekstraselular yang tinggi memintas sekatan saluran kalsium jenis-L (L-type). HIET memulihkan rintangan insulin miokardium, membekalkan substrat tenaga kepada sel otot jantung yang tenat, dan memulihkan tonus vaskular.',
    clinicalTriggersAndIndications: [
      'Hipotensi teruk dan renjatan vasodilatasi refraktori',
      'Bradikardia, blok nodus AV lanjutan, asidosis laktat metabolik teruk'
    ],
    dosingProtocol: {
      adultInitial: '1. Kalsium Glukonat 10%: 30 - 60 mL (3-6 ampul) IV over 10 minit (atau Calcium Chloride 10-20 mL melalui talian pusat). Ulang setiap 15 minit sehingga 3 dos. 2. HIET: Regular Insulin 1.0 unit/kg IV bolus + 50 mL D50%, kemudian infusi 1.0 - 5.0 unit/kg/jam (sehingga maks 10 unit/kg/jam). 3. Noradrenaline infusi untuk vasodilatasi periferi.',
      adultMaintenance: 'Infusi berterusan Kalsium Glukonat 0.6 - 1.5 mL/kg/jam + Dextrose D10W/D20W untuk euglisemia (6.0 - 11.0 mmol/L).',
      pediatricInitial: 'Kalsium Glukonat 10%: 0.5 mL/kg (50 mg/kg) IV over 10 min. HIET: Insulin 1.0 unit/kg bolus.',
      dilutionAndRoute: 'Calcium Chloride HANYA melalui Central Venous Line (risiko nekrosis tisu jika periferal). Calcium Gluconate selamat melalui vena periferal besar.'
    },
    monitoringAndEndpoints: {
      parameters: ['MAP (sasaran >= 65 mmHg)', 'Ionized Calcium (sasaran 1.5 - 2.0 mmol/L)', 'Glukosa darah kapilari (setiap 15-30 minit)', 'Serum Kalium (setiap jam)'],
      targetEndpoints: ['Resolusi renjatan', 'Pemulihan ritma jantung dan pengeluaran urin > 0.5 mL/kg/jam'],
      frequency: 'Pemantauan invasif berterusan di ICU'
    },
    criticalWarningsAndCautions: [
      'Ketoksikan CCB dos tinggi (terutamanya Amlodipine & Verapamil SR) mempunyai mortaliti sangat tinggi dan memerlukan rawatan HIET awal yang agresif.',
      'Jangan gunakan Calcium Chloride melalui vena kecil periferi kerana ekstravasasi akan menyebabkan nekrosis kulit dan tisu lembut yang teruk.'
    ],
    storageCondition: 'Calcium Salts: Simpan di bawah 25°C. Insulin: 2°C - 8°C.',
    prnConsultationAdvised: true,
    fukkmPrescriberCategory: 'A',
    mohReferenceGuide: 'CPG & Consensus on Shock and Toxicology Management KKM'
  },
  {
    id: 'antidote-organophosphates',
    toxicAgent: 'Organophosphates & Carbamates (Pesticides / Insecticides)',
    toxicAgentCategory: 'Pesticides & Agrochemicals',
    commonExposureExamples: ['Malathion', 'Diazinon', 'Chlorpyrifos', 'Carbofuran', 'Methomyl', 'Racun Serangga Pertanian'],
    primaryAntidote: 'Atropine Sulphate + Pralidoxime (PAM-2)',
    brandNames: ['Atropine Sulphate Injection', 'Pralidoxime Chloride / Mesylate (2-PAM)'],
    secondaryOrAdjunctAntidotes: ['Diazepam IV (untuk sawan kolinergik)', 'Sodium Bicarbonate'],
    stockTier: 'List A',
    urgencyLevel: 'IMMEDIATE (<15-30 mins)',
    stockLocations: ['Zon Merah ED (Minimum 100-300 ampul Atropine)', 'ICU', 'Farmasi Pusat'],
    mechanismOfReversal: 'Atropine menyekat reseptor muskarinik asetilkolina secara kompetitif untuk mengeringkan rembesan paru-paru (bronkorrhoea) dan merawat bradikardia. Pralidoxime memecahkan ikatan organofosfat-asetilkolinesterase untuk mengaktifkan semula enzim sebelum penuaan kimia (aging), memulihkan fungsi otot rangka.',
    clinicalTriggersAndIndications: [
      'Krisis Kolinergik Akut (SLUDGE / DUMBELS): Salivasi melampau, lakrimasi, kencing, cirit-birit, muntah, BRONKORRHOEA (rembesan paru-paru basah), BRONKOSPASMA, BRADIKARDIA, fasikulasi otot, sawan, koma'
    ],
    dosingProtocol: {
      adultInitial: '1. Atropine: 1.8 - 3.0 mg (2-4 ampul) IV bolus pantas. GANDAKAN DOS SETIAP 3-5 MINIT (2 mg -> 4 mg -> 8 mg -> 16 mg -> 32 mg -> 64 mg) sehingga sasaran atropinisasi tercapai. 2. Pralidoxime: 1.0 - 2.0 g (30 mg/kg) IV dalam 100 mL 0.9% NS diinfusi selama 30 minit.',
      adultMaintenance: 'Atropine: Infusi berterusan 10% - 20% daripada jumlah dos loading yang diperlukan sejam. Pralidoxime: Infusi 8 - 10 mg/kg/jam (atau 500 mg/jam) berterusan selama 24-48 jam.',
      pediatricInitial: 'Atropine: 0.02 - 0.05 mg/kg IV (min 0.1 mg); gandakan dos setiap 5 minit. Pralidoxime: 25 - 50 mg/kg IV over 30 min, diikuti infusi 10-20 mg/kg/jam.',
      dilutionAndRoute: 'Atropine suntikan IV bolus terus. Pralidoxime dilarutkan dalam 100 mL Normal Saline.'
    },
    specialProtocols: [
      {
        title: 'Sasaran & Kriteria Atropinisasi Sempurna (The ABC Criteria)',
        description: 'End-point rawatan terpenting yang menyelamatkan nyawa pesakit',
        items: [
          '1. Paru-paru bersih pada auskultasi (Resolusi bronkorrhoea & bronkospasma) - SASARAN UTAMA!',
          '2. Kadar denyutan jantung (Heart Rate) > 80 bpm.',
          '3. Tekanan Darah Sistolik > 80-90 mmHg.',
          '4. Ketiak dan mulut kering, kulit menjadi merah dan hangat.',
          '5. Pupil membesar (Mydriasis adalah tanda sekunder; JANGAN gunakan saiz pupil sahaja sebagai petunjuk).'
        ]
      }
    ],
    monitoringAndEndpoints: {
      parameters: ['Bunyi pernafasan paru-paru (crepitations/wheezing)', 'Kadar nadi & tekanan darah', 'SpO2 & gas darah arteri', 'Aktiviti enzim serum kolinesterase (ChE)'],
      targetEndpoints: ['Paru-paru kering dan tiada sesak nafas', 'Hemodinamik stabil', 'Ketiadaan fasikulasi otot'],
      frequency: 'Setiap 3-5 minit semasa resusitasi awal, kemudian setiap 30 minit semasa infusi'
    },
    criticalWarningsAndCautions: [
      'AMARAN DEKONTAMINASI & PPE: Anggota kesihatan WAJIB memakai PPE lengkap (gaun kalis air, sarung tangan nitril berganda, pelindung muka) semasa memandikan pesakit bagi mengelakkan keracunan sekunder.',
      'DILARANG menyuntik Pralidoxime secara bolus laju (boleh mencetuskan laringospasma, kekejangan otot, dan henti jantung).'
    ],
    storageCondition: 'Simpan di bawah 25°C.',
    prnConsultationAdvised: true,
    fukkmPrescriberCategory: 'B',
    mohReferenceGuide: 'Garis Panduan Pengurusan Keracunan Organofosfat & Antidot KKM'
  },
  {
    id: 'antidote-last',
    toxicAgent: 'Local Anaesthetic Systemic Toxicity (LAST)',
    toxicAgentCategory: 'Local Anaesthetics & Lipophilic',
    commonExposureExamples: ['Bupivacaine (Marcain)', 'Ropivacaine (Naropin)', 'Lignocaine / Lidocaine', 'Levobupivacaine'],
    primaryAntidote: '20% Intravenous Lipid Emulsion (ILE)',
    brandNames: ['Intralipid 20%', 'Lipofundin 20%'],
    stockTier: 'List A',
    urgencyLevel: 'IMMEDIATE (<15-30 mins)',
    stockLocations: ['Semua Dewan Bedah (OT)', 'Dewan Bersalin (Labour Ward)', 'Zon Merah ED', 'Bilik Prosedur Bius Setempat'],
    mechanismOfReversal: 'Lipid Sink & Metabolic Effect: Membentuk fasa lipid intravaskular yang menyerap molekul bius setempat yang sangat lipofilik keluar dari reseptor sasaran di jantung dan otak. Membekalkan substrat asid lemak untuk menjana semula ATP mitokondria miokardium.',
    clinicalTriggersAndIndications: [
      'Gejala neurologi awal (kebas bibir/lidah, rasa logam, dengungan telinga, sawan, koma) atau kolaps kardiovaskular mendadak (aritmia ventrikular, hipotensi teruk, asistol) sejurus selepas suntikan bius setempat'
    ],
    dosingProtocol: {
      adultInitial: '1. Bolus IV Segera: 1.5 mL/kg Intralipid 20% (anggaran 100 mL untuk dewasa 70 kg) disuntik selama 2-3 minit. 2. Infusi Berterusan Segera: 0.25 mL/kg/minit (anggaran 18 mL/min atau ~1,000 mL/jam).',
      adultMaintenance: 'Jika ketidakstabilan berterusan: Ulang bolus 1.5 mL/kg selang 3-5 minit (sehingga maksimum 3 kali) dan gandakan infusi kepada 0.5 mL/kg/min. Teruskan infusi selama sekurang-kurangnya 10-15 minit selepas kestabilan tercapai.',
      pediatricInitial: 'Bolus 1.5 mL/kg Intralipid 20% over 2-3 minit, diikuti infusi 0.25 mL/kg/minit.',
      maxDose: 'Maksimum dos kumulatif 10 - 12 mL/kg dalam 30 minit pertama.',
      dilutionAndRoute: 'Intralipid 20% disuntik terus melalui talian IV tanpa pencairan.'
    },
    specialProtocols: [
      {
        title: 'Pengubahsuaian Resusitasi ACLS Semasa LAST',
        description: 'Garis panduan rasmi Malaysian Society of Anaesthesiologists & ASRA',
        items: [
          'Kurangkan dos Adrenaline individu kepada < 1 mcg/kg (cth: 10 - 50 mcg sahaja) bagi mengelakkan aritmia maut dan edema pulmonari.',
          'ELAKKAN Vasopressin, Penyekat Saluran Kalsium, Penyekat Beta, dan Lignocaine.',
          'Teruskan CPR berkualiti tinggi kerana pemulihan mungkin mengambil masa 30-60 minit dengan terapi lipid.'
        ]
      }
    ],
    monitoringAndEndpoints: {
      parameters: ['Irama jantung ECG berterusan', 'Tekanan darah & MAP', 'Status neurologi & sawan'],
      targetEndpoints: ['Kembalinya peredaran spontan (ROSC)', 'Resolusi aritmia dan kestabilan hemodinamik'],
      frequency: 'Pemantauan berterusan semasa resusitasi'
    },
    criticalWarningsAndCautions: [
      'Gunakan HANYA emulsi lipid 20% (jangan gunakan emulsi 10% atau larutan nutrisi parenteral lain).',
      'Simpan pek Intralipid 20% khusus di lokasi yang mudah dicapai oleh pakar bius dan jururawat dewan bedah.'
    ],
    storageCondition: 'Simpan di bawah 25°C. DILARANG BEKUKAN.',
    prnConsultationAdvised: false,
    fukkmPrescriberCategory: 'A',
    mohReferenceGuide: 'MSA & ASRA Guidelines on Local Anaesthetic Systemic Toxicity'
  },
  {
    id: 'antidote-toxic-alcohols',
    toxicAgent: 'Methanol & Ethylene Glycol (Toxic Alcohols)',
    toxicAgentCategory: 'Toxic Alcohols & Solvents',
    commonExposureExamples: ['Arak Tiruan / Moonshine (Methanol)', 'Bendalir Penyejuk Enjin / Antifreeze (Ethylene Glycol)', 'Pelarut Perindustrian'],
    primaryAntidote: 'Ethanol (10% IV / 40% Oral) OR Fomepizole + Folinic Acid',
    brandNames: ['Ethanol 10% IV Infusion KKM', 'Antizol (Fomepizole - Depot Negeri)', 'Calcium Leucovorin'],
    secondaryOrAdjunctAntidotes: ['Hemodialisis Kecemasan', 'Sodium Bicarbonate 8.4%', 'Pyridoxine & Thiamine (untuk Ethylene Glycol)'],
    stockTier: 'List A',
    urgencyLevel: 'IMMEDIATE (<15-30 mins)',
    stockLocations: ['Zon Merah ED', 'Farmasi Pusat', 'Depot Negeri (untuk Fomepizole)'],
    mechanismOfReversal: 'Etanol dan Fomepizole menyekat enzim Alcohol Dehydrogenase (ADH) secara kompetitif dengan afiniti sangat tinggi, menghalang metabolisme metanol kepada asid formik toksik (punca kebutaan dan asidosis teruk) serta etilena glikol kepada asid oksalat (punca kegagalan buah pinggang). Folinic acid mempercepatkan pemecahan format kepada CO2 dan air.',
    clinicalTriggersAndIndications: [
      'Sejarah meminum arak tiruan dengan asidosis metabolik jurang anion tinggi (High Anion Gap Metabolic Acidosis)',
      'Gangguan penglihatan ("snowfield vision" / penglihatan kabur kabus putih)',
      'Paras jurang osmolar (Osmolar Gap) > 10-15 mOsm/kg atau paras metanol > 20 mg/dL'
    ],
    dosingProtocol: {
      adultInitial: '1. Etanol Oral (Spirits 40% e.g. Vodka/Whisky via oral/tiub NGT): Dos loading 1.8 mL/kg dicairkan 1:1 dalam jus/air. Infusi Etanol 10% IV: Loading 8.0 - 10.0 mL/kg (800-1000 mg/kg) dalam D5W over 30-60 minit. ATAU Fomepizole: 15 mg/kg IV over 30 min. 2. Folinic Acid (Calcium Leucovorin): 50 mg IV setiap 4-6 jam. 3. Sodium Bicarbonate 8.4% untuk kekalkan pH darah > 7.35.',
      adultMaintenance: 'Etanol Oral: 0.2 - 0.4 mL/kg/jam (tingkatkan kepada 0.4 - 0.6 mL/kg/jam semasa hemodialisis). Sasaran paras etanol darah: 100 - 150 mg/dL (22 - 33 mmol/L).',
      pediatricInitial: 'Fomepizole 15 mg/kg IV loading, atau Etanol 10% IV 8.0 mL/kg over 60 min.',
      dilutionAndRoute: 'Etanol IV perlu dicairkan kepada kepekatan 10% dalam D5W untuk mengelakkan flebitis vena.'
    },
    specialProtocols: [
      {
        title: 'Indikasi Mandatori Hemodialisis Kecemasan',
        description: 'Kriteria hemodialisis serta-merta bagi kes keracunan alkohol toksik KKM',
        items: [
          '1. Asidosis metabolik teruk refraktori (pH arteri < 7.25 - 7.30 atau defisit asas > -15 mmol/L).',
          '2. Kehadiran gangguan penglihatan atau papiledema.',
          '3. Kegagalan fungsi buah pinggang akut / anuria.',
          '4. Paras serum Metanol atau Ethylene Glycol > 50 mg/dL (> 15.6 mmol/L).'
        ]
      }
    ],
    monitoringAndEndpoints: {
      parameters: ['Paras etanol darah (sasaran 100-150 mg/dL)', 'Gas darah arteri & pH (sasaran pH > 7.35)', 'Anion gap & Osmolar gap', 'Fungsi buah pinggang & ujian penglihatan'],
      targetEndpoints: ['Paras toksin metanol/EG < 20 mg/dL', 'Resolusi penuh asidosis metabolik dan jurang anion normal'],
      frequency: 'Semak gas darah dan paras etanol setiap 1-2 jam'
    },
    criticalWarningsAndCautions: [
      'Infusi etanol boleh menyebabkan hipoglisemia teruk (terutamanya pada kanak-kanak) dan sedasi CNS. Pantau glukosa darah dengan kerap.',
      'Tingkatkan kadar infusi etanol sebanyak 2 kali ganda semasa sesi hemodialisis kerana etanol turut disingkirkan oleh dialiser.'
    ],
    storageCondition: 'Simpan di bawah 25°C.',
    prnConsultationAdvised: true,
    fukkmPrescriberCategory: 'A',
    mohReferenceGuide: 'National Outbreak Clinical Protocol for Methanol Poisoning KKM'
  },
  {
    id: 'antidote-cyanide',
    toxicAgent: 'Cyanide & Fire Smoke Inhalation',
    toxicAgentCategory: 'Cellular Toxins & Gases',
    commonExposureExamples: ['Hydrogen Cyanide Gas', 'Garam Sianida (Penyaduran Logam)', 'Mangsa Kebakaran Bangunan / Asap Polimer Sintetik'],
    primaryAntidote: 'Hydroxocobalamin (Cyanokit) OR Sodium Nitrite + Sodium Thiosulfate',
    brandNames: ['Cyanokit', 'Cyanide Antidote Kit KKM'],
    secondaryOrAdjunctAntidotes: ['100% High-Flow Oxygen', 'Sodium Bicarbonate 8.4%'],
    stockTier: 'List A',
    urgencyLevel: 'IMMEDIATE (<15-30 mins)',
    stockLocations: ['Zon Merah ED', 'Unit Rawatan Kebakaran (Burn Unit)', 'ICU'],
    mechanismOfReversal: 'Hydroxocobalamin mengikat ion sianida secara langsung untuk membentuk Cyanocobalamin (Vitamin B12) yang tidak toksik dan dikumuhkan melalui urin. Natrium Tiosulfat membekalkan substrat sulfur untuk enzim rhodanese menukarkan sianida kepada tiosianat.',
    clinicalTriggersAndIndications: [
      'Mangsa terperangkap dalam kebakaran ruang tertutup dengan kesan jelaga pada hidung/mulut, perubahan status mental, renjatan, dan asidosis laktat teruk (Laktat Serum > 8-10 mmol/L)',
      'Pendedahan industri kepada garam atau gas sianida'
    ],
    dosingProtocol: {
      adultInitial: 'Pilihan Utama (Selamat untuk mangsa kebakaran): Hydroxocobalamin (Cyanokit) 5.0 g IV dibancuh dalam 200 mL 0.9% NS diinfusi selama 15 minit. (Dos kedua 5.0 g boleh diinfusi selama 15 min - 2 jam jika henti jantung/renjatan berterusan). Kit Tradisional: Sodium Nitrite 3% 300 mg IV over 5-10 min, diikuti Sodium Thiosulfate 25% 12.5 g (50 mL) IV over 10-20 min.',
      pediatricInitial: 'Hydroxocobalamin: 70 mg/kg IV (Maks 5.0 g) over 15 minit. Sodium Thiosulfate 25%: 1.65 mL/kg (400 mg/kg) IV.',
      dilutionAndRoute: 'Cyanokit dilarutkan dalam 200 mL Normal Saline. Diberikan secara infusi IV pantas.'
    },
    monitoringAndEndpoints: {
      parameters: ['Laktat serum bersiri (penurunan laktat menandakan pemulihan respirasi sel)', 'Gas darah arteri & status asid-bes', 'Tekanan darah & ECG'],
      targetEndpoints: ['Paras laktat turun < 2.0 mmol/L', 'Hemodinamik stabil dan kesedaran pulih'],
      frequency: 'Semak laktat dan ABG setiap 30 minit'
    },
    criticalWarningsAndCautions: [
      'KONTRAINDIKASI SODIUM NITRITE: DILARANG menggunakan Sodium Nitrite pada mangsa kebakaran asap yang disyaki mempunyai keracunan Karbon Monoksida serentak (mencetuskan methemoglobinemia maut di atas karboksihemoglobin). Gunakan HYDROXOCOBALAMIN atau Sodium Thiosulfate sahaja!',
      'Hydroxocobalamin menyebabkan warna kulit, mukosa, dan air kencing bertukar menjadi merah gelap (chromaturia) selama 7-14 hari serta mengganggu ujian kolorimetrik makmal.'
    ],
    storageCondition: 'Simpan di bawah 25°C. Lindungi daripada cahaya.',
    prnConsultationAdvised: true,
    fukkmPrescriberCategory: 'A',
    mohReferenceGuide: 'Emergency Management of Chemical & Smoke Poisoning Guidelines KKM'
  },
  {
    id: 'antidote-co',
    toxicAgent: 'Carbon Monoxide (CO Poisoning)',
    toxicAgentCategory: 'Cellular Toxins & Gases',
    commonExposureExamples: ['Asap Kebakaran Bangunan', 'Ekzos Kenderaan Bermotor', 'Pemanas Air Gas / Penjana Elektrik Generator'],
    primaryAntidote: '100% Normobaric Oxygen (NBO) / Hyperbaric Oxygen (HBOT)',
    brandNames: ['High-Flow O2 via Non-Rebreather Mask (NRB)', 'Hyperbaric Oxygen Chamber'],
    stockTier: 'List A',
    urgencyLevel: 'IMMEDIATE (<15-30 mins)',
    stockLocations: ['Semua Jabatan Kecemasan & Ambulans', 'Pusat Rawatan Hiperbarik Terpilih (cth: HAT Lumut, KD Duyong, HKL)'],
    mechanismOfReversal: 'Oksigen berkepekatan tinggi mempercepatkan disosiasi karbon monoksida daripada hemoglobin, mioglobin, dan sitokrom c oksidase (memendekkan masa separuh hayat COHb daripada 320 minit pada udara biasa kepada 60-80 minit pada O2 100%, dan 20-30 minit dalam kebuk hiperbarik pada 2.5-3.0 ATA).',
    clinicalTriggersAndIndications: [
      'Paras Carboxyhemoglobin (COHb) > 25% (atau > 15-20% pada wanita hamil / janin)',
      'Sejarah pengsan / koma / hilang kesedaran',
      'Defisit neurologi akut, sawan, atau iskemia miokardium (sakit dada / perubahan ECG)'
    ],
    dosingProtocol: {
      adultInitial: 'Oksigen 100% serta-merta melalui Non-Rebreather Mask (NRB) dengan beg takungan pada kadar 12 - 15 L/minit secara berterusan selama 4 - 6 jam atau sehingga pesakit bebas gejala dan paras COHb < 3-5%.',
      adultMaintenance: 'Hyperbaric Oxygen Therapy (HBOT): Oksigen 100% pada tekanan 2.5 - 3.0 ATA selama 90 - 120 minit dalam kebuk hiperbarik jika memenuhi kriteria rujukan.',
      pediatricInitial: 'Oksigen 100% melalui topeng muka rapat 12-15 L/minit.',
      dilutionAndRoute: 'Inhalasi Oksigen 100% (High-Flow NRB Mask atau ETT Ventilator) / Kebuk Hiperbarik.'
    },
    monitoringAndEndpoints: {
      parameters: ['Paras COHb melalui Co-oximetry Blood Gas', 'ECG 12-lead & Troponin jantung', 'Penilaian status neurologi'],
      targetEndpoints: ['COHb < 3.0% (bukan perokok) atau < 5.0-8.0% (perokok kronik)', 'Gejala neurologi pulih sepenuhnya'],
      frequency: 'Semak gas darah co-oximetry setiap 2-4 jam'
    },
    criticalWarningsAndCautions: [
      'AMARAN PULSE OXIMETRY: Oximeter nadi jari standard (SpO2) TIDAK DAPAT membezakan carboxyhemoglobin daripada oxyhemoglobin dan akan memberikan bacaan SpO2 tinggi palsu (~99-100%). Ujian gas darah bersama Co-Oximetry adalah WAJIB.',
      'Semua wanita hamil dengan pendedahan CO perlu dirawat dengan O2 100% lebih lama kerana hemoglobin janin mengikat CO dengan lebih kuat.'
    ],
    storageCondition: 'Bekalan oksigen perubatan standard hospital.',
    prnConsultationAdvised: false,
    fukkmPrescriberCategory: 'C',
    mohReferenceGuide: 'CPG Emergency Medicine & Hyperbaric Medicine Protocols'
  },
  {
    id: 'antidote-isoniazid',
    toxicAgent: 'Isoniazid (INH - Anti-Tuberculosis Medication)',
    toxicAgentCategory: 'Oncology & Antimicrobials',
    commonExposureExamples: ['Isoniazid (Rimifon)', 'Akurit-4 / Akurit-Z (Kombinasi Rawatan TB)'],
    primaryAntidote: 'Pyridoxine (Vitamin B6)',
    brandNames: ['Pyridoxine Hydrochloride Injection 100 mg/mL'],
    secondaryOrAdjunctAntidotes: ['Diazepam IV (sinergi antikonvulsan)'],
    stockTier: 'List A',
    urgencyLevel: 'IMMEDIATE (<15-30 mins)',
    stockLocations: ['Semua Jabatan Kecemasan (ED)', 'Farmasi Pusat', 'Wad Respiratori & TB'],
    mechanismOfReversal: 'INH menyahaktifkan piridoksina fosfokinase, menyebabkan ketiadaan Pyridoxal-5-Phosphate (PLP) yang merupakan kofaktor penting untuk sintesis GABA oleh enzim Glutamic Acid Decarboxylase (GAD). Kekurangan GABA mencetuskan sawan berterusan (status epileptikus) dan asidosis laktat maut. Suntikan Pyridoxine memulihkan sintesis GABA serta-merta.',
    clinicalTriggersAndIndications: [
      'Pengambilan akut INH > 20-30 mg/kg (atau > 1.5 - 2.0 g pada dewasa)',
      'Status epileptikus refraktori kepada ubat sawan standard (Benzodiazepine / Phenytoin)',
      'Asidosis laktat teruk dengan jurang anion tinggi dan koma'
    ],
    dosingProtocol: {
      adultInitial: 'Jika Dos INH Diketahui: Berikan 1.0 g Pyridoxine IV bagi setiap 1.0 g INH yang diambil (nisbah 1:1 gram-ke-gram) pada kadar 1.0 g/minit (Maksimum 5.0 g dos awal). Jika Dos Tidak Diketahui: Berikan 5.0 g Pyridoxine IV bolus perlahan dalam 50 mL D5W over 5-10 minit.',
      adultMaintenance: 'Jika sawan berulang, suntik semula 1.0 - 2.0 g Pyridoxine IV bersama IV Diazepam 10 mg sehingga sawan terhenti sepenuhnya.',
      pediatricInitial: '70 mg/kg Pyridoxine IV (Maksimum 5.0 g) diinfusi selama 5-10 minit.',
      dilutionAndRoute: 'Boleh disuntik terus IV perlahan atau dicairkan dalam 50-100 mL D5W.'
    },
    monitoringAndEndpoints: {
      parameters: ['Pemberhentian aktiviti sawan', 'Gas darah arteri & laktat', 'Tahap kesedaran (GCS)'],
      targetEndpoints: ['Tiada sawan berulang', 'Resolusi asidosis laktat', 'GCS pulih kepada 15'],
      frequency: 'Pemantauan rapi berterusan di zon merah resusitasi'
    },
    criticalWarningsAndCautions: [
      'Sawan akibat INH kebal kepada ubat antikonvulsan konvensional (Phenytoin tidak berkesan). PYRIDOXINE adalah satu-satunya penawar definitif yang menghentikan sawan.',
      'Sediakan bekalan Pyridoxine IV yang mencukupi di semua hospital daerah yang mengendalikan rawatan TB.'
    ],
    storageCondition: 'Simpan di bawah 25°C. Lindungi daripada cahaya.',
    prnConsultationAdvised: false,
    fukkmPrescriberCategory: 'B',
    mohReferenceGuide: 'Malaysian TB Clinical Practice Guidelines & Emergency Toxicology Protocols'
  },
  {
    id: 'antidote-methotrexate',
    toxicAgent: 'Methotrexate (MTX Toxicity / Delayed Clearance)',
    toxicAgentCategory: 'Oncology & Antimicrobials',
    commonExposureExamples: ['High-Dose Methotrexate Chemo', 'Methotrexate Oral (Rheumatology/Dermatology Overdose)'],
    primaryAntidote: 'Folinic Acid (Calcium Leucovorin / Calcium Folinate)',
    brandNames: ['Leucovorin Calcium', 'Voraxaze (Glucarpidase - Akses Khas)'],
    secondaryOrAdjunctAntidotes: ['Sodium Bicarbonate (Pengalkalian Urin)', 'Hidrasi Cecair Agresif IV'],
    stockTier: 'List B',
    urgencyLevel: 'URGENT (<2 hours)',
    stockLocations: ['Farmasi Onkologi', 'Farmasi Pusat 24 Jam', 'Wad Hematologi & Onkologi'],
    mechanismOfReversal: 'Folinic acid adalah kofaktor tetrahidrofolat aktif yang memintas enzim Dihydrofolate Reductase (DHFR) yang disekat oleh MTX, menyelamatkan sel-sel sihat daripada kegagalan sintesis DNA dan mielosupresi.',
    clinicalTriggersAndIndications: [
      'Kelewatan penyingkiran MTX mengikut Nomogram Ketoksikan Bleyer (> 5 micromol/L pada 24 jam, > 0.5 micromol/L pada 48 jam)',
      'Terlebih dos MTX secara tidak sengaja (cth: pesakit reumatoid tersalah makan MTX setiap hari berbanding sekali seminggu)',
      'Kegagalan buah pinggang akut semasa kemoterapi dos tinggi'
    ],
    dosingProtocol: {
      adultInitial: 'Terlebih Dos / Penyingkiran Tertangguh: 100 - 1,000 mg/m2 Leucovorin IV setiap 3-6 jam mengikut paras serum MTX bersiri. Dos Penyelamat Standard: 15 - 25 mg/m2 IV/IM setiap 6 jam sehingga paras MTX < 0.05 micromol/L.',
      adultMaintenance: 'Hidrasi IV 3.0 L/m2/hari + Sodium Bicarbonate untuk mengekalkan pH urin >= 7.0 - 8.0 dan pengeluaran urin > 100 mL/jam.',
      pediatricInitial: '15 mg/m2 IV setiap 6 jam, diselaraskan mengikut nomogram paras MTX.',
      dilutionAndRoute: 'Dilarutkan dalam 100 mL Normal Saline atau D5W.'
    },
    monitoringAndEndpoints: {
      parameters: ['Paras serum Methotrexate setiap 12-24 jam', 'pH urin setiap kali kencing (sasaran pH 7.0-8.0)', 'FBC (kiraan neutrofil & platelet)', 'Fungsi renal & hepar'],
      targetEndpoints: ['Paras MTX serum < 0.05 micromol/L (< 0.05 µM)', 'Ketiadaan mukositis teruk atau mielosupresi'],
      frequency: 'Ujian paras MTX setiap hari sehingga sifar'
    },
    criticalWarningsAndCautions: [
      'PENGALKALIAN URIN ADALAH KRITIKAL: MTX akan mendak dan menghablur dalam tubul renal pada pH urin berasid (< 6.5), mencetuskan kegagalan buah pinggang obstruktif.',
      'Jika menggunakan Glucarpidase (Voraxaze), JANGAN berikan Leucovorin dalam tempoh 2 jam sebelum/selepas Glucarpidase (Glucarpidase turut memecahkan Leucovorin).'
    ],
    storageCondition: 'Simpan di bawah 25°C. Lindungi daripada cahaya.',
    prnConsultationAdvised: true,
    fukkmPrescriberCategory: 'A*',
    mohReferenceGuide: 'National Oncology Chemotherapy Protocols & FUKKM'
  },
  {
    id: 'antidote-iron',
    toxicAgent: 'Iron Supplements (Ferrous Salts)',
    toxicAgentCategory: 'Heavy Metals & Chelators',
    commonExposureExamples: ['Ferrous Fumarate (Iberet / Obimin)', 'Ferrous Sulphate', 'Ferrous Gluconate', 'Iron Drops Kanak-Kanak'],
    primaryAntidote: 'Deferoxamine Mesylate (Desferrioxamine)',
    brandNames: ['Desferal'],
    stockTier: 'List B',
    urgencyLevel: 'URGENT (<2 hours)',
    stockLocations: ['Farmasi Pusat 24 Jam', 'Zon Merah ED Pediatrik & Dewasa'],
    mechanismOfReversal: 'Pengkelat besi heksadentat yang mengikat ion ferik (Fe3+) bebas dalam plasma dan sel untuk membentuk kompleks Ferrioxamine yang larut air, stabil, dan berwarna merah-jingga (vin rosé) untuk dikumuhkan dengan selamat melalui air kencing.',
    clinicalTriggersAndIndications: [
      'Pengambilan dos zat besi elemental > 20-60 mg/kg pada kanak-kanak atau pendedahan toksik dewasa',
      'Paras Besi Serum (Serum Iron) > 500 mcg/dL (90 micromol/L) atau melebihi TIBC',
      'Kehadiran gejala ketoksikan sistemik teruk (renjatan, muntah darah, kelesuan, asidosis metabolik)'
    ],
    dosingProtocol: {
      adultInitial: 'Infusi IV Berterusan: 15 mg/kg/jam IV dalam Normal Saline atau D5W. (Kadar boleh diturunkan selepas 4-6 jam jika keadaan stabil).',
      adultMaintenance: 'Maksimum dos 6.0 - 8.0 g dalam tempoh 24 jam (atau 125 mg/kg/24 jam).',
      pediatricInitial: '15 mg/kg/jam IV infusi berterusan.',
      maxDose: '6.0 g/hari pada dewasa; 80 mg/kg/hari pada kanak-kanak.',
      dilutionAndRoute: 'Dilarutkan dalam 500 mL Normal Saline 0.9% atau D5W.'
    },
    monitoringAndEndpoints: {
      parameters: ['Paras Serum Iron', 'Warna air kencing ("vin rosé" - warna merah jambu/jingga)', 'Gas darah arteri & laktat', 'Tekanan darah bersiri'],
      targetEndpoints: ['Serum Iron < 350 mcg/dL (< 60 µmol/L)', 'Air kencing kembali jernih (tiada warna vin rosé)', 'Resolusi asidosis metabolik'],
      frequency: 'Semak serum iron setiap 4-6 jam'
    },
    criticalWarningsAndCautions: [
      'AMARAN HIPOTENSI: Infusi IV laju menyebabkan pembebasan histamin yang mencetuskan hipotensi mendadak dan renjatan. Hadkan kadar kepada <= 15 mg/kg/jam.',
      'Infusi Desferal yang berterusan melebihi 24 jam meningkatkan risiko Acute Respiratory Distress Syndrome (ARDS) dan jangkitan kuman Yersinia enterocolitica.'
    ],
    storageCondition: 'Simpan di bawah 25°C.',
    prnConsultationAdvised: true,
    fukkmPrescriberCategory: 'A',
    mohReferenceGuide: 'Paediatric Protocols for Malaysian Hospitals & KKM Toxicology Manual'
  },
  {
    id: 'antidote-snakebite',
    toxicAgent: 'Venomous Snake Envenomation (Elapidae & Viperidae)',
    toxicAgentCategory: 'Venomous Bites & Envenomation',
    commonExposureExamples: ['Ular Tedung Selar (King Cobra)', 'Ular Tedung Senduk (Cobra)', 'Ular Kapak Bodoh (Malayan Pit Viper)', 'Ular Katam Tebu / Belang (Krait)', 'Ular Laut (Sea Snake)'],
    primaryAntidote: 'QSMI Snake Antivenom (Serum Antivisa Ular - Monovalent / Polyvalent)',
    brandNames: ['QSMI King Cobra Antivenom', 'QSMI Cobra Antivenom', 'QSMI Malayan Pit Viper Antivenom', 'QSMI Neuro / Hemato Polyvalent Antivenom'],
    secondaryOrAdjunctAntidotes: ['Adrenaline 1:1000 IM (sedia di tepi katil)', 'Neostigmine + Atropine (untuk ujian tensilon kobra)', 'Tetanus Toxoid'],
    stockTier: 'List B',
    urgencyLevel: 'URGENT (<2 hours)',
    stockLocations: ['Farmasi Pusat 24 Jam Hospital Pakar & Daerah', 'Depot Antivenom Negeri (Hospital Utama)'],
    mechanismOfReversal: 'Fragmen antibodi F(ab\')2 imunoglobulin kuda yang ditulenkan dan mengikat toksin bisa ular (neurotoksin, hemotoksin, miotoksin) secara spesifik untuk meneutralkannya sebelum merosakkan saraf atau memusnahkan faktor pembekuan.',
    clinicalTriggersAndIndications: [
      'Tanda Hemotoksisiti: Ujian 20-Minute Whole Blood Clotting Test (20WBCT) positif (darah tidak membeku selepas 20 minit), pendarahan sistemik spontan, INR > 1.5, platelet < 50x10^9/L',
      'Tanda Neurotoksisiti: Ptosis progresif, oftalmoplegia luaran, kesukaran menelan (disfagia), kelumpuhan otot pernafasan',
      'Pembengkakan tempatan teruk (melebihi separuh anggota tubuh atau merentasi >= 2 sendi besar dalam masa 24 jam)'
    ],
    dosingProtocol: {
      adultInitial: 'King Cobra / Cobra Monovalent: 10 VIAL (100 mL) dibancuh dalam 100-250 mL Normal Saline diinfusi over 30-60 minit. Malayan Pit Viper Monovalent: 3 - 5 VIAL dalam 100-250 mL Normal Saline over 30-60 minit. Neuro / Hemato Polyvalent: 5 - 10 VIAL over 30-60 minit.',
      adultMaintenance: 'Ulang ujian 20WBCT pada 6 jam selepas antivenom hemotoksik; jika darah masih tidak membeku, berikan dos ulangan (3-5 vial). Bagi neurotoksik, ulang dos jika ptosis/kelumpuhan bertambah buruk selepas 1-2 jam.',
      pediatricInitial: 'DOS KANAK-KANAK ADALAH SAMA DENGAN DOS DEWASA (kerana kuantiti bisa yang disuntik oleh ular adalah sama banyak). Larutkan dalam volum cecair yang lebih kecil (50-100 mL NS).',
      dilutionAndRoute: 'Setiap vial dilarutkan dalam 10 mL WFI yang dibekalkan, kemudian dicampurkan ke dalam 100-250 mL Normal Saline 0.9% atau D5W.',
      administrationRate: 'Infusi IV perlahan selama 30 - 60 minit di bawah pemantauan jantung dan tanda vital ketat.'
    },
    specialProtocols: [
      {
        title: 'Protokol Ujian 20-Minute Whole Blood Clotting Test (20WBCT)',
        description: 'Ujian saringan wajib di sisi katil bagi gigitan ular kapak / hemotoksik',
        items: [
          'Ambil 2 mL darah vena segar menggunakan picagari bersih.',
          'Masukkan ke dalam tiub kaca (glass tube) yang bersih, kering, dan baru (JANGAN guna tiub plastik).',
          'Biarkan berdiri tegak pada suhu bilik selama tepat 20 MINIT tanpa diganggu.',
          'Selepas 20 minit, condongkan tiub secara perlahan-lahan.',
          'Tafsiran: Jika darah kekal cair sepenuhnya (tidak membeku) = 20WBCT POSITIF (Petunjuk mandatori pemberian Antivenom). Jika darah beku pejal = 20WBCT NEGATIF (Ulang setiap 30 minit untuk 3 jam pertama, kemudian setiap 2 jam).'
        ]
      },
      {
        title: 'Pencegahan & Kesiapsiagaan Anafilaksis Antivenom',
        description: 'Antivenom berasaskan serum kuda mempunyai risiko tinggi reaksi anafilaksis (~20-40%)',
        items: [
          'Sediakan picagari mengandungi IM Adrenaline (1:1000) 0.5 mg (0.01 mg/kg pediatrik) di sisi katil SEBELUM memulakan infusi.',
          'Pra-rawatan (jika perlu): IV Chlorpheniramine 10 mg + IV Hydrocortisone 100-200 mg.',
          'Jika timbul anafilaksis (ruam urtikaria, hipotensi, bronkospasma): Hentikan infusi, suntik IM Adrenaline segera, rawat renjatan, kemudian sambung semula infusi antivenom perlahan-lahan setelah pesakit stabil.'
        ]
      }
    ],
    monitoringAndEndpoints: {
      parameters: ['20WBCT setiap 6 jam pasca-antivenom (hemotoksik)', 'Tahap ptosis & kekuatan nafas (Single Breath Count)', 'Ukur lilit pembengkakan anggota dengan pita pengukur'],
      targetEndpoints: ['20WBCT kembali normal membeku', 'Pendarahan sistemik terhenti', 'Kelumpuhan neurotoksik beransur pulih'],
      frequency: 'Setiap 15 minit semasa infusi antivenom, kemudian setiap 2-4 jam'
    },
    criticalWarningsAndCautions: [
      'DILARANG melakukan torniket (tourniquet ketat), pemotongan luka, sedutan bisa, atau pembakaran luka (amalan berbahaya yang menyebabkan nekrosis dan amputasi anggota).',
      'Hubungi talian Remote Envenomation Consultancy Services (RECS) untuk panduan pengenalpastian spesies ular dan pemilihan antivenom tepat.'
    ],
    storageCondition: 'Simpan di dalam peti sejuk pada suhu 2°C - 8°C. JANGAN BEKUKAN.',
    prnConsultationAdvised: true,
    fukkmPrescriberCategory: 'A*',
    mohReferenceGuide: 'Guideline for the Management of Snakebite in Malaysia (MOH) & RECS Consensus'
  },
  {
    id: 'antidote-sulfonylureas',
    toxicAgent: 'Sulfonylureas (Oral Hypoglycaemics)',
    toxicAgentCategory: 'Endocrine & Metabolic',
    commonExposureExamples: ['Glibenclamide (Daonil)', 'Gliclazide (Diamicron)', 'Glimepiride (Amaryl)', 'Glipizide'],
    primaryAntidote: 'Octreotide + Dextrose Infusion',
    brandNames: ['Sandostatin', 'Octreotide Acetate Injection 50 mcg/mL or 100 mcg/mL'],
    secondaryOrAdjunctAntidotes: ['Dextrose 10% / 20% Infusion', 'Dextrose 50% Bolus IV'],
    stockTier: 'List B',
    urgencyLevel: 'URGENT (<2 hours)',
    stockLocations: ['Farmasi Pusat 24 Jam', 'Zon Merah ED', 'Wad Perubatan'],
    mechanismOfReversal: 'Analog somatostatin sintetik yang mengikat reseptor somatostatin-2 pada sel beta pankreas dan merencat rembesan insulin secara langsung. Menghentikan kitaran lonjakan insulin yang dirangsang oleh infusi glukosa.',
    clinicalTriggersAndIndications: [
      'Hipoglisemia refraktori atau berulang akibat dos berlebihan ubat sulfonilurea yang tidak dapat dikawal dengan infusi dekstrosa sahaja'
    ],
    dosingProtocol: {
      adultInitial: '50 to 100 mcg disuntik secara Subkutaneus (SC) atau IV perlahan setiap 8 jam.',
      adultMaintenance: 'Infusi Berterusan Alternatif: 100 ng/kg/jam (anggaran 50 mcg/jam) dalam Normal Saline selama 24-48 jam.',
      pediatricInitial: '1.0 to 1.5 mcg/kg SC atau IV perlahan setiap 6-8 jam.',
      dilutionAndRoute: 'Suntikan SC adalah kaedah pilihan utama (atau IV perlahan over 5 minit).'
    },
    monitoringAndEndpoints: {
      parameters: ['Glukosa Darah Kapilari (setiap 1-2 jam)', 'Kekerapan episod hipoglisemia'],
      targetEndpoints: ['Paras glukosa darah kekal stabil > 4.5 - 6.0 mmol/L tanpa memerlukan bolus D50% berulang', 'Pesakit bebas hipoglisemia selama 24 jam selepas dos terakhir Oktreotida'],
      frequency: 'Pantau glukosa darah setiap 1-2 jam'
    },
    criticalWarningsAndCautions: [
      'Infusi Dextrose 50% IV secara berulang tanpa Oktreotida akan merangsang sel beta pankreas merembeskan LEBIH BANYAK insulin, mencetuskan hipoglisemia lantunan (rebound hypoglycemia) yang berterusan.',
      'Perhatikan pesakit selama sekurang-kurangnya 24-48 jam kerana sulfonilurea mempunyai jangka hayat tindakan yang panjang.'
    ],
    storageCondition: 'Simpan di dalam peti sejuk pada suhu 2°C - 8°C. Lindungi daripada cahaya.',
    prnConsultationAdvised: false,
    fukkmPrescriberCategory: 'A',
    mohReferenceGuide: 'FUKKM & Endocrine Emergency Management Protocols KKM'
  },
  {
    id: 'antidote-valproate',
    toxicAgent: 'Sodium Valproate / Valproic Acid',
    toxicAgentCategory: 'Sedatives, Opioids & CNS',
    commonExposureExamples: ['Epilim (200mg/500mg)', 'Valparin', 'Depakote'],
    primaryAntidote: 'L-Carnitine (Levocarnitine)',
    brandNames: ['Carnitor Injection', 'L-Carnitine KKM'],
    stockTier: 'List B',
    urgencyLevel: 'URGENT (<2 hours)',
    stockLocations: ['Farmasi Pusat 24 Jam', 'Depot Negeri (List C Hub)'],
    mechanismOfReversal: 'Valproate menyusutkan stor karnitina bebas tubuh dan merencat pengoksidaan beta asid lemak mitokondria serta kitaran urea. Pemberian L-Carnitine memulihkan metabolisme asid lemak hepatik, mengurangkan pengeluaran metabolit toksik 2-propyl-4-pentenoic acid, dan mempercepatkan perkumuhan ammonia melalui kitaran urea.',
    clinicalTriggersAndIndications: [
      'Ensefalopati hiperamonemia valproat (Valproate-Induced Hyperammonemic Encephalopathy - VHE) dengan paras Ammonia Darah > 80-100 micromol/L',
      'Koma teruk atau kemerosotan neurologi mendadak berikutan terlebih dos valproate akut',
      'Paras valproate serum > 450 mcg/mL (> 3,100 micromol/L) atau kehadiran hepatotoksisiti akut'
    ],
    dosingProtocol: {
      adultInitial: 'Dos Loading IV: 100 mg/kg (Maksimum 6.0 g) dibancuh dalam 100 mL Normal Saline atau D5W diinfusi selama 30 minit.',
      adultMaintenance: 'Dos Penyelenggaraan: 50 mg/kg IV setiap 8 jam (diinfusi over 15-30 minit) sehingga paras ammonia turun normal dan status mental pulih.',
      pediatricInitial: '100 mg/kg IV loading over 30 minit, diikuti 50 mg/kg IV setiap 8 jam.',
      dilutionAndRoute: 'Dilarutkan dalam 100 mL Normal Saline 0.9% atau D5W.'
    },
    monitoringAndEndpoints: {
      parameters: ['Paras Ammonia Darah Vena (diambil di atas ais)', 'Tahap Kesedaran (GCS)', 'Paras Valproate Serum', 'Enzim Hati ALT/AST & Bilirubin'],
      targetEndpoints: ['Normalisasi paras ammonia darah (< 50 µmol/L)', 'Pemulihan tahap kesedaran GCS kepada 15'],
      frequency: 'Semak ammonia darah setiap 6-12 jam'
    },
    criticalWarningsAndCautions: [
      'Ensefalopati hiperamonemia boleh berlaku walaupun paras enzim hati (ALT/AST) adalah normal.',
      'Sampel darah untuk ujian ammonia mesti dihantar ke makmal di dalam bekas berais serta-merta bagi mengelakkan peningkatan palsu.'
    ],
    storageCondition: 'Simpan di bawah 25°C.',
    prnConsultationAdvised: true,
    fukkmPrescriberCategory: 'A*',
    mohReferenceGuide: 'Neurology & Toxicology Clinical Management Protocols KKM'
  },
  {
    id: 'antidote-methemoglobinemia',
    toxicAgent: 'Methemoglobinemia Inducers',
    toxicAgentCategory: 'Cellular Toxins & Gases',
    commonExposureExamples: ['Dapsone (Rawatan Kusta/PCP)', 'Benzocaine Topical Gel / Spray', 'Phenazopyridine (Uristat)', 'Baja Nitrat & Nitrit', 'Aniline Dyes'],
    primaryAntidote: 'Methylene Blue 1% (10 mg/mL)',
    brandNames: ['Methylene Blue Injection 1% KKM', 'Methylthioninium Chloride'],
    secondaryOrAdjunctAntidotes: ['Ascorbic Acid (Vitamin C dos tinggi - jika defisiensi G6PD)', 'Hiperbarik Oksigen / Transfusi Pertukaran Darah'],
    stockTier: 'List A',
    urgencyLevel: 'IMMEDIATE (<15-30 mins)',
    stockLocations: ['Zon Merah ED', 'Dewan Bedah (OT)', 'Farmasi Pusat'],
    mechanismOfReversal: 'Metilena biru bertindak sebagai pembawa elektron tiruan (electron acceptor) untuk NADPH-Methemoglobin Reductase, menukarkan metilena biru kepada leucomethylene blue yang seterusnya menurunkan zat besi ferik (Fe3+) dalam methemoglobin kembali kepada bentuk ferus (Fe2+) hemoglobin yang berfungsi mengangkut oksigen.',
    clinicalTriggersAndIndications: [
      'Paras Methemoglobin (MetHb) > 20-30% pada gas darah co-oximetry, atau pesakit bergejala (sianosis kelabu-kebiruan refraktori kepada terapi oksigen, sesak nafas, pening, asidosis)',
      'Darah pesakit kelihatan berwarna coklat pekat coklat-kehitaman ("chocolate brown blood") yang tidak bertukar merah apabila didedahkan kepada udara'
    ],
    dosingProtocol: {
      adultInitial: '1.0 to 2.0 mg/kg (0.1 to 0.2 mL/kg larutan 1%) disuntik secara IV perlahan selama 5 minit.',
      adultMaintenance: 'Dos kedua 1.0 mg/kg boleh diulang selepas 30-60 minit jika sianosis berterusan dan paras MetHb masih > 20%.',
      pediatricInitial: '1.0 mg/kg (0.1 mL/kg larutan 1%) IV perlahan over 5 minit.',
      maxDose: 'Maksimum dos kumulatif 7.0 mg/kg (dos berlebihan boleh mencetuskan methemoglobinemia paradoksikal dan hemolisis).',
      dilutionAndRoute: 'Boleh disuntik terus IV perlahan atau dicairkan dalam 50 mL D5W.'
    },
    monitoringAndEndpoints: {
      parameters: ['Paras MetHb melalui Co-Oximetry Arterial Blood Gas', 'Warna sianosis kulit pesakit', 'FBC & Ujian Hemolisis'],
      targetEndpoints: ['Paras MetHb < 5.0%', 'Resolusi sianosis dan hipoksia tisu'],
      frequency: 'Semak paras MetHb setiap 30-60 minit pasca suntikan'
    },
    criticalWarningsAndCautions: [
      'KONTRAINDIKASI MUTLAK: DILARANG memberikan Methylene Blue kepada pesakit yang diketahui mempunyai KEKURANGAN ENZIM G6PD (G6PD Deficiency) kerana ia tidak berkesan (ketiadaan NADPH) dan akan mencetuskan KRISIS HEMOLISIS MAUT intravaskular teruk. Gunakan Vitamin C dos tinggi (1-2 g IV) atau transfusi pertukaran darah.',
      'Risiko Sindrom Serotonin jika diberikan kepada pesakit yang mengambil ubat SSRI/SNRI (kerana Methylene Blue adalah perencat MAO yang kuat).'
    ],
    storageCondition: 'Simpan di bawah 25°C. Lindungi daripada cahaya matahari.',
    prnConsultationAdvised: true,
    fukkmPrescriberCategory: 'A',
    mohReferenceGuide: 'Emergency Hematology & Toxicology Guidelines KKM'
  },
  {
    id: 'antidote-hydrofluoric-acid',
    toxicAgent: 'Hydrofluoric Acid (HF Chemical Burns / Inhalation)',
    toxicAgentCategory: 'Pesticides & Agrochemicals',
    commonExposureExamples: ['Bendalir Pencuci Mozek / Jubin Industri (HF)', 'Bendalir Pembersih Karat Logam', 'Asid Punaran Kaca (Glass Etching)'],
    primaryAntidote: 'Calcium Gluconate 10% (Gel Topikal / Suntikan SC / IV / Intra-arterial)',
    brandNames: ['Calcium Gluconate 10% KKM', 'C-Gel (Calcium Gluconate Gel)'],
    secondaryOrAdjunctAntidotes: ['Magnesium Sulphate IV', 'Kalsium Klorida'],
    stockTier: 'List A',
    urgencyLevel: 'IMMEDIATE (<15-30 mins)',
    stockLocations: ['Zon Merah ED', 'Bilik Prosedur Rawatan Kecederaan Kimia', 'Klinik Kesihatan Kawasan Industri'],
    mechanismOfReversal: 'Ion fluorida (F-) bebas meresap menembusi kulit dan tisu lembut secara mendalam, mengkelat dan memusnahkan ion kalsium (Ca2+) dan magnesium (Mg2+) tubuh untuk membentuk garam kalsium fluorida yang tidak larut. Suntikan kalsium glukonat membekalkan lebihan ion kalsium untuk meneutralkan ion fluorida, menghentikan nekrosis tisu likuefaktif dan mencegah henti jantung akibat hipokalsemia maut.',
    clinicalTriggersAndIndications: [
      'Semua pendedahan kulit, mata, atau sedutan asap asid hidrofluorik (walaupun kepekatan rendah < 20% yang sering mempunyai gejala tertangguh 12-24 jam)',
      'Sakit pedih terbakar yang teruk yang tidak setimpal dengan rupa luka kulit luaran',
      'Hipokalsemia dan hipomagnesemia akut berikutan pendedahan HF'
    ],
    dosingProtocol: {
      adultInitial: '1. Rawatan Topikal: Sapu Gel Kalsium Glukonat 2.5% (disediakan dengan mencampurkan 10 mL Kalsium Glukonat 10% ke dalam 30 g KY Jelly) secara berterusan pada luka. 2. Suntikan Subkutaneus (jika sakit berterusan): Suntik Kalsium Glukonat 10% 0.5 mL per cm2 kawasan kulit yang terbakar menggunakan jarum halus 27G-30G. 3. Pendedahan Sistemik / Inhalasi: IV Kalsium Glukonat 10% 30 mL over 10 min + nebulized Calcium Gluconate 2.5%.',
      adultMaintenance: 'Teruskan rawatan topikal/suntikan sehingga kesakitan pedih pesakit hilang sepenuhnya (pain relief is the primary endpoint).',
      pediatricInitial: 'Sapu gel topikal dan pantau kalsium darah dengan teliti.',
      dilutionAndRoute: 'Gel topikal disapu pada sarung tangan pembedahan untuk luka jari, atau suntikan subkutan.'
    },
    monitoringAndEndpoints: {
      parameters: ['Tahap kesakitan luka (skala VAS 0-10)', 'Ionized Calcium & Total Calcium serum', 'Serum Magnesium & Kalium', 'ECG 12-lead (selang QTc & aritmia)'],
      targetEndpoints: ['Hilang kesakitan sepenuhnya (Pain-free)', 'Ionized calcium normal (1.15 - 1.35 mmol/L)', 'Ketiadaan pemanjangan QTc'],
      frequency: 'Semak kalsium darah setiap 2 jam untuk pendedahan melebihi 1% BSA'
    },
    criticalWarningsAndCautions: [
      'AMARAN HEPATIK & KARDIAK: Pendedahan kulit kepada HF berkepekatan tinggi melebihi 1-2% kawasan permukaan badan (BSA) boleh menyebabkan KEMATIAN MENGEJUT AKIBAT HIPOkALSEMIA DAN HIPERkALEMIA REFRAKTORI dalam masa beberapa jam.',
      'DILARANG menggunakan Calcium Chloride untuk suntikan subkutan kerana sifatnya yang menghakis dan merosakkan tisu.'
    ],
    storageCondition: 'Simpan di bawah 25°C.',
    prnConsultationAdvised: true,
    fukkmPrescriberCategory: 'B',
    mohReferenceGuide: 'Chemical Hazard & Hydrofluoric Acid Emergency Protocol KKM'
  },
  {
    id: 'antidote-heavy-metals',
    toxicAgent: 'Heavy Metals (Lead, Arsenic, Mercury)',
    toxicAgentCategory: 'Heavy Metals & Chelators',
    commonExposureExamples: ['Plumbum / Lead (Bateri, Cat Lama, Air Tercemar)', 'Arsenik (Racun Kulat / Herbisid)', 'Merkuri (Termometer Pecah, Kosmetik Terlarang)'],
    primaryAntidote: 'Dimercaprol (BAL in Oil) + Succimer (DMSA) + CaNa2-EDTA',
    brandNames: ['BAL Injection in Peanut Oil', 'Chemet (DMSA)', 'Calcium Disodium Versenate'],
    stockTier: 'List B',
    urgencyLevel: 'URGENT (<2 hours)',
    stockLocations: ['Farmasi Pusat 24 Jam Hospital Utama', 'Depot Toksikologi Negeri (List C Hub)'],
    mechanismOfReversal: 'Agen pengkelat ditiol yang mengikat ion logam berat dengan afiniti tinggi melalui kumpulan sulfhidril (-SH), membentuk kompleks khelat cincin heterosiklik yang stabil dan larut air untuk dikumuhkan dengan selamat melalui air kencing dan hempedu.',
    clinicalTriggersAndIndications: [
      'Ensefalopati plumbum akut (Lead Encephalopathy) dengan paras plumbum darah > 70-100 mcg/dL',
      'Keracunan arsenik atau merkuri inorganik akut dengan gastroenteritis hemoragik teruk dan kegagalan multiorgan'
    ],
    dosingProtocol: {
      adultInitial: 'Ensefalopati Plumbum Teruk: Dimercaprol (BAL) 4.0 mg/kg (75 mg/m2) disuntik secara Intramuskular (IM) dalam setiap 4 jam. Selepas 4 jam, mulakan infusi CaNa2-EDTA 1,000 - 1,500 mg/m2/hari secara IV berterusan. Teruskan terapi gabungan selama 5 hari.',
      adultMaintenance: 'Keracunan Sederhana Tanpa Ensefalopati: Succimer (DMSA) Oral 10 mg/kg (atau 350 mg/m2) setiap 8 jam selama 5 hari, kemudian setiap 12 jam selama 14 hari.',
      pediatricInitial: 'Ensefalopati Pediatrik: BAL 75 mg/m2 IM q4h + CaNa2-EDTA 1,000 mg/m2/hari IV.',
      dilutionAndRoute: 'BAL HANYA disuntik secara INTRAMUSKULAR (IM) dalam (larutan minyak kacang). CaNa2-EDTA dilarutkan dalam D5W atau 0.9% NS untuk infusi IV.'
    },
    monitoringAndEndpoints: {
      parameters: ['Paras Plumbum / Arsenik / Merkuri Darah dan Urin 24 jam', 'Fungsi Renal (Urea & Kreatinin)', 'Fungsi Hepar'],
      targetEndpoints: ['Paras plumbum darah < 45 mcg/dL', 'Resolusi ensefalopati dan gejala neurologi'],
      frequency: 'Semak paras logam darah setiap minggu semasa terapi'
    },
    criticalWarningsAndCautions: [
      'AMARAN KACANG TANAH: BAL dilarutkan dalam minyak kacang tanah (peanut oil). KONTRAINDIKASI MUTLAK pada pesakit dengan alahan kacang tanah.',
      'Pada ensefalopati plumbum, sentiasa berikan BAL DAHULU sekurang-kurangnya 4 jam SEBELUM CaNa2-EDTA bagi mengelakkan EDTA menarik plumbum masuk semula ke dalam otak.'
    ],
    storageCondition: 'Simpan di bawah 25°C. Lindungi daripada beku.',
    prnConsultationAdvised: true,
    fukkmPrescriberCategory: 'A*',
    mohReferenceGuide: 'National Heavy Metal Poisoning Guidelines & Occupational Health KKM'
  },
  {
    id: 'antidote-mushrooms',
    toxicAgent: 'Toxic Mushrooms (Amatoxin / Amanita phalloides)',
    toxicAgentCategory: 'Plant & Mushroom Toxins',
    commonExposureExamples: ['Death Cap Mushroom (Amanita phalloides)', 'Amanita verna / virosa', 'Cendawan Hutan Beracun'],
    primaryAntidote: 'Silibinin (Legalon SIL) + N-Acetylcysteine (NAC)',
    brandNames: ['Legalon SIL (Silibinin Dihemisuccinate)', 'Parvolex (NAC)'],
    secondaryOrAdjunctAntidotes: ['High-Dose Penicillin G IV (alternatif jika Silibinin tiada)', 'Karbon Aktif Berulang (MDAC)'],
    stockTier: 'List C',
    urgencyLevel: 'REGIONAL DEPOT (<4-6 hours)',
    stockLocations: ['Depot Stok Antidot Negeri (HKL, HPP, HUS, HQE)', 'Farmasi Pusat Hospital Tertier'],
    mechanismOfReversal: 'Silibinin (ekstrak tumpu daripada Milk Thistle - Silybum marianum) menyekat polipeptida pengangkut anion organik hepatik (OATP1B3), menghalang kemasukan dan penyerapan amatoxin ke dalam hepatosit serta merangsang sintesis RNA polimerase I.',
    clinicalTriggersAndIndications: [
      'Sejarah memakan cendawan liar dengan gastroenteritis tertangguh (> 6-12 jam selepas makan), diikuti kenaikan enzim hati (ALT/AST) dan koagulopati kegagalan hepar akut'
    ],
    dosingProtocol: {
      adultInitial: 'Silibinin (Legalon SIL): Dos loading 5.0 mg/kg IV dalam 100 mL Normal Saline diinfusi selama 1 jam, diikuti infusi berterusan 20 mg/kg/hari (0.83 mg/kg/jam) selama 3 hingga 6 hari. Diberikan serentak bersama protokol N-Acetylcysteine (NAC) dos penuh.',
      pediatricInitial: 'Silibinin: 20 mg/kg/hari IV infusi berterusan.',
      dilutionAndRoute: 'Legalon SIL dilarutkan dalam 0.9% Normal Saline atau D5W.'
    },
    monitoringAndEndpoints: {
      parameters: ['PT / INR bersiri', 'ALT, AST, Bilirubin & Laktat', 'Fungsi renal & gas darah'],
      targetEndpoints: ['Pencegahan kegagalan hepar fulminan (INR < 1.5, ALT stabil/menurun)', 'Pesakit pulih tanpa memerlukan pemindahan hepar'],
      frequency: 'Semak profil hepar dan koagulasi setiap 6-12 jam'
    },
    criticalWarningsAndCautions: [
      'Gastroenteritis tertangguh (> 6 jam selepas makan) adalah ciri khas cendawan amatoxin yang mematikan, berbeza dengan cendawan toksik ringan yang menyebabkan muntah serta-merta (< 2 jam).',
      'Hubungi Pusat Rujukan Transplan Hati Kebangsaan (Hospital Selayang) lebih awal sekiranya INR > 3.0 atau ensefalopati hepar bermula.'
    ],
    storageCondition: 'Simpan di bawah 25°C. Lindungi daripada cahaya.',
    prnConsultationAdvised: true,
    fukkmPrescriberCategory: 'Special Access',
    mohReferenceGuide: 'National Liver Transplant & Toxicology Management Guidelines KKM'
  }
]

export const TOXIDROME_CATEGORIES = [
  'All',
  'Anticoagulants & Hematology',
  'Analgesics & Antipyretics',
  'Sedatives, Opioids & CNS',
  'Cardiovascular & Inotropes',
  'Pesticides & Agrochemicals',
  'Toxic Alcohols & Solvents',
  'Cellular Toxins & Gases',
  'Oncology & Antimicrobials',
  'Local Anaesthetics & Lipophilic',
  'Heavy Metals & Chelators',
  'Venomous Bites & Envenomation',
  'Endocrine & Metabolic',
  'Plant & Mushroom Toxins'
] as const
