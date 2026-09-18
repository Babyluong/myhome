import { NAGCategoryMetadata } from '../types/formulariTypes'

export const NAG_ADULT_CATEGORIES_METADATA: NAGCategoryMetadata[] = [
  {
    code: 'A1',
    title: 'Cardiovascular Infections',
    fullLabel: 'A1 : Cardiovascular Infections',
    icon: '❤️',
    population: 'Adult',
    topics: [
      { number: 1, title: '1. INFECTIVE ENDOCARDITIS', description: 'Native valve empiric & targeted, prosthetic valve (early & late), and culture-negative endocarditis' },
      { number: 2, title: '2. CATHETER RELATED INFECTIONS', description: 'Catheter-related bloodstream infections (CRBSI), non-tunneled & tunneled central venous catheter infections, hemodialysis access infections' },
      { number: 3, title: '3. TREATMENT OF CARDIAC IMPLANTABLE ELECTRONIC DEVICES (CIED) INFECTIONS', description: 'Generator pocket infection, pacemaker lead-associated endocarditis, and device extraction guidance' }
    ]
  },
  {
    code: 'A2',
    title: 'Central Nervous Infections',
    fullLabel: 'A2 : Central Nervous Infections',
    icon: '🧠',
    population: 'Adult',
    topics: [
      { number: 1, title: '1. ACUTE BACTERIAL MENINGITIS', description: 'Community-acquired acute bacterial meningitis and healthcare-associated post-neurosurgical meningitis' },
      { number: 2, title: '2. BRAIN ABSCESS & SUBDURAL EMPYEMA', description: 'Otogenic, sinus-derived, post-neurosurgical and metastatic brain abscess' },
      { number: 3, title: '3. VIRAL ENCEPHALITIS & CRYPTOCOCCAL MENINGITIS', description: 'Herpes Simplex encephalitis, Varicella Zoster, Cryptococcal meningitis in HIV / non-HIV' }
    ]
  },
  {
    code: 'A3',
    title: 'Chemoprophylaxis',
    fullLabel: 'A3 : Chemoprophylaxis',
    icon: '🛡️',
    population: 'Adult',
    topics: [
      { number: 1, title: '1. SURGICAL ANTIMICROBIAL PROPHYLAXIS (SAP)', description: 'Pre-operative single-dose prophylaxis for clean-contaminated and high-risk surgical procedures' },
      { number: 2, title: '2. MEDICAL CHEMOPROPHYLAXIS', description: 'Meningococcal disease close contacts, pertussis exposure, asplenia / post-splenectomy, and rheumatic fever prevention' }
    ]
  },
  {
    code: 'A4',
    title: 'Gastrointestinal Infections',
    fullLabel: 'A4 : Gastrointestinal Infections',
    icon: '🍽️',
    population: 'Adult',
    topics: [
      { number: 1, title: '1. ACUTE GASTROENTERITIS & INFECTIOUS DIARRHOEA', description: 'Severe acute invasive bacterial diarrhoea, shigellosis, salmonellosis, and cholera' },
      { number: 2, title: '2. CLOSTRIDIOIDES DIFFICILE INFECTION (CDI)', description: 'Initial non-severe, severe, fulminant, and recurrent Clostridioides difficile colitis' },
      { number: 3, title: '3. INTRA-ABDOMINAL INFECTIONS', description: 'Community & hospital-acquired peritonitis, acute cholecystitis/cholangitis, appendicitis, and pyogenic liver abscess' },
      { number: 4, title: '4. HELICOBACTER PYLORI ERADICATION', description: 'Standard high-dose dual, triple therapy, and bismuth-based quadruple eradication regimens' }
    ]
  },
  {
    code: 'A5',
    title: 'Infections In Immunocompromised Patients',
    fullLabel: 'A5 : Infections In Immunocompromised Patients',
    icon: '🧬',
    population: 'Adult',
    topics: [
      { number: 1, title: '1. FEBRILE NEUTROPENIA', description: 'High-risk vs low-risk MASCC score febrile neutropenia in post-chemotherapy and haematology patients' },
      { number: 2, title: '2. PNEUMOCYSTIS JIROVECII PNEUMONIA (PJP)', description: 'Treatment of moderate-to-severe PJP and primary/secondary prophylaxis' },
      { number: 3, title: '3. INVASIVE FUNGAL INFECTIONS', description: 'Invasive candidiasis, candidemia, invasive pulmonary aspergillosis, and cryptococcosis' }
    ]
  },
  {
    code: 'A6',
    title: 'Obstetrics & Gynaecological Infections',
    fullLabel: 'A6 : Obstetrics & Gynaecological Infections',
    icon: '🤰',
    population: 'Adult',
    topics: [
      { number: 1, title: '1. PELVIC INFLAMMATORY DISEASE (PID)', description: 'Outpatient mild-to-moderate PID and severe inpatient parenteral regimens' },
      { number: 2, title: '2. POSTPARTUM ENDOMETRITIS & CHORIOAMNIONITIS', description: 'Post-caesarean endometritis, intra-amniotic infection syndrome, and septic abortion' },
      { number: 3, title: '3. MASTITIS & BREAST ABSCESS', description: 'Lactational mastitis, staphylococcal breast abscess, and milk expression protocols' },
      { number: 4, title: '4. VULVOVAGINAL INFECTIONS', description: 'Bacterial vaginosis, trichomoniasis, and vulvovaginal candidiasis in pregnancy' }
    ]
  },
  {
    code: 'A7',
    title: 'Ocular Infections',
    fullLabel: 'A7 : Ocular Infections',
    icon: '👁️',
    population: 'Adult',
    topics: [
      { number: 1, title: '1. BACTERIAL CONJUNCTIVITIS & OPHTHALMIA', description: 'Acute purulent conjunctivitis, contact lens associated kerato-conjunctivitis' },
      { number: 2, title: '2. MICROBIAL KERATITIS & CORNEAL ULCER', description: 'Bacterial keratitis (Pseudomonas/Staph), fungal keratitis, and fortified topical drops' },
      { number: 3, title: '3. ENDOPHTHALMITIS', description: 'Post-cataract surgery, post-traumatic, and endogenous metastatic endophthalmitis (intravitreal injections)' },
      { number: 4, title: '4. ORBITAL & PRESEPTAL CELLULITIS', description: 'Preseptal superficial cellulitis vs true post-septal orbital cellulitis' }
    ]
  },
  {
    code: 'A8',
    title: 'Oral / Dental Infections',
    fullLabel: 'A8 : Oral / Dental Infections',
    icon: '🦷',
    population: 'Adult',
    topics: [
      { number: 1, title: '1. ODONTOGENIC ABSCESS & DEEP FASCIAL INFECTIONS', description: 'Periapical abscess, canine space, submandibular space abscess and Ludwig\'s angina' },
      { number: 2, title: '2. ACUTE NECROTIZING ULCERATIVE GINGIVITIS (ANUG)', description: 'Vincent\'s angina, pericoronitis, and severe periodontal disease' }
    ]
  },
  {
    code: 'A9',
    title: 'Orthopaedic Infections',
    fullLabel: 'A9 : Orthopaedic Infections',
    icon: '🦴',
    population: 'Adult',
    topics: [
      { number: 1, title: '1. ACUTE & CHRONIC OSTEOMYELITIS', description: 'Hematogenous osteomyelitis, direct inoculation, diabetic foot osteomyelitis, and sequestrum management' },
      { number: 2, title: '2. SEPTIC ARTHRITIS', description: 'Native joint acute purulent arthritis, gonococcal arthritis, and surgical arthrotomy/lavage' },
      { number: 3, title: '3. PROSTHETIC JOINT INFECTION (PJI)', description: 'Early post-operative, delayed, and late hematogenous PJI (DAIR vs two-stage revision)' }
    ]
  },
  {
    code: 'A10',
    title: 'Otorhinolaryngology Infections',
    fullLabel: 'A10 : Otorhinolaryngology Infections',
    icon: '👂',
    population: 'Adult',
    topics: [
      { number: 1, title: '1. ACUTE OTITIS MEDIA & MASTOIDITIS', description: 'Suppurative AOM, tympanic perforation, and acute coalescent mastoiditis' },
      { number: 2, title: '2. OTITIS EXTERNA & MALIGNANT OTITIS EXTERNA', description: 'Acute diffuse swimmer\'s ear and necrotising Pseudomonas malignant otitis externa in diabetes' },
      { number: 3, title: '3. ACUTE RHINOSINUSITIS & PERITONSILLAR ABSCESS (QUINSY)', description: 'Severe bacterial rhinosinusitis, peritonsillar abscess, and drainage protocols' },
      { number: 4, title: '4. EPIGLOTTITIS & DEEP NECK SPACE INFECTIONS', description: 'Acute adult epiglottitis, parapharyngeal, and retropharyngeal abscess' }
    ]
  },
  {
    code: 'A11',
    title: 'Respiratory Infections',
    fullLabel: 'A11 : Respiratory Infections',
    icon: '🫁',
    population: 'Adult',
    topics: [
      { number: 1, title: '1. COMMUNITY ACQUIRED PNEUMONIA (CAP)', description: 'Mild outpatient (CURB-65 0-1), moderate inpatient (CURB-65 2), and severe ICU CAP (CURB-65 ≥3)' },
      { number: 2, title: '2. VIRAL PNEUMONIA', description: 'Severe influenza pneumonia, viral respiratory illness, and secondary bacterial pneumonia co-infection' },
      { number: 3, title: '3. LUNG ABSCESS AND EMPYEMA', description: 'Parapneumonic effusion, empyema thoracis, anaerobic cavitary lung abscess, and chest tube drainage' },
      { number: 4, title: '4. INFECTIVE EXACERBATION OF CHRONIC OBSTRUCTIVE PULMONARY DISEASE (COPD)', description: 'Anthonisen Type 1/2 acute exacerbations, acute bronchitis, and chronic Pseudomonas bronchiectasis' },
      { number: 5, title: '5. HOSPITAL ACQUIRED PNEUMONIA (HAP/VAP)', description: 'Early-onset vs late-onset nosocomial HAP/VAP with MDR risk factors (Pseudomonas, Acinetobacter, MRSA)' },
      { number: 6, title: '6. ASPIRATION PNEUMONIA', description: 'Chemical aspiration pneumonitis supportive care vs secondary bacterial anaerobic aspiration pneumonia' }
    ]
  },
  {
    code: 'A12',
    title: 'Sepsis',
    fullLabel: 'A12 : Sepsis',
    icon: '⚡',
    population: 'Adult',
    topics: [
      { number: 1, title: '1. SEPSIS & SEPTIC SHOCK OF UNKNOWN ORIGIN', description: 'Empiric broad-spectrum coverage within the 1-hour Golden Bundle window (Surviving Sepsis Campaign)' },
      { number: 2, title: '2. NEUTROPENIC SEPSIS', description: 'Gram-negative bacteremia, Pseudomonas coverage, and early antifungal escalation in prolonged fever' },
      { number: 3, title: '3. UROSEPSIS & BILIARY SEPSIS', description: 'Severe bacteremic pyelonephritis, obstructive cholangitis, and urgent decompression source control' }
    ]
  },
  {
    code: 'A13',
    title: 'Sexually Transmitted Infections',
    fullLabel: 'A13 : Sexually Transmitted Infections',
    icon: '🔬',
    population: 'Adult',
    topics: [
      { number: 1, title: '1. GONOCOCCAL INFECTIONS', description: 'Uncomplicated anogenital gonorrhoea, pharyngeal gonorrhoea, and disseminated gonococcal infection' },
      { number: 2, title: '2. NON-GONOCOCCAL URETHRITIS & CHLAMYDIA', description: 'Chlamydia trachomatis urethritis/cervicitis, Mycoplasma genitalium, and partner notification' },
      { number: 3, title: '3. SYPHILIS', description: 'Primary, secondary, early/late latent syphilis, and neurosyphilis benzathine penicillin regimens' },
      { number: 4, title: '4. GENITAL HERPES & ULCERATIVE STI', description: 'Herpes simplex virus (HSV-1 / HSV-2) primary & recurrent episodes, and chancroid' }
    ]
  },
  {
    code: 'A14',
    title: 'Skin & Soft Tissue Infections',
    fullLabel: 'A14 : Skin & Soft Tissue Infections',
    icon: '🩹',
    population: 'Adult',
    topics: [
      { number: 1, title: '1. MILD & MODERATE SSTI', description: 'Folliculitis, furuncles, carbuncles, impetigo, and incision/drainage principles' },
      { number: 2, title: '2. CELLULITIS & ERYSIPELAS', description: 'Non-purulent vs purulent cellulitis, lower limb erysipelas, and limb elevation' },
      { number: 3, title: '3. NECROTISING FASCIITIS & GAS GANGRENE', description: 'Type I polymicrobial, Type II Group A Strep, clostridial myonecrosis, and emergent debridement' },
      { number: 4, title: '4. DIABETIC FOOT ULCERS & SURGICAL SITE INFECTIONS', description: 'Moderate-to-severe limb-threatening DFU, deep tissue biopsy, and post-op wound infections' },
      { number: 5, title: '5. ANIMAL & HUMAN BITES', description: 'Cat bites (Pasteurella), dog bites (Capnocytophaga), human bites (Eikenella) and rabies/tetanus prophylaxis' }
    ]
  },
  {
    code: 'A15',
    title: 'Trauma Related Infections',
    fullLabel: 'A15 : Trauma Related Infections',
    icon: '🚑',
    population: 'Adult',
    topics: [
      { number: 1, title: '1. OPEN FRACTURES (GUSTILO-ANDERSON GRADE I - III)', description: 'Grade I, II, IIIA, IIIB, IIIC open fractures with soil contamination and immediate surgical debridement' },
      { number: 2, title: '2. PENETRATING CNS & HEAD TRAUMA', description: 'Open skull fractures, CSF leak, penetrating brain injury, and post-traumatic meningitis prophylaxis' },
      { number: 3, title: '3. PENETRATING ABDOMINAL & THORACIC TRAUMA', description: 'Gunshot/stab wounds with hollow viscus injury, traumatic hemothorax, and chest tube prophylaxis' },
      { number: 4, title: '4. BURN WOUND INFECTIONS & SEPSIS', description: 'Severe thermal burns, Pseudomonas/MRSA colonisation, silver dressings, and systemic sepsis' }
    ]
  },
  {
    code: 'A16',
    title: 'Tropical Infections',
    fullLabel: 'A16 : Tropical Infections',
    icon: '🌴',
    population: 'Adult',
    topics: [
      { number: 1, title: '1. LEPTOSPIROSIS', description: 'Mild anicteric leptospirosis vs severe icteric Weil\'s disease (pulmonary hemorrhage, acute renal failure)' },
      { number: 2, title: '2. MELIOIDOSIS', description: 'Burkholderia pseudomallei acute intensive parenteral phase (Ceftazidime/Meropenem) and oral eradication phase (Bactrim)' },
      { number: 3, title: '3. ENTERIC / TYPHOID FEVER', description: 'Salmonella enterica serovar Typhi/Paratyphi uncomplicated vs severe bacteremic enteric fever' },
      { number: 4, title: '4. RICKETTSIAL INFECTIONS & SCRUB TYPHUS', description: 'Orientia tsutsugamushi (scrub typhus), murine typhus, and eschar presentation' },
      { number: 5, title: '5. MALARIA', description: 'Plasmodium falciparum, vivax, knowlesi, uncomplicated oral artemisinin-combination therapy (ACT) and severe IV Artesunate' }
    ]
  },
  {
    code: 'A17',
    title: 'Urinary Tract Infections',
    fullLabel: 'A17 : Urinary Tract Infections',
    icon: '💧',
    population: 'Adult',
    topics: [
      { number: 1, title: '1. ACUTE UNCOMPLICATED CYSTITIS', description: 'Healthy non-pregnant women with dysuria, frequency, urgency (Nitrofurantoin / Fosfomycin)' },
      { number: 2, title: '2. ACUTE PYELONEPHRITIS', description: 'Community-acquired acute uncomplicated pyelonephritis vs inpatient parenteral Ceftriaxone/Ciprofloxacin' },
      { number: 3, title: '3. COMPLICATED UTI & CAUTI', description: 'Men, pregnancy, indwelling urinary catheters, urolithiasis, and multidrug-resistant pathogens' },
      { number: 4, title: '4. ACUTE PROSTATITIS & EPIDIDYMO-ORCHITIS', description: 'Acute bacterial prostatitis (fluoroquinolones/Bactrim prolonged penetration) and acute epididymitis' }
    ]
  }
]

export const NAG_PAED_CATEGORIES_METADATA: NAGCategoryMetadata[] = [
  {
    code: 'B1',
    title: 'Cardiovascular Infections',
    fullLabel: 'B1: Cardiovascular Infections',
    icon: '❤️',
    population: 'Paediatric',
    topics: [
      { number: 1, title: '1. PAEDIATRIC INFECTIVE ENDOCARDITIS', description: 'Native & congenital heart disease endocarditis empiric and targeted regimens in children' },
      { number: 2, title: '2. ACUTE RHEUMATIC FEVER & CARDITIS', description: 'Acute Group A Streptococcal rheumatic fever and secondary penicillin prophylaxis protocols' },
      { number: 3, title: '3. KAWASAKI DISEASE PROTOCOL', description: 'IV Immunoglobulin (IVIG) 2g/kg + High-dose Aspirin anti-inflammatory regimen' }
    ]
  },
  {
    code: 'B2',
    title: 'Central Nervous Infections',
    fullLabel: 'B2: Central Nervous Infections',
    icon: '🧠',
    population: 'Paediatric',
    topics: [
      { number: 1, title: '1. ACUTE BACTERIAL MENINGITIS IN INFANTS & CHILDREN', description: 'High-dose IV Cefotaxime/Ceftriaxone + IV Vancomycin (if pneumococcal resistance) and Dexamethasone' },
      { number: 2, title: '2. VIRAL ENCEPHALITIS IN CHILDREN', description: 'High-dose IV Acyclovir for suspected HSV / VZV encephalitis in paediatric patients' },
      { number: 3, title: '3. PAEDIATRIC BRAIN ABSCESS & SUBDURAL EMPYEMA', description: 'Otogenic, sinus-derived and cyanotic heart disease related brain abscess in children' }
    ]
  },
  {
    code: 'B3',
    title: 'Chemoprophylaxis',
    fullLabel: 'B3: Chemoprophylaxis',
    icon: '🛡️',
    population: 'Paediatric',
    topics: [
      { number: 1, title: '1. PAEDIATRIC SURGICAL PROPHYLAXIS (SAP)', description: 'Pre-operative single-dose prophylaxis for paediatric surgical and dental procedures' },
      { number: 2, title: '2. MEDICAL CHEMOPROPHYLAXIS IN CHILDREN', description: 'Meningococcal contact, pertussis exposure, post-splenectomy / asplenia, and rheumatic fever prevention' }
    ]
  },
  {
    code: 'B4',
    title: 'Gastrointestinal Infections',
    fullLabel: 'B4: Gastrointestinal Infections',
    icon: '🍽️',
    population: 'Paediatric',
    topics: [
      { number: 1, title: '1. PAEDIATRIC ACUTE GASTROENTERITIS & DYSENTERY', description: 'Oral rehydration focus, Azithromycin / IV Ceftriaxone for severe bloody diarrhoea (Shigella/Salmonella)' },
      { number: 2, title: '2. PAEDIATRIC APPENDICITIS & PERITONITIS', description: 'IV Ampicillin + Gentamicin + Metronidazole or IV Co-Amoxiclav for intra-abdominal sepsis' },
      { number: 3, title: '3. BILIARY TRACT INFECTIONS IN CHILDREN', description: 'Post-Kasai cholangitis in biliary atresia and pyogenic liver abscess' }
    ]
  },
  {
    code: 'B5',
    title: 'Infections In Immunocompromised Patients',
    fullLabel: 'B5: Infections In Immunocompromised Patients',
    icon: '🧬',
    population: 'Paediatric',
    topics: [
      { number: 1, title: '1. PAEDIATRIC FEBRILE NEUTROPENIA', description: 'High-risk empirical antipseudomonal monotherapy (IV Cefepime / Piperacillin-Tazobactam / Meropenem)' },
      { number: 2, title: '2. PAEDIATRIC PNEUMOCYSTIS JIROVECII PNEUMONIA (PJP)', description: 'IV/Oral Co-Trimoxazole (Bactrim) weight-based treatment and primary/secondary prophylaxis' },
      { number: 3, title: '3. INVASIVE FUNGAL INFECTIONS IN CHILDREN', description: 'Invasive candidiasis and pulmonary aspergillosis (Fluconazole, Caspofungin, Liposomal Amphotericin B)' }
    ]
  },
  {
    code: 'B6',
    title: 'Neonatal Infections',
    fullLabel: 'B6: Neonatal Infections',
    icon: '👶',
    population: 'Paediatric',
    topics: [
      { number: 1, title: '1. EARLY-ONSET NEONATAL SEPSIS (EONS <72 HOURS)', description: 'Empiric IV Penicillin G / Ampicillin + IV Gentamicin (Group B Strep & Listeria coverage)' },
      { number: 2, title: '2. LATE-ONSET NEONATAL SEPSIS (LONS ≥72 HOURS)', description: 'IV Cloxacillin + IV Amikacin/Gentamicin or IV Vancomycin (if CoNS / MRSA suspected)' },
      { number: 3, title: '3. NEONATAL MENINGITIS', description: 'High-dose IV Ampicillin + IV Cefotaxime (avoid Ceftriaxone in neonates due to kernicterus risk)' },
      { number: 4, title: '4. CONGENITAL SYPHILIS & TORCH INFECTIONS', description: 'IV Aqueous Benzylpenicillin or IM Procaine Penicillin G for asymptomatic and symptomatic neonates' }
    ]
  },
  {
    code: 'B7',
    title: 'Ocular Infections',
    fullLabel: 'B7: Ocular Infections',
    icon: '👁️',
    population: 'Paediatric',
    topics: [
      { number: 1, title: '1. OPHTHALMIA NEONATORUM (NEONATAL CONJUNCTIVITIS)', description: 'Chlamydia trachomatis (Oral Erythromycin/Azithromycin) vs Neisseria gonorrhoeae (IM Ceftriaxone stat)' },
      { number: 2, title: '2. PAEDIATRIC BACTERIAL KERATITIS & CORNEAL ULCER', description: 'Broad-spectrum topical fluoroquinolones and fortified ophthalmic drops in children' },
      { number: 3, title: '3. PRESEPTAL & ORBITAL CELLULITIS IN CHILDREN', description: 'Preseptal (Oral/IV Co-Amoxiclav) vs Post-septal orbital cellulitis (IV Cefotaxime + IV Cloxacillin)' }
    ]
  },
  {
    code: 'B8',
    title: 'Orthopaedic Infections',
    fullLabel: 'B8: Orthopaedic Infections',
    icon: '🦴',
    population: 'Paediatric',
    topics: [
      { number: 1, title: '1. PAEDIATRIC ACUTE HEMATOGENOUS OSTEOMYELITIS', description: 'High-dose IV Cloxacillin or IV Cefazolin with early step-down to high-dose oral therapy' },
      { number: 2, title: '2. PAEDIATRIC SEPTIC ARTHRITIS', description: 'Urgent needle aspiration / arthrotomy decompression and anti-staphylococcal/streptococcal therapy' },
      { number: 3, title: '3. KINGELLA KINGAE INFECTIONS IN TODDLERS', description: 'Bone and joint infections in children under 4 years (IV/Oral Ampicillin, Cefuroxime)' }
    ]
  },
  {
    code: 'B9',
    title: 'Otorhinolaryngology Infections',
    fullLabel: 'B9: Otorhinolaryngology Infections',
    icon: '👂',
    population: 'Paediatric',
    topics: [
      { number: 1, title: '1. PAEDIATRIC ACUTE OTITIS MEDIA (AOM)', description: 'High-dose oral Amoxicillin 80-90 mg/kg/day divided BD/TDS for S. pneumoniae coverage' },
      { number: 2, title: '2. ACUTE MASTOIDITIS IN CHILDREN', description: 'IV Co-Amoxiclav or IV Ceftriaxone + urgent ENT surgical consultation' },
      { number: 3, title: '3. ACUTE STREPTOCOCCAL TONSILLOPHARYNGITIS', description: 'Oral Penicillin V or Oral Amoxicillin x 10 days to eradicate Group A Strep and prevent Rheumatic Fever' },
      { number: 4, title: '4. CROUP & ACUTE EPIGLOTTITIS', description: 'Viral croup (dexamethasone/adrenaline) vs Bacterial epiglottitis (IV Ceftriaxone + airway protection)' }
    ]
  },
  {
    code: 'B10',
    title: 'Respiratory Infections',
    fullLabel: 'B10: Respiratory Infections',
    icon: '🫁',
    population: 'Paediatric',
    topics: [
      { number: 1, title: '1. PAEDIATRIC COMMUNITY-ACQUIRED PNEUMONIA (CAP)', description: 'Outpatient oral high-dose amoxicillin vs inpatient parenteral ampicillin/penicillin crystal' },
      { number: 2, title: '2. COMPLICATED PNEUMONIA & EMPYEMA THORACIS', description: 'Necrotising pneumonia, parapneumonic effusion, chest tube drainage and IV Co-Amoxiclav / Cefotaxime' },
      { number: 3, title: '3. PERTUSSIS (WHOOPING COUGH)', description: 'Oral Azithromycin 10mg/kg OD x 5 days (or Clarithromycin x 7 days) for treatment and post-exposure prophylaxis' }
    ]
  },
  {
    code: 'B11',
    title: 'Skin & Soft Tissue Infections',
    fullLabel: 'B11: Skin & Soft Tissue Infections',
    icon: '🩹',
    population: 'Paediatric',
    topics: [
      { number: 1, title: '1. IMPETIGO (CONTAGIOSA & BULLOUS)', description: 'Topical Fusidic acid / Mupirocin for mild lesions; Oral Cloxacillin / Cephalexin for widespread lesions' },
      { number: 2, title: '2. STAPHYLOCOCCAL SCALDED SKIN SYNDROME (SSSS)', description: 'High-dose IV Cloxacillin 50mg/kg/dos Q6H for exfoliatin toxin producing S. aureus' },
      { number: 3, title: '3. PAEDIATRIC CELLULITIS & ERYSIPELAS', description: 'IV Cloxacillin or IV Cefazolin with rapid step-down to oral Cloxacillin/Cephalexin' }
    ]
  },
  {
    code: 'B12',
    title: 'Tropical Infections',
    fullLabel: 'B12: Tropical Infections',
    icon: '🌴',
    population: 'Paediatric',
    topics: [
      { number: 1, title: '1. PAEDIATRIC LEPTOSPIROSIS', description: 'IV Benzylpenicillin or IV Ceftriaxone for severe leptospirosis in children; Oral Amoxicillin for mild' },
      { number: 2, title: '2. PAEDIATRIC MELIOIDOSIS', description: 'Acute Intensive: IV Ceftazidime 50mg/kg Q8H; Eradication: Oral Co-Trimoxazole + Folic Acid x 3-6 months' },
      { number: 3, title: '3. ENTERIC / TYPHOID FEVER IN CHILDREN', description: 'IV Ceftriaxone 75-100mg/kg OD or Oral Azithromycin 10-20mg/kg OD' },
      { number: 4, title: '4. PAEDIATRIC MALARIA', description: 'Uncomplicated oral ACT and Severe Malaria IV Artesunate 2.4-3.0 mg/kg' }
    ]
  },
  {
    code: 'B13',
    title: 'Urinary Tract Infections',
    fullLabel: 'B13: Urinary Tract Infections',
    icon: '💧',
    population: 'Paediatric',
    topics: [
      { number: 1, title: '1. PAEDIATRIC LOWER UTI / CYSTITIS', description: 'Oral Cephalexin 25mg/kg/dos Q8H or Oral Co-Amoxiclav for 5-7 days' },
      { number: 2, title: '2. PAEDIATRIC FEBRILE PYELONEPHRITIS', description: 'IV Cefotaxime 50mg/kg Q8H or IV Ceftriaxone 50-75mg/kg OD with step-down to oral upon afebrile' },
      { number: 3, title: '3. VESICOURETERAL REFLUX (VUR) UTI PROPHYLAXIS', description: 'Low-dose nightly prophylaxis: Oral Nitrofurantoin 1-2mg/kg ON or Cephalexin 10-15mg/kg ON' }
    ]
  },
  {
    code: 'B14',
    title: 'Vascular Infections',
    fullLabel: 'B14: Vascular Infections',
    icon: '🩸',
    population: 'Paediatric',
    topics: [
      { number: 1, title: '1. PAEDIATRIC CRBSI & CENTRAL LINE INFECTIONS', description: 'IV Vancomycin 15mg/kg Q8H + IV Cefotaxime/Cefepime 50mg/kg Q8H + line removal criteria' },
      { number: 2, title: '2. UMBILICAL VENOUS / ARTERIAL CATHETER SEPSIS', description: 'IV Cloxacillin 50mg/kg/dos + IV Gentamicin/Amikacin +/- IV Vancomycin for neonatal lines' },
      { number: 3, title: '3. SUPPURATIVE THROMBOPHLEBITIS IN CHILDREN', description: 'IV Cloxacillin 50mg/kg Q6H + IV Gentamicin + surgical venotomy / heparin evaluation' }
    ]
  }
]
