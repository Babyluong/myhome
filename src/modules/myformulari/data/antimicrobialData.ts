import { NAGInfectionGuideline, DrugRoleInGuideline, NAGCategoryMetadata, NAGPopulation } from '../types/formulariTypes'
export { NAG_ADULT_CATEGORIES_METADATA, NAG_PAED_CATEGORIES_METADATA } from './nagCategoriesData'

export const NAG_GUIDELINES: NAGInfectionGuideline[] = [
  {
    "id": "NAG-A1-001",
    "targetPopulation": "Adult",
    "categoryCode": "A1",
    "categoryTitle": "A1 : Cardiovascular Infections",
    "topic": "1. INFECTIVE ENDOCARDITIS",
    "topicNumber": 1,
    "bodySystem": "Cardiovascular Infections",
    "conditionName": "Infective Endocarditis - Native Valve Empiric Therapy (Endokarditis Injap Asli Empirik)",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Viridans group Streptococci (S. oralis, S. mitis)",
      "Staphylococcus aureus (MSSA & MRSA)",
      "Enterococcus faecalis",
      "HACEK group organisms",
      "Streptococcus gallolyticus (bovis)"
    ],
    "firstLineDrugs": [
      "ampicillin",
      "cloxacillin",
      "gentamicin",
      "benzylpenicillin"
    ],
    "firstLineTherapy": {
      "regimen": "IV Ampicillin 2g Q4H + IV Cloxacillin 2g Q4H + IV Gentamicin 1mg/kg Q8H (or IV Benzylpenicillin 4 MU Q4H + Gentamicin)",
      "routeAndDose": "IV Ampicillin 2g 4-hourly + IV Cloxacillin 2g 4-hourly + IV Gentamicin 1mg/kg 8-hourly (infusi perlahan).",
      "durationDays": "4 - 6 weeks",
      "remarks": "Ambil 3 set Kultur Darah dari tapak berbeza sebelum antibiotik dimulakan. Pantau paras palung Gentamicin dan fungsi renal (serum kreatinin)."
    },
    "secondLineDrugs": [
      "vancomycin",
      "gentamicin",
      "ceftriaxone"
    ],
    "secondLineTherapy": {
      "regimen": "IV Vancomycin 15-20mg/kg (loading 25-30mg/kg) Q8H-Q12H + IV Gentamicin 1mg/kg Q8H",
      "routeAndDose": "IV Vancomycin disasarkan kepada paras palung (trough) 15-20 mcg/mL.",
      "durationDays": "4 - 6 weeks",
      "remarks": "Untuk pesakit dengan risiko MRSA tinggi, hemodialisis, atau pesakit alahan penisilin teruk."
    },
    "allergyDrugs": [
      "vancomycin",
      "gentamicin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Vancomycin 15-20mg/kg Q12H (target trough 15-20 mcg/mL) + IV Gentamicin 1mg/kg Q8H x 2 minggu",
      "routeAndDose": "IV Vancomycin infusi perlahan sekurang-kurangnya 60-120 minit untuk elak Red Man Syndrome.",
      "remarks": "Wajib pantau TDM Vancomycin sebelum dos ke-4."
    },
    "stepDownDrugs": [
      "amoxicillin",
      "ceftriaxone"
    ],
    "oralStepDownOption": {
      "regimen": "Kekal parenteral sekurang-kurangnya 2-3 minggu pertama. Pertimbangan oral (Amoxicillin 1g Q6H + Rifampicin) hanya jika pesakit stabil sepenuhnya mengikut kriteria POET trial.",
      "criteria": "Pesakit afebril >7 hari, tiada abses paravalvular pada TEE, kultur darah steril berulang, CRP turun >50%."
    },
    "amsNotes": [
      "Wajib rujuk Pakar Kardiologi & Pakar Bedah Kardiotorasik seawal mungkin untuk penilaian pembedahan (indikasi: kegagalan jantung akut, abses akar aorta, emboli berulang, atau vegetasi besar >10mm).",
      "Ujian Ekokardiogram Transesofagus (TEE) wajib dilakukan jika TTE tidak konklusif."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / AHA-ESC Guidelines)"
  },
  {
    "id": "NAG-A1-002",
    "targetPopulation": "Adult",
    "categoryCode": "A1",
    "categoryTitle": "A1 : Cardiovascular Infections",
    "topic": "1. INFECTIVE ENDOCARDITIS",
    "topicNumber": 1,
    "bodySystem": "Cardiovascular Infections",
    "conditionName": "Prosthetic Valve Endocarditis - Early & Late (Endokarditis Injap Prostetik)",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Staphylococcus epidermidis & CoNS (Methicillin-resistant)",
      "Staphylococcus aureus (MRSA & MSSA)",
      "Pseudomonas aeruginosa & Enterobacterales",
      "Candida spp."
    ],
    "firstLineDrugs": [
      "vancomycin",
      "gentamicin",
      "rifampicin",
      "rifampin"
    ],
    "firstLineTherapy": {
      "regimen": "IV Vancomycin 15-20mg/kg Q8H-Q12H + IV Gentamicin 1mg/kg Q8H (2 minggu) + Oral Rifampicin 300mg Q8H (atau 600mg BD)",
      "routeAndDose": "IV Vancomycin (trough 15-20 mcg/mL) + IV Gentamicin + Oral Rifampicin.",
      "durationDays": "Minimum 6 weeks",
      "remarks": "Mulakan Rifampicin 3-5 hari SELEPAS Vancomycin bagi mengelakkan kemunculan rintangan Rifampicin yang pantas semasa beban bakteria tinggi."
    },
    "secondLineDrugs": [
      "daptomycin",
      "ceftaroline",
      "gentamicin",
      "rifampicin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Daptomycin 10-12mg/kg OD + IV Ceftaroline 600mg Q8H + Oral Rifampicin 300mg Q8H",
      "routeAndDose": "IV Daptomycin dos tinggi dengan pemantauan CPK mingguan.",
      "durationDays": "6 weeks",
      "remarks": "Digunakan jika terdapat kegagalan Vancomycin atau rintangan glikopeptida (VISA/VRSA)."
    },
    "allergyDrugs": [
      "vancomycin",
      "gentamicin",
      "rifampicin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Vancomycin 15-20mg/kg Q12H + Oral Rifampicin 300mg Q8H + IV Gentamicin 1mg/kg Q8H",
      "routeAndDose": "Rejimen standard sedia ada bebas beta-laktam.",
      "remarks": "Pantau fungsi buah pinggang dan paras ubat terapeutik (TDM)."
    },
    "amsNotes": [
      "Prosthetic Valve Endocarditis memerlukan pemantauan ketat bersama Pasukan Endokarditis (Endocarditis Team: ID, Kardiologi, Kardiotorasik).",
      "Rifampicin bertindak membasmi biofilm bakteria pada permukaan logam/bahan prostetik injap."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / ESC 2023)"
  },
  {
    "id": "NAG-A1-003",
    "targetPopulation": "Adult",
    "categoryCode": "A1",
    "categoryTitle": "A1 : Cardiovascular Infections",
    "topic": "2. CATHETER RELATED INFECTIONS",
    "topicNumber": 2,
    "bodySystem": "Cardiovascular Infections",
    "conditionName": "Catheter-Related Bloodstream Infection (CRBSI) & Dialysis Access Sepsis",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Staphylococcus epidermidis (CoNS)",
      "Staphylococcus aureus (MSSA / MRSA)",
      "Klebsiella pneumoniae & Enterobacterales",
      "Pseudomonas aeruginosa",
      "Candida parapsilosis & Candida albicans"
    ],
    "firstLineDrugs": [
      "vancomycin",
      "cefepime",
      "piperacillin/tazobactam",
      "tazocin",
      "gentamicin"
    ],
    "firstLineTherapy": {
      "regimen": "IV Vancomycin 15-20mg/kg Q12H (target trough 15-20 mcg/mL) + IV Cefepime 2g Q8H (or IV Tazocin 4.5g Q6H)",
      "routeAndDose": "IV Vancomycin infusi perlahan + IV Cefepime infusi 3 jam untuk liputan gram-positif dan gram-negatif.",
      "durationDays": "7 - 14 days (panjangkan ke 4-6 minggu jika ada komplikasi endokarditis/osteomielitis)",
      "remarks": "Ambil kultur darah berpasangan (paired blood culture): 1 set dari lumen talian kateter dan 1 set dari vena periferi dengan catatan DTP (Differential Time to Positivity)."
    },
    "secondLineDrugs": [
      "meropenem",
      "daptomycin",
      "amikacin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Daptomycin 8-10mg/kg OD + IV Meropenem 1g Q8H",
      "routeAndDose": "IV Daptomycin bolus 2 minit atau infusi 30 minit + IV Meropenem.",
      "durationDays": "10 - 14 days",
      "remarks": "Untuk pesakit septik di ICU dengan riwayat organisma MDR (ESBL / CRE / VRE)."
    },
    "allergyDrugs": [
      "vancomycin",
      "ciprofloxacin",
      "amikacin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Vancomycin 15-20mg/kg Q12H + IV Ciprofloxacin 400mg Q8H-Q12H + IV Amikacin 15mg/kg OD",
      "routeAndDose": "Monoterapi fluoroquinolone + aminoglycoside menggantikan beta-laktam.",
      "remarks": "Elakkan beta-laktam sepenuhnya bagi pesakit dengan anafilaksis."
    },
    "stepDownDrugs": [
      "ciprofloxacin",
      "co-amoxiclav",
      "augmentin"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Ciprofloxacin 500-750mg BD atau Oral Augmentin 625mg TDS selepas talian dicabut dan kultur darah steril >48 jam.",
      "criteria": "Kultur darah negatif 48 jam berturut-turut, kateter telah dikeluarkan, tiada demam, tiada emboli sekunder."
    },
    "amsNotes": [
      "Wajib KELUARKAN TALIAN SEGERA bagi: S. aureus, Candida spp., Pseudomonas aeruginosa, syok septik, infeksi terowong bernanah, atau bakteremia berterusan >72 jam.",
      "Pertimbangkan 'Antibiotic Lock Therapy' hanya jika kateter dialisis jangka panjang perlu dikekalkan dan organisma adalah CoNS bertahap rendah."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IDSA CRBSI Guidelines)"
  },
  {
    "id": "NAG-A1-004",
    "targetPopulation": "Adult",
    "categoryCode": "A1",
    "categoryTitle": "A1 : Cardiovascular Infections",
    "topic": "3. TREATMENT OF CARDIAC IMPLANTABLE ELECTRONIC DEVICES (CIED) INFECTIONS",
    "topicNumber": 3,
    "bodySystem": "Cardiovascular Infections",
    "conditionName": "CIED Generator Pocket Infection & Lead-Associated Endocarditis",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Coagulase-Negative Staphylococci (S. epidermidis, S. lugdunensis)",
      "Staphylococcus aureus (MSSA & MRSA)",
      "Cutibacterium (Propionibacterium) acnes",
      "Corynebacterium spp."
    ],
    "firstLineDrugs": [
      "vancomycin",
      "cefepime",
      "daptomycin"
    ],
    "firstLineTherapy": {
      "regimen": "IV Vancomycin 15-20mg/kg Q12H (trough 15-20 mcg/mL) +/- IV Cefepime 2g Q8H (jika jangkitan awal <30 hari)",
      "routeAndDose": "IV Vancomycin parenteral.",
      "durationDays": "10-14 hari (infeksi poket sahaja) atau 4-6 minggu (jika melibatkan wayar plumbum / vegetasi endokarditis)",
      "remarks": "Pencabutan lengkap keseluruhan peranti CIED (generator + semua wayar plumbum) adalah RAWATAN WAJIB PALING UTAMA untuk kesembuhan."
    },
    "secondLineDrugs": [
      "daptomycin",
      "rifampicin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Daptomycin 10-12mg/kg OD + Oral Rifampicin 300mg Q8H",
      "routeAndDose": "IV Daptomycin dos tinggi.",
      "durationDays": "2 - 4 weeks post-device removal",
      "remarks": "Digunakan bagi jangkitan Staph refraktori atau kegagalan Vancomycin."
    },
    "allergyDrugs": [
      "vancomycin",
      "daptomycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Vancomycin 15-20mg/kg Q12H atau IV Daptomycin 10mg/kg OD",
      "routeAndDose": "Parenteral monoterapi sasaran Staphylococcal.",
      "remarks": "Selamat untuk pesakit alahan penisilin."
    },
    "amsNotes": [
      "Jangan sesekali menangguhkan pembedahan pengekstrakan peranti jika terdapat hakisan poket atau bakteremia S. aureus berulang.",
      "Penanaman semula peranti baharu hanya boleh dibuat di tapak kontralateral sekurang-kurangnya 7-14 hari selepas kultur darah steril."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / HRS CIED Infection Consensus)"
  },
  {
    "id": "NAG-A2-001",
    "targetPopulation": "Adult",
    "categoryCode": "A2",
    "categoryTitle": "A2 : Central Nervous Infections",
    "topic": "1. ACUTE BACTERIAL MENINGITIS",
    "topicNumber": 1,
    "bodySystem": "Central Nervous Infections",
    "conditionName": "Community-Acquired Acute Bacterial Meningitis (Meningitis Bakteria Akut Komuniti)",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Streptococcus pneumoniae (Pneumococcus)",
      "Neisseria meningitidis (Meningococcus)",
      "Listeria monocytogenes (terutamanya umur >50 tahun / imunokompromais)",
      "Haemophilus influenzae type b"
    ],
    "firstLineDrugs": [
      "ceftriaxone",
      "cefotaxime",
      "ampicillin",
      "vancomycin",
      "dexamethasone"
    ],
    "firstLineTherapy": {
      "regimen": "IV Ceftriaxone 2g Q12H (or IV Cefotaxime 2g Q4H) + IV Vancomycin 15-20mg/kg Q8H-Q12H (+ IV Ampicillin 2g Q4H jika umur >50 thn) + IV Dexamethasone 10mg Q6H",
      "routeAndDose": "IV Ceftriaxone dos meningitis tinggi (4g sehari dibahagi 2g BD) + IV Vancomycin (trough 15-20) + IV Ampicillin.",
      "durationDays": "10 - 14 days (7 hari N. meningitidis, 10-14 hari S. pneumoniae, 21 hari Listeria)",
      "remarks": "Berikan IV Dexamethasone 10mg 15-20 MINIT SEBELUM atau bersamaan dengan dos pertama antibiotik untuk mengurangkan risiko pekak dan sekuela neurologi."
    },
    "secondLineDrugs": [
      "meropenem",
      "vancomycin",
      "co-trimoxazole",
      "bactrim"
    ],
    "secondLineTherapy": {
      "regimen": "IV Meropenem 2g Q8H + IV Vancomycin 15-20mg/kg Q8H-Q12H (+ IV Bactrim jika Listeria)",
      "routeAndDose": "IV Meropenem dos tinggi infusi 3 jam menembusi sawar darah-otak (BBB).",
      "durationDays": "14 - 21 days",
      "remarks": "Untuk pesakit alahan teruk sefalosporin atau disyaki organisma gram-negatif kebal."
    },
    "allergyDrugs": [
      "chloramphenicol",
      "vancomycin",
      "co-trimoxazole",
      "bactrim",
      "moxifloxacin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Chloramphenicol 25mg/kg Q6H + IV Vancomycin 15-20mg/kg Q12H (+ IV Co-Trimoxazole 5mg/kg TMP Q8H jika disyaki Listeria)",
      "routeAndDose": "IV Chloramphenicol menembusi cecair serebrospinal (CSF) dengan amat baik.",
      "remarks": "Pantau hitungan darah lengkap (FBC) untuk risiko aplasia sumsum tulang."
    },
    "amsNotes": [
      "Lakukan Lumbar Puncture (LP) SEGERA kecuali ada tanda kenaikan tekanan intrakranial (focal neuro deficit, papilloedema, sawan baharu).",
      "Jika LP tertangguh kerana CT Brain, JANGAN TANGGUHKAN ANTIBIOTIK! Ambil kultur darah dan suntik antibiotik + steroid serta-merta."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IDSA Bacterial Meningitis Guidelines)"
  },
  {
    "id": "NAG-A2-002",
    "targetPopulation": "Adult",
    "categoryCode": "A2",
    "categoryTitle": "A2 : Central Nervous Infections",
    "topic": "2. BRAIN ABSCESS & SUBDURAL EMPYEMA",
    "topicNumber": 2,
    "bodySystem": "Central Nervous Infections",
    "conditionName": "Brain Abscess & Subdural Empyema (Abses Otak & Empiema Subdural)",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Streptococcus anginosus group (milleri)",
      "Anaerobes (Bacteroides, Fusobacterium, Peptostreptococcus)",
      "Staphylococcus aureus (terutamanya post-trauma/neurosurg)",
      "Enterobacterales & Pseudomonas (otogenic)"
    ],
    "firstLineDrugs": [
      "ceftriaxone",
      "metronidazole",
      "vancomycin",
      "ceftazidime"
    ],
    "firstLineTherapy": {
      "regimen": "IV Ceftriaxone 2g Q12H + IV Metronidazole 500mg Q8H (+/- IV Vancomycin 15-20mg/kg Q12H jika post-trauma/neurosurgery)",
      "routeAndDose": "IV Ceftriaxone 2g BD + IV Metronidazole 500mg TDS untuk liputan anaerobik intrakranial optimum.",
      "durationDays": "4 - 8 weeks",
      "remarks": "Rujuk Pakar Bedah Neurosains dengan kadar segera untuk aspirasi jarum stereotaktik atau kraniotomi penyaliran nanah."
    },
    "secondLineDrugs": [
      "meropenem",
      "vancomycin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Meropenem 2g Q8H + IV Vancomycin 15-20mg/kg Q8H-Q12H",
      "routeAndDose": "IV Meropenem dos tinggi infusi panjang.",
      "durationDays": "6 - 8 weeks",
      "remarks": "Bagi punca otogenik Pseudomonas atau abses pasca-pembedahan otak hospital-acquired."
    },
    "allergyDrugs": [
      "chloramphenicol",
      "metronidazole",
      "vancomycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Chloramphenicol 25mg/kg Q6H + IV Metronidazole 500mg Q8H + IV Vancomycin 15mg/kg Q12H",
      "routeAndDose": "Liputan anaerob dan streptococcal tanpa kompaun beta-laktam.",
      "remarks": "Pantau profil hematologi FBC berkala."
    },
    "amsNotes": [
      "Imbasan MRI Otak berkontras berulang disyorkan setiap 2-4 minggu untuk menilai pengecutan kaviti abses sebelum menukar kepada terapi oral.",
      "Rawatan wajib diteruskan sehingga resolusi radiologi lengkap."
    ],
    "evidenceLevel": "Grade B (NAG 2024 / EFNS Guidelines)"
  },
  {
    "id": "NAG-A2-003",
    "targetPopulation": "Adult",
    "categoryCode": "A2",
    "categoryTitle": "A2 : Central Nervous Infections",
    "topic": "3. VIRAL ENCEPHALITIS & CRYPTOCOCCAL MENINGITIS",
    "topicNumber": 3,
    "bodySystem": "Central Nervous Infections",
    "conditionName": "Herpes Simplex Encephalitis & Cryptococcal Meningitis",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Herpes Simplex Virus Type 1 (HSV-1) & Type 2",
      "Varicella Zoster Virus (VZV)",
      "Cryptococcus neoformans / Cryptococcus gattii"
    ],
    "firstLineDrugs": [
      "acyclovir",
      "amphotericin b",
      "flucytosine",
      "fluconazole"
    ],
    "firstLineTherapy": {
      "regimen": "Ensefalitis Viral: IV Acyclovir 10mg/kg Q8H x 14-21 hari. Meningitis Kriptokokus: IV Liposomal Amphotericin B 3-4 mg/kg OD + Oral Flucytosine 25mg/kg Q6H x 2 minggu kemudian Oral Fluconazole 400-800mg OD x 8 minggu.",
      "routeAndDose": "IV Acyclovir infusi perlahan sekurang-kurangnya 1 jam bersama hidrasi cecair IV yang mencukupi untuk mencegah nefropati kristal.",
      "durationDays": "14 - 21 days (Ensefalitis) / 10 weeks total (Kriptokokus)",
      "remarks": "Mulakan IV Acyclovir SERTA-MERTA sekiranya pesakit datang dengan demam berserta kekeliruan, perubahan personaliti, atau sawan tanpa menunggu keputusan CSF PCR."
    },
    "secondLineDrugs": [
      "fluconazole",
      "amphotericin b"
    ],
    "secondLineTherapy": {
      "regimen": "Kriptokokus (tanpa Flucytosine): IV Amphotericin B deoxycholate 0.7-1.0 mg/kg OD + Oral Fluconazole 800mg-1200mg OD x 2 minggu.",
      "routeAndDose": "Terapi alternatif induksi jika Flucytosine tidak tersedia.",
      "durationDays": "2 weeks induction + 8 weeks consolidation",
      "remarks": "Pantau elektrolit kalium dan magnesium harian."
    },
    "amsNotes": [
      "Hantar CSF untuk Ujian HSV PCR, Cryptococcal Antigen (CrAg), dan Pewarnaan India Ink.",
      "Ukur tekanan pembukaan LP (Opening Pressure); jika >25 cmH2O, lakukan penyaliran LP terapeutik harian."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IDSA Encephalitis & Cryptococcosis Guidelines)"
  },
  {
    "id": "NAG-A3-001",
    "targetPopulation": "Adult",
    "categoryCode": "A3",
    "categoryTitle": "A3 : Chemoprophylaxis",
    "topic": "1. SURGICAL ANTIMICROBIAL PROPHYLAXIS (SAP)",
    "topicNumber": 1,
    "bodySystem": "Chemoprophylaxis",
    "conditionName": "Surgical Antimicrobial Prophylaxis (SAP) - Standard Surgical Procedures",
    "setting": "Surgical Prophylaxis",
    "primaryPathogens": [
      "Staphylococcus aureus (MSSA)",
      "Staphylococcus epidermidis",
      "Streptococcus species",
      "Enterobacterales & Bacteroides fragilis (prosedur GI/Gynae)"
    ],
    "firstLineDrugs": [
      "cefazolin",
      "metronidazole",
      "co-amoxiclav",
      "augmentin",
      "ampicillin/sulbactam",
      "unasyn"
    ],
    "firstLineTherapy": {
      "regimen": "Pembedahan Bersih/Ortopedik/Hernia: IV Cefazolin 2g stat (3g jika berat >120kg). Pembedahan Kolorektal/Apendiks/Ginekologi: IV Cefazolin 2g + IV Metronidazole 500mg stat (atau IV Co-Amoxiclav 1.2g stat).",
      "routeAndDose": "IV dos tunggal diberikan dalam masa 30 - 60 MINIT SEBELUM torehan kulit (surgical incision).",
      "durationDays": "Single Dose (Maksimum 24 jam sahaja jika pembedahan terbuka tercemar)",
      "remarks": "Dos ulangan intra-operasi (re-dosing) wajib diberikan jika pembedahan berlanjutan melebihi 3-4 jam (separuh hayat Cefazolin) atau berlaku pendarahan >1500 mL."
    },
    "secondLineDrugs": [
      "vancomycin",
      "gentamicin",
      "ciprofloxacin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Vancomycin 1g-1.5g (15mg/kg) infusi tamat dalam 60-120 minit sebelum torehan + IV Gentamicin 5mg/kg stat",
      "routeAndDose": "Untuk pesakit yang diketahui pembawa MRSA atau unit dengan kadar wabak MRSA tinggi.",
      "durationDays": "Single dose",
      "remarks": "Mulakan Vancomycin 60-120 minit lebih awal kerana tempoh infusi yang panjang."
    },
    "allergyDrugs": [
      "clindamycin",
      "gentamicin",
      "ciprofloxacin",
      "metronidazole"
    ],
    "penicillinAllergyOption": {
      "regimen": "Pembedahan Bersih: IV Clindamycin 900mg stat (or IV Vancomycin 1g-1.5g). Pembedahan Abdomen: IV Clindamycin 900mg + IV Gentamicin 5mg/kg stat (or IV Ciprofloxacin 400mg + IV Metronidazole 500mg).",
      "routeAndDose": "Pemberian 30-60 minit sebelum induksi bius.",
      "remarks": "Sesuai untuk pesakit yang mempunyai sejarah anafilaksis penisilin yang disahkan."
    },
    "amsNotes": [
      "DASAR AMS KEBANGSAAN: Profilaksis pembedahan TIDAK BOLEH DITERUSKAN melebihi 24 jam pasca-pembedahan kerana tidak mengurangkan kadar SSI tetapi meningkatkan rintangan AMR dan risiko jangkitan C. difficile.",
      "Tukar sarung tangan dan basuh luka secara aseptik standard."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / WHO Surgical Site Infection Guidelines)"
  },
  {
    "id": "NAG-A3-002",
    "targetPopulation": "Adult",
    "categoryCode": "A3",
    "categoryTitle": "A3 : Chemoprophylaxis",
    "topic": "2. MEDICAL CHEMOPROPHYLAXIS",
    "topicNumber": 2,
    "bodySystem": "Chemoprophylaxis",
    "conditionName": "Medical Chemoprophylaxis - Meningococcal, Pertussis, Asplenia & Rheumatic Fever",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Neisseria meningitidis",
      "Bordetella pertussis",
      "Streptococcus pneumoniae (Post-splenectomy sepsis)",
      "Streptococcus pyogenes (Group A Strep)"
    ],
    "firstLineDrugs": [
      "ciprofloxacin",
      "ceftriaxone",
      "rifampicin",
      "azithromycin",
      "phenoxymethylpenicillin",
      "penicillin v"
    ],
    "firstLineTherapy": {
      "regimen": "Kontak Rapat Meningokokus: Oral Ciprofloxacin 500mg stat (atau IM Ceftriaxone 250mg stat / Oral Rifampicin 600mg BD x 2 hari). Kontak Pertussis: Oral Azithromycin 500mg OD x 5 hari. Asplenia/Pasca-Splenektomi: Oral Penicillin V 250-500mg BD berterusan.",
      "routeAndDose": "Oral dos tunggal atau rejimen pendek mengikut indikasi pendedahan.",
      "durationDays": "Stat dose sehingga profilaksis jangka panjang (Asplenia)",
      "remarks": "Berikan profilaksis kontak meningokokus dalam tempoh <24 jam dari pengesanan kes indeks bagi membasmi kolonisasi nasofarinks."
    },
    "secondLineDrugs": [
      "azithromycin",
      "erythromycin",
      "clarithromycin"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Azithromycin 500mg OD (hari 1) kemudian 250mg OD (hari 2-5) atau Oral Clarithromycin 500mg BD x 7 hari.",
      "routeAndDose": "Oral.",
      "durationDays": "5 - 7 days",
      "remarks": "Alternatif bagi kontak pertussis dan profilaksis asplenia."
    },
    "allergyDrugs": [
      "ciprofloxacin",
      "azithromycin",
      "clarithromycin",
      "erythromycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "Meningokokus: Oral Ciprofloxacin 500mg stat. Profilaksis Asplenia: Oral Erythromycin 250-500mg BD atau Azithromycin 250mg 3 kali seminggu.",
      "routeAndDose": "Oral.",
      "remarks": "Pilihan utama sekiranya pesakit alah kepada kumpulan penisilin."
    },
    "amsNotes": [
      "Laporkan kes penyakit berjangkit wajib (Meningokokus, Pertussis) kepada Pejabat Kesihatan Daerah (PKD) dalam masa 24 jam.",
      "Pastikan pesakit asplenia menerima suntikan vaksin Pneumococcal (PCV/PPSV23), MenACWY, MenB, dan Hib."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / CDC Advisory Guidelines)"
  },
  {
    "id": "NAG-A4-001",
    "targetPopulation": "Adult",
    "categoryCode": "A4",
    "categoryTitle": "A4 : Gastrointestinal Infections",
    "topic": "1. ACUTE GASTROENTERITIS & INFECTIOUS DIARRHOEA",
    "topicNumber": 1,
    "bodySystem": "Gastrointestinal Infections",
    "conditionName": "Severe Invasive Bacterial Gastroenteritis & Dysentery (Cirit-Birit Bernanah/Berdarah Teruk)",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Shigella dysenteriae & Shigella flexneri",
      "Campylobacter jejuni",
      "Salmonella enterica (Non-typhoidal)",
      "Enteroinvasive E. coli (EIEC / STEC)",
      "Vibrio cholerae"
    ],
    "firstLineDrugs": [
      "azithromycin",
      "ciprofloxacin",
      "ceftriaxone",
      "doxycycline"
    ],
    "firstLineTherapy": {
      "regimen": "Disenteri invasif / Shigellosis: Oral Azithromycin 500mg OD x 3 hari (atau Oral Ciprofloxacin 500mg BD x 3 hari). Kolera: Oral Doxycycline 300mg stat (atau Oral Azithromycin 1g stat).",
      "routeAndDose": "Oral (tukar ke IV Ceftriaxone 2g OD jika pesakit muntah berterusan atau mengalami sepsis).",
      "durationDays": "3 days (Azithromycin) atau 1 hari stat (Kolera)",
      "remarks": "FOKUS RAWATAN UTAMA: Terapi Penghidratan Semula Oral (ORS) dan pemulihan cecair elektrolit intravena. Antibiotik hanya untuk kes berdarah/demam/sepsis."
    },
    "secondLineDrugs": [
      "ceftriaxone",
      "co-trimoxazole",
      "bactrim"
    ],
    "secondLineTherapy": {
      "regimen": "IV Ceftriaxone 1g-2g OD x 3-5 hari atau Oral Bactrim Forte (160/800mg) 1 tab BD x 5 hari.",
      "routeAndDose": "IV atau Oral mengikut kestabilan.",
      "durationDays": "3 - 5 days",
      "remarks": "Digunakan jika terdapat kegagalan klinikal terhadap rawatan awal atau rintangan fluoroquinolone."
    },
    "allergyDrugs": [
      "azithromycin",
      "ciprofloxacin",
      "doxycycline"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Azithromycin 500mg OD x 3 hari atau Oral Ciprofloxacin 500mg BD x 3 hari",
      "routeAndDose": "Oral.",
      "remarks": "Tiada silang alahan dengan beta-laktam."
    },
    "amsNotes": [
      "JANGAN berikan ubat antimotiliti (seperti Loperamide / Lomotil) pada cirit-birit berdarah kerana boleh mencetuskan Megakolon Toksik dan Sindrom Uremik Hemolitik (HUS).",
      "Hantar spesimen Najis untuk Ujian Kultur & Sensitiviti (Stool C&S) serta mikroskopi telur/parasit."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IDSA Infectious Diarrhea Guidelines)"
  },
  {
    "id": "NAG-A4-002",
    "targetPopulation": "Adult",
    "categoryCode": "A4",
    "categoryTitle": "A4 : Gastrointestinal Infections",
    "topic": "2. CLOSTRIDIOIDES DIFFICILE INFECTION (CDI)",
    "topicNumber": 2,
    "bodySystem": "Gastrointestinal Infections",
    "conditionName": "Clostridioides difficile Infection (CDI) - Non-Severe & Severe Colitis",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Clostridioides difficile (Toxin A & Toxin B producing strains)"
    ],
    "firstLineDrugs": [
      "vancomycin",
      "metronidazole"
    ],
    "firstLineTherapy": {
      "regimen": "Episod Pertama (Bukan Teruk / Teruk): Oral Vancomycin 125mg Q6H x 10 hari. (Jika tiada Oral Vancomycin, alternatif bukan teruk: Oral Metronidazole 500mg TDS x 10-14 hari).",
      "routeAndDose": "ORAL SAHAJA (IV Vancomycin TIDAK dirembeskan ke dalam lumen usus dan TIDAK berkesan untuk CDI!).",
      "durationDays": "10 days",
      "remarks": "HENTIKAN serta-merta antibiotik penyebab terdahulu yang mencetuskan CDI sekiranya keadaan klinikal pesakit mengizinkan."
    },
    "secondLineDrugs": [
      "vancomycin",
      "metronidazole"
    ],
    "secondLineTherapy": {
      "regimen": "CDI Fulminan (Hipotensi, Syok, Ileus, Megakolon Toksik): Oral/Nasogastric Vancomycin 500mg Q6H + IV Metronidazole 500mg Q8H (+/- Enema Vancomycin per rektum).",
      "routeAndDose": "Gabungan Enteral dos tinggi + IV Metronidazole.",
      "durationDays": "14 days",
      "remarks": "Rujuk Pakar Bedah Am dengan segera untuk penilaian kolektomi subtotal kecemasan jika terdapat tanda perforasi usus."
    },
    "allergyDrugs": [
      "vancomycin",
      "metronidazole"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Vancomycin 125mg Q6H x 10 hari",
      "routeAndDose": "Oral.",
      "remarks": "Selamat untuk pesakit alahan penisilin."
    },
    "amsNotes": [
      "Pengasingan pesakit di bilik isolasi (Contact Precautions) dan wajib CUCI TANGAN DENGAN AIR DAN SABUN (pensanitasi tangan alkohol tidak dapat memusnahkan spora C. difficile).",
      "Jangan uji najis terbentuk/pejal; hanya uji sampel najis cair (Bristol Stool Scale 5-7)."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IDSA-SHEA CDI Guidelines 2021)"
  },
  {
    "id": "NAG-A4-003",
    "targetPopulation": "Adult",
    "categoryCode": "A4",
    "categoryTitle": "A4 : Gastrointestinal Infections",
    "topic": "3. INTRA-ABDOMINAL INFECTIONS",
    "topicNumber": 3,
    "bodySystem": "Gastrointestinal Infections",
    "conditionName": "Intra-Abdominal Infections - Appendicitis, Cholecystitis, Cholangitis & Peritonitis",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Escherichia coli & Klebsiella pneumoniae",
      "Enterococcus faecalis",
      "Bacteroides fragilis & Anaerobes",
      "Streptococcus anginosus group"
    ],
    "firstLineDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "ampicillin/sulbactam",
      "unasyn",
      "ceftriaxone",
      "metronidazole"
    ],
    "firstLineTherapy": {
      "regimen": "Ringan/Sederhana: IV Co-Amoxiclav 1.2g TDS (or IV Ampicillin-Sulbactam 1.5g-3g Q6H). Teruk/Sepsis: IV Ceftriaxone 2g OD + IV Metronidazole 500mg TDS (or IV Tazocin 4.5g Q6H).",
      "routeAndDose": "IV infusi.",
      "durationDays": "4 - 7 days (pendekkan ke 24-48 jam jika apendiks tidak pecah dan kawalan punca pembedahan berjaya sepenuhnya)",
      "remarks": "KAWALAN PUNCA (Source Control): Pembedahan apendisektomi, kolesistektomi, dekompresi ERCP saluran hempedu, atau penyaliran abses adalah kunci utama kesembuhan."
    },
    "secondLineDrugs": [
      "piperacillin/tazobactam",
      "tazocin",
      "meropenem",
      "ciprofloxacin",
      "metronidazole"
    ],
    "secondLineTherapy": {
      "regimen": "IV Piperacillin/Tazobactam 4.5g Q6H infusi 3 jam atau IV Meropenem 1g Q8H",
      "routeAndDose": "IV.",
      "durationDays": "5 - 7 days",
      "remarks": "Bagi peritonitis nosokomial, kebocoran anastomotik, atau pesakit dengan risiko kuman penghasil ESBL."
    },
    "allergyDrugs": [
      "ciprofloxacin",
      "metronidazole",
      "amikacin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Ciprofloxacin 400mg Q8H-Q12H + IV Metronidazole 500mg Q8H (+/- IV Amikacin 15mg/kg OD jika syok)",
      "routeAndDose": "IV.",
      "remarks": "Liputan luas bakteria gram-negatif dan anaerobik tanpa beta-laktam."
    },
    "stepDownDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "ciprofloxacin",
      "metronidazole"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Augmentin 625mg TDS atau (Oral Ciprofloxacin 500mg BD + Oral Metronidazole 400mg TDS).",
      "criteria": "Pesakit afebril >24 jam, tiada tanda peritonitis pada abdomen, toleransi diet oral baik, kiraan sel darah putih (WBC) kembali normal."
    },
    "amsNotes": [
      "Kultur cecair peritoneal / nanah intra-abdomen wajib diambil secara intra-operasi (elakkan mengambil sapuan swab permukaan).",
      "Hentikan antibiotik dalam masa 4 hari selepas punca jangkitan dibersihkan mengikut bukti STOP-IT trial."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / SIS-IDSA Intra-abdominal Guidelines)"
  },
  {
    "id": "NAG-A4-004",
    "targetPopulation": "Adult",
    "categoryCode": "A4",
    "categoryTitle": "A4 : Gastrointestinal Infections",
    "topic": "4. HELICOBACTER PYLORI ERADICATION",
    "topicNumber": 4,
    "bodySystem": "Gastrointestinal Infections",
    "conditionName": "Helicobacter pylori Eradication - Triple & Bismuth Quadruple Therapy",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Helicobacter pylori"
    ],
    "firstLineDrugs": [
      "esomeprazole",
      "pantoprazole",
      "amoxicillin",
      "clarithromycin",
      "metronidazole"
    ],
    "firstLineTherapy": {
      "regimen": "Terapi Tiga Serangkai Standard (14 Hari): PPI Dos Tinggi (cth: Esomeprazole 40mg BD atau Pantoprazole 40mg BD) + Oral Amoxicillin 1g BD + Oral Clarithromycin 500mg BD (atau Metronidazole 400mg TDS).",
      "routeAndDose": "Oral diambil 30-60 minit sebelum makan.",
      "durationDays": "14 days",
      "remarks": "Tempoh 14 hari menghasilkan kadar pembasmian (eradication rate) yang terbukti jauh lebih tinggi berbanding rejimen lapuk 7 hari."
    },
    "secondLineDrugs": [
      "bismuth",
      "tetracycline",
      "metronidazole",
      "levofloxacin",
      "amoxicillin"
    ],
    "secondLineTherapy": {
      "regimen": "Terapi Empat Serangkai Bismuth (Bismuth Quadruple - 14 Hari): PPI Dos Tinggi BD + Bismuth Subcitrate 120mg-240mg QDS + Tetracycline 500mg QDS + Metronidazole 400mg TDS (atau Rejimen Levofloxacin: PPI BD + Amoxicillin 1g BD + Levofloxacin 500mg OD x 14 hari).",
      "routeAndDose": "Oral.",
      "durationDays": "14 days",
      "remarks": "Pilihan utama bagi kegagalan rawatan barisan pertama atau kawasan dengan kadar rintangan Clarithromycin >15%."
    },
    "allergyDrugs": [
      "clarithromycin",
      "metronidazole",
      "bismuth",
      "tetracycline"
    ],
    "penicillinAllergyOption": {
      "regimen": "PPI Dos Tinggi BD + Bismuth Subcitrate 240mg BD + Oral Metronidazole 400mg TDS + Oral Tetracycline 500mg QDS x 14 hari",
      "routeAndDose": "Oral.",
      "remarks": "Rejimen bebas penisilin standard antarabangsa."
    },
    "amsNotes": [
      "Wajib lakukan ujian pengesahan pembasmian (Urea Breath Test atau Stool Antigen Test) sekurang-kurangnya 4 MINGGU SELEPAS tamat antibiotik dan 2 MINGGU selepas berhenti PPI.",
      "Kepatuhan pesakit kepada jadual ubat 14 hari adalah faktor terpenting mengelakkan kegagalan terapi."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / Maastricht VI Consensus)"
  },
  {
    "id": "NAG-A5-001",
    "targetPopulation": "Adult",
    "categoryCode": "A5",
    "categoryTitle": "A5 : Infections In Immunocompromised Patients",
    "topic": "1. FEBRILE NEUTROPENIA",
    "topicNumber": 1,
    "bodySystem": "Infections In Immunocompromised Patients",
    "conditionName": "High-Risk Febrile Neutropenia (Neutropenia Berdemam Berisiko Tinggi - MASCC < 21)",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Pseudomonas aeruginosa",
      "Escherichia coli & Klebsiella pneumoniae (termasuk ESBL/CRE)",
      "Staphylococcus epidermidis & MSSA/MRSA",
      "Enterococcus faecium (VRE)",
      "Candida spp. & Aspergillus fumigatus (demam berpanjangan)"
    ],
    "firstLineDrugs": [
      "cefepime",
      "piperacillin/tazobactam",
      "tazocin",
      "meropenem"
    ],
    "firstLineTherapy": {
      "regimen": "IV Cefepime 2g Q8H (or IV Tazocin 4.5g Q6H infusi berpanjangan 3-4 jam) sebagai Monoterapi Antipseudomonal Empirik.",
      "routeAndDose": "IV dos pertama WAJIB diberikan dalam masa 30 - 60 MINIT dari ketibaan pesakit (Medical Emergency).",
      "durationDays": "Sehingga neutrofil pulih (ANC >500/mcL) dan pesakit afebril sekurang-kurangnya 48-72 jam berturut-turut",
      "remarks": "Takrifan: Suhu oral tunggal ≥38.3°C (atau ≥38.0°C berterusan >1 jam) berserta Kiraan Neutrofil Mutlak (ANC) <500 sel/mcL (atau dijangka jatuh <500 sel/mcL)."
    },
    "secondLineDrugs": [
      "meropenem",
      "vancomycin",
      "amikacin",
      "caspofungin",
      "anidulafungin",
      "liposomal amphotericin b"
    ],
    "secondLineTherapy": {
      "regimen": "Demam Berterusan >72-96 Jam / Ketidakstabilan Hemodinamik: IV Meropenem 1g-2g Q8H + IV Vancomycin 15-20mg/kg Q12H (+/- IV Amikacin 15mg/kg OD). Tambah IV Caspofungin 70mg loading kemudian 50mg OD jika demam >4-7 hari.",
      "routeAndDose": "Eskalasi spektrum luas merangkumi MDR dan antikulat.",
      "durationDays": "7 - 14 days",
      "remarks": "Tambah Vancomycin hanya jika ada bukti infeksi kateter, hipotensi/syok septik, radiograf infiltrat pneumonia, atau kultur gram-positif."
    },
    "allergyDrugs": [
      "ciprofloxacin",
      "amikacin",
      "vancomycin",
      "aztreonam"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Aztreonam 2g Q8H (or IV Ciprofloxacin 400mg Q8H) + IV Vancomycin 15-20mg/kg Q12H + IV Amikacin 15mg/kg OD",
      "routeAndDose": "IV.",
      "remarks": "Aztreonam selamat untuk pesakit alahan penisilin kerana ketiadaan kereaktifan silang rantai sisi."
    },
    "amsNotes": [
      "Ambil 2 set Kultur Darah (dari setiap lumen PICC/Chemo-port dan vena periferi) sebelum antibiotik dimulakan.",
      "Lakukan pemeriksaan harian teliti pada rongga mulut, kawasan perianal, dan tapak kateter vena sentral."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IDSA-ASCO Febrile Neutropenia Guidelines)"
  },
  {
    "id": "NAG-A5-002",
    "targetPopulation": "Adult",
    "categoryCode": "A5",
    "categoryTitle": "A5 : Infections In Immunocompromised Patients",
    "topic": "2. PNEUMOCYSTIS JIROVECII PNEUMONIA (PJP)",
    "topicNumber": 2,
    "bodySystem": "Infections In Immunocompromised Patients",
    "conditionName": "Pneumocystis jirovecii Pneumonia (PJP / PCP) - Treatment & Prophylaxis",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Pneumocystis jirovecii (dahulunya Pneumocystis carinii)"
    ],
    "firstLineDrugs": [
      "co-trimoxazole",
      "bactrim",
      "trimethoprim/sulfamethoxazole",
      "prednisolone",
      "methylprednisolone"
    ],
    "firstLineTherapy": {
      "regimen": "Rawatan PJP Teruk/Sederhana: IV/Oral Co-Trimoxazole (Bactrim) pada dos TMP 15 - 20 mg/kg/hari (dibahagi kepada 3-4 dos setiap 6-8 jam) x 21 hari + STEROID ADJUNCT: Oral/IV Prednisolone (40mg BD hari 1-5, 40mg OD hari 6-10, 20mg OD hari 11-21).",
      "routeAndDose": "IV infusi dicairkan dalam Dextrose 5% sekurang-kurangnya 250ml setiap dos.",
      "durationDays": "21 days",
      "remarks": "Steroid wajib dimulakan dalam masa 72 jam jika PaO2 <70 mmHg pada udara bilik atau A-a gradient ≥35 mmHg untuk mencegah kegagalan pernafasan akibat keradangan lisis kulat."
    },
    "secondLineDrugs": [
      "clindamycin",
      "primaquine",
      "pentamidine",
      "atovaquone"
    ],
    "secondLineTherapy": {
      "regimen": "IV Clindamycin 600-900mg Q8H + Oral Primaquine 30mg OD (base) x 21 hari (atau IV Pentamidine isethionate 4mg/kg OD).",
      "routeAndDose": "IV + Oral.",
      "durationDays": "21 days",
      "remarks": "Saring status G6PD sebelum memulakan Primaquine bagi mengelakkan krisis hemolisis akut."
    },
    "allergyDrugs": [
      "clindamycin",
      "primaquine",
      "atovaquone"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV/Oral Co-Trimoxazole (tiada kereaktifan silang dengan penisilin) atau IV Clindamycin 600mg Q8H + Oral Primaquine 30mg OD",
      "routeAndDose": "Oral/IV.",
      "remarks": "Gunakan protokol desensitisasi Bactrim sekiranya alahan sulfa ringan."
    },
    "stepDownDrugs": [
      "co-trimoxazole",
      "bactrim"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Bactrim Forte 2 tablet TDS (jumlah 21 hari) diteruskan dengan PROFILAKSIS SEKUNDER: Oral Bactrim Forte 1 tablet OD (atau 1 tab 3 kali seminggu) sehingga CD4 >200 sel/mcL selama >3-6 bulan.",
      "criteria": "Pesakit stabil, tidak memerlukan oksigen tambahan, dan tiada loya/muntah."
    },
    "amsNotes": [
      "Hantar kahak teraruh (induced sputum) atau cecair BAL (Bronchoalveolar Lavage) untuk pewarnaan Giemsa/GMS dan ujian PJP PCR.",
      "Pantau paras kalium (risiko hiperkalemia akibat kesan amiloride-like TMP) dan fungsi ginjal setiap 48-72 jam."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / NIH-CDC-IDSA Opportunistic Infection Guidelines)"
  },
  {
    "id": "NAG-A5-003",
    "targetPopulation": "Adult",
    "categoryCode": "A5",
    "categoryTitle": "A5 : Infections In Immunocompromised Patients",
    "topic": "3. INVASIVE FUNGAL INFECTIONS",
    "topicNumber": 3,
    "bodySystem": "Infections In Immunocompromised Patients",
    "conditionName": "Invasive Candidiasis, Candidemia & Invasive Aspergillosis",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Candida albicans & Candida glabrata / tropicalis / krusei",
      "Aspergillus fumigatus & Aspergillus flavus",
      "Mucorales (Mucormycosis)"
    ],
    "firstLineDrugs": [
      "anidulafungin",
      "caspofungin",
      "micafungin",
      "voriconazole",
      "liposomal amphotericin b"
    ],
    "firstLineTherapy": {
      "regimen": "Kandidiasis Invasif / Kandidemia: IV Anidulafungin 200mg loading kemudian 100mg OD (or IV Caspofungin 70mg loading kemudian 50mg OD). Aspergillosis Invasif Pulmonari: IV Voriconazole 6mg/kg Q12H (hari 1) kemudian 4mg/kg Q12H (atau Oral 200-300mg BD).",
      "routeAndDose": "IV infusi perlahan.",
      "durationDays": "Kandidemia: Minimum 14 hari selepas kultur darah pertama disahkan negatif; Aspergillosis: 6 - 12 minggu",
      "remarks": "Echinocandin (Anidulafungin/Caspofungin) adalah barisan pertama pilihan untuk kandidemia kerana spektrum luas merangkumi spesies rintang-Fluconazole."
    },
    "secondLineDrugs": [
      "liposomal amphotericin b",
      "isavuconazole",
      "posaconazole",
      "fluconazole"
    ],
    "secondLineTherapy": {
      "regimen": "IV Liposomal Amphotericin B 3-5 mg/kg OD (tingkatkan ke 5-10 mg/kg bagi Mucormycosis) atau IV/Oral Isavuconazole 200mg TDS (hari 1-2) kemudian 200mg OD.",
      "routeAndDose": "IV infusi.",
      "durationDays": "Berdasarkan tindak balas klinikal dan radiologi",
      "remarks": "Liposomal Amphotericin B mempunyai profil ketoksikan renal yang jauh lebih rendah berbanding formulasi deoxycholate."
    },
    "stepDownDrugs": [
      "fluconazole",
      "voriconazole"
    ],
    "oralStepDownOption": {
      "regimen": "Kandidemia: Oral Fluconazole 400-800mg OD selepas 5-7 hari parenteral jika spesies adalah C. albicans sensitif dan pesakit stabil.",
      "criteria": "Kultur darah bersiri negatif, afebril, hemodinamik stabil, dan tiada endokarditis/endoftalmitis pada pemeriksaan mata."
    },
    "amsNotes": [
      "SEMUA pesakit kandidemia WAJIB menjalani pemeriksaan funduskopi mata oleh Pakar Oftalmologi dalam masa 1 minggu untuk menolak endoftalmitis kulat.",
      "Keluarkan semua talian kateter vena sentral (CVC) seawal mungkin bagi pesakit kandidemia."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IDSA Candidiasis & Aspergillosis Guidelines)"
  },
  {
    "id": "NAG-A6-001",
    "targetPopulation": "Adult",
    "categoryCode": "A6",
    "categoryTitle": "A6 : Obstetrics & Gynaecological Infections",
    "topic": "1. PELVIC INFLAMMATORY DISEASE (PID)",
    "topicNumber": 1,
    "bodySystem": "Obstetrics & Gynaecological Infections",
    "conditionName": "Pelvic Inflammatory Disease (PID) - Outpatient & Inpatient Regimens",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Neisseria gonorrhoeae",
      "Chlamydia trachomatis",
      "Mycoplasma genitalium",
      "Anaerobes & enteric Gram-negative rods"
    ],
    "firstLineDrugs": [
      "ceftriaxone",
      "doxycycline",
      "metronidazole",
      "azithromycin"
    ],
    "firstLineTherapy": {
      "regimen": "Pesakit Luar (Ringan/Sederhana): IM Ceftriaxone 500mg stat + Oral Doxycycline 100mg BD x 14 hari + Oral Metronidazole 400mg-500mg BD x 14 hari. Pesakit Dalam (Teruk/Abses Tubo-Ovarian): IV Ceftriaxone 2g OD + IV Doxycycline 100mg BD + IV Metronidazole 500mg TDS sehingga 48 jam afebril kemudian tukar oral lengkapkan 14 hari.",
      "routeAndDose": "IM suntikan stat + rejimen oral.",
      "durationDays": "14 days total",
      "remarks": "Metronidazole wajib dimasukkan untuk merawat vaginitis bakteria yang lazim menyertai PID dan melindungi daripada kuman anaerobik."
    },
    "secondLineDrugs": [
      "ampicillin/sulbactam",
      "unasyn",
      "doxycycline",
      "clindamycin",
      "gentamicin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Ampicillin/Sulbactam 3g Q6H + Oral Doxycycline 100mg BD x 14 hari (atau IV Clindamycin 900mg Q8H + IV Gentamicin 2mg/kg loading kemudian 1.5mg/kg Q8H).",
      "routeAndDose": "IV.",
      "durationDays": "14 days",
      "remarks": "Untuk pesakit yang tidak bertindak balas terhadap sefalosporin atau mengalami abses pelvis kompleks."
    },
    "allergyDrugs": [
      "clindamycin",
      "gentamicin",
      "moxifloxacin",
      "metronidazole"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Moxifloxacin 400mg OD x 14 hari (or IV Clindamycin 900mg Q8H + IV Gentamicin 2mg/kg loading kemudian 1.5mg/kg Q8H x 14 hari)",
      "routeAndDose": "Oral/IV.",
      "remarks": "Moxifloxacin memberi liputan intrapelvis luas termasuk kuman atipikal."
    },
    "amsNotes": [
      "NOTIFIKASI DAN RAWATAN PASANGAN SEKSUAL: Semua pasangan seksual dalam tempoh 60 hari lepas wajib dirawat untuk Chlamydia dan Gonorrhoea bagi mengelakkan jangkitan semula (ping-pong transmission).",
      "Keluarkan alat dalam rahim (IUCD) jika tiada pemulihan klinikal selepas 48-72 jam terapi antibiotik."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / CDC STI Treatment Guidelines 2021)"
  },
  {
    "id": "NAG-A6-002",
    "targetPopulation": "Adult",
    "categoryCode": "A6",
    "categoryTitle": "A6 : Obstetrics & Gynaecological Infections",
    "topic": "2. POSTPARTUM ENDOMETRITIS & CHORIOAMNIONITIS",
    "topicNumber": 2,
    "bodySystem": "Obstetrics & Gynaecological Infections",
    "conditionName": "Postpartum Endometritis & Intra-Amniotic Infection (Chorioamnionitis)",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Group B Streptococcus (Streptococcus agalactiae)",
      "Enterococcus faecalis",
      "Escherichia coli & Klebsiella pneumoniae",
      "Bacteroides bivius & Peptostreptococcus",
      "Ureaplasma urealyticum"
    ],
    "firstLineDrugs": [
      "clindamycin",
      "gentamicin",
      "ampicillin",
      "co-amoxiclav",
      "augmentin"
    ],
    "firstLineTherapy": {
      "regimen": "Endometritis Pasca-Pembedahan Caesarean (Gold Standard): IV Clindamycin 900mg Q8H + IV Gentamicin 5mg/kg OD (+ IV Ampicillin 2g Q6H jika disyaki Enterococcus / sepsis). Alternatif: IV Co-Amoxiclav 1.2g TDS. Korioamnionitis Semasa Bersalin: IV Ampicillin 2g Q6H + IV Gentamicin 5mg/kg OD.",
      "routeAndDose": "IV diteruskan sehingga pesakit afebril dan tiada sakit rahim selama sekurang-kurangnya 24 - 48 jam.",
      "durationDays": "Sehingga 48 jam afebril (biasanya 3 - 5 hari; terapi oral susulan di rumah TIDAK diperlukan jika pulih)",
      "remarks": "Suntikan antibiotik profilaksis pra-pembedahan C-section (Cefazolin 2g stat) terbukti mengurangkan kadar endometritis sehingga 70%."
    },
    "secondLineDrugs": [
      "piperacillin/tazobactam",
      "tazocin",
      "meropenem"
    ],
    "secondLineTherapy": {
      "regimen": "IV Piperacillin/Tazobactam 4.5g Q8H atau IV Meropenem 1g Q8H",
      "routeAndDose": "IV.",
      "durationDays": "5 - 7 days",
      "remarks": "Untuk kes komplikasi septik pelvik tromboflebitis atau abses luka pembedahan yang meluas."
    },
    "allergyDrugs": [
      "clindamycin",
      "gentamicin",
      "ciprofloxacin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Clindamycin 900mg Q8H + IV Gentamicin 5mg/kg OD",
      "routeAndDose": "IV.",
      "remarks": "Rejimen standard emas Clindamycin + Gentamicin sememangnya selamat untuk pesakit alahan penisilin."
    },
    "amsNotes": [
      "Jika demam berterusan >48-72 jam walaupun dengan antibiotik optimum, lakukan pemeriksaan CT pelvis untuk menyingkirkan Hematoma Terinfeksi, Abses Pelvis, atau Septic Pelvic Thrombophlebitis (SPT).",
      "Ibu digalakkan meneruskan penyusuan susu ibu (kedua-dua Clindamycin dan Gentamicin serasi dengan penyusuan)."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / ACOG Clinical Practice Guidelines)"
  },
  {
    "id": "NAG-A6-003",
    "targetPopulation": "Adult",
    "categoryCode": "A6",
    "categoryTitle": "A6 : Obstetrics & Gynaecological Infections",
    "topic": "3. MASTITIS & BREAST ABSCESS",
    "topicNumber": 3,
    "bodySystem": "Obstetrics & Gynaecological Infections",
    "conditionName": "Puerperal Lactational Mastitis & Breast Abscess",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Staphylococcus aureus (MSSA & MRSA)",
      "Staphylococcus epidermidis",
      "Streptococcus pyogenes"
    ],
    "firstLineDrugs": [
      "cloxacillin",
      "cephalexin",
      "amoxicillin/clavulanic acid",
      "augmentin"
    ],
    "firstLineTherapy": {
      "regimen": "Oral Cloxacillin 500mg Q6H x 10-14 hari (atau Oral Cephalexin 500mg Q6H x 10-14 hari / Oral Augmentin 625mg TDS).",
      "routeAndDose": "Oral diambil semasa perut kosong (1 jam sebelum atau 2 jam selepas makan bagi Cloxacillin).",
      "durationDays": "10 - 14 days",
      "remarks": "NASIHAT PENYUSUAN KRITIKAL: Teruskan penyusuan susu ibu atau perahan susu dari payudara yang terjejas secara kerap untuk mengosongkan duktus susu yang tersumbat."
    },
    "secondLineDrugs": [
      "clindamycin",
      "co-trimoxazole",
      "bactrim",
      "vancomycin"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Clindamycin 300-450mg TDS x 10-14 hari atau Oral Bactrim Forte 1 tab BD (jika bayi sihat berumur >2 bulan dan tiada jaundis/G6PD).",
      "routeAndDose": "Oral.",
      "durationDays": "10 - 14 days",
      "remarks": "Bagi kes mastitis dengan risiko jangkitan Community-Acquired MRSA."
    },
    "allergyDrugs": [
      "erythromycin",
      "azithromycin",
      "clindamycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Erythromycin Ethylsuccinate (EES) 400mg QID x 10-14 hari atau Oral Azithromycin 500mg OD x 3 hari atau Oral Clindamycin 300mg TDS",
      "routeAndDose": "Oral.",
      "remarks": "Sesuai untuk ibu yang mempunyai sejarah alergi penisilin."
    },
    "amsNotes": [
      "Lakukan Ultrasound Payudara jika terdapat jisim berfluktuasi atau tiada tindak balas selepas 48 jam untuk mengesan Pembentukan Abses Payudara.",
      "Abses payudara wajib dirawat dengan aspirasi jarum bersiri berpandukan USG atau insisi dan penyaliran (I&D) kecil."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / ABM Clinical Protocol #4)"
  },
  {
    "id": "NAG-A6-004",
    "targetPopulation": "Adult",
    "categoryCode": "A6",
    "categoryTitle": "A6 : Obstetrics & Gynaecological Infections",
    "topic": "4. VULVOVAGINAL INFECTIONS",
    "topicNumber": 4,
    "bodySystem": "Obstetrics & Gynaecological Infections",
    "conditionName": "Bacterial Vaginosis, Trichomoniasis & Vulvovaginal Candidiasis",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Gardnerella vaginalis & Anaerobes (Bacterial Vaginosis)",
      "Trichomonas vaginalis (Trichomoniasis)",
      "Candida albicans & Candida glabrata (Vaginal Candidiasis)"
    ],
    "firstLineDrugs": [
      "metronidazole",
      "clotrimazole",
      "fluconazole"
    ],
    "firstLineTherapy": {
      "regimen": "Vaginosis Bakteria (BV): Oral Metronidazole 400-500mg BD x 7 hari. Trichomoniasis: Oral Metronidazole 400-500mg BD x 7 hari (atau 2g stat) + RAWAT PASANGAN SEKSUAL. Kandidiasis Faraj: Pessari Clotrimazole 500mg intravagina stat (atau Oral Fluconazole 150mg stat).",
      "routeAndDose": "Oral atau Pessari Intravagina malam.",
      "durationDays": "Stat dose sehingga 7 hari",
      "remarks": "Wanita hamil dengan Kandidiasis Faraj HANYA BOLEH menggunakan Pessari Clotrimazole topikal selama 7 hari (Oral Fluconazole TIDAK disyorkan semasa trimester pertama kehamilan)."
    },
    "secondLineDrugs": [
      "clindamycin",
      "tinidazole"
    ],
    "secondLineTherapy": {
      "regimen": "Krim Vagina Clindamycin 2% waktu malam x 7 hari atau Oral Tinidazole 2g stat.",
      "routeAndDose": "Topikal / Oral.",
      "durationDays": "1 - 7 days",
      "remarks": "Untuk kes alahan atau intoleransi gastrik teruk terhadap Metronidazole."
    },
    "allergyDrugs": [
      "clindamycin",
      "clotrimazole"
    ],
    "penicillinAllergyOption": {
      "regimen": "Semua rejimen di atas adalah bebas beta-laktam dan selamat digunakan pada pesakit alahan penisilin.",
      "routeAndDose": "Oral / Topikal.",
      "remarks": "Tiada sebarang risiko alahan penisilin."
    },
    "amsNotes": [
      "Nasihatkan pesakit MENGELAKKAN ALKOHOL sepenuhnya semasa mengambil Metronidazole dan selama 48 jam selepas dos terakhir kerana risiko tindak balas Disulfiram-like.",
      "Trichomoniasis adalah jangkitan kelamin (STI); pasangan seks wajib diperiksa dan dirawat secara serentak."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / CDC STI Treatment Guidelines)"
  },
  {
    "id": "NAG-A7-001",
    "targetPopulation": "Adult",
    "categoryCode": "A7",
    "categoryTitle": "A7 : Ocular Infections",
    "topic": "1. BACTERIAL CONJUNCTIVITIS & OPHTHALMIA",
    "topicNumber": 1,
    "bodySystem": "Ocular Infections",
    "conditionName": "Acute Purulent Bacterial Conjunctivitis & Adult Gonococcal Ophthalmia",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Staphylococcus aureus & Streptococcus pneumoniae",
      "Haemophilus influenzae",
      "Neisseria gonorrhoeae (Hyperacute purulent ophthalmia)",
      "Chlamydia trachomatis (Inclusion conjunctivitis)"
    ],
    "firstLineDrugs": [
      "chloramphenicol",
      "gentamicin",
      "ceftriaxone",
      "azithromycin"
    ],
    "firstLineTherapy": {
      "regimen": "Konjunktivitis Bakteria Lazim: Titisan Mata Chloramphenicol 0.5% 1-2 titis setiap 2 jam (fasa akut 48 jam) kemudian QID x 5-7 hari (atau Titisan Gentamicin 0.3%). Oftalmia Gonokokal Dewasa: IM Ceftriaxone 1g stat + Oral Azithromycin 1g stat + Cuci mata kerap dengan larutan salin steril.",
      "routeAndDose": "Topikal titisan mata / IM suntikan parenteral.",
      "durationDays": "5 - 7 days (Topikal) / Stat dose (Gonococcal)",
      "remarks": "Oftalmia gonokokal adalah kecemasan oftalmologi kerana boleh menyebabkan pencairan kornea (corneal ulceration & perforation) dalam masa 24-48 jam jika lewat dirawat."
    },
    "secondLineDrugs": [
      "ciprofloxacin",
      "levofloxacin",
      "doxycycline"
    ],
    "secondLineTherapy": {
      "regimen": "Titisan Mata Ciprofloxacin 0.3% atau Titisan Levofloxacin 0.5% QID x 7 hari (Chlamydia: Oral Doxycycline 100mg BD x 7 hari).",
      "routeAndDose": "Topikal / Oral.",
      "durationDays": "7 days",
      "remarks": "Untuk kes alahan atau rintangan terhadap Chloramphenicol."
    },
    "allergyDrugs": [
      "ciprofloxacin",
      "levofloxacin",
      "azithromycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "Topikal Fluoroquinolone (Ciprofloxacin 0.3% / Levofloxacin 0.5%) + Oral Azithromycin 2g stat (jika Gonococcal)",
      "routeAndDose": "Topikal / Oral.",
      "remarks": "Selamat untuk pesakit alahan penisilin."
    },
    "amsNotes": [
      "Nasihatkan pesakit mencuci tangan dengan teliti dan TIDAK berkongsi tuala atau bantal untuk mengelakkan penularan kepada ahli keluarga.",
      "Elakkan pemakaian kanta lekap (contact lens) sehingga mata pulih sepenuhnya sekurang-kurangnya 48 jam selepas tamat rawatan."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / AAO Preferred Practice Pattern)"
  },
  {
    "id": "NAG-A7-002",
    "targetPopulation": "Adult",
    "categoryCode": "A7",
    "categoryTitle": "A7 : Ocular Infections",
    "topic": "2. MICROBIAL KERATITIS & CORNEAL ULCER",
    "topicNumber": 2,
    "bodySystem": "Ocular Infections",
    "conditionName": "Bacterial & Fungal Microbial Keratitis (Ulser Kornea)",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Pseudomonas aeruginosa (terutamanya pemakai kanta lekap)",
      "Staphylococcus aureus & CoNS",
      "Streptococcus pneumoniae",
      "Fusarium spp. & Aspergillus spp. (Kulat pasca-trauma tumbuhan)"
    ],
    "firstLineDrugs": [
      "levofloxacin",
      "moxifloxacin",
      "cefazolin",
      "gentamicin",
      "natamycin"
    ],
    "firstLineTherapy": {
      "regimen": "Keratitis Bakteria (Ulser Kecil Bukan Pusat): Titisan Moxifloxacin 0.5% atau Levofloxacin 1.5% setiap 1 jam siang dan malam. Keratitis Teruk / Melibatkan Paksi Visual: Titisan Mata Diperkukuh (Fortified Eye Drops): Fortified Cefazolin 5% (50mg/mL) berselang-seli setiap 1 jam dengan Fortified Gentamicin 1.4% (atau Fortified Ceftazidime 5%). Keratitis Kulat: Titisan Natamycin 5% setiap 1 jam.",
      "routeAndDose": "Topikal mata dos intensif setiap jam.",
      "durationDays": "14 - 28 days (dipantau rapat oleh Pakar Mata)",
      "remarks": "RUJUK SEGERA KEPADA PAKAR OFTALMOLOGI DALAM MASA 24 JAM. Ambil kikisan kornea (corneal scraping) untuk pewarnaan Gram, KOH, dan Kultur C&S sebelum titisan dimulakan."
    },
    "secondLineDrugs": [
      "voriconazole",
      "amphotericin b"
    ],
    "secondLineTherapy": {
      "regimen": "Titisan Mata Fortified Voriconazole 1% atau Amphotericin B 0.15% setiap 1 jam untuk keratitis kulat refraktori.",
      "routeAndDose": "Topikal diperkukuh.",
      "durationDays": "4 - 6 weeks",
      "remarks": "Disediakan di bawah pengawasan Farmasi Bilik Bersih Aseptik Hospital."
    },
    "allergyDrugs": [
      "moxifloxacin",
      "levofloxacin",
      "gentamicin"
    ],
    "penicillinAllergyOption": {
      "regimen": "Titisan Moxifloxacin 0.5% + Titisan Fortified Gentamicin 1.4% atau Fortified Amikacin 2.5%",
      "routeAndDose": "Topikal intensif.",
      "remarks": "Bebas kompaun sefalosporin/penisilin."
    },
    "amsNotes": [
      "JANGAN SESEKALI MEMBERIKAN TITISAN MATA STEROID pada peringkat awal ulser kornea yang belum diketahui etiologinya kerana boleh memburukkan jangkitan kulat dan mencetuskan perforasi kornea.",
      "Kanta lekap dan bekas kanta lekap pesakit perlu dihantar ke makmal mikrobiologi untuk kultur."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / AAO Cornea Guidelines)"
  },
  {
    "id": "NAG-A7-003",
    "targetPopulation": "Adult",
    "categoryCode": "A7",
    "categoryTitle": "A7 : Ocular Infections",
    "topic": "3. ENDOPHTHALMITIS",
    "topicNumber": 3,
    "bodySystem": "Ocular Infections",
    "conditionName": "Acute Post-Operative, Post-Traumatic & Endogenous Endophthalmitis",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Staphylococcus epidermidis & MSSA/MRSA",
      "Streptococcus pneumoniae & Strep viridans",
      "Pseudomonas aeruginosa & Klebsiella pneumoniae (Endogenous liver abscess)",
      "Candida albicans & Aspergillus spp."
    ],
    "firstLineDrugs": [
      "vancomycin",
      "ceftazidime",
      "amikacin",
      "dexamethasone"
    ],
    "firstLineTherapy": {
      "regimen": "Suntikan Intravitreal Kecemasan: Intravitreal Vancomycin 1.0mg / 0.1mL + Intravitreal Ceftazidime 2.25mg / 0.1mL (+/- Intravitreal Dexamethasone 0.4mg / 0.1mL) + PEMBEDAHAN VITREKTOMI PARS PLANA (PPV).",
      "routeAndDose": "Suntikan terus ke dalam rongga vitreous mata oleh Pakar Bedah Vitreoretina.",
      "durationDays": "Dos suntikan intravitreal boleh diulang selepas 48 jam jika tiada pembaikan klinikal",
      "remarks": "KECEMASAN OFTALMOLOGI TAHAP TERTINGGI: Setiap jam kelewatan meningkatkan risiko buta kekal (irreversible visual loss)."
    },
    "secondLineDrugs": [
      "voriconazole",
      "amphotericin b",
      "meropenem"
    ],
    "secondLineTherapy": {
      "regimen": "Endoftalmitis Kulat: Intravitreal Voriconazole 100mcg / 0.1mL (atau Amphotericin B 5-10mcg / 0.1mL) + Sistemik Oral/IV Voriconazole 200mg BD.",
      "routeAndDose": "Intravitreal + Sistemik.",
      "durationDays": "Berdasarkan pemantauan retina",
      "remarks": "Wajib rawat punca primer (seperti abses hepar Klebsiella atau fungemia)."
    },
    "allergyDrugs": [
      "vancomycin",
      "amikacin"
    ],
    "penicillinAllergyOption": {
      "regimen": "Intravitreal Vancomycin 1.0mg / 0.1mL + Intravitreal Amikacin 0.4mg / 0.1mL",
      "routeAndDose": "Intravitreal.",
      "remarks": "Gantikan Ceftazidime dengan Amikacin jika alahan teruk sefalosporin."
    },
    "amsNotes": [
      "Ambil sampel biopsi/aspirat vitreous dan cecair aqueous humor untuk pewarnaan serta kultur mikrobiologi sebelum suntikan intravitreal.",
      "Antibiotik sistemik oral/IV sahaja TIDAK MENCUKUPI kerana kebolehtelapan sawar darah-retina (blood-retinal barrier) yang rendah."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / EVS & Royal College of Ophthalmologists Protocol)"
  },
  {
    "id": "NAG-A7-004",
    "targetPopulation": "Adult",
    "categoryCode": "A7",
    "categoryTitle": "A7 : Ocular Infections",
    "topic": "4. ORBITAL & PRESEPTAL CELLULITIS",
    "topicNumber": 4,
    "bodySystem": "Ocular Infections",
    "conditionName": "Preseptal Cellulitis vs Post-Septal Orbital Cellulitis",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Staphylococcus aureus (MSSA & MRSA)",
      "Streptococcus pneumoniae & Strep pyogenes",
      "Haemophilus influenzae",
      "Anaerobes (sinus-related)"
    ],
    "firstLineDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "ceftriaxone",
      "metronidazole",
      "unasyn",
      "ampicillin/sulbactam"
    ],
    "firstLineTherapy": {
      "regimen": "Selulitis Preseptal: Oral Augmentin 625mg TDS x 7-10 hari. Selulitis Orbital (Kecemasan): IV Ceftriaxone 2g OD + IV Metronidazole 500mg TDS (atau IV Co-Amoxiclav 1.2g TDS / IV Ampicillin-Sulbactam 3g Q6H) + IV Cloxacillin 2g Q4H.",
      "routeAndDose": "IV parenteral dos tinggi.",
      "durationDays": "10 - 14 days (panjangkan ke 3-4 minggu jika ada pembentukan abses subperiosteal)",
      "remarks": "Selulitis Orbital ditandakan oleh proptosis, sakit semasa pergerakan bola mata, ophthalmoplegia, dan penurunan ketajaman penglihatan; WAJIB lakukan CT Orbit & Paranasal Sinus berkontras segera."
    },
    "secondLineDrugs": [
      "piperacillin/tazobactam",
      "tazocin",
      "meropenem",
      "vancomycin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Tazocin 4.5g Q6H + IV Vancomycin 15-20mg/kg Q12H (atau IV Meropenem 1g-2g Q8H)",
      "routeAndDose": "IV infusi.",
      "durationDays": "14 days",
      "remarks": "Untuk jangkitan sinus odontogenik teruk, pesakit imunokompromais, atau ancaman trombosis sinus kavernosus."
    },
    "allergyDrugs": [
      "clindamycin",
      "ciprofloxacin",
      "vancomycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Clindamycin 600-900mg Q8H + IV Ciprofloxacin 400mg Q12H (or IV Vancomycin 15mg/kg Q12H + IV Ciprofloxacin)",
      "routeAndDose": "IV.",
      "remarks": "Selamat untuk pesakit alahan penisilin."
    },
    "amsNotes": [
      "Rujuk bersama Pakar ENT dan Pakar Oftalmologi untuk penilaian penyaliran endoskopik sinus (FESS) atau penyaliran abses subperiosteal.",
      "Pantau tindak balas pupil (RAPD) dan penglihatan warna setiap 4 jam untuk mengesan mampatan saraf optik."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / ENT-Ophthalmology Consensus)"
  },
  {
    "id": "NAG-A8-001",
    "targetPopulation": "Adult",
    "categoryCode": "A8",
    "categoryTitle": "A8 : Oral / Dental Infections",
    "topic": "1. ODONTOGENIC ABSCESS & DEEP FASCIAL INFECTIONS",
    "topicNumber": 1,
    "bodySystem": "Oral / Dental Infections",
    "conditionName": "Odontogenic Periapical Abscess, Submandibular Space Infection & Ludwig's Angina",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Viridans group Streptococci (S. mutans, S. anginosus)",
      "Oral Anaerobes (Peptostreptococcus, Prevotella, Fusobacterium necrophorum)",
      "Porphyromonas gingivalis",
      "Staphylococcus aureus"
    ],
    "firstLineDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "ampicillin/sulbactam",
      "unasyn",
      "metronidazole",
      "amoxicillin"
    ],
    "firstLineTherapy": {
      "regimen": "Abses Periapikal Ringan: Oral Amoxicillin 500mg TDS + Oral Metronidazole 400mg TDS x 5-7 hari (atau Oral Augmentin 625mg TDS). Jangkitan Ruang Fasial Dalam / Ludwig's Angina: IV Co-Amoxiclav 1.2g TDS (or IV Ampicillin-Sulbactam 1.5g-3g Q6H) + PENGAWALAN SALURAN PERNAFASAN SEGERA & PENYALIRAN PEMBEDAHAN.",
      "routeAndDose": "Oral untuk abses terlokalisasi; IV untuk selulitis submandibular/Ludwig's angina.",
      "durationDays": "5 - 7 days (ringan) / 7 - 14 days (ruang fasial dalam)",
      "remarks": "Ludwig's Angina adalah kecemasan saluran pernafasan; utamakan intubasi fiberoptik atau trakeostomi kecemasan sebelum manipulasi pembedahan."
    },
    "secondLineDrugs": [
      "piperacillin/tazobactam",
      "tazocin",
      "ceftriaxone",
      "metronidazole"
    ],
    "secondLineTherapy": {
      "regimen": "IV Piperacillin/Tazobactam 4.5g Q6H atau IV Ceftriaxone 2g OD + IV Metronidazole 500mg TDS",
      "routeAndDose": "IV.",
      "durationDays": "7 - 14 days",
      "remarks": "Bagi kes merebak ke ruang parafaringeal atau mediastinum (mediastinitis menurun)."
    },
    "allergyDrugs": [
      "clindamycin",
      "metronidazole",
      "clarithromycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral/IV Clindamycin 300-600mg Q8H x 7 hari (atau Oral Clarithromycin 500mg BD + Oral Metronidazole 400mg TDS)",
      "routeAndDose": "Oral/IV.",
      "remarks": "Clindamycin mempunyai penembusan tisu tulang dan ruang fasial mulut yang sangat cemerlang."
    },
    "amsNotes": [
      "RAWATAN DENTIS UTAMA: Rawatan akar gigi (Root Canal Treatment) atau cabutan gigi penyebab (extraction) berserta insisi nanah adalah syarat wajib penyembuhan.",
      "Antibiotik tanpa rawatan pembedahan pergigian akan menyebabkan abses berulang."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / Malaysian Dental Association Guidelines)"
  },
  {
    "id": "NAG-A8-002",
    "targetPopulation": "Adult",
    "categoryCode": "A8",
    "categoryTitle": "A8 : Oral / Dental Infections",
    "topic": "2. ACUTE NECROTIZING ULCERATIVE GINGIVITIS (ANUG)",
    "topicNumber": 2,
    "bodySystem": "Oral / Dental Infections",
    "conditionName": "Acute Necrotizing Ulcerative Gingivitis (ANUG / Vincent's Infection) & Severe Periodontitis",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Treponema denticola & Oral Spirochetes",
      "Fusobacterium nucleatum",
      "Prevotella intermedia",
      "Porphyromonas gingivalis"
    ],
    "firstLineDrugs": [
      "metronidazole",
      "amoxicillin",
      "chlorhexidine"
    ],
    "firstLineTherapy": {
      "regimen": "Oral Metronidazole 400mg TDS x 5 hari + Oral Amoxicillin 500mg TDS x 5 hari + Kumuran Mulut Chlorhexidine Gluconate 0.2% 15mL BD + Debridement Ultrasonik Karang Gigi.",
      "routeAndDose": "Oral + Kumuran mulut antiseptik topikal.",
      "durationDays": "5 days",
      "remarks": "Metronidazole adalah ubat pilihan utama kerana aktiviti pembasmian spiroket dan anaerobik fusiform yang amat kuat."
    },
    "secondLineDrugs": [
      "doxycycline",
      "amoxicillin/clavulanic acid",
      "augmentin"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Doxycycline 100mg BD x 7 hari atau Oral Augmentin 625mg TDS x 5 hari.",
      "routeAndDose": "Oral.",
      "durationDays": "5 - 7 days",
      "remarks": "Alternatif untuk periodontitis refraktori agresif."
    },
    "allergyDrugs": [
      "metronidazole",
      "erythromycin",
      "doxycycline"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Metronidazole 400mg TDS x 5 hari + Oral Doxycycline 100mg BD x 7 hari",
      "routeAndDose": "Oral.",
      "remarks": "Selamat untuk pesakit alahan penisilin."
    },
    "amsNotes": [
      "Nasihatkan pesakit mengenai penjagaan kebersihan mulut, berhenti merokok, dan kawalan tekanan mental/nutrisi yang kerap menjadi faktor pencetus ANUG.",
      "Gunakan analgesia yang mencukupi untuk membolehkan pesakit memberus gigi dengan lembut."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / EFP Periodontology Guidelines)"
  },
  {
    "id": "NAG-A9-001",
    "targetPopulation": "Adult",
    "categoryCode": "A9",
    "categoryTitle": "A9 : Orthopaedic Infections",
    "topic": "1. ACUTE & CHRONIC OSTEOMYELITIS",
    "topicNumber": 1,
    "bodySystem": "Orthopaedic Infections",
    "conditionName": "Acute & Chronic Osteomyelitis (Osteomielitis Akut & Kronik)",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Staphylococcus aureus (MSSA & MRSA)",
      "Streptococcus pyogenes & Strep agalactiae",
      "Pseudomonas aeruginosa (terutamanya luka tusukan tapak kaki / kencing manis)",
      "Enterobacterales (Klebsiella, E. coli, Salmonella)",
      "Anaerobes (dalam osteomielitis kronik polymicrobial)"
    ],
    "firstLineDrugs": [
      "cloxacillin",
      "cefazolin",
      "ceftriaxone",
      "ciprofloxacin"
    ],
    "firstLineTherapy": {
      "regimen": "IV Cloxacillin 2g Q4H (or IV Cefazolin 2g Q8H) selama 2-3 minggu pertama, diikuti pertukaran oral sasaran (Oral Cephalexin 1g Q6H atau Cloxacillin 1g Q6H) untuk melengkapkan jumlah 6 MINGGU.",
      "routeAndDose": "IV dos tinggi parenteral diikuti terapi oral bertindak balas.",
      "durationDays": "Minimum 6 weeks total (4-6 minggu osteomielitis akut, 6-12 minggu osteomielitis kronik)",
      "remarks": "Pembedahan Sekuestrektomi & Debridement Tulang Mati (Debridement of necrotic bone) adalah WAJIB untuk osteomielitis kronik kerana antibiotik tidak mampu menembusi sekuestrum tulang avaskular."
    },
    "secondLineDrugs": [
      "vancomycin",
      "daptomycin",
      "rifampicin",
      "piperacillin/tazobactam"
    ],
    "secondLineTherapy": {
      "regimen": "IV Vancomycin 15-20mg/kg Q12H (trough 15-20 mcg/mL) + Oral Rifampicin 300-450mg BD (atau IV Daptomycin 8-10mg/kg OD)",
      "routeAndDose": "IV infusi + Oral.",
      "durationDays": "6 - 12 weeks",
      "remarks": "Untuk jangkitan MRSA disahkan atau pesakit dengan implan logam osteosintesis."
    },
    "allergyDrugs": [
      "vancomycin",
      "daptomycin",
      "clindamycin",
      "co-trimoxazole",
      "bactrim"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Vancomycin 15-20mg/kg Q12H (trough 15-20) kemudian Oral Clindamycin 450mg Q6H atau Oral Bactrim Forte 2 tabs BD x 6 minggu",
      "routeAndDose": "IV bertukar ke Oral.",
      "remarks": "Sesuai untuk pesakit alahan penisilin."
    },
    "stepDownDrugs": [
      "cephalexin",
      "cloxacillin",
      "ciprofloxacin",
      "co-trimoxazole",
      "bactrim"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Cephalexin 1g Q6H atau Oral Cloxacillin 1g Q6H (atau Ciprofloxacin 750mg BD jika Gram-negatif) selepas 2 minggu parenteral.",
      "criteria": "Penurunan konsisten penanda radang ESR / CRP >50%, luka pembedahan kering dan sembuh, pesakit afebril, tiada sekuestrum residual pada radiograf."
    },
    "amsNotes": [
      "Ambil biopsi tisu tulang / kuretaj dalam semasa pembedahan untuk kultur mikrobiologi dan histopatologi; JANGAN bergantung pada kultur sapuan swab luka cetek (superficial swab sering kali hanya menunjukkan kolonisasi kulit).",
      "Pantau ESR dan CRP secara bersiri setiap 2 minggu untuk menilai respons terapi."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IDSA Osteomyelitis Guidelines / OVIVA Trial)"
  },
  {
    "id": "NAG-A9-002",
    "targetPopulation": "Adult",
    "categoryCode": "A9",
    "categoryTitle": "A9 : Orthopaedic Infections",
    "topic": "2. SEPTIC ARTHRITIS",
    "topicNumber": 2,
    "bodySystem": "Orthopaedic Infections",
    "conditionName": "Native Joint Septic Arthritis & Disseminated Gonococcal Arthritis",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Staphylococcus aureus (MSSA & MRSA)",
      "Streptococcus pneumoniae & Strep pyogenes",
      "Neisseria gonorrhoeae (Dewasa muda aktif seksual)",
      "Gram-negative bacilli (E. coli, Pseudomonas pada warga emas/imunokompromais)"
    ],
    "firstLineDrugs": [
      "cloxacillin",
      "cefazolin",
      "ceftriaxone"
    ],
    "firstLineTherapy": {
      "regimen": "Artritis Septik Bukan Gonokokal: IV Cloxacillin 2g Q4H (or IV Cefazolin 2g Q8H) + ASPIRASI JARUM SENDI HARIAN / ARTROTOMI PENYALIRAN KECEMASAN. Artritis Gonokokal: IV Ceftriaxone 1g-2g OD + Oral Azithromycin 1g stat.",
      "routeAndDose": "IV dos tinggi parenteral.",
      "durationDays": "3 - 4 weeks total (14 hari untuk Gonococcal; 3-4 minggu untuk Staphylococcal)",
      "remarks": "Sendi bernanah adalah KECEMASAN ORTOPEDIK kerana enzim lisosom granulosit boleh memusnahkan rawan sendi (articular cartilage lysis) secara kekal dalam masa beberapa hari."
    },
    "secondLineDrugs": [
      "vancomycin",
      "ceftriaxone",
      "ceftazidime"
    ],
    "secondLineTherapy": {
      "regimen": "IV Vancomycin 15-20mg/kg Q12H (+ IV Ceftriaxone 2g OD jika risiko kuman Gram-negatif tinggi)",
      "routeAndDose": "IV.",
      "durationDays": "3 - 4 weeks",
      "remarks": "Bagi pesakit septik dengan risiko MRSA atau alahan sefalosporin."
    },
    "allergyDrugs": [
      "vancomycin",
      "clindamycin",
      "ciprofloxacin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Vancomycin 15-20mg/kg Q12H (atau IV Clindamycin 900mg Q8H)",
      "routeAndDose": "IV.",
      "remarks": "Bebas beta-laktam."
    },
    "stepDownDrugs": [
      "cephalexin",
      "cloxacillin",
      "amoxicillin/clavulanic acid",
      "augmentin"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Cephalexin 1g Q6H atau Oral Augmentin 625mg TDS selepas sekurang-kurangnya 1-2 minggu parenteral.",
      "criteria": "Cecair sinovial jernih dan steril pada aspirasi ulangan, bengkak sendi surut, julat pergerakan sendi pulih tanpa sakit akut, CRP menurun."
    },
    "amsNotes": [
      "Hantar Cecair Sinovial Sendi untuk: Analisis Sel & Pembezaan, Pewarnaan Gram, Ujian Kristal Polariti (menyingkirkan Gout/Pseudogout), dan Kultur C&S sebelum antibiotik.",
      "Aspirasi sendi ulangan harian disyorkan jika efusi cecair bernanah terkumpul semula."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / BSR Guidelines for Septic Arthritis)"
  },
  {
    "id": "NAG-A9-003",
    "targetPopulation": "Adult",
    "categoryCode": "A9",
    "categoryTitle": "A9 : Orthopaedic Infections",
    "topic": "3. PROSTHETIC JOINT INFECTION (PJI)",
    "topicNumber": 3,
    "bodySystem": "Orthopaedic Infections",
    "conditionName": "Prosthetic Joint Infection (PJI) - Early DAIR vs Late Two-Stage Revision",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Staphylococcus epidermidis & CoNS (Biofilm forming)",
      "Staphylococcus aureus (MSSA & MRSA)",
      "Cutibacterium acnes (terutamanya implan bahu)",
      "Pseudomonas aeruginosa & Enterobacterales"
    ],
    "firstLineDrugs": [
      "vancomycin",
      "cefepime",
      "rifampicin",
      "cloxacillin",
      "cefazolin"
    ],
    "firstLineTherapy": {
      "regimen": "PJI Awal (<3 bulan pasca-bedah): Pembedahan DAIR (Debridement, Antibiotics & Implant Retention) + IV Vancomycin 15-20mg/kg Q12H + IV Cefepime 2g Q8H kemudian tambah Oral Rifampicin 300-450mg BD selepas luka kering x 3-6 BULAN.",
      "routeAndDose": "IV intensif awal kemudian Terapi Oral Penembusan Biofilm berpanjangan.",
      "durationDays": "3 months (Jumlah Artroplasti Lutut / TKR) sehingga 6 months (Jumlah Artroplasti Pinggul / THR)",
      "remarks": "Rifampicin bertindak secara spesifik merentasi matriks biofilm glikokaliks Staphylococcal pada permukaan logam/polietilena implan."
    },
    "secondLineDrugs": [
      "daptomycin",
      "ciprofloxacin",
      "rifampicin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Daptomycin 10mg/kg OD + Oral Rifampicin 450mg BD (atau Ciprofloxacin 750mg BD + Rifampicin bagi kuman Gram-negatif biofilm).",
      "routeAndDose": "IV + Oral.",
      "durationDays": "3 - 6 months",
      "remarks": "Untuk kes PJI rintang atau pesakit yang mengalami ketoksikan Vancomycin."
    },
    "allergyDrugs": [
      "vancomycin",
      "daptomycin",
      "rifampicin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Vancomycin 15mg/kg Q12H + Oral Rifampicin 300-450mg BD",
      "routeAndDose": "IV/Oral.",
      "remarks": "Rejimen standard bebas penisilin."
    },
    "amsNotes": [
      "Pembedahan Semakan Dua Peringkat (Two-Stage Revision with Antibiotic-loaded Bone Cement Spacer) adalah pilihan terbaik untuk jangkitan kronik lewat (>3 bulan) dengan implan longgar.",
      "Hentikan semua antibiotik sekurang-kurangnya 2 MINGGU sebelum aspirasi diagnostik sendi atau pembedahan semakan bagi memaksimumkan kadar positif kultur mikrobiologi."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IDSA PJI Guidelines / EBJIS Consensus)"
  },
  {
    "id": "NAG-A10-001",
    "targetPopulation": "Adult",
    "categoryCode": "A10",
    "categoryTitle": "A10 : Otorhinolaryngology Infections",
    "topic": "1. ACUTE OTITIS MEDIA & MASTOIDITIS",
    "topicNumber": 1,
    "bodySystem": "Otorhinolaryngology Infections",
    "conditionName": "Acute Suppurative Otitis Media (AOM) & Coalescent Mastoiditis",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Streptococcus pneumoniae",
      "Haemophilus influenzae (Non-typable)",
      "Moraxella catarrhalis",
      "Streptococcus pyogenes (Group A Strep)"
    ],
    "firstLineDrugs": [
      "amoxicillin",
      "amoxicillin/clavulanic acid",
      "augmentin",
      "ceftriaxone"
    ],
    "firstLineTherapy": {
      "regimen": "AOM Dewasa: Oral Amoxicillin 1g TDS x 7 hari (atau Oral Augmentin 625mg TDS x 7 hari). Mastoiditis Akut: IV Ceftriaxone 2g OD (or IV Co-Amoxiclav 1.2g TDS) + RUJUKAN KECEMASAN ENT UNTUK MIRINGOTOMI / MASTOIDEKTOMI.",
      "routeAndDose": "Oral untuk AOM; IV untuk mastoiditis.",
      "durationDays": "7 - 10 days (AOM) / 14 - 21 days (Mastoiditis)",
      "remarks": "Jika terdapat nanah keluar dari telinga akibat perforasi membran timpanik, ambil swab cecair untuk ujian C&S dan pastikan telinga sentiasa kering."
    },
    "secondLineDrugs": [
      "cefuroxime",
      "cefpodoxime",
      "azithromycin"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Cefuroxime Axetil 500mg BD x 7-10 hari atau Oral Azithromycin 500mg OD (hari 1) kemudian 250mg OD (hari 2-5).",
      "routeAndDose": "Oral.",
      "durationDays": "5 - 10 days",
      "remarks": "Bagi pesakit yang gagal bertindak balas terhadap Amoxicillin selepas 48-72 jam."
    },
    "allergyDrugs": [
      "clarithromycin",
      "azithromycin",
      "doxycycline",
      "levofloxacin"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Clarithromycin 500mg BD x 7 hari atau Oral Doxycycline 100mg BD x 7 hari atau Oral Levofloxacin 500mg OD",
      "routeAndDose": "Oral.",
      "remarks": "Sesuai untuk pesakit alahan penisilin."
    },
    "amsNotes": [
      "Jangan gunakan ubat titis telinga aminoglikosida (Gentamicin) jika membran timpanik telah bocor/perforasi kerana risiko ketoksikan koklea dan organ vestibular (ototoxicity).",
      "Lakukan imbasan CT Tulang Temporal jika mastoiditis disyaki untuk menolak abses subperiosteal Bezold atau trombosis sinus sigmoid."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / AAO-HNS AOM Guidelines)"
  },
  {
    "id": "NAG-A10-002",
    "targetPopulation": "Adult",
    "categoryCode": "A10",
    "categoryTitle": "A10 : Otorhinolaryngology Infections",
    "topic": "2. OTITIS EXTERNA & MALIGNANT OTITIS EXTERNA",
    "topicNumber": 2,
    "bodySystem": "Otorhinolaryngology Infections",
    "conditionName": "Acute Diffuse Otitis Externa & Necrotising Malignant Otitis Externa (MOE)",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Pseudomonas aeruginosa",
      "Staphylococcus aureus",
      "Candida albicans & Aspergillus niger (Otomycosis)"
    ],
    "firstLineDrugs": [
      "ciprofloxacin",
      "dexamethasone",
      "ceftazidime",
      "piperacillin/tazobactam",
      "tazocin"
    ],
    "firstLineTherapy": {
      "regimen": "Otitis Externa Biasa: Titisan Telinga Ciprofloxacin 0.3% + Dexamethasone 0.1% 4 titis BD x 7 hari + Cuci liang telinga (aural toilet). Malignant Otitis Externa (Pesakit Diabetes/Warga Emas): IV Ceftazidime 2g Q8H (or IV Tazocin 4.5g Q6H / IV Ciprofloxacin 400mg Q8H) selama 2-4 minggu diikuti Oral Ciprofloxacin 750mg BD sehingga 6-8 MINGGU.",
      "routeAndDose": "Topikal titisan telinga untuk kes biasa; IV bertukar Oral jangka panjang untuk Malignant Otitis Externa.",
      "durationDays": "7 days (Topikal) / 6 - 8 weeks (Malignant Otitis Externa)",
      "remarks": "Malignant Otitis Externa adalah osteomielitis pangkal tengkorak (skull base osteomyelitis) yang mengancam nyawa; disahkan dengan kehadiran tisu granulasi di dasar liang telinga luar dan kelumpuhan saraf kranial (CN VII)."
    },
    "secondLineDrugs": [
      "meropenem",
      "ciprofloxacin",
      "clotrimazole"
    ],
    "secondLineTherapy": {
      "regimen": "MOE: IV Meropenem 1g-2g Q8H x 6-8 minggu. Otomikosis (Kulat): Titisan Telinga Clotrimazole 1% TDS x 14 hari.",
      "routeAndDose": "IV / Topikal.",
      "durationDays": "14 days - 8 weeks",
      "remarks": "Bagi jangkitan Pseudomonas rintang ciprofloxacin atau jangkitan kulat aspergillus."
    },
    "allergyDrugs": [
      "ciprofloxacin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Ciprofloxacin 400mg Q8H bertukar ke Oral Ciprofloxacin 750mg BD x 6-8 minggu",
      "routeAndDose": "IV/Oral.",
      "remarks": "Selamat untuk pesakit alahan penisilin."
    },
    "amsNotes": [
      "Pantau ESR / CRP berkala setiap 2-4 minggu; terapi perlu diteruskan sehingga penanda radang kembali normal dan imbasan MRI / Gallium scan menunjukkan resolusi keradangan tulang.",
      "Kawalan ketat paras gula dalam darah (glisemik) adalah pra-syarat mutlak untuk penyembuhan MOE."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / ENT UK Guidelines)"
  },
  {
    "id": "NAG-A10-003",
    "targetPopulation": "Adult",
    "categoryCode": "A10",
    "categoryTitle": "A10 : Otorhinolaryngology Infections",
    "topic": "3. ACUTE RHINOSINUSITIS & PERITONSILLAR ABSCESS (QUINSY)",
    "topicNumber": 3,
    "bodySystem": "Otorhinolaryngology Infections",
    "conditionName": "Acute Bacterial Rhinosinusitis & Peritonsillar Abscess (Quinsy)",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Streptococcus pneumoniae & Haemophilus influenzae",
      "Streptococcus pyogenes (Group A Strep)",
      "Anaerobes (Fusobacterium, Prevotella, Peptostreptococcus)",
      "Staphylococcus aureus"
    ],
    "firstLineDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "benzylpenicillin",
      "metronidazole",
      "unasyn",
      "ampicillin/sulbactam"
    ],
    "firstLineTherapy": {
      "regimen": "Rinosinusitis Bakteria: Oral Augmentin 625mg TDS x 5-7 hari (atau Oral Amoxicillin 1g TDS). Abses Peritonsilar (Quinsy): ASPIRASI JARUM / INSISI & PENYALIRAN NANAH SEGERA + IV Benzylpenicillin 2-4 MU Q4H + IV Metronidazole 500mg TDS (atau IV Co-Amoxiclav 1.2g TDS).",
      "routeAndDose": "Oral untuk sinus; Prosedur penyaliran jarum + IV parenteral untuk Quinsy.",
      "durationDays": "5 - 7 days (Sinusitis) / 7 - 10 days (Quinsy)",
      "remarks": "Hampir 90% kes rinosinusitis akut adalah berpunca daripada VIRUS; antibiotik HANYA diberikan jika gejala berlanjutan >10 hari tanpa tanda pemulihan atau mengalami fenomena 'double sickening' (demam memuncak semula)."
    },
    "secondLineDrugs": [
      "ceftriaxone",
      "cefuroxime",
      "moxifloxacin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Ceftriaxone 2g OD + IV Metronidazole 500mg TDS (atau Oral Moxifloxacin 400mg OD x 7 hari).",
      "routeAndDose": "IV / Oral.",
      "durationDays": "7 - 10 days",
      "remarks": "Untuk kes komplikasi sinus (seperti selulitis periorbital) atau alahan penisilin ringan."
    },
    "allergyDrugs": [
      "clindamycin",
      "moxifloxacin",
      "levofloxacin",
      "doxycycline"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral/IV Clindamycin 600mg Q8H atau Oral Moxifloxacin 400mg OD x 7 hari (atau Oral Doxycycline 100mg BD x 7 hari)",
      "routeAndDose": "Oral/IV.",
      "remarks": "Sesuai untuk pesakit yang mempunyai rekod anafilaksis penisilin."
    },
    "stepDownDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "clindamycin"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Augmentin 625mg TDS atau Oral Clindamycin 300-450mg TDS selepas pesakit boleh menelan tanpa sakit tekak yang teruk.",
      "criteria": "Nanah peritonsilar telah dialirkan sepenuhnya, pesakit boleh bertolak ansur dengan cecair dan makanan lembut, afebril >24 jam."
    },
    "amsNotes": [
      "Cuci hidung dengan semburan larutan salin isotonik (Nasal Saline Douche) dan gunakan steroid semburan hidung (Fluticasone/Mometasone) sebagai terapi sampingan penting bagi sinusitis.",
      "Keluarkan nanah Quinsy dengan aspirasi jarum bersaiz 18G/19G di bilik rawatan kecemasan."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IDSA Rhinosinusitis Guidelines)"
  },
  {
    "id": "NAG-A10-004",
    "targetPopulation": "Adult",
    "categoryCode": "A10",
    "categoryTitle": "A10 : Otorhinolaryngology Infections",
    "topic": "4. EPIGLOTTITIS & DEEP NECK SPACE INFECTIONS",
    "topicNumber": 4,
    "bodySystem": "Otorhinolaryngology Infections",
    "conditionName": "Acute Adult Epiglottitis & Parapharyngeal / Retropharyngeal Space Infection",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Haemophilus influenzae type b & non-typable",
      "Streptococcus pneumoniae & Strep pyogenes",
      "Staphylococcus aureus (MSSA/MRSA)",
      "Oral Anaerobes (Fusobacterium necrophorum - Lemierre's syndrome)"
    ],
    "firstLineDrugs": [
      "ceftriaxone",
      "metronidazole",
      "amoxicillin/clavulanic acid",
      "augmentin",
      "ampicillin/sulbactam",
      "unasyn"
    ],
    "firstLineTherapy": {
      "regimen": "Epiglottitis Akut: PENILAIAN & PERLINDUNGAN SALURAN PERNAFASAN DI DEWAN BEDAH + IV Ceftriaxone 2g OD + IV Dexamethasone 4-8mg Q8H. Jangkitan Ruang Leher Dalam: IV Ceftriaxone 2g OD + IV Metronidazole 500mg TDS (atau IV Co-Amoxiclav 1.2g TDS / IV Ampicillin-Sulbactam 3g Q6H).",
      "routeAndDose": "IV infusi dos tinggi.",
      "durationDays": "7 - 14 days (Epiglottitis) / 14 - 21 days (Ruang leher dalam)",
      "remarks": "KECEMASAN AIRWAY: Jangan lakukan pemeriksaan tekak dengan tongue depressor pada epiglottitis tanpa persediaan intubasi kecemasan di dewan bedah."
    },
    "secondLineDrugs": [
      "piperacillin/tazobactam",
      "tazocin",
      "meropenem",
      "vancomycin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Tazocin 4.5g Q6H + IV Vancomycin 15-20mg/kg Q12H (atau IV Meropenem 1g Q8H)",
      "routeAndDose": "IV.",
      "durationDays": "14 - 21 days",
      "remarks": "Untuk kes mediastinitis menurun (descending necrotising mediastinitis) atau septik trombosis vena jugular (Lemierre's syndrome)."
    },
    "allergyDrugs": [
      "clindamycin",
      "ciprofloxacin",
      "vancomycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Clindamycin 900mg Q8H + IV Ciprofloxacin 400mg Q12H (+/- IV Vancomycin 15mg/kg Q12H)",
      "routeAndDose": "IV.",
      "remarks": "Bebas beta-laktam."
    },
    "amsNotes": [
      "Lakukan Imbasan CT Leher dan Toraks berkontras (Neck & Thorax CT) dengan segera untuk memetakan saiz abses dan mengesan penyebaran ke mediastinum.",
      "Pembedahan penyaliran abses leher dalam secara terbuka atau endoskopik oleh Pakar ENT adalah wajib."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / ASENT Airway Infection Guidelines)"
  },
  {
    "id": "NAG-A11-001",
    "targetPopulation": "Adult",
    "categoryCode": "A11",
    "categoryTitle": "A11 : Respiratory Infections",
    "topic": "1. COMMUNITY ACQUIRED PNEUMONIA (CAP)",
    "topicNumber": 1,
    "bodySystem": "Respiratory Infections",
    "conditionName": "Mild Community-Acquired Pneumonia (CAP Ringan / CURB-65 0-1 / Rawatan Pesakit Luar)",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Streptococcus pneumoniae (Pneumococcus)",
      "Mycoplasma pneumoniae",
      "Chlamydia pneumoniae",
      "Haemophilus influenzae"
    ],
    "firstLineDrugs": [
      "amoxicillin",
      "amoxicillin/clavulanic acid",
      "augmentin",
      "azithromycin",
      "clarithromycin",
      "doxycycline"
    ],
    "firstLineTherapy": {
      "regimen": "Oral Amoxicillin 1g TDS x 5 hari (atau Oral Augmentin 625mg TDS x 5 hari) +/- Oral Azithromycin 500mg OD x 3 hari (atau Oral Doxycycline 100mg BD x 5 hari jika disyaki patogen atipikal).",
      "routeAndDose": "Oral.",
      "durationDays": "5 days",
      "remarks": "Skor CURB-65 = 0 atau 1 (kadar mortaliti <1.5%). Pesakit boleh dirawat dengan selamat di klinik kesihatan / pesakit luar dengan nasihat pemantauan tanda bahaya (red flags)."
    },
    "secondLineDrugs": [
      "cefuroxime",
      "azithromycin",
      "levofloxacin"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Cefuroxime Axetil 500mg BD + Oral Azithromycin 500mg OD x 5 hari atau Oral Levofloxacin 500mg OD x 5 hari.",
      "routeAndDose": "Oral.",
      "durationDays": "5 days",
      "remarks": "Untuk pesakit yang mempunyai komorbiditi kronik (COPD, diabetes, kegagalan jantung) atau kegagalan dos pertama."
    },
    "allergyDrugs": [
      "azithromycin",
      "clarithromycin",
      "doxycycline",
      "levofloxacin"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Doxycycline 100mg BD x 5 hari atau Oral Azithromycin 500mg OD x 3-5 hari atau Oral Levofloxacin 500mg OD x 5 hari",
      "routeAndDose": "Oral.",
      "remarks": "Sesuai untuk pesakit alahan penisilin."
    },
    "amsNotes": [
      "Tempoh rawatan 5 hari adalah mencukupi sekiranya pesakit afebril >48 jam dan tiada tanda ketidakstabilan klinikal.",
      "Ujian X-ray dada ulangan segera tidak diperlukan jika pesakit pulih secara klinikal."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / BTS & ATS-IDSA Guidelines)"
  },
  {
    "id": "NAG-A11-002",
    "targetPopulation": "Adult",
    "categoryCode": "A11",
    "categoryTitle": "A11 : Respiratory Infections",
    "topic": "1. COMMUNITY ACQUIRED PNEUMONIA (CAP)",
    "topicNumber": 1,
    "bodySystem": "Respiratory Infections",
    "conditionName": "Moderate Community-Acquired Pneumonia (CAP Sederhana / CURB-65 = 2 / Wad Am)",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Streptococcus pneumoniae",
      "Mycoplasma pneumoniae & Chlamydia pneumoniae",
      "Legionella pneumophila",
      "Klebsiella pneumoniae & Haemophilus influenzae"
    ],
    "firstLineDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "ceftriaxone",
      "azithromycin",
      "clarithromycin"
    ],
    "firstLineTherapy": {
      "regimen": "IV Co-Amoxiclav 1.2g TDS (or IV Ceftriaxone 2g OD) + Oral/IV Azithromycin 500mg OD (or Oral Clarithromycin 500mg BD)",
      "routeAndDose": "IV parenteral awal dengan liputan gabungan kuman tipikal + atipikal.",
      "durationDays": "5 - 7 days",
      "remarks": "Skor CURB-65 = 2 (kadar mortaliti ~9%). Wajib kemasukan ke wad am hospital untuk pemantauan parameter vital dan terapi cecair/oksigen."
    },
    "secondLineDrugs": [
      "levofloxacin",
      "moxifloxacin",
      "ampicillin/sulbactam",
      "unasyn"
    ],
    "secondLineTherapy": {
      "regimen": "IV/Oral Levofloxacin 750mg OD atau IV Moxifloxacin 400mg OD (sebagai Monoterapi Respiratory Fluoroquinolone) atau IV Ampicillin-Sulbactam 1.5g-3g Q6H + Azithromycin.",
      "routeAndDose": "IV / Oral.",
      "durationDays": "5 - 7 days",
      "remarks": "Untuk pesakit yang mempunyai risiko kegagalan sefalosporin atau intoleransi makrolida."
    },
    "allergyDrugs": [
      "levofloxacin",
      "moxifloxacin",
      "azithromycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV/Oral Levofloxacin 750mg OD atau IV Moxifloxacin 400mg OD x 5-7 hari",
      "routeAndDose": "Oral/IV monoterapi.",
      "remarks": "Liputan lengkap tanpa sebarang beta-laktam."
    },
    "stepDownDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "azithromycin",
      "levofloxacin"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Augmentin 625mg TDS + Oral Azithromycin 500mg OD (jumlah 5-7 hari)",
      "criteria": "Pesakit afebril >24 jam, kadar pernafasan <24/min, nadi <100 bpm, tekanan darah stabil, SpO2 ≥92% pada udara bilik, boleh makan ubat oral."
    },
    "amsNotes": [
      "Ambil 2 set Kultur Darah dan Sputum C&S sebelum dos pertama antibiotik dimulakan.",
      "Tukar ke terapi oral (IV-to-oral switch) seawal hari ke-2 atau ke-3 apabila pesakit stabil secara klinikal."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / ATS-IDSA CAP Guidelines)"
  },
  {
    "id": "NAG-A11-003",
    "targetPopulation": "Adult",
    "categoryCode": "A11",
    "categoryTitle": "A11 : Respiratory Infections",
    "topic": "1. COMMUNITY ACQUIRED PNEUMONIA (CAP)",
    "topicNumber": 1,
    "bodySystem": "Respiratory Infections",
    "conditionName": "Severe Community-Acquired Pneumonia (CAP Teruk / CURB-65 ≥ 3 / ICU)",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Streptococcus pneumoniae (Pneumococcus)",
      "Legionella pneumophila (Legionellosis)",
      "Klebsiella pneumoniae & Gram-negative bacilli",
      "Staphylococcus aureus (termasuk post-influenza MRSA / PVL toxin)",
      "Pseudomonas aeruginosa (pada pesakit bronkiektasis/struktur paru-paru abnormal)"
    ],
    "firstLineDrugs": [
      "ceftriaxone",
      "azithromycin",
      "amoxicillin/clavulanic acid",
      "augmentin",
      "piperacillin/tazobactam",
      "tazocin"
    ],
    "firstLineTherapy": {
      "regimen": "IV Ceftriaxone 2g OD (or IV Co-Amoxiclav 1.2g TDS) + IV Azithromycin 500mg OD (or IV Levofloxacin 750mg OD)",
      "routeAndDose": "IV Ceftriaxone 2g OD + IV Azithromycin 500mg OD infusi perlahan.",
      "durationDays": "7 - 10 days (panjangkan ke 10-14 hari jika Legionella positif)",
      "remarks": "DOS PERTAMA ANTIBIOTIK WAJIB DIBERIKAN DALAM MASA 1 JAM dari masa ketibaan pesakit di Jabatan Kecemasan. Skor CURB-65 ≥3 atau SMART-COP ≥5 memerlukan rujukan ICU/HDW segera."
    },
    "secondLineDrugs": [
      "piperacillin/tazobactam",
      "tazocin",
      "meropenem",
      "vancomycin",
      "levofloxacin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Tazocin 4.5g Q6H + IV Azithromycin 500mg OD (+/- IV Vancomycin 15-20mg/kg Q12H jika disyaki MRSA necrotising post-influenza)",
      "routeAndDose": "IV infusi berpanjangan 3 jam Tazocin + Azithromycin.",
      "durationDays": "7 - 10 days",
      "remarks": "Bagi pesakit CAP dengan faktor risiko Pseudomonas (bronkiektasis, rawatan steroid sistemik, kemasukan hospital baru-baru ini)."
    },
    "allergyDrugs": [
      "levofloxacin",
      "moxifloxacin",
      "azithromycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Levofloxacin 750mg OD (or IV Moxifloxacin 400mg OD) + IV Azithromycin 500mg OD",
      "routeAndDose": "IV.",
      "remarks": "Liputan menyeluruh untuk S. pneumoniae dan kuman atipikal Legionella."
    },
    "stepDownDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "azithromycin",
      "levofloxacin"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Augmentin 625mg TDS + Oral Azithromycin 500mg OD (atau Oral Levofloxacin 750mg OD)",
      "criteria": "Pesakit berjaya diekstubasi atau tidak lagi memerlukan sokongan inotropik/ventilasi, afebril >48 jam, SpO2 stabil."
    },
    "amsNotes": [
      "Lakukan Ujian Antigen Urin bagi Streptococcus pneumoniae dan Legionella pneumophila serogroup 1 untuk de-eskalasi terapi sasaran.",
      "Pertimbangkan rawatan antiviral Oseltamivir jika semasa musim wabak Influenza."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / ATS-IDSA 2019 / Surviving Sepsis 2021)"
  },
  {
    "id": "NAG-A11-004",
    "targetPopulation": "Adult",
    "categoryCode": "A11",
    "categoryTitle": "A11 : Respiratory Infections",
    "topic": "2. VIRAL PNEUMONIA",
    "topicNumber": 2,
    "bodySystem": "Respiratory Infections",
    "conditionName": "Severe Viral Pneumonia & Influenza Pneumonitis with Bacterial Superinfection",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Influenza A (H1N1, H3N2) & Influenza B",
      "SARS-CoV-2 (COVID-19)",
      "Respiratory Syncytial Virus (RSV)",
      "Staphylococcus aureus (Secondary bacterial superinfection / PVL toxin)",
      "Streptococcus pneumoniae (Secondary bacterial)"
    ],
    "firstLineDrugs": [
      "oseltamivir",
      "tamiflu",
      "ceftriaxone",
      "amoxicillin/clavulanic acid",
      "augmentin",
      "cloxacillin",
      "vancomycin"
    ],
    "firstLineTherapy": {
      "regimen": "Pneumonia Influenza Teruk: Oral Oseltamivir 75mg BD x 5 hari (tingkatkan ke 150mg BD jika pesakit ICU berventilasi mekanikal) + IV Ceftriaxone 2g OD + IV Cloxacillin 2g Q4H (or IV Vancomycin 15mg/kg Q12H jika disyaki MRSA pasca-influenza).",
      "routeAndDose": "Oral/Nasogastrik antiviral + IV antibiotik liputan superinfeksi bakteria.",
      "durationDays": "5 days (Oseltamivir; boleh dipanjangkan ke 10 hari pada imunokompromais) / 7 days (Antibiotik)",
      "remarks": "Mulakan Oseltamivir SEAWAL MUNGKIN dalam masa 48 jam dari onset simptom. Pada kes teruk/ICU, Oseltamivir TETAP BERMANFAAT walaupun dimulakan melebihi 48 jam."
    },
    "secondLineDrugs": [
      "peramivir",
      "zanamivir",
      "piperacillin/tazobactam"
    ],
    "secondLineTherapy": {
      "regimen": "IV Peramivir 600mg infusi dos tunggal (atau Zanamivir sedutan) jika intoleransi enteral gastrik + IV Tazocin 4.5g Q6H.",
      "routeAndDose": "IV infusi.",
      "durationDays": "5 - 7 days",
      "remarks": "Alternatif untuk pesakit ICU dengan masalah penyerapan gastrousus."
    },
    "allergyDrugs": [
      "oseltamivir",
      "levofloxacin",
      "vancomycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Oseltamivir 75mg BD + IV Levofloxacin 750mg OD + IV Vancomycin 15mg/kg Q12H",
      "routeAndDose": "Oral + IV.",
      "remarks": "Sesuai untuk pesakit alahan penisilin."
    },
    "amsNotes": [
      "Ambil Swab Nasofarinks/Orofarinks untuk Ujian RT-PCR Influenza A/B & Panel Virus Respiratori (NPA PCR) sebelum memulakan antiviral.",
      "Jika keputusan PCR virus respiratori adalah negatif dan pesakit stabil, hentikan Oseltamivir dan de-eskala antibiotik mengikut keputusan mikrobiologi."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / WHO Influenza Guidelines / IDSA 2018)"
  },
  {
    "id": "NAG-A11-005",
    "targetPopulation": "Adult",
    "categoryCode": "A11",
    "categoryTitle": "A11 : Respiratory Infections",
    "topic": "3. LUNG ABSCESS AND EMPYEMA",
    "topicNumber": 3,
    "bodySystem": "Respiratory Infections",
    "conditionName": "Empyema Thoracis, Parapneumonic Effusion & Cavitary Lung Abscess",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Streptococcus pneumoniae & Streptococcus intermedius (milleri)",
      "Oral Anaerobes (Fusobacterium nucleatum, Peptostreptococcus, Prevotella, Bacteroides)",
      "Staphylococcus aureus (MSSA & MRSA)",
      "Klebsiella pneumoniae & Gram-negative enteric rods"
    ],
    "firstLineDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "ampicillin/sulbactam",
      "unasyn",
      "ceftriaxone",
      "metronidazole",
      "piperacillin/tazobactam",
      "tazocin"
    ],
    "firstLineTherapy": {
      "regimen": "Empiema / Efusi Parapneumonik Kompleks: PENYALIRAN TIUB DADA SEGERA (Chest Tube Drainage / ICT bersaiz 12-28F) + IV Co-Amoxiclav 1.2g TDS (or IV Ampicillin-Sulbactam 1.5g-3g Q6H / IV Ceftriaxone 2g OD + IV Metronidazole 500mg TDS). Abses Paru-Paru: IV Co-Amoxiclav 1.2g TDS selama 2-3 minggu diikuti pertukaran oral melengkapkan 4-6 MINGGU.",
      "routeAndDose": "IV parenteral awal diikuti terapi oral berpanjangan.",
      "durationDays": "2 - 4 weeks (Empiema selepas tiub dada dicabut) / 4 - 6 weeks (Abses Paru-paru)",
      "remarks": "EMPIEMA WAJIB DIALIRKAN (Pleural Space Drainage): Antibiotik sahaja TIDAK AKAN MENYEMBUHKAN empiema tertutup; kriteria penyaliran: cecair bernanah (frank pus), pH <7.20, glukosa <2.2 mmol/L, atau bakteria dikesan pada pewarnaan Gram/Kultur."
    },
    "secondLineDrugs": [
      "piperacillin/tazobactam",
      "tazocin",
      "meropenem",
      "vancomycin",
      "clindamycin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Tazocin 4.5g Q6H infusi 3 jam atau IV Meropenem 1g Q8H + IV Vancomycin 15-20mg/kg Q12H (+ Fibrinolitik Intrapleural: tPA + DNase jika lokulasi tebal)",
      "routeAndDose": "IV + Intrapleural.",
      "durationDays": "3 - 6 weeks",
      "remarks": "Rujuk Pakar Bedah Kardiotorasik untuk pembedahan VATS (Video-Assisted Thoracoscopic Decortication) jika penyaliran tiub dada gagal selepas 48-72 jam."
    },
    "allergyDrugs": [
      "clindamycin",
      "moxifloxacin",
      "ceftriaxone"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Clindamycin 600-900mg Q8H (or IV Moxifloxacin 400mg OD) + IV Ciprofloxacin 400mg Q12H",
      "routeAndDose": "IV.",
      "remarks": "Clindamycin mempunyai penembusan kaviti abses paru-paru dan ruang pleura yang sangat baik."
    },
    "stepDownDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "clindamycin"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Augmentin 625mg TDS atau Oral Clindamycin 300-450mg TDS diteruskan selama 4-6 minggu sehingga kaviti abses mengecut pada X-ray dada.",
      "criteria": "Tiub dada telah dicabut (aliran <50mL/24h), tiada demam >48 jam, sel darah putih normal, tiada lokulasi pleura residual pada USG Toraks."
    },
    "amsNotes": [
      "Hantar Cecair Pleura untuk: Analisis pH, Glukosa, LDH, Protein, Kiraan Sel, Pewarnaan Gram, Kultur C&S, dan AFB/GeneXpert TB.",
      "Gunakan Bimbingan Ultrasound Toraks (Bedside Thoracic USG) semasa memasukkan tiub dada untuk memaksimumkan keselamatan dan mengurangkan komplikasi organ."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / BTS Pleural Infection Guidelines 2023)"
  },
  {
    "id": "NAG-A11-006",
    "targetPopulation": "Adult",
    "categoryCode": "A11",
    "categoryTitle": "A11 : Respiratory Infections",
    "topic": "4. INFECTIVE EXACERBATION OF CHRONIC OBSTRUCTIVE PULMONARY DISEASE (COPD)",
    "topicNumber": 4,
    "bodySystem": "Respiratory Infections",
    "conditionName": "Acute Infective Exacerbation of COPD (AECOPD) & Bronchiectasis Exacerbation",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Haemophilus influenzae",
      "Streptococcus pneumoniae",
      "Moraxella catarrhalis",
      "Pseudomonas aeruginosa (terutamanya pesakit bronkiektasis / FEV1 <30% / kerap guna antibiotik)"
    ],
    "firstLineDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "amoxicillin",
      "azithromycin",
      "doxycycline",
      "ciprofloxacin"
    ],
    "firstLineTherapy": {
      "regimen": "AECOPD Standard (Kriteria Anthonisen Type 1/2): Oral Augmentin 625mg TDS x 5 hari (atau Oral Amoxicillin 1g TDS x 5 hari / Oral Azithromycin 500mg OD x 3 hari / Oral Doxycycline 100mg BD x 5 hari). Eksaserbasi dengan Risiko Pseudomonas / Bronkiektasis: Oral Ciprofloxacin 750mg BD x 7-10 hari (atau IV Tazocin 4.5g Q6H / IV Ceftazidime 2g Q8H).",
      "routeAndDose": "Oral untuk kes sederhana; IV untuk kegagalan pernafasan dimasukkan ke wad.",
      "durationDays": "5 days (Standard AECOPD) / 7 - 10 days (Pseudomonas / Bronkiektasis)",
      "remarks": "KRITERIA ANTHONISEN: Antibiotik diindikasikan jika pesakit mengalami peningkatan kahak bernanah (sputum purulence - tanda kardinal) BERSAMA peningkatan sesak nafas atau peningkatan isipadu kahak."
    },
    "secondLineDrugs": [
      "cefuroxime",
      "levofloxacin",
      "piperacillin/tazobactam",
      "tazocin",
      "ceftazidime"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Cefuroxime Axetil 500mg BD x 5-7 hari atau Oral Levofloxacin 500mg OD x 5 hari (atau IV Piperacillin/Tazobactam 4.5g Q6H jika di wad).",
      "routeAndDose": "Oral / IV.",
      "durationDays": "5 - 7 days",
      "remarks": "Bagi pesakit COPD teruk dengan komorbiditi kerap mengalami eksaserbasi berulang (>2 kali setahun)."
    },
    "allergyDrugs": [
      "azithromycin",
      "doxycycline",
      "ciprofloxacin",
      "levofloxacin"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Doxycycline 100mg BD x 5 hari atau Oral Azithromycin 500mg OD x 3 hari atau Oral Ciprofloxacin 500mg BD",
      "routeAndDose": "Oral.",
      "remarks": "Selamat untuk pesakit alahan penisilin."
    },
    "amsNotes": [
      "TERAPI BUKAN ANTIBIOTIK: Pastikan pesakit menerima Nebulisasi Bronkodilator (Salbutamol + Ipratropium) dan Terapi Kortikosteroid Sistemik (Oral Prednisolone 30-40mg OD x 5 hari).",
      "Antibiotik TIDAK DIPERLUKAN jika tiada peningkatan kekuningan/kehijauan kahak (Anthonisen Type 3 bukan bernanah)."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / GOLD COPD Report 2024)"
  },
  {
    "id": "NAG-A11-007",
    "targetPopulation": "Adult",
    "categoryCode": "A11",
    "categoryTitle": "A11 : Respiratory Infections",
    "topic": "5. HOSPITAL ACQUIRED PNEUMONIA (HAP/VAP)",
    "topicNumber": 5,
    "bodySystem": "Respiratory Infections",
    "conditionName": "Hospital-Acquired Pneumonia (HAP) & Ventilator-Associated Pneumonia (VAP)",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Pseudomonas aeruginosa",
      "Klebsiella pneumoniae (ESBL & Carbapenem-resistant / CRE)",
      "Acinetobacter baumannii (MDR/XDR)",
      "Staphylococcus aureus (MRSA & MSSA)",
      "Enterobacter cloacae & Serratia marcescens"
    ],
    "firstLineDrugs": [
      "piperacillin/tazobactam",
      "tazocin",
      "cefepime",
      "meropenem",
      "vancomycin",
      "amikacin"
    ],
    "firstLineTherapy": {
      "regimen": "HAP Awal (<5 hari, tiada faktor risiko MDR): IV Co-Amoxiclav 1.2g TDS (or IV Ceftriaxone 2g OD). HAP Lewat (≥5 hari) / VAP / Risiko MDR: IV Piperacillin/Tazobactam 4.5g Q6H infusi 3 jam (or IV Cefepime 2g Q8H / IV Meropenem 1g Q8H) + IV Vancomycin 15-20mg/kg Q8H-Q12H (+/- IV Amikacin 15-20mg/kg OD jika syok septik).",
      "routeAndDose": "IV infusi berpanjangan (Extended Infusion Beta-Lactam) untuk mengoptimumkan parameter farmakodinamik T>MIC.",
      "durationDays": "7 days (Tempoh 7 hari terbukti sama berkesan dengan 14 hari dan mengurangkan rintangan AMR)",
      "remarks": "Takrifan HAP: Pneumonia berlaku ≥48 jam selepas kemasukan ke hospital; VAP: Pneumonia berlaku ≥48 jam selepas intubasi endotrakeal."
    },
    "secondLineDrugs": [
      "meropenem",
      "colistin",
      "polymyxin b",
      "ceftazidime/avibactam",
      "linezolid"
    ],
    "secondLineTherapy": {
      "regimen": "Organisma MDR Disahkan: IV Meropenem 2g Q8H infusi 3 jam + IV Colistin (Loading 9 MU kemudian 4.5 MU BD) atau IV Ceftazidime/Avibactam 2.5g Q8H (untuk KPC/OXA-48 CRE) + IV Linezolid 600mg BD.",
      "routeAndDose": "IV kombinasi sasaran patogen MDR.",
      "durationDays": "7 - 10 days",
      "remarks": "Wajib rujuk Pakar Penyakit Berjangkit (ID Physician) dan Pegawai AMS Hospital untuk kelulusan antibiotik reserve."
    },
    "allergyDrugs": [
      "ciprofloxacin",
      "levofloxacin",
      "vancomycin",
      "amikacin",
      "aztreonam"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Levofloxacin 750mg OD (or IV Aztreonam 2g Q8H) + IV Vancomycin 15-20mg/kg Q12H + IV Amikacin 15mg/kg OD",
      "routeAndDose": "IV.",
      "remarks": "Bebas kompaun beta-laktam bersilang."
    },
    "stepDownDrugs": [
      "ciprofloxacin",
      "levofloxacin",
      "amoxicillin/clavulanic acid",
      "augmentin"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Ciprofloxacin 750mg BD atau Oral Augmentin 625mg TDS (jika HAP awal) selepas pesakit afebril dan kultur menunjukkan sensitiviti.",
      "criteria": "Pesakit diekstubasi, oksigenasi pulih, tiada demam >48 jam, parameter radang leukosit dan procalcitonin menurun."
    },
    "amsNotes": [
      "Ambil Aspirat Endotrakeal (ETA C&S) atau Bronchoalveolar Lavage (BAL) secara kuantitatif SEBELUM menukar antibiotik.",
      "Amalkan Protokol Pencegahan VAP (VAP Bundle): Kepala katil dinaikkan 30-45 darjah, kebersihan mulut dengan chlorhexidine, sedutan subglotik berterusan, dan penilaian kesediaan ekstubasi harian."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IDSA-ATS HAP/VAP Guidelines 2016)"
  },
  {
    "id": "NAG-A11-008",
    "targetPopulation": "Adult",
    "categoryCode": "A11",
    "categoryTitle": "A11 : Respiratory Infections",
    "topic": "6. ASPIRATION PNEUMONIA",
    "topicNumber": 6,
    "bodySystem": "Respiratory Infections",
    "conditionName": "Aspiration Pneumonitis (Chemical) vs Bacterial Aspiration Pneumonia",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Oral Anaerobes (Peptostreptococcus, Fusobacterium, Prevotella, Bacteroides)",
      "Streptococcus pneumoniae & Strep viridans",
      "Staphylococcus aureus",
      "Gram-negative enteric bacilli (Klebsiella, E. coli)"
    ],
    "firstLineDrugs": [
      "ampicillin/sulbactam",
      "unasyn",
      "amoxicillin/clavulanic acid",
      "augmentin",
      "metronidazole",
      "ceftriaxone"
    ],
    "firstLineTherapy": {
      "regimen": "Pneumonitis Aspirasi Kimiawi (Akut <24-48j): TERAPI SOKONGAN SAHAJA (Suction saluran pernafasan, oksigen, bronkodilator; TANGGUHKAN ANTIBIOTIK). Pneumonia Aspirasi Bakteria Sekunder (Demam berterusan >48j / Infiltrat baru): IV Ampicillin-Sulbactam 1.5g-3g Q6H (or IV Co-Amoxiclav 1.2g TDS / IV Ceftriaxone 2g OD + IV Metronidazole 500mg TDS).",
      "routeAndDose": "IV bertukar ke Oral Augmentin 625mg TDS.",
      "durationDays": "5 - 7 days",
      "remarks": "Pneumonitis Aspirasi (Sindrom Mendelson) adalah keradangan kimia akibat asid gastrik; antibiotik tidak mempercepatkan penyembuhan melainkan terdapat jangkitan bakteria sekunder selepas 48 jam."
    },
    "secondLineDrugs": [
      "piperacillin/tazobactam",
      "tazocin",
      "meropenem",
      "moxifloxacin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Tazocin 4.5g Q6H atau IV Meropenem 1g Q8H (atau Oral/IV Moxifloxacin 400mg OD)",
      "routeAndDose": "IV.",
      "durationDays": "7 days",
      "remarks": "Untuk pesakit terlantar dengan aspirasi nosokomial di hospital atau pusat jagaan kejururawatan (nursing home)."
    },
    "allergyDrugs": [
      "clindamycin",
      "moxifloxacin",
      "levofloxacin",
      "metronidazole"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV/Oral Clindamycin 600mg Q8H atau IV/Oral Moxifloxacin 400mg OD (or IV Levofloxacin 750mg OD + IV Metronidazole 500mg TDS)",
      "routeAndDose": "IV bertukar ke Oral.",
      "remarks": "Memberi liputan anaerobik dan gram-negatif yang lengkap."
    },
    "stepDownDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "clindamycin"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Augmentin 625mg TDS atau Oral Clindamycin 300-450mg TDS selama baki rawatan 5-7 hari.",
      "criteria": "Pesakit stabil, tiada demam, fungsi menelan telah dinilai oleh Terapis Pertuturan (Speech Therapist) dengan modifikasi diet selamat."
    },
    "amsNotes": [
      "Lakukan penilaian menelan (Swallowing Assessment) dan latih posisi makan tegak 90 darjah untuk mencegah aspirasi berulang.",
      "Elakkan penggunaan rutin Metronidazole tambahan jika sudah menggunakan Ampicillin-Sulbactam atau Co-Amoxiclav kerana kedua-dua ubat tersebut sudah mempunyai aktiviti anaerobik yang mencukupi."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / ATS Aspiration Guidelines)"
  },
  {
    "id": "NAG-A12-001",
    "targetPopulation": "Adult",
    "categoryCode": "A12",
    "categoryTitle": "A12 : Sepsis",
    "topic": "1. SEPSIS & SEPTIC SHOCK OF UNKNOWN ORIGIN",
    "topicNumber": 1,
    "bodySystem": "Sepsis",
    "conditionName": "Sepsis & Septic Shock of Unknown Origin (Sepsis Teruk Tanpa Punca Jelas)",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Escherichia coli & Klebsiella pneumoniae",
      "Staphylococcus aureus (MSSA & MRSA)",
      "Pseudomonas aeruginosa",
      "Streptococcus pneumoniae",
      "Bacteroides fragilis & Anaerobes"
    ],
    "firstLineDrugs": [
      "piperacillin/tazobactam",
      "tazocin",
      "meropenem",
      "vancomycin",
      "ceftriaxone",
      "amikacin"
    ],
    "firstLineTherapy": {
      "regimen": "Surviving Sepsis 1-Hour Bundle: IV Piperacillin/Tazobactam 4.5g Q6H infusi 3 jam (or IV Meropenem 1g Q8H) + IV Vancomycin 25-30mg/kg loading kemudian 15-20mg/kg Q12H (+/- IV Amikacin 15-20mg/kg OD dos stat jika syok refraktori).",
      "routeAndDose": "IV bolus/infusi pantas dalam masa 1 JAM pertama dari ketibaan.",
      "durationDays": "7 - 10 days",
      "remarks": "1-HOUR BUNDLE KRITIKAL: (1) Ambil paras Laktat darah, (2) Ambil 2 set kultur darah sebelum antibiotik, (3) Berikan antibiotik spektrum luas dalam 1 jam, (4) Resusitasi cecair kristaloid 30mL/kg jika hipotensi/laktat ≥4 mmol/L, (5) Mulakan Noradrenaline jika MAP <65 mmHg."
    },
    "secondLineDrugs": [
      "meropenem",
      "colistin",
      "polymyxin b",
      "caspofungin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Meropenem 2g Q8H + IV Colistin (Loading 9 MU kemudian 4.5 MU BD) + IV Caspofungin 70mg loading kemudian 50mg OD",
      "routeAndDose": "IV ICU.",
      "durationDays": "7 - 14 days",
      "remarks": "Untuk syok septik refraktori di ICU dengan ancaman organisma MDR atau risiko jangkitan kulat invasif."
    },
    "allergyDrugs": [
      "ciprofloxacin",
      "vancomycin",
      "amikacin",
      "metronidazole",
      "aztreonam"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Ciprofloxacin 400mg Q8H (or IV Aztreonam 2g Q8H) + IV Vancomycin 15-20mg/kg Q12H + IV Metronidazole 500mg Q8H + IV Amikacin 15mg/kg OD",
      "routeAndDose": "IV.",
      "remarks": "Bebas beta-laktam."
    },
    "amsNotes": [
      "Lakukan penilaian semula (Time-out 48-72 jam) sebaik keputusan kultur darah dan punca jangkitan dikenal pasti untuk de-eskalasi kepada antibiotik berspektrum sempit sasaran.",
      "Hentikan Vancomycin dan Amikacin serta-merta jika tiada kuman MRSA atau Gram-negatif kebal dikesan."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / Surviving Sepsis Campaign Guidelines 2021)"
  },
  {
    "id": "NAG-A12-002",
    "targetPopulation": "Adult",
    "categoryCode": "A12",
    "categoryTitle": "A12 : Sepsis",
    "topic": "2. NEUTROPENIC SEPSIS",
    "topicNumber": 2,
    "bodySystem": "Sepsis",
    "conditionName": "Neutropenic Sepsis in Oncology & Haematology Patients",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Pseudomonas aeruginosa",
      "Klebsiella pneumoniae & E. coli (ESBL/CRE)",
      "Staphylococcus epidermidis & MRSA",
      "Viridans Streptococci (pasca kemoterapi mukositis teruk)"
    ],
    "firstLineDrugs": [
      "cefepime",
      "piperacillin/tazobactam",
      "tazocin",
      "meropenem",
      "vancomycin"
    ],
    "firstLineTherapy": {
      "regimen": "IV Cefepime 2g Q8H (or IV Tazocin 4.5g Q6H / IV Meropenem 1g Q8H) + IV Vancomycin 15-20mg/kg Q12H (jika ada ketidakstabilan hemodinamik atau disyaki sepsis kateter).",
      "routeAndDose": "IV infusi diberikan dalam masa <30 minit.",
      "durationDays": "Sehingga neutrofil pulih (ANC >500/mcL) dan afebril >48 jam",
      "remarks": "Neutropenic Sepsis adalah KECEMASAN ONKOLOGI MUTLAK. Jangan tangguhkan antibiotik untuk prosedur pengimejan."
    },
    "secondLineDrugs": [
      "meropenem",
      "amikacin",
      "caspofungin",
      "liposomal amphotericin b"
    ],
    "secondLineTherapy": {
      "regimen": "IV Meropenem 2g Q8H + IV Amikacin 15-20mg/kg OD + IV Caspofungin 70mg loading kemudian 50mg OD",
      "routeAndDose": "IV ICU.",
      "durationDays": "7 - 14 days",
      "remarks": "Bagi demam refraktori hari ke-4-7 atau syok septik neutropenik."
    },
    "allergyDrugs": [
      "aztreonam",
      "ciprofloxacin",
      "vancomycin",
      "amikacin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Aztreonam 2g Q8H (or IV Ciprofloxacin 400mg Q8H) + IV Vancomycin 15-20mg/kg Q12H + IV Amikacin 15mg/kg OD",
      "routeAndDose": "IV.",
      "remarks": "Selamat untuk pesakit alahan penisilin."
    },
    "amsNotes": [
      "Elakkan sebarang suntikan intramuskular (IM) atau pemeriksaan rektum (DRE/enema) bagi mengelakkan trauma tisu dan translokasi bakteria usus semasa neutropenia teruk.",
      "Kultur darah bersiri wajib diambil dari semua saluran talian IV dan darah periferi."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IDSA-ASCO Guidelines)"
  },
  {
    "id": "NAG-A12-003",
    "targetPopulation": "Adult",
    "categoryCode": "A12",
    "categoryTitle": "A12 : Sepsis",
    "topic": "3. UROSEPSIS & BILIARY SEPSIS",
    "topicNumber": 3,
    "bodySystem": "Sepsis",
    "conditionName": "Urosepsis & Acute Ascending Cholangitis (Biliary Sepsis)",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Escherichia coli & Klebsiella pneumoniae (penghasil ESBL)",
      "Enterococcus faecalis",
      "Proteus mirabilis & Pseudomonas aeruginosa",
      "Enterobacterales & Anaerobes (Biliary)"
    ],
    "firstLineDrugs": [
      "ceftriaxone",
      "piperacillin/tazobactam",
      "tazocin",
      "amikacin",
      "meropenem"
    ],
    "firstLineTherapy": {
      "regimen": "Urosepsis: IV Ceftriaxone 2g OD (or IV Tazocin 4.5g Q6H / IV Amikacin 15mg/kg OD). Sepsis Biliari / Kolangitis Akut: IV Tazocin 4.5g Q6H (or IV Ceftriaxone 2g OD + IV Metronidazole 500mg TDS) + DEKOMPRESI BILIARI KECEMASAN (ERCP / PTBD).",
      "routeAndDose": "IV infusi parenteral.",
      "durationDays": "7 - 14 days",
      "remarks": "Kolangitis Akut (Charcot's Triad / Reynolds' Pentad): Dekompresi saluran hempedu secara endoskopik (ERCP stent/sphincterotomy) dalam masa 24-48 jam adalah RAWATAN PENYELAMAT NYAWA PALING KRITIKAL."
    },
    "secondLineDrugs": [
      "meropenem",
      "ertapenem",
      "amikacin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Meropenem 1g Q8H atau IV Ertapenem 1g OD (+/- IV Amikacin 15mg/kg OD)",
      "routeAndDose": "IV.",
      "durationDays": "7 - 10 days",
      "remarks": "Untuk jangkitan urosepsis/biliari yang disebabkan oleh bakteria Gram-negatif penghasil ESBL."
    },
    "allergyDrugs": [
      "ciprofloxacin",
      "amikacin",
      "metronidazole",
      "aztreonam"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Ciprofloxacin 400mg Q8H-Q12H + IV Amikacin 15mg/kg OD (+ IV Metronidazole 500mg TDS jika biliari)",
      "routeAndDose": "IV.",
      "remarks": "Bebas kompaun beta-laktam."
    },
    "stepDownDrugs": [
      "ciprofloxacin",
      "co-amoxiclav",
      "augmentin",
      "bactrim"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Ciprofloxacin 500-750mg BD atau Oral Augmentin 625mg TDS selepas saliran biliari/urologi lancar dan pesakit stabil >48 jam.",
      "criteria": "Punca halangan urologi/biliari telah dibebaskan, afebril, laktat darah normal, toleransi oral baik."
    },
    "amsNotes": [
      "Lakukan Ultrasound Hepatosplenik / KUB dan CT Abdomen segera untuk mengesan batu karang tersumbat, hidronefrosis, atau dilatasi duktus hempedu.",
      "Kultur darah dan cecair hempedu/urin wajib dihantar ke makmal."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / Tokyo Guidelines 2018 for Cholangitis)"
  },
  {
    "id": "NAG-A13-001",
    "targetPopulation": "Adult",
    "categoryCode": "A13",
    "categoryTitle": "A13 : Sexually Transmitted Infections",
    "topic": "1. GONOCOCCAL INFECTIONS",
    "topicNumber": 1,
    "bodySystem": "Sexually Transmitted Infections",
    "conditionName": "Uncomplicated Anogenital & Pharyngeal Gonorrhoea",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Neisseria gonorrhoeae"
    ],
    "firstLineDrugs": [
      "ceftriaxone",
      "azithromycin"
    ],
    "firstLineTherapy": {
      "regimen": "IM Ceftriaxone 500mg-1g stat (dilarutkan dalam 2-3mL Lignocaine 1%) + Oral Azithromycin 1g stat dos tunggal.",
      "routeAndDose": "IM dos tunggal + Oral dos tunggal.",
      "durationDays": "Single Dose",
      "remarks": "Rawatan berganda (Dual therapy) dengan Azithromycin 1g adalah wajib bagi merawat kemungkinan ko-infeksi Chlamydia trachomatis dan merencat kemunculan rintangan sefalosporin."
    },
    "secondLineDrugs": [
      "gentamicin",
      "azithromycin",
      "cefixime"
    ],
    "secondLineTherapy": {
      "regimen": "IM Gentamicin 240mg stat + Oral Azithromycin 2g stat (atau Oral Cefixime 800mg stat + Azithromycin 1g stat).",
      "routeAndDose": "IM + Oral.",
      "durationDays": "Single Dose",
      "remarks": "Pilihan kedua sekiranya Ceftriaxone tidak tersedia."
    },
    "allergyDrugs": [
      "gentamicin",
      "azithromycin",
      "spectinomycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IM Gentamicin 240mg stat + Oral Azithromycin 2g stat (atau IM Spectinomycin 2g stat + Oral Azithromycin 1g stat)",
      "routeAndDose": "IM + Oral.",
      "remarks": "Bebas sefalosporin dan penisilin sepenuhnya."
    },
    "amsNotes": [
      "NOTIFIKASI STI & CONTACT TRACING: Semua pasangan seks dalam tempoh 60 hari lepas WAJIB disaring dan dirawat serta-merta.",
      "Nasihatkan pesakit berpantang seks (abstinens) selama sekurang-kurangnya 7 HARI selepas rawatan kedua-dua pasangan selesai."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / CDC STI Guidelines 2021)"
  },
  {
    "id": "NAG-A13-002",
    "targetPopulation": "Adult",
    "categoryCode": "A13",
    "categoryTitle": "A13 : Sexually Transmitted Infections",
    "topic": "2. NON-GONOCOCCAL URETHRITIS & CHLAMYDIA",
    "topicNumber": 2,
    "bodySystem": "Sexually Transmitted Infections",
    "conditionName": "Chlamydia trachomatis Urethritis / Cervicitis & Non-Gonococcal Urethritis (NGU)",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Chlamydia trachomatis (Serovars D-K)",
      "Mycoplasma genitalium",
      "Ureaplasma urealyticum",
      "Trichomonas vaginalis"
    ],
    "firstLineDrugs": [
      "doxycycline",
      "azithromycin"
    ],
    "firstLineTherapy": {
      "regimen": "Oral Doxycycline 100mg BD x 7 hari (REJIMEN PILIHAN UTAMA). Alternatif: Oral Azithromycin 1g stat dos tunggal.",
      "routeAndDose": "Oral.",
      "durationDays": "7 days (Doxycycline) / Single dose (Azithromycin)",
      "remarks": "Doxycycline 7 hari terbukti mempunyai kadar kesembuhan mikrobiologi yang jauh lebih tinggi berbanding Azithromycin 1g dos tunggal terutamanya untuk jangkitan rektal dan Mycoplasma."
    },
    "secondLineDrugs": [
      "erythromycin",
      "levofloxacin",
      "moxifloxacin"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Erythromycin Ethylsuccinate (EES) 800mg QID x 7 hari atau Oral Levofloxacin 500mg OD x 7 hari (M. genitalium refraktori: Oral Moxifloxacin 400mg OD x 7-14 hari).",
      "routeAndDose": "Oral.",
      "durationDays": "7 - 14 days",
      "remarks": "Untuk pesakit hamil yang tidak boleh mengambil Doxycycline (gunakan Erythromycin atau Azithromycin)."
    },
    "allergyDrugs": [
      "doxycycline",
      "azithromycin",
      "erythromycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Doxycycline 100mg BD x 7 hari atau Oral Azithromycin 1g stat",
      "routeAndDose": "Oral.",
      "remarks": "Selamat untuk pesakit alahan penisilin."
    },
    "amsNotes": [
      "Lakukan Ujian Penguatan Asid Nukleik (NAAT) pada spesimen urin pancutan awal (first-catch urine) untuk lelaki atau swab serviks/vagina untuk wanita.",
      "Saring semua pesakit untuk jangkitan kelamin lain termasuk HIV, Sifilis (VDRL/TPHA), dan Hepatitis B."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / CDC STI Guidelines 2021)"
  },
  {
    "id": "NAG-A13-003",
    "targetPopulation": "Adult",
    "categoryCode": "A13",
    "categoryTitle": "A13 : Sexually Transmitted Infections",
    "topic": "3. SYPHILIS",
    "topicNumber": 3,
    "bodySystem": "Sexually Transmitted Infections",
    "conditionName": "Syphilis - Primary, Secondary, Latent & Neurosyphilis",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Treponema pallidum subsp. pallidum"
    ],
    "firstLineDrugs": [
      "benzathine penicillin g",
      "benzylpenicillin",
      "procaine penicillin"
    ],
    "firstLineTherapy": {
      "regimen": "Sifilis Primer, Sekunder & Awal Laten (<1 tahun): IM Benzathine Penicillin G 2.4 MU dos tunggal (disuntik 1.2 MU pada setiap punggung). Sifilis Lewat Laten (>1 tahun / Tempoh Tidak Diketahui): IM Benzathine Penicillin G 2.4 MU seminggu sekali x 3 MINGGU BERTURUT-TURUT (Jumlah 7.2 MU). Neurosifilis / Sifilis Okular: IV Aqueous Crystalline Penicillin G 18 - 24 MU sehari (diberikan 3-4 MU Q4H atau infusi berterusan) x 10-14 HARI.",
      "routeAndDose": "IM suntikan dalam (Intragluteal) / IV infusi berterusan untuk neurosifilis.",
      "durationDays": "Stat dose sehingga 3 minggu (Latent) / 10 - 14 days (Neurosyphilis)",
      "remarks": "Suntikan Benzathine Penicillin G TIDAK BOLEH DIGANTIKAN dengan penisilin oral atau formulasi jangka pendek lain untuk rawatan sifilis."
    },
    "secondLineDrugs": [
      "doxycycline",
      "ceftriaxone",
      "procaine penicillin"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Doxycycline 100mg BD x 14 hari (Sifilis awal) atau x 28 hari (Sifilis lewat) atau IM Ceftriaxone 1g-2g OD x 10-14 hari.",
      "routeAndDose": "Oral / IM.",
      "durationDays": "14 - 28 days",
      "remarks": "Doxycycline adalah alternatif utama untuk pesakit bukan hamil yang alah kepada penisilin."
    },
    "allergyDrugs": [
      "doxycycline",
      "erythromycin",
      "ceftriaxone"
    ],
    "penicillinAllergyOption": {
      "regimen": "Pesakit Bukan Hamil: Oral Doxycycline 100mg BD x 14 hari (awal) atau x 28 hari (lewat). WANITA HAMIL DENGAN SIFILIS: WAJIB DESENSITISASI PENISILIN dan rawat dengan Benzathine Penicillin G (tiada ubat lain yang terbukti mencegah sifilis kongenital janin!).",
      "routeAndDose": "Oral / Desensitisasi Penisilin.",
      "remarks": "Wanita hamil yang alah penisilin mesti dimasukkan ke hospital untuk prosedur desensitisasi segera."
    },
    "amsNotes": [
      "Beri amaran kepada pesakit mengenai Reaksi Jarisch-Herxheimer (demam, menggigil, sakit kepala, takikardia berlaku 2-8 jam selepas suntikan pertama akibat pelepasan endotoksin spiroket).",
      "Pantau titer kuantitatif RPR/VDRL pada bulan ke-3, 6, 12, dan 24 untuk mengesahkan tindak balas serologi yang berjaya (penurunan titer 4 kali ganda / fourfold decline)."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / CDC Syphilis Guidelines / WHO 2021)"
  },
  {
    "id": "NAG-A13-004",
    "targetPopulation": "Adult",
    "categoryCode": "A13",
    "categoryTitle": "A13 : Sexually Transmitted Infections",
    "topic": "4. GENITAL HERPES & ULCERATIVE STI",
    "topicNumber": 4,
    "bodySystem": "Sexually Transmitted Infections",
    "conditionName": "Genital Herpes Simplex (HSV-1 / HSV-2) & Chancroid",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Herpes Simplex Virus Type 2 (HSV-2) & HSV-1",
      "Haemophilus ducreyi (Chancroid / Ulser lembut)",
      "Chlamydia trachomatis serovars L1-L3 (Lymphogranuloma Venereum / LGV)"
    ],
    "firstLineDrugs": [
      "acyclovir",
      "valacyclovir",
      "azithromycin",
      "ceftriaxone",
      "doxycycline"
    ],
    "firstLineTherapy": {
      "regimen": "Herpes Genital Episod Pertama: Oral Acyclovir 400mg TDS x 7-10 hari (atau 200mg 5 kali sehari / Oral Valacyclovir 1g BD x 7-10 hari). Herpes Genital Episod Berulang: Oral Acyclovir 800mg TDS x 2 hari (atau 400mg TDS x 5 hari). Chancroid: Oral Azithromycin 1g stat (atau IM Ceftriaxone 250mg stat). LGV: Oral Doxycycline 100mg BD x 21 hari.",
      "routeAndDose": "Oral / IM.",
      "durationDays": "7 - 10 days (Herpes primer) / 2 - 5 days (Herpes berulang) / 21 days (LGV)",
      "remarks": "Mulakan Acyclovir seawal mungkin semasa kemunculan lesi vesikel atau fasa prodromal (rasa kesemutan/terbakar) untuk memendekkan tempoh luka dan kesakitan."
    },
    "secondLineDrugs": [
      "famciclovir",
      "ciprofloxacin",
      "erythromycin"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Famciclovir 250mg TDS x 5 hari atau Terapi Supresif Jangka Panjang: Oral Acyclovir 400mg BD berterusan jika episod berulang >6 kali setahun.",
      "routeAndDose": "Oral.",
      "durationDays": "5 days sehingga 12 bulan (Terapi Supresif)",
      "remarks": "Terapi supresif mengurangkan kekerapan serangan sebanyak 70-80% dan mengurangkan penularan kepada pasangan."
    },
    "allergyDrugs": [
      "acyclovir",
      "valacyclovir",
      "azithromycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "Semua rejimen di atas adalah bebas beta-laktam dan selamat untuk pesakit alahan penisilin.",
      "routeAndDose": "Oral.",
      "remarks": "Tiada sebarang kontraindikasi alahan penisilin."
    },
    "amsNotes": [
      "Ujian Titer HSV PCR atau kultur lesi vesikel adalah ujian diagnostik standard emas terpantas.",
      "Ibu hamil dengan lesi aktif herpes genital semasa onset kelahiran disyorkan menjalani Pembedahan Caesarean untuk mencegah transmisi Neonatal Herpes yang boleh membawa maut."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / CDC STI Guidelines 2021)"
  },
  {
    "id": "NAG-A14-001",
    "targetPopulation": "Adult",
    "categoryCode": "A14",
    "categoryTitle": "A14 : Skin & Soft Tissue Infections",
    "topic": "1. MILD & MODERATE SSTI",
    "topicNumber": 1,
    "bodySystem": "Skin & Soft Tissue Infections",
    "conditionName": "Folliculitis, Furuncles, Carbuncles, Impetigo & Cutaneous Abscess",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Staphylococcus aureus (MSSA & CA-MRSA)",
      "Streptococcus pyogenes (Group A Strep)"
    ],
    "firstLineDrugs": [
      "cloxacillin",
      "cephalexin",
      "fusidic acid",
      "mupirocin",
      "amoxicillin/clavulanic acid",
      "augmentin"
    ],
    "firstLineTherapy": {
      "regimen": "Abses Kulit Sederhana / Karbunkel: INSISI DAN PENYALIRAN NANAH (I&D) SEGERA + Oral Cloxacillin 500mg Q6H x 5-7 hari (atau Oral Cephalexin 500mg Q6H / Oral Augmentin 625mg TDS). Impetigo Terlokalisasi: Krim Asid Fusidik 2% atau Salap Mupirocin 2% sapu TDS x 5 hari.",
      "routeAndDose": "Prosedur I&D + Oral antibiotik.",
      "durationDays": "5 - 7 days",
      "remarks": "Abses kulit kecil tanpa selulitis sekeliling atau demam HANYA MEMERLUKAN INSISI & PENYALIRAN NANAH (antibiotik sistemik tidak diperlukan jika tiada komorbiditi sistemik)."
    },
    "secondLineDrugs": [
      "co-trimoxazole",
      "bactrim",
      "doxycycline",
      "clindamycin"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Bactrim Forte 1-2 tabs BD x 5-7 hari atau Oral Doxycycline 100mg BD x 5-7 hari atau Oral Clindamycin 300mg TDS.",
      "routeAndDose": "Oral.",
      "durationDays": "5 - 7 days",
      "remarks": "Pilihan utama jika disyaki Community-Acquired MRSA (CA-MRSA)."
    },
    "allergyDrugs": [
      "erythromycin",
      "azithromycin",
      "clindamycin",
      "doxycycline"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Clindamycin 300mg TDS atau Oral Doxycycline 100mg BD atau Oral Azithromycin 500mg OD x 3 hari",
      "routeAndDose": "Oral.",
      "remarks": "Selamat untuk pesakit alahan penisilin."
    },
    "amsNotes": [
      "Teknik I&D yang betul: Buat torehan mencukupi, pecahkan semua lokulasi (loculations), bersihkan nanah dengan salin, dan masukkan wick kasa steril.",
      "Ambil swab nanah untuk kultur C&S jika abses berulang atau gagal sembuh."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IDSA SSTI Guidelines 2014)"
  },
  {
    "id": "NAG-A14-002",
    "targetPopulation": "Adult",
    "categoryCode": "A14",
    "categoryTitle": "A14 : Skin & Soft Tissue Infections",
    "topic": "2. CELLULITIS & ERYSIPELAS",
    "topicNumber": 2,
    "bodySystem": "Skin & Soft Tissue Infections",
    "conditionName": "Non-Purulent Cellulitis & Erysipelas (Selulitis & Erisipelas)",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Streptococcus pyogenes (Group A Strep - punca utama)",
      "Streptococcus dysgalactiae (Group C/G Strep)",
      "Staphylococcus aureus (MSSA)",
      "Vibrio vulnificus (Pendedahan air laut / makanan laut mentah)"
    ],
    "firstLineDrugs": [
      "cloxacillin",
      "cefazolin",
      "cephalexin",
      "benzylpenicillin",
      "amoxicillin"
    ],
    "firstLineTherapy": {
      "regimen": "Selulitis Bukan Bernanah / Erisipelas Sederhana: IV Cloxacillin 1g-2g Q6H (or IV Cefazolin 1g-2g Q8H / IV Benzylpenicillin 2-4 MU Q6H) kemudian bertukar ke Oral Cephalexin 500mg-1g Q6H atau Oral Cloxacillin 500mg Q6H x 5-7 HARI JUMLAH.",
      "routeAndDose": "IV bertukar ke Oral + TINGGIKAN ANGGOTA YANG TERJEJAS (Limb Elevation).",
      "durationDays": "5 - 7 days (Tempoh 5 hari sama berkesan dengan 10 hari jika bengkak kemerahan terkawal)",
      "remarks": "Tanda garisan sempadan eritema dengan pen marker pada kulit semasa kemasukan untuk memantau regresi kemerahan setiap hari."
    },
    "secondLineDrugs": [
      "vancomycin",
      "ceftriaxone",
      "daptomycin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Ceftriaxone 2g OD atau IV Vancomycin 15-20mg/kg Q12H (jika ada faktor risiko MRSA atau sepsis).",
      "routeAndDose": "IV.",
      "durationDays": "5 - 7 days",
      "remarks": "Untuk pesakit yang mempunyai tanda toksisiti sistemik atau kegagalan dos pertama."
    },
    "allergyDrugs": [
      "clindamycin",
      "vancomycin",
      "clarithromycin",
      "levofloxacin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV/Oral Clindamycin 600mg Q8H x 5-7 hari atau Oral Clarithromycin 500mg BD x 7 hari",
      "routeAndDose": "Oral / IV.",
      "remarks": "Sesuai untuk pesakit alahan penisilin."
    },
    "stepDownDrugs": [
      "cephalexin",
      "cloxacillin",
      "amoxicillin"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Cephalexin 500mg Q6H atau Oral Cloxacillin 500mg Q6H.",
      "criteria": "Kemerahan kulit berhenti merebak dan mula pudar, pesakit afebril >24 jam, bengkak dan kesakitan reda."
    },
    "amsNotes": [
      "Limb Elevation (Menaikkan kaki melebihi paras jantung) adalah 50% daripada kejayaan rawatan untuk mengurangkan edema stasis vena.",
      "Rawat punca kemasukan bakteria seperti tinea pedis (athlete's foot) celah jari kaki dengan krim antikulat."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IDSA Practice Guidelines for SSTI)"
  },
  {
    "id": "NAG-A14-003",
    "targetPopulation": "Adult",
    "categoryCode": "A14",
    "categoryTitle": "A14 : Skin & Soft Tissue Infections",
    "topic": "3. NECROTISING FASCIITIS & GAS GANGRENE",
    "topicNumber": 3,
    "bodySystem": "Skin & Soft Tissue Infections",
    "conditionName": "Necrotising Fasciitis (Type I & II), Fournier's Gangrene & Clostridial Myonecrosis",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Type I Polymicrobial: Mixed Anaerobes (Bacteroides, Peptostreptococcus) + Enterobacterales (E. coli, Klebsiella) + Streptococci",
      "Type II Monomicrobial: Streptococcus pyogenes (Group A Strep / Flesh-eating) +/- S. aureus",
      "Clostridium perfringens (Gas Gangrene)",
      "Vibrio vulnificus (Marine trauma/cirrhosis)",
      "Aeromonas hydrophila (Freshwater trauma)"
    ],
    "firstLineDrugs": [
      "meropenem",
      "piperacillin/tazobactam",
      "tazocin",
      "clindamycin",
      "vancomycin",
      "benzylpenicillin"
    ],
    "firstLineTherapy": {
      "regimen": "DEBRIDEMENT PEMBEDAHAN KECEMASAN SERTA-MERTA (EMERGENCY SURGICAL EXPLORATION & FASCIOTOMY) + IV Meropenem 1g Q8H (or IV Tazocin 4.5g Q6H) + IV Clindamycin 900mg Q8H (UNTUK MERENCAT TOKSIN BAKTERIA) + IV Vancomycin 25-30mg/kg loading kemudian 15-20mg/kg Q12H.",
      "routeAndDose": "IV ICU dos tinggi kecemasan + Pembedahan debridement berulang.",
      "durationDays": "Sehingga tiada lagi tisu nekrotik pada pemeriksaan debridement ulangan (second-look) dan pesakit stabil hemodinamik",
      "remarks": "KECEMASAN PEMBEDAHAN TAHAP MAKSIMUM: Kelewatan pembedahan melebihi 6 jam meningkatkan kadar kematian secara mendadak. Clindamycin WAJIB ditambah kerana merencat penghasilan eksotoksin dan faktor virulens Group A Strep (Eagle effect)."
    },
    "secondLineDrugs": [
      "benzylpenicillin",
      "clindamycin",
      "ceftriaxone",
      "doxycycline"
    ],
    "secondLineTherapy": {
      "regimen": "Gas Gangrene Clostridial: IV Benzylpenicillin 4 MU Q4H + IV Clindamycin 900mg Q8H. Vibrio vulnificus: IV Ceftriaxone 2g OD + IV Doxycycline 100mg BD.",
      "routeAndDose": "IV.",
      "durationDays": "10 - 14 days",
      "remarks": "Rawatan sasaran mengikut etiologi khusus."
    },
    "allergyDrugs": [
      "ciprofloxacin",
      "metronidazole",
      "vancomycin",
      "clindamycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Ciprofloxacin 400mg Q8H + IV Metronidazole 500mg Q8H + IV Vancomycin 15-20mg/kg Q12H + IV Clindamycin 900mg Q8H",
      "routeAndDose": "IV.",
      "remarks": "Bebas kompaun beta-laktam."
    },
    "amsNotes": [
      "Gunakan Skor LRINEC (Laboratory Risk Indicator for Necrotizing Fasciitis); skor ≥6 memberi amaran kuat necrotising fasciitis.",
      "Tanda amaran klinikal: Kesakitan melampau tidak sepadan dengan rupa fizikal luka (pain out of proportion), krepitus gas subkutaneus, bullae berdarah, dan hipoestesia kulit."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / WSES Necrotizing Soft Tissue Infection Guidelines)"
  },
  {
    "id": "NAG-A14-004",
    "targetPopulation": "Adult",
    "categoryCode": "A14",
    "categoryTitle": "A14 : Skin & Soft Tissue Infections",
    "topic": "4. DIABETIC FOOT ULCERS & SURGICAL SITE INFECTIONS",
    "topicNumber": 4,
    "bodySystem": "Skin & Soft Tissue Infections",
    "conditionName": "Diabetic Foot Ulcers (DFU - Moderate/Severe) & Surgical Site Infections (SSI)",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Staphylococcus aureus (MSSA & MRSA)",
      "Streptococcus agalactiae (Group B Strep) & Strep pyogenes",
      "Enterobacterales (Klebsiella pneumoniae, Proteus, E. coli)",
      "Pseudomonas aeruginosa (luka kronik lembap/berendam)",
      "Anaerobes (Bacteroides, Peptostreptococcus)"
    ],
    "firstLineDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "ampicillin/sulbactam",
      "unasyn",
      "ciprofloxacin",
      "metronidazole"
    ],
    "firstLineTherapy": {
      "regimen": "DFU Sederhana (Selulitis >2cm / Struktur Dalam): IV Co-Amoxiclav 1.2g TDS (or IV Ampicillin-Sulbactam 1.5g-3g Q6H). DFU Teruk Mengancam Anggota / Sepsis: IV Tazocin 4.5g Q6H (or IV Cefepime 2g Q8H + IV Metronidazole 500mg TDS) + IV Vancomycin 15mg/kg Q12H (jika risiko MRSA) + PEMBERSIHAN DEBRIDEMENT PEMBEDAHAN & OFF-LOADING.",
      "routeAndDose": "IV bertukar ke Oral Augmentin 625mg TDS.",
      "durationDays": "1 - 2 weeks (Jangkitan tisu lembut); 4 - 6 weeks (jika melibatkan osteomielitis tulang)",
      "remarks": "Off-loading (mengurangkan tekanan pada luka tapak kaki) dan penilaian vaskular periferi (ABPI/Doppler) adalah penentu mutlak penyembuhan ulser."
    },
    "secondLineDrugs": [
      "piperacillin/tazobactam",
      "tazocin",
      "meropenem",
      "vancomycin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Piperacillin/Tazobactam 4.5g Q6H atau IV Meropenem 1g Q8H (+/- IV Vancomycin)",
      "routeAndDose": "IV.",
      "durationDays": "2 - 4 weeks",
      "remarks": "Untuk kes luka tercemar nosokomial atau ulser iskemia gangrenous."
    },
    "allergyDrugs": [
      "ciprofloxacin",
      "metronidazole",
      "clindamycin",
      "vancomycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral/IV Ciprofloxacin 500-750mg BD + Oral/IV Metronidazole 400-500mg TDS (+/- IV Vancomycin)",
      "routeAndDose": "Oral/IV.",
      "remarks": "Sesuai untuk pesakit alahan penisilin."
    },
    "stepDownDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "ciprofloxacin",
      "metronidazole"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Augmentin 625mg TDS atau (Oral Ciprofloxacin 500mg BD + Oral Metronidazole 400mg TDS).",
      "criteria": "Luka telah dibersihkan secara surgikal, tanda selulitis surut, tiada demam, kawalan gula darah stabil."
    },
    "amsNotes": [
      "JANGAN ambil kultur swab permukaan luka berkeruping; cuci luka dengan salin terlebih dahulu dan ambil biopsi tisu kuretaj dalam dari dasar ulser.",
      "Lakukan X-ray Kaki untuk mengesan gas subkutaneus dan osteomielitis (cortical erosion/periosteal reaction)."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IWGDF Guidelines on Diabetic Foot Infection 2023)"
  },
  {
    "id": "NAG-A14-005",
    "targetPopulation": "Adult",
    "categoryCode": "A14",
    "categoryTitle": "A14 : Skin & Soft Tissue Infections",
    "topic": "5. ANIMAL & HUMAN BITES",
    "topicNumber": 5,
    "bodySystem": "Skin & Soft Tissue Infections",
    "conditionName": "Animal & Human Bite Wounds (Gigitan Anjing, Kucing & Manusia)",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Pasteurella multocida & Pasteurella canis (Gigitan kucing/anjing)",
      "Capnocytophaga canimorsus (Gigitan anjing / sepsis asplenia)",
      "Eikenella corrodens (Gigitan manusia / luka tumbukan 'clenched-fist')",
      "Staphylococcus aureus & Streptococcus pyogenes",
      "Oral Anaerobes (Fusobacterium, Peptostreptococcus)"
    ],
    "firstLineDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "unasyn",
      "ampicillin/sulbactam"
    ],
    "firstLineTherapy": {
      "regimen": "Profilaksis / Rawatan Gigitan Haiwan & Manusia: Oral Augmentin 625mg TDS x 5-7 hari (atau IV Co-Amoxiclav 1.2g TDS / IV Ampicillin-Sulbactam 1.5g-3g Q6H jika jangkitan teruk) + CUCI LUKA INTENSIF DENGAN AIR MENGALIR DAN SABUN + SUNTIKAN TOXOID TETANUS & PENILAIAN RISIKO RABIES.",
      "routeAndDose": "Oral / IV + Pencucian luka segera.",
      "durationDays": "3 - 5 days (Profilaksis luka baru berisiko) / 7 - 10 days (Luka telah dijangkiti)",
      "remarks": "JANGAN JAHIT LUKA GIGITAN SECARA PRIMER (kecuali luka muka kosmetik selepas pembersihan teliti); membiarkan luka terbuka mengurangkan risiko abses ruang tertutup dan tenosinovitis."
    },
    "secondLineDrugs": [
      "doxycycline",
      "metronidazole",
      "ciprofloxacin"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Doxycycline 100mg BD + Oral Metronidazole 400mg TDS x 7 hari atau Oral Ciprofloxacin 500mg BD + Metronidazole 400mg TDS.",
      "routeAndDose": "Oral.",
      "durationDays": "7 days",
      "remarks": "Alternatif untuk pesakit alahan penisilin (Perhatian: Cephalosporin generasi pertama, Clindamycin, dan Macrolide TIDAK boleh digunakan sebagai monoterapi kerana aktiviti lemah terhadap Pasteurella multocida)."
    },
    "allergyDrugs": [
      "doxycycline",
      "metronidazole",
      "ciprofloxacin",
      "co-trimoxazole",
      "bactrim"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Doxycycline 100mg BD x 7 hari (or Oral Ciprofloxacin 500mg BD + Oral Metronidazole 400mg TDS / Oral Bactrim Forte 1 tab BD + Metronidazole)",
      "routeAndDose": "Oral kombinasi.",
      "remarks": "Kombinasi ini memberi liputan lengkap Pasteurella, Eikenella, dan kuman anaerobik mulut."
    },
    "amsNotes": [
      "Semak status vaksinasi Tetanus pesakit; berikan suntikan ATT 0.5mL IM jika dos penggalak terakhir >5 tahun lepas (tambah Tetanus Immunoglobulin 250 IU jika luka kotor).",
      "PROTOKOL PROFILAKSIS RABIES (KKM & WHO PEP PROTOCOL):",
      "• Cuci serta-merta semua luka gigitan/cakaran dengan air mengalir dan sabun selama sekurang-kurangnya 15 minit dan sapu Povidone Iodine 10%.",
      "• Kategori II (Cakaran/gigitan tanpa pendarahan): Vaksin Rabies 2-site Intradermal (ID) 0.1 mL bilateral deltoid pada Hari 0, 3, dan 7 (Jumlah 6 suntikan ID).",
      "• Kategori III (Luka tembus pendarahan / gigitan dalam / air liur pada membran mukosa): Vaksin Rabies 2-site ID (Hari 0, 3, 7) + WAJIB infiltrasi Rabies Immunoglobulin (HRIG 20 IU/kg atau ERIG 40 IU/kg) di sekeliling semua luka pada Hari 0.",
      "• Wajib lapor kes gigitan haiwan kepada Pusat Kesihatan Daerah / Pejabat Kesihatan untuk siasatan survelan rabies."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / KKM Rabies Guidelines / WHO 2018)"
  },
  {
    "id": "NAG-A15-001",
    "targetPopulation": "Adult",
    "categoryCode": "A15",
    "categoryTitle": "A15 : Trauma Related Infections",
    "topic": "1. OPEN FRACTURES (GUSTILO-ANDERSON GRADE I - III)",
    "topicNumber": 1,
    "bodySystem": "Trauma Related Infections",
    "conditionName": "Open Fractures (Gustilo-Anderson Grade I, II, III Prophylaxis & Management)",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Staphylococcus aureus (MSSA & MRSA)",
      "Streptococcus pyogenes",
      "Enterobacterales & Pseudomonas aeruginosa (Grade III / Pencemaran tanah)",
      "Clostridium perfringens & Clostridium tetani"
    ],
    "firstLineDrugs": [
      "cefazolin",
      "gentamicin",
      "cloxacillin",
      "benzylpenicillin",
      "metronidazole"
    ],
    "firstLineTherapy": {
      "regimen": "Gustilo Gred I & II (<10cm luka bersih): IV Cefazolin 2g Q8H (or IV Cloxacillin 2g Q6H) x 24-48 jam. Gustilo Gred III (>10cm / Kerosakan Tisu Lemuk / Pencemaran Tanah / Kemalangan Pertanian): IV Cefazolin 2g Q8H + IV Gentamicin 5mg/kg OD (+ IV Benzylpenicillin 2-4 MU Q4H atau Metronidazole 500mg TDS jika tercemar najis/tanah) + DEBRIDEMENT PEMBEDAHAN KECEMASAN DI DEWAN BEDAH DALAM MASA <6-12 JAM.",
      "routeAndDose": "IV dos pertama diberikan SERTA-MERTA di Jabatan Kecemasan.",
      "durationDays": "24 - 48 hours (Gred I/II) / Maksimum 72 jam atau 24 jam selepas penutupan luka definitif (Gred III)",
      "remarks": "Pemberian antibiotik dalam masa 3 JAM PERTAMA dari kecederaan adalah faktor terpenting mengurangkan risiko osteomielitis pasca-trauma."
    },
    "secondLineDrugs": [
      "vancomycin",
      "piperacillin/tazobactam",
      "tazocin",
      "meropenem"
    ],
    "secondLineTherapy": {
      "regimen": "IV Vancomycin 15-20mg/kg Q12H + IV Piperacillin/Tazobactam 4.5g Q6H (atau IV Meropenem 1g Q8H)",
      "routeAndDose": "IV.",
      "durationDays": "72 hours",
      "remarks": "Bagi fraktur terbuka dengan risiko tinggi MRSA atau trauma persekitaran air payau/laut."
    },
    "allergyDrugs": [
      "clindamycin",
      "gentamicin",
      "ciprofloxacin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Clindamycin 900mg Q8H + IV Gentamicin 5mg/kg OD (or IV Ciprofloxacin 400mg Q12H)",
      "routeAndDose": "IV.",
      "remarks": "Bebas beta-laktam."
    },
    "amsNotes": [
      "PENCUCIAN MEKANIKAL: Alirkan larutan salin steril dengan isipadu yang banyak (min 3-9 Liter) di dewan bedah untuk menyingkirkan bendasing dan bakteria.",
      "Antibiotik profilaksis TIDAK BOLEH DITERUSKAN melebihi 72 jam kerana tidak memberi manfaat tambahan sebaliknya menggalakkan kolonisasi kuman hospital yang kebal."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / EAST Open Fracture Practice Guidelines)"
  },
  {
    "id": "NAG-A15-002",
    "targetPopulation": "Adult",
    "categoryCode": "A15",
    "categoryTitle": "A15 : Trauma Related Infections",
    "topic": "2. PENETRATING CNS & HEAD TRAUMA",
    "topicNumber": 2,
    "bodySystem": "Trauma Related Infections",
    "conditionName": "Penetrating Brain Injury, Compound Depressed Skull Fracture & Basal Skull CSF Leak",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Staphylococcus aureus (MSSA & MRSA)",
      "Streptococcus pneumoniae (Kebocoran CSF / Otorea / Rinorea)",
      "Enterobacterales & Pseudomonas aeruginosa",
      "Clostridium spp. & Anaerobes"
    ],
    "firstLineDrugs": [
      "ceftriaxone",
      "vancomycin",
      "metronidazole",
      "ceftazidime"
    ],
    "firstLineTherapy": {
      "regimen": "Kecederaan Tembus Kepala / Fraktur Tengkorak Terbuka: IV Ceftriaxone 2g Q12H + IV Vancomycin 15-20mg/kg Q12H + IV Metronidazole 500mg Q8H x 7-10 hari. Fraktur Dasar Tengkorak dengan Kebocoran CSF Akut: PEMERHATIAN RAPI & ELAK PROFILAKSIS ANTIBIOTIK RUTIN (kecuali disahkan meningitis bakteria: IV Ceftriaxone 2g Q12H).",
      "routeAndDose": "IV menembusi sawar darah-otak dos penuh.",
      "durationDays": "7 - 10 days",
      "remarks": "Kajian menunjukkan profilaksis antibiotik berpanjangan pada kebocoran CSF tidak mencegah meningitis tetapi memilih kuman hospital yang kebal (pneumokokus resistan/Gram-negatif)."
    },
    "secondLineDrugs": [
      "meropenem",
      "vancomycin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Meropenem 2g Q8H + IV Vancomycin 15-20mg/kg Q8H-Q12H",
      "routeAndDose": "IV infusi.",
      "durationDays": "10 - 14 days",
      "remarks": "Untuk kecederaan tembus otak tercemar teruk atau meningitis pasca-trauma nosokomial."
    },
    "allergyDrugs": [
      "chloramphenicol",
      "vancomycin",
      "metronidazole"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Chloramphenicol 25mg/kg Q6H + IV Vancomycin 15mg/kg Q12H + IV Metronidazole 500mg Q8H",
      "routeAndDose": "IV.",
      "remarks": "Penembusan cecair serebrospinal yang sangat baik."
    },
    "amsNotes": [
      "Debridement pembedahan neurosurgeri segera untuk mengeluarkan serpihan tulang terbenam dan bendasing adalah kunci utama pencegahan abses otak.",
      "Suntikan vaksin Pneumococcal disyorkan untuk pesakit dengan kebocoran CSF berterusan."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / Brain Trauma Foundation Guidelines)"
  },
  {
    "id": "NAG-A15-003",
    "targetPopulation": "Adult",
    "categoryCode": "A15",
    "categoryTitle": "A15 : Trauma Related Infections",
    "topic": "3. PENETRATING ABDOMINAL & THORACIC TRAUMA",
    "topicNumber": 3,
    "bodySystem": "Trauma Related Infections",
    "conditionName": "Penetrating Abdominal & Thoracic Trauma (Luka Tikaman/Tembakan Abdomen & Dada)",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Escherichia coli & Klebsiella pneumoniae",
      "Bacteroides fragilis & Anaerobes",
      "Enterococcus faecalis",
      "Staphylococcus aureus (Toraks)"
    ],
    "firstLineDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "ceftriaxone",
      "metronidazole",
      "cefazolin"
    ],
    "firstLineTherapy": {
      "regimen": "Trauma Tembus Abdomen (Perforasi Usus / Laparotomi Kecemasan): IV Co-Amoxiclav 1.2g TDS (or IV Ceftriaxone 2g OD + IV Metronidazole 500mg TDS) dimulakan sebelum pembedahan x 24 JAM SAHAJA. Trauma Tembus Toraks / Pemasangan Tiub Dada Hemotoraks: IV Cefazolin 2g stat dos tunggal (profilaksis tiub dada).",
      "routeAndDose": "IV parenteral.",
      "durationDays": "24 hours sahaja (panjangkan ke 3-5 hari hanya jika terdapat peritonitis fekal meluas)",
      "remarks": "Kajian klinikal membuktikan antibiotik profilaksis selama 24 jam selepas laparotomi trauma adalah sama berkesan dengan rejimen 5 hari."
    },
    "secondLineDrugs": [
      "piperacillin/tazobactam",
      "tazocin",
      "meropenem"
    ],
    "secondLineTherapy": {
      "regimen": "IV Piperacillin/Tazobactam 4.5g Q6H atau IV Meropenem 1g Q8H",
      "routeAndDose": "IV.",
      "durationDays": "3 - 5 days",
      "remarks": "Bagi kes kejutan syok hemoragik berpanjangan dengan kontaminasi masif."
    },
    "allergyDrugs": [
      "ciprofloxacin",
      "metronidazole",
      "clindamycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Ciprofloxacin 400mg Q8H-Q12H + IV Metronidazole 500mg Q8H (or IV Clindamycin 900mg Q8H + IV Gentamicin 5mg/kg OD)",
      "routeAndDose": "IV.",
      "remarks": "Bebas beta-laktam."
    },
    "amsNotes": [
      "Kawal punca perdarahan dan kebocoran usus (Damage Control Surgery) dalam masa keemasan trauma.",
      "Hentikan antibiotik pada 24 jam sekiranya tiada perforasi organ berongga (hollow viscus) dijumpai semasa laparotomi."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / EAST Penetrating Trauma Guidelines)"
  },
  {
    "id": "NAG-A15-004",
    "targetPopulation": "Adult",
    "categoryCode": "A15",
    "categoryTitle": "A15 : Trauma Related Infections",
    "topic": "4. BURN WOUND INFECTIONS & SEPSIS",
    "topicNumber": 4,
    "bodySystem": "Trauma Related Infections",
    "conditionName": "Severe Burn Wound Infections & Burn Sepsis (Luka Kebakaran Teruk & Sepsis)",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Pseudomonas aeruginosa",
      "Acinetobacter baumannii (MDR)",
      "Staphylococcus aureus (MSSA & MRSA)",
      "Klebsiella pneumoniae & Enterobacterales",
      "Candida spp. & Aspergillus spp."
    ],
    "firstLineDrugs": [
      "silver sulfadiazine",
      "piperacillin/tazobactam",
      "tazocin",
      "meropenem",
      "vancomycin"
    ],
    "firstLineTherapy": {
      "regimen": "Penjagaan Luka Topikal: Krim Silver Sulfadiazine 1% (SSD) atau Balutan Antimikrobial Perak (Silver-impregnated dressings) + Eskaroteomi/Debridement pembedahan. Sepsis Melecur Sistemik: IV Piperacillin/Tazobactam 4.5g Q6H (or IV Meropenem 1g Q8H) + IV Vancomycin 15-20mg/kg Q12H.",
      "routeAndDose": "Topikal untuk luka rutin; IV hanya jika terdapat tanda sepsis sistemik.",
      "durationDays": "7 days (Sepsis sistemik)",
      "remarks": "ELAKKAN PROFILAKSIS ANTIBIOTIK SISTEMIK RUTIN pada pesakit luka bakar tanpa tanda sepsis kerana hanya menggalakkan kolonisasi kuman MDR kebal ubat dan jangkitan kulat."
    },
    "secondLineDrugs": [
      "colistin",
      "polymyxin b",
      "amikacin",
      "caspofungin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Colistin (Loading 9 MU kemudian 4.5 MU BD) + IV Meropenem 2g Q8H + IV Caspofungin 70mg loading kemudian 50mg OD",
      "routeAndDose": "IV ICU.",
      "durationDays": "7 - 14 days",
      "remarks": "Bagi sepsis luka bakar akibat kuman Acinetobacter/Pseudomonas MDR atau rintangan karbapenem."
    },
    "allergyDrugs": [
      "ciprofloxacin",
      "vancomycin",
      "amikacin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Ciprofloxacin 400mg Q8H + IV Vancomycin 15-20mg/kg Q12H + IV Amikacin 15mg/kg OD",
      "routeAndDose": "IV.",
      "remarks": "Selamat untuk pesakit alahan penisilin."
    },
    "amsNotes": [
      "Ambil Biopsi Tisu Kuantitatif Luka Bakar (Burn wound quantitative tissue biopsy >10^5 CFU/g tisu mengesahkan jangkitan invasif berbanding kolonisasi).",
      "Kerap lakukan excisional debridement dan penutupan luka awal dengan graf kulit (early excision and grafting)."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / ABA Burn Sepsis Guidelines)"
  },
  {
    "id": "NAG-A16-001",
    "targetPopulation": "Adult",
    "categoryCode": "A16",
    "categoryTitle": "A16 : Tropical Infections",
    "topic": "1. LEPTOSPIROSIS",
    "topicNumber": 1,
    "bodySystem": "Tropical Infections",
    "conditionName": "Leptospirosis - Mild Anicteric vs Severe Icteric (Weil's Disease)",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Leptospira interrogans (Pelbagai serovar: icterohaemorrhagiae, canicola, pomona)"
    ],
    "firstLineDrugs": [
      "doxycycline",
      "amoxicillin",
      "benzylpenicillin",
      "ceftriaxone"
    ],
    "firstLineTherapy": {
      "regimen": "Leptospirosis Ringan (Pesakit Luar): Oral Doxycycline 100mg BD x 7 hari (atau Oral Amoxicillin 500mg-1g TDS x 7 hari / Oral Azithromycin 500mg OD x 3 hari). Leptospirosis Teruk / Penyakit Weil (Jaundis, Kegagalan Ginjal, Pendarahan Pulmonari): IV Benzylpenicillin 1.5 MU Q6H (or IV Ceftriaxone 2g OD) x 7 HARI.",
      "routeAndDose": "Oral untuk kes ringan; IV untuk kes teruk.",
      "durationDays": "7 days",
      "remarks": "Mulakan antibiotik SEAWAL MUNGKIN sebaik diagnosis klinikal disyaki tanpa menunggu keputusan serologi MAT (Microscopic Agglutination Test) atau PCR."
    },
    "secondLineDrugs": [
      "ceftriaxone",
      "cefotaxime",
      "ampicillin",
      "azithromycin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Ceftriaxone 2g OD atau IV Cefotaxime 1g-2g Q6H x 7 hari.",
      "routeAndDose": "IV dos harian tunggal.",
      "durationDays": "7 days",
      "remarks": "Ceftriaxone terbukti sama berkesan dengan Benzylpenicillin dan lebih mudah diberikan secara sekali sehari (OD)."
    },
    "allergyDrugs": [
      "doxycycline",
      "azithromycin",
      "ceftriaxone"
    ],
    "penicillinAllergyOption": {
      "regimen": "Ringan: Oral Doxycycline 100mg BD x 7 hari. Teruk: IV Ceftriaxone 2g OD (jika alahan ringan) atau IV Azithromycin 500mg OD x 7 hari (atau IV Doxycycline 100mg BD).",
      "routeAndDose": "Oral / IV.",
      "remarks": "Doxycycline dan Azithromycin adalah pilihan utama bebas penisilin."
    },
    "stepDownDrugs": [
      "doxycycline",
      "amoxicillin"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Doxycycline 100mg BD atau Oral Amoxicillin 500mg TDS selepas fasa akut parenteral terkawal.",
      "criteria": "Pesakit afebril >48 jam, tiada pendarahan, fungsi ginjal dan enzim hepar bertambah baik."
    },
    "amsNotes": [
      "Pantau tanda Reaksi Jarisch-Herxheimer dalam 24 jam pertama selepas permulaan penisilin.",
      "Pantau gas darah dan radiograf dada dengan teliti untuk mengesan Komplikasi Pendarahan Pulmonari Teruk (Severe Pulmonary Haemorrhage Syndrome) yang memerlukan ventilasi protektif awal."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / WHO Leptospirosis Guidelines)"
  },
  {
    "id": "NAG-A16-002",
    "targetPopulation": "Adult",
    "categoryCode": "A16",
    "categoryTitle": "A16 : Tropical Infections",
    "topic": "2. MELIOIDOSIS",
    "topicNumber": 2,
    "bodySystem": "Tropical Infections",
    "conditionName": "Melioidosis (Burkholderia pseudomallei) - Acute Intensive & Eradication Phases",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Burkholderia pseudomallei"
    ],
    "firstLineDrugs": [
      "ceftazidime",
      "meropenem",
      "co-trimoxazole",
      "bactrim",
      "folic acid"
    ],
    "firstLineTherapy": {
      "regimen": "FASA INTENSIF AKUT (Minimum 14 - 28 Hari): IV Ceftazidime 2g Q8H infusi 3 jam (or IV Meropenem 1g-2g Q8H jika septik syok/ICU) (+/- Oral Bactrim jika ada abses organ/neurologi). FASA PEMBASMIAN ORAL (Eradication Phase - 3 hingga 6 BULAN): Oral Co-Trimoxazole (Bactrim) pada dos berdasarkan berat badan (Berat >60kg: Bactrim Forte 2 tablet BD; 40-60kg: 1.5 tablet BD) + Oral Asid Folik 5mg OD.",
      "routeAndDose": "IV infusi fasa akut diikuti Terapi Oral Berpanjangan.",
      "durationDays": "Fasa Intensif: Min 14 hari (sehingga 4-8 minggu jika abses dalaman); Fasa Pembasmian: 3 hingga 6 BULAN",
      "remarks": "KEPATUHAN FASA ERADIKASI ADALAH KRITIKAL: Kegagalan melengkapkan rawatan oral Bactrim selama minimum 3 bulan mengakibatkan kadar jangkitan melioidosis berulang (relapse) setinggi 30-50%."
    },
    "secondLineDrugs": [
      "meropenem",
      "amoxicillin/clavulanic acid",
      "augmentin",
      "doxycycline"
    ],
    "secondLineTherapy": {
      "regimen": "Fasa Intensif: IV Meropenem 1g-2g Q8H. Fasa Eradikasi Alternatif (jika alahan/intoleransi Bactrim): Oral Augmentin 1g TDS (atau Oral Augmentin 625mg Q6H) + Oral Doxycycline 100mg BD x 3-6 bulan.",
      "routeAndDose": "IV / Oral.",
      "durationDays": "3 - 6 months",
      "remarks": "Augmentin adalah pilihan kedua terbaik untuk fasa pembasmian sekiranya pesakit alah sulfa."
    },
    "allergyDrugs": [
      "meropenem",
      "co-trimoxazole",
      "bactrim",
      "doxycycline"
    ],
    "penicillinAllergyOption": {
      "regimen": "Fasa Intensif: IV Meropenem 1g-2g Q8H (atau protokol desensitisasi Ceftazidime). Fasa Eradikasi: Oral Co-Trimoxazole + Folic Acid x 3-6 bulan",
      "routeAndDose": "IV bertukar Oral.",
      "remarks": "Bactrim adalah ubat pembasmian utama bebas penisilin."
    },
    "stepDownDrugs": [
      "co-trimoxazole",
      "bactrim",
      "folic acid"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Bactrim Forte 2 tabs BD + Folic Acid 5mg OD selama 3-6 bulan.",
      "criteria": "Pesakit afebril sekurang-kurangnya 48-72 jam berturut-turut, kultur darah/kahak berulang steril, abses viseral telah mengecut pada imbasan CT."
    },
    "amsNotes": [
      "Lakukan Imbasan CT Toraks, Abdomen & Pelvis (CT TAP) dan USG Prostat untuk semua pesakit melioidosis bagi mengesan abses tersembunyi (cth: abses limpa 'swiss-cheese', abses hepar, abses prostat).",
      "Pantau FBC dan paras kalium berkala semasa terapi Bactrim dos tinggi berpanjangan."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / Darwin Melioidosis Guideline 2020)"
  },
  {
    "id": "NAG-A16-003",
    "targetPopulation": "Adult",
    "categoryCode": "A16",
    "categoryTitle": "A16 : Tropical Infections",
    "topic": "3. ENTERIC / TYPHOID FEVER",
    "topicNumber": 3,
    "bodySystem": "Tropical Infections",
    "conditionName": "Enteric / Typhoid Fever (Demam Kepialu - Salmonella Typhi & Paratyphi)",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Salmonella enterica serovar Typhi",
      "Salmonella enterica serovar Paratyphi A, B, C"
    ],
    "firstLineDrugs": [
      "ceftriaxone",
      "azithromycin",
      "ciprofloxacin"
    ],
    "firstLineTherapy": {
      "regimen": "Demam Tifoid Tidak Kompleks (Pesakit Luar): Oral Azithromycin 1g OD x 7 hari (atau Oral Ciprofloxacin 500-750mg BD x 7-10 hari jika strain disahkan sensitif). Demam Tifoid Teruk / Dimasukkan ke Wad: IV Ceftriaxone 2g OD x 10-14 hari (+ IV Dexamethasone 3mg/kg loading kemudian 1mg/kg Q6H x 48 jam jika mengalami delirium/stupor/syok).",
      "routeAndDose": "Oral untuk kes ringan; IV untuk kes teruk/bakteremia.",
      "durationDays": "7 days (Azithromycin) / 10 - 14 days (Ceftriaxone)",
      "remarks": "Steroid dos tinggi (Dexamethasone) terbukti mengurangkan kadar kematian pada demam kepialu teruk dengan ensefalopati atau kejutan septik."
    },
    "secondLineDrugs": [
      "cefotaxime",
      "meropenem",
      "co-trimoxazole",
      "bactrim"
    ],
    "secondLineTherapy": {
      "regimen": "IV Cefotaxime 2g Q8H x 10-14 hari atau IV Meropenem 1g Q8H (untuk strain XDR rintang-sefalosporin) atau Oral Bactrim Forte 2 tabs BD x 14 hari.",
      "routeAndDose": "IV / Oral.",
      "durationDays": "10 - 14 days",
      "remarks": "Bagi kes kegagalan terapi atau strain resistan berbilang ubat (MDR/XDR)."
    },
    "allergyDrugs": [
      "azithromycin",
      "ciprofloxacin",
      "co-trimoxazole",
      "bactrim"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral/IV Azithromycin 1g OD (hari 1) kemudian 500mg OD x 7 hari atau Oral Ciprofloxacin 500mg BD x 10 hari",
      "routeAndDose": "Oral / IV.",
      "remarks": "Bebas beta-laktam."
    },
    "stepDownDrugs": [
      "azithromycin",
      "ciprofloxacin"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Azithromycin 500mg-1g OD atau Oral Ciprofloxacin 500mg BD.",
      "criteria": "Pesakit afebril >48 jam, sakit perut reda, boleh makan ubat oral tanpa muntah."
    },
    "amsNotes": [
      "Kultur Darah (Blood C&S) mempunyai hasil tertinggi pada minggu pertama penyakit; Kultur Najis positif bermula minggu ke-2 hingga ke-3.",
      "Semua kes demam tifoid WAJIB dinotifikasi ke Pejabat Kesihatan Daerah (PKD) di bawah Akta Pencegahan dan Pengawalan Penyakit Berjangkit 1988."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / WHO Typhoid Guidelines)"
  },
  {
    "id": "NAG-A16-004",
    "targetPopulation": "Adult",
    "categoryCode": "A16",
    "categoryTitle": "A16 : Tropical Infections",
    "topic": "4. RICKETTSIAL INFECTIONS & SCRUB TYPHUS",
    "topicNumber": 4,
    "bodySystem": "Tropical Infections",
    "conditionName": "Scrub Typhus (Orientia tsutsugamushi), Murine Typhus & Spotted Fever Rickettsioses",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Orientia tsutsugamushi (Scrub typhus - bawaan tungau chigger mite)",
      "Rickettsia typhi (Murine typhus - bawaan kutu pinjal tikus)",
      "Rickettsia prowazekii (Epidemic typhus)",
      "Rickettsia honei / Spotted fever group"
    ],
    "firstLineDrugs": [
      "doxycycline",
      "azithromycin"
    ],
    "firstLineTherapy": {
      "regimen": "Oral Doxycycline 100mg BD x 7 hari (REJIMEN STANDARD EMAS). Pesakit Teruk Dimasukkan ke Wad: IV Doxycycline 100mg BD x 7 hari (atau Oral/IV Azithromycin 500mg OD x 3-5 hari).",
      "routeAndDose": "Oral / IV.",
      "durationDays": "7 days (Doxycycline) / 3 - 5 days (Azithromycin)",
      "remarks": "TANDA KLINIKAL PATOGNOMONIK: Periksa seluruh permukaan kulit pesakit (terutamanya ketiak, celah paha, bawah payudara, dan lipatan pinggang) untuk mengesan 'ESCHAR' (kudis nekrotik hitam menyerupai kesan puntung rokok)."
    },
    "secondLineDrugs": [
      "chloramphenicol",
      "clarithromycin"
    ],
    "secondLineTherapy": {
      "regimen": "Oral/IV Chloramphenicol 500mg Q6H x 7-10 hari atau Oral Clarithromycin 500mg BD x 7 hari.",
      "routeAndDose": "Oral / IV.",
      "durationDays": "7 - 10 days",
      "remarks": "Alternatif sekiranya Doxycycline dan Azithromycin tidak tersedia."
    },
    "allergyDrugs": [
      "doxycycline",
      "azithromycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Doxycycline 100mg BD x 7 hari atau Oral Azithromycin 500mg OD x 5 hari",
      "routeAndDose": "Oral.",
      "remarks": "Kedua-dua ubat adalah bebas daripada struktur penisilin."
    },
    "amsNotes": [
      "Respons terhadap Doxycycline adalah amat pantas (defervescence biasanya berlaku dalam masa 24-48 jam); ketiadaan tindak balas selepas 48 jam memerlukan pertimbangan diagnosis alternatif seperti Leptospirosis atau Denggi.",
      "Azithromycin adalah ubat pilihan utama yang selamat untuk wanita hamil dengan scrub typhus."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / CDC Rickettsial Guidelines)"
  },
  {
    "id": "NAG-A16-005",
    "targetPopulation": "Adult",
    "categoryCode": "A16",
    "categoryTitle": "A16 : Tropical Infections",
    "topic": "5. MALARIA",
    "topicNumber": 5,
    "bodySystem": "Tropical Infections",
    "conditionName": "Uncomplicated vs Severe Malaria (P. falciparum, P. knowlesi, P. vivax, P. malariae)",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Plasmodium knowlesi (Malaria zoonotik kera - lazim di Malaysia/Borneo)",
      "Plasmodium falciparum (Malaria malignan falciparum)",
      "Plasmodium vivax & Plasmodium ovale",
      "Plasmodium malariae"
    ],
    "firstLineDrugs": [
      "artemether/lumefantrine",
      "artesunate",
      "primaquine",
      "dihydroartemisinin/piperaquine"
    ],
    "firstLineTherapy": {
      "regimen": "Malaria Tidak Kompleks (Semua Spesies): Oral Artemether-Lumefantrine (Riamet: 20/120mg) 4 tablet pada jam 0, 8, 24, 36, 48, dan 60 (Jumlah 6 dos selama 3 hari) DIMAKAN BERSAMA MAKANAN BERLEMAK / SUSU + Oral Primaquine (0.25mg/kg dos tunggal untuk gametosida P. falciparum; ATAU 0.5mg/kg OD x 14 hari untuk hipnozoit P. vivax/ovale). Malaria Teruk / Parasitemia Tinggi (>20,000/mcL bagi P. knowlesi atau >2% bagi P. falciparum): IV Artesunate 2.4 mg/kg pada jam 0, 12, 24 kemudian OD sehingga boleh mengambil oral.",
      "routeAndDose": "Oral untuk tidak kompleks; IV bolus perlahan untuk malaria teruk.",
      "durationDays": "3 days (Riamet) / Min 24 jam (IV Artesunate) / 14 days (Primaquine antiradikal vivax)",
      "remarks": "PERINGATAN G6PD WAJIB: Saring status enzim G6PD sebelum memulakan Primaquine 14 hari bagi mengelakkan krisis hemolisis intravaskular akut."
    },
    "secondLineDrugs": [
      "dihydroartemisinin/piperaquine",
      "quinine",
      "doxycycline"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Dihydroartemisinin-Piperaquine (DHA-PPQ) dos harian x 3 hari ATAU (IV Quinine Dihydrochloride loading 20mg/kg infusi 4 jam kemudian 10mg/kg Q8H + Oral Doxycycline 100mg BD x 7 hari).",
      "routeAndDose": "Oral / IV infusi.",
      "durationDays": "3 - 7 days",
      "remarks": "Quinine memerlukan pemantauan ECG (risiko pemanjangan QT) dan paras glukosa darah (risiko hipoglisemia teruk)."
    },
    "allergyDrugs": [
      "artemether/lumefantrine",
      "artesunate",
      "quinine"
    ],
    "penicillinAllergyOption": {
      "regimen": "Semua ubat antimalaria adalah bebas beta-laktam dan selamat untuk pesakit alahan penisilin.",
      "routeAndDose": "Oral / IV.",
      "remarks": "Tiada perkaitan alahan dengan penisilin."
    },
    "stepDownDrugs": [
      "artemether/lumefantrine"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Riamet 4 tabs dos lengkap 6 dos selepas sekurang-kurangnya 3 dos IV Artesunate dan pesakit sedar sepenuhnya serta boleh makan.",
      "criteria": "Parasit darah menurun mendadak, pesakit boleh bertolak ansur dengan diet enteral, tiada kegagalan organ akut."
    },
    "amsNotes": [
      "Lakukan Ujian Filem Darah Tebal & Nipis (BFMP) bersiri setiap 12-24 jam untuk memantau penurunan kepadatan parasit (parasite clearance).",
      "Laporkan kes malaria kepada Unit Kawalan Penyakit Bawaan Vektor (VBDC) dalam masa 24 jam."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / WHO Malaria Guidelines 2023 / MOH Malaysia Protocol)"
  },
  {
    "id": "NAG-A17-001",
    "targetPopulation": "Adult",
    "categoryCode": "A17",
    "categoryTitle": "A17 : Urinary Tract Infections",
    "topic": "1. ACUTE UNCOMPLICATED CYSTITIS",
    "topicNumber": 1,
    "bodySystem": "Urinary Tract Infections",
    "conditionName": "Acute Uncomplicated Cystitis in Non-Pregnant Women (Sistitis Akut)",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Escherichia coli (Uropathogenic E. coli / UPEC - 80-90%)",
      "Staphylococcus saprophyticus",
      "Klebsiella pneumoniae & Proteus mirabilis"
    ],
    "firstLineDrugs": [
      "nitrofurantoin",
      "fosfomycin",
      "cephalexin"
    ],
    "firstLineTherapy": {
      "regimen": "Oral Nitrofurantoin Makrokristal 100mg BD (or 50mg QID) x 5 hari (REJIMEN PILIHAN UTAMA). Alternatif: Oral Fosfomycin Trometamol 3g sachet dos tunggal (dilarutkan dalam segelas air sejuk). Wanita Hamil: Oral Cephalexin 500mg Q6H x 7 hari (or Oral Co-Amoxiclav 625mg BD x 5-7 hari).",
      "routeAndDose": "Oral.",
      "durationDays": "5 days (Nitrofurantoin) / Single dose (Fosfomycin) / 7 days (Kehamilan)",
      "remarks": "DASAR AMS: JANGAN gunakan Ciprofloxacin, Levofloxacin atau Ampicillin sebagai barisan pertama untuk sistitis tidak kompleks bagi memelihara keberkesanan fluoroquinolone dan mengelakkan rintangan."
    },
    "secondLineDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "co-trimoxazole",
      "bactrim"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Augmentin 625mg BD x 5-7 hari atau Oral Bactrim Forte 1 tab BD x 3 hari (jika kadar rintangan tempatan E. coli <20%).",
      "routeAndDose": "Oral.",
      "durationDays": "3 - 7 days",
      "remarks": "Pilihan kedua jika terdapat kontraindikasi kepada Nitrofurantoin dan Fosfomycin."
    },
    "allergyDrugs": [
      "nitrofurantoin",
      "fosfomycin",
      "co-trimoxazole",
      "bactrim"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Nitrofurantoin 100mg BD x 5 hari atau Oral Fosfomycin Trometamol 3g stat sachet",
      "routeAndDose": "Oral.",
      "remarks": "Pilihan utama bebas beta-laktam."
    },
    "amsNotes": [
      "Nitrofurantoin TIDAK BERKESAN dan KONTRAINDIKASI jika anggaran kadar penapisan glomerulus (eGFR) <30 mL/min atau disyaki pielonefritis (kerana penembusan tisu ginjal yang rendah).",
      "BAKTERIURIA ASIMPTOMATIK: JANGAN rawat bakteria dalam urin jika pesakit tiada sebarang simptom dysuria/kekerapan kencing, KECUALI wanita hamil atau sebelum prosedur pembedahan urologi invasif."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IDSA-ESCMID UTI Guidelines)"
  },
  {
    "id": "NAG-A17-002",
    "targetPopulation": "Adult",
    "categoryCode": "A17",
    "categoryTitle": "A17 : Urinary Tract Infections",
    "topic": "2. ACUTE PYELONEPHRITIS",
    "topicNumber": 2,
    "bodySystem": "Urinary Tract Infections",
    "conditionName": "Acute Uncomplicated & Inpatient Pyelonephritis (Pielonefritis Akut)",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Escherichia coli (termasuk strain ESBL)",
      "Klebsiella pneumoniae",
      "Proteus mirabilis & Enterobacterales",
      "Pseudomonas aeruginosa",
      "Enterococcus faecalis"
    ],
    "firstLineDrugs": [
      "ceftriaxone",
      "ciprofloxacin",
      "gentamicin",
      "amoxicillin/clavulanic acid",
      "augmentin"
    ],
    "firstLineTherapy": {
      "regimen": "Pielonefritis Dimasukkan ke Wad: IV Ceftriaxone 1g-2g OD (or IV Gentamicin 5mg/kg OD / IV Co-Amoxiclav 1.2g TDS). Pielonefritis Ringan Pesakit Luar: Oral Ciprofloxacin 500mg BD x 7 hari (or Oral Augmentin 625mg TDS x 10-14 hari).",
      "routeAndDose": "IV bertukar ke Oral.",
      "durationDays": "7 days (Fluoroquinolones) / 10 - 14 days (Beta-laktam)",
      "remarks": "Semua pesakit pielonefritis disyorkan mengambil Kultur Urin (Urine C&S) dan Kultur Darah sebelum memulakan antibiotik."
    },
    "secondLineDrugs": [
      "piperacillin/tazobactam",
      "tazocin",
      "ertapenem",
      "amikacin",
      "meropenem"
    ],
    "secondLineTherapy": {
      "regimen": "IV Tazocin 4.5g Q8H atau IV Ertapenem 1g OD atau IV Amikacin 15mg/kg OD",
      "routeAndDose": "IV.",
      "durationDays": "7 - 14 days",
      "remarks": "Untuk pesakit dengan risiko organisma penghasil ESBL atau kemasukan hospital terdahulu."
    },
    "allergyDrugs": [
      "ciprofloxacin",
      "amikacin",
      "aztreonam"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral/IV Ciprofloxacin 500mg BD (or IV Amikacin 15mg/kg OD / IV Aztreonam 1g-2g Q8H)",
      "routeAndDose": "Oral / IV.",
      "remarks": "Selamat untuk pesakit alahan penisilin."
    },
    "stepDownDrugs": [
      "ciprofloxacin",
      "amoxicillin/clavulanic acid",
      "augmentin",
      "bactrim"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Ciprofloxacin 500mg BD (lengkapkan 7 hari) atau Oral Augmentin 625mg TDS (lengkapkan 10-14 hari).",
      "criteria": "Pesakit afebril >24-48 jam, sakit pinggang reda, toleransi oral baik, keputusan kultur urin sensitif."
    },
    "amsNotes": [
      "Lakukan Ultrasound Saluran Kencing (USG KUB) jika demam berterusan >72 jam untuk menyingkirkan komplikasi Hidronefrosis Terhalang atau Abses Renal/Perinefrik.",
      "Pertukaran ke antibiotik oral berspektrum sempit hendaklah berpandukan laporan sensitiviti kultur urin."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / EAU Guidelines on Urological Infections 2024)"
  },
  {
    "id": "NAG-A17-003",
    "targetPopulation": "Adult",
    "categoryCode": "A17",
    "categoryTitle": "A17 : Urinary Tract Infections",
    "topic": "3. COMPLICATED UTI & CAUTI",
    "topicNumber": 3,
    "bodySystem": "Urinary Tract Infections",
    "conditionName": "Complicated Urinary Tract Infection & Catheter-Associated UTI (CAUTI)",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Escherichia coli & Klebsiella pneumoniae (ESBL+)",
      "Pseudomonas aeruginosa",
      "Enterococcus faecalis & Enterococcus faecium",
      "Proteus mirabilis & Providencia stuartii",
      "Candida albicans (funguria)"
    ],
    "firstLineDrugs": [
      "piperacillin/tazobactam",
      "tazocin",
      "ceftriaxone",
      "amikacin",
      "gentamicin"
    ],
    "firstLineTherapy": {
      "regimen": "IV Piperacillin/Tazobactam 4.5g Q8H (or IV Ceftriaxone 2g OD / IV Amikacin 15mg/kg OD) + TUKAR ATAU CABUT TIUB KATETER URIN (CATHETER REMOVAL/EXCHANGE) SEGERA.",
      "routeAndDose": "IV parenteral.",
      "durationDays": "7 days (jika punca halangan/kateter diselesaikan) sehingga 14 hari (jika terdapat komplikasi parenkima)",
      "remarks": "PENCABUTAN KATETER: Tiub kateter kencing yang telah berada >14 hari mengandungi biofilm tebal; menggantikan kateter sebelum antibiotik mempercepatkan kesembuhan dan mengurangkan risiko relaps."
    },
    "secondLineDrugs": [
      "meropenem",
      "ertapenem",
      "amikacin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Meropenem 1g Q8H atau IV Ertapenem 1g OD",
      "routeAndDose": "IV.",
      "durationDays": "7 - 14 days",
      "remarks": "Untuk jangkitan urosepsis berkomplikasi yang disebabkan oleh kuman ESBL."
    },
    "allergyDrugs": [
      "ciprofloxacin",
      "amikacin",
      "aztreonam"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Ciprofloxacin 400mg Q8H-Q12H + IV Amikacin 15mg/kg OD (or IV Aztreonam 2g Q8H)",
      "routeAndDose": "IV.",
      "remarks": "Bebas kompaun beta-laktam."
    },
    "stepDownDrugs": [
      "ciprofloxacin",
      "co-amoxiclav",
      "augmentin"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Ciprofloxacin 500mg BD atau Oral Augmentin 625mg TDS selepas kateter diganti dan pesakit stabil.",
      "criteria": "Kateter telah dicabut atau diganti baharu, afebril, kultur menunjukkan sensitiviti oral."
    },
    "amsNotes": [
      "Ambil sampel urin untuk kultur DARIPADA KATETER BAHARU yang baru dimasukkan, BUKAN dari beg takungan urin yang lama.",
      "Kandiduria Asimtomatik (Kulat dalam urin) TIDAK memerlukan ubat antikulat; memadai dengan mencabut kateter urin."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IDSA CAUTI Guidelines)"
  },
  {
    "id": "NAG-A17-004",
    "targetPopulation": "Adult",
    "categoryCode": "A17",
    "categoryTitle": "A17 : Urinary Tract Infections",
    "topic": "4. ACUTE PROSTATITIS & EPIDIDYMO-ORCHITIS",
    "topicNumber": 4,
    "bodySystem": "Urinary Tract Infections",
    "conditionName": "Acute Bacterial Prostatitis & Acute Epididymo-Orchitis",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Escherichia coli & Klebsiella pneumoniae (Bakteria enterik)",
      "Pseudomonas aeruginosa",
      "Neisseria gonorrhoeae & Chlamydia trachomatis (Epididimitis pada lelaki <35 tahun)"
    ],
    "firstLineDrugs": [
      "ciprofloxacin",
      "ceftriaxone",
      "doxycycline",
      "co-trimoxazole",
      "bactrim"
    ],
    "firstLineTherapy": {
      "regimen": "Prostatitis Bakteria Akut: Oral/IV Ciprofloxacin 500mg BD (or Oral/IV Levofloxacin 500mg OD / IV Ceftriaxone 2g OD) x 2 hingga 4 MINGGU. Epididimitis Berkaitan STI (<35 tahun): IM Ceftriaxone 500mg-1g stat + Oral Doxycycline 100mg BD x 14 hari. Epididimitis Bakteria Enterik (>35 tahun): Oral Ciprofloxacin 500mg BD x 10-14 hari.",
      "routeAndDose": "Oral / IV parenteral.",
      "durationDays": "2 - 4 weeks (Prostatitis memerlukan rawatan panjang untuk menembusi stroma prostat) / 10 - 14 days (Epididimitis)",
      "remarks": "Fluoroquinolones (Ciprofloxacin/Levofloxacin) dan Bactrim mempunyai keterlarutan lemak (lipid solubility) tinggi yang membolehkan ubat menembusi kapsul kelenjar prostat secara berkesan."
    },
    "secondLineDrugs": [
      "co-trimoxazole",
      "bactrim",
      "piperacillin/tazobactam",
      "tazocin"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Bactrim Forte 1-2 tabs BD x 4 minggu atau IV Tazocin 4.5g Q8H.",
      "routeAndDose": "Oral / IV.",
      "durationDays": "4 weeks",
      "remarks": "Alternatif untuk kes prostatitis rintang fluoroquinolone."
    },
    "allergyDrugs": [
      "ciprofloxacin",
      "doxycycline",
      "co-trimoxazole",
      "bactrim"
    ],
    "penicillinAllergyOption": {
      "regimen": "Prostatitis: Oral Ciprofloxacin 500mg BD x 4 minggu. Epididimitis STI: Oral Azithromycin 2g stat + Oral Doxycycline 100mg BD x 14 hari",
      "routeAndDose": "Oral.",
      "remarks": "Bebas penisilin."
    },
    "stepDownDrugs": [
      "ciprofloxacin",
      "co-trimoxazole",
      "bactrim"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Ciprofloxacin 500mg BD atau Oral Bactrim Forte 1 tab BD melengkapkan tempoh 4 minggu.",
      "criteria": "Pesakit boleh kencing lancar tanpa rasa terbakar yang teruk, tiada demam, bengkak epididimis mengecut."
    },
    "amsNotes": [
      "ELAKKAN URUTAN PROSTAT (Prostatic Massage) pada prostatitis akut kerana boleh mencetuskan bakteremia dan syok septik.",
      "Lakukan Ultrasound Transrektal (TRUS) atau CT Pelvis jika demam berterusan untuk menolak Abses Prostat yang memerlukan aspirasi pembedahan."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / EAU Urological Infections Guidelines)"
  },
  {
    "id": "NAG-B1-001",
    "targetPopulation": "Paediatric",
    "categoryCode": "B1",
    "categoryTitle": "B1 : Cardiovascular Infections",
    "topic": "1. PAEDIATRIC INFECTIVE ENDOCARDITIS",
    "topicNumber": 1,
    "bodySystem": "Cardiovascular Infections",
    "conditionName": "Paediatric Infective Endocarditis - Native & Congenital Heart Disease (CHD)",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Viridans group Streptococci (S. sanguinis, S. mitis)",
      "Staphylococcus aureus (MSSA & MRSA)",
      "Enterococcus faecalis",
      "Coagulase-Negative Staphylococci (pada injap/konduit prostetik)",
      "HACEK group organisms"
    ],
    "firstLineDrugs": [
      "ampicillin",
      "cloxacillin",
      "gentamicin",
      "benzylpenicillin"
    ],
    "firstLineTherapy": {
      "regimen": "Injap Asli / Jantung Kongenital: IV Ampicillin 200mg/kg/hari dibahagi Q6H + IV Cloxacillin 200mg/kg/hari dibahagi Q6H + IV Gentamicin 3mg/kg/hari dibahagi Q8H (or IV Benzylpenicillin 200,000 U/kg/hari dibahagi Q4H-Q6H + Gentamicin).",
      "routeAndDose": "IV infusi perlahan dengan pemantauan TDM Gentamicin.",
      "durationDays": "4 - 6 weeks",
      "remarks": "Kanak-kanak dengan Penyakit Jantung Kongenital Sianotik atau injap/shunts prostetik mempunyai risiko tertinggi endokarditis; ambil 3 set kultur darah sebelum antibiotik."
    },
    "secondLineDrugs": [
      "vancomycin",
      "gentamicin",
      "cefotaxime"
    ],
    "secondLineTherapy": {
      "regimen": "IV Vancomycin 40-60 mg/kg/hari dibahagi Q6H-Q8H (trough 15-20 mcg/mL) + IV Gentamicin 3mg/kg/hari dibahagi Q8H",
      "routeAndDose": "IV infusi.",
      "durationDays": "4 - 6 weeks",
      "remarks": "Untuk pesakit dengan implan prostetik, MRSA disyaki, atau alahan teruk kepada penisilin."
    },
    "allergyDrugs": [
      "vancomycin",
      "gentamicin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Vancomycin 15mg/kg/dos Q6H (trough 15-20 mcg/mL) + IV Gentamicin 1mg/kg Q8H",
      "routeAndDose": "IV.",
      "remarks": "Pantau fungsi ginjal dan paras ubat Vancomycin sebelum dos ke-4."
    },
    "pediatricWeightDoseHint": "IV Ampicillin: 50 mg/kg/dos Q6H (maks 2g Q6H). IV Cloxacillin: 50 mg/kg/dos Q6H (maks 2g Q6H). IV Gentamicin: 1 mg/kg/dos Q8H (atau 3 mg/kg OD dos tunggal).",
    "maxDailyDose": "Ampicillin: maks 12g/hari; Cloxacillin: maks 12g/hari; Gentamicin: maks 300mg/hari",
    "amsNotes": [
      "Rujuk bersama Pakar Kardiologi Pediatrik dan Pakar Bedah Kardiotorasik Pediatrik untuk penilaian ekokardiografi bersiri dan pembedahan segera jika berlaku kegagalan jantung akut.",
      "Gunakan penapis dos berat badan pediatrik dan pam infusi tepat."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / AHA Paediatric Infective Endocarditis Guidelines)"
  },
  {
    "id": "NAG-B1-002",
    "targetPopulation": "Paediatric",
    "categoryCode": "B1",
    "categoryTitle": "B1 : Cardiovascular Infections",
    "topic": "2. ACUTE RHEUMATIC FEVER & CARDITIS",
    "topicNumber": 2,
    "bodySystem": "Cardiovascular Infections",
    "conditionName": "Acute Rheumatic Fever (ARF), Carditis & Secondary Rheumatic Prophylaxis",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Streptococcus pyogenes (Group A Beta-Hemolytic Streptococcus)"
    ],
    "firstLineDrugs": [
      "benzathine penicillin g",
      "phenoxymethylpenicillin",
      "penicillin v",
      "amoxicillin"
    ],
    "firstLineTherapy": {
      "regimen": "Pembasmian GAS Akut: IM Benzathine Penicillin G stat dos tunggal (Berat <27kg: 600,000 Unit; Berat ≥27kg: 1.2 Juta Unit) ATAU Oral Penicillin V 250-500mg TDS x 10 HARI (atau Oral Amoxicillin 50mg/kg OD x 10 hari). PROFILAKSIS SEKUNDER BERTERUSAN: IM Benzathine Penicillin G setiap 3 hingga 4 MINGGU (Berat <27kg: 600,000 U; Berat ≥27kg: 1.2 MU).",
      "routeAndDose": "IM suntikan dalam / Oral.",
      "durationDays": "10 days (Pembasmian primer) / Berterusan sehingga umur 21 tahun atau sekurang-kurangnya 10 tahun (Profilaksis)",
      "remarks": "KRITERIA JONES: Diagnosis berasaskan 2 kriteria major (Karditis, Poliartritis, Chorea Sydenham, Erythema Marginatum, Nodul Subkutaneus) ATAU 1 major + 2 minor berserta bukti jangkitan GAS terdahulu (ASOT meningkat)."
    },
    "secondLineDrugs": [
      "erythromycin",
      "azithromycin",
      "cephalexin"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Erythromycin Ethylsuccinate (EES) 40mg/kg/hari dibahagi QID x 10 hari atau Oral Azithromycin 12mg/kg OD x 5 hari.",
      "routeAndDose": "Oral.",
      "durationDays": "5 - 10 days",
      "remarks": "Bagi pesakit yang mempunyai rekod alahan kepada kumpulan penisilin."
    },
    "allergyDrugs": [
      "erythromycin",
      "azithromycin",
      "sulfadiazine"
    ],
    "penicillinAllergyOption": {
      "regimen": "Pembasmian Akut: Oral Erythromycin 40mg/kg/hari dibahagi QID x 10 hari. Profilaksis Sekunder Alahan Penisilin: Oral Erythromycin 250mg BD atau Oral Sulfadiazine 500mg OD (<27kg) / 1g OD (≥27kg).",
      "routeAndDose": "Oral.",
      "remarks": "Sesuai untuk pesakit alahan penisilin."
    },
    "pediatricWeightDoseHint": "IM Benzathine Penicillin G: <27kg berikan 600,000 Unit IM stat; ≥27kg berikan 1,200,000 Unit IM stat. Oral Penicillin V: 25-50 mg/kg/hari dibahagi QID x 10 hari.",
    "maxDailyDose": "Penicillin V: maks 2g/hari; Erythromycin: maks 2g/hari",
    "amsNotes": [
      "PROFILAKSIS BERPANJANGAN: Tempoh profilaksis sekunder: (1) Demam reumatik tanpa karditis: 5 tahun atau sehingga umur 21 tahun; (2) Karditis tanpa penyakit injap residual: 10 tahun atau sehingga umur 21 tahun; (3) Karditis dengan penyakit injap jantung kekal (RHD): 10 tahun atau sehingga umur 40 tahun (kadang-kadang seumur hidup).",
      "Kepatuhan suntikan bulanan Benzathine Penicillin adalah benteng utama mencegah kerosakan injap jantung."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / WHO & AHA Rheumatic Fever Guidelines)"
  },
  {
    "id": "NAG-B1-003",
    "targetPopulation": "Paediatric",
    "categoryCode": "B1",
    "categoryTitle": "B1 : Cardiovascular Infections",
    "topic": "3. KAWASAKI DISEASE PROTOCOL",
    "topicNumber": 3,
    "bodySystem": "Cardiovascular Infections",
    "conditionName": "Kawasaki Disease (Mucocutaneous Lymph Node Syndrome & Coronary Arteritis)",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Immune-mediated systemic medium-vessel vasculitis (Pencetus imunologik/virus post-infectious)"
    ],
    "firstLineDrugs": [
      "intravenous immunoglobulin",
      "ivig",
      "aspirin",
      "acetylsalicylic acid"
    ],
    "firstLineTherapy": {
      "regimen": "IV Immunoglobulin (IVIG) 2g/kg dos tunggal diinfusikan dalam masa 10 - 12 jam + Oral Aspirin Dos Tinggi 30 - 50 mg/kg/hari dibahagi Q6H sehingga pesakit afebril selama 48-72 jam, kemudian diturunkan kepada Oral Aspirin Dos Rendah 3 - 5 mg/kg OD (antiplatelet) selama 6 hingga 8 MINGGU.",
      "routeAndDose": "IV infusi perlahan terkawal + Oral.",
      "durationDays": "IVIG dos tunggal; Aspirin dos tinggi 48-72 jam afebril; Aspirin dos rendah 6 - 8 minggu",
      "remarks": "Mulakan IVIG SEBELUM HARI KE-10 demam untuk mengurangkan risiko pembentukan Aneurisma Arteri Koronari (Coronary Aneurysm) daripada 25% kepada <5%."
    },
    "secondLineDrugs": [
      "methylprednisolone",
      "infliximab"
    ],
    "secondLineTherapy": {
      "regimen": "Penyakit Kawasaki Refraktori (Demam berterusan/berulang ≥36 jam selepas IVIG pertama selesai): Dos kedua IVIG 2g/kg ATAU IV Methylprednisolone pulse 30mg/kg OD x 3 hari (atau IV Infliximab 5mg/kg).",
      "routeAndDose": "IV infusi.",
      "durationDays": "1 - 3 days",
      "remarks": "Rujuk Pakar Pediatrik Kardiologi dan Reumatologi Pediatrik."
    },
    "pediatricWeightDoseHint": "IVIG: 2 g/kg (isipadu 10% = 20 mL/kg) infusi bermula 0.5 mL/kg/jam dinaikkan beransur-ansur setiap 30 minit ke maks 4-6 mL/kg/jam jika tiada reaksi alahan. Aspirin: Fasa akut 30-50 mg/kg/hari dibahagi Q6H; Fasa pemulihan 3-5 mg/kg OD.",
    "maxDailyDose": "IVIG: dos berat badan 2g/kg; Aspirin fasa akut: maks 4g/hari",
    "amsNotes": [
      "Lakukan Ujian Ekokardiogram pada masa diagnosis, pada 2 minggu, dan pada 6-8 minggu untuk mengukur skor-Z diameter arteri koronari (LAD & RCA).",
      "Tangguhkan vaksinasi hidup (MMR, Varicella) selama sekurang-kurangnya 11 BULAN selepas penerimaan IVIG dos tinggi."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / AHA Kawasaki Disease Guidelines 2017)"
  },
  {
    "id": "NAG-B2-001",
    "targetPopulation": "Paediatric",
    "categoryCode": "B2",
    "categoryTitle": "B2 : Central Nervous Infections",
    "topic": "1. ACUTE BACTERIAL MENINGITIS IN INFANTS & CHILDREN",
    "topicNumber": 1,
    "bodySystem": "Central Nervous Infections",
    "conditionName": "Paediatric Acute Bacterial Meningitis (Meningitis Bakteria Akut Kanak-Kanak >1 Bulan)",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Streptococcus pneumoniae (Pneumococcus)",
      "Neisseria meningitidis (Meningococcus)",
      "Haemophilus influenzae type b (Hib)"
    ],
    "firstLineDrugs": [
      "cefotaxime",
      "ceftriaxone",
      "vancomycin",
      "dexamethasone"
    ],
    "firstLineTherapy": {
      "regimen": "IV Cefotaxime 200 - 300 mg/kg/hari dibahagi Q6H (or IV Ceftriaxone 100 mg/kg/hari OD atau dibahagi Q12H) + IV Vancomycin 60 mg/kg/hari dibahagi Q6H (trough 15-20 mcg/mL) + IV Dexamethasone 0.15 mg/kg Q6H x 4 HARI.",
      "routeAndDose": "IV infusi menembusi sawar darah-otak dos tinggi.",
      "durationDays": "7 days (N. meningitidis) / 10 - 14 days (S. pneumoniae / Hib)",
      "remarks": "Berikan dos pertama IV Dexamethasone SEBELUM atau bersama dos pertama antibiotik (terutamanya bermanfaat untuk mengurangkan risiko pekak pada meningitis H. influenzae type b dan Pneumokokus)."
    },
    "secondLineDrugs": [
      "meropenem",
      "vancomycin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Meropenem 120 mg/kg/hari dibahagi Q8H (40 mg/kg/dos Q8H infusi 3 jam) + IV Vancomycin 15 mg/kg/dos Q6H",
      "routeAndDose": "IV dos meningitis tinggi.",
      "durationDays": "10 - 14 days",
      "remarks": "Untuk kes alahan teruk sefalosporin atau isolat bakteria rintang karbapenem."
    },
    "allergyDrugs": [
      "chloramphenicol",
      "vancomycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Chloramphenicol 75-100 mg/kg/hari dibahagi Q6H + IV Vancomycin 15 mg/kg/dos Q6H",
      "routeAndDose": "IV.",
      "remarks": "Pantau paras ubat terapeutik dan kiraan darah FBC."
    },
    "pediatricWeightDoseHint": "IV Cefotaxime: 50-75 mg/kg/dos Q6H (maks 2g Q6H / 12g/hari). IV Ceftriaxone: 50 mg/kg/dos Q12H atau 100 mg/kg OD (maks 4g/hari). IV Vancomycin: 15 mg/kg/dos Q6H. IV Dexamethasone: 0.15 mg/kg/dos Q6H x 4 hari.",
    "maxDailyDose": "Cefotaxime: maks 12g/hari; Ceftriaxone: maks 4g/hari; Vancomycin: maks 2g/hari",
    "amsNotes": [
      "Lakukan Lumbar Puncture (LP) segera jika tiada kontraindikasi peningkatan tekanan intrakranial (GCS merosot, anak mata tidak simetri, posturing abnormal).",
      "JANGAN TANGGUHKAN DOS PERTAMA ANTIBIOTIK jika LP tertangguh!"
    ],
    "evidenceLevel": "Grade A (NAG 2024 / Malaysian Paediatric Protocol / AAP Guidelines)"
  },
  {
    "id": "NAG-B2-002",
    "targetPopulation": "Paediatric",
    "categoryCode": "B2",
    "categoryTitle": "B2 : Central Nervous Infections",
    "topic": "2. VIRAL ENCEPHALITIS IN CHILDREN",
    "topicNumber": 2,
    "bodySystem": "Central Nervous Infections",
    "conditionName": "Paediatric Viral Encephalitis (Herpes Simplex Virus & Enterovirus)",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Herpes Simplex Virus Type 1 & Type 2 (HSV Encephalitis)",
      "Enterovirus (EV71 - HFMD Encephalitis)",
      "Varicella Zoster Virus (VZV)",
      "Japanese Encephalitis Virus (JE)"
    ],
    "firstLineDrugs": [
      "acyclovir"
    ],
    "firstLineTherapy": {
      "regimen": "IV Acyclovir pada dos mengikut umur/luas permukaan: Umur 3 bulan - 12 tahun: 500 mg/m2 Q8H (atau 20 mg/kg Q8H) x 14 - 21 HARI; Umur >12 tahun: 10 mg/kg Q8H x 14 - 21 HARI.",
      "routeAndDose": "IV infusi perlahan dalam masa sekurang-kurangnya 1 JAM bersama hidrasi cecair intravena mencukupi.",
      "durationDays": "14 - 21 days",
      "remarks": "Mulakan IV Acyclovir SERTA-MERTA sekiranya kanak-kanak mengalami demam berserta sawan berulang, perubahan tahap kesedaran, atau tanda fokal neurologi tanpa menunggu keputusan CSF HSV PCR."
    },
    "secondLineDrugs": [
      "ganciclovir",
      "foscarnet"
    ],
    "secondLineTherapy": {
      "regimen": "IV Ganciclovir 5 mg/kg Q12H x 14-21 hari jika disyaki jangkitan CMV atau rintangan Acyclovir.",
      "routeAndDose": "IV infusi.",
      "durationDays": "14 - 21 days",
      "remarks": "Di bawah pengawasan Pakar Neurologi Pediatrik."
    },
    "pediatricWeightDoseHint": "IV Acyclovir: 20 mg/kg/dos Q8H (umur <12 tahun) atau 500 mg/m2/dos Q8H infusi 60 minit.",
    "maxDailyDose": "Acyclovir: maks 1.5g/m2/hari (atau 60 mg/kg/hari)",
    "amsNotes": [
      "Hantar CSF untuk Ujian Multiplex Viral Meningitis/Encephalitis PCR Panel (HSV-1, HSV-2, VZV, Enterovirus, Parechovirus).",
      "Lakukan EEG dan MRI Otak untuk mengesan keterlibatan lobus temporal/frontal."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / Paediatric Infectious Diseases Society Guidelines)"
  },
  {
    "id": "NAG-B2-003",
    "targetPopulation": "Paediatric",
    "categoryCode": "B2",
    "categoryTitle": "B2 : Central Nervous Infections",
    "topic": "3. PAEDIATRIC BRAIN ABSCESS & SUBDURAL EMPYEMA",
    "topicNumber": 3,
    "bodySystem": "Central Nervous Infections",
    "conditionName": "Paediatric Brain Abscess & Subdural Empyema",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Streptococcus anginosus group (milleri)",
      "Anaerobes (Peptostreptococcus, Bacteroides)",
      "Staphylococcus aureus",
      "Enterobacterales & Pseudomonas (Otogenik)"
    ],
    "firstLineDrugs": [
      "cefotaxime",
      "metronidazole",
      "vancomycin",
      "ceftriaxone"
    ],
    "firstLineTherapy": {
      "regimen": "IV Cefotaxime 200mg/kg/hari dibahagi Q6H (or IV Ceftriaxone 100mg/kg/hari dibahagi Q12H) + IV Metronidazole 30mg/kg/hari dibahagi Q8H (+ IV Vancomycin 60mg/kg/hari dibahagi Q6H jika post-trauma/pembedahan) + PENYALIRAN ASPIRASI JARUM NEUROSURGERI SEGERA.",
      "routeAndDose": "IV parenteral dos tinggi.",
      "durationDays": "4 - 8 weeks",
      "remarks": "Penyaliran nanah intrakranial berpandukan imbasan CT atau stereotaktik adalah wajib untuk mengurangkan tekanan intrakranial dan memperoleh sampel mikrobiologi tepat."
    },
    "secondLineDrugs": [
      "meropenem",
      "vancomycin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Meropenem 120mg/kg/hari dibahagi Q8H + IV Vancomycin 15mg/kg/dos Q6H",
      "routeAndDose": "IV infusi.",
      "durationDays": "6 - 8 weeks",
      "remarks": "Untuk abses otogenik kompleks melibatkan Pseudomonas atau kegagalan rejimen awal."
    },
    "allergyDrugs": [
      "chloramphenicol",
      "metronidazole",
      "vancomycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Chloramphenicol 75-100mg/kg/hari dibahagi Q6H + IV Metronidazole 30mg/kg/hari Q8H + IV Vancomycin 15mg/kg Q6H",
      "routeAndDose": "IV.",
      "remarks": "Bebas beta-laktam."
    },
    "pediatricWeightDoseHint": "IV Cefotaxime: 50 mg/kg/dos Q6H. IV Metronidazole: 10 mg/kg/dos Q8H (maks 500mg Q8H). IV Vancomycin: 15 mg/kg/dos Q6H.",
    "maxDailyDose": "Cefotaxime: maks 12g/hari; Metronidazole: maks 1.5g/hari",
    "amsNotes": [
      "Lakukan MRI Otak berkontras setiap 2-3 minggu untuk memantau pengecutan saiz kaviti abses sebelum merancang penukaran terapi.",
      "Cari dan rawat punca primer (otitis media kronik, mastoiditis, sinusitis, atau shunt jantung sianotik kanan-ke-kiri)."
    ],
    "evidenceLevel": "Grade B (NAG 2024 / ESPID Brain Abscess Guidelines)"
  },
  {
    "id": "NAG-B3-001",
    "targetPopulation": "Paediatric",
    "categoryCode": "B3",
    "categoryTitle": "B3 : Chemoprophylaxis",
    "topic": "1. PAEDIATRIC SURGICAL PROPHYLAXIS (SAP)",
    "topicNumber": 1,
    "bodySystem": "Chemoprophylaxis",
    "conditionName": "Paediatric Surgical Antimicrobial Prophylaxis (SAP) - Standard Surgical Procedures",
    "setting": "Surgical Prophylaxis",
    "primaryPathogens": [
      "Staphylococcus aureus & CoNS",
      "Streptococcus pyogenes",
      "Enterobacterales & Bacteroides fragilis (GI / Pembedahan Abdomen)"
    ],
    "firstLineDrugs": [
      "cefazolin",
      "amoxicillin/clavulanic acid",
      "augmentin",
      "metronidazole"
    ],
    "firstLineTherapy": {
      "regimen": "Pembedahan Bersih / Ortopedik / Herniotomi: IV Cefazolin 30 mg/kg stat (maks 2g). Pembedahan Abdomen / Apendisektomi: IV Cefazolin 30 mg/kg + IV Metronidazole 15 mg/kg stat (atau IV Co-Amoxiclav 30 mg/kg stat).",
      "routeAndDose": "IV dos tunggal diberikan dalam masa 30 - 60 MINIT SEBELUM torehan kulit dewan bedah.",
      "durationDays": "Single Dose (Maksimum 24 jam)",
      "remarks": "Berikan dos ulangan intra-operasi jika pembedahan melebihi 3-4 jam atau kehilangan darah >20 mL/kg."
    },
    "secondLineDrugs": [
      "vancomycin",
      "gentamicin",
      "clindamycin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Vancomycin 15 mg/kg stat infusi tamat sebelum torehan + IV Gentamicin 2.5 mg/kg stat",
      "routeAndDose": "IV infusi perlahan.",
      "durationDays": "Single dose",
      "remarks": "Untuk pesakit yang diketahui pembawa MRSA atau alahan teruk kepada beta-laktam."
    },
    "allergyDrugs": [
      "clindamycin",
      "gentamicin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Clindamycin 10-15 mg/kg stat (maks 900mg) + IV Gentamicin 2.5 mg/kg stat (maks 120mg)",
      "routeAndDose": "IV.",
      "remarks": "Bebas beta-laktam."
    },
    "pediatricWeightDoseHint": "IV Cefazolin: 30 mg/kg stat (maks 2g). IV Co-Amoxiclav: 30 mg/kg stat (maks 1.2g). IV Metronidazole: 15 mg/kg stat (maks 500mg).",
    "maxDailyDose": "Cefazolin: maks 2g/dos; Co-Amoxiclav: maks 1.2g/dos",
    "amsNotes": [
      "DASAR AMS: Profilaksis SAP tidak boleh diteruskan selepas penutupan luka dewan bedah bagi kes-kes bersih tidak tercemar.",
      "Timbang berat badan kanak-kanak secara tepat pada hari kemasukan."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / ASHP Paediatric Surgical Prophylaxis Guidelines)"
  },
  {
    "id": "NAG-B3-002",
    "targetPopulation": "Paediatric",
    "categoryCode": "B3",
    "categoryTitle": "B3 : Chemoprophylaxis",
    "topic": "2. MEDICAL CHEMOPROPHYLAXIS IN CHILDREN",
    "topicNumber": 2,
    "bodySystem": "Chemoprophylaxis",
    "conditionName": "Medical Chemoprophylaxis in Children - Meningococcal, Pertussis & Asplenia",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Neisseria meningitidis",
      "Bordetella pertussis",
      "Streptococcus pneumoniae (Post-splenectomy / Asplenia sepsis)"
    ],
    "firstLineDrugs": [
      "rifampicin",
      "ceftriaxone",
      "azithromycin",
      "phenoxymethylpenicillin",
      "penicillin v"
    ],
    "firstLineTherapy": {
      "regimen": "Kontak Rapat Meningokokus: Oral Rifampicin (Bayi <1 bulan: 5 mg/kg BD x 2 hari; Kanak-kanak ≥1 bulan: 10 mg/kg BD x 2 hari, maks 600mg BD) ATAU IM Ceftriaxone (Umur <15 tahun: 125mg stat; ≥15 tahun: 250mg stat). Kontak Pertussis: Oral Azithromycin 10 mg/kg OD x 5 hari (Bayi <6 bulan: 10 mg/kg OD x 5 hari). Asplenia / Pasca-Splenektomi: Oral Penicillin V (Umur <1 tahun: 62.5mg BD; 1-5 tahun: 125mg BD; >5 tahun: 250mg BD).",
      "routeAndDose": "Oral / IM.",
      "durationDays": "2 days (Meningococcal) / 5 days (Pertussis) / Berterusan sehingga umur 5 tahun atau seumur hidup (Asplenia)",
      "remarks": "Berikan profilaksis kontak meningokokus secepat mungkin (<24 jam dari kes indeks)."
    },
    "secondLineDrugs": [
      "clarithromycin",
      "erythromycin",
      "azithromycin"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Clarithromycin 7.5 mg/kg BD x 7 hari atau Oral Erythromycin 10 mg/kg QID x 14 hari.",
      "routeAndDose": "Oral.",
      "durationDays": "7 - 14 days",
      "remarks": "Alternatif untuk profilaksis pertussis."
    },
    "allergyDrugs": [
      "ceftriaxone",
      "azithromycin",
      "erythromycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "Meningokokus: IM Ceftriaxone 125-250mg stat atau Oral Ciprofloxacin 20mg/kg stat. Asplenia: Oral Erythromycin 125-250mg BD.",
      "routeAndDose": "IM / Oral.",
      "remarks": "Pilihan utama bebas penisilin."
    },
    "pediatricWeightDoseHint": "Oral Rifampicin: 10 mg/kg/dos BD x 2 hari (maks 600mg BD). Oral Azithromycin: 10 mg/kg OD x 5 hari (maks 500mg OD).",
    "maxDailyDose": "Rifampicin: maks 1.2g/hari; Azithromycin: maks 500mg/hari",
    "amsNotes": [
      "Beri amaran kepada ibu bapa bahawa Rifampicin akan mewarnakan air kencing, air liur, dan peluh menjadi warna jingga/merah cerah (tidak berbahaya).",
      "Pastikan kanak-kanak asplenia mendapat vaksinasi Pneumococcal PCV13, PPSV23, MenACWY, dan Hib lengkap mengikut jadual."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / AAP Red Book Guidelines)"
  },
  {
    "id": "NAG-B4-001",
    "targetPopulation": "Paediatric",
    "categoryCode": "B4",
    "categoryTitle": "B4 : Gastrointestinal Infections",
    "topic": "1. PAEDIATRIC ACUTE GASTROENTERITIS & DYSENTERY",
    "topicNumber": 1,
    "bodySystem": "Gastrointestinal Infections",
    "conditionName": "Paediatric Acute Gastroenteritis (AGE), Invasive Dysentery & Cholera",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Rotavirus, Norovirus & Adenovirus (Punca 70-80% AGE kanak-kanak)",
      "Shigella sonnei & Shigella flexneri (Disenteri bakteria)",
      "Salmonella enterica (Non-typhoidal)",
      "Campylobacter jejuni",
      "Vibrio cholerae"
    ],
    "firstLineDrugs": [
      "azithromycin",
      "ceftriaxone",
      "zinc",
      "oral rehydration salts",
      "ors"
    ],
    "firstLineTherapy": {
      "regimen": "AGE Viral / Cirit Air: TERAPI PENGHIDRATAN ORAL (ORS) + SUPLEMEN ZINC (Bayi <6 bulan: 10mg OD x 14 hari; Kanak-kanak ≥6 bulan: 20mg OD x 14 hari) + TERUSKAN PENYUSUAN SUSU IBU (ELAKKAN ANTIBIOTIK RUTIN). Disenteri Berdarah Invasif (Shigellosis): Oral Azithromycin 10-20 mg/kg OD x 3 hari (or IV Ceftriaxone 50-75 mg/kg OD x 3-5 hari jika dimasukkan ke wad).",
      "routeAndDose": "Oral ORS + Zink; Antibiotik oral hanya untuk cirit-birit berdarah bernanah.",
      "durationDays": "3 days (Azithromycin) / 14 days (Suplemen Zink)",
      "remarks": "DASAR AMS KEBANGSAAN: 80% cirit-birit kanak-kanak adalah VIRUS dan swa-had (self-limiting); ANTIBIOTIK TIDAK DIPERLUKAN DAN DILARANG untuk cirit-birit berair biasa."
    },
    "secondLineDrugs": [
      "ceftriaxone",
      "ciprofloxacin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Ceftriaxone 50-75 mg/kg OD x 3-5 hari atau Oral Ciprofloxacin 15 mg/kg BD x 3 hari (untuk kes Shigellosis rintang Azithromycin).",
      "routeAndDose": "IV / Oral.",
      "durationDays": "3 - 5 days",
      "remarks": "Gunakan jangka pendek jika perlu."
    },
    "allergyDrugs": [
      "azithromycin",
      "ciprofloxacin"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Azithromycin 10 mg/kg OD x 3 hari atau Oral Ciprofloxacin 15 mg/kg BD x 3 hari",
      "routeAndDose": "Oral.",
      "remarks": "Selamat untuk pesakit alahan penisilin."
    },
    "pediatricWeightDoseHint": "Oral Azithromycin: 10 mg/kg OD (maks 500mg OD) x 3 hari. Suplemen Zink: <6 bulan = 10mg OD; ≥6 bulan = 20mg OD x 14 hari. IV Ceftriaxone: 50 mg/kg OD (maks 2g OD).",
    "maxDailyDose": "Azithromycin: maks 500mg/hari; Ceftriaxone: maks 2g/hari",
    "amsNotes": [
      "JANGAN SESEKALI MEMBERIKAN UBAT ANTIDIARREAL/ANTIMOTILITI (seperti Loperamide, Diphenoxylate, Kaolin-Pectin) kepada kanak-kanak kerana boleh menyebabkan ileus paralitik, keracunan CNS, dan maut.",
      "Pantau tanda-tanda dehidrasi teruk (mata cengkung, turgor kulit kembali lambat >2 saat, kencing berkurangan, letargi)."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / WHO Diarrhoea Management Guidelines)"
  },
  {
    "id": "NAG-B4-002",
    "targetPopulation": "Paediatric",
    "categoryCode": "B4",
    "categoryTitle": "B4 : Gastrointestinal Infections",
    "topic": "2. PAEDIATRIC APPENDICITIS & PERITONITIS",
    "topicNumber": 2,
    "bodySystem": "Gastrointestinal Infections",
    "conditionName": "Paediatric Acute Appendicitis, Peritonitis & Intra-Abdominal Sepsis",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Escherichia coli & Klebsiella pneumoniae",
      "Bacteroides fragilis & Anaerobes",
      "Enterococcus faecalis",
      "Pseudomonas aeruginosa"
    ],
    "firstLineDrugs": [
      "ampicillin",
      "gentamicin",
      "metronidazole",
      "amoxicillin/clavulanic acid",
      "augmentin",
      "cefotaxime"
    ],
    "firstLineTherapy": {
      "regimen": "Rejimen Tiga Serangkai (Triple Regimen): IV Ampicillin 100 mg/kg/hari dibahagi Q6H + IV Gentamicin 5-7.5 mg/kg OD + IV Metronidazole 30 mg/kg/hari dibahagi Q8H ATAU IV Co-Amoxiclav 30 mg/kg/dos TDS (or IV Cefotaxime 150 mg/kg/hari dibahagi Q6H-Q8H + Metronidazole) + PEMBEDAHAN APENDISEKTOMI KECEMASAN.",
      "routeAndDose": "IV infusi parenteral.",
      "durationDays": "Apendisitis Ringan/Tidak Pecah: 24 jam sahaja; Apendisitis Pecah / Peritonitis: 5 - 7 hari",
      "remarks": "Apendisitis pecah (perforated appendicitis) memerlukan debridement peritoneal dan antibiotik sehingga pesakit afebril >24 jam dan tiada ileus."
    },
    "secondLineDrugs": [
      "piperacillin/tazobactam",
      "tazocin",
      "meropenem"
    ],
    "secondLineTherapy": {
      "regimen": "IV Piperacillin/Tazobactam 80-100 mg/kg/dos Q6H-Q8H (or IV Meropenem 20 mg/kg/dos Q8H)",
      "routeAndDose": "IV.",
      "durationDays": "5 - 7 days",
      "remarks": "Untuk kes peritonitis tertumpah najis teruk atau sepsis pasca-bedah."
    },
    "allergyDrugs": [
      "gentamicin",
      "clindamycin",
      "ciprofloxacin",
      "metronidazole"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Gentamicin 5-7.5 mg/kg OD + IV Clindamycin 30-40 mg/kg/hari dibahagi Q8H (or IV Metronidazole + IV Ciprofloxacin)",
      "routeAndDose": "IV.",
      "remarks": "Bebas beta-laktam."
    },
    "stepDownDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "cephalexin",
      "metronidazole"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Augmentin 30-45 mg/kg/hari dibahagi BD/TDS melengkapkan jumlah 5-7 hari.",
      "criteria": "Pesakit boleh minum/makan tanpa muntah, flatus hadir, tiada demam, luka pembedahan bersih."
    },
    "pediatricWeightDoseHint": "IV Ampicillin: 25-50 mg/kg/dos Q6H. IV Gentamicin: 5-7.5 mg/kg OD (maks 300mg OD). IV Metronidazole: 10 mg/kg/dos Q8H (maks 500mg Q8H). IV Co-Amoxiclav: 30 mg/kg/dos Q8H (maks 1.2g Q8H).",
    "maxDailyDose": "Ampicillin: maks 8g/hari; Gentamicin: maks 300mg/hari; Co-Amoxiclav: maks 3.6g/hari",
    "amsNotes": [
      "Hentikan antibiotik pada hari ke-5 jika pesakit afebril dan sel darah putih normal mengikut bukti terkini pembedahan pediatrik.",
      "Kultur cecair peritoneal wajib diambil secara steril semasa pembedahan."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / APSA Paediatric Appendicitis Guidelines)"
  },
  {
    "id": "NAG-B4-003",
    "targetPopulation": "Paediatric",
    "categoryCode": "B4",
    "categoryTitle": "B4 : Gastrointestinal Infections",
    "topic": "3. BILIARY TRACT INFECTIONS IN CHILDREN",
    "topicNumber": 3,
    "bodySystem": "Gastrointestinal Infections",
    "conditionName": "Paediatric Ascending Cholangitis (Post-Kasai) & Pyogenic Liver Abscess",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Klebsiella pneumoniae & Escherichia coli",
      "Pseudomonas aeruginosa",
      "Enterococcus faecalis",
      "Staphylococcus aureus & Anaerobes"
    ],
    "firstLineDrugs": [
      "ceftriaxone",
      "metronidazole",
      "piperacillin/tazobactam",
      "tazocin",
      "amikacin"
    ],
    "firstLineTherapy": {
      "regimen": "Kolangitis Pasca-Pembedahan Kasai (Biliary Atresia): IV Ceftriaxone 75 mg/kg OD + IV Metronidazole 30 mg/kg/hari dibahagi Q8H (atau IV Tazocin 80-100 mg/kg/dos Q6H-Q8H). Abses Hepar Piogenik: IV Co-Amoxiclav 30 mg/kg TDS (or IV Cefotaxime 150 mg/kg/hari + Metronidazole) + ASPIRASI / PENYALIRAN JARUM USG.",
      "routeAndDose": "IV infusi parenteral.",
      "durationDays": "10 - 14 days (Kolangitis Kasai) / 4 - 6 weeks (Abses Hepar)",
      "remarks": "Kolangitis berulang selepas pembedahan Kasai boleh merosakkan saliran hempedu dan mempercepatkan kegagalan hepar; rawat demam dengan segera."
    },
    "secondLineDrugs": [
      "meropenem",
      "amikacin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Meropenem 20 mg/kg/dos Q8H + IV Amikacin 15 mg/kg OD",
      "routeAndDose": "IV.",
      "durationDays": "14 days",
      "remarks": "Bagi kes kolangitis teruk refraktori dengan risiko kuman MDR."
    },
    "pediatricWeightDoseHint": "IV Ceftriaxone: 50-75 mg/kg OD (maks 2g OD). IV Tazocin: 80-100 mg/kg/dos Q6H-Q8H. IV Metronidazole: 10 mg/kg/dos Q8H.",
    "maxDailyDose": "Ceftriaxone: maks 2g/hari; Tazocin: maks 16g/hari",
    "amsNotes": [
      "Lakukan Ultrasound Hepar Kerap untuk mengesan dilatasi radiks biliari dan pembentukan abses hati baru.",
      "Profilaksis oral jangka panjang (seperti Cephalexin atau Bactrim) kadangkala ditetapkan oleh Pakar Hepatologi Pediatrik bagi pesakit Kasai berisiko tinggi."
    ],
    "evidenceLevel": "Grade B (NAG 2024 / ESPGHAN Hepatology Consensus)"
  },
  {
    "id": "NAG-B5-001",
    "targetPopulation": "Paediatric",
    "categoryCode": "B5",
    "categoryTitle": "B5 : Infections In Immunocompromised Patients",
    "topic": "1. PAEDIATRIC FEBRILE NEUTROPENIA",
    "topicNumber": 1,
    "bodySystem": "Infections In Immunocompromised Patients",
    "conditionName": "Paediatric Febrile Neutropenia in Oncology & Bone Marrow Transplant",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Pseudomonas aeruginosa",
      "Enterobacterales (Klebsiella, E. coli)",
      "Coagulase-Negative Staphylococci & MSSA/MRSA (talian pusat)",
      "Viridans group Streptococci (mukositis)",
      "Candida spp. & Aspergillus (demam berpanjangan)"
    ],
    "firstLineDrugs": [
      "cefepime",
      "piperacillin/tazobactam",
      "tazocin",
      "meropenem",
      "vancomycin",
      "amikacin"
    ],
    "firstLineTherapy": {
      "regimen": "Kanak-Kanak Berisiko Tinggi (ANC <500 sel/mcL + Demam ≥38.3°C): IV Cefepime 50 mg/kg/dos Q8H (or IV Tazocin 80-100 mg/kg/dos Q6H infusi 3 jam) sebagai Monoterapi Antipseudomonal Empirik. Tambah IV Vancomycin 15 mg/kg/dos Q6H jika ada jangkitan talian kateter pusat/sepsis.",
      "routeAndDose": "IV dos pertama WAJIB diberikan dalam masa 30 - 60 MINIT dari ketibaan.",
      "durationDays": "Sehingga neutrofil pulih (ANC >500) dan afebril >48 jam",
      "remarks": "KECEMASAN ONKOLOGI PEDIATRIK: Kelewatan antibiotik antipseudomonal boleh menyebabkan syok septik dan kematian dalam masa beberapa jam."
    },
    "secondLineDrugs": [
      "meropenem",
      "amikacin",
      "caspofungin",
      "liposomal amphotericin b"
    ],
    "secondLineTherapy": {
      "regimen": "Demam Berterusan Hari Ke-4-5 / Ketidakstabilan Sepsis: IV Meropenem 20-40 mg/kg/dos Q8H + IV Amikacin 15 mg/kg OD + IV Caspofungin 70 mg/m2 loading kemudian 50 mg/m2 OD (atau IV Liposomal Amphotericin B 3 mg/kg OD).",
      "routeAndDose": "IV ICU.",
      "durationDays": "7 - 14 days",
      "remarks": "Eskalasi empirik antikulat wajib dimulakan sekiranya demam tidak reda selepas 96 jam terapi antibakteria spektrum luas."
    },
    "allergyDrugs": [
      "ciprofloxacin",
      "amikacin",
      "vancomycin",
      "aztreonam"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Ciprofloxacin 10-15 mg/kg/dos Q12H (or IV Aztreonam 30 mg/kg/dos Q8H) + IV Vancomycin 15 mg/kg/dos Q6H + IV Amikacin 15 mg/kg OD",
      "routeAndDose": "IV.",
      "remarks": "Bebas beta-laktam."
    },
    "pediatricWeightDoseHint": "IV Cefepime: 50 mg/kg/dos Q8H (maks 2g Q8H). IV Tazocin: 80-100 mg/kg/dos Q6H-Q8H (maks 4.5g Q6H). IV Vancomycin: 15 mg/kg/dos Q6H (trough 15-20 mcg/mL).",
    "maxDailyDose": "Cefepime: maks 6g/hari; Tazocin: maks 18g/hari; Vancomycin: maks 2g/hari",
    "amsNotes": [
      "Ambil Kultur Darah Berpasangan (PICC lumen + periferi) sebelum dos pertama antibiotik dimulakan.",
      "Elakkan mengambil suhu per rektum atau pemeriksaan rektum pada kanak-kanak neutropenik."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / International Paediatric Fever & Neutropenia Guidelines)"
  },
  {
    "id": "NAG-B5-002",
    "targetPopulation": "Paediatric",
    "categoryCode": "B5",
    "categoryTitle": "B5 : Infections In Immunocompromised Patients",
    "topic": "2. PAEDIATRIC PNEUMOCYSTIS JIROVECII PNEUMONIA (PJP)",
    "topicNumber": 2,
    "bodySystem": "Infections In Immunocompromised Patients",
    "conditionName": "Paediatric Pneumocystis jirovecii Pneumonia (PJP / PCP) - Treatment & Prophylaxis",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Pneumocystis jirovecii"
    ],
    "firstLineDrugs": [
      "co-trimoxazole",
      "bactrim",
      "trimethoprim/sulfamethoxazole",
      "prednisolone"
    ],
    "firstLineTherapy": {
      "regimen": "Rawatan PJP Pediatrik: IV Co-Trimoxazole (Bactrim) pada dos TMP 15 - 20 mg/kg/hari dibahagi Q6H-Q8H x 21 HARI + STEROID ADJUNCT: Oral/IV Prednisolone (2 mg/kg/hari dibahagi BD x 5 hari, 1 mg/kg/hari x 5 hari, kemudian 0.5 mg/kg/hari x 11 hari). PROFILAKSIS PJP KANAK-KANAK: Oral Bactrim pada dos TMP 5 mg/kg/hari dibahagi BD selama 3 hari berturut-turut setiap minggu (atau dos tunggal harian).",
      "routeAndDose": "IV infusi perlahan dalam Dextrose 5% / Oral.",
      "durationDays": "21 days (Rawatan) / Berterusan semasa tempoh imunosupresi (Profilaksis)",
      "remarks": "Steroid adjunct mengurangkan risiko kegagalan pernafasan dan kematian pada kanak-kanak dengan hipoksia sederhana/teruk."
    },
    "secondLineDrugs": [
      "clindamycin",
      "primaquine",
      "pentamidine",
      "dapsone"
    ],
    "secondLineTherapy": {
      "regimen": "IV Clindamycin 10 mg/kg/dos Q8H + Oral Primaquine 0.3 mg/kg base OD x 21 hari (atau IV Pentamidine isethionate 4 mg/kg OD).",
      "routeAndDose": "IV / Oral.",
      "durationDays": "21 days",
      "remarks": "Saring status enzim G6PD sebelum memulakan Primaquine atau Dapsone."
    },
    "pediatricWeightDoseHint": "IV Co-Trimoxazole (Rawatan): berasaskan komponen Trimethoprim (TMP) 5 mg/kg/dos Q6H-Q8H (maks 20 mg/kg/hari TMP) x 21 hari. Profilaksis: TMP 5 mg/kg/hari dibahagi BD pada hari Jumaat, Sabtu, Ahad.",
    "maxDailyDose": "Bactrim: dos berat badan TMP 20 mg/kg/hari",
    "amsNotes": [
      "Pantau paras kalium darah (risiko hiperkalemia) dan fungsi buah pinggang setiap 48-72 jam.",
      "Semua bayi yang terdedah kepada HIV wajib menerima profilaksis Bactrim bermula umur 4-6 minggu sehingga jangkitan HIV disahkan negatif."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / CDC-NIH-AAP Paediatric Opportunistic Infection Guidelines)"
  },
  {
    "id": "NAG-B5-003",
    "targetPopulation": "Paediatric",
    "categoryCode": "B5",
    "categoryTitle": "B5 : Infections In Immunocompromised Patients",
    "topic": "3. INVASIVE FUNGAL INFECTIONS IN CHILDREN",
    "topicNumber": 3,
    "bodySystem": "Infections In Immunocompromised Patients",
    "conditionName": "Paediatric Invasive Candidiasis, Candidemia & Pulmonary Aspergillosis",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Candida albicans & Candida parapsilosis (lazim pada talian vaskular)",
      "Candida glabrata & Candida tropicalis",
      "Aspergillus fumigatus & Aspergillus flavus"
    ],
    "firstLineDrugs": [
      "caspofungin",
      "anidulafungin",
      "fluconazole",
      "liposomal amphotericin b",
      "voriconazole"
    ],
    "firstLineTherapy": {
      "regimen": "Kandidemia / Kandidiasis Invasif Pediatrik: IV Caspofungin 70 mg/m2 loading kemudian 50 mg/m2 OD (or IV Fluconazole 12 mg/kg loading kemudian 6-12 mg/kg OD / IV Liposomal Amphotericin B 3 mg/kg OD). Aspergillosis Pulmonari Invasif: IV/Oral Voriconazole (Umur 2-12 tahun: 9 mg/kg Q12H x 1 hari kemudian 8 mg/kg Q12H).",
      "routeAndDose": "IV infusi perlahan.",
      "durationDays": "Kandidemia: Minimum 14 hari selepas kultur darah steril pertama; Aspergillosis: 6 - 12 minggu",
      "remarks": "Echinocandin (Caspofungin) atau Liposomal Amphotericin B adalah pilihan utama bagi kandidemia kanak-kanak yang tidak stabil di PICU."
    },
    "secondLineDrugs": [
      "liposomal amphotericin b",
      "voriconazole",
      "micafungin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Liposomal Amphotericin B 3-5 mg/kg OD atau IV Micafungin 2 mg/kg OD (tingkatkan ke 4-10 mg/kg pada neonat).",
      "routeAndDose": "IV.",
      "durationDays": "Berdasarkan tindak balas klinikal",
      "remarks": "Untuk kes rintangan azole atau penglibatan sistem saraf pusat."
    },
    "pediatricWeightDoseHint": "IV Fluconazole: 12 mg/kg loading kemudian 6-12 mg/kg OD (maks 400-800mg OD). IV Caspofungin: 70 mg/m2 loading kemudian 50 mg/m2 OD (maks 70mg/hari). IV Liposomal Amphotericin B: 3-5 mg/kg OD.",
    "maxDailyDose": "Fluconazole: maks 800mg/hari; Caspofungin: maks 70mg/hari",
    "amsNotes": [
      "Pemeriksaan Funduskopi Mata oleh Pakar Oftalmologi Pediatrik dan Ekokardiogram adalah WAJIB untuk semua kanak-kanak dengan kandidemia.",
      "Keluarkan semua talian kateter vena sentral seawal mungkin."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IDSA Paediatric Candidiasis Guidelines)"
  },
  {
    "id": "NAG-B6-001",
    "targetPopulation": "Neonatal",
    "categoryCode": "B6",
    "categoryTitle": "B6 : Neonatal Infections",
    "topic": "1. EARLY-ONSET NEONATAL SEPSIS (EONS <72 HOURS)",
    "topicNumber": 1,
    "bodySystem": "Neonatal & Paediatric Syndromes",
    "conditionName": "Early-Onset Neonatal Sepsis (EONS < 72 Jam Selepas Kelahiran)",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Group B Streptococcus (Streptococcus agalactiae - GBS)",
      "Escherichia coli (K1 capsular strain)",
      "Listeria monocytogenes",
      "Enterococcus faecalis",
      "Klebsiella pneumoniae"
    ],
    "firstLineDrugs": [
      "ampicillin",
      "benzylpenicillin",
      "gentamicin",
      "penicillin g"
    ],
    "firstLineTherapy": {
      "regimen": "IV Ampicillin 100 - 150 mg/kg/hari dibahagi Q12H (or IV Benzylpenicillin 100,000 U/kg/hari dibahagi Q12H) + IV Gentamicin 4 - 5 mg/kg OD dos harian tunggal.",
      "routeAndDose": "IV infusi perlahan dengan pemantauan TDM Gentamicin.",
      "durationDays": "Kultur Darah Negatif & Bayi Sihat: HENTIKAN PADA 36 - 48 JAM; Sepsis Disahkan: 7 - 10 hari",
      "remarks": "PERINGATAN KESELAMATAN NEONAT: JANGAN SESEKALI MENGGUNAKAN CEFTRIAXONE PADA NEONAT kerana boleh menyebabkan pemendakan garam kalsium-seftriakson dalam paru-paru/ginjal dan mencetuskan 'Bilirubin Encephalopathy / Kernicterus' akibat pengusiran bilirubin dari albumin."
    },
    "secondLineDrugs": [
      "cefotaxime",
      "ampicillin",
      "amikacin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Ampicillin 150 mg/kg/hari dibahagi Q8H + IV Cefotaxime 100 mg/kg/hari dibahagi Q12H (jika disyaki meningitis serentak atau renjatan sepsis teruk).",
      "routeAndDose": "IV parenteral.",
      "durationDays": "7 - 14 days",
      "remarks": "Cefotaxime adalah sefalosporin generasi ketiga pilihan yang SELAMAT untuk neonat."
    },
    "pediatricWeightDoseHint": "IV Ampicillin: Umur <7 hari = 50 mg/kg/dos Q12H; Umur ≥7 hari = 50 mg/kg/dos Q8H. IV Gentamicin: Bayi matang term = 4-5 mg/kg OD; Bayi pramatang <32 minggu = 4-5 mg/kg setiap 36-48 jam mengikut TDM.",
    "maxDailyDose": "Ampicillin: maks 200 mg/kg/hari; Gentamicin: 5 mg/kg/dos",
    "amsNotes": [
      "DASAR AMS NICU: Hentikan antibiotik pada 36-48 jam sekiranya kultur darah negatif dan bayi kekal sihat secara klinikal tanpa tanda sepsis.",
      "Kira dos Gentamicin secara tepat mengikut usia gestasi dan berat lahir."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / Malaysian Paediatric Protocol / AAP Neonatal Sepsis Guidelines)"
  },
  {
    "id": "NAG-B6-002",
    "targetPopulation": "Neonatal",
    "categoryCode": "B6",
    "categoryTitle": "B6 : Neonatal Infections",
    "topic": "2. LATE-ONSET NEONATAL SEPSIS (LONS ≥72 HOURS)",
    "topicNumber": 2,
    "bodySystem": "Neonatal & Paediatric Syndromes",
    "conditionName": "Late-Onset Neonatal Sepsis (LONS ≥ 72 Jam / NICU Nosocomial Sepsis)",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Coagulase-Negative Staphylococci (S. epidermidis / CoNS - 50-60% kes NICU)",
      "Staphylococcus aureus (MSSA & MRSA)",
      "Klebsiella pneumoniae (ESBL+)",
      "Pseudomonas aeruginosa & Acinetobacter baumannii",
      "Candida albicans & Candida parapsilosis"
    ],
    "firstLineDrugs": [
      "cloxacillin",
      "amikacin",
      "gentamicin",
      "vancomycin",
      "cefotaxime"
    ],
    "firstLineTherapy": {
      "regimen": "LONS Diperolehi di Komuniti: IV Cloxacillin 100-200 mg/kg/hari dibahagi Q6H-Q8H + IV Gentamicin 4-5 mg/kg OD (atau IV Cefotaxime 100-150 mg/kg/hari). LONS Nosokomial di NICU / Bayi dengan Talian Vena Sentral: IV Vancomycin 15 mg/kg/dos Q8H-Q12H (trough 10-15 mcg/mL) + IV Amikacin 15 mg/kg OD (or IV Cefotaxime 150 mg/kg/hari).",
      "routeAndDose": "IV infusi perlahan dengan pemantauan TDM berkala.",
      "durationDays": "7 - 10 days (Bakteremia); 14 hari (S. aureus / Sepsis talian)",
      "remarks": "Vancomycin diindikasikan di NICU bagi sepsis lewat kerana prevalens CoNS pembina biofilm yang tinggi pada talian kateter arteri/vena umbilikal."
    },
    "secondLineDrugs": [
      "meropenem",
      "vancomycin",
      "fluconazole",
      "caspofungin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Meropenem 20-40 mg/kg/dos Q8H + IV Vancomycin 15 mg/kg/dos Q8H (+/- IV Fluconazole 12 mg/kg loading kemudian 6 mg/kg OD jika sepsis kulat disyaki).",
      "routeAndDose": "IV ICU.",
      "durationDays": "10 - 14 days",
      "remarks": "Untuk syok septik refraktori dengan risiko kuman Gram-negatif penghasil ESBL di NICU."
    },
    "pediatricWeightDoseHint": "IV Cloxacillin: 25-50 mg/kg/dos Q8H (neonat <7 hari) atau Q6H (≥7 hari). IV Vancomycin: 15 mg/kg/dos Q12H (<29 minggu PMA) atau Q8H (≥30 minggu PMA). IV Amikacin: 15 mg/kg OD.",
    "maxDailyDose": "Cloxacillin: maks 200 mg/kg/hari; Vancomycin: disasarkan kepada paras palung TDM",
    "amsNotes": [
      "Keluarkan talian kateter umbilikal (UVC/UAC) atau PICC sekiranya kultur darah menunjukkan S. aureus, Candida spp., atau Pseudomonas.",
      "Lakukan TDM Vancomycin dan Amikacin untuk mengelakkan ketoksikan renal dan pendengaran pada neonat pramatang."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / ESPID Neonatal Infection Guidelines)"
  },
  {
    "id": "NAG-B6-003",
    "targetPopulation": "Neonatal",
    "categoryCode": "B6",
    "categoryTitle": "B6 : Neonatal Infections",
    "topic": "3. NEONATAL MENINGITIS",
    "topicNumber": 3,
    "bodySystem": "Neonatal & Paediatric Syndromes",
    "conditionName": "Neonatal Bacterial Meningitis (Meningitis Bakteria Neonat)",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Group B Streptococcus (GBS)",
      "Escherichia coli (K1)",
      "Listeria monocytogenes",
      "Klebsiella pneumoniae & Citrobacter koseri (risiko abses otak)"
    ],
    "firstLineDrugs": [
      "ampicillin",
      "cefotaxime",
      "gentamicin"
    ],
    "firstLineTherapy": {
      "regimen": "IV Ampicillin 200 - 300 mg/kg/hari dibahagi Q6H-Q8H + IV Cefotaxime 150 - 200 mg/kg/hari dibahagi Q6H-Q8H (+/- IV Gentamicin 4-5 mg/kg OD untuk sinergi pembasmian GBS/Listeria fasa awal).",
      "routeAndDose": "IV dos meningitis tinggi.",
      "durationDays": "14 days (GBS / Listeria) / Minimum 21 hari atau 14 hari selepas CSF steril (Gram-negatif E. coli / Klebsiella)",
      "remarks": "ELAKKAN CEFTRIAXONE PADA NEONAT; Cefotaxime adalah sefalosporin pilihan mutlak yang mempunyai penembusan CSF cemerlang dan selamat untuk neonat."
    },
    "secondLineDrugs": [
      "meropenem",
      "vancomycin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Meropenem 40 mg/kg/dos Q8H + IV Vancomycin 15 mg/kg/dos Q6H-Q8H",
      "routeAndDose": "IV.",
      "durationDays": "21 days",
      "remarks": "Untuk meningitis neonatal akibat organisma Gram-negatif penghasil ESBL atau Pseudomonas."
    },
    "pediatricWeightDoseHint": "IV Ampicillin: 75-100 mg/kg/dos Q8H (<7 hari) atau Q6H (≥7 hari). IV Cefotaxime: 50 mg/kg/dos Q8H (<7 hari) atau Q6H (≥7 hari).",
    "maxDailyDose": "Ampicillin: maks 300 mg/kg/hari; Cefotaxime: maks 200 mg/kg/hari",
    "amsNotes": [
      "Lakukan Lumbar Puncture Ulangan (Repeat LP) pada 48-72 jam untuk mendokumentasikan pembersihan bakteria dari cecair serebrospinal (CSF sterilization).",
      "Lakukan USG Kepala / MRI Otak untuk mengesan komplikasi ventrikulitis, abses serebral, atau hidrosefalus."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / AAP Neonatal Meningitis Guidelines)"
  },
  {
    "id": "NAG-B6-004",
    "targetPopulation": "Neonatal",
    "categoryCode": "B6",
    "categoryTitle": "B6 : Neonatal Infections",
    "topic": "4. CONGENITAL SYPHILIS & TORCH INFECTIONS",
    "topicNumber": 4,
    "bodySystem": "Neonatal & Paediatric Syndromes",
    "conditionName": "Congenital Syphilis & Perinatal TORCH Infections",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Treponema pallidum",
      "Cytomegalovirus (CMV)",
      "Toxoplasma gondii",
      "Rubella virus"
    ],
    "firstLineDrugs": [
      "benzylpenicillin",
      "penicillin g",
      "procaine penicillin",
      "ganciclovir",
      "valganciclovir"
    ],
    "firstLineTherapy": {
      "regimen": "Sifilis Kongenital Disahkan / Simptomatik: IV Aqueous Crystalline Benzylpenicillin 100,000 - 150,000 U/kg/hari (diberikan 50,000 U/kg/dos Q12H pada 7 hari pertama, kemudian Q8H) x 10 HARI PENUH (atau IM Procaine Penicillin G 50,000 U/kg OD x 10 hari). Sifilis Kongenital Asimtomatik (Ibu dirawat tidak mencukupi): IM Benzathine Penicillin G 50,000 U/kg stat dos tunggal.",
      "routeAndDose": "IV infusi perlahan / IM.",
      "durationDays": "10 days (Simptomatik/CSF abnormal) / Single dose (Asimtomatik)",
      "remarks": "Jika sebarang dos dalam rejimen 10 hari terlepas melebihi 24 jam, KESELURUHAN REJIMEN 10 HARI WAJIB DIULANG DARI HARI PERTAMA SEMULA."
    },
    "secondLineDrugs": [
      "valganciclovir",
      "ganciclovir"
    ],
    "secondLineTherapy": {
      "regimen": "Kongenital CMV Simptomatik: Oral Valganciclovir 16 mg/kg/dos BD x 6 BULAN (or IV Ganciclovir 6 mg/kg/dos Q12H x 6 minggu).",
      "routeAndDose": "Oral / IV.",
      "durationDays": "6 months (Valganciclovir untuk CMV)",
      "remarks": "Terapi awal valganciclovir mencegah kecacatan pendengaran neurosensorik dan kecacatan perkembangan otak pada bayi CMV."
    },
    "pediatricWeightDoseHint": "IV Aqueous Benzylpenicillin: 50,000 Unit/kg/dos Q12H (hari 1-7) kemudian Q8H (hari 8-10). IM Benzathine Penicillin G: 50,000 Unit/kg stat dos tunggal.",
    "maxDailyDose": "Benzylpenicillin: 150,000 Unit/kg/hari",
    "amsNotes": [
      "Lakukan penilaian lengkap: Ujian VDRL/RPR kuantitatif bayi (bandingkan dengan titer ibu), Lumbar Puncture CSF, X-ray Tulang Panjang, dan Pemeriksaan Mata/Pendengaran.",
      "Pantau titer RPR bayi pada bulan ke-2, 4, 6, dan 12 sehingga titer negatif sepenuhnya."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / CDC Congenital Syphilis Guidelines 2021)"
  },
  {
    "id": "NAG-B7-001",
    "targetPopulation": "Neonatal",
    "categoryCode": "B7",
    "categoryTitle": "B7 : Ocular Infections",
    "topic": "1. OPHTHALMIA NEONATORUM (NEONATAL CONJUNCTIVITIS)",
    "topicNumber": 1,
    "bodySystem": "Ocular Infections",
    "conditionName": "Ophthalmia Neonatorum (Chlamydial & Gonococcal Neonatal Conjunctivitis)",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Chlamydia trachomatis (Punca paling lazim, onset hari ke 5-14)",
      "Neisseria gonorrhoeae (Paling berbahaya, onset hari ke 2-5)",
      "Staphylococcus aureus & Streptococcus pneumoniae",
      "Herpes Simplex Virus (HSV-2)"
    ],
    "firstLineDrugs": [
      "erythromycin",
      "azithromycin",
      "ceftriaxone",
      "cefotaxime"
    ],
    "firstLineTherapy": {
      "regimen": "Konjunktivitis Chlamydia: Oral Erythromycin Ethylsuccinate 50 mg/kg/hari dibahagi QID x 14 hari (atau Oral Azithromycin 20 mg/kg OD x 3 hari). Oftalmia Gonokokal Neonat: IM/IV Ceftriaxone 25-50 mg/kg stat dos tunggal (maks 125mg; ATAU IV Cefotaxime 100 mg/kg stat) + CUCI MATA DENGAN LARUTAN SALIN STERIL SETIAP JAM SEHINGGA DISCAJ BERSIH.",
      "routeAndDose": "Oral untuk Chlamydia; IM/IV untuk Gonorrhoea.",
      "durationDays": "14 days (Chlamydia) / Single dose (Gonococcal)",
      "remarks": "Klamidia neonat memerlukan rawatan SISTEMIK ORAL (bukan titisan mata sahaja) untuk membasmi kolonisasi nasofarinks dan mencegah Pneumonia Klamidia Bayi."
    },
    "secondLineDrugs": [
      "cefotaxime",
      "chloramphenicol"
    ],
    "secondLineTherapy": {
      "regimen": "IV Cefotaxime 100 mg/kg stat dos tunggal jika terdapat jaundis atau kontraindikasi Ceftriaxone.",
      "routeAndDose": "IV.",
      "durationDays": "Single dose",
      "remarks": "Selamat untuk neonat."
    },
    "pediatricWeightDoseHint": "Oral Erythromycin: 12.5 mg/kg/dos QID x 14 hari. IM Ceftriaxone: 25-50 mg/kg stat (maks 125mg). IV Cefotaxime: 100 mg/kg stat dos tunggal.",
    "maxDailyDose": "Ceftriaxone: maks 125mg stat; Erythromycin: maks 2g/hari",
    "amsNotes": [
      "Ibu bapa dan pasangan seks ibu WAJIB diperiksa dan dirawat serentak untuk Gonorrhoea dan Chlamydia.",
      "Pantau tanda Stenosis Pilorus Hipertrofik Infantil (IHPS) pada bayi yang menerima Erythromycin/Azithromycin pada 2 minggu pertama kehidupan."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / CDC Ophthalmia Neonatorum Guidelines)"
  },
  {
    "id": "NAG-B7-002",
    "targetPopulation": "Paediatric",
    "categoryCode": "B7",
    "categoryTitle": "B7 : Ocular Infections",
    "topic": "2. PAEDIATRIC BACTERIAL KERATITIS & CORNEAL ULCER",
    "topicNumber": 2,
    "bodySystem": "Ocular Infections",
    "conditionName": "Paediatric Microbial Keratitis & Corneal Ulceration",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Pseudomonas aeruginosa",
      "Staphylococcus aureus (MSSA & MRSA)",
      "Streptococcus pneumoniae"
    ],
    "firstLineDrugs": [
      "levofloxacin",
      "moxifloxacin",
      "cefazolin",
      "gentamicin"
    ],
    "firstLineTherapy": {
      "regimen": "Titisan Mata Moxifloxacin 0.5% atau Levofloxacin 0.5% setiap 1 jam siang dan malam (atau Titisan Fortified Cefazolin 5% berselang-seli dengan Fortified Gentamicin 1.4% setiap jam) + RUJUKAN SEGERA KEPADA PAKAR MATA PEDIATRIK.",
      "routeAndDose": "Topikal titisan mata intensif.",
      "durationDays": "14 - 21 days",
      "remarks": "Ulser kornea pada kanak-kanak boleh menyebabkan parut kornea kekal dan ambliopia jika lewat dirawat."
    },
    "secondLineDrugs": [
      "ceftazidime",
      "vancomycin"
    ],
    "secondLineTherapy": {
      "regimen": "Titisan Fortified Vancomycin 5% + Fortified Ceftazidime 5% setiap 1 jam untuk kes ulser rintang.",
      "routeAndDose": "Topikal diperkukuh.",
      "durationDays": "14 - 28 days",
      "remarks": "Disediakan di bawah pengawasan Farmasi Bilik Bersih Hospital."
    },
    "amsNotes": [
      "JANGAN gunakan titisan mata steroid pada fasa akut ulser kornea yang belum terkawal.",
      "Gunakan penutup mata pelindung (eye shield) tanpa menekan bola mata."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / AAO Paediatric Ophthalmology Guidelines)"
  },
  {
    "id": "NAG-B7-003",
    "targetPopulation": "Paediatric",
    "categoryCode": "B7",
    "categoryTitle": "B7 : Ocular Infections",
    "topic": "3. PRESEPTAL & ORBITAL CELLULITIS IN CHILDREN",
    "topicNumber": 3,
    "bodySystem": "Ocular Infections",
    "conditionName": "Paediatric Preseptal Cellulitis vs Post-Septal Orbital Cellulitis",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Staphylococcus aureus (MSSA & MRSA)",
      "Streptococcus pneumoniae & Strep pyogenes",
      "Haemophilus influenzae",
      "Anaerobes (sinus-derived)"
    ],
    "firstLineDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "cefotaxime",
      "cloxacillin",
      "ceftriaxone",
      "metronidazole"
    ],
    "firstLineTherapy": {
      "regimen": "Selulitis Preseptal (Ringan): Oral Augmentin 45-60 mg/kg/hari dibahagi TDS x 7-10 hari. Selulitis Orbital (Kecemasan Pediatrik): IV Cefotaxime 150 mg/kg/hari dibahagi Q6H-Q8H (or IV Ceftriaxone 100 mg/kg/hari OD) + IV Cloxacillin 100-150 mg/kg/hari dibahagi Q6H (+/- IV Metronidazole jika sinus etmoid/maksila tersumbat teruk) + IMBAASAN CT ORBIT & PARANASAL SINUS SEGERA.",
      "routeAndDose": "Oral untuk preseptal; IV parenteral dos tinggi untuk orbital.",
      "durationDays": "7 - 10 days (Preseptal) / 14 - 21 days (Orbital)",
      "remarks": "Tanda Selulitis Orbital: Proptosis, ophthalmoplegia (sakit/terhad pergerakan mata), kemosis konjunktiva, dan penurunan tindak balas pupil; perlukan rujukan kecemasan bersama Pakar Mata & Pakar ENT."
    },
    "secondLineDrugs": [
      "vancomycin",
      "piperacillin/tazobactam",
      "tazocin",
      "meropenem"
    ],
    "secondLineTherapy": {
      "regimen": "IV Vancomycin 60 mg/kg/hari dibahagi Q6H + IV Piperacillin/Tazobactam 80 mg/kg/dos Q6H (atau IV Meropenem 20 mg/kg/dos Q8H)",
      "routeAndDose": "IV.",
      "durationDays": "14 - 21 days",
      "remarks": "Untuk abses subperiosteal orbit atau ancaman trombosis sinus kavernosus."
    },
    "allergyDrugs": [
      "clindamycin",
      "vancomycin",
      "ciprofloxacin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Clindamycin 30-40 mg/kg/hari dibahagi Q8H + IV Ciprofloxacin 20 mg/kg/hari dibahagi Q12H (or IV Vancomycin)",
      "routeAndDose": "IV.",
      "remarks": "Bebas beta-laktam."
    },
    "stepDownDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "clindamycin"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Augmentin 45 mg/kg/hari dibahagi TDS selepas bengkak surut dan afebril >48 jam.",
      "criteria": "Pergerakan mata bebas tanpa kesakitan, proptosis pulih, tiada demam, nafsu makan pulih."
    },
    "pediatricWeightDoseHint": "Oral Augmentin: 45 mg/kg/hari dibahagi TDS (maks 625mg TDS). IV Cefotaxime: 50 mg/kg/dos Q8H (maks 2g Q8H). IV Cloxacillin: 25-50 mg/kg/dos Q6H (maks 2g Q6H).",
    "maxDailyDose": "Augmentin: maks 2g/hari; Cefotaxime: maks 6g/hari",
    "amsNotes": [
      "Abses Subperiosteal (SPA) pada kanak-kanak berumur >9 tahun biasanya memerlukan penyaliran pembedahan endoskopik ENT (FESS); kanak-kanak <9 tahun dengan abses kecil (<0.5-1 mL) boleh dipantau dengan antibiotik IV teliti selama 24-48 jam terlebih dahulu.",
      "Pantau ketajaman penglihatan dan refleks pupil setiap 4 jam."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / AAP Orbital Infection Clinical Report)"
  },
  {
    "id": "NAG-B8-001",
    "targetPopulation": "Paediatric",
    "categoryCode": "B8",
    "categoryTitle": "B8 : Orthopaedic Infections",
    "topic": "1. PAEDIATRIC ACUTE HEMATOGENOUS OSTEOMYELITIS",
    "topicNumber": 1,
    "bodySystem": "Bone & Joint",
    "conditionName": "Paediatric Acute Hematogenous Osteomyelitis (AHO - Osteomielitis Hematogenus Akut)",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Staphylococcus aureus (MSSA & MRSA - 70-80%)",
      "Streptococcus pyogenes (Group A Strep)",
      "Streptococcus pneumoniae",
      "Kingella kingae (terutamanya kanak-kanak umur 6 bulan - 4 tahun)",
      "Salmonella spp. (Pesakit Penyakit Sel Sabit / Talasemia)"
    ],
    "firstLineDrugs": [
      "cloxacillin",
      "cefazolin",
      "cephalexin",
      "amoxicillin/clavulanic acid",
      "augmentin"
    ],
    "firstLineTherapy": {
      "regimen": "IV Cloxacillin 150 - 200 mg/kg/hari dibahagi Q6H (or IV Cefazolin 100 - 150 mg/kg/hari dibahagi Q8H) selama 2-4 hari pertama parenteral, diikuti PERTUKARAN AWAL KEPADA ORAL DOS TINGGI: Oral Cephalexin 100 - 150 mg/kg/hari dibahagi Q6H-Q8H (atau Oral Cloxacillin 100 mg/kg/hari Q6H / Oral Augmentin 80 mg/kg/hari) untuk melengkapkan jumlah 3 HINGGA 4 MINGGU.",
      "routeAndDose": "IV fasa awal singkat bertukar cepat ke Terapi Oral Dos Tinggi.",
      "durationDays": "3 - 4 weeks total (Tempoh 3-4 minggu sama berkesan dengan 6 minggu mengikut bukti terkini ESPID/AAP)",
      "remarks": "PERTUKARAN ORAL AWAL (Early Oral Switch): Kanak-kanak boleh ditukar ke ubat oral seawal hari ke-3 atau ke-4 sebaik sahaja afebril >24 jam dan paras CRP menunjukkan trend penurunan konsisten >30-50%."
    },
    "secondLineDrugs": [
      "vancomycin",
      "clindamycin",
      "ceftriaxone"
    ],
    "secondLineTherapy": {
      "regimen": "IV Vancomycin 60 mg/kg/hari dibahagi Q6H (trough 15-20 mcg/mL) atau IV/Oral Clindamycin 40 mg/kg/hari dibahagi Q8H (+ IV Ceftriaxone 75 mg/kg OD jika pesakit talasemia/Salmonella).",
      "routeAndDose": "IV / Oral.",
      "durationDays": "3 - 4 weeks",
      "remarks": "Untuk kes Community-Acquired MRSA atau pesakit dengan alahan penisilin."
    },
    "allergyDrugs": [
      "clindamycin",
      "vancomycin",
      "co-trimoxazole",
      "bactrim"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV bertukar ke Oral Clindamycin 40 mg/kg/hari dibahagi Q8H (or Oral Bactrim pada dos TMP 8-10 mg/kg/hari dibahagi BD)",
      "routeAndDose": "Oral / IV.",
      "remarks": "Clindamycin mempunyai penembusan tisu tulang yang sangat tinggi."
    },
    "stepDownDrugs": [
      "cephalexin",
      "cloxacillin",
      "amoxicillin/clavulanic acid",
      "augmentin",
      "clindamycin"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Cephalexin 100-150 mg/kg/hari dibahagi Q6H-Q8H (maks 4g/hari) atau Oral Clindamycin 40 mg/kg/hari dibahagi Q8H.",
      "criteria": "Pesakit afebril >24-48 jam, kesakitan dan bengkak anggota berkurangan jelas, boleh menanggung berat/menggerakkan anggota, CRP turun >30-50% dari nilai puncak."
    },
    "pediatricWeightDoseHint": "IV Cloxacillin: 35-50 mg/kg/dos Q6H (maks 2g Q6H). Oral Cephalexin: 25-37.5 mg/kg/dos Q6H (maks 1g Q6H). Oral Clindamycin: 10-13 mg/kg/dos Q8H (maks 600mg Q8H).",
    "maxDailyDose": "Cloxacillin: maks 8g/hari; Cephalexin: maks 4g/hari; Clindamycin: maks 1.8g/hari",
    "amsNotes": [
      "Pantau paras C-Reactive Protein (CRP) bersiri setiap 3-4 hari; CRP adalah penanda terbaik untuk menentukan masa pertukaran oral dan tempoh pemberhentian antibiotik.",
      "Lakukan X-ray dan USG Tulang/Sendi untuk mengesan abses subperiosteal yang memerlukan penyaliran pembedahan segera."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / ESPID Bone & Joint Infection Guidelines 2020)"
  },
  {
    "id": "NAG-B8-002",
    "targetPopulation": "Paediatric",
    "categoryCode": "B8",
    "categoryTitle": "B8 : Orthopaedic Infections",
    "topic": "2. PAEDIATRIC SEPTIC ARTHRITIS",
    "topicNumber": 2,
    "bodySystem": "Bone & Joint",
    "conditionName": "Paediatric Septic Arthritis (Artritis Septik Pediatrik)",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Staphylococcus aureus (MSSA & MRSA)",
      "Streptococcus pyogenes & Strep pneumoniae",
      "Kingella kingae (kanak-kanak <4 tahun)",
      "Neisseria gonorrhoeae (Remaja aktif seksual)"
    ],
    "firstLineDrugs": [
      "cloxacillin",
      "cefazolin",
      "cephalexin",
      "cefotaxime"
    ],
    "firstLineTherapy": {
      "regimen": "ARTROTOMI PENYALIRAN / ASPIRASI JARUM SENDI KECEMASAN + IV Cloxacillin 150 mg/kg/hari dibahagi Q6H (or IV Cefazolin 100 mg/kg/hari dibahagi Q8H / IV Cefotaxime 150 mg/kg/hari jika umur <2 tahun untuk liputan Kingella) selama 2-4 hari, diikuti pertukaran ke Oral Cephalexin 100-150 mg/kg/hari dibahagi Q6H-Q8H melengkapkan 2 HINGGA 3 MINGGU JUMLAH.",
      "routeAndDose": "Penyaliran pembedahan kecemasan + IV fasa awal bertukar ke Oral.",
      "durationDays": "2 - 3 weeks total (14-21 hari memadai untuk sendi tidak berkomplikasi)",
      "remarks": "KECEMASAN BEDAH ORTOPEDIK PEDIATRIK: Sendi pinggul (hip septic arthritis) dan bahu bernanah memerlukan dekompresi pembedahan segera dalam beberapa jam untuk mengelakkan nekrosis avaskular kepala femur (AVN femoral head)."
    },
    "secondLineDrugs": [
      "vancomycin",
      "clindamycin",
      "ceftriaxone"
    ],
    "secondLineTherapy": {
      "regimen": "IV Vancomycin 60 mg/kg/hari dibahagi Q6H atau IV Clindamycin 40 mg/kg/hari dibahagi Q8H",
      "routeAndDose": "IV.",
      "durationDays": "2 - 3 weeks",
      "remarks": "Untuk jangkitan MRSA disyaki atau alahan penisilin."
    },
    "allergyDrugs": [
      "clindamycin",
      "vancomycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV bertukar ke Oral Clindamycin 40 mg/kg/hari dibahagi Q8H x 2-3 minggu",
      "routeAndDose": "IV/Oral.",
      "remarks": "Selamat untuk pesakit alahan penisilin."
    },
    "stepDownDrugs": [
      "cephalexin",
      "cloxacillin",
      "clindamycin"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Cephalexin 100-150 mg/kg/hari dibahagi Q6H-Q8H atau Oral Clindamycin 40 mg/kg/hari dibahagi Q8H.",
      "criteria": "Sendi tidak lagi panas/bengkak, julat pergerakan sendi pulih tanpa kesakitan, pesakit afebril, CRP menurun."
    },
    "pediatricWeightDoseHint": "IV Cloxacillin: 35-50 mg/kg/dos Q6H (maks 2g Q6H). Oral Cephalexin: 25-37.5 mg/kg/dos Q6H. IV Cefotaxime: 50 mg/kg/dos Q8H.",
    "maxDailyDose": "Cloxacillin: maks 8g/hari; Cephalexin: maks 4g/hari",
    "amsNotes": [
      "Hantar Cecair Sinovial untuk Pewarnaan Gram, Kultur C&S mikrobiologi, dan Ujian Kingella kingae Real-Time PCR (Kingella sukar tumbuh pada kultur agar standard).",
      "Kriteria Kocher untuk Septic Arthritis Pinggul: (1) Demam >38.5°C, (2) Ketidakupayaan menanggung berat badan, (3) ESR >40 mm/hr, (4) WBC >12,000/mcL."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / ESPID Guidelines for Septic Arthritis)"
  },
  {
    "id": "NAG-B8-003",
    "targetPopulation": "Paediatric",
    "categoryCode": "B8",
    "categoryTitle": "B8 : Orthopaedic Infections",
    "topic": "3. KINGELLA KINGAE INFECTIONS IN TODDLERS",
    "topicNumber": 3,
    "bodySystem": "Bone & Joint",
    "conditionName": "Kingella kingae Osteoarticular Infections in Toddlers (< 4 Years)",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Kingella kingae (Bakteria Gram-negatif komensal orofarinks kanak-kanak kecil)"
    ],
    "firstLineDrugs": [
      "ampicillin",
      "amoxicillin",
      "cefuroxime",
      "ceftriaxone",
      "amoxicillin/clavulanic acid",
      "augmentin"
    ],
    "firstLineTherapy": {
      "regimen": "IV Ampicillin 100-150 mg/kg/hari dibahagi Q6H (or IV Cefuroxime 100-150 mg/kg/hari / IV Ceftriaxone 50-75 mg/kg OD) selama 2-3 hari, diikuti pertukaran oral: Oral Amoxicillin 80-90 mg/kg/hari dibahagi BD/TDS (atau Oral Augmentin 45-60 mg/kg/hari) melengkapkan 2 HINGGA 3 MINGGU.",
      "routeAndDose": "IV bertukar ke Oral.",
      "durationDays": "2 - 3 weeks (14 hari untuk artritis septik; 3 minggu untuk osteomielitis)",
      "remarks": "Kingella kingae biasanya menyebabkan jangkitan tulang/sendi yang ringan (mild/subacute) pada kanak-kanak berumur 6 bulan hingga 4 tahun, selalunya dengan demam ringan dan penanda radang yang tidak terlalu tinggi."
    },
    "secondLineDrugs": [
      "cefuroxime",
      "azithromycin",
      "co-trimoxazole",
      "bactrim"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Cefuroxime Axetil 30 mg/kg/hari dibahagi BD atau Oral Bactrim pada dos TMP 8 mg/kg/hari dibahagi BD.",
      "routeAndDose": "Oral.",
      "durationDays": "2 - 3 weeks",
      "remarks": "Perhatian: Kingella kingae adalah RINTANG SECARA SEMULA JADI KEPADA CLINDAMYCIN DAN VANCOMYCIN!"
    },
    "allergyDrugs": [
      "ciprofloxacin",
      "azithromycin",
      "co-trimoxazole",
      "bactrim"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Bactrim (TMP 8 mg/kg/hari BD) atau Oral Azithromycin 10 mg/kg OD (or IV Ciprofloxacin 20 mg/kg/hari dibahagi Q12H)",
      "routeAndDose": "Oral / IV.",
      "remarks": "JANGAN gunakan Clindamycin atau Vancomycin untuk Kingella."
    },
    "pediatricWeightDoseHint": "Oral Amoxicillin: 40-45 mg/kg/dos BD (maks 1g BD). IV Ampicillin: 25-37.5 mg/kg/dos Q6H. Oral Cefuroxime: 15 mg/kg/dos BD.",
    "maxDailyDose": "Amoxicillin: maks 2g/hari; Ampicillin: maks 6g/hari",
    "amsNotes": [
      "Inokulasikan cecair sinovial terus ke dalam Botol Kultur Darah Pediatrik (Blood Culture Bottle BACTEC) di sisi katil untuk meningkatkan kadar pengesanan Kingella kingae.",
      "Ujian Kingella kingae PCR spesifik (rt-PCR targeting rtxA or cpn60) adalah kaedah pengesanan paling sensitif."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / ESPID Kingella Consensus)"
  },
  {
    "id": "NAG-B9-001",
    "targetPopulation": "Paediatric",
    "categoryCode": "B9",
    "categoryTitle": "B9 : Otorhinolaryngology Infections",
    "topic": "1. PAEDIATRIC ACUTE OTITIS MEDIA (AOM)",
    "topicNumber": 1,
    "bodySystem": "Ear, Nose & Throat (ENT)",
    "conditionName": "Paediatric Acute Otitis Media (AOM - Jangkitan Telinga Tengah Kanak-Kanak)",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Streptococcus pneumoniae (Pneumococcus)",
      "Haemophilus influenzae (Non-typable)",
      "Moraxella catarrhalis",
      "Streptococcus pyogenes"
    ],
    "firstLineDrugs": [
      "amoxicillin",
      "amoxicillin/clavulanic acid",
      "augmentin"
    ],
    "firstLineTherapy": {
      "regimen": "Oral Amoxicillin Dos Tinggi 80 - 90 mg/kg/hari dibahagi BD atau TDS x 5-7 hari (x 10 hari jika umur <2 tahun atau AOM teruk). Kegagalan Rawatan Awal selepas 48-72 jam: Oral Augmentin Dos Tinggi 80 - 90 mg/kg/hari (nisbah Amoxicillin/Clavulanate 7:1 atau 14:1) dibahagi BD x 7-10 hari.",
      "routeAndDose": "Oral.",
      "durationDays": "5 - 7 days (Umur ≥2 tahun / Ringan) / 10 days (Umur <2 tahun / Perforasi)",
      "remarks": "DOS TINGGI AMOXICILLIN (80-90 mg/kg/hari) adalah perlu untuk mengatasi rintangan perantaraan penisilin bagi Streptococcus pneumoniae dalam cecair telinga tengah."
    },
    "secondLineDrugs": [
      "cefuroxime",
      "ceftriaxone",
      "azithromycin"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Cefuroxime Axetil 30 mg/kg/hari dibahagi BD x 10 hari atau IM Ceftriaxone 50 mg/kg OD x 1-3 hari.",
      "routeAndDose": "Oral / IM.",
      "durationDays": "1 - 3 days (IM Ceftriaxone) / 10 days (Oral)",
      "remarks": "IM Ceftriaxone 50mg/kg OD x 3 hari adalah pilihan terbaik jika kanak-kanak kerap muntah atau tidak mahu menelan ubat oral."
    },
    "allergyDrugs": [
      "azithromycin",
      "clarithromycin",
      "co-trimoxazole",
      "bactrim"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Azithromycin 10 mg/kg OD (hari 1) kemudian 5 mg/kg OD (hari 2-5) atau Oral Clarithromycin 15 mg/kg/hari dibahagi BD x 10 hari",
      "routeAndDose": "Oral.",
      "remarks": "Sesuai untuk kanak-kanak alahan penisilin."
    },
    "pediatricWeightDoseHint": "Oral Amoxicillin: 40-45 mg/kg/dos BD (maks 1.5g BD / 3g/hari). Oral Augmentin: 40-45 mg/kg/dos BD (berasaskan komponen Amoxicillin).",
    "maxDailyDose": "Amoxicillin: maks 3g/hari; Augmentin: maks 3g/hari Amoxicillin",
    "amsNotes": [
      "ANALGESIA ADALAH WAJIB: Berikan Paracetamol (15 mg/kg Q6H) atau Ibuprofen (10 mg/kg Q8H) secukupnya untuk meredakan sakit telinga akut.",
      "Pendekatan 'Watchful Waiting' selama 48 jam tanpa antibiotik boleh dipertimbangkan untuk kanak-kanak berumur >2 tahun dengan AOM sebelah telinga yang tidak teruk."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / AAP Clinical Practice Guideline on AOM)"
  },
  {
    "id": "NAG-B9-002",
    "targetPopulation": "Paediatric",
    "categoryCode": "B9",
    "categoryTitle": "B9 : Otorhinolaryngology Infections",
    "topic": "2. ACUTE MASTOIDITIS IN CHILDREN",
    "topicNumber": 2,
    "bodySystem": "Ear, Nose & Throat (ENT)",
    "conditionName": "Paediatric Acute Coalescent Mastoiditis & Subperiosteal Abscess",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Streptococcus pneumoniae",
      "Streptococcus pyogenes",
      "Staphylococcus aureus (MSSA & MRSA)",
      "Pseudomonas aeruginosa (terutamanya AOM kronik)"
    ],
    "firstLineDrugs": [
      "ceftriaxone",
      "amoxicillin/clavulanic acid",
      "augmentin",
      "cloxacillin"
    ],
    "firstLineTherapy": {
      "regimen": "IV Ceftriaxone 75-100 mg/kg OD (or IV Co-Amoxiclav 30 mg/kg/dos TDS) + IV Cloxacillin 100 mg/kg/hari dibahagi Q6H + RUJUKAN SEGERA KEPADA PAKAR ENT UNTUK MIRINGOTOMI / MASTOIDEKTOMI.",
      "routeAndDose": "IV infusi parenteral.",
      "durationDays": "14 - 21 days total",
      "remarks": "Mastoiditis Akut ditandakan dengan bengkak kemerahan di belakang telinga (retroauricular erythema) yang menolak cuping telinga ke depan dan ke bawah (protruding auricle)."
    },
    "secondLineDrugs": [
      "vancomycin",
      "piperacillin/tazobactam",
      "tazocin",
      "meropenem"
    ],
    "secondLineTherapy": {
      "regimen": "IV Vancomycin 60 mg/kg/hari dibahagi Q6H + IV Tazocin 80 mg/kg/dos Q6H (atau IV Meropenem 20 mg/kg/dos Q8H)",
      "routeAndDose": "IV.",
      "durationDays": "14 - 21 days",
      "remarks": "Untuk kes mastoiditis berkomplikasi dengan abses Bezold, kelumpuhan CN VII, atau trombosis sinus sigmoid."
    },
    "pediatricWeightDoseHint": "IV Ceftriaxone: 75-100 mg/kg OD (maks 2g OD). IV Co-Amoxiclav: 30 mg/kg/dos TDS (maks 1.2g TDS).",
    "maxDailyDose": "Ceftriaxone: maks 2g/hari; Co-Amoxiclav: maks 3.6g/hari",
    "amsNotes": [
      "Lakukan Imbasan CT Tulang Temporal berkontras (High-Resolution Temporal Bone CT) dengan segera untuk menilai kerosakan trabekula mastoid dan menyingkirkan abses intrakranial.",
      "Miringotomi dengan aspirasi cecair telinga tengah untuk kultur C&S adalah prosedur terapeutik dan diagnostik utama."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / ESPID Pediatric ENT Guidelines)"
  },
  {
    "id": "NAG-B9-003",
    "targetPopulation": "Paediatric",
    "categoryCode": "B9",
    "categoryTitle": "B9 : Otorhinolaryngology Infections",
    "topic": "3. ACUTE STREPTOCOCCAL TONSILLOPHARYNGITIS",
    "topicNumber": 3,
    "bodySystem": "Ear, Nose & Throat (ENT)",
    "conditionName": "Acute Group A Streptococcal (GAS) Tonsillopharyngitis (Tonsilitis Streptokokus)",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Streptococcus pyogenes (Group A Beta-Hemolytic Streptococcus - GAS)"
    ],
    "firstLineDrugs": [
      "phenoxymethylpenicillin",
      "penicillin v",
      "amoxicillin",
      "benzathine penicillin g"
    ],
    "firstLineTherapy": {
      "regimen": "Oral Penicillin V (Kanak-kanak <27kg: 250mg BD/TDS; ≥27kg: 500mg BD/TDS) x 10 HARI PENUH ATAU Oral Amoxicillin 50 mg/kg OD x 10 HARI PENUH (atau IM Benzathine Penicillin G stat dos tunggal: <27kg = 600,000 U; ≥27kg = 1.2 MU).",
      "routeAndDose": "Oral diambil 1 jam sebelum makan.",
      "durationDays": "10 days (WAJIB 10 HARI PENUH)",
      "remarks": "TUJUAN UTAMA RAWATAN 10 HARI: Rawatan antibiotik penuh 10 hari adalah KRITIKAL untuk membasmi kuman GAS sepenuhnya dari farinks bagi MENCEGAH DEMAM REUMATIK AKUT (Acute Rheumatic Fever). Menghentikan antibiotik awal meningkatkan risiko komplikasi jantung."
    },
    "secondLineDrugs": [
      "cephalexin",
      "cefadroxil",
      "azithromycin",
      "erythromycin"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Cephalexin 40 mg/kg/hari dibahagi BD x 10 hari atau Oral Azithromycin 12 mg/kg OD x 5 hari.",
      "routeAndDose": "Oral.",
      "durationDays": "5 days (Azithromycin) / 10 days (Cephalexin)",
      "remarks": "Bagi pesakit yang tidak bertolak ansur dengan rasa penisilin oral."
    },
    "allergyDrugs": [
      "azithromycin",
      "clarithromycin",
      "erythromycin",
      "clindamycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Azithromycin 12 mg/kg OD (maks 500mg) x 5 hari atau Oral Clarithromycin 15 mg/kg/hari dibahagi BD x 10 hari (atau Oral Clindamycin 20 mg/kg/hari dibahagi TDS x 10 hari)",
      "routeAndDose": "Oral.",
      "remarks": "Sesuai untuk kanak-kanak alahan penisilin."
    },
    "pediatricWeightDoseHint": "Oral Amoxicillin: 50 mg/kg OD (maks 1g OD) x 10 hari. Oral Penicillin V: 25-50 mg/kg/hari dibahagi TDS-QID x 10 hari.",
    "maxDailyDose": "Amoxicillin: maks 1g/hari; Penicillin V: maks 2g/hari",
    "amsNotes": [
      "Gunakan Skor Centor / McIsaac Modifikasi Pediatrik: Jangan beri antibiotik jika skor rendah (0-1); majoriti sakit tekak pada kanak-kanak <3 tahun adalah berpunca daripada VIRUS (Adenovirus, EBV, Enterovirus).",
      "Lakukan Ujian Rapid Strep A Test (RADT) atau Swab Tekak jika skor Centor ≥3."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IDSA Pharyngitis Guidelines / WHO Protocol)"
  },
  {
    "id": "NAG-B9-004",
    "targetPopulation": "Paediatric",
    "categoryCode": "B9",
    "categoryTitle": "B9 : Otorhinolaryngology Infections",
    "topic": "4. CROUP & ACUTE EPIGLOTTITIS",
    "topicNumber": 4,
    "bodySystem": "Ear, Nose & Throat (ENT)",
    "conditionName": "Viral Croup (Laryngotracheobronchitis) vs Acute Bacterial Epiglottitis",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Parainfluenza virus Type 1, 2, 3 (Viral Croup - 95%)",
      "Haemophilus influenzae type b (Epiglottitis Akut)",
      "Streptococcus pneumoniae & Staphylococcus aureus (Bacterial Tracheitis)"
    ],
    "firstLineDrugs": [
      "dexamethasone",
      "adrenaline",
      "epinephrine",
      "ceftriaxone",
      "cefotaxime"
    ],
    "firstLineTherapy": {
      "regimen": "Croup Viral (Batuk Menggonggong/Barking Cough + Stridor): Oral/IM Dexamethasone 0.15 - 0.60 mg/kg stat dos tunggal + Nebulisasi Adrenaline (Epinephrine 1:1000) 0.5 mL/kg (maks 5mL) jika stridor semasa rehat (ELAKKAN ANTIBIOTIK). Epiglottitis Bakteria (Drooling, Tripod position, Toksik): KAWAL AIRWAY DI DEWAN BEDAH + IV Ceftriaxone 100 mg/kg OD (or IV Cefotaxime 150 mg/kg/hari dibahagi Q6H).",
      "routeAndDose": "Oral/Nebulisasi untuk Croup; Intubasi + IV untuk Epiglottitis.",
      "durationDays": "Croup: Dos tunggal Dexamethasone; Epiglottitis: 7 - 10 days IV",
      "remarks": "CROUP TIDAK MEMERLUKAN ANTIBIOTIK; Dexamethasone adalah rawatan standard emas yang terbukti mengurangkan kemasukan ICU dan keperluan intubasi."
    },
    "secondLineDrugs": [
      "ampicillin/sulbactam",
      "unasyn",
      "vancomycin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Ampicillin/Sulbactam 150 mg/kg/hari dibahagi Q6H (+ IV Vancomycin jika disyaki Trakeitis Bakteria MRSA).",
      "routeAndDose": "IV.",
      "durationDays": "7 - 10 days",
      "remarks": "Bagi trakeitis bakteria purulen dengan rembesan membran tebal pada trakea."
    },
    "pediatricWeightDoseHint": "Oral Dexamethasone: 0.15-0.6 mg/kg stat (maks 16mg stat). Nebulised Adrenaline 1:1000: 0.5 mL/kg (maks 5 mL) dicampur salin biasa. IV Ceftriaxone: 100 mg/kg OD (maks 2g OD).",
    "maxDailyDose": "Dexamethasone: maks 16mg stat; Ceftriaxone: maks 2g/hari",
    "amsNotes": [
      "ELAKKAN manipulasi rongga mulut/kerongkong yang boleh mencetuskan laringospasme penuh pada kes disyaki epiglottitis.",
      "Semua kanak-kanak dengan croup yang menerima nebulisasi adrenaline wajib diperhatikan sekurang-kurangnya 4 jam di ED untuk mengesan kesan 'rebound stridor'."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / Malaysian Paediatric Protocol / Cochrane Croup Review)"
  },
  {
    "id": "NAG-B10-001",
    "targetPopulation": "Paediatric",
    "categoryCode": "B10",
    "categoryTitle": "B10 : Respiratory Infections",
    "topic": "1. PAEDIATRIC COMMUNITY-ACQUIRED PNEUMONIA (CAP)",
    "topicNumber": 1,
    "bodySystem": "Respiratory",
    "conditionName": "Paediatric Community-Acquired Pneumonia (CAP Pesakit Luar & Dimasukkan Wad)",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Streptococcus pneumoniae (Pneumococcus)",
      "Respiratory Syncytial Virus (RSV), Influenza, Human Metapneumovirus (Punca 60-70% bawah 2 tahun)",
      "Mycoplasma pneumoniae & Chlamydia pneumoniae (Kanak-kanak umur >5 tahun)",
      "Staphylococcus aureus (termasuk strain penghasil PVL)"
    ],
    "firstLineDrugs": [
      "amoxicillin",
      "ampicillin",
      "benzylpenicillin",
      "azithromycin",
      "clarithromycin",
      "amoxicillin/clavulanic acid",
      "augmentin"
    ],
    "firstLineTherapy": {
      "regimen": "CAP Pesakit Luar (Bukan Teruk): Oral Amoxicillin Dos Tinggi 80 - 90 mg/kg/hari dibahagi BD x 5 HARI (PILIHAN UTAMA). CAP Dimasukkan ke Wad (Tidak Perlu Oksigen Tinggi): IV Ampicillin 150-200 mg/kg/hari dibahagi Q6H (or IV Benzylpenicillin 200,000 U/kg/hari dibahagi Q6H). Kanak-Kanak Umur >5 Tahun (Disyaki Atipikal): Tambah Oral Azithromycin 10 mg/kg OD (hari 1) kemudian 5 mg/kg OD (hari 2-5).",
      "routeAndDose": "Oral untuk pesakit luar; IV untuk pesakit wad.",
      "durationDays": "5 days (Kajian SAFER trial membuktikan 5 hari sama berkesan dengan 10 hari)",
      "remarks": "Takrifan Takipnea WHO: Umur 2-11 bulan: RR ≥50/min; Umur 1-5 tahun: RR ≥40/min; Umur >5 tahun: RR ≥30/min."
    },
    "secondLineDrugs": [
      "co-amoxiclav",
      "augmentin",
      "cefotaxime",
      "ceftriaxone"
    ],
    "secondLineTherapy": {
      "regimen": "CAP Teruk Dimasukkan ke Wad / Kegagalan Barisan Pertama: IV Co-Amoxiclav 30 mg/kg/dos TDS (or IV Cefotaxime 150 mg/kg/hari dibahagi Q6H-Q8H / IV Ceftriaxone 75-100 mg/kg OD).",
      "routeAndDose": "IV parenteral.",
      "durationDays": "5 - 7 days",
      "remarks": "Untuk pneumonia lobar dengan demam tinggi berterusan atau tidak divaksin Pneumococcal."
    },
    "allergyDrugs": [
      "azithromycin",
      "clarithromycin",
      "erythromycin",
      "levofloxacin"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Azithromycin 10 mg/kg OD (hari 1) kemudian 5 mg/kg OD x 4 hari atau Oral Clarithromycin 15 mg/kg/hari dibahagi BD x 5-7 hari",
      "routeAndDose": "Oral.",
      "remarks": "Sesuai untuk pesakit alahan penisilin."
    },
    "stepDownDrugs": [
      "amoxicillin",
      "amoxicillin/clavulanic acid",
      "augmentin"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Amoxicillin 80-90 mg/kg/hari dibahagi BD melengkapkan jumlah 5 hari.",
      "criteria": "Kanak-kanak afebril >24 jam, kadar pernafasan normal mengikut umur, tiada 'chest indrawing', SpO2 ≥95% pada udara bilik, boleh minum susu/cecair."
    },
    "pediatricWeightDoseHint": "Oral Amoxicillin: 40-45 mg/kg/dos BD (maks 1.5g BD). IV Ampicillin: 35-50 mg/kg/dos Q6H (maks 2g Q6H). Oral Azithromycin: 10 mg/kg OD hari 1 (maks 500mg), kemudian 5 mg/kg OD hari 2-5 (maks 250mg).",
    "maxDailyDose": "Amoxicillin: maks 3g/hari; Ampicillin: maks 8g/hari; Azithromycin: maks 500mg/hari",
    "amsNotes": [
      "DASAR AMS PEDIATRIK: Elakkan penggunaan sefalosporin generasi ketiga spektrum luas (Ceftriaxone/Cefotaxime) sebagai barisan pertama untuk pneumonia komuniti biasa; Amoxicillin/Ampicillin adalah ubat pilihan utama yang tepat sasaran.",
      "Bronkiolitis Viral pada bayi <1 tahun (wheezing + coryza) TIDAK MEMERLUKAN ANTIBIOTIK."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / BTS & PIDS-IDSA Paediatric CAP Guidelines)"
  },
  {
    "id": "NAG-B10-002",
    "targetPopulation": "Paediatric",
    "categoryCode": "B10",
    "categoryTitle": "B10 : Respiratory Infections",
    "topic": "2. COMPLICATED PNEUMONIA & EMPYEMA THORACIS",
    "topicNumber": 2,
    "bodySystem": "Respiratory",
    "conditionName": "Paediatric Complicated Pneumonia, Necrotising Pneumonia & Empyema Thoracis",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Streptococcus pneumoniae (Serotype 19A, 3)",
      "Staphylococcus aureus (MSSA & PVL-producing MRSA)",
      "Streptococcus pyogenes (Group A Strep)",
      "Mycoplasma pneumoniae (Efusi parapneumonik nekrotik)"
    ],
    "firstLineDrugs": [
      "cefotaxime",
      "cloxacillin",
      "amoxicillin/clavulanic acid",
      "augmentin",
      "ceftriaxone"
    ],
    "firstLineTherapy": {
      "regimen": "PENYALIRAN TIUB DADA PIGTAIL / CHEST DRAIN BERPANDUKAN USG (atau VATS awal) + IV Cefotaxime 150-200 mg/kg/hari dibahagi Q6H-Q8H (or IV Ceftriaxone 100 mg/kg OD) + IV Cloxacillin 150-200 mg/kg/hari dibahagi Q6H (atau IV Co-Amoxiclav 30 mg/kg/dos TDS).",
      "routeAndDose": "Penyaliran rongga pleura + IV parenteral dos tinggi.",
      "durationDays": "2 - 4 weeks total (sekurang-kurangnya 10-14 hari selepas tiub dada dicabut dan pesakit afebril)",
      "remarks": "Pneumonia Nekrotik & Empiema: USG Toraks adalah modaliti pengimejan pilihan utama untuk menilai ketebalan lokulasi fibrin dan memandu peletakan tiub dada pigtail."
    },
    "secondLineDrugs": [
      "vancomycin",
      "clindamycin",
      "piperacillin/tazobactam",
      "tazocin",
      "meropenem"
    ],
    "secondLineTherapy": {
      "regimen": "IV Vancomycin 60 mg/kg/hari dibahagi Q6H + IV Clindamycin 40 mg/kg/hari dibahagi Q8H (merencat toksin PVL) + IV Tazocin 80 mg/kg/dos Q6H (atau Fibrinolitik Intrapleural: Urokinase)",
      "routeAndDose": "IV + Intrapleural.",
      "durationDays": "3 - 4 weeks",
      "remarks": "Clindamycin amat berguna untuk merencat penghasilan toksin Panton-Valentine Leukocidin (PVL) pada jangkitan Staph nekrotik."
    },
    "allergyDrugs": [
      "vancomycin",
      "clindamycin",
      "levofloxacin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Vancomycin 15 mg/kg/dos Q6H + IV Clindamycin 10-13 mg/kg/dos Q8H + IV Levofloxacin 10-20 mg/kg/hari",
      "routeAndDose": "IV.",
      "remarks": "Bebas beta-laktam."
    },
    "stepDownDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "clindamycin"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Augmentin 60-80 mg/kg/hari dibahagi TDS atau Oral Clindamycin 30-40 mg/kg/hari dibahagi TDS melengkapkan jumlah 3-4 minggu.",
      "criteria": "Tiub dada telah dicabut (tiada kebocoran udara/cecair <1mL/kg/hari), afebril >48 jam, tiada kesukaran bernafas, CRP menurun mendadak."
    },
    "pediatricWeightDoseHint": "IV Cefotaxime: 50 mg/kg/dos Q6H (maks 2g Q6H). IV Cloxacillin: 35-50 mg/kg/dos Q6H. IV Clindamycin: 10-13 mg/kg/dos Q8H (maks 600mg Q8H).",
    "maxDailyDose": "Cefotaxime: maks 8g/hari; Cloxacillin: maks 8g/hari; Clindamycin: maks 1.8g/hari",
    "amsNotes": [
      "Hantar Cecair Pleura untuk Analisis pH, Glukosa, LDH, Pewarnaan Gram, Kultur C&S, dan Pneumococcal PCR.",
      "Instilasi Urokinase Intrapleural (40,000 Unit dalam 40mL salin BD x 3 hari) berkesan memecahkan lokulasi fibrin dan mengelakkan keperluan pembedahan torakotomi terbuka."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / BTS Pediatric Pleural Infection Guidelines)"
  },
  {
    "id": "NAG-B10-003",
    "targetPopulation": "Paediatric",
    "categoryCode": "B10",
    "categoryTitle": "B10 : Respiratory Infections",
    "topic": "3. PERTUSSIS (WHOOPING COUGH)",
    "topicNumber": 3,
    "bodySystem": "Respiratory",
    "conditionName": "Pertussis (Whooping Cough / Batuk Kokol - Bordetella pertussis)",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Bordetella pertussis",
      "Bordetella parapertussis"
    ],
    "firstLineDrugs": [
      "azithromycin",
      "clarithromycin",
      "erythromycin"
    ],
    "firstLineTherapy": {
      "regimen": "Oral Azithromycin pada dos: Bayi <6 bulan: 10 mg/kg OD x 5 HARI; Bayi/Kanak-Kanak ≥6 bulan: 10 mg/kg OD pada Hari 1 (maks 500mg) diikuti 5 mg/kg OD pada Hari 2 hingga 5 (maks 250mg).",
      "routeAndDose": "Oral.",
      "durationDays": "5 days (Azithromycin)",
      "remarks": "Azithromycin adalah makrolida pilihan mutlak bagi semua peringkat umur termasuk neonat dan bayi muda <1 bulan kerana risiko stenosis pilorus (IHPS) yang lebih rendah berbanding Erythromycin."
    },
    "secondLineDrugs": [
      "clarithromycin",
      "co-trimoxazole",
      "bactrim"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Clarithromycin 15 mg/kg/hari dibahagi BD (maks 1g/hari) x 7 HARI atau Oral Bactrim pada dos TMP 8 mg/kg/hari dibahagi BD x 14 HARI (HANYA untuk bayi berumur >2 bulan).",
      "routeAndDose": "Oral.",
      "durationDays": "7 days (Clarithromycin) / 14 days (Bactrim)",
      "remarks": "Co-Trimoxazole dikontraindikasikan pada bayi berumur <2 bulan kerana risiko kernicterus."
    },
    "pediatricWeightDoseHint": "Oral Azithromycin: <6 bulan = 10 mg/kg OD x 5 hari; ≥6 bulan = 10 mg/kg OD hari 1 kemudian 5 mg/kg OD hari 2-5.",
    "maxDailyDose": "Azithromycin: maks 500mg/hari (hari 1), maks 250mg/hari (hari 2-5)",
    "amsNotes": [
      "PROFILAKSIS KONTAK SERUMAH: Semua ahli keluarga serumah dan kontak rapat bayi (tanpa mengira status vaksinasi) WAJIB diberikan profilaksis Azithromycin 5 hari untuk memutuskan rantaian penularan.",
      "Bayi muda <3 bulan dengan batuk kokol berisiko tinggi mengalami apnea teruk, ensefalopati, dan hipertensi pulmonari malignan (hiperleukositosis >50,000/mcL); rawat di wad HDW/PICU."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / CDC Pertussis Guidelines / AAP Red Book)"
  },
  {
    "id": "NAG-B11-001",
    "targetPopulation": "Paediatric",
    "categoryCode": "B11",
    "categoryTitle": "B11 : Skin & Soft Tissue Infections",
    "topic": "1. IMPETIGO (CONTAGIOSA & BULLOUS)",
    "topicNumber": 1,
    "bodySystem": "Skin & Soft Tissue",
    "conditionName": "Paediatric Impetigo Contagiosa & Bullous Impetigo",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Staphylococcus aureus (MSSA & Exfoliative toxin producers)",
      "Streptococcus pyogenes (Group A Strep)"
    ],
    "firstLineDrugs": [
      "fusidic acid",
      "mupirocin",
      "cephalexin",
      "cloxacillin"
    ],
    "firstLineTherapy": {
      "regimen": "Impetigo Terhad / Sedikit Lesi: Salap Mupirocin 2% atau Krim Asid Fusidik 2% sapu TDS x 5-7 hari selepas membersihkan keruping madu dengan air suam. Impetigo Meluas / Berlepuh (Bullous Impetigo) / Disertai Demam: Oral Cephalexin 25-50 mg/kg/hari dibahagi TDS-QID x 7 hari (atau Oral Cloxacillin 50 mg/kg/hari dibahagi Q6H).",
      "routeAndDose": "Topikal untuk lesi terhad; Oral untuk lesi meluas.",
      "durationDays": "5 - 7 days",
      "remarks": "Bullous Impetigo disebabkan oleh toksin eksfoliatif S. aureus yang memecahkan desmoglein-1 pada lapisan epidermis kulit."
    },
    "secondLineDrugs": [
      "amoxicillin/clavulanic acid",
      "augmentin",
      "co-trimoxazole",
      "bactrim"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Augmentin 30-45 mg/kg/hari dibahagi BD/TDS x 7 hari atau Oral Bactrim (TMP 8 mg/kg/hari dibahagi BD x 5-7 hari).",
      "routeAndDose": "Oral.",
      "durationDays": "5 - 7 days",
      "remarks": "Untuk kes rintangan atau disyaki CA-MRSA."
    },
    "allergyDrugs": [
      "erythromycin",
      "azithromycin",
      "clindamycin"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Azithromycin 10 mg/kg OD (hari 1) kemudian 5 mg/kg OD (hari 2-5) atau Oral Clindamycin 20 mg/kg/hari dibahagi TDS x 7 hari",
      "routeAndDose": "Oral.",
      "remarks": "Sesuai untuk pesakit alahan penisilin."
    },
    "pediatricWeightDoseHint": "Oral Cephalexin: 12.5-25 mg/kg/dos TDS (maks 500mg TDS). Oral Cloxacillin: 12.5 mg/kg/dos Q6H (1 jam sebelum makan).",
    "maxDailyDose": "Cephalexin: maks 2g/hari; Cloxacillin: maks 2g/hari",
    "amsNotes": [
      "Potong kuku kanak-kanak pendek dan nasihatkan agar tidak menggaru luka bagi mengelakkan inokulasi sekunder (autoinoculation) ke bahagian badan lain.",
      "Kanak-kanak tidak boleh ke sekolah/tuisyen sehingga 24-48 jam selepas rawatan antibiotik bermula."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / AAP Guidelines for Paediatric SSTI)"
  },
  {
    "id": "NAG-B11-002",
    "targetPopulation": "Paediatric",
    "categoryCode": "B11",
    "categoryTitle": "B11 : Skin & Soft Tissue Infections",
    "topic": "2. STAPHYLOCOCCAL SCALDED SKIN SYNDROME (SSSS)",
    "topicNumber": 2,
    "bodySystem": "Skin & Soft Tissue",
    "conditionName": "Staphylococcal Scalded Skin Syndrome (SSSS / Ritter's Disease)",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Staphylococcus aureus (Eksotoksin Exfoliatin A & B)"
    ],
    "firstLineDrugs": [
      "cloxacillin",
      "cefazolin",
      "vancomycin",
      "clindamycin"
    ],
    "firstLineTherapy": {
      "regimen": "IV Cloxacillin 150 - 200 mg/kg/hari dibahagi Q6H (or IV Cefazolin 100 mg/kg/hari dibahagi Q8H) + IV Clindamycin 30-40 mg/kg/hari dibahagi Q8H (UNTUK MERENCAT PENGHASILAN TOKSIN EKSFOLIATIF) + PENJAGAAN KULIT HALUS & RESUSITASI CECAIR IV.",
      "routeAndDose": "IV parenteral dos tinggi.",
      "durationDays": "7 - 10 days total (tukar ke oral Cloxacillin/Cephalexin selepas kulit mula kering semula)",
      "remarks": "Tanda Nikolsky Positif (lapisan kulit atas mengelupas dengan geseran lembut menyerupai kulit melecur air panas); punca fokus bakteria biasanya di nasofarinks, konjunktiva, atau umbilikus (bukan pada lepuhan kulit itu sendiri)."
    },
    "secondLineDrugs": [
      "vancomycin",
      "clindamycin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Vancomycin 60 mg/kg/hari dibahagi Q6H + IV Clindamycin 40 mg/kg/hari dibahagi Q8H",
      "routeAndDose": "IV.",
      "durationDays": "7 - 10 days",
      "remarks": "Untuk kes yang disyaki berkaitan MRSA penghasil eksotoksin."
    },
    "pediatricWeightDoseHint": "IV Cloxacillin: 35-50 mg/kg/dos Q6H (maks 2g Q6H). IV Clindamycin: 10-13 mg/kg/dos Q8H (maks 600mg Q8H).",
    "maxDailyDose": "Cloxacillin: maks 8g/hari; Clindamycin: maks 1.8g/hari",
    "amsNotes": [
      "PENJAGAAN KULIT KRITIKAL: Elakkan memakai pita pelekat (tape) pada kulit, rawat pesakit di atas cadar steril licin, sapu pelembap parafin lembut (liquid paraffin/white soft paraffin), dan kekalkan suhu bilik hangat.",
      "Cecair lepuhan bullae adalah STERIL (toksin bawaan darah); kultur perlu diambil dari mata, hidung, tekak, atau umbilikus."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / British Association of Dermatologists SSSS Guidelines)"
  },
  {
    "id": "NAG-B11-003",
    "targetPopulation": "Paediatric",
    "categoryCode": "B11",
    "categoryTitle": "B11 : Skin & Soft Tissue Infections",
    "topic": "3. PAEDIATRIC CELLULITIS & ERYSIPELAS",
    "topicNumber": 3,
    "bodySystem": "Skin & Soft Tissue",
    "conditionName": "Paediatric Non-Purulent Cellulitis & Erysipelas",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Streptococcus pyogenes (Group A Strep)",
      "Staphylococcus aureus (MSSA)",
      "Streptococcus pneumoniae (Selulitis pipi/muka buccal cellulitis)",
      "Haemophilus influenzae"
    ],
    "firstLineDrugs": [
      "cloxacillin",
      "cefazolin",
      "cephalexin",
      "amoxicillin/clavulanic acid",
      "augmentin"
    ],
    "firstLineTherapy": {
      "regimen": "Selulitis Sederhana Dimasukkan ke Wad: IV Cloxacillin 100-150 mg/kg/hari dibahagi Q6H (or IV Cefazolin 50-100 mg/kg/hari dibahagi Q8H) bertukar kepada Oral Cephalexin 50-75 mg/kg/hari dibahagi TDS-QID x 5-7 HARI JUMLAH.",
      "routeAndDose": "IV bertukar ke Oral.",
      "durationDays": "5 - 7 days",
      "remarks": "Tandakan sempadan bengkak kemerahan dengan pen pada kulit untuk memantau pemulihan."
    },
    "secondLineDrugs": [
      "clindamycin",
      "ceftriaxone",
      "vancomycin"
    ],
    "secondLineTherapy": {
      "regimen": "IV Clindamycin 30-40 mg/kg/hari dibahagi Q8H atau IV Ceftriaxone 50-75 mg/kg OD (or IV Vancomycin 60 mg/kg/hari jika toksik).",
      "routeAndDose": "IV.",
      "durationDays": "5 - 7 days",
      "remarks": "Bagi kes selulitis muka (facial cellulitis) atau disyaki MRSA."
    },
    "pediatricWeightDoseHint": "IV Cloxacillin: 25-37.5 mg/kg/dos Q6H. Oral Cephalexin: 15-25 mg/kg/dos TDS. IV Cefazolin: 25 mg/kg/dos Q8H.",
    "maxDailyDose": "Cloxacillin: maks 6g/hari; Cephalexin: maks 2g/hari",
    "amsNotes": [
      "Tinggikan anggota yang bengkak dan pastikan pesakit mendapat rehat yang mencukupi.",
      "Periksa untuk mengesan gigitan serangga atau calar luka terdahulu sebagai pintu masuk kuman."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IDSA SSTI Guidelines)"
  },
  {
    "id": "NAG-B12-001",
    "targetPopulation": "Paediatric",
    "categoryCode": "B12",
    "categoryTitle": "B12 : Tropical Infections",
    "topic": "1. PAEDIATRIC LEPTOSPIROSIS",
    "topicNumber": 1,
    "bodySystem": "Tropical Infections",
    "conditionName": "Paediatric Leptospirosis - Mild vs Severe Pulmonary / Renal Form",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Leptospira interrogans"
    ],
    "firstLineDrugs": [
      "amoxicillin",
      "benzylpenicillin",
      "ceftriaxone",
      "azithromycin",
      "doxycycline"
    ],
    "firstLineTherapy": {
      "regimen": "Leptospirosis Ringan (Pesakit Luar): Oral Amoxicillin 50 mg/kg/hari dibahagi TDS x 7 hari (atau Oral Azithromycin 10 mg/kg OD x 3-5 hari; Oral Doxycycline 4 mg/kg/hari dibahagi BD x 7 hari bagi umur ≥8 tahun). Leptospirosis Teruk (Dimasukkan ke Wad): IV Benzylpenicillin 200,000 - 400,000 U/kg/hari dibahagi Q6H (or IV Ceftriaxone 80-100 mg/kg OD) x 7 HARI.",
      "routeAndDose": "Oral untuk ringan; IV parenteral untuk teruk.",
      "durationDays": "7 days",
      "remarks": "Mulakan rawatan secepat mungkin sekiranya terdapat riwayat bermain di air sungai/berkelah atau pendedahan banjir."
    },
    "secondLineDrugs": [
      "ceftriaxone",
      "cefotaxime"
    ],
    "secondLineTherapy": {
      "regimen": "IV Ceftriaxone 80-100 mg/kg OD atau IV Cefotaxime 150 mg/kg/hari dibahagi Q6H-Q8H x 7 hari.",
      "routeAndDose": "IV.",
      "durationDays": "7 days",
      "remarks": "Pilihan yang sangat mudah dan berkesan tinggi."
    },
    "pediatricWeightDoseHint": "Oral Amoxicillin: 15-20 mg/kg/dos TDS (maks 500mg TDS). IV Ceftriaxone: 80 mg/kg OD (maks 2g OD). IV Benzylpenicillin: 50,000-100,000 U/kg/dos Q6H.",
    "maxDailyDose": "Amoxicillin: maks 1.5g/hari; Ceftriaxone: maks 2g/hari",
    "amsNotes": [
      "Pantau tanda-tanda pendarahan pulmonari dan kegagalan renal akut dengan teliti.",
      "Kultur darah dan ujian serologi MAT / PCR Leptospira wajib dihantar."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / WHO Leptospirosis Guidelines)"
  },
  {
    "id": "NAG-B12-002",
    "targetPopulation": "Paediatric",
    "categoryCode": "B12",
    "categoryTitle": "B12 : Tropical Infections",
    "topic": "2. PAEDIATRIC MELIOIDOSIS",
    "topicNumber": 2,
    "bodySystem": "Tropical Infections",
    "conditionName": "Paediatric Melioidosis (Burkholderia pseudomallei - Suppurative Parotitis & Sepsis)",
    "setting": "ICU / Severe",
    "primaryPathogens": [
      "Burkholderia pseudomallei"
    ],
    "firstLineDrugs": [
      "ceftazidime",
      "meropenem",
      "co-trimoxazole",
      "bactrim",
      "folic acid"
    ],
    "firstLineTherapy": {
      "regimen": "FASA INTENSIF AKUT (Minimum 14 - 21 Hari): IV Ceftazidime 50 mg/kg/dos Q8H infusi 3 jam (or IV Meropenem 25-40 mg/kg/dos Q8H jika septik syok/ICU). FASA ERADIKASI ORAL (3 hingga 6 BULAN): Oral Co-Trimoxazole (Bactrim) pada dos TMP 8 - 12 mg/kg/hari dibahagi BD + Oral Asid Folik 2.5-5 mg OD.",
      "routeAndDose": "IV infusi fasa akut diikuti Terapi Oral Berpanjangan.",
      "durationDays": "Fasa Intensif: Min 14 hari; Fasa Pembasmian: 3 hingga 6 BULAN",
      "remarks": "Pada kanak-kanak di Malaysia dan Asia Tenggara, Melioidosis kerap bermanifestasi sebagai Parotitis Bernanah Akut (Suppurative Parotitis); penyaliran nanah parotid dan rawatan penuh adalah wajib."
    },
    "secondLineDrugs": [
      "meropenem",
      "amoxicillin/clavulanic acid",
      "augmentin"
    ],
    "secondLineTherapy": {
      "regimen": "Fasa Pembasmian Alternatif: Oral Augmentin 45-60 mg/kg/hari dibahagi TDS x 3-6 bulan jika alahan Bactrim.",
      "routeAndDose": "Oral.",
      "durationDays": "3 - 6 months",
      "remarks": "Pilihan kedua jika intoleransi Bactrim."
    },
    "pediatricWeightDoseHint": "IV Ceftazidime: 50 mg/kg/dos Q8H (maks 2g Q8H). Oral Bactrim (Eradikasi): komponen TMP 4-6 mg/kg/dos BD + Folic acid 2.5-5mg OD.",
    "maxDailyDose": "Ceftazidime: maks 6g/hari; Bactrim: TMP 12 mg/kg/hari",
    "amsNotes": [
      "Kepatuhan ibu bapa terhadap jadual ubat Bactrim selama 3-6 bulan adalah penentu utama mengelakkan maut akibat relaps.",
      "Pantau FBC dan fungsi hepar setiap bulan semasa fasa pembasmian."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / Darwin Paediatric Melioidosis Protocol)"
  },
  {
    "id": "NAG-B12-003",
    "targetPopulation": "Paediatric",
    "categoryCode": "B12",
    "categoryTitle": "B12 : Tropical Infections",
    "topic": "3. ENTERIC / TYPHOID FEVER IN CHILDREN",
    "topicNumber": 3,
    "bodySystem": "Tropical Infections",
    "conditionName": "Paediatric Enteric / Typhoid Fever (Demam Kepialu Kanak-Kanak)",
    "setting": "Community-Acquired",
    "primaryPathogens": [
      "Salmonella enterica serovar Typhi & Paratyphi"
    ],
    "firstLineDrugs": [
      "ceftriaxone",
      "azithromycin",
      "cefotaxime"
    ],
    "firstLineTherapy": {
      "regimen": "Demam Tifoid Ringan (Pesakit Luar): Oral Azithromycin 10 - 20 mg/kg OD x 7 hari. Demam Tifoid Sederhana/Teruk (Dimasukkan Wad): IV Ceftriaxone 75 - 100 mg/kg OD x 7-10 hari (or IV Cefotaxime 150 mg/kg/hari dibahagi Q6H-Q8H).",
      "routeAndDose": "Oral / IV.",
      "durationDays": "7 days (Azithromycin) / 7 - 10 days (Ceftriaxone)",
      "remarks": "Azithromycin menghasilkan kadar kesembuhan klinikal yang sangat baik dan mengurangkan kadar pembawa kronik (chronic carriage rate) pada kanak-kanak."
    },
    "secondLineDrugs": [
      "ciprofloxacin",
      "meropenem"
    ],
    "secondLineTherapy": {
      "regimen": "Oral/IV Ciprofloxacin 15 mg/kg/dos BD x 7-10 hari atau IV Meropenem 20 mg/kg/dos Q8H (untuk strain Salmonella XDR).",
      "routeAndDose": "Oral / IV.",
      "durationDays": "7 - 10 days",
      "remarks": "Bagi isolat resistan berbilang ubat."
    },
    "pediatricWeightDoseHint": "Oral Azithromycin: 10-20 mg/kg OD (maks 1g OD) x 7 hari. IV Ceftriaxone: 75-100 mg/kg OD (maks 2g OD).",
    "maxDailyDose": "Azithromycin: maks 1g/hari; Ceftriaxone: maks 2g/hari",
    "amsNotes": [
      "Notifikasi kes kepialu kepada Pejabat Kesihatan Daerah dalam masa 24 jam adalah wajib di sisi undang-undang.",
      "Saring pengendali makanan di rumah dan lakukan kultur najis susulan sebelum kembali ke sekolah."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / WHO Typhoid Guidelines for Children)"
  },
  {
    "id": "NAG-B12-004",
    "targetPopulation": "Paediatric",
    "categoryCode": "B12",
    "categoryTitle": "B12 : Tropical Infections",
    "topic": "4. PAEDIATRIC MALARIA",
    "topicNumber": 4,
    "bodySystem": "Tropical Infections",
    "conditionName": "Paediatric Malaria - Uncomplicated vs Severe Malaria (P. knowlesi & P. falciparum)",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Plasmodium knowlesi",
      "Plasmodium falciparum",
      "Plasmodium vivax & Plasmodium malariae"
    ],
    "firstLineDrugs": [
      "artemether/lumefantrine",
      "artesunate",
      "primaquine"
    ],
    "firstLineTherapy": {
      "regimen": "Malaria Tidak Kompleks: Oral Artemether-Lumefantrine (Riamet 20/120mg) mengikut jalur berat badan pada jam 0, 8, 24, 36, 48, 60 (Jumlah 6 dos selama 3 hari) DIBERIKAN BERSAMA SUSU: (Berat 5-14kg: 1 tab/dos; 15-24kg: 2 tabs/dos; 25-34kg: 3 tabs/dos; ≥35kg: 4 tabs/dos) + Oral Primaquine (0.25 mg/kg stat untuk P. falciparum; ATAU 0.5 mg/kg OD x 14 hari untuk P. vivax/ovale jika G6PD normal). Malaria Pediatrik Teruk: IV Artesunate (Berat <20kg: 3.0 mg/kg/dos; Berat ≥20kg: 2.4 mg/kg/dos) pada jam 0, 12, 24 kemudian OD sehingga toleran oral.",
      "routeAndDose": "Oral bersama susu / IV bolus perlahan.",
      "durationDays": "3 days (Riamet) / Minimum 24 jam (IV Artesunate) / 14 days (Primaquine vivax)",
      "remarks": "DOS TINGGI IV ARTESUNATE PADA KANAK-KANAK <20kg (3.0 mg/kg/dos) adalah disyorkan oleh WHO kerana isipadu pengedaran (volume of distribution) ubat yang lebih besar pada kanak-kanak kecil."
    },
    "secondLineDrugs": [
      "dihydroartemisinin/piperaquine",
      "quinine"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Dihydroartemisinin-Piperaquine (DHA-PPQ) x 3 hari atau IV Quinine Dihydrochloride loading 20 mg/kg infusi 4 jam kemudian 10 mg/kg Q8H + Oral Clindamycin 10 mg/kg BD x 7 hari.",
      "routeAndDose": "Oral / IV infusi.",
      "durationDays": "3 - 7 days",
      "remarks": "Quinine memerlukan pemantauan ketat paras glukosa darah (risiko hipoglisemia teruk pada kanak-kanak)."
    },
    "pediatricWeightDoseHint": "Oral Riamet: 5-14kg = 1 tab BD x 3d; 15-24kg = 2 tabs BD x 3d; 25-34kg = 3 tabs BD x 3d; ≥35kg = 4 tabs BD x 3d. IV Artesunate: <20kg berikan 3.0 mg/kg/dos; ≥20kg berikan 2.4 mg/kg/dos.",
    "maxDailyDose": "Riamet: mengikut jalur berat badan; Artesunate: dos berat badan pediatrik",
    "amsNotes": [
      "Ujian Filem Darah Tebal & Nipis (BFMP) wajib diulang setiap 12-24 jam sehingga paras parasit darah sifar (negative clearance).",
      "Periksa status G6PD sebelum memberikan Primaquine 14 hari."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / WHO Malaria Guidelines 2023)"
  },
  {
    "id": "NAG-B13-001",
    "targetPopulation": "Paediatric",
    "categoryCode": "B13",
    "categoryTitle": "B13 : Urinary Tract Infections",
    "topic": "1. PAEDIATRIC LOWER UTI / CYSTITIS",
    "topicNumber": 1,
    "bodySystem": "Urinary",
    "conditionName": "Paediatric Lower Urinary Tract Infection (Acute Cystitis / Sistitis Pediatrik)",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Escherichia coli (UPEC - 80-85%)",
      "Klebsiella pneumoniae",
      "Proteus mirabilis (terutamanya kanak-kanak lelaki)",
      "Enterococcus faecalis",
      "Staphylococcus saprophyticus"
    ],
    "firstLineDrugs": [
      "cephalexin",
      "amoxicillin/clavulanic acid",
      "augmentin",
      "nitrofurantoin"
    ],
    "firstLineTherapy": {
      "regimen": "Oral Cephalexin 50 mg/kg/hari dibahagi TDS x 5-7 hari (or Oral Augmentin 30-45 mg/kg/hari dibahagi BD/TDS x 5-7 hari; Oral Nitrofurantoin 3-5 mg/kg/hari dibahagi QID x 5-7 hari HANYA untuk kanak-kanak umur >3 bulan).",
      "routeAndDose": "Oral.",
      "durationDays": "5 - 7 days",
      "remarks": "Kultur Urin (Urine C&S) melalui kaedah pancutan bersih (Clean-Catch) atau kateterisasi pundi kencing adalah WAJIB diambil sebelum antibiotik pada kanak-kanak."
    },
    "secondLineDrugs": [
      "cefuroxime",
      "co-trimoxazole",
      "bactrim"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Cefuroxime Axetil 20-30 mg/kg/hari dibahagi BD x 5-7 hari atau Oral Bactrim (TMP 6-8 mg/kg/hari dibahagi BD x 5 hari jika umur >2 bulan).",
      "routeAndDose": "Oral.",
      "durationDays": "5 - 7 days",
      "remarks": "Alternatif mengikut laporan sensitiviti mikrobiologi."
    },
    "allergyDrugs": [
      "co-trimoxazole",
      "bactrim",
      "nitrofurantoin",
      "ciprofloxacin"
    ],
    "penicillinAllergyOption": {
      "regimen": "Oral Bactrim (TMP 6-8 mg/kg/hari BD) atau Oral Nitrofurantoin 3-5 mg/kg/hari dibahagi QID (jika eGFR >30 mL/min dan tiada pielonefritis)",
      "routeAndDose": "Oral.",
      "remarks": "Sesuai untuk pesakit alahan penisilin."
    },
    "pediatricWeightDoseHint": "Oral Cephalexin: 15-20 mg/kg/dos TDS (maks 500mg TDS). Oral Augmentin: 15-20 mg/kg/dos BD/TDS (maks 625mg BD).",
    "maxDailyDose": "Cephalexin: maks 2g/hari; Augmentin: maks 1.5g/hari",
    "amsNotes": [
      "JANGAN kumpul sampel urin menggunakan beg tampal urin (Urine Bag) untuk tujuan kultur kerana kadar pencemaran palsu (false positive) melebihi 50-70%.",
      "Lakukan Ultrasound KUB untuk semua bayi/kanak-kanak lelaki selepas episod UTI pertama."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / AAP Clinical Practice Guideline for Paediatric UTI)"
  },
  {
    "id": "NAG-B13-002",
    "targetPopulation": "Paediatric",
    "categoryCode": "B13",
    "categoryTitle": "B13 : Urinary Tract Infections",
    "topic": "2. PAEDIATRIC FEBRILE PYELONEPHRITIS",
    "topicNumber": 2,
    "bodySystem": "Urinary",
    "conditionName": "Paediatric Acute Febrile Pyelonephritis (Pielonefritis Berdemam Kanak-Kanak)",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Escherichia coli (termasuk strain ESBL)",
      "Klebsiella pneumoniae",
      "Enterobacterales & Pseudomonas aeruginosa",
      "Enterococcus faecalis"
    ],
    "firstLineDrugs": [
      "cefotaxime",
      "ceftriaxone",
      "gentamicin",
      "amoxicillin/clavulanic acid",
      "augmentin"
    ],
    "firstLineTherapy": {
      "regimen": "IV Cefotaxime 150 mg/kg/hari dibahagi Q6H-Q8H (or IV Ceftriaxone 75 mg/kg OD / IV Gentamicin 5-7.5 mg/kg OD) selama 2-4 hari pertama sehingga afebril, diikuti pertukaran kepada Oral Cephalexin 50-100 mg/kg/hari atau Oral Augmentin 45-60 mg/kg/hari melengkapkan 7 HINGGA 10 HARI JUMLAH.",
      "routeAndDose": "IV bertukar cepat ke Oral.",
      "durationDays": "7 - 10 days total (Kajian klinikal membuktikan 7-10 hari sama berkesan dengan 14 hari dan mengurangkan parut ginjal)",
      "remarks": "Semua bayi berumur <3 bulan dengan demam dan UTI WAJIB dimasukkan ke wad untuk rawatan antibiotik parenteral."
    },
    "secondLineDrugs": [
      "piperacillin/tazobactam",
      "tazocin",
      "amikacin",
      "meropenem"
    ],
    "secondLineTherapy": {
      "regimen": "IV Tazocin 80-100 mg/kg/dos Q8H atau IV Amikacin 15 mg/kg OD (or IV Meropenem 20 mg/kg/dos Q8H untuk kuman ESBL).",
      "routeAndDose": "IV.",
      "durationDays": "7 - 10 days",
      "remarks": "Untuk kes sepsis urologi atau jangkitan berulang dengan anatomi saluran kencing abnormal."
    },
    "stepDownDrugs": [
      "cephalexin",
      "amoxicillin/clavulanic acid",
      "augmentin",
      "cefuroxime"
    ],
    "oralStepDownOption": {
      "regimen": "Oral Cephalexin 50-75 mg/kg/hari dibahagi TDS atau Oral Augmentin 45 mg/kg/hari dibahagi TDS.",
      "criteria": "Kanak-kanak afebril >24-48 jam, tiada muntah, toleransi cecair oral baik, keputusan kultur urin menunjukkan sensitiviti."
    },
    "pediatricWeightDoseHint": "IV Cefotaxime: 50 mg/kg/dos Q8H (maks 2g Q8H). IV Ceftriaxone: 50-75 mg/kg OD (maks 2g OD). IV Gentamicin: 5-7.5 mg/kg OD (maks 300mg OD).",
    "maxDailyDose": "Cefotaxime: maks 6g/hari; Ceftriaxone: maks 2g/hari",
    "amsNotes": [
      "IMBASAN ULTRASOUND GINJAL & PUNDI KENCING (USG KUB) WAJIB DIBUAT dalam masa 24-48 jam pada kes teruk atau sebelum keluar wad untuk mengesan hidronefrosis atau abses renal.",
      "Pertimbangkan Micturating Cystourethrogram (MCUG) dan DMSA Renal Scan bagi mengesan Vesicoureteral Reflux (VUR) dan parut parenkima ginjal."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / NICE & AAP Paediatric UTI Guidelines)"
  },
  {
    "id": "NAG-B13-003",
    "targetPopulation": "Paediatric",
    "categoryCode": "B13",
    "categoryTitle": "B13 : Urinary Tract Infections",
    "topic": "3. VESICOURETERAL REFLUX (VUR) UTI PROPHYLAXIS",
    "topicNumber": 3,
    "bodySystem": "Urinary",
    "conditionName": "Vesicoureteral Reflux (VUR) & Recurrent Paediatric UTI Chemoprophylaxis",
    "setting": "Outpatient (OPD/KK)",
    "primaryPathogens": [
      "Escherichia coli",
      "Klebsiella pneumoniae",
      "Proteus mirabilis"
    ],
    "firstLineDrugs": [
      "nitrofurantoin",
      "cephalexin",
      "co-trimoxazole",
      "bactrim"
    ],
    "firstLineTherapy": {
      "regimen": "Profilaksis Dos Rendah Waktu Malam (Nightly Low-Dose Chemoprophylaxis): Oral Nitrofurantoin 1 - 2 mg/kg ON (waktu tidur) bagi umur >3 bulan ATAU Oral Cephalexin 10 - 15 mg/kg ON waktu tidur (pilihan selamat untuk bayi umur <3 bulan) ATAU Oral Bactrim (TMP 2 mg/kg ON waktu tidur bagi umur >2 bulan).",
      "routeAndDose": "Oral dos tunggal setiap malam sebelum tidur.",
      "durationDays": "Berdasarkan penilaian gred VUR (biasanya 6 hingga 12 bulan sehingga resolusi VUR atau pembedahan)",
      "remarks": "Diindikasikan untuk: VUR Gred III-V, VUR dengan parut renal pada DMSA scan, atau UTI berulang yang kerap (>3 episod setahun)."
    },
    "secondLineDrugs": [
      "cephalexin",
      "amoxicillin/clavulanic acid",
      "augmentin"
    ],
    "secondLineTherapy": {
      "regimen": "Oral Cephalexin 10-15 mg/kg ON atau Oral Augmentin 10-15 mg/kg ON waktu tidur",
      "routeAndDose": "Oral dos malam.",
      "durationDays": "6 - 12 months",
      "remarks": "Pilihan profilaksis sekunder mengikut keputusan kultur urin terdahulu."
    },
    "pediatricWeightDoseHint": "Oral Nitrofurantoin (Profilaksis): 1-2 mg/kg dos tunggal malam ON. Oral Cephalexin (Profilaksis): 10-15 mg/kg dos tunggal malam ON. Oral Bactrim (Profilaksis): TMP 2 mg/kg ON.",
    "maxDailyDose": "Nitrofurantoin: maks 100mg ON; Cephalexin: maks 500mg ON",
    "amsNotes": [
      "Nilai semula keperluan profilaksis setiap 6-12 bulan; VUR Gred I-II yang tidak bergejala sering kali tidak memerlukan profilaksis berpanjangan.",
      "Ajar ibu bapa teknik pembersihan lampin yang betul dari depan ke belakang dan galakkan pengambilan air kosong secukupnya."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / EAU-ESPU Paediatric Urology Guidelines)"
  },
  {
    "id": "NAG-B14-001",
    "targetPopulation": "Paediatric",
    "categoryCode": "B14",
    "categoryTitle": "B14 : Vascular Infections",
    "topic": "1. PAEDIATRIC CRBSI & CENTRAL LINE INFECTIONS",
    "topicNumber": 1,
    "bodySystem": "Cardiovascular / Sepsis",
    "conditionName": "Paediatric Catheter-Related Bloodstream Infection (CRBSI) & Port-A-Cath Sepsis",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Coagulase-Negative Staphylococci (S. epidermidis)",
      "Staphylococcus aureus (MSSA & MRSA)",
      "Candida albicans & Non-albicans Candida",
      "Pseudomonas aeruginosa & Klebsiella pneumoniae"
    ],
    "firstLineDrugs": [
      "vancomycin",
      "cefepime",
      "piperacillin/tazobactam",
      "tazocin",
      "cefotaxime",
      "amikacin"
    ],
    "firstLineTherapy": {
      "regimen": "IV Vancomycin 60 mg/kg/hari dibahagi Q6H (trough 15-20 mcg/mL) + IV Cefepime 50 mg/kg/dos Q8H (or IV Tazocin 80-100 mg/kg/dos Q6H-Q8H / IV Cefotaxime 150 mg/kg/hari).",
      "routeAndDose": "IV infusi berterusan/berkala dengan pemantauan TDM.",
      "durationDays": "7 - 14 days (panjangkan ke 4-6 minggu jika ada bakteremia S. aureus berterusan / endokarditis)",
      "remarks": "CABUT TALIAN SEGERA (CATHETER REMOVAL) sekiranya organisma adalah S. aureus, Candida spp., Pseudomonas, atau terdapat syok septik / infeksi terowong bernanah."
    },
    "secondLineDrugs": [
      "meropenem",
      "vancomycin",
      "caspofungin",
      "fluconazole"
    ],
    "secondLineTherapy": {
      "regimen": "IV Meropenem 20-40 mg/kg/dos Q8H + IV Vancomycin 15 mg/kg/dos Q8H +/- IV Caspofungin 70 mg/m2 loading kemudian 50 mg/m2 OD",
      "routeAndDose": "IV ICU.",
      "durationDays": "10 - 14 days",
      "remarks": "Untuk sepsis berat di PICU dengan risiko kuman MDR atau jangkitan kulat talian."
    },
    "allergyDrugs": [
      "ciprofloxacin",
      "vancomycin",
      "amikacin"
    ],
    "penicillinAllergyOption": {
      "regimen": "IV Vancomycin 15 mg/kg/dos Q6H + IV Ciprofloxacin 10-15 mg/kg/dos Q12H + IV Amikacin 15 mg/kg OD",
      "routeAndDose": "IV.",
      "remarks": "Bebas beta-laktam."
    },
    "pediatricWeightDoseHint": "IV Vancomycin: 15 mg/kg/dos Q6H (trough 15-20 mcg/mL). IV Cefepime: 50 mg/kg/dos Q8H (maks 2g Q8H). IV Tazocin: 80-100 mg/kg/dos Q6H.",
    "maxDailyDose": "Vancomycin: maks 2g/hari; Cefepime: maks 6g/hari; Tazocin: maks 18g/hari",
    "amsNotes": [
      "Ambil Kultur Darah Berpasangan (Paired Blood Cultures): satu set dari lumen talian pusat dan satu set dari vena periferi dengan catatan DTP (Differential Time to Positivity >2 jam mengesahkan punca talian).",
      "Hantar hujung kateter (catheter tip 5cm) untuk kultur semi-kuantitatif Maki roll-plate jika talian dicabut."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / IDSA CRBSI Guidelines)"
  },
  {
    "id": "NAG-B14-002",
    "targetPopulation": "Neonatal",
    "categoryCode": "B14",
    "categoryTitle": "B14 : Vascular Infections",
    "topic": "2. UMBILICAL VENOUS / ARTERIAL CATHETER SEPSIS",
    "topicNumber": 2,
    "bodySystem": "Neonatal & Paediatric Syndromes",
    "conditionName": "Neonatal Umbilical Venous / Arterial Catheter Infection & Omphalitis",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Staphylococcus aureus (MSSA & MRSA)",
      "Coagulase-Negative Staphylococci (S. epidermidis)",
      "Klebsiella pneumoniae & Escherichia coli",
      "Streptococcus pyogenes",
      "Candida spp."
    ],
    "firstLineDrugs": [
      "cloxacillin",
      "amikacin",
      "gentamicin",
      "vancomycin",
      "cefotaxime"
    ],
    "firstLineTherapy": {
      "regimen": "Omfalitis / Jangkitan Talian Umbilikal Sederhana: IV Cloxacillin 100-200 mg/kg/hari dibahagi Q6H-Q8H + IV Gentamicin 4-5 mg/kg OD (atau IV Cefotaxime 100-150 mg/kg/hari). Sepsis Talian Kateter UVC/UAC di NICU: IV Vancomycin 15 mg/kg/dos Q8H-Q12H + IV Amikacin 15 mg/kg OD + CABUT KATETER UMBILIKAL DENGAN SEGERA.",
      "routeAndDose": "IV infusi perlahan dengan pemantauan TDM berkala.",
      "durationDays": "7 - 14 days",
      "remarks": "Kateter UVC/UAC yang dijangkiti mesti dicabut serta-merta untuk mengelakkan pembentukan trombus terinfeksi pada vena kava inferior atau arteri aorta."
    },
    "secondLineDrugs": [
      "meropenem",
      "vancomycin",
      "fluconazole"
    ],
    "secondLineTherapy": {
      "regimen": "IV Meropenem 20-40 mg/kg/dos Q8H + IV Vancomycin 15 mg/kg/dos Q8H (+/- IV Fluconazole jika kulat disyaki)",
      "routeAndDose": "IV.",
      "durationDays": "10 - 14 days",
      "remarks": "Untuk syok septik refraktori di NICU."
    },
    "pediatricWeightDoseHint": "IV Cloxacillin: 25-50 mg/kg/dos Q8H (<7 hari) atau Q6H (≥7 hari). IV Vancomycin: 15 mg/kg/dos Q12H (<29 minggu PMA) atau Q8H (≥30 minggu PMA).",
    "maxDailyDose": "Cloxacillin: maks 200 mg/kg/hari; Vancomycin: disasarkan kepada paras palung TDM",
    "amsNotes": [
      "Lakukan Ultrasound Doppler Abdomen untuk menolak Trombosis Vena Portal (Portal Vein Thrombosis) atau abses hepar sekunder akibat UVC.",
      "Kultur hujung kateter umbilikal wajib dihantar sebaik sahaja dicabut."
    ],
    "evidenceLevel": "Grade A (NAG 2024 / AAP Neonatal Catheter Infection Consensus)"
  },
  {
    "id": "NAG-B14-003",
    "targetPopulation": "Paediatric",
    "categoryCode": "B14",
    "categoryTitle": "B14 : Vascular Infections",
    "topic": "3. SUPPURATIVE THROMBOPHLEBITIS IN CHILDREN",
    "topicNumber": 3,
    "bodySystem": "Cardiovascular / Sepsis",
    "conditionName": "Paediatric Suppurative Thrombophlebitis & Lemierre's Syndrome",
    "setting": "Hospital-Acquired (HAP/VAP)",
    "primaryPathogens": [
      "Staphylococcus aureus (MSSA & MRSA)",
      "Fusobacterium necrophorum (Lemierre's syndrome / Tromboflebitis vena jugular)",
      "Streptococcus pyogenes",
      "Klebsiella pneumoniae & Enterobacterales"
    ],
    "firstLineDrugs": [
      "cloxacillin",
      "ceftriaxone",
      "metronidazole",
      "vancomycin",
      "cefotaxime"
    ],
    "firstLineTherapy": {
      "regimen": "Tromboflebitis Bernanah Kanula Periferi: CABUT KANULA SERTA-MERTA + IV Cloxacillin 150-200 mg/kg/hari dibahagi Q6H (or IV Cefazolin 100 mg/kg/hari) + IV Gentamicin 5-7.5 mg/kg OD. Sindrom Lemierre (Trombosis Vena Jugular Dalaman Pasca-Tonsilitis): IV Ceftriaxone 100 mg/kg OD (or IV Cefotaxime 150 mg/kg/hari) + IV Metronidazole 30 mg/kg/hari dibahagi Q8H (atau IV Co-Amoxiclav 30 mg/kg/dos TDS) x 3 HINGGA 6 MINGGU.",
      "routeAndDose": "IV parenteral dos tinggi berpanjangan.",
      "durationDays": "2 - 3 weeks (Kanula periferi) / 3 - 6 weeks (Sindrom Lemierre / Vena sentral)",
      "remarks": "Pencabutan kanula/talian yang bernanah dan penilaian antikoagulasi (Heparin) bersama Pakar Hematologi Pediatrik adalah komponen rawatan penting."
    },
    "secondLineDrugs": [
      "vancomycin",
      "piperacillin/tazobactam",
      "tazocin",
      "meropenem"
    ],
    "secondLineTherapy": {
      "regimen": "IV Vancomycin 60 mg/kg/hari dibahagi Q6H + IV Tazocin 80 mg/kg/dos Q6H (atau IV Meropenem 20 mg/kg/dos Q8H)",
      "routeAndDose": "IV.",
      "durationDays": "3 - 6 weeks",
      "remarks": "Untuk kes MRSA terbukti atau sepsis pembentukan abses paru-paru septik emboli."
    },
    "pediatricWeightDoseHint": "IV Cloxacillin: 35-50 mg/kg/dos Q6H (maks 2g Q6H). IV Ceftriaxone: 100 mg/kg OD (maks 2g OD). IV Metronidazole: 10 mg/kg/dos Q8H (maks 500mg Q8H).",
    "maxDailyDose": "Cloxacillin: maks 8g/hari; Ceftriaxone: maks 2g/hari; Metronidazole: maks 1.5g/hari",
    "amsNotes": [
      "Lakukan Ultrasound Doppler Vena (Venous Doppler USG) atau CT Angiografi Leher/Dada untuk memetakan kepanjangan trombus dan mengesan emboli septik pulmonari.",
      "Eksisi venotomi pembedahan (vein excision) dipertimbangkan jika nanah mengalir berterusan dari tapak venipuntur periferi walaupun dengan antibiotik."
    ],
    "evidenceLevel": "Grade B (NAG 2024 / ESPID Vascular Infection Guidelines)"
  }
]

/**
 * Normalizes a drug name to match tokens
 */
function normalizeDrugName(name: string): string[] {
  if (!name) return []
  const raw = name.toLowerCase().trim()
  const results = new Set<string>()
  results.add(raw)

  const parts = raw.split(/[\s\/+,]+/)
  parts.forEach(p => {
    if (p.length > 2) results.add(p)
  })

  if (raw.includes('augmentin') || raw.includes('amoxicillin/clavulanic') || raw.includes('amoxicillin and clavulanate') || raw.includes('co-amoxiclav')) {
    results.add('amoxicillin/clavulanic acid')
    results.add('co-amoxiclav')
    results.add('augmentin')
    results.add('amoxicillin')
  }
  if (raw.includes('unasyn') || raw.includes('ampicillin/sulbactam') || raw.includes('sultamicillin')) {
    results.add('ampicillin/sulbactam')
    results.add('unasyn')
    results.add('sultamicillin')
    results.add('ampicillin')
  }
  if (raw.includes('tazocin') || raw.includes('piperacillin/tazobactam')) {
    results.add('piperacillin/tazobactam')
    results.add('tazocin')
  }
  if (raw.includes('cotrimoxazole') || raw.includes('trimethoprim') || raw.includes('bactrim') || raw.includes('co-trimoxazole')) {
    results.add('cotrimoxazole')
    results.add('bactrim')
    results.add('trimethoprim/sulfamethoxazole')
  }

  return Array.from(results)
}

function matchesDrugList(drugTokens: string[], list?: string[]): boolean {
  if (!list || list.length === 0) return false
  for (const item of list) {
    const itemLower = item.toLowerCase().trim()
    for (const token of drugTokens) {
      if (token === itemLower) return true
      if (token.length > 3 && itemLower.length > 3) {
        if (itemLower.includes(token) || token.includes(itemLower)) return true
      }
    }
  }
  return false
}

export function getGuidelinesForDrug(genericName: string, _antimicrobialClass?: string): NAGInfectionGuideline[] {
  if (!genericName) return []
  const drugTokens = normalizeDrugName(genericName)

  return NAG_GUIDELINES.filter(guideline => {
    const isFirstLine = matchesDrugList(drugTokens, guideline.firstLineDrugs)
    const isSecondLine = matchesDrugList(drugTokens, guideline.secondLineDrugs)
    const isAllergy = matchesDrugList(drugTokens, guideline.allergyDrugs)
    const isStepDown = matchesDrugList(drugTokens, guideline.stepDownDrugs)
    const isAdjunct = matchesDrugList(drugTokens, guideline.adjunctDrugs)

    return isFirstLine || isSecondLine || isAllergy || isStepDown || isAdjunct
  })
}

export interface DrugGuidelineRoleInfo {
  role: DrugRoleInGuideline
  label: string
  badgeColor: string
  bgLight: string
  textColor: string
  borderColor: string
}

export function getDrugRolesInGuideline(genericName: string, guideline: NAGInfectionGuideline): DrugGuidelineRoleInfo[] {
  if (!genericName) return []
  const drugTokens = normalizeDrugName(genericName)
  const roles: DrugGuidelineRoleInfo[] = []

  if (matchesDrugList(drugTokens, guideline.firstLineDrugs)) {
    roles.push({
      role: 'FIRST_LINE',
      label: '★ Rawatan Barisan Pertama (1st-Line)',
      badgeColor: 'bg-emerald-600 text-white',
      bgLight: 'bg-emerald-50 text-emerald-900',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200'
    })
  }

  if (matchesDrugList(drugTokens, guideline.secondLineDrugs)) {
    roles.push({
      role: 'SECOND_LINE',
      label: 'Rawatan Barisan Kedua (2nd-Line / Alternatif)',
      badgeColor: 'bg-amber-600 text-white',
      bgLight: 'bg-amber-50 text-amber-900',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200'
    })
  }

  if (matchesDrugList(drugTokens, guideline.allergyDrugs)) {
    roles.push({
      role: 'PENICILLIN_ALLERGY',
      label: 'Pilihan Alahan Penisilin',
      badgeColor: 'bg-rose-600 text-white',
      bgLight: 'bg-rose-50 text-rose-900',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-200'
    })
  }

  if (matchesDrugList(drugTokens, guideline.stepDownDrugs)) {
    roles.push({
      role: 'STEP_DOWN',
      label: 'Protokol Penukaran Oral (Oral Step-Down)',
      badgeColor: 'bg-blue-600 text-white',
      bgLight: 'bg-blue-50 text-blue-900',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    })
  }

  if (matchesDrugList(drugTokens, guideline.adjunctDrugs)) {
    roles.push({
      role: 'ADJUNCT',
      label: 'Komponen Terapi Gabungan',
      badgeColor: 'bg-purple-600 text-white',
      bgLight: 'bg-purple-50 text-purple-900',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200'
    })
  }

  return roles
}
