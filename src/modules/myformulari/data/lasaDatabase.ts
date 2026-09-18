import { LASAPair } from '../types/formulariTypes'

export interface KkmLasaEntry {
  id: string
  category: 
    | 'Kardiovaskular & Inotrop'
    | 'Antimikrob & Sefalosporin'
    | 'Onkologi & Sitotoksik'
    | 'CNS, Analgesik & Psikotropik'
    | 'Endokrin, Diabetes & Steroid'
    | 'Antikoagulan & Darah'
    | 'Respiratori, Anestesia & Kecemasan'
    | 'Elektrolit, Oftalmik & Pembungkusan'
  drugThis: string
  tallManThis: string
  drugOther: string
  tallManOther: string
  confusionType: 'look-alike' | 'sound-alike' | 'both' | 'packaging'
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE'
  clinicalRiskWarning: string
  separationStrategy: string
  packagingNotes?: string
  fukkmGenericKeywords?: string[]
  keywordsThis?: string[]
  keywordsOther?: string[]
  isHAM?: boolean
  prescriberCategory?: string
}

export const KKM_LASA_MASTER_REGISTRY: KkmLasaEntry[] = [
  // =========================================================================
  // DOMAIN 1: KARDIOVASKULAR & INOTROP
  // =========================================================================
  {
    id: 'LASA-KKM-001',
    category: 'Kardiovaskular & Inotrop',
    drugThis: 'Dobutamine Hydrochloride Injection',
    tallManThis: 'DOBUTamine',
    drugOther: 'Dopamine Hydrochloride Injection',
    tallManOther: 'DOPAmine',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Dobutamine ialah inotrop (beta-1 agonis) dengan sedikit kesan vasodilatasi, manakala Dopamine mempunyai tindakan vasopresor (alfa-agonis) bergantung dos. Kesilapan pemberian boleh menyebabkan kejutan kardiogenik teruk atau hipertensi krisis yang mengancam nyawa.',
    separationStrategy: 'Asingkan petak simpanan di troli kecemasan CCU/ICU. Wajib guna label amaran jingga/merah TALL-MAN dan semakan bebas dua orang (independent double check).',
    packagingNotes: 'Kedua-duanya dibekalkan dalam ampul kaca jernih 20mL atau 5mL oleh pengilang APPL dengan reka bentuk label hampir serupa.',
    fukkmGenericKeywords: ['dobutamine'],
    keywordsThis: ['dobutamine'],
    keywordsOther: ['dopamine'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-002',
    category: 'Kardiovaskular & Inotrop',
    drugThis: 'Dopamine Hydrochloride Injection',
    tallManThis: 'DOPAmine',
    drugOther: 'Dobutamine Hydrochloride Injection',
    tallManOther: 'DOBUTamine',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Tersalah berikan Dopamine kepada pesakit kegagalan jantung tak terkompensasi boleh menyebabkan vasokonstriksi periferi melampau dan peningkatan beban kerja jantung (afterload).',
    separationStrategy: 'Simpan di zon berasingan dengan penandaan TALL-MAN pada dulang infusi inotrop wad kritikal.',
    fukkmGenericKeywords: ['dopamine'],
    keywordsThis: ['dopamine'],
    keywordsOther: ['dobutamine'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-003',
    category: 'Kardiovaskular & Inotrop',
    drugThis: 'Amlodipine Besylate Tablet',
    tallManThis: 'amLODIPine',
    drugOther: 'Amiloride Hydrochloride Tablet',
    tallManOther: 'aMILORide',
    confusionType: 'sound-alike',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Amlodipine adalah perencat saluran kalsium (CCB) untuk hipertensi, manakala Amiloride ialah diuretik hemat kalium. Tersalah beri boleh mengakibatkan hiperkalemia teruk yang mengancam nyawa atau kegagalan kawalan tekanan darah.',
    separationStrategy: 'Asingkan petak simpanan di rak farmasi pesakit luar dan wad perubatan; gunakan label pelekat kuning LASA.',
    fukkmGenericKeywords: ['amlodipine'],
    keywordsThis: ['amlodipine'],
    keywordsOther: ['amiloride'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-004',
    category: 'Kardiovaskular & Inotrop',
    drugThis: 'Amlodipine Besylate Tablet',
    tallManThis: 'amLODIPine',
    drugOther: 'Atenolol Tablet',
    tallManOther: 'aTENOloL',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Atenolol ialah penyekat beta kardioselektif. Kekeliruan nama awalan "A-" boleh menyebabkan bradikardia teruk, bronkospasme pada pesakit asma, atau lonjakan tekanan darah mendadak jika ubat ditinggalkan.',
    separationStrategy: 'Susun atur rak mengikut susunan bukan abjad terus bersebelahan (pisahkan dengan ubat lain di antaranya).',
    fukkmGenericKeywords: ['amlodipine', 'atenolol'],
    keywordsThis: ['amlodipine'],
    keywordsOther: ['atenolol'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-005',
    category: 'Kardiovaskular & Inotrop',
    drugThis: 'Nicardipine Hydrochloride Injection',
    tallManThis: 'niCARdipine',
    drugOther: 'Nifedipine Capsule / Tablet',
    tallManOther: 'NIFEdipine',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Nicardipine IV digunakan untuk kecemasan hipertensi (hipertensive crisis) dan strok akut dengan titrasi ketat. Tertukar dos atau formulasi dengan Nifedipine oral/sublingual boleh menyebabkan kejatuhan tekanan darah mendadak (hipotensi melampau) dan iskemia serebral.',
    separationStrategy: 'Nicardipine IV disimpan dalam peti sejuk berkunci / troli resusitasi ICU; labelkan TALL-MAN niCARdipine.',
    fukkmGenericKeywords: ['nicardipine', 'nifedipine'],
    keywordsThis: ['nicardipine'],
    keywordsOther: ['nifedipine'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-006',
    category: 'Kardiovaskular & Inotrop',
    drugThis: 'Nimodipine Tablet / Infusion',
    tallManThis: 'niMODipine',
    drugOther: 'Nicardipine Hydrochloride',
    tallManOther: 'niCARdipine',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Nimodipine dikhaskan untuk pencegahan vasospasme serebral selepas pendarahan subaraknoid (SAH). Tersalah dos atau ubat menyebabkan kegagalan perfusi otak dan kemerosotan neurologi kekal.',
    separationStrategy: 'Wajibkan verifikasi preskripsi pakar neurosurgeri/neurologi dan penandaan rak khusus neuro-ICU.',
    fukkmGenericKeywords: ['nimodipine'],
    keywordsThis: ['nimodipine'],
    keywordsOther: ['nicardipine'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-007',
    category: 'Kardiovaskular & Inotrop',
    drugThis: 'Hydralazine Hydrochloride Injection / Tablet',
    tallManThis: 'hydrALAZINE',
    drugOther: 'Hydroxyzine Hydrochloride Tablet / Syrup',
    tallManOther: 'hydrOXYzine',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Hydralazine ialah vasodilator kuat untuk krisis hipertensi (termasuk eklampsia mengandung), manakala Hydroxyzine ialah antihistamin penenang. Tersalah bagi Hydralazine kepada pesakit alahan boleh menyebabkan hipotensi runtuh dan takikardia refleks teruk.',
    separationStrategy: 'Jangan simpan Hydralazine di rak sedatif/antihistamin. Wajibkan paparan huruf TALL-MAN hydrALAZINE vs hydrOXYzine.',
    fukkmGenericKeywords: ['hydralazine', 'hydroxyzine'],
    keywordsThis: ['hydralazine'],
    keywordsOther: ['hydroxyzine'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-008',
    category: 'Kardiovaskular & Inotrop',
    drugThis: 'Clonidine Hydrochloride Tablet / Injection',
    tallManThis: 'cloniDINE',
    drugOther: 'Clonazepam Tablet',
    tallManOther: 'clonazePAM',
    confusionType: 'sound-alike',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Clonidine ialah agonis alfa-2 pusat untuk hipertensi dan ADHD, manakala Clonazepam ialah benzodiazepin antikonvulsan. Kekeliruan boleh mengakibatkan sedasi koma atau krisis hipertensi akibat penghentian mengejut.',
    separationStrategy: 'Clonazepam disimpan dalam almari dadah psikotropik berpalang/berkunci, manakala Clonidine di rak hipertensi.',
    fukkmGenericKeywords: ['clonidine'],
    keywordsThis: ['clonidine'],
    keywordsOther: ['clonazepam'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-009',
    category: 'Kardiovaskular & Inotrop',
    drugThis: 'Labetalol Hydrochloride Injection / Tablet',
    tallManThis: 'labetaLOL',
    drugOther: 'Lamotrigine Tablet',
    tallManOther: 'lamoTRIGine',
    confusionType: 'sound-alike',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Labetalol ialah penyekat alfa/beta untuk hipertensi ibu hamil dan strok, manakala Lamotrigine ialah ubat epilepsi/mood stabilizer. Tersalah dos boleh menyebabkan sawan berulang atau bradikardia fetal.',
    separationStrategy: 'Gunakan penandaan kod warna berbeza pada label rak wad bersalin dan wad psikiatri.',
    fukkmGenericKeywords: ['labetalol'],
    keywordsThis: ['labetalol'],
    keywordsOther: ['lamotrigine'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-010',
    category: 'Kardiovaskular & Inotrop',
    drugThis: 'Isosorbide Mononitrate Tablet (ISMN)',
    tallManThis: 'isosorbide MONOnitrate',
    drugOther: 'Isosorbide Dinitrate Tablet (ISDN)',
    tallManOther: 'isosorbide DInitrate',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'ISDN memerlukan dos 2-3 kali sehari kerana bioavailabiliti rendah, manakala ISMN diberikan 1 kali sehari (pelepasan perlahan). Kekeliruan frekuensi dos menyebabkan hipotensi sinkope dan toleransi nitrat.',
    separationStrategy: 'Tegaskan perkataan MONOnitrate dan DInitrate dengan fon tebal berwarna kuning di kaunter pendispensan farmasi.',
    fukkmGenericKeywords: ['isosorbide mononitrate', 'isosorbide dinitrate'],
    keywordsThis: ['isosorbide mononitrate'],
    keywordsOther: ['isosorbide dinitrate'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-011',
    category: 'Kardiovaskular & Inotrop',
    drugThis: 'Prazosin Hydrochloride Tablet',
    tallManThis: 'PRAZosin',
    drugOther: 'Trazodone Hydrochloride Tablet',
    tallManOther: 'traZODone',
    confusionType: 'sound-alike',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Prazosin ialah penyekat alfa-1 vaskular (risiko first-dose hypotension), manakala Trazodone ialah antidepresan sedatif.',
    separationStrategy: 'Pemisahan fizikal rak kardiovaskular dan rak psikotropik.',
    fukkmGenericKeywords: ['prazosin'],
    keywordsThis: ['prazosin'],
    keywordsOther: ['trazodone'],
    isHAM: false,
    prescriberCategory: 'B'
  },

  // =========================================================================
  // DOMAIN 2: ANTIMIKROB & SEFALOSPORIN
  // =========================================================================
  {
    id: 'LASA-KKM-012',
    category: 'Antimikrob & Sefalosporin',
    drugThis: 'Cefazolin Sodium 1g Injection',
    tallManThis: 'cefAZOLin',
    drugOther: 'Cefotaxime Sodium 1g Injection',
    tallManOther: 'cefOTAXime',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Cefazolin (Gen 1) adalah profilaksis surgeri standard (liputan Gram positif Staphylococcus), manakala Cefotaxime (Gen 3) untuk jangkitan bakteria Gram negatif dan meningitis. Tersalah ubat mengakibatkan kegagalan profilaksis pembedahan atau kegagalan terapi sepsis.',
    separationStrategy: 'Asingkan petak kotak vial di bilik bedah (OT) dan stor farmasi. Labelkan penutup rak dengan warna kod Gen 1 vs Gen 3.',
    packagingNotes: 'Vial serbuk putih 1g dalam botol kaca bersaiz sama oleh Pharmaniaga / Duopharma.',
    fukkmGenericKeywords: ['cefazolin'],
    keywordsThis: ['cefazolin'],
    keywordsOther: ['cefotaxime'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-013',
    category: 'Antimikrob & Sefalosporin',
    drugThis: 'Cefotaxime Sodium 1g Injection',
    tallManThis: 'cefOTAXime',
    drugOther: 'Ceftriaxone Sodium 1g Injection',
    tallManOther: 'cefTRIAXone',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Cefotaxime selamat untuk neonat dengan hiperbilirubinemia (dos q6-8h), manakala Ceftriaxone KONTRAINDIKASI pada neonat kerana mendakan kalsium-ceftriaxone dan kernikterus fatal.',
    separationStrategy: 'Di Wad Pediatrik & NICU, Ceftriaxone dilarang sama sekali disimpan dalam stok lantai tanpa verifikasi pakar pediatrik.',
    packagingNotes: 'Kedua-dua ubat merupakan serbuk suntikan 1g yang dibungkus dalam vial kaca bersaiz sama.',
    fukkmGenericKeywords: ['cefotaxime', 'ceftriaxone'],
    keywordsThis: ['cefotaxime'],
    keywordsOther: ['ceftriaxone'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-014',
    category: 'Antimikrob & Sefalosporin',
    drugThis: 'Ceftazidime 1g Injection',
    tallManThis: 'cefTAZIDime',
    drugOther: 'Ceftriaxone Sodium 1g Injection',
    tallManOther: 'cefTRIAXone',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Ceftazidime mempunyai liputan antipseudomonal kuat (Pseudomonas aeruginosa), manakala Ceftriaxone TIADA liputan Pseudomonas. Tersalah bagi Ceftriaxone kepada pesakit jangkitan Pseudomonas boleh menyebabkan kematian akibat septisemia tidak dirawat.',
    separationStrategy: 'Gunakan pelekat amaran "ANTIPSEUDOMONAL" pada Ceftazidime dan asingkan susunan rak.',
    fukkmGenericKeywords: ['ceftazidime'],
    keywordsThis: ['ceftazidime'],
    keywordsOther: ['ceftriaxone'],
    isHAM: false,
    prescriberCategory: 'A'
  },
  {
    id: 'LASA-KKM-015',
    category: 'Antimikrob & Sefalosporin',
    drugThis: 'Cefuroxime Sodium 750mg / 1.5g Injection',
    tallManThis: 'cefUROXime',
    drugOther: 'Cefotaxime / Cefazolin',
    tallManOther: 'cefOTAXime / cefAZOLin',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Cefuroxime ialah sefalosporin generasi ke-2 dengan spektrum sederhana untuk CAP dan jangkitan ortopedik. Kekeliruan dos dan generasi menjejaskan hasil rawatan antimikrob.',
    separationStrategy: 'Wajibkan penulisan nama penuh dan kekuatan dos dalam sistem e-Prescribing.',
    fukkmGenericKeywords: ['cefuroxime'],
    keywordsThis: ['cefuroxime'],
    keywordsOther: ['cefotaxime'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-016',
    category: 'Antimikrob & Sefalosporin',
    drugThis: 'Cefepime Hydrochloride 1g / 2g Injection',
    tallManThis: 'cefEPIME',
    drugOther: 'Ceftazidime / Ceftriaxone',
    tallManOther: 'cefTAZIDime / cefTRIAXone',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Cefepime ialah sefalosporin generasi ke-4 (spektrum luas reserved). Berisiko neurotoksisiti pada pesakit buah pinggang jika tersalah dos.',
    separationStrategy: 'Simpan di rak ubat antimikrob terhad (NAG Restricted Tier) dengan kebenaran pakar ID/Mikrobiologi.',
    fukkmGenericKeywords: ['cefepime'],
    keywordsThis: ['cefepime'],
    keywordsOther: ['ceftazidime'],
    isHAM: false,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-017',
    category: 'Antimikrob & Sefalosporin',
    drugThis: 'Ampicillin Sodium 500mg Injection',
    tallManThis: 'AMPICILLIN',
    drugOther: 'Ampiclox (Ampicillin 250mg + Cloxacillin 250mg)',
    tallManOther: 'AMPICLOX',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Ampicillin tulen tidak melindungi kuman staphylococcus penghasil penisilinase, manakala Ampiclox mengandungi cloxacillin. Tersalah dispense boleh menyebabkan kegagalan rawatan abses stafilokokus.',
    separationStrategy: 'Asingkan ampul Ampiclox neonatal dan dewasa daripada Ampicillin tulen.',
    fukkmGenericKeywords: ['ampicillin', 'ampiclox'],
    keywordsThis: ['ampicillin'],
    keywordsOther: ['ampiclox'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-018',
    category: 'Antimikrob & Sefalosporin',
    drugThis: 'Azithromycin Tablet / Suspension / IV',
    tallManThis: 'aZIThromycin',
    drugOther: 'Azathioprine Tablet',
    tallManOther: 'aZAThioprine',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Azithromycin ialah antibiotik makrolida (biasanya kursus 3-5 hari), manakala Azathioprine ialah imunosupresan sitotoksik. Memberikan Azathioprine sebagai antibiotik boleh menyebabkan penindasan sumsum tulang (myelosuppression), pansitopenia maut, dan jangkitan oportunistik teruk.',
    separationStrategy: 'Azathioprine wajib disimpan dalam almari ubat sitotoksik bertanda ungu berbahaya. Dilarang letak bersama antibiotik.',
    fukkmGenericKeywords: ['azithromycin', 'azathioprine'],
    keywordsThis: ['azithromycin'],
    keywordsOther: ['azathioprine'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-019',
    category: 'Antimikrob & Sefalosporin',
    drugThis: 'Ciprofloxacin Tablet / Infusion',
    tallManThis: 'ciproFLOXacin',
    drugOther: 'Levofloxacin / Moxifloxacin',
    tallManOther: 'levoFLOXacin / moxiFLOXacin',
    confusionType: 'sound-alike',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Ciprofloxacin tidak berkesan untuk jangkitan Streptococcus pneumoniae pernafasan komuniti (CAP), manakala Levofloxacin/Moxifloxacin adalah fluoroquinolone respiratori. Tersalah pilih antibiotik menyebabkan kegagalan rawatan radang paru-paru teruk.',
    separationStrategy: 'Labelkan "RESPIRATORY QUINOLONE" pada Levofloxacin dan asingkan botol infusi 100mL.',
    fukkmGenericKeywords: ['ciprofloxacin', 'levofloxacin', 'moxifloxacin'],
    keywordsThis: ['ciprofloxacin'],
    keywordsOther: ['levofloxacin','moxifloxacin'],
    isHAM: false,
    prescriberCategory: 'A/KK'
  },
  {
    id: 'LASA-KKM-020',
    category: 'Antimikrob & Sefalosporin',
    drugThis: 'Metronidazole Tablet / IV Infusion 500mg/100mL',
    tallManThis: 'metroNIDAZOLE',
    drugOther: 'Metformin Hydrochloride 500mg Tablet',
    tallManOther: 'metFORMIN',
    confusionType: 'sound-alike',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Metronidazole ialah antimikrob anaerob/antiprotozoa, manakala Metformin ialah antidiabetik biguanide. Pesakit diabetes yang tersalah henti Metformin akan mengalami hiperglisemia teruk, manakala pesakit bukan diabetes yang tersalah ambil Metformin berisiko asidosis laktik maut.',
    separationStrategy: 'Pemisahan rak ketat antara ubat diabetes NCD dan ubat antimikrob / infusi wad.',
    fukkmGenericKeywords: ['metronidazole', 'metformin'],
    keywordsThis: ['metronidazole'],
    keywordsOther: ['metformin'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-021',
    category: 'Antimikrob & Sefalosporin',
    drugThis: 'Sulfadiazine 500mg Tablet',
    tallManThis: 'sulfaDIAZINE',
    drugOther: 'Sulfasalazine 500mg Tablet',
    tallManOther: 'sulfaSALAZINE',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Sulfadiazine digunakan untuk toksoplasmosis serebral (pada pesakit HIV/imunokompromi), manakala Sulfasalazine untuk penyakit radang usus (IBD) dan artritis reumatoid. Tersalah beri mengakibatkan jangkitan otak parasit tidak terkawal.',
    separationStrategy: 'Gunakan label TALL-MAN dan pastikan indikasi disahkan semasa saringan preskripsi.',
    fukkmGenericKeywords: ['sulfadiazine', 'sulfasalazine'],
    keywordsThis: ['sulfadiazine'],
    keywordsOther: ['sulfasalazine'],
    isHAM: false,
    prescriberCategory: 'A'
  },
  {
    id: 'LASA-KKM-022',
    category: 'Antimikrob & Sefalosporin',
    drugThis: 'Fluconazole Capsule / IV Infusion',
    tallManThis: 'fluCONAZOLE',
    drugOther: 'Itraconazole / Voriconazole',
    tallManOther: 'itraCONAZOLE / vORIconazole',
    confusionType: 'sound-alike',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Fluconazole tiada aktiviti melawan kulat Aspergillus atau Mucor, manakala Voriconazole adalah ubat pilihan utama untuk Aspergillosis invasif. Kekeliruan boleh mengakibatkan kematian pesakit neutropenik.',
    separationStrategy: 'Voriconazole dikategorikan di bawah Kelulusan Pakar ID (A*) dengan label TALL-MAN khas.',
    fukkmGenericKeywords: ['fluconazole', 'itraconazole', 'voriconazole'],
    keywordsThis: ['fluconazole'],
    keywordsOther: ['itraconazole','voriconazole'],
    isHAM: false,
    prescriberCategory: 'A'
  },

  // =========================================================================
  // DOMAIN 3: ONKOLOGI & SITOTOKSIK (HIGH ALERT CHEMOTHERAPY)
  // =========================================================================
  {
    id: 'LASA-KKM-023',
    category: 'Onkologi & Sitotoksik',
    drugThis: 'Carboplatin Injection',
    tallManThis: 'CARBOplatin',
    drugOther: 'Cisplatin Injection',
    tallManOther: 'CISplatin',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Dos Carboplatin dihitung berdasarkan Calvert AUC (contoh: 400-600mg), manakala dos Cisplatin adalah jauh lebih rendah (contoh: 50-100mg/m²). Memberikan dos Carboplatin sebagai Cisplatin adalah DOS MAUT yang menyebabkan nekrosis tubular renal akut kekal, pekak kekal (ototoksisiti melampau), dan kematian akibat kegagalan multiorgan.',
    separationStrategy: 'Penyediaan di Unit Rekonsitusi Sitotoksik (CDRC) sahaja. Semakan dos wajib 3 lapis (Oncologist, Onco Pharmacist, Oncology Nurse) bersama label amaran merah darah TALL-MAN.',
    fukkmGenericKeywords: ['carboplatin', 'cisplatin'],
    keywordsThis: ['carboplatin'],
    keywordsOther: ['cisplatin'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-024',
    category: 'Onkologi & Sitotoksik',
    drugThis: 'Vincristine Sulphate Injection',
    tallManThis: 'vinCRIStine',
    drugOther: 'Vinblastine Sulphate Injection',
    tallManOther: 'vinBLAStine',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Vincristine mempunyai dos maksimum ketat 2mg sekali beri (akibat neurotoksisiti periferi teruk). Vinblastine diberi pada dos lebih tinggi (cth: 6mg/m²). Tersalah memberikan dos Vinblastine sebagai Vincristine menyebabkan neuropati motorik melampau, ileus paralitik maut, dan kegagalan pernafasan.',
    separationStrategy: 'Wajib disediakan dalam beg infusi mini 50mL (BUKAN picagari) untuk menghalang suntikan intratekal tidak sengaja. Labelkan "UNTUK IV SAHAJA - MAUT JIKA DIBERI INTRATEKAL".',
    fukkmGenericKeywords: ['vincristine', 'vinblastine'],
    keywordsThis: ['vincristine'],
    keywordsOther: ['vinblastine'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-025',
    category: 'Onkologi & Sitotoksik',
    drugThis: 'Doxorubicin Hydrochloride Injection',
    tallManThis: 'DOXOrubicin',
    drugOther: 'Daunorubicin / Epirubicin / Idarubicin',
    tallManOther: 'DAUNOrubicin / ePIRubicin / IDArubicin',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Kumpulan antrasiklin ini semuanya mempunyai larutan merah terang serupa dan risiko kardiotoksisiti kumulatif seumur hidup (irreversible cardiomyopathy). Dos dan protokol setiap analog adalah berbeza sama sekali.',
    separationStrategy: 'Simpan di dalam peti sejuk CDRC dengan pembahagi berlabel TALL-MAN merah menyala. Wajib rekod dos kumulatif seumur hidup dalam buku rawatan pesakit.',
    packagingNotes: 'Semua vial mengandungi larutan cecair / serbuk merah terang.',
    fukkmGenericKeywords: ['doxorubicin', 'daunorubicin', 'epirubicin', 'idarubicin'],
    keywordsThis: ['doxorubicin'],
    keywordsOther: ['daunorubicin','epirubicin','idarubicin'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-026',
    category: 'Onkologi & Sitotoksik',
    drugThis: 'Paclitaxel Concentrate for Infusion',
    tallManThis: 'PAClitaxel',
    drugOther: 'Docetaxel Concentrate for Infusion',
    tallManOther: 'DOCEtaxel',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Paclitaxel memerlukan tiub infusi bebas-PVC dengan penapis 0.22 mikron dan premedikasi steroid/antihistamin intensif untuk mencegah anafilaksis pembawa Cremophor. Docetaxel mempunyai pelarut berbeza dan risiko edema periferi/kebocoran kapilari jika salah protokol.',
    separationStrategy: 'Semakan protokol rejimen kemoterapi khusus (cth: AC-T vs TCH) sebelum pengeluaran stok CDRC.',
    fukkmGenericKeywords: ['paclitaxel', 'docetaxel'],
    keywordsThis: ['paclitaxel'],
    keywordsOther: ['docetaxel'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-027',
    category: 'Onkologi & Sitotoksik',
    drugThis: 'Cyclophosphamide Injection / Tablet',
    tallManThis: 'cycloPHOSPHamide',
    drugOther: 'Cyclosporine Capsule / Oral Solution / IV',
    tallManOther: 'cycloSPORINE',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Cyclophosphamide ialah agen pengalkilan antineoplastik sitotoksik (risiko sistitis hemoragik dan myelosupresi), manakala Cyclosporine ialah perencat kalsineurin imunosupresan pemindahan organ. Tersalah ubat menyebabkan penolakan organ transplan atau toksisiti sitotoksik akut.',
    separationStrategy: 'Cyclosporine disimpan di stor farmasi transplan; Cyclophosphamide di bilik sitotoksik CDRC.',
    fukkmGenericKeywords: ['cyclophosphamide', 'cyclosporine', 'cyclosporin'],
    keywordsThis: ['cyclophosphamide'],
    keywordsOther: ['cyclosporine','cyclosporin'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-028',
    category: 'Onkologi & Sitotoksik',
    drugThis: 'Folic Acid 5mg Tablet',
    tallManThis: 'FOLIC acid',
    drugOther: 'Folinic Acid (Calcium Leucovorin / Calcium Folinate 15mg)',
    tallManOther: 'foliNIC acid (Leucovorin)',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Folinic Acid (Leucovorin) diperlukan sebagai ubat penyelamat (rescue therapy) selepas dos tinggi Methotrexate untuk mengelakkan kematian sel sihat. Folic acid TIDAK DAPAT menyelamatkan pesakit daripada keracunan Methotrexate dos tinggi dan boleh mengakibatkan maut.',
    separationStrategy: 'Klinik onkologi dan farmasi wad wajib menandakan Leucovorin dengan label kuning "ONCOLOGY RESCUE AGENT".',
    fukkmGenericKeywords: ['folic acid', 'folinate', 'leucovorin'],
    keywordsThis: ['folic acid'],
    keywordsOther: ['folinate','leucovorin'],
    isHAM: true,
    prescriberCategory: 'A*'
  },

  // =========================================================================
  // DOMAIN 4: CNS, ANALGESIK, SEDATIF & PSIKOTROPIK
  // =========================================================================
  {
    id: 'LASA-KKM-029',
    category: 'CNS, Analgesik & Psikotropik',
    drugThis: 'Morphine Sulphate Injection 10mg/mL',
    tallManThis: 'MORphine',
    drugOther: 'Hydromorphone Hydrochloride Injection 2mg/mL',
    tallManOther: 'HYDROmorphone',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Hydromorphone adalah 5 hingga 7 KALI LEBIH KUAT daripada Morphine (1mg Hydromorphone ≈ 7mg Morphine). Memberikan Hydromorphone pada dos Morphine mengakibatkan terlebih dos opioid maut (koma, apnea, henti pernafasan, dan maut serta-merta).',
    separationStrategy: 'Hydromorphone disimpan dalam almari Dadah Berbahaya (DD Safe) berasingan dengan amaran berkembar merah. Sediakan penawar Naloxone sentiasa dalam troli kecemasan.',
    packagingNotes: 'Kedua-dua ampul kaca 1mL dadah berbahaya (Dangerous Drugs) mempunyai saiz fizikal hampir serupa.',
    fukkmGenericKeywords: ['morphine', 'hydromorphone'],
    keywordsThis: ['morphine'],
    keywordsOther: ['hydromorphone'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-030',
    category: 'CNS, Analgesik & Psikotropik',
    drugThis: 'Tramadol Hydrochloride 50mg Capsule / Injection',
    tallManThis: 'traMADol',
    drugOther: 'Toradol (Ketorolac Tromethamine 30mg Injection)',
    tallManOther: 'toraDOL (Ketorolac)',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Ketorolac ialah NSAID suntikan kuat (risiko ulser peptik berdarah dan kegagalan buah pinggang akut), manakala Tramadol ialah analgesik opioid lemah. Kekeliruan nama jenama Toradol dengan generik Tramadol sering berlaku.',
    separationStrategy: 'Gunakan nama generik rasmi KKM (Ketorolac & Tramadol) dan elakkan penggunaan singkatan atau nama jenama pada carta ubat.',
    fukkmGenericKeywords: ['tramadol', 'ketorolac'],
    keywordsThis: ['tramadol'],
    keywordsOther: ['ketorolac'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-031',
    category: 'CNS, Analgesik & Psikotropik',
    drugThis: 'Diazepam 10mg/2mL Injection / 5mg Tablet',
    tallManThis: 'diazePAM',
    drugOther: 'Lorazepam 1mg / 2mg Tablet / Injection',
    tallManOther: 'LORazepam',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Lorazepam mempunyai potensi miligram-ke-miligram jauh lebih tinggi (1mg Lorazepam ≈ 5mg Diazepam) dengan kesan sedasi lebih berpanjangan. Kekeliruan dos menyebabkan kemurungan pernafasan mendalam.',
    separationStrategy: 'Disimpan dalam peti berkunci psikotropik dengan kad stok individu yang dipisahkan mengikut abjad.',
    fukkmGenericKeywords: ['diazepam', 'lorazepam'],
    keywordsThis: ['diazepam'],
    keywordsOther: ['lorazepam'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-032',
    category: 'CNS, Analgesik & Psikotropik',
    drugThis: 'Carbamazepine 200mg Tablet (Tegretol)',
    tallManThis: 'CARBamazepine',
    drugOther: 'Oxcarbazepine 300mg Tablet (Trileptal)',
    tallManOther: 'OXcarbazepine',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Nisbah dos penukaran Carbamazepine kepada Oxcarbazepine ialah 1:1.5 (cth: 200mg Carbamazepine ≈ 300mg Oxcarbazepine). Oxcarbazepine mempunyai risiko hiponatremia lebih tinggi. Tersalah dos mengakibatkan sawan berulang.',
    separationStrategy: 'Letakkan pelekat TALL-MAN pada petak ubat antiepileptik farmasi pesakit luar.',
    fukkmGenericKeywords: ['carbamazepine', 'oxcarbazepine'],
    keywordsThis: ['carbamazepine'],
    keywordsOther: ['oxcarbazepine'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-033',
    category: 'CNS, Analgesik & Psikotropik',
    drugThis: 'Chlorpromazine Hydrochloride Tablet / Injection',
    tallManThis: 'chlorproMAZINE',
    drugOther: 'Clomipramine Hydrochloride Tablet',
    tallManOther: 'clomiPRAMINE',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Chlorpromazine ialah antipsikotik tipikal fenotiazin (risiko EPS, sindrom malignan neuroleptik), manakala Clomipramine ialah antidepresan trisiklik (risiko sindrom serotonin, aritmia jantung).',
    separationStrategy: 'Asingkan laci simpanan psikiatri wad dan semak indikasi pesakit sebelum mendispens.',
    fukkmGenericKeywords: ['chlorpromazine', 'clomipramine'],
    keywordsThis: ['chlorpromazine'],
    keywordsOther: ['clomipramine'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-034',
    category: 'CNS, Analgesik & Psikotropik',
    drugThis: 'Fluoxetine 20mg Capsule',
    tallManThis: 'FLUoxetine',
    drugOther: 'Fluvoxamine 50mg / 100mg Tablet',
    tallManOther: 'fluvoxaMINE',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Kedua-duanya SSRI tetapi mempunyai profil interaksi enzim CYP450 dan waktu paruh hayat yang berbeza sama sekali (Fluoxetine half-life berminggu-minggu, Fluvoxamine perencat CYP1A2 kuat).',
    separationStrategy: 'Gunakan TALL-MAN FLUoxetine vs fluvoxaMINE pada label peti ubat.',
    fukkmGenericKeywords: ['fluoxetine', 'fluvoxamine'],
    keywordsThis: ['fluoxetine'],
    keywordsOther: ['fluvoxamine'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-035',
    category: 'CNS, Analgesik & Psikotropik',
    drugThis: 'Risperidone Tablet / Oral Solution',
    tallManThis: 'risperiDONE',
    drugOther: 'Ropinirole Tablet',
    tallManOther: 'roPINIRole',
    confusionType: 'sound-alike',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Risperidone ialah antipsikotik atipikal perencat dopamin (antagonis D2), manakala Ropinirole ialah agonis dopamin untuk penyakit Parkinson. Memberikan Risperidone kepada pesakit Parkinson akan mencetuskan krisis parkinsonian teruk dan ketidakupayaan bergerak serta-merta.',
    separationStrategy: 'Asingkan ubat neurologi Parkinson daripada ubat antipsikotik psikiatri.',
    fukkmGenericKeywords: ['risperidone', 'ropinirole'],
    keywordsThis: ['risperidone'],
    keywordsOther: ['ropinirole'],
    isHAM: false,
    prescriberCategory: 'A/KK'
  },
  {
    id: 'LASA-KKM-036',
    category: 'CNS, Analgesik & Psikotropik',
    drugThis: 'Sertraline 50mg Tablet',
    tallManThis: 'SERTRALine',
    drugOther: 'Cetirizine 10mg Tablet',
    tallManOther: 'cetaRIZine',
    confusionType: 'sound-alike',
    riskLevel: 'MODERATE',
    clinicalRiskWarning: 'Cetirizine ialah antihistamin biasa untuk rinitis/gatal, manakala Sertraline ialah antidepresan SSRI. Kekeliruan bunyi boleh menyebabkan pesakit alahan tidak sengaja mengambil ubat psikiatri berbulan-bulan.',
    separationStrategy: 'Semakan preskripsi di kaunter pendispensan farmasi pesakit luar.',
    fukkmGenericKeywords: ['sertraline', 'cetirizine'],
    keywordsThis: ['sertraline'],
    keywordsOther: ['cetirizine'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-037',
    category: 'CNS, Analgesik & Psikotropik',
    drugThis: 'Propranolol Hydrochloride Tablet',
    tallManThis: 'propranolol',
    drugOther: 'Propofol 1% 20mL / 50mL Emulsion for Injection',
    tallManOther: 'propofol',
    confusionType: 'sound-alike',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Propofol ialah anestetik am IV (induksi koma/bius). Tersalah faham arahan lisan (verbal order) boleh membawa kepada bencana fatal di dewan bedah / unit rawatan rapi.',
    separationStrategy: 'Dilarang mengambil arahan lisan untuk Propofol kecuali semasa resusitasi intubasi kecemasan disahkan oleh pakar anestesia.',
    packagingNotes: 'Propofol berbentuk emulsi putih seperti susu dalam ampul/vial kaca.',
    fukkmGenericKeywords: ['propranolol', 'propofol'],
    keywordsThis: ['propranolol'],
    keywordsOther: ['propofol'],
    isHAM: true,
    prescriberCategory: 'A*'
  },

  // =========================================================================
  // DOMAIN 5: ENDOKRIN, DIABETES & STEROID
  // =========================================================================
  {
    id: 'LASA-KKM-038',
    category: 'Endokrin, Diabetes & Steroid',
    drugThis: 'Actrapid HM (Human Soluble Short-Acting Insulin)',
    tallManThis: 'Actrapid (SHORT-acting)',
    drugOther: 'Insulatard HM (Human Isophane Intermediate-Acting Insulin)',
    tallManOther: 'Insulatard (INTERMEDIATE-acting)',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Actrapid ialah insulin bertindak pantas untuk dos sebelum makan atau infusi IV sliding scale. Insulatard ialah insulin basal keruh. Tersalah suntik Actrapid pada dos basal Insulatard (cth: 30 unit) mengakibatkan hipoglikemia melampau, kerosakan otak kekal, dan maut.',
    separationStrategy: 'Simpan di dalam peti sejuk farmasi/wad dalam bakul berkod warna berasingan (Kuning untuk Actrapid, Hijau untuk Insulatard). Wajib semakan dua jururawat sebelum suntikan.',
    packagingNotes: 'Botol vial 10mL 100 IU/mL atau Penfill Novo Nordisk dengan label jalur warna.',
    fukkmGenericKeywords: ['actrapid', 'insulatard', 'insulin'],
    keywordsThis: ['actrapid','insulin'],
    keywordsOther: ['insulatard'],
    isHAM: true,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-039',
    category: 'Endokrin, Diabetes & Steroid',
    drugThis: 'Mixtard 30 HM (30% Soluble + 70% Isophane Insulin)',
    tallManThis: 'Mixtard 30 (PREMIXED)',
    drugOther: 'Actrapid / Insulatard',
    tallManOther: 'Actrapid / Insulatard',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Mixtard 30 mengandungi campuran tetap insulin pantas dan perantara. Dilarang sama sekali diberi secara IV Infusion.',
    separationStrategy: 'Tegaskan penandaan "PREMIXED - SUBCUTANEOUS ONLY" pada peti sejuk wad.',
    fukkmGenericKeywords: ['mixtard'],
    keywordsThis: ['mixtard'],
    keywordsOther: ['actrapid'],
    isHAM: true,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-040',
    category: 'Endokrin, Diabetes & Steroid',
    drugThis: 'Humalog (Insulin Lispro Rapid-Acting)',
    tallManThis: 'Humalog (RAPID)',
    drugOther: 'Humalog Mix 25 / Humalog Mix 50',
    tallManOther: 'Humalog MIX (PREMIXED)',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Kekeliruan antara insulin analog tulen dan analog campuran (Mix) sering membawa kepada hipoglikemia waktu tidur yang berbahaya.',
    separationStrategy: 'Wajibkan verifikasi nama penuh berserta perkataan "MIX 25" atau "RAPID" semasa pendispensan.',
    fukkmGenericKeywords: ['humalog', 'lispro'],
    keywordsThis: ['humalog','lispro'],
    keywordsOther: ['humalog'],
    isHAM: true,
    prescriberCategory: 'A/KK'
  },
  {
    id: 'LASA-KKM-041',
    category: 'Endokrin, Diabetes & Steroid',
    drugThis: 'Glimepiride 2mg / 3mg / 4mg Tablet',
    tallManThis: 'glimiPIRIDE',
    drugOther: 'Glipizide / Glibenclamide (Glyburide)',
    tallManOther: 'glipiZIDE / glyBURIDE',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Semua ubat sulfonilurea ini mempunyai potensi, tempoh tindakan, dan dos berbeza (Glibenclamide waktu paruh panjang - risiko hipoglikemia berpanjangan terutamanya warga emas).',
    separationStrategy: 'Susun atur kotak mengikut kekuatan dos dengan label TALL-MAN di kaunter farmasi.',
    fukkmGenericKeywords: ['glimepiride', 'glipizide', 'glibenclamide'],
    keywordsThis: ['glimepiride'],
    keywordsOther: ['glipizide','glibenclamide'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-042',
    category: 'Endokrin, Diabetes & Steroid',
    drugThis: 'Prednisone 5mg Tablet',
    tallManThis: 'predniSONE',
    drugOther: 'Prednisolone 5mg Tablet',
    tallManOther: 'prednisoLONE',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Prednisone ialah prodrug yang memerlukan metabolisme hati kepada Prednisolone aktif. Pada pesakit kegagalan hati teruk (cirrhosis/hepatitis), Prednisone tidak dapat ditukar dengan berkesan.',
    separationStrategy: 'Hospital KKM standard mengutamakan Prednisolone oral bagi mengelakkan keperluan penukaran hepatik.',
    fukkmGenericKeywords: ['prednisone', 'prednisolone'],
    keywordsThis: ['prednisone'],
    keywordsOther: ['prednisolone'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-043',
    category: 'Endokrin, Diabetes & Steroid',
    drugThis: 'Propylthiouracil 50mg Tablet (PTU)',
    tallManThis: 'propylthiouracil (PTU)',
    drugOther: 'Carbimazole 5mg Tablet',
    tallManOther: 'carbimazole',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'PTU adalah ubat pilihan utama untuk trimester pertama kehamilan (mengurangkan risiko aplasia cutis berbanding carbimazole) dan krisis ribut tiroid (thyroid storm). Pada trimester 2-3, Carbimazole lebih digemari kerana risiko hepatotoksisiti PTU.',
    separationStrategy: 'Sahkan usia kandungan wanita hamil sebelum mendispens ubat antitiroid.',
    fukkmGenericKeywords: ['propylthiouracil', 'carbimazole'],
    keywordsThis: ['propylthiouracil'],
    keywordsOther: ['carbimazole'],
    isHAM: false,
    prescriberCategory: 'B'
  },

  // =========================================================================
  // DOMAIN 6: ANTIKOAGULAN, TROMBOLITIK & DARAH
  // =========================================================================
  {
    id: 'LASA-KKM-044',
    category: 'Antikoagulan & Darah',
    drugThis: 'Heparin Sodium 25,000 IU/5mL Therapeutic Injection',
    tallManThis: 'HEPARIN Therapeutic (25,000 IU/5mL)',
    drugOther: 'Heparin Sodium Lock Flush 100 IU/mL / 500 IU/5mL',
    tallManOther: 'HEPARIN Lock Flush (100 IU/mL)',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Kekeliruan antara Heparin dos terapeutik (5,000 IU/mL) dan Heparin pembilas kanula (10-100 IU/mL) adalah antara PUNCA KEMATIAN TERTINGGI sedunia. Menyuntik Heparin dos penuh semasa membilas kanula IV menyebabkan pendarahan intrakranial maut dan pendarahan dalaman masif.',
    separationStrategy: 'WAD KKM DILARANG MENYIMPAN HEPARIN PEKAT 25,000 IU SEBAGAI STOK LANTAI. Heparin Lock Flush sahaja dibenarkan di wad biasa dengan label biru jelas.',
    packagingNotes: 'Vial kaca 5mL dengan reka bentuk penutup dan warna cecair jernih yang serupa.',
    fukkmGenericKeywords: ['heparin'],
    keywordsThis: ['heparin'],
    keywordsOther: ['heparin'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-045',
    category: 'Antikoagulan & Darah',
    drugThis: 'Warfarin Sodium 1mg / 2mg / 3mg / 5mg Tablet',
    tallManThis: 'WARFARIN',
    drugOther: 'Direct Oral Anticoagulants (DOACs - Rivaroxaban / Apixaban / Dabigatran)',
    tallManOther: 'DOACs (Rivaroxaban / Apixaban)',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Warfarin memerlukan pemantauan ketat INR dan mempunyai interaksi makanan/ubat yang luas. Pemberian berganda secara serentak bersama DOAC mengakibatkan pendarahan gastrousus atau serebral yang membawa maut.',
    separationStrategy: 'Gunakan kod warna tablet rasmi KKM (Cth: Coklat 1mg, Biru 2mg, Hijau 3mg, Pink 5mg) dan pastikan kaunseling di Klinik MTAC Warfarin.',
    fukkmGenericKeywords: ['warfarin', 'rivaroxaban', 'apixaban', 'dabigatran'],
    keywordsThis: ['warfarin'],
    keywordsOther: ['rivaroxaban','apixaban','dabigatran'],
    isHAM: true,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-046',
    category: 'Antikoagulan & Darah',
    drugThis: 'Tranexamic Acid 500mg/5mL Injection',
    tallManThis: 'tranexamic ACID',
    drugOther: 'Vitamin K1 (Phytomenadione 10mg/mL Injection)',
    tallManOther: 'vitamin K1 (Phytomenadione)',
    confusionType: 'packaging',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Ampul Asid Traneksamik pernah tersalah suntik ke dalam ruang intratekal/spinal menggantikan ubat bius Bupivacaine atau Vitamin K pada bayi, menyebabkan kekejangan refraktori maut dan nekrosis saraf tunjang (ISMP Alert).',
    separationStrategy: 'Asingkan ampul Tranexamic Acid dalam bekas tertutup bertanda merah di dewan bedah / wad bersalin.',
    packagingNotes: 'Ampul kaca 5mL jernih yang mudah terkeliru dalam troli anestesia.',
    fukkmGenericKeywords: ['tranexamic', 'phytomenadione'],
    keywordsThis: ['tranexamic'],
    keywordsOther: ['phytomenadione'],
    isHAM: true,
    prescriberCategory: 'B'
  },

  // =========================================================================
  // DOMAIN 7: RESPIRATORI, ANESTESIA & KECEMASAN
  // =========================================================================
  {
    id: 'LASA-KKM-047',
    category: 'Respiratori, Anestesia & Kecemasan',
    drugThis: 'Ephedrine Hydrochloride 30mg/mL Injection',
    tallManThis: 'EPHEDrine',
    drugOther: 'Epinephrine Hydrochloride (Adrenaline 1mg/mL 1:1000)',
    tallManOther: 'EPINEPHrine (Adrenaline)',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Epinephrine ialah katekolamina potensi tinggi (1mg/mL). Ephedrine mempunyai potensi jauh lebih rendah (30mg/mL). Menyuntik Epinephrine pada dos Ephedrine (cth: 30mg bukannya 0.5-1mg) menyebabkan takiaritmia ventrikel maut, krisis hipertensi, pendarahan otak, dan serangan jantung serta-merta.',
    separationStrategy: 'Simpan Adrenaline dalam kotak resusitasi merah kecemasan (Cardiac Arrest Box) dengan label TALL-MAN bersaiz besar.',
    packagingNotes: 'Ampul kaca 1mL jernih keluaran pembekal APPL Malaysia yang hampir serupa.',
    fukkmGenericKeywords: ['ephedrine', 'epinephrine', 'adrenaline'],
    keywordsThis: ['ephedrine'],
    keywordsOther: ['epinephrine','adrenaline'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-048',
    category: 'Respiratori, Anestesia & Kecemasan',
    drugThis: 'Atropine Sulphate 1mg/mL Injection',
    tallManThis: 'ATROPINE',
    drugOther: 'Atracurium Besylate 10mg/mL Injection (NMBA)',
    tallManOther: 'ATRACURIUM (Paralytic NMBA)',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Atracurium ialah agen pelumpuh otot (Neuromuscular Blocker). Jika tersalah suntik Atracurium kepada pesakit yang sedar (menggantikan Atropine untuk bradikardia), pesakit akan MENGALAMI KELUMPUHAN PERNAFASAN TOTAL dalam keadaan sedar sepenuhnya dan mati lemas jika tidak segera diintubasi.',
    separationStrategy: 'Atracurium disimpan di dalam peti sejuk Dewan Bedah (OT) sahaja dengan label amaran MERAH "PARALYZING AGENT - WARD STOCK STRICTLY PROHIBITED". Dilarang simpan di wad am.',
    packagingNotes: 'Kedua-duanya dalam ampul kaca 1mL/2.5mL.',
    fukkmGenericKeywords: ['atropine', 'atracurium'],
    keywordsThis: ['atropine'],
    keywordsOther: ['atracurium'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-049',
    category: 'Respiratori, Anestesia & Kecemasan',
    drugThis: 'Rocuronium Bromide Injection',
    tallManThis: 'rocuronium (ROCURONIUM)',
    drugOther: 'Vecuronium Bromide / Pancuronium',
    tallManOther: 'vecuronium / pancuronium',
    confusionType: 'sound-alike',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Semua agen pelumpuh otot ini mempunyai masa mula tindakan (onset) dan jangka masa tindakan yang berbeza (Rocuronium bertindak pantas untuk RSI, manakala Pancuronium bertindak sangat lama).',
    separationStrategy: 'Peti sejuk anestesia wajib meletakkan penutup bertanda "WARNING: PARALYZING AGENT".',
    fukkmGenericKeywords: ['rocuronium', 'vecuronium', 'pancuronium'],
    keywordsThis: ['rocuronium'],
    keywordsOther: ['vecuronium','pancuronium'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-050',
    category: 'Respiratori, Anestesia & Kecemasan',
    drugThis: 'Salbutamol Inhaler / Respirator Solution',
    tallManThis: 'salBUTamol',
    drugOther: 'Salmeterol Xinafoate Inhaler',
    tallManOther: 'salMETERol',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Salbutamol ialah SABA (pelega pantas untuk serangan asma akut). Salmeterol ialah LABA (waktu mula lambat, untuk pencegahan jangka panjang). Menggunakan Salmeterol semasa serangan asma akut mengancam nyawa kerana ia TIDAK melegakan bronkospasme akut dengan pantas.',
    separationStrategy: 'Labelkan Salbutamol dengan penandaan "PELEGA KECEMASAN (RELIEVER)" dan Salmeterol sebagai "PENCEGAH (CONTROLLER)".',
    fukkmGenericKeywords: ['salbutamol', 'salmeterol'],
    keywordsThis: ['salbutamol'],
    keywordsOther: ['salmeterol'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-051',
    category: 'Respiratori, Anestesia & Kecemasan',
    drugThis: 'Aminophylline Injection 250mg/10mL',
    tallManThis: 'aminophylline (IV)',
    drugOther: 'Theophylline Sustained Release Tablet',
    tallManOther: 'theophylline (Oral SR)',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Aminophylline mengandungi kira-kira 80% teofilin. Indeks terapeutik sangat sempit (10-20 mcg/mL). Terlebih dos mengakibatkan aritmia jantung dan sawan refraktori.',
    separationStrategy: 'Pemantauan aras ubat terapeutik (TDM) wajib dilakukan semasa infusi berterusan di ICU/HDU.',
    fukkmGenericKeywords: ['aminophylline', 'theophylline'],
    keywordsThis: ['aminophylline'],
    keywordsOther: ['theophylline'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-052',
    category: 'Respiratori, Anestesia & Kecemasan',
    drugThis: 'Fentanyl Citrate Injection 100mcg/2mL',
    tallManThis: 'FENTanyl',
    drugOther: 'Sufentanil Citrate 50mcg/mL / Alfentanil',
    tallManOther: 'SUFentanil / ALfentanil',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Sufentanil adalah 5 hingga 10 KALI LEBIH KUAT daripada Fentanyl. Tersalah dos menyebabkan henti nafas dan ketegangan dinding dada kayu (wooden chest syndrome) serta-merta.',
    separationStrategy: 'Disimpan dalam peti Dadah Berbahaya (DD) OT dengan buku pendaftaran individu.',
    fukkmGenericKeywords: ['fentanyl', 'sufentanil', 'alfentanil'],
    keywordsThis: ['fentanyl'],
    keywordsOther: ['sufentanil','alfentanil'],
    isHAM: true,
    prescriberCategory: 'A*'
  },

  // =========================================================================
  // DOMAIN 8: ELEKTROLIT, OFTALMIK & PEMBUNGKUSAN (PACKAGING LOOK-ALIKES)
  // =========================================================================
  {
    id: 'LASA-KKM-053',
    category: 'Elektrolit, Oftalmik & Pembungkusan',
    drugThis: 'Potassium Chloride 1g/10mL (KCl Concentrate Ampoule)',
    tallManThis: 'POTASSIUM Chloride 13.4mmol (KCl)',
    drugOther: 'Sodium Chloride 0.9% 10mL Plastic Ampoule / Water for Injection',
    tallManOther: 'SODIUM Chloride 0.9% / WFI',
    confusionType: 'packaging',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Ampul plastik 10mL KCl pekat mempunyai bentuk dan saiz plastik serupa dengan Normal Saline 0.9% atau Water for Injection (WFI). Jika tersalah ambil KCl untuk mencairkan ubat IV dan disuntik terus (IV bolus), pesakit akan MENGALAMI ASISTOL HENTI JANTUNG SERTA-MERTA DAN MATI.',
    separationStrategy: 'STRICTLY PROHIBITED AS WARD FLOOR STOCK. KCl disimpan di farmasi/ICU sahaja dengan label merah "HIGH ALERT - DILARANG SUNTIK TERUS".',
    packagingNotes: 'Ampul plastik polietilena 10mL (Sterilised Plastic Ampoule) keluaran B.Braun / Ain Medicare / Pharmaniaga.',
    fukkmGenericKeywords: ['potassium chloride'],
    keywordsThis: ['potassium chloride'],
    keywordsOther: ['sodium'],
    isHAM: true,
    prescriberCategory: 'A'
  },
  {
    id: 'LASA-KKM-054',
    category: 'Elektrolit, Oftalmik & Pembungkusan',
    drugThis: 'Calcium Gluconate 10% 10mL Injection',
    tallManThis: 'calcium GLUCONATE 10%',
    drugOther: 'Calcium Chloride 10% 10mL Injection',
    tallManOther: 'calcium CHLORIDE 10%',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Calcium Chloride mengandungi KIRA-KIRA 3 KALI GANDA KANDUNGAN KALSIUM ELEMENTAL berbanding Calcium Gluconate (27.2mg/mL vs 9.3mg/mL Ca²⁺). Calcium Chloride menyebabkan nekrosis tisu teruk jika berlaku ekstravasasi dan tidak boleh diberi secara periferal tanpa titrasi ketat.',
    separationStrategy: 'Gunakan Calcium Gluconate sebagai stok utama resusitasi wad; simpan Calcium Chloride khas untuk pembedahan kardiak.',
    fukkmGenericKeywords: ['calcium gluconate', 'calcium chloride'],
    keywordsThis: ['calcium gluconate'],
    keywordsOther: ['calcium chloride'],
    isHAM: true,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-055',
    category: 'Elektrolit, Oftalmik & Pembungkusan',
    drugThis: 'Acetazolamide 250mg Tablet',
    tallManThis: 'acetaZOLAMIDE',
    drugOther: 'Acetohexamide Tablet',
    tallManOther: 'acetoHEXAMIDE',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Acetazolamide ialah perencat karbonik anhidrase untuk glaukoma akut, manakala Acetohexamide ialah ubat diabetes sulfonilurea. Kekeliruan boleh mengakibatkan hipoglikemia parah atau kegagalan penurunan tekanan intraokular.',
    separationStrategy: 'Pemisahan rak oftalmologi dan rak endokrin.',
    fukkmGenericKeywords: ['acetazolamide'],
    keywordsThis: ['acetazolamide'],
    keywordsOther: ['acetohexamide'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-056',
    category: 'Elektrolit, Oftalmik & Pembungkusan',
    drugThis: 'Timolol Maleate 0.5% Eye Drops',
    tallManThis: 'TIMOLOL Eye Drops',
    drugOther: 'Tobramycin 0.3% Eye Drops / Travoprost',
    tallManOther: 'TOBRAMYCIN Eye Drops',
    confusionType: 'packaging',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Timolol ialah penyekat beta topikal (boleh diserap secara sistemik dan mencetuskan bradikardia teruk serta bronkospasme pada pesakit asma). Tobramycin ialah antibiotik aminoglikosida. Botol ubat titis mata kecil ini mempunyai botol plastik putih 5mL serupa.',
    separationStrategy: 'Semak kod warna penutup botol titis mata antarabangsa (Kuning/Biru untuk Timolol, Tan/Kelabu untuk Antibiotik).',
    packagingNotes: 'Botol plastik penitis 5mL dengan reka bentuk botol yang serupa.',
    fukkmGenericKeywords: ['timolol', 'tobramycin'],
    keywordsThis: ['timolol'],
    keywordsOther: ['tobramycin'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-057',
    category: 'Elektrolit, Oftalmik & Pembungkusan',
    drugThis: 'Dexamethasone Eye Drops',
    tallManThis: 'DEXAMETHASONE Eye Drops',
    drugOther: 'Gentamicin Eye Drops',
    tallManOther: 'GENTAMICIN Eye Drops',
    confusionType: 'packaging',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Memberikan steroid Dexamethasone pada jangkitan herpes kornea atau ulser bakteria tanpa antibiotik boleh menyebabkan perforasi kornea dan buta kekal.',
    separationStrategy: 'Pemeriksaan slit-lamp wajib oleh pegawai perubatan mata sebelum preskripsi steroid mata.',
    packagingNotes: 'Botol penitis 5mL.',
    fukkmGenericKeywords: ['dexamethasone', 'gentamicin'],
    keywordsThis: ['dexamethasone'],
    keywordsOther: ['gentamicin'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-058',
    category: 'Kardiovaskular & Inotrop',
    drugThis: 'Carvedilol Tablet',
    tallManThis: 'carvedilol (CARVEDILOL)',
    drugOther: 'Captopril Tablet',
    tallManOther: 'captopril (CAPTOPRIL)',
    confusionType: 'sound-alike',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Carvedilol ialah beta/alfa-blocker manakala Captopril ialah ACE-inhibitor bertindak pendek. Kekeliruan nama awalan Ca- boleh mengganggu penstabilan kegagalan jantung.',
    separationStrategy: 'Pemisahan petak ubat dalam laci farmasi pesakit luar.',
    fukkmGenericKeywords: ['carvedilol', 'captopril'],
    keywordsThis: ['carvedilol'],
    keywordsOther: ['captopril'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-059',
    category: 'Antimikrob & Sefalosporin',
    drugThis: 'Lamivudine 150mg / 300mg Tablet (3TC)',
    tallManThis: 'lamiVUDine',
    drugOther: 'Lamotrigine Tablet',
    tallManOther: 'lamoTRIGine',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Lamivudine ialah antivirus HIV dan Hepatitis B, manakala Lamotrigine ialah ubat epilepsi (risiko Sindrom Stevens-Johnson jika dos ditingkatkan terlalu cepat).',
    separationStrategy: 'Lamivudine disimpan di stor farmasi ID/HIV dengan kaunseling khas.',
    fukkmGenericKeywords: ['lamivudine', 'lamotrigine'],
    keywordsThis: ['lamivudine'],
    keywordsOther: ['lamotrigine'],
    isHAM: false,
    prescriberCategory: 'A'
  },
  {
    id: 'LASA-KKM-060',
    category: 'Onkologi & Sitotoksik',
    drugThis: 'Infliximab 100mg Injection',
    tallManThis: 'inFLIXimab',
    drugOther: 'Rituximab 100mg / 500mg Injection',
    tallManOther: 'riTUXimab',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Infliximab ialah antibodi anti-TNF alfa untuk penyakit autoimun (Crohns/Artritis), manakala Rituximab ialah antibodi anti-CD20 untuk limfoma dan leukemia. Kedua-duanya agen biologi mahal dengan profil tindak balas infusi dan indikasi berbeza.',
    separationStrategy: 'Penyimpanan dalam peti sejuk biologi 2-8°C dengan pengesahan indikasi pakar hematologi/reumatologi.',
    fukkmGenericKeywords: ['infliximab', 'rituximab'],
    keywordsThis: ['infliximab'],
    keywordsOther: ['rituximab'],
    isHAM: true,
    prescriberCategory: 'A*'
  }
]

/**
 * Helper to convert KKM Master Registry into standard LASAPair format
 */
export function getLasaPairsForDrug(genericName: string): LASAPair[] {
  const q = genericName.toLowerCase().trim()
  const pairs: LASAPair[] = []

  KKM_LASA_MASTER_REGISTRY.forEach(item => {
    const matchThis =
      (item.keywordsThis && item.keywordsThis.some(k => q.includes(k.toLowerCase()))) ||
      item.drugThis.toLowerCase().includes(q) ||
      q.includes(item.drugThis.toLowerCase()) ||
      item.tallManThis.toLowerCase() === q

    const matchOther =
      (item.keywordsOther && item.keywordsOther.some(k => q.includes(k.toLowerCase()))) ||
      item.drugOther.toLowerCase().includes(q) ||
      q.includes(item.drugOther.toLowerCase()) ||
      item.tallManOther.toLowerCase() === q

    if (matchThis) {
      pairs.push({
        confusedWith: item.drugOther,
        confusionType: item.confusionType === 'packaging' ? 'look-alike' : item.confusionType,
        tallManThis: item.tallManThis,
        tallManOther: item.tallManOther,
        clinicalRiskWarning: item.clinicalRiskWarning,
        separationStrategy: item.separationStrategy
      })
    } else if (matchOther) {
      // Clean tall man for the other drug (e.g. Apixaban)
      let customTallOther = item.tallManOther
      if (item.id === 'LASA-KKM-045') {
        if (q.includes('apixaban')) customTallOther = 'aPIXaban'
        else if (q.includes('rivaroxaban')) customTallOther = 'riVAROxaban'
        else if (q.includes('dabigatran')) customTallOther = 'daBIGatran'
      }

      pairs.push({
        confusedWith: item.drugThis,
        confusionType: item.confusionType === 'packaging' ? 'look-alike' : item.confusionType,
        tallManThis: customTallOther,
        tallManOther: item.tallManThis,
        clinicalRiskWarning: item.clinicalRiskWarning,
        separationStrategy: item.separationStrategy
      })
    }
  })

  return pairs
}

/**
 * Get distinct LASA categories
 */
export function getLasaCategories(): string[] {
  return [
    'Semua Kategori',
    'Kardiovaskular & Inotrop',
    'Antimikrob & Sefalosporin',
    'Onkologi & Sitotoksik',
    'CNS, Analgesik & Psikotropik',
    'Endokrin, Diabetes & Steroid',
    'Antikoagulan & Darah',
    'Respiratori, Anestesia & Kecemasan',
    'Elektrolit, Oftalmik & Pembungkusan'
  ]
}
