import { LASAPair } from '../types/formulariTypes'

export interface KkmLasaEntry {
  id: string
  category: 
    | 'Cardiovascular & Inotropes'
    | 'Antimicrobial & Cephalosporins'
    | 'Oncology & Cytotoxics'
    | 'CNS, Analgesics & Psychotropics'
    | 'Endocrine, Diabetes & Steroids'
    | 'Anticoagulants & Blood Products'
    | 'Respiratory, Anaesthesia & Emergency'
    | 'Electrolytes, Ophthalmic & Packaging'
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
    category: 'Cardiovascular & Inotropes',
    drugThis: 'Dobutamine Hydrochloride Injection',
    tallManThis: 'DOBUTamine',
    drugOther: 'Dopamine Hydrochloride Injection',
    tallManOther: 'DOPAmine',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Dobutamine is an inotrope (beta-1 agonist) with mild vasodilatory action, whereas Dopamine exhibits dose-dependent vasopressor (alpha-agonist) effects. Administration errors can precipitate severe cardiogenic shock or life-threatening hypertensive crises.',
    separationStrategy: 'Isolate into separate storage compartments in CCU/ICU emergency resuscitation crash carts. Mandatory TALL-MAN red/orange high-alert auxiliary labels and independent double-check (IDC) by two clinicians.',
    packagingNotes: 'Both supplied in clear 20mL or 5mL glass ampoules by APPL manufacturers with near-identical packaging design.',
    fukkmGenericKeywords: ['dobutamine'],
    keywordsThis: ['dobutamine'],
    keywordsOther: ['dopamine'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-002',
    category: 'Cardiovascular & Inotropes',
    drugThis: 'Dopamine Hydrochloride Injection',
    tallManThis: 'DOPAmine',
    drugOther: 'Dobutamine Hydrochloride Injection',
    tallManOther: 'DOBUTamine',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Accidental administration of Dopamine to patients in decompensated heart failure can induce severe peripheral vasoconstriction and significantly elevate cardiac afterload.',
    separationStrategy: 'Store in segregated zones with prominent TALL-MAN labeling on critical care ward inotrope infusion trays.',
    fukkmGenericKeywords: ['dopamine'],
    keywordsThis: ['dopamine'],
    keywordsOther: ['dobutamine'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-003',
    category: 'Cardiovascular & Inotropes',
    drugThis: 'Amlodipine Besylate Tablet',
    tallManThis: 'amLODIPine',
    drugOther: 'Amiloride Hydrochloride Tablet',
    tallManOther: 'aMILORide',
    confusionType: 'sound-alike',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Amlodipine is a calcium channel blocker (CCB) for hypertension, whereas Amiloride is a potassium-sparing diuretic. Administration error can cause life-threatening severe hyperkalemia or failure of blood pressure control.',
    separationStrategy: 'Segregate storage compartments on outpatient pharmacy and medical ward shelves; affix yellow LASA auxiliary labels.',
    fukkmGenericKeywords: ['amlodipine'],
    keywordsThis: ['amlodipine'],
    keywordsOther: ['amiloride'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-004',
    category: 'Cardiovascular & Inotropes',
    drugThis: 'Amlodipine Besylate Tablet',
    tallManThis: 'amLODIPine',
    drugOther: 'Atenolol Tablet',
    tallManOther: 'aTENOloL',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Atenolol is a cardioselective beta-blocker. Confusion due to the shared "A-" prefix can cause severe bradycardia, bronchospasm in asthmatic patients, or rebound hypertensive spikes if chronic therapy is omitted.',
    separationStrategy: 'Arrange shelves in non-contiguous alphabetical sequence (insert intervening medications between them).',
    fukkmGenericKeywords: ['amlodipine', 'atenolol'],
    keywordsThis: ['amlodipine'],
    keywordsOther: ['atenolol'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-005',
    category: 'Cardiovascular & Inotropes',
    drugThis: 'Nicardipine Hydrochloride Injection',
    tallManThis: 'niCARdipine',
    drugOther: 'Nifedipine Capsule / Tablet',
    tallManOther: 'NIFEdipine',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Nicardipine IV is used for hypertensive crises and acute stroke with tight titration. Confusing dose or formulation with oral/sublingual Nifedipine can precipitate precipitous hypotension and cerebral ischemia.',
    separationStrategy: 'Store Nicardipine IV in locked refrigerator / ICU resuscitation crash carts; label with TALL-MAN niCARdipine.',
    fukkmGenericKeywords: ['nicardipine', 'nifedipine'],
    keywordsThis: ['nicardipine'],
    keywordsOther: ['nifedipine'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-006',
    category: 'Cardiovascular & Inotropes',
    drugThis: 'Nimodipine Tablet / Infusion',
    tallManThis: 'niMODipine',
    drugOther: 'Nicardipine Hydrochloride',
    tallManOther: 'niCARdipine',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Nimodipine is specifically indicated for preventing cerebral vasospasm following subarachnoid hemorrhage (SAH). Drug confusion leads to compromised cerebral perfusion and permanent neurological deficit.',
    separationStrategy: 'Mandate neurosurgery/neurology specialist prescription verification and dedicated neuro-ICU shelf labeling.',
    fukkmGenericKeywords: ['nimodipine'],
    keywordsThis: ['nimodipine'],
    keywordsOther: ['nicardipine'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-007',
    category: 'Cardiovascular & Inotropes',
    drugThis: 'Hydralazine Hydrochloride Injection / Tablet',
    tallManThis: 'hydrALAZINE',
    drugOther: 'Hydroxyzine Hydrochloride Tablet / Syrup',
    tallManOther: 'hydrOXYzine',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Hydralazine is a potent vasodilator for hypertensive emergencies (including pregnancy eclampsia), whereas Hydroxyzine is a sedating antihistamine. Administering Hydralazine to allergic patients can cause circulatory collapse and reflex tachycardia.',
    separationStrategy: 'Never store Hydralazine on sedative/antihistamine shelves. Mandate TALL-MAN display hydrALAZINE vs hydrOXYzine.',
    fukkmGenericKeywords: ['hydralazine', 'hydroxyzine'],
    keywordsThis: ['hydralazine'],
    keywordsOther: ['hydroxyzine'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-008',
    category: 'Cardiovascular & Inotropes',
    drugThis: 'Clonidine Hydrochloride Tablet / Injection',
    tallManThis: 'cloniDINE',
    drugOther: 'Clonazepam Tablet',
    tallManOther: 'clonazePAM',
    confusionType: 'sound-alike',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Clonidine is a central alpha-2 agonist for hypertension and ADHD, whereas Clonazepam is an anticonvulsant benzodiazepine. Confusion can induce comatose sedation or rebound hypertensive crisis upon abrupt withdrawal.',
    separationStrategy: 'Store Clonazepam inside locked/barred psychotropic drug cabinets, and Clonidine on antihypertensive shelving.',
    fukkmGenericKeywords: ['clonidine'],
    keywordsThis: ['clonidine'],
    keywordsOther: ['clonazepam'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-009',
    category: 'Cardiovascular & Inotropes',
    drugThis: 'Labetalol Hydrochloride Injection / Tablet',
    tallManThis: 'labetaLOL',
    drugOther: 'Lamotrigine Tablet',
    tallManOther: 'lamoTRIGine',
    confusionType: 'sound-alike',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Labetalol is an alpha/beta-blocker for pregnancy-induced hypertension and stroke, whereas Lamotrigine is an antiepileptic/mood stabilizer. Dosage confusion can trigger recurrent seizures or fetal bradycardia.',
    separationStrategy: 'Use distinct color-coded shelf labeling in labor & delivery wards and psychiatric units.',
    fukkmGenericKeywords: ['labetalol'],
    keywordsThis: ['labetalol'],
    keywordsOther: ['lamotrigine'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-010',
    category: 'Cardiovascular & Inotropes',
    drugThis: 'Isosorbide Mononitrate Tablet (ISMN)',
    tallManThis: 'isosorbide MONOnitrate',
    drugOther: 'Isosorbide Dinitrate Tablet (ISDN)',
    tallManOther: 'isosorbide DInitrate',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'ISDN requires 2-3 daily doses due to low bioavailability, whereas ISMN is dosed once daily (sustained release). Frequency confusion causes syncopal hypotension and nitrate tolerance.',
    separationStrategy: 'Emphasize MONOnitrate and DInitrate with bold yellow lettering at pharmacy dispensing counters.',
    fukkmGenericKeywords: ['isosorbide mononitrate', 'isosorbide dinitrate'],
    keywordsThis: ['isosorbide mononitrate'],
    keywordsOther: ['isosorbide dinitrate'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-011',
    category: 'Cardiovascular & Inotropes',
    drugThis: 'Prazosin Hydrochloride Tablet',
    tallManThis: 'PRAZosin',
    drugOther: 'Trazodone Hydrochloride Tablet',
    tallManOther: 'traZODone',
    confusionType: 'sound-alike',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Prazosin is a vascular alpha-1 blocker (risk of first-dose syncope/hypotension), whereas Trazodone is a sedating antidepressant.',
    separationStrategy: 'Physical separation between cardiovascular and psychotropic shelves.',
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
    category: 'Antimicrobial & Cephalosporins',
    drugThis: 'Cefazolin Sodium 1g Injection',
    tallManThis: 'cefAZOLin',
    drugOther: 'Cefotaxime Sodium 1g Injection',
    tallManOther: 'cefOTAXime',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Cefazolin (Gen 1) is standard surgical prophylaxis (Gram-positive Staphylococcus coverage), whereas Cefotaxime (Gen 3) is for Gram-negative sepsis and meningitis. Medication error leads to surgical prophylaxis failure or sepsis treatment failure.',
    separationStrategy: 'Segregate vial bins in operating theatres (OT) and pharmacy stores. Color-code shelf fronts Gen 1 vs Gen 3.',
    packagingNotes: 'White powder 1g vials in identical glass bottles by Pharmaniaga / Duopharma.',
    fukkmGenericKeywords: ['cefazolin'],
    keywordsThis: ['cefazolin'],
    keywordsOther: ['cefotaxime'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-013',
    category: 'Antimicrobial & Cephalosporins',
    drugThis: 'Cefotaxime Sodium 1g Injection',
    tallManThis: 'cefOTAXime',
    drugOther: 'Ceftriaxone Sodium 1g Injection',
    tallManOther: 'cefTRIAXone',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Cefotaxime is safe for neonates with hyperbilirubinemia (dosed q6-8h), whereas Ceftriaxone is CONTRAINDICATED in neonates due to calcium-ceftriaxone precipitation and fatal kernicterus.',
    separationStrategy: 'In Paediatric Ward & NICU, Ceftriaxone is strictly prohibited as floor stock without paediatrician verification.',
    packagingNotes: 'Both are 1g injection powders packaged in identically sized glass vials.',
    fukkmGenericKeywords: ['cefotaxime', 'ceftriaxone'],
    keywordsThis: ['cefotaxime'],
    keywordsOther: ['ceftriaxone'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-014',
    category: 'Antimicrobial & Cephalosporins',
    drugThis: 'Ceftazidime 1g Injection',
    tallManThis: 'cefTAZIDime',
    drugOther: 'Ceftriaxone Sodium 1g Injection',
    tallManOther: 'cefTRIAXone',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Ceftazidime has potent antipseudomonal activity (Pseudomonas aeruginosa), whereas Ceftriaxone has NO Pseudomonas coverage. Inadvertent administration of Ceftriaxone in pseudomonal sepsis can result in patient mortality from untreated bacteremia.',
    separationStrategy: 'Affix "ANTIPSEUDOMONAL" warning auxiliary labels on Ceftazidime and physically separate shelf bins.',
    fukkmGenericKeywords: ['ceftazidime'],
    keywordsThis: ['ceftazidime'],
    keywordsOther: ['ceftriaxone'],
    isHAM: false,
    prescriberCategory: 'A'
  },
  {
    id: 'LASA-KKM-015',
    category: 'Antimicrobial & Cephalosporins',
    drugThis: 'Cefuroxime Sodium 750mg / 1.5g Injection',
    tallManThis: 'cefUROXime',
    drugOther: 'Cefotaxime / Cefazolin',
    tallManOther: 'cefOTAXime / cefAZOLin',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Cefuroxime is a 2nd-generation cephalosporin with moderate spectrum for CAP and orthopedic infections. Confusion in dosage and generation impairs antimicrobial treatment outcomes.',
    separationStrategy: 'Mandate full drug generic name and strength in e-Prescribing system.',
    fukkmGenericKeywords: ['cefuroxime'],
    keywordsThis: ['cefuroxime'],
    keywordsOther: ['cefotaxime'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-016',
    category: 'Antimicrobial & Cephalosporins',
    drugThis: 'Cefepime Hydrochloride 1g / 2g Injection',
    tallManThis: 'cefEPIME',
    drugOther: 'Ceftazidime / Ceftriaxone',
    tallManOther: 'cefTAZIDime / cefTRIAXone',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Cefepime is a 4th-generation broad-spectrum reserved cephalosporin. Carries high neurotoxicity risk in renal impairment if dosed inappropriately.',
    separationStrategy: 'Store in restricted antimicrobial shelves (NAG Restricted Tier) with Infectious Disease specialist / Microbiologist endorsement.',
    fukkmGenericKeywords: ['cefepime'],
    keywordsThis: ['cefepime'],
    keywordsOther: ['ceftazidime'],
    isHAM: false,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-017',
    category: 'Antimicrobial & Cephalosporins',
    drugThis: 'Ampicillin Sodium 500mg Injection',
    tallManThis: 'AMPICILLIN',
    drugOther: 'Ampiclox (Ampicillin 250mg + Cloxacillin 250mg)',
    tallManOther: 'AMPICLOX',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Pure Ampicillin does not cover penicillinase-producing staphylococci, whereas Ampiclox contains cloxacillin. Dispensing error can lead to treatment failure in staphylococcal abscesses.',
    separationStrategy: 'Segregate Ampiclox neonatal and adult ampoules from pure Ampicillin.',
    fukkmGenericKeywords: ['ampicillin', 'ampiclox'],
    keywordsThis: ['ampicillin'],
    keywordsOther: ['ampiclox'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-018',
    category: 'Antimicrobial & Cephalosporins',
    drugThis: 'Azithromycin Tablet / Suspension / IV',
    tallManThis: 'aZIThromycin',
    drugOther: 'Azathioprine Tablet',
    tallManOther: 'aZAThioprine',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Azithromycin is a macrolide antibiotic (typically 3-5 day course), whereas Azathioprine is a cytotoxic immunosuppressant. Administering Azathioprine as an antibiotic can trigger fatal myelosuppression, pancytopenia, and severe opportunistic infections.',
    separationStrategy: 'Azathioprine must be stored in purple hazard-labeled cytotoxic cabinets. Strictly prohibited from antibiotic shelves.',
    fukkmGenericKeywords: ['azithromycin', 'azathioprine'],
    keywordsThis: ['azithromycin'],
    keywordsOther: ['azathioprine'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-019',
    category: 'Antimicrobial & Cephalosporins',
    drugThis: 'Ciprofloxacin Tablet / Infusion',
    tallManThis: 'ciproFLOXacin',
    drugOther: 'Levofloxacin / Moxifloxacin',
    tallManOther: 'levoFLOXacin / moxiFLOXacin',
    confusionType: 'sound-alike',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Ciprofloxacin is ineffective against Streptococcus pneumoniae in community-acquired pneumonia (CAP), whereas Levofloxacin/Moxifloxacin are respiratory fluoroquinolones. Selection error results in severe pneumonia treatment failure.',
    separationStrategy: 'Affix "RESPIRATORY QUINOLONE" label on Levofloxacin and separate 100mL infusion bottles.',
    fukkmGenericKeywords: ['ciprofloxacin', 'levofloxacin', 'moxifloxacin'],
    keywordsThis: ['ciprofloxacin'],
    keywordsOther: ['levofloxacin','moxifloxacin'],
    isHAM: false,
    prescriberCategory: 'A/KK'
  },
  {
    id: 'LASA-KKM-020',
    category: 'Antimicrobial & Cephalosporins',
    drugThis: 'Metronidazole Tablet / IV Infusion 500mg/100mL',
    tallManThis: 'metroNIDAZOLE',
    drugOther: 'Metformin Hydrochloride 500mg Tablet',
    tallManOther: 'metFORMIN',
    confusionType: 'sound-alike',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Metronidazole is an anaerobic/antiprotozoal antimicrobial, whereas Metformin is a biguanide antidiabetic. Diabetics inadvertently missing Metformin will experience severe hyperglycemia, while non-diabetic patients given Metformin face risks of fatal lactic acidosis.',
    separationStrategy: 'Enforce strict shelf segregation between outpatient NCD diabetes medications and inpatient ward antimicrobials/infusions.',
    fukkmGenericKeywords: ['metronidazole', 'metformin'],
    keywordsThis: ['metronidazole'],
    keywordsOther: ['metformin'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-021',
    category: 'Antimicrobial & Cephalosporins',
    drugThis: 'Sulfadiazine 500mg Tablet',
    tallManThis: 'sulfaDIAZINE',
    drugOther: 'Sulfasalazine 500mg Tablet',
    tallManOther: 'sulfaSALAZINE',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Sulfadiazine is indicated for cerebral toxoplasmosis (in HIV/immunocompromised patients), whereas Sulfasalazine is for inflammatory bowel disease (IBD) and rheumatoid arthritis. Error leads to uncontrolled parasitic brain infection.',
    separationStrategy: 'Apply TALL-MAN labeling and confirm indication during prescription screening.',
    fukkmGenericKeywords: ['sulfadiazine', 'sulfasalazine'],
    keywordsThis: ['sulfadiazine'],
    keywordsOther: ['sulfasalazine'],
    isHAM: false,
    prescriberCategory: 'A'
  },
  {
    id: 'LASA-KKM-022',
    category: 'Antimicrobial & Cephalosporins',
    drugThis: 'Fluconazole Capsule / IV Infusion',
    tallManThis: 'fluCONAZOLE',
    drugOther: 'Itraconazole / Voriconazole',
    tallManOther: 'itraCONAZOLE / vORIconazole',
    confusionType: 'sound-alike',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Fluconazole lacks activity against Aspergillus or Mucor, whereas Voriconazole is first-line for invasive Aspergillosis. Confusion can result in mortality in neutropenic patients.',
    separationStrategy: 'Voriconazole is categorized under Infectious Disease Specialist Approval (A*) with dedicated TALL-MAN labels.',
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
    category: 'Oncology & Cytotoxics',
    drugThis: 'Carboplatin Injection',
    tallManThis: 'CARBOplatin',
    drugOther: 'Cisplatin Injection',
    tallManOther: 'CISplatin',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Carboplatin is dosed using Calvert AUC (e.g. 400-600mg), whereas Cisplatin is dosed much lower (e.g. 50-100mg/m²). Administering Carboplatin dose as Cisplatin is a LETHAL OVERDOSE causing irreversible acute renal tubular necrosis, profound ototoxicity (permanent deafness), and multiorgan failure.',
    separationStrategy: 'Prepared exclusively in Cytotoxic Drug Reconstitution (CDRC) units. Mandatory 3-tier dose check (Oncologist, Oncology Pharmacist, Oncology Nurse) with blood-red TALL-MAN warning labels.',
    fukkmGenericKeywords: ['carboplatin', 'cisplatin'],
    keywordsThis: ['carboplatin'],
    keywordsOther: ['cisplatin'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-024',
    category: 'Oncology & Cytotoxics',
    drugThis: 'Vincristine Sulphate Injection',
    tallManThis: 'vinCRIStine',
    drugOther: 'Vinblastine Sulphate Injection',
    tallManOther: 'vinBLAStine',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Vincristine has a strict maximum single dose cap of 2mg (due to severe peripheral neurotoxicity). Vinblastine is dosed significantly higher (e.g. 6mg/m²). Administering Vinblastine dose as Vincristine triggers extreme motor neuropathy, fatal paralytic ileus, and respiratory failure.',
    separationStrategy: 'Must be prepared in 50mL minibags (NEVER syringes) to prevent accidental intrathecal injection. Label: "FOR INTRAVENOUS USE ONLY - FATAL IF GIVEN INTRATHECALLY".',
    fukkmGenericKeywords: ['vincristine', 'vinblastine'],
    keywordsThis: ['vincristine'],
    keywordsOther: ['vinblastine'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-025',
    category: 'Oncology & Cytotoxics',
    drugThis: 'Doxorubicin Hydrochloride Injection',
    tallManThis: 'DOXOrubicin',
    drugOther: 'Daunorubicin / Epirubicin / Idarubicin',
    tallManOther: 'DAUNOrubicin / ePIRubicin / IDArubicin',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'All anthracyclines present as identical bright red solutions with lifetime cumulative irreversible cardiotoxicity (cardiomyopathy). Dosing and protocols differ significantly between analogs.',
    separationStrategy: 'Store inside CDRC refrigerator with bright red TALL-MAN dividers. Mandatory tracking of lifetime cumulative dose in patient treatment logbook.',
    packagingNotes: 'All vials contain bright red powder / liquid solution.',
    fukkmGenericKeywords: ['doxorubicin', 'daunorubicin', 'epirubicin', 'idarubicin'],
    keywordsThis: ['doxorubicin'],
    keywordsOther: ['daunorubicin','epirubicin','idarubicin'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-026',
    category: 'Oncology & Cytotoxics',
    drugThis: 'Paclitaxel Concentrate for Infusion',
    tallManThis: 'PAClitaxel',
    drugOther: 'Docetaxel Concentrate for Infusion',
    tallManOther: 'DOCEtaxel',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Paclitaxel requires PVC-free infusion tubing with 0.22-micron in-line filter and intensive steroid/antihistamine premedication to prevent Cremophor-induced anaphylaxis. Docetaxel uses different diluents and carries peripheral edema/capillary leak risks.',
    separationStrategy: 'Verify specific chemotherapy regimen protocol (e.g. AC-T vs TCH) prior to CDRC stock release.',
    fukkmGenericKeywords: ['paclitaxel', 'docetaxel'],
    keywordsThis: ['paclitaxel'],
    keywordsOther: ['docetaxel'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-027',
    category: 'Oncology & Cytotoxics',
    drugThis: 'Cyclophosphamide Injection / Tablet',
    tallManThis: 'cycloPHOSPHamide',
    drugOther: 'Cyclosporine Capsule / Oral Solution / IV',
    tallManOther: 'cycloSPORINE',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Cyclophosphamide is an antineoplastic alkylating agent (risk of hemorrhagic cystitis and myelosuppression), whereas Cyclosporine is a calcineurin inhibitor transplant immunosuppressant. Error causes acute organ rejection or cytotoxic toxicity.',
    separationStrategy: 'Store Cyclosporine in transplant pharmacy stock; Cyclophosphamide in CDRC cytotoxic suite.',
    fukkmGenericKeywords: ['cyclophosphamide', 'cyclosporine', 'cyclosporin'],
    keywordsThis: ['cyclophosphamide'],
    keywordsOther: ['cyclosporine','cyclosporin'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-028',
    category: 'Oncology & Cytotoxics',
    drugThis: 'Folic Acid 5mg Tablet',
    tallManThis: 'FOLIC acid',
    drugOther: 'Folinic Acid (Calcium Leucovorin / Calcium Folinate 15mg)',
    tallManOther: 'foliNIC acid (Leucovorin)',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Folinic Acid (Leucovorin) is mandatory rescue therapy following high-dose Methotrexate to prevent healthy cell death. Folic acid CANNOT rescue patients from high-dose Methotrexate toxicity and leads to fatal bone marrow failure.',
    separationStrategy: 'Oncology clinics and ward pharmacy must label Leucovorin with yellow "ONCOLOGY RESCUE AGENT" auxiliary labels.',
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
    category: 'CNS, Analgesics & Psychotropics',
    drugThis: 'Morphine Sulphate Injection 10mg/mL',
    tallManThis: 'MORphine',
    drugOther: 'Hydromorphone Hydrochloride Injection 2mg/mL',
    tallManOther: 'HYDROmorphone',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Hydromorphone is 5 to 7 TIMES MORE POTENT than Morphine (1mg Hydromorphone ≈ 7mg Morphine). Administering Hydromorphone at Morphine doses precipitates fatal opioid overdose (coma, apnea, respiratory arrest, and instant death).',
    separationStrategy: 'Store Hydromorphone in dedicated Dangerous Drugs (DD) safe with twin red warnings. Ensure Naloxone antidote is continuously accessible in emergency crash carts.',
    packagingNotes: 'Both 1mL Dangerous Drug glass ampoules have near-identical physical dimensions.',
    fukkmGenericKeywords: ['morphine', 'hydromorphone'],
    keywordsThis: ['morphine'],
    keywordsOther: ['hydromorphone'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-030',
    category: 'CNS, Analgesics & Psychotropics',
    drugThis: 'Tramadol Hydrochloride 50mg Capsule / Injection',
    tallManThis: 'traMADol',
    drugOther: 'Toradol (Ketorolac Tromethamine 30mg Injection)',
    tallManOther: 'toraDOL (Ketorolac)',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Ketorolac is a potent injectable NSAID (risk of bleeding peptic ulceration and acute kidney injury), whereas Tramadol is a weak opioid analgesic. Confusion between brand Toradol and generic Tramadol is frequent.',
    separationStrategy: 'Use official generic names (Ketorolac & Tramadol) and prohibit brand name abbreviations on medication administration charts.',
    fukkmGenericKeywords: ['tramadol', 'ketorolac'],
    keywordsThis: ['tramadol'],
    keywordsOther: ['ketorolac'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-031',
    category: 'CNS, Analgesics & Psychotropics',
    drugThis: 'Diazepam 10mg/2mL Injection / 5mg Tablet',
    tallManThis: 'diazePAM',
    drugOther: 'Lorazepam 1mg / 2mg Tablet / Injection',
    tallManOther: 'LORazepam',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Lorazepam has much higher milligram-for-milligram potency (1mg Lorazepam ≈ 5mg Diazepam) with prolonged sedation. Dosing confusion triggers profound respiratory depression.',
    separationStrategy: 'Store in psychotropic locked cabinet with separate alphabetical bin stock cards.',
    fukkmGenericKeywords: ['diazepam', 'lorazepam'],
    keywordsThis: ['diazepam'],
    keywordsOther: ['lorazepam'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-032',
    category: 'CNS, Analgesics & Psychotropics',
    drugThis: 'Carbamazepine 200mg Tablet (Tegretol)',
    tallManThis: 'CARBamazepine',
    drugOther: 'Oxcarbazepine 300mg Tablet (Trileptal)',
    tallManOther: 'OXcarbazepine',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Conversion dose ratio of Carbamazepine to Oxcarbazepine is approximately 1:1.5 (e.g. 200mg Carbamazepine ≈ 300mg Oxcarbazepine). Oxcarbazepine carries higher hyponatremia risk. Dosing error causes breakthrough seizures.',
    separationStrategy: 'Affix TALL-MAN labels on antiepileptic pharmacy bins in outpatient dispensing.',
    fukkmGenericKeywords: ['carbamazepine', 'oxcarbazepine'],
    keywordsThis: ['carbamazepine'],
    keywordsOther: ['oxcarbazepine'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-033',
    category: 'CNS, Analgesics & Psychotropics',
    drugThis: 'Chlorpromazine Hydrochloride Tablet / Injection',
    tallManThis: 'chlorproMAZINE',
    drugOther: 'Clomipramine Hydrochloride Tablet',
    tallManOther: 'clomiPRAMINE',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Chlorpromazine is a typical phenothiazine antipsychotic (risk of EPS, neuroleptic malignant syndrome), whereas Clomipramine is a tricyclic antidepressant (risk of serotonin syndrome, cardiac arrhythmias).',
    separationStrategy: 'Separate psychiatric ward storage drawers and verify clinical indication prior to dispensing.',
    fukkmGenericKeywords: ['chlorpromazine', 'clomipramine'],
    keywordsThis: ['chlorpromazine'],
    keywordsOther: ['clomipramine'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-034',
    category: 'CNS, Analgesics & Psychotropics',
    drugThis: 'Fluoxetine 20mg Capsule',
    tallManThis: 'FLUoxetine',
    drugOther: 'Fluvoxamine 50mg / 100mg Tablet',
    tallManOther: 'fluvoxaMINE',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Both are SSRIs but have vastly different CYP450 enzyme interaction profiles and elimination half-lives (Fluoxetine half-life spans weeks; Fluvoxamine is a potent CYP1A2 inhibitor).',
    separationStrategy: 'Use TALL-MAN FLUoxetine vs fluvoxaMINE on bin labels.',
    fukkmGenericKeywords: ['fluoxetine', 'fluvoxamine'],
    keywordsThis: ['fluoxetine'],
    keywordsOther: ['fluvoxamine'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-035',
    category: 'CNS, Analgesics & Psychotropics',
    drugThis: 'Risperidone Tablet / Oral Solution',
    tallManThis: 'risperiDONE',
    drugOther: 'Ropinirole Tablet',
    tallManOther: 'roPINIRole',
    confusionType: 'sound-alike',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Risperidone is an atypical antipsychotic dopamine D2 antagonist, whereas Ropinirole is a dopamine agonist for Parkinson\'s disease. Administering Risperidone to a Parkinson\'s patient triggers acute parkinsonian crisis and sudden immobility.',
    separationStrategy: 'Segregate neurology Parkinson\'s medication shelving from psychiatric antipsychotics.',
    fukkmGenericKeywords: ['risperidone', 'ropinirole'],
    keywordsThis: ['risperidone'],
    keywordsOther: ['ropinirole'],
    isHAM: false,
    prescriberCategory: 'A/KK'
  },
  {
    id: 'LASA-KKM-036',
    category: 'CNS, Analgesics & Psychotropics',
    drugThis: 'Sertraline 50mg Tablet',
    tallManThis: 'SERTRALine',
    drugOther: 'Cetirizine 10mg Tablet',
    tallManOther: 'cetaRIZine',
    confusionType: 'sound-alike',
    riskLevel: 'MODERATE',
    clinicalRiskWarning: 'Cetirizine is an antihistamine for rhinitis/pruritus, whereas Sertraline is an SSRI antidepressant. Sound-alike confusion may cause allergic patients to inadvertently take psychiatric drugs for months.',
    separationStrategy: 'Double-check prescription at outpatient pharmacy dispensing counter.',
    fukkmGenericKeywords: ['sertraline', 'cetirizine'],
    keywordsThis: ['sertraline'],
    keywordsOther: ['cetirizine'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-037',
    category: 'CNS, Analgesics & Psychotropics',
    drugThis: 'Propranolol Hydrochloride Tablet',
    tallManThis: 'propranolol',
    drugOther: 'Propofol 1% 20mL / 50mL Emulsion for Injection',
    tallManOther: 'propofol',
    confusionType: 'sound-alike',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Propofol is an IV general anesthetic (induces coma/anesthesia). Mishearing verbal orders leads to catastrophic fatal events in operating theatres / intensive care.',
    separationStrategy: 'Verbal orders for Propofol are strictly prohibited except during emergency intubation resuscitation verified by an anesthesiologist.',
    packagingNotes: 'Propofol is a milky-white emulsion in glass ampoules/vials.',
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
    category: 'Endocrine, Diabetes & Steroids',
    drugThis: 'Actrapid HM (Human Soluble Short-Acting Insulin)',
    tallManThis: 'Actrapid (SHORT-acting)',
    drugOther: 'Insulatard HM (Human Isophane Intermediate-Acting Insulin)',
    tallManOther: 'Insulatard (INTERMEDIATE-acting)',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Actrapid is short-acting insulin for pre-meal boluses or IV sliding scale infusions. Insulatard is cloudy intermediate basal insulin. Inadvertently injecting Actrapid at Insulatard basal doses (e.g. 30 units) triggers profound hypoglycemia, irreversible brain damage, and death.',
    separationStrategy: 'Store in pharmacy/ward refrigerators in distinct color-coded baskets (Yellow for Actrapid, Green for Insulatard). Mandatory two-nurse double-check prior to injection.',
    packagingNotes: '10mL 100 IU/mL vials or Novo Nordisk Penfill cartridges with color-striped labels.',
    fukkmGenericKeywords: ['actrapid', 'insulatard', 'insulin'],
    keywordsThis: ['actrapid','insulin'],
    keywordsOther: ['insulatard'],
    isHAM: true,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-039',
    category: 'Endocrine, Diabetes & Steroids',
    drugThis: 'Mixtard 30 HM (30% Soluble + 70% Isophane Insulin)',
    tallManThis: 'Mixtard 30 (PREMIXED)',
    drugOther: 'Actrapid / Insulatard',
    tallManOther: 'Actrapid / Insulatard',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Mixtard 30 contains a fixed premixed formulation (30% rapid, 70% intermediate). STRICTLY PROHIBITED from IV Infusion.',
    separationStrategy: 'Emphasize "PREMIXED - SUBCUTANEOUS ONLY" labels on ward refrigerators.',
    fukkmGenericKeywords: ['mixtard'],
    keywordsThis: ['mixtard'],
    keywordsOther: ['actrapid'],
    isHAM: true,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-040',
    category: 'Endocrine, Diabetes & Steroids',
    drugThis: 'Humalog (Insulin Lispro Rapid-Acting)',
    tallManThis: 'Humalog (RAPID)',
    drugOther: 'Humalog Mix 25 / Humalog Mix 50',
    tallManOther: 'Humalog MIX (PREMIXED)',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Confusion between pure analog insulin and premixed (Mix) analogs frequently results in hazardous nocturnal hypoglycemia.',
    separationStrategy: 'Mandate verification of complete drug name including "MIX 25" or "RAPID" during dispensing.',
    fukkmGenericKeywords: ['humalog', 'lispro'],
    keywordsThis: ['humalog','lispro'],
    keywordsOther: ['humalog'],
    isHAM: true,
    prescriberCategory: 'A/KK'
  },
  {
    id: 'LASA-KKM-041',
    category: 'Endocrine, Diabetes & Steroids',
    drugThis: 'Glimepiride 2mg / 3mg / 4mg Tablet',
    tallManThis: 'glimiPIRIDE',
    drugOther: 'Glipizide / Glibenclamide (Glyburide)',
    tallManOther: 'glipiZIDE / glyBURIDE',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'These sulfonylureas have different potencies, durations, and dosages (Glibenclamide has prolonged half-life, causing protracted hypoglycemia, especially in elderly).',
    separationStrategy: 'Arrange boxes by strength with TALL-MAN labels at pharmacy counter.',
    fukkmGenericKeywords: ['glimepiride', 'glipizide', 'glibenclamide'],
    keywordsThis: ['glimepiride'],
    keywordsOther: ['glipizide','glibenclamide'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-042',
    category: 'Endocrine, Diabetes & Steroids',
    drugThis: 'Prednisone 5mg Tablet',
    tallManThis: 'predniSONE',
    drugOther: 'Prednisolone 5mg Tablet',
    tallManOther: 'prednisoLONE',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Prednisone is a prodrug requiring hepatic conversion to active Prednisolone. In severe hepatic impairment (cirrhosis/hepatitis), Prednisone conversion is compromised.',
    separationStrategy: 'MOH hospital formulary prioritizes oral Prednisolone to bypass hepatic activation requirement.',
    fukkmGenericKeywords: ['prednisone', 'prednisolone'],
    keywordsThis: ['prednisone'],
    keywordsOther: ['prednisolone'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-043',
    category: 'Endocrine, Diabetes & Steroids',
    drugThis: 'Propylthiouracil 50mg Tablet (PTU)',
    tallManThis: 'propylthiouracil (PTU)',
    drugOther: 'Carbimazole 5mg Tablet',
    tallManOther: 'carbimazole',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'PTU is preferred in first-trimester pregnancy (lower aplasia cutis risk vs carbimazole) and thyroid storm. In trimesters 2-3, Carbimazole is preferred due to PTU hepatotoxicity risks.',
    separationStrategy: 'Confirm gestational age of pregnant women before dispensing antithyroid medications.',
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
    category: 'Anticoagulants & Blood Products',
    drugThis: 'Heparin Sodium 25,000 IU/5mL Therapeutic Injection',
    tallManThis: 'HEPARIN Therapeutic (25,000 IU/5mL)',
    drugOther: 'Heparin Sodium Lock Flush 100 IU/mL / 500 IU/5mL',
    tallManOther: 'HEPARIN Lock Flush (100 IU/mL)',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Confusion between therapeutic-dose Heparin (5,000 IU/mL) and cannula flush Heparin (10-100 IU/mL) is one of the LEADING CAUSES OF FATALITY worldwide. Flushing IV cannulas with therapeutic Heparin causes fatal intracranial hemorrhage and massive internal bleeding.',
    separationStrategy: 'MOH WARDS ARE STRICTLY PROHIBITED FROM STORING CONCENTRATED HEPARIN 25,000 IU AS FLOOR STOCK. Only Heparin Lock Flush is permitted in general wards with distinct blue labels.',
    packagingNotes: '5mL glass vials with identical closure designs and clear liquid appearance.',
    fukkmGenericKeywords: ['heparin'],
    keywordsThis: ['heparin'],
    keywordsOther: ['heparin'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-045',
    category: 'Anticoagulants & Blood Products',
    drugThis: 'Warfarin Sodium 1mg / 2mg / 3mg / 5mg Tablet',
    tallManThis: 'WARFARIN',
    drugOther: 'Direct Oral Anticoagulants (DOACs - Rivaroxaban / Apixaban / Dabigatran)',
    tallManOther: 'DOACs (Rivaroxaban / Apixaban)',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Warfarin requires strict INR monitoring and has extensive food/drug interactions. Concurrent duplication with DOACs precipitates fatal gastrointestinal or intracranial hemorrhages.',
    separationStrategy: 'Utilize official color-coded tablets (Brown 1mg, Blue 2mg, Green 3mg, Pink 5mg) with mandatory counseling at Warfarin MTAC Clinic.',
    fukkmGenericKeywords: ['warfarin', 'rivaroxaban', 'apixaban', 'dabigatran'],
    keywordsThis: ['warfarin'],
    keywordsOther: ['rivaroxaban','apixaban','dabigatran'],
    isHAM: true,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-046',
    category: 'Anticoagulants & Blood Products',
    drugThis: 'Tranexamic Acid 500mg/5mL Injection',
    tallManThis: 'tranexamic ACID',
    drugOther: 'Vitamin K1 (Phytomenadione 10mg/mL Injection)',
    tallManOther: 'vitamin K1 (Phytomenadione)',
    confusionType: 'packaging',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Tranexamic Acid ampoules have historically been mistakenly injected intrathecally instead of spinal anesthetic Bupivacaine or Vitamin K in neonates, causing fatal refractory seizures and spinal cord necrosis (ISMP Alert).',
    separationStrategy: 'Segregate Tranexamic Acid ampoules inside closed red-marked containers in operating theatres and delivery suites.',
    packagingNotes: 'Clear 5mL glass ampoules easily confused in anesthesia medication trays.',
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
    category: 'Respiratory, Anaesthesia & Emergency',
    drugThis: 'Ephedrine Hydrochloride 30mg/mL Injection',
    tallManThis: 'EPHEDrine',
    drugOther: 'Epinephrine Hydrochloride (Adrenaline 1mg/mL 1:1000)',
    tallManOther: 'EPINEPHrine (Adrenaline)',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Epinephrine is a high-potency catecholamine (1mg/mL). Ephedrine has substantially lower potency (30mg/mL). Administering Epinephrine at Ephedrine dosages (e.g. 30mg instead of 0.5-1mg) causes fatal ventricular tachyarrhythmias, hypertensive crisis, intracranial hemorrhage, and instant cardiac arrest.',
    separationStrategy: 'Store Adrenaline inside dedicated red emergency resuscitation Cardiac Arrest Boxes with prominent large-print TALL-MAN labels.',
    packagingNotes: 'Clear 1mL glass ampoules by APPL Malaysia with near-identical appearance.',
    fukkmGenericKeywords: ['ephedrine', 'epinephrine', 'adrenaline'],
    keywordsThis: ['ephedrine'],
    keywordsOther: ['epinephrine','adrenaline'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-048',
    category: 'Respiratory, Anaesthesia & Emergency',
    drugThis: 'Atropine Sulphate 1mg/mL Injection',
    tallManThis: 'ATROPINE',
    drugOther: 'Atracurium Besylate 10mg/mL Injection (NMBA)',
    tallManOther: 'ATRACURIUM (Paralytic NMBA)',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Atracurium is a neuromuscular blocking paralytic agent (NMBA). Inadvertently injecting Atracurium into a conscious patient (instead of Atropine for bradycardia) precipitates COMPLETE RESPIRATORY PARALYSIS while fully awake, resulting in asphyxiation and death unless immediately intubated.',
    separationStrategy: 'Store Atracurium in Operating Theatre (OT) refrigerators only, labeled with RED warning: "PARALYZING AGENT - WARD STOCK STRICTLY PROHIBITED". Prohibited from general wards.',
    packagingNotes: 'Both packaged in 1mL/2.5mL glass ampoules.',
    fukkmGenericKeywords: ['atropine', 'atracurium'],
    keywordsThis: ['atropine'],
    keywordsOther: ['atracurium'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-049',
    category: 'Respiratory, Anaesthesia & Emergency',
    drugThis: 'Rocuronium Bromide Injection',
    tallManThis: 'rocuronium (ROCURONIUM)',
    drugOther: 'Vecuronium Bromide / Pancuronium',
    tallManOther: 'vecuronium / pancuronium',
    confusionType: 'sound-alike',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'All neuromuscular paralytic agents possess differing onset and duration profiles (Rocuronium has rapid onset for RSI; Pancuronium has very prolonged duration).',
    separationStrategy: 'Anesthesia refrigerators must have dedicated trays marked "WARNING: PARALYZING AGENT".',
    fukkmGenericKeywords: ['rocuronium', 'vecuronium', 'pancuronium'],
    keywordsThis: ['rocuronium'],
    keywordsOther: ['vecuronium','pancuronium'],
    isHAM: true,
    prescriberCategory: 'A*'
  },
  {
    id: 'LASA-KKM-050',
    category: 'Respiratory, Anaesthesia & Emergency',
    drugThis: 'Salbutamol Inhaler / Respirator Solution',
    tallManThis: 'salBUTamol',
    drugOther: 'Salmeterol Xinafoate Inhaler',
    tallManOther: 'salMETERol',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Salbutamol is a rapid-onset SABA (emergency reliever for acute asthma attacks). Salmeterol is a delayed-onset LABA (long-acting maintenance controller). Using Salmeterol during an acute asthma attack is life-threatening as it does NOT rapidly relieve acute bronchospasm.',
    separationStrategy: 'Label Salbutamol as "EMERGENCY RELIEVER" and Salmeterol as "MAINTENANCE CONTROLLER".',
    fukkmGenericKeywords: ['salbutamol', 'salmeterol'],
    keywordsThis: ['salbutamol'],
    keywordsOther: ['salmeterol'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-051',
    category: 'Respiratory, Anaesthesia & Emergency',
    drugThis: 'Aminophylline Injection 250mg/10mL',
    tallManThis: 'aminophylline (IV)',
    drugOther: 'Theophylline Sustained Release Tablet',
    tallManOther: 'theophylline (Oral SR)',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Aminophylline contains approximately 80% theophylline. Therapeutic index is extremely narrow (10-20 mcg/mL). Overdose causes intractable ventricular arrhythmias and refractory seizures.',
    separationStrategy: 'Therapeutic drug monitoring (TDM) is mandatory during continuous IV infusions in ICU/HDU.',
    fukkmGenericKeywords: ['aminophylline', 'theophylline'],
    keywordsThis: ['aminophylline'],
    keywordsOther: ['theophylline'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-052',
    category: 'Respiratory, Anaesthesia & Emergency',
    drugThis: 'Fentanyl Citrate Injection 100mcg/2mL',
    tallManThis: 'FENTanyl',
    drugOther: 'Sufentanil Citrate 50mcg/mL / Alfentanil',
    tallManOther: 'SUFentanil / ALfentanil',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Sufentanil is 5 to 10 TIMES MORE POTENT than Fentanyl. Dosing error causes immediate respiratory arrest and wooden chest syndrome.',
    separationStrategy: 'Store inside Operating Theatre Dangerous Drugs (DD) safe with individual register logs.',
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
    category: 'Electrolytes, Ophthalmic & Packaging',
    drugThis: 'Potassium Chloride 1g/10mL (KCl Concentrate Ampoule)',
    tallManThis: 'POTASSIUM Chloride 13.4mmol (KCl)',
    drugOther: 'Sodium Chloride 0.9% 10mL Plastic Ampoule / Water for Injection',
    tallManOther: 'SODIUM Chloride 0.9% / WFI',
    confusionType: 'packaging',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Concentrated 10mL plastic KCl ampoules share identical shape and size with Normal Saline 0.9% and Water for Injection (WFI). Inadvertently grabbing KCl to dilute IV medications and injecting as an IV bolus triggers IMMEDIATE ASYSTOLIC CARDIAC ARREST AND DEATH.',
    separationStrategy: 'STRICTLY PROHIBITED AS WARD FLOOR STOCK. KCl stored in pharmacy/ICU only with prominent red auxiliary labels: "HIGH ALERT - MUST DILUTE - FATAL IF INJECTED DIRECTLY".',
    packagingNotes: '10mL polyethylene plastic ampoules manufactured by B.Braun / Ain Medicare / Pharmaniaga.',
    fukkmGenericKeywords: ['potassium chloride'],
    keywordsThis: ['potassium chloride'],
    keywordsOther: ['sodium'],
    isHAM: true,
    prescriberCategory: 'A'
  },
  {
    id: 'LASA-KKM-054',
    category: 'Electrolytes, Ophthalmic & Packaging',
    drugThis: 'Calcium Gluconate 10% 10mL Injection',
    tallManThis: 'calcium GLUCONATE 10%',
    drugOther: 'Calcium Chloride 10% 10mL Injection',
    tallManOther: 'calcium CHLORIDE 10%',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Calcium Chloride contains APPROXIMATELY 3 TIMES THE ELEMENTAL CALCIUM CONTENT of Calcium Gluconate (27.2mg/mL vs 9.3mg/mL elemental Ca²⁺). Calcium Chloride causes severe tissue necrosis if extravasated and must not be administered peripherally without strict precautions.',
    separationStrategy: 'Use Calcium Gluconate as primary ward resuscitation stock; reserve Calcium Chloride for cardiac surgical emergencies.',
    fukkmGenericKeywords: ['calcium gluconate', 'calcium chloride'],
    keywordsThis: ['calcium gluconate'],
    keywordsOther: ['calcium chloride'],
    isHAM: true,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-055',
    category: 'Electrolytes, Ophthalmic & Packaging',
    drugThis: 'Acetazolamide 250mg Tablet',
    tallManThis: 'acetaZOLAMIDE',
    drugOther: 'Acetohexamide Tablet',
    tallManOther: 'acetoHEXAMIDE',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Acetazolamide is a carbonic anhydrase inhibitor for acute glaucoma, whereas Acetohexamide is a sulfonylurea antidiabetic. Confusion precipitates profound hypoglycemia or uncontrolled intraocular pressure spikes.',
    separationStrategy: 'Segregate ophthalmology shelving from endocrine medication storage.',
    fukkmGenericKeywords: ['acetazolamide'],
    keywordsThis: ['acetazolamide'],
    keywordsOther: ['acetohexamide'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-056',
    category: 'Electrolytes, Ophthalmic & Packaging',
    drugThis: 'Timolol Maleate 0.5% Eye Drops',
    tallManThis: 'TIMOLOL Eye Drops',
    drugOther: 'Tobramycin 0.3% Eye Drops / Travoprost',
    tallManOther: 'TOBRAMYCIN Eye Drops',
    confusionType: 'packaging',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Timolol is a topical beta-blocker (can be systemically absorbed, triggering severe bradycardia and bronchospasm in asthmatics). Tobramycin is an aminoglycoside antibiotic. These 5mL white plastic dropper bottles appear nearly identical.',
    separationStrategy: 'Verify international ophthalmic bottle cap color codes (Yellow/Blue for Timolol; Tan/Grey for Antibiotics).',
    packagingNotes: '5mL plastic dropper bottles with identical physical profile.',
    fukkmGenericKeywords: ['timolol', 'tobramycin'],
    keywordsThis: ['timolol'],
    keywordsOther: ['tobramycin'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-057',
    category: 'Electrolytes, Ophthalmic & Packaging',
    drugThis: 'Dexamethasone Eye Drops',
    tallManThis: 'DEXAMETHASONE Eye Drops',
    drugOther: 'Gentamicin Eye Drops',
    tallManOther: 'GENTAMICIN Eye Drops',
    confusionType: 'packaging',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Administering steroid Dexamethasone in undiagnosed corneal herpes simplex infection or bacterial ulcers without antimicrobial coverage triggers corneal perforation and permanent blindness.',
    separationStrategy: 'Mandatory slit-lamp examination by medical officer prior to prescribing ophthalmic corticosteroids.',
    packagingNotes: '5mL dropper bottles.',
    fukkmGenericKeywords: ['dexamethasone', 'gentamicin'],
    keywordsThis: ['dexamethasone'],
    keywordsOther: ['gentamicin'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-058',
    category: 'Cardiovascular & Inotropes',
    drugThis: 'Carvedilol Tablet',
    tallManThis: 'carvedilol (CARVEDILOL)',
    drugOther: 'Captopril Tablet',
    tallManOther: 'captopril (CAPTOPRIL)',
    confusionType: 'sound-alike',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Carvedilol is a non-selective beta/alpha-1 blocker, whereas Captopril is a short-acting ACE inhibitor. Shared "Ca-" prefix confusion disrupts heart failure titration regimens.',
    separationStrategy: 'Physical segregation of bins in outpatient pharmacy dispensing drawers.',
    fukkmGenericKeywords: ['carvedilol', 'captopril'],
    keywordsThis: ['carvedilol'],
    keywordsOther: ['captopril'],
    isHAM: false,
    prescriberCategory: 'B'
  },
  {
    id: 'LASA-KKM-059',
    category: 'Antimicrobial & Cephalosporins',
    drugThis: 'Lamivudine 150mg / 300mg Tablet (3TC)',
    tallManThis: 'lamiVUDine',
    drugOther: 'Lamotrigine Tablet',
    tallManOther: 'lamoTRIGine',
    confusionType: 'both',
    riskLevel: 'HIGH',
    clinicalRiskWarning: 'Lamivudine is an antiviral for HIV and Hepatitis B, whereas Lamotrigine is an antiepileptic (severe Stevens-Johnson Syndrome risk if titrated rapidly).',
    separationStrategy: 'Store Lamivudine in dedicated Infectious Disease / HIV pharmacy stock with specialized patient counseling.',
    fukkmGenericKeywords: ['lamivudine', 'lamotrigine'],
    keywordsThis: ['lamivudine'],
    keywordsOther: ['lamotrigine'],
    isHAM: false,
    prescriberCategory: 'A'
  },
  {
    id: 'LASA-KKM-060',
    category: 'Oncology & Cytotoxics',
    drugThis: 'Infliximab 100mg Injection',
    tallManThis: 'inFLIXimab',
    drugOther: 'Rituximab 100mg / 500mg Injection',
    tallManOther: 'riTUXimab',
    confusionType: 'both',
    riskLevel: 'CRITICAL',
    clinicalRiskWarning: 'Infliximab is an anti-TNF alpha monoclonal antibody for autoimmune disease (Crohn\'s/Arthritis), whereas Rituximab is an anti-CD20 antibody for lymphoma and leukemia. Both are high-cost biologics with distinct infusion reaction profiles and indications.',
    separationStrategy: 'Store in 2-8°C biologics refrigerator with indication endorsement by hematologist/rheumatologist.',
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
    'All Categories',
    'Cardiovascular & Inotropes',
    'Antimicrobial & Cephalosporins',
    'Oncology & Cytotoxics',
    'CNS, Analgesics & Psychotropics',
    'Endocrine, Diabetes & Steroids',
    'Anticoagulants & Blood Products',
    'Respiratory, Anaesthesia & Emergency',
    'Electrolytes, Ophthalmic & Packaging'
  ]
}
