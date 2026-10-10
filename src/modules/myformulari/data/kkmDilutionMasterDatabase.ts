/**
 * AUTHORITATIVE KKM INJECTABLE DILUTION & RECONSTITUTION MASTER DATABASE
 * Source:
 * 1. Ministry of Health Malaysia (KKM) Dilution Guide for Fluid Restricted Critically Ill Adults (April 2024 / Update Dec 2025)
 * 2. KKM Dilution Guideline for Injectable Drugs (Part 1 - Antimicrobial, Dec 2020)
 * 3. National Pharmaceutical Regulatory Agency (NPRA) Official Product Leaflets
 * 
 * STRICT CLINICAL INTEGRITY: NEVER RANDOMLY GENERATE OR ESTIMATE DATA.
 * ALL PARAMETERS DERIVED DIRECTLY FROM MINISTRY OF HEALTH MALAYSIA PUBLICATIONS.
 */

export interface KkmStabilityRow {
  phase: string
  fridge: string
  roomTemp: string
}

export interface KkmDilutionMonograph {
  id: string
  pageNumber?: number
  rawTitle: string
  genericName: string
  brandNames: string[]
  sourceGuideline: string
  brandText: string
  reconstitutionText: string
  isReconstitutionRequired: boolean
  suggestedMinimumDilutions: string
  diluentText: string
  compatibleDiluents?: string[]
  incompatibleDiluents?: string[]
  administrationText: string
  stabilityRows: KkmStabilityRow[]
  stabilityRaw: string
  comments: string[]
  references: string[]
}

export const KKM_DILUTION_MASTER_DATABASE: KkmDilutionMonograph[] = [
  {
    "id": "KKM-DIL-001",
    "pageNumber": 11,
    "rawTitle": "ACETYLCYSTEINE 5 G/25 ML",
    "genericName": "Acetylcysteine",
    "brandNames": [
      "Hidonac"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Hidonac",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Central: No further dilution required\nPeripheral: 150 mg/kg in 200 ml",
    "diluentText": "D5, NS",
    "administrationText": "I. IV infusion (Paracetamol poisoning – 3 bags regime, 21 hours):\n150 mg/kg in 200 ml over 15 minutes, followed by 50 mg/kg in 500 ml over 4 hours, then 100 mg/kg in 1000 ml over 16 hours\nII. IV infusion (Paracetamol poisoning – 2 bags regime, 20 hours):\n200mg/kg in 250 ml over 4 hours\n100mg/kg in 500 ml over 16 hours\nIII. IV infusion (Acute hepatic failure, non-paracetamol induced) [off-label dosage]:\n150 mg/kg/hr for 1 hour, followed by 12.5 mg/kg/hr for 4 hours, then 6.25 mg/kg/hr for 67 hours\nIV. IV infusion (Prophylaxis for radiographic contrast nephropathy) [off-label dosage]:\nDilute 600 – 1200 mg in 50 – 100 ml, infuse over 30 – 60 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 24 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Alfasigma S.p.A. N-Acetylcysteine (Hidonac) Product Leaflet. Revised 18 Jan 2016.",
      "2. Chiew AL et al. Summary statement: new guidelines for the management of",
      "paracetamol poisoning in Australia and New Zealand. Med J Aust. 2015 Sep",
      "7;203(5):215-8. doi: 10.5694/mja15.00614",
      "3. Lee WM, Hynan LS, Rossaro L, et al. Intravenous N-acetylcysteine improves",
      "transplant-free survival in early stage non-acetaminophen acute liver failure.",
      "Gastroenterology. 2009;137:856–864.e1.",
      "4. Sun Z, Fu Q, Cao L, Jin W, Cheng LL, Li Z. Intravenous N-acetylcysteine for",
      "prevention of contrast-induced nephropathy: A meta-analysis of randomized,",
      "controlled trials. PLoS ONE. 2013;8(1).",
      "5. Truven Health Analytics. Micromedex.",
      "6. United Kingdom Clinical Pharmacy Association. Minimum Infusion Volumes for",
      "Critically Ill Patients. 4th ed. December 2012.",
      "7. Wong A et al. Efficacy of two bag acetylcysteine regimen to treat paracetamol",
      "overdose (2NAC study). Lancet. 2020; 20"
    ]
  },
  {
    "id": "KKM-DIL-002",
    "pageNumber": 12,
    "rawTitle": "ACYCLOVIR 250 MG",
    "genericName": "Acyclovir",
    "brandNames": [
      "Vaxcel Acyclovir"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Vaxcel Acyclovir",
    "reconstitutionText": "Reconstitute 1 vial with 10 ml WFI or NS",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Maximum concentration of 5 mg/ml (250 mg in 50 ml)",
    "diluentText": "HS, NS",
    "administrationText": "IV infusion: Infuse over at least 1 hour",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "48 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 48 hours",
    "comments": [
      "Higher concentration (>10mg/ml) may produce phlebitis or inflammation",
      "at the injection site."
    ],
    "references": [
      "1. Kotra Pharma. Vaxcel Acyclovir 250mg Product Leaflet. Revised 2 April",
      "2019.",
      "2. Truven Health Analytics. Micromedex.",
      "3. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-003",
    "pageNumber": 13,
    "rawTitle": "ADENOSINE 6 MG/2 ML",
    "genericName": "Adenosine",
    "brandNames": [
      "Adenorythm"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Adenorythm",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus: Administer over 2 seconds",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Administer through a peripheral vein (using large bore cannula) only. Do",
      "not administer through central line (may cause prolonged asystole).",
      "If given into an IV line, it should be injected as proximally as possible,",
      "and followed by a rapid saline flush."
    ],
    "references": [
      "1. Truven Health Analytics. Micromedex.",
      "2. Vanex S. A. Adenorythm Solution for Injection 3 mg/ml Product Leaflet.",
      "Revised March 2016."
    ]
  },
  {
    "id": "KKM-DIL-004",
    "pageNumber": 14,
    "rawTitle": "ADRENALINE 1 MG/1 ML",
    "genericName": "Adrenaline (Epinephrine)",
    "brandNames": [
      "CCM Adrenaline"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "CCM Adrenaline",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "IM, SC, IV bolus\nNo further dilution required\nIV infusion\nPeripheral: Maximum concentration of 0.06 mg/ml (3 mg/50 ml)\nCentral: Maximum concentration of 0.12 mg/ml (6 mg/50 ml)",
    "diluentText": "D5, NS",
    "administrationText": "IM, SC\nIV bolus: Administer over at least 1 minute\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "After Dilution - 24 hours",
    "comments": [
      "Administration via central line is recommended.",
      "If administered peripherally (<24 hours), monitor IV site for blanching and",
      "extravasation."
    ],
    "references": [
      "1. Duopharma (M) Sdn. Bhd. Adrenaline (CCM Adrenaline) Product Leaflet.",
      "Revised 8 July 2011.",
      "2. Lexi-Comp Inc. Lexi-Drug©. Version 6.4.0.",
      "3. Truven Health Analytics. Micromedex.",
      "4. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-005",
    "pageNumber": 15,
    "rawTitle": "ALTEPLASE 50 MG",
    "genericName": "Alteplase (rt-PA)",
    "brandNames": [
      "Actilyse"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Actilyse",
    "reconstitutionText": "Reconstitute with 50 ml sterilized water (provided in package)",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "I. Myocardial infarction:\nAccelerated infusion (total 90 minutes) or 3 hours infusion regimen. Refer\nto institution protocol\nII. Acute ischemic stroke:\n0.9 mg/kg (not to exceed 90 mg total dose) infused over 60 minutes with 10% of the total dose administered as an initial intravenous bolus over 1 minute\nIII. Pulmonary embolism:\nIV infusion over 2 hours",
    "stabilityRows": [
      {
        "phase": "After Reconstitution",
        "fridge": "24 hours",
        "roomTemp": "8 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Reconstitution 24 hours 8 hours",
    "comments": [
      "The reconstituted solution may be further diluted with NS up to a minimal",
      "concentration of 0.2 mg/ml."
    ],
    "references": [
      "Revised 28 March 2020."
    ]
  },
  {
    "id": "KKM-DIL-006",
    "pageNumber": 16,
    "rawTitle": "AMIKACIN 500 MG/2 ML",
    "genericName": "Amikacin Sulphate",
    "brandNames": [
      "Apalin"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Apalin",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Required dose to be diluted up to 50 ml",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Infuse over 30 – 60 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "60 days",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 60 days 24 hours",
    "comments": [
      "Usual dilution 500 mg in 100 – 200 ml of diluent (Concentration of 2.5 –",
      "5 mg/ml)."
    ],
    "references": [
      "1. Duopharma (M) Sdn. Bhd. Apalin Product Leaflet. Revised 12 April 2019.",
      "2. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-007",
    "pageNumber": 17,
    "rawTitle": "AMINOPHYLLINE 250 MG/10 ML",
    "genericName": "Aminophylline",
    "brandNames": [
      "Aminophyllin IV Fresenius"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Aminophyllin IV Fresenius",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Peripheral: Maximum concentration of 1 – 2 mg/ml\nCentral: No further dilution required",
    "diluentText": "NS",
    "administrationText": "IV infusion\nLoading dose: Infuse over 20 – 30 minutes\nMaintenance dose: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "After Dilution - 24 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Fresenius Kabi. Aminophylline IV Fresenius Product Leaflet. Revised",
      "February 2017.",
      "2. McAuley D. [Internet]. Aminophylline Dilution. GlobalRPh; 2017.",
      "Available from: https://globalrph.com/dilution/aminophylline/",
      "3. Riaz M, Ami KH. Stability of aminophylline. Pakistan journal of",
      "pharmaceutical sciences. 1993 Jan;6(1):35–44.",
      "4. Schull PD. McGraw-Hill's I.V. Drug Handbook. New York: McGraw-Hill",
      "Medical; 2009.",
      "5. Truven Health Analytics. Micromedex.",
      "6. Uptodate. Aminophylline Drug Information. Wolters Kluwer.",
      "7. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-008",
    "pageNumber": 18,
    "rawTitle": "AMIODARONE HYDROCHLORIDE 150 MG/3 ML",
    "genericName": "Amiodarone Hydrochloride",
    "brandNames": [
      "Amiodarone HCL"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Amiodarone HCL",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "IV bolus\nPeripheral: Dilute to a maximum concentration of 2 mg/ml (150 mg in 75 ml)\nCentral: Dilute to a maximum concentration of 6 mg/ml (150 mg in 25 ml)\nIV infusion\nPeripheral: Dilute to a maximum concentration of 2 mg/ml (900 mg in 500 ml)\nCentral: Dilute to a maximum concentration of 18 mg/ml (900 mg in 50 ml)",
    "diluentText": "D5",
    "administrationText": "Loading dose\nIV bolus (pulseless VT/VF): Administer rapidly\nIV infusion: Infuse 150 mg over 10 minutes\nMaintenance dose\nIV infusion: Infuse 360 mg over 6 hours (1 mg/min) followed by 540 mg over 18 hours (0.5 mg/min) (total 900 mg over 24 hours). Infusion rate of 0.5 mg/min can be given if maintenance dose exceeds 24 hours.",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Concentrations less than 0.6 mg/ml are unstable."
    ],
    "references": [
      "1. Bioindustria L.I.M. Amiodarone HCL 150mg/3ml Injection Product",
      "Leaflet. Revised November 2016.",
      "2. Gahart BL, Nazareno AR. 2011 intravenous medications: A handbook for",
      "Nurses and Health Professionals. 27th ed. St. Louis, MO: Elsevier",
      "Mosby; 2010.",
      "3. Trissel LA. Handbook on Injectable Drugs. 13th ed. Bethesda, MD:",
      "American Society of Health-System Pharmacists; 2005.",
      "4. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-009",
    "pageNumber": 19,
    "rawTitle": "AMOXYCILLIN/CLAVULANATE 1.2 G (AMOXICILLIN 1000 MG & POTASSIUM CLAVULANATE 200 MG)",
    "genericName": "Amoxicillin + Clavulanic Acid (Co-Amoxiclav)",
    "brandNames": [
      "Clavicin"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Clavicin",
    "reconstitutionText": "Reconstitute 1.2 g in 20 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Not further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus: Administer over 3 – 4 minutes",
    "stabilityRows": [
      {
        "phase": "After Reconstitution",
        "fridge": "-",
        "roomTemp": "4 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Reconstitution - 4 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "Kementerian Kesihatan Malaysia (KKM) Dilution Guide for Fluid Restricted Critically Ill Adults."
    ]
  },
  {
    "id": "KKM-DIL-010",
    "pageNumber": 20,
    "rawTitle": "AMPHOTERICIN B SODIUM DEOXYCHOLATE 50 MG",
    "genericName": "Amphotericin B (Conventional / Deoxycholate)",
    "brandNames": [
      "Amphotret"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Amphotret",
    "reconstitutionText": "Reconstitute with 10 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Peripheral: Maximum concentration of 0.2 mg/ml (50 mg in 250 ml)\nCentral: Maximum concentration of 0.5 mg/ml (50 mg in 100 ml)",
    "diluentText": "D5",
    "administrationText": "IV infusion: Infuse over 4 – 6 hours",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "To minimize infusion related immediate reactions; premedicate with the",
      "following 30 – 60 minutes prior to administration: paracetamol,",
      "diphenhydramine and/or hydrocortisone.",
      "A test dose of 1 mg in 20 ml D5, infuse over 20 – 30 minutes may be",
      "considered.",
      "Rapid infusion may cause hypotension, hypokalemia, arrhythmia, and",
      "shock. Infusion related reactions can occur with all amphotericin B",
      "formulations.",
      "Protect from light during administration."
    ],
    "references": [
      "1. Bharat Serums and Vaccines Ltd. Amphotret® 50mg product leaflet.",
      "2. Gahart BL, Nazareno AR. 2011 intravenous medications: A handbook for",
      "Nurses and Health Professionals. 27th ed. St. Louis, MO: Elsevier",
      "Mosby; 2010.",
      "3. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-011",
    "pageNumber": 21,
    "rawTitle": "AMPHOTERICIN B LIPID COMPLEX 50 MG/10 ML",
    "genericName": "Amphotericin B (Lipid Complex)",
    "brandNames": [
      "Ampholip"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Ampholip",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Maximum concentration of 2 mg/ml",
    "diluentText": "D5",
    "administrationText": "IV infusion: Infuse at a rate of 2.5 mg/kg/hour",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "48 hours",
        "roomTemp": "6 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 48 hours 6 hours",
    "comments": [
      "Flush existing intravenous line with D5 before and after infusion.",
      "If the infusion time exceeds 2 hours, mix the contents by shaking the",
      "infusion bag every 2 hours."
    ],
    "references": [
      "1. Bharat Serums and Vaccines Ltd. Ampholip Injection Product Leaflet.",
      "Revised 22 July 2020.",
      "2. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-012",
    "pageNumber": 22,
    "rawTitle": "AMPICILLIN 500 MG",
    "genericName": "Ampicillin Sodium",
    "brandNames": [
      "Kampibiotic"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Kampibiotic",
    "reconstitutionText": "Reconstitute with 10 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus (<1 g): Administer over 3 – 4 minutes\nIV infusion (≥1 g): Infuse over 10 – 15 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "After Dilution - -",
    "comments": [
      "Rapid infusion may cause seizures."
    ],
    "references": [
      "1. Gahart BL, Nazareno AR. 2011 intravenous medications: A handbook for",
      "Nurses and Health Professionals. 27th ed. St. Louis, MO: Elsevier",
      "Mosby; 2010.",
      "2. Karnataka Antibiotics & Pharmaceuticals Ltd. Kampibiotic 500 Injection",
      "Product Leaflet. Revised 25 July 2017."
    ]
  },
  {
    "id": "KKM-DIL-013",
    "pageNumber": 23,
    "rawTitle": "AMPICILLIN/SULBACTAM 1.5 G INJECTION (AMPICILLIN 1000 MG & SULBACTAM 500 MG)",
    "genericName": "Ampicillin + Sulbactam",
    "brandNames": [
      "Amsubac"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Amsubac",
    "reconstitutionText": "Reconstitute with 3.2 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Maximum concentration of 45 mg/ml (9 g in 200 ml)",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer over 3 minutes\nIV infusion: Infuse over 15 – 30 minutes or as extended over 4 hours\n(Dose>3 g)",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "48 hours",
        "roomTemp": "8 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 48 hours 8 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "Product Leaflet. Revised 23 January 2018."
    ]
  },
  {
    "id": "KKM-DIL-014",
    "pageNumber": 24,
    "rawTitle": "ANIDULAFUNGIN 100 MG",
    "genericName": "Anidulafungin",
    "brandNames": [
      "Eraxis"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Eraxis",
    "reconstitutionText": "Reconstitute with 30 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Maximum concentration of 0.77 mg/ml (100 mg in 130 ml)",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Infuse 100 mg over 90 minutes or 200 mg over 180 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "48 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 48 hours",
    "comments": [
      "Infusion rate > 1.1 mg/min may cause histamine mediated reactions (i.e.",
      "dyspnea, flushing, hypotension, pruritus, rash, urticaria)."
    ],
    "references": [
      "1. Gahart BL, Nazareno AR. 2011 intravenous medications: A handbook for",
      "Nurses and Health Professionals. 27th ed. St. Louis, MO: Elsevier",
      "Mosby; 2010.",
      "2. Pharmacia and Upjohn Company LLC. Eraxis Product Leaflet (Revised",
      "11 August 2020).",
      "3. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-015",
    "pageNumber": 25,
    "rawTitle": "ARTESUNATE 60 MG",
    "genericName": "Artesunate",
    "brandNames": [
      "Artesun"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Artesun",
    "reconstitutionText": "Reconstitute with 5% sodium bicarbonate solution (provided)",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Maximum concentration of 10 mg/ml (60 mg in 6 ml)",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer over 1 – 2 minutes (3 – 4 ml/min)",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "1 hour"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 1 hour",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Guilin Pharmaceutical Co. Ltd. Artesunate Powder for Injection 60 mg",
      "Product Leaflet.",
      "2. Lexi-Comp Inc. Lexi-Drug©. Version 6.4.0.",
      "3. Truven Health Analytics. Micromedex."
    ]
  },
  {
    "id": "KKM-DIL-016",
    "pageNumber": 26,
    "rawTitle": "ATRACURIUM BESYLATE 25 MG/2.5 ML & 50 MG/5 ML",
    "genericName": "Atracurium Besylate",
    "brandNames": [
      "Atracurium Kalceks"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Atracurium Kalceks",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus: Administer undiluted\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "After Dilution - -",
    "comments": [
      "May be further diluted to concentration of 0.5 – 5 mg/ml with D5 or NS."
    ],
    "references": [
      "1. HBM Pharma S.R.O. Atracurium Kalceks 10 mg/ml Solution for",
      "Injection/Infusion Product Leaflet. Revised May 2020.",
      "2. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-017",
    "pageNumber": 27,
    "rawTitle": "ATROPINE 1 MG/1 ML",
    "genericName": "Atropine Sulphate",
    "brandNames": [
      "Atropine Sulphate"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Atropine Sulphate",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IM: Administer to the outer thigh\nSC\nIV bolus: Administer undiluted\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "After Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Hua-Huat S, Lee-Gong L, Peng-Hong C, Hu M. Sarawak Handbook of",
      "Medical Emergencies. Sarawak: C.E. Publishing; 2011.",
      "2. Pharmaniaga. Atropine Sulphate 1mg/ml Injection Product Leaflet.",
      "Revised 27 December 2017."
    ]
  },
  {
    "id": "KKM-DIL-018",
    "pageNumber": 28,
    "rawTitle": "AZITHROMYCIN 500 MG",
    "genericName": "Azithromycin",
    "brandNames": [
      "Vaxcel Azithromycin"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Vaxcel Azithromycin",
    "reconstitutionText": "Reconstitute 500 mg vial with 4.8 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Maximum concentration of 2 mg/ml",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Infuse over 1 hour",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "7 days",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 7 days 24 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "Leaflet. Revised 27 April 2017."
    ]
  },
  {
    "id": "KKM-DIL-019",
    "pageNumber": 29,
    "rawTitle": "BENZYLPENICILLIN SODIUM 1 MU (600 MG) & 5 MU (3 G)",
    "genericName": "Benzylpenicillin Sodium (Penicillin G)",
    "brandNames": [
      "Bepen Injection"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Bepen Injection",
    "reconstitutionText": "Reconstitute 1 MU with 2 ml WFI Reconstitute 5 MU with 10 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Maximum concentration of 60mg/ml (1 MU in 10ml)",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Infuse over 30 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "Use immediately"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - Use immediately",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Gahart BL, Nazareno AR. 2011 intravenous medications: A handbook for",
      "Nurses and Health Professionals. 27th ed. St. Louis, MO: Elsevier",
      "Mosby; 2010.",
      "2. Karnataka Antibiotics & Pharmaceuticals Ltd. Bepen Injection Product",
      "Leaflet. Revised 14 February 2017."
    ]
  },
  {
    "id": "KKM-DIL-020",
    "pageNumber": 30,
    "rawTitle": "BROMHEXINE HYDROCHLORIDE 4 MG/2 ML",
    "genericName": "Bromhexine Hydrochloride",
    "brandNames": [
      "Mucolex"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Mucolex",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus: Administer over 2 – 3 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "Dec 2020."
    ]
  },
  {
    "id": "KKM-DIL-021",
    "pageNumber": 31,
    "rawTitle": "CALCITONIN (SYNTHETIC SALMON CALCITONIN) 50 IU/1 ML & 100 IU/1 ML",
    "genericName": "Calcitonin (Salmon)",
    "brandNames": [
      "Miacalcic"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Miacalcic",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "IM, SC: No further dilution required\nIV infusion: 5 – 10 IU/kg in 500 ml",
    "diluentText": "NS",
    "administrationText": "IM: If exceed 2 ml for IM injection, prefer administration at varying sites\nSC\nIV Infusion: Infuse over at least 6 hours",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "Product Leaflet. Revised Nov 2017."
    ]
  },
  {
    "id": "KKM-DIL-022",
    "pageNumber": 32,
    "rawTitle": "CALCIUM GLUCONATE 10% 10 ML (CONTAINS 1 G CALCIUM, EQUIVALENT TO 2.25 MMOL CALCIUM)",
    "genericName": "Calcium Gluconate 10%",
    "brandNames": [
      "Calcium Gluconate 10% B.Braun"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Calcium Gluconate 10% B.Braun",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "IV bolus/infusion/continuous infusion: Maximum concentration of 50 mg/ml\n(1 g in 20 ml)",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus (cardiac arrest/hyperkalemia): Not exceeding 200 mg/min IV infusion (hypocalcemia): Not exceeding 50 mg/min Continuous infusion (beta-blocker and calcium channel blocker toxicity):\nTitrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "24 hours",
        "roomTemp": "Use immediately"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 24 hours Use immediately",
    "comments": [
      "For patients in cardiac arrest, administer as a rapid bolus via a central",
      "line."
    ],
    "references": [
      "1. B. Braun. Calcium Gluconate 10% Product Leaflet.",
      "2. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-023",
    "pageNumber": 33,
    "rawTitle": "CASPOFUNGIN 50 MG & 70 MG",
    "genericName": "Caspofungin Acetate",
    "brandNames": [
      "Cancidas"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Cancidas",
    "reconstitutionText": "Reconstitute with 10.5 ml NS or WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "70 mg (loading dose): Further dilute in 200 ml\n50 mg (maintenance dose): Further dilute in 100 ml",
    "diluentText": "NS",
    "administrationText": "IV infusion: Infuse over 1 hour",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "48 hours",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 48 hours 24 hours",
    "comments": [
      "Dilution of 70 mg in single 100 ml IV bag not recommended"
    ],
    "references": [
      "1. Merck Sharp & Dohme (M). Cancidas Product Leaflet.",
      "2. MIMS Online. Cancidas [Internet]. MIMS. [cited 2022]. Available from:",
      "https://www.mims.com/",
      "3. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-024",
    "pageNumber": 34,
    "rawTitle": "CEFAZOLIN 1 G",
    "genericName": "Cefazolin Sodium",
    "brandNames": [
      "Cefazolin Sandoz"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Cefazolin Sandoz",
    "reconstitutionText": "IM: Reconstitute with 4 ml 0.5% lidocaine IV bolus, IV infusion: Reconstitute with 4 ml NS or WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "IM: No further dilution required\nIV bolus, IV infusion: Maximum concentration of 20 mg/ml",
    "diluentText": "D5, NS",
    "administrationText": "IM: Inject deep IM into large muscle mass\nIV bolus: Administer over 3 – 5 minutes\nIV infusion (for doses >1 g): Infuse over 30 – 60 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "Use immediately"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - Use immediately",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "Kementerian Kesihatan Malaysia (KKM) Dilution Guide for Fluid Restricted Critically Ill Adults."
    ]
  },
  {
    "id": "KKM-DIL-025",
    "pageNumber": 35,
    "rawTitle": "CEFEPIME 1 G",
    "genericName": "Cefepime Hydrochloride",
    "brandNames": [
      "Vaxcel Cefepime"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Vaxcel Cefepime",
    "reconstitutionText": "IM: Reconstitute with 3 ml diluent IV bolus, IV infusion: Reconstitute with 10 ml diluent",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "IM, IV bolus: No further dilution required\nIV infusion: Maximum concentration of 40 mg/ml (1 g in 25 ml)",
    "diluentText": "D5, NS",
    "administrationText": "IM: Inject deep IM into large muscle mass\nIV bolus: Administer over 3 - 5 minutes\nIV infusion: Infuse over 30 minutes or as extended up to 4 hours",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "7 days",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "After Dilution 7 days 24 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "Kementerian Kesihatan Malaysia (KKM) Dilution Guide for Fluid Restricted Critically Ill Adults."
    ]
  },
  {
    "id": "KKM-DIL-026",
    "pageNumber": 36,
    "rawTitle": "CEFOPERAZONE 1 G & 2 G",
    "genericName": "Cefoperazone Sodium",
    "brandNames": [
      "Bicafar"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Bicafar",
    "reconstitutionText": "Reconstitute with 5 ml of D5 or NS",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Maximum concentration of 100 mg/ml",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer over 3 – 5 minutes\nIV infusion: Infuse over 15 – 60 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "Use immediately"
      }
    ],
    "stabilityRaw": "After Dilution - Use immediately",
    "comments": [
      "Cefoperazone is incompatible with aminoglycosides, perphenazine or",
      "pethidine hydrochloride."
    ],
    "references": [
      "Kementerian Kesihatan Malaysia (KKM) Dilution Guide for Fluid Restricted Critically Ill Adults."
    ]
  },
  {
    "id": "KKM-DIL-027",
    "pageNumber": 37,
    "rawTitle": "CEFOPERAZONE/SULBACTAM 1 G",
    "genericName": "Cefoperazone + Sulbactam",
    "brandNames": [
      "Vaxcel Cefobactam"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Vaxcel Cefobactam",
    "reconstitutionText": "Reconstitute with 3.4 ml diluent",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Further dilute in 20 ml",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer over 3 – 5 minutes\nIV infusion: Infuse over 15 – 60 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "Use immediately"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - Use immediately",
    "comments": [
      "No maximum concentration data available.",
      "Should not be directly mixed with aminoglycoside due to physical",
      "incompatibility."
    ],
    "references": [
      "Kementerian Kesihatan Malaysia (KKM) Dilution Guide for Fluid Restricted Critically Ill Adults."
    ]
  },
  {
    "id": "KKM-DIL-028",
    "pageNumber": 38,
    "rawTitle": "CEFOTAXIME 500 MG & 1 G",
    "genericName": "Cefotaxime Sodium",
    "brandNames": [
      "Rekaxime"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Rekaxime",
    "reconstitutionText": "IM, IV: Reconstitute each 1 g with 4 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "IV bolus: Further dilute 1 – 2 g in 10 ml\nIV infusion: Further dilute 1 – 2 g in 40 – 100 ml",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer over 3 – 5 minutes\nIV infusion: Infuse over 20 minutes (short) or 60 minutes (continuous drip)",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "Use immediately"
      }
    ],
    "stabilityRaw": "After Dilution - Use immediately",
    "comments": [
      "Sodium bicarbonate must not be mixed with cefotaxime."
    ],
    "references": [
      "Kementerian Kesihatan Malaysia (KKM) Dilution Guide for Fluid Restricted Critically Ill Adults."
    ]
  },
  {
    "id": "KKM-DIL-029",
    "pageNumber": 39,
    "rawTitle": "CEFTAZIDIME 1 G & 2 G",
    "genericName": "Ceftazidime",
    "brandNames": [
      "Cefatum"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Cefatum",
    "reconstitutionText": "Reconstitute with 10 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Maximum concentration of 40 mg/ml (1 g in 25 ml)",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer over 3 – 5 minutes\nIV infusion: Infuse over 30 minutes or as extended over 4 hours",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "7 days",
        "roomTemp": "12 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 7 days 12 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Duopharma (M) Sdn. Bhd. Cefatum Ceftazidime Product Leaflet.",
      "2. Pharmaceutical Services Division. Antibiotic Dilution Protocol. Penang",
      "State Health Department; 2016."
    ]
  },
  {
    "id": "KKM-DIL-030",
    "pageNumber": 40,
    "rawTitle": "CEFTRIAXONE 500 MG & 1 G",
    "genericName": "Ceftriaxone Sodium",
    "brandNames": [
      "Unocef"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Unocef",
    "reconstitutionText": "(IM) 3 days 24 hours After Dilution (IV) 10 days 3 days",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "IM: No further dilution required\nIV: Maximum concentration of 40 mg/ml (1 g in 25 ml)",
    "diluentText": "D5, NS",
    "administrationText": "IM\nIV bolus: Administer over 3 – 5 minutes\nIV infusion: Infuse over 30 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "After"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter",
    "comments": [
      "Do not use diluents containing calcium, such as Ringer’s solution or",
      "Hartmann’s solution, to reconstitute ceftriaxone."
    ],
    "references": [
      "Kementerian Kesihatan Malaysia (KKM) Dilution Guide for Fluid Restricted Critically Ill Adults."
    ]
  },
  {
    "id": "KKM-DIL-031",
    "pageNumber": 41,
    "rawTitle": "CEFUROXIME 750 MG & 1.5 G",
    "genericName": "Cefuroxime Sodium",
    "brandNames": [
      "Anikef"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Anikef",
    "reconstitutionText": "750 mg: Reconstitute with 6 ml WFI 1.5 g: Reconstitute with 15 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "IV bolus: No further dilution required\nIV infusion: Further dilute in 50 ml",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer over 3 – 5 minutes\nIV infusion: Infuse over 30 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "7 days",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 7 days 24 hours",
    "comments": [
      "Incompatible with aminoglycosides."
    ],
    "references": [
      "Kementerian Kesihatan Malaysia (KKM) Dilution Guide for Fluid Restricted Critically Ill Adults."
    ]
  },
  {
    "id": "KKM-DIL-032",
    "pageNumber": 42,
    "rawTitle": "CHLORPHENIRAMINE 10 MG/1 ML",
    "genericName": "Chlorpheniramine Maleate",
    "brandNames": [
      "Imach"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Imach",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IM, SC\nIV bolus: Administer over 1 minute",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Gray AH. Injectable Drugs Guide. London: Pharmaceutical Press; 2011.",
      "2. SM Pharmaceuticals Sdn. Bhd. Imach Chloramphenicol Maleate",
      "Injection Product Leaflet."
    ]
  },
  {
    "id": "KKM-DIL-033",
    "pageNumber": 43,
    "rawTitle": "CIPROFLOXACIN 200 MG/100 ML",
    "genericName": "Ciprofloxacin",
    "brandNames": [
      "Ciproxol"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Ciproxol",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV infusion: Infuse over 60 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Administer into a large vein to reduce risk of vein irritation. Slow infusion",
      "can minimize risk of venous irritation."
    ],
    "references": [
      "Infusion BP) Product Leaflet. Revised 25 September 2018."
    ]
  },
  {
    "id": "KKM-DIL-034",
    "pageNumber": 44,
    "rawTitle": "CISATRACURIUM 2 MG/1 ML",
    "genericName": "Atracurium Besylate",
    "brandNames": [
      "Nimbex"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Nimbex",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus: Administer over 5 – 10 seconds\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "After Dilution - -",
    "comments": [
      "Cisatracurium is stable only in acidic solution. It is not compatible with",
      "alkaline solutions with pH > 8.5.",
      "It is not compatible with ketorolac or propofol injectable emulsion."
    ],
    "references": [
      "1. Aspen SA Sterile Operations (Pty) Ltd. Nimbex (Intravenous Injection",
      "Cisatracurium besylate) Product Leaflet. Revised 15 May 2022.",
      "2. McAuley D. [Internet]. Nimbex-Cisatracurium. GlobalRPh;2017 [cited 1",
      "Sept 2022]. Available from: https://globalrph.com/drugs/neuromuscular-",
      "blocking-agents/#cisatracurium-nimbex."
    ]
  },
  {
    "id": "KKM-DIL-035",
    "pageNumber": 45,
    "rawTitle": "CLINDAMYCIN 300 MG/2 ML",
    "genericName": "Clindamycin Phosphate",
    "brandNames": [
      "YSP Tidact"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "YSP Tidact",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Maximum concentration of 18 mg/ml (900 mg in 50 ml)",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Infuse over 10 – 60 minutes (not exceeding 30 mg/min)",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "Product Leaflet. Revised 27 April 2019."
    ]
  },
  {
    "id": "KKM-DIL-036",
    "pageNumber": 46,
    "rawTitle": "CLOXACILLIN 500 MG",
    "genericName": "Cloxacillin Sodium",
    "brandNames": [
      "Cloxabiotic"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Cloxabiotic",
    "reconstitutionText": "IV: Reconstitute with 4.8 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "IV bolus: No further dilution required\nIV infusion: Further dilute to a maximum concentration of 50 mg/ml",
    "diluentText": "NS, D5",
    "administrationText": "IV bolus: Administer slowly over 3 – 4 minutes.\nIV intermittent infusion: Dilute with NS or D5 and infuse over 30 – 60 minutes (extending infusion over 60 minutes is recommended for peripheral lines to decrease risk of phlebitis).",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 24 hours",
    "comments": [
      "Extending infusion over 60 minutes is recommended for peripheral administration to decrease risk of phlebitis.",
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Karnataka Antibiotics & Pharmaceuticals Ltd. Cloxabiotic Injection",
      "Product Leaflet. Revised 12 February 2018.",
      "2. Loeuille G, D'Huart E, Vigneron J et al. Stability Studies of 16 Antibiotics",
      "for Continuous Infusion in Intensive Care Units and for Performing",
      "Outpatient Parenteral Antimicrobial Therapy. Antibiotics (Basel).",
      "2022;11(4):458.",
      "3. MSF Medical Guidelines. [cited 31 Aug 2022]. Available from:",
      "https://medicalguidelines.msf.org/en"
    ]
  },
  {
    "id": "KKM-DIL-037",
    "pageNumber": 47,
    "rawTitle": "COLISTIMETHATE (POLYMYXIN E) 1 MILLION UNITS (MU)",
    "genericName": "Colistimethate Sodium (Polymyxin E)",
    "brandNames": [
      "Xelcol"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Xelcol",
    "reconstitutionText": "Reconstitute 1 MU with not more than 10 ml WFI or NS",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Maximum concentration of 1 MU/5 ml (2 MU in 10 – 50ml)",
    "diluentText": "NS",
    "administrationText": "IV infusion: Infuse over 30 minutes – 1 hour",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Lexi-Comp Inc. Lexi-Drug©. Version 6.4.0.",
      "2. Xellia Pharmaceuticals ApS. Xelcol Product Leaflet. Revised 12 Oct",
      "2020."
    ]
  },
  {
    "id": "KKM-DIL-038",
    "pageNumber": 48,
    "rawTitle": "CO-TRIMOXAZOLE (SULFAMETHOXAZOLE 400 MG & TRIMETHOPRIM 80 MG)",
    "genericName": "Co-Trimoxazole (Sulfamethoxazole + Trimethoprim)",
    "brandNames": [
      "Bactrim"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Bactrim",
    "reconstitutionText": "Not Required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Maximum concentration of 1 ampoule (480 mg) in 75 ml",
    "diluentText": "D5",
    "administrationText": "IV infusion: Infuse over 60-90 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "2 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 2 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Deva Holding A.S. Product Leaftlet Bactrim Inj 400 mg/80 mg.",
      "2. NHS. Critical Care Intravenous Drug Administration Guide. 2008.",
      "3. NHS. Pharmacy Drug Guideline Folder. 2017."
    ]
  },
  {
    "id": "KKM-DIL-039",
    "pageNumber": 49,
    "rawTitle": "CYANOCOBALAMIN 1000 MCG/1 ML",
    "genericName": "Cyanocobalamin (Vitamin B12)",
    "brandNames": [
      "Cyanocobalamin"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Cyanocobalamin",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IM, Deep SC",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Do not administer IV as it will result in most of the drug excreted rapidly",
      "into the urine."
    ],
    "references": [
      "1. Mylan Pharmaceuticals ULC. Cyanocobalamin Injection USP 1000",
      "mcg/ml Product Leaflet. Revised 23 May 2014.",
      "2. Pharmaniaga. Cyanocobalamin 1000 mcg/ml Injection Product Leaflet.",
      "Revised 6 Dec 2017."
    ]
  },
  {
    "id": "KKM-DIL-040",
    "pageNumber": 50,
    "rawTitle": "DANTROLENE 20 MG",
    "genericName": "Dantrolene Sodium",
    "brandNames": [
      "Dantrium"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Dantrium",
    "reconstitutionText": "Reconstitute with 60 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus: Administer as rapid push\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Stability of reconstituted solution: 6 hours at 15°C to 30°C.",
      "Protect from light."
    ],
    "references": [
      "2018."
    ]
  },
  {
    "id": "KKM-DIL-041",
    "pageNumber": 51,
    "rawTitle": "DAPTOMYCIN 500 MG",
    "genericName": "Daptomycin",
    "brandNames": [
      "Cubicin"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Cubicin",
    "reconstitutionText": "Reconstitute with 10 ml NS",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "IV infusion: Further dilute required dose in 50 ml",
    "diluentText": "NS",
    "administrationText": "IV infusion: Infuse over 30 – 60 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "To minimize foaming, avoid vigorous agitation or shaking of the vial",
      "during or after reconstitution.",
      "Stability after reconstitution: 12 hours at room temperature, 48 hours at",
      "2 – 8C."
    ],
    "references": [
      "Kementerian Kesihatan Malaysia (KKM) Dilution Guide for Fluid Restricted Critically Ill Adults."
    ]
  },
  {
    "id": "KKM-DIL-042",
    "pageNumber": 52,
    "rawTitle": "DESMOPRESSIN 4 MCG/1 ML",
    "genericName": "Desmopressin Acetate (DDAVP)",
    "brandNames": [
      "Minirin"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Minirin",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "SC\nUndiluted\nIV\nCentral diabetes insipidus: Undiluted\nHaemophilia, von Willebrand’s Disease, & uremic bleeding: Further dilute\nrequired dose in 50 ml",
    "diluentText": "NS",
    "administrationText": "SC\nIV bolus (Central diabetes insipidus): Administer as IV push\nIV infusion (Haemophilia, von Willebrand’s Disease, & uremic bleeding):\nInfuse over 15 – 30 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Ferring Pharmaceuticals. Minirin Product Leaftlet. Revised 1 May 2015.",
      "2. McAuley D. [Internet]. Desmopressin (DDVAP) Dilution.",
      "GlobalRPh;2017. Available from:",
      "https://globalrph.com/dilution/desmopressin-ddavp/",
      "3. UpToDate. Desmopressin Drug Information. Wolters Kluwer."
    ]
  },
  {
    "id": "KKM-DIL-043",
    "pageNumber": 53,
    "rawTitle": "DEXAMETHASONE 8 MG/2 ML",
    "genericName": "Dexamethasone Sodium Phosphate",
    "brandNames": [
      "Penatone"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Penatone",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IM, SC\nIV bolus/infusion: Administer over 5 – 15 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "After Dilution - -",
    "comments": [
      "In shock and idiopathic thrombocytopenic purpura, use only the IV route."
    ],
    "references": [
      "2018."
    ]
  },
  {
    "id": "KKM-DIL-044",
    "pageNumber": 54,
    "rawTitle": "DEXMEDETOMIDINE 200 MCG/2 ML",
    "genericName": "Dexmedetomidine Hydrochloride",
    "brandNames": [
      "Precedex"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Precedex",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Maximum concentration of 4 mcg/ml",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Loading dose over 10 minutes followed by dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "24 hours",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 24 hours 24 hours",
    "comments": [
      "Loading dose may be extended over 20 minutes to further reduce",
      "vasoconstrictive effects."
    ],
    "references": [
      "1. Hospira Inc. Precedex Product Leaflet. Revised 4 Oct 2018.",
      "2. McAuley D. [Internet]. Precedex-Dexmedetomidine Dilution. GlobalRPh;",
      "2017. Available from: https://globalrph.com/dilution/precedex-",
      "dexmedetomidine/"
    ]
  },
  {
    "id": "KKM-DIL-045",
    "pageNumber": 55,
    "rawTitle": "DIAZEPAM 10 MG/2 ML",
    "genericName": "Diazepam",
    "brandNames": [
      "Zopam"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Zopam",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IM\nIV bolus: Administer not exceeding 5 mg/min",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Rapid injection may cause respiratory depression or hypotension."
    ],
    "references": [
      "1. SM Pharmaceuticals Sdn Bhd. Zopam Product Leaflet. Revised 23 Apr",
      "2021.",
      "2. UpToDate. Diazepam Drug Information. Wolters Kluwer."
    ]
  },
  {
    "id": "KKM-DIL-046",
    "pageNumber": 56,
    "rawTitle": "DIGOXIN 0.5 MG/2 ML",
    "genericName": "Digoxin",
    "brandNames": [
      "Assos"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Assos",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required. However, minimum of 4-fold dilution with D5 or\nNS is preferred (2 ml digoxin with 8 ml diluent)",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus: Administer over at least 5 minutes\nIV infusion: Infuse over 15 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "After Dilution - -",
    "comments": [
      "The use of less than a 4-fold volume of diluent could lead to precipitation",
      "of digoxin."
    ],
    "references": [
      "1. McAuley D. [Internet]. Digoxin Dilution. GlobalRPh; 2017. Available from:",
      "https://globalrph.com/dilution/digoxin-immune-fab/",
      "2. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012.",
      "3. UpToDate. Digoxin Drug Information. Wolters Kluwer."
    ]
  },
  {
    "id": "KKM-DIL-047",
    "pageNumber": 57,
    "rawTitle": "DOBUTAMINE 250 MG/20 ML",
    "genericName": "Dobutamine Hydrochloride",
    "brandNames": [
      "Mobitil"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Mobitil",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Peripheral: Maximum concentration of 5 mg/ml (250 mg/50 ml)\nCentral: Maximum concentration of 10 mg/ml (500 mg/50 ml)",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 24 hours",
    "comments": [
      "Administration via central line is recommended."
    ],
    "references": [
      "1. Duopharma (M) Sdn. Bhd. Mobitil Product Leaflet. Revised 9 Jul 2019.",
      "2. McAuley D. [Internet]. Dobutamine Dilution. GlobalRPh; 2017. Available",
      "from: https://globalrph.com/dilution/dobutamine-hydrochloride/",
      "3. NHS. Critical Care Intravenous Drug Administration Guide. 2008.",
      "4. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-048",
    "pageNumber": 58,
    "rawTitle": "DOPAMINE 200 MG/5 ML",
    "genericName": "Dopamine Hydrochloride",
    "brandNames": [
      "Loxin"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Loxin",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Peripheral: Maximum concentration of 0.8 mg/ml (200 mg/250 ml)\nCentral: Maximum concentration of 8 mg/ml (400 mg/50 ml)",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 24 hours",
    "comments": [
      "Administration via central line is recommended."
    ],
    "references": [
      "1. Duopharma (M) Sdn. Bhd. Loxin Product Leaflet. Revised 14 Jun 2019.",
      "2. McAuley D. [Internet]. Dopamine Dilution. GlobalRPh; 2017. Available",
      "from: https://globalrph.com/dilution/dopamine-hydrochloride/",
      "3. NHS. Critical Care Intravenous Drug Administration Guide. 2008.",
      "4. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-049",
    "pageNumber": 59,
    "rawTitle": "EPHEDRINE 30 MG/1 ML",
    "genericName": "Ephedrine Hydrochloride",
    "brandNames": [
      "Ephedrine"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Ephedrine",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Maximum concentration of 10 mg/ml",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer over 3 – 5 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "2. Pharmaniaga. Ephedrine Product Leaflet. Revised 16 May 2017."
    ]
  },
  {
    "id": "KKM-DIL-050",
    "pageNumber": 60,
    "rawTitle": "ERTAPENEM 1 G",
    "genericName": "Ertapenem Sodium",
    "brandNames": [
      "Invanz"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Invanz",
    "reconstitutionText": "IM: Reconstitute with 3.2 ml 1 or 2% lidocaine (stable for 1 hour) IV: Reconstitute with 10 ml WFI or NS",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Maximum concentration of 20 mg/ml",
    "diluentText": "NS",
    "administrationText": "IM: Administer into large muscle mass\nIV infusion: Infuse over 30 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "24 hours",
        "roomTemp": "6 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 24 hours 6 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. McAuley D. [Internet]. Ertapenem Dilution. GlobalRPh; 2017. Available",
      "from: https://globalrph.com/dilution/ertapenem-invanz/",
      "2. Merck Sharp & Dohme (M).Invanz Product Leaflet. Revised 1 Feb 2021."
    ]
  },
  {
    "id": "KKM-DIL-051",
    "pageNumber": 61,
    "rawTitle": "ERYTHROMYCIN 500 MG",
    "genericName": "Erythromycin Lactobionate",
    "brandNames": [
      "Eritrotex"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Eritrotex",
    "reconstitutionText": "Reconstitute with 10 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Peripheral: Maximum concentration of 5 mg/ml\nCentral: Maximum concentration of 10 mg/ml",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Infuse over 30 – 60 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "8 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 8 hours",
    "comments": [
      "Thrombophlebitis and arrhythmia may occur when using concentrated",
      "(>5 mg/ml) solution. Cardiac monitoring is recommended."
    ],
    "references": [
      "1. FisiopharmaS.r.L. Eritrotex Product Leaflet. Revised 22 Jan 2020.",
      "2. McAuley D. [Internet]. Dopamine Dilution. GlobalRPh; 2017. Available",
      "from: https://globalrph.com/dilution/erythromycin/",
      "3. NHS. Critical Care Intravenous Drug Administration Guide. 2008.",
      "4. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-052",
    "pageNumber": 62,
    "rawTitle": "ESMOLOL 100 MG/10 ML",
    "genericName": "Esmolol Hydrochloride",
    "brandNames": [
      "Esocard"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Esocard",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus: Administer over 30 – 60 seconds\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "After Dilution - -",
    "comments": [
      "Administration via central line is recommended.",
      "Not to be used in in combination with sodium bicarbonate or other",
      "medicinal product such as frusemide, diazepam, thiopental."
    ],
    "references": [
      "1. McAuley D. [Internet]. Esmolol Dilution. GlobalRPh; 2017. Available",
      "from: https://globalrph.com/dilution/esmolol-brevibloc/",
      "2. Samarth Life Sciences Pvt Ltd.Esocard Product Leaflet. Revised 1 Oct",
      "2010. NHS. Critical Care Intravenous Drug Administration Guide. 2008."
    ]
  },
  {
    "id": "KKM-DIL-053",
    "pageNumber": 63,
    "rawTitle": "ESOMEPRAZOLE 40 MG",
    "genericName": "Esomeprazole Sodium",
    "brandNames": [
      "Esomeprazole"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Esomeprazole",
    "reconstitutionText": "Reconstitute with 5 ml NS",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "IV bolus: No further dilution required\nIV infusion: Maximum concentration of 0.8 mg/ml (40 mg in 50 ml)",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer over 3 minutes\nIV infusion: Infuse over 30 minutes\nContinuous infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "6 hours (D5),"
      },
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "12 hours (NS)"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 6 hours (D5),\n12 hours (NS)",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Kotra Pharma. Esomeprazole Product Leaflet (Vaxcel). Revised 26 Feb",
      "2020.",
      "2. McAuley D. [Internet]. Esmolol Dilution. GlobalRPh; 2017. Available",
      "from: https://globalrph.com/dilution/esomeprazole-nexium/"
    ]
  },
  {
    "id": "KKM-DIL-054",
    "pageNumber": 64,
    "rawTitle": "FACTOR VIII (HUMAN BLOOD COAGULATION FACTOR VIII)",
    "genericName": "Human Coagulation Factor VIII",
    "brandNames": [
      "Fanhdi",
      "MYVATE",
      "Beriate"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Fanhdi, MYVATE, Beriate",
    "reconstitutionText": "Reconstitute each vial with the supplied diluent (Sterile WFI) using aseptic technique. Swirl gently until dissolved; do not shake.",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus / infusion: Administer slowly via IV push at a rate not exceeding 2 – 3 mL/min. Rapid administration of Factor VIII concentrate may result in vasomotor reaction.",
    "stabilityRows": [
      {
        "phase": "After Reconstitution",
        "fridge": "-",
        "roomTemp": "8 – 12 hours (Beriate / MYVATE), 24 hours (Fanhdi)"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Reconstitution: 8 – 12 hours (Beriate/MYVATE) or up to 24 hours (Fanhdi)",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique.",
      "Kadar suntikan IV tidak melebihi 2 – 3 mL seminit bagi mengelakkan tindak balas vasomotor."
    ],
    "references": [
      "1. Bioworld Technologies Sdn Bhd. Factor VIII (MYVATE) 250 IU, 500 IU, 1000 IU, 1500 IU Powder and Solvent for Solution for Injection Product Leaflet. Revised 2 May 2018.",
      "2. DKSH (M) Sdn Bhd. Factor VIII (Beriate) 250 IU, 500 IU, 1000 IU Powder and Solvent for Solution for Injection or Infusion Product Leaflet. Revised 23 Aug 2019.",
      "3. Grifols Biologicals Inc. Factor VIII (Fandhi) 250 IU, 500 IU, 1000 IU Product Leaflet. Revised 17 Dec 2007."
    ]
  },
  {
    "id": "KKM-DIL-055",
    "pageNumber": 65,
    "rawTitle": "FACTOR VIII/VWF (HUMAN BLOOD COAGULATION FACTOR VIII AND VON WILLEBRAND FACTOR COMPLEX)",
    "genericName": "Factor VIII / VWF Complex",
    "brandNames": [
      "Alphanate",
      "Wilate",
      "Octanate",
      "Immunate",
      "Haemate P"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Alphanate, Wilate, Octanate, Immunate, Haemate P",
    "reconstitutionText": "Reconstitute each vial with the provided prefilled syringe with diluent (sterile WFI)",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus / infusion: Administer slowly at a rate not exceeding 2 – 3 mL/min (or per manufacturer's instructions). Rapid administration of Factor VIII/VWF concentrate may result in vasomotor reaction.",
    "stabilityRows": [
      {
        "phase": "After Reconstitution",
        "fridge": "-",
        "roomTemp": "8 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Reconstitution - 8 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique.",
      "Kadar pemberian tidak boleh melebihi 2 – 3 mL/min bagi mengelakkan tindak balas vasomotor."
    ],
    "references": [
      "1. DKSH (M) Sdn. Bhd. Haemate P 250IU FVIII/ 600IU VWF, 500 IU FVIII /1200 IU VWF, 1000 IU FVIII /2400 IU VWF Powder and Solvent for Solution for Injection. Revised 30 Aug 2019.",
      "2. Grifols Biologicals Inc. Factor VIII/VWF (AlphanateⓇ) 250 IU, 500 IU, 1000 IU, 1500 IU Product Leaflet. Revised Oct 2013.",
      "3. Pharmaniaga. Factor VIII/VWF (OCTANATE) 50 IU/ml, 250 IU Powder and Solvent for Solution for Injection. Revised May 2015.",
      "4. Pharmaniaga. Factor VIII/VWF (Wilate) 500, 500 IU VWF/500 IU FVIII, Powder and Solvent for Solution for Injection Product Leaflet. Revised 3 Aug 2020.",
      "5. Takeda (M) Sdn Bhd. Factor VIII/VWF (IMMUNATE) 50 IU/ml, 100 IU/ml Product Leaflet. Revised 16 Jun 2020."
    ]
  },
  {
    "id": "KKM-DIL-056",
    "pageNumber": 66,
    "rawTitle": "FACTOR IX (HUMAN COAGULATION FACTOR IX)",
    "genericName": "Human Coagulation Factor IX",
    "brandNames": [
      "AlphaNine SD",
      "OCTANINE F",
      "Immunine"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "AlphaNine SD, OCTANINE F, Immunine",
    "reconstitutionText": "Reconstitute with supplied Sterile Water for Injection (WFI). Swirl gently until dissolved; do not shake.",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus / infusion: Administer slowly at a rate not exceeding 2 – 3 mL/min. Rapid administration of Factor IX concentrate may result in vasomotor reaction.",
    "stabilityRows": [
      {
        "phase": "After Reconstitution",
        "fridge": "-",
        "roomTemp": "3 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Reconstitution - 3 hours",
    "comments": [
      "Use immediately and within three hours after reconstitution to avoid potential ill effect of any inadvertent bacterial contamination occurring after reconstitution.",
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Grifols Biologicals Inc. Factor IX (AlphaNineⓇSD) 500 IU, 1000 IU, 1500 IU Product Leaflet. Revised Dec 2017.",
      "2. Pharmaniaga. Factor XI (OCTANINE F) 500 IU, 1000 IU Product Leaflet. Revised 15 May 2019.",
      "3. Takeda (M) Sdn Bhd. Factor IX (Immunine) 600 IU Product Leaflet (Revised Feb 2020)."
    ]
  },
  {
    "id": "KKM-DIL-057",
    "pageNumber": 67,
    "rawTitle": "FACTOR VIIA (EPTACOG ALFA)",
    "genericName": "Recombinant Factor VIIa (Eptacog alfa)",
    "brandNames": [
      "NovoSeven 1 mg (50 KIU) powder and solvent for solution for injection NovoSeven 2 mg (100 KIU) powder and solvent for solution for injection"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "NovoSeven 1 mg (50 KIU) powder and solvent for solution for injection NovoSeven 2 mg (100 KIU) powder and solvent for solution for injection",
    "reconstitutionText": "24 hours 6 hours",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus: Administer slowly over 2 – 5 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "After"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter",
    "comments": [
      "Must not be mixed with infusion solutions or be given in a drip."
    ],
    "references": [
      "1. Novo Nordisk Pharma (M) Sdn Bhd. Factor VIIa (NovoSeven®) 1 mg (50",
      "KIU), 2mg (100 KIU) Powder and Solvent for Solution for Injection",
      "Product Leaflet. Revised Apr 2021."
    ]
  },
  {
    "id": "KKM-DIL-058",
    "pageNumber": 68,
    "rawTitle": "FENTANYL CITRATE 0.1 MG/2 ML",
    "genericName": "Fentanyl Citrate",
    "brandNames": [
      "Talgesil Fentanyl-Piramal"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Talgesil Fentanyl-Piramal",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Undiluted or maximum concentration of 10 mcg/ml (preferred)",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer rapidly\nIV infusion, continuous infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 24 hours",
    "comments": [
      "Product is preservative free, hence the injection should be freshly",
      "prepared and unused portions should be discarded.",
      "Incompatible with thiopental sodium."
    ],
    "references": [
      "1. DKSH (M) Sdn Bhd. Fentanyl-Piramal (Fentanyl) Injection 0.1 mg/2 ml",
      "Product Leaflet. Revised Aug 2021.",
      "2. Duopharma (M) Sdn. Bhd. Talgesil (Fentanyl) Injection 0.1 mg/2 ml",
      "Product Leaflet. Revised 9 Jul 2019.",
      "3. Fentanyl: Indication, Dosage, Side Effect, Precaution. MIMS Malaysia;",
      "[cited 13 Jun 2022]. Available from:",
      "https://www.mims.com/malaysia/drug/info/fentanyl?mtype=generic",
      "4. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-059",
    "pageNumber": 69,
    "rawTitle": "FILGRASTIM (RECOMBINANT HUMAN GRANULOCYTE COLONY- STIMULATING FACTOR)",
    "genericName": "Filgrastim (G-CSF)",
    "brandNames": [
      "Neupogen 30 MU",
      "1 ml (300 mcg",
      "ml) vial Neupogen 30 MU",
      "0.5 ml (300 mcg",
      "0.5 ml) prefilled syringe"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Neupogen 30 MU/1 ml (300 mcg/ml) vial Neupogen 30 MU/0.5 ml (300 mcg/0.5 ml) prefilled syringe",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "SC: No further dilution required\nIV infusion: Maximum concentration of 15 mcg/ml\n*If Neupogen is diluted to less than 15 mcg/ml, 0.2 ml of 20% human albumin should be added.",
    "diluentText": "D5",
    "administrationText": "SC (preferred route of administration)\nIV infusion: Infuse over 15 – 30 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "24 hours",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 24 hours 24 hours",
    "comments": [
      "Dilution to a final concentration < 2 μg/mL is not recommended at any",
      "time."
    ],
    "references": [
      "1. Amgen Biopharmaceuticals (M) Sdn Bhd. Filgrastim (Neupogen®) 30",
      "MU/ml Vial Product Leaflet. Revised Aug 2018.",
      "2. Cipla (M) Sdn Bhd. Filgrastim (Filpegla) 6 mg /0.6 ml Solution for",
      "Injection in Pre-Filled Syringe Product Leaflet. Revised Sept 2020.",
      "3. Hospira (M) Sdn Bhd. Filgrastim (Nivestim) 120 μg/0.2 ml, 300 μg/0.5",
      "ml, 480 μg/0.5 ml Solution for Injection/Infusion Product Leaflet.",
      "Revised 18 Feb 2020.",
      "4. Mylan Healthcare Sdn Bhd. Filgrastim (Fulphila™) Pegylated",
      "Granulocyte Colony Stimulating Factor Injection (PEG-GCSF Injection)",
      "6 mg/0.6 ml Pre-filled Syringe Product Leaflet. Revised Nov 2020."
    ]
  },
  {
    "id": "KKM-DIL-060",
    "pageNumber": 70,
    "rawTitle": "FLUCONAZOLE",
    "genericName": "Fluconazole",
    "brandNames": [
      "Diflucan 100 mg",
      "50 ml intravenous infusion Diflucan 200 mg",
      "100 ml intravenous infusion Fluconol 100 mg",
      "50 ml intravenous infusion Fluconol 200 mg",
      "100 ml intravenous infusion Flucon 100 mg",
      "50 ml intravenous infusion"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Diflucan 100 mg/50 ml intravenous infusion Diflucan 200 mg/100 ml intravenous infusion Fluconol 100 mg/50 ml intravenous infusion Fluconol 200 mg/100 ml intravenous infusion Flucon 100 mg/50 ml intravenous infusion",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV infusion: Infuse over 60 minutes, at rate <10 ml/min",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Ain Medicare Sdn Bhd. Fluconazole (Fluconol®) 100 mg/50 ml, 200",
      "mg/100 ml Intravenous Infusion Product Leaflet. Revised 1 Sept 2019.",
      "2. Averroes Pharmaceuticals. Fluconazole (Flucon) 100 mg/50 ml",
      "Intravenous Infusion Product Leaflet. Revised Jun 2007.",
      "3. Pfizer (M) Sdn Bhd. Fluconazole (Diflucan) 100 mg/50 ml, 200 mg/100",
      "ml Intravenous Infusion Product Leaflet. Revised 4 Aug 2021."
    ]
  },
  {
    "id": "KKM-DIL-061",
    "pageNumber": 71,
    "rawTitle": "FRUSEMIDE 20 MG/2 ML",
    "genericName": "Frusemide (Furosemide)",
    "brandNames": [
      "Fusix"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Fusix",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus: Administer undiluted\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "After Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. SM Pharmaceuticals Sdn Bhd. Fusix (Frusemide) Injection 20 mg/2 ml",
      "Ampoule Product Leaflet. Revised 07 Mar 2019.",
      "2. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-062",
    "pageNumber": 72,
    "rawTitle": "FUSIDIC ACID 500 MG",
    "genericName": "Fusidic Acid Sodium Salt",
    "brandNames": [
      "Fusidic Acid Sodium Salt"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Fusidic Acid Sodium Salt",
    "reconstitutionText": "Reconstitute with 10 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Maximum concentration of 2 mg/ml",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Infuse over at least 2 hours",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 24 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Fusidic acid: Indication, Dosage, Side Effect, Precaution. MIMS Malaysia; [cited",
      "30 Jun 2022]. Available from:",
      "https://www.mims.com/malaysia/drug/info/fusidic%20acid?mtype=generiVivocin",
      "2. Steril/Non-Steril Preparation Working Committee Members. Johore Antibiotics",
      "Dilution Quick Reference"
    ]
  },
  {
    "id": "KKM-DIL-063",
    "pageNumber": 73,
    "rawTitle": "GANCICLOVIR 500 MG",
    "genericName": "Ganciclovir Sodium",
    "brandNames": [
      "Cymevene"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Cymevene",
    "reconstitutionText": "Reconstitute with 10 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Maximum concentration of 10 mg/ml",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Infuse over 60 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "24 hours",
        "roomTemp": "12 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 24 hours 12 hours",
    "comments": [
      "Infusion concentrations greater than 10 mg/ml are not recommended."
    ],
    "references": [
      "1. DKSH (M) Sdn Bhd. Ganciclovir (Cymevene®) 500 mg/vial Powder for",
      "Concentrate for Infusion. Revised Jan 2021.",
      "2. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-064",
    "pageNumber": 74,
    "rawTitle": "GENTAMICIN 80 MG/2 ML",
    "genericName": "Gentamicin Sulphate",
    "brandNames": [
      "Garasent"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Garasent",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Dilute in at least 50 – 100 ml diluent and infuse over 30 – 60 minutes",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer over 2 – 3 minutes\nIV infusion: Infuse over 30 minutes – 2 hours (preferred)",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "48 hours",
        "roomTemp": "48 hours"
      }
    ],
    "stabilityRaw": "After Dilution 48 hours 48 hours",
    "comments": [
      "High doses may require longer infusion time (up to 2 hours)."
    ],
    "references": [
      "1. Duopharma (M) Sdn Bhd. Gentamicin (Garasent) 80 mg/2 ml Ampoule,",
      "280 mg/2 ml Product Leaflet. Revised 28 May 2019.",
      "2. McAuley D. [Internet]. Gentamicin Dilution. GlobalRPh;2017. Available",
      "from: https://globalrph.com/dilution/gentamicin/",
      "3. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. Dec 2012."
    ]
  },
  {
    "id": "KKM-DIL-065",
    "pageNumber": 75,
    "rawTitle": "GLUCAGON 1 MG",
    "genericName": "Glucagon (rDNA)",
    "brandNames": [
      "GlucaGen"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "GlucaGen",
    "reconstitutionText": "Reconstitute with provided diluent",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "IM, SC, IV bolus\nNo further dilution required\nIV infusion\nPeripheral: Maximum concentration of 0.1 mg/ml\nCentral: No further dilution required",
    "diluentText": "D5",
    "administrationText": "IM, SC\nIV bolus: Administer over 3 – 5 minutes\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Use immediately after reconstitution"
    ],
    "references": [
      "1. Lexi-Comp Inc. Lexi-Drug©. Version 6.4.0.",
      "2. Novo Nordisk Pharma (M) Sdn. Bhd. GlucaGen® Product Leaflet.",
      "Revised Jul 2020.",
      "3. Pharmaceutical Services Programme. Antidote Quick Guide. 1st ed.",
      "Ministry of Health; 2022.",
      "4. UpToDate. Glucagon Drug Information. Wolters Kluwer."
    ]
  },
  {
    "id": "KKM-DIL-066",
    "pageNumber": 76,
    "rawTitle": "GLYCERYL TRINITRATE 50 MG/10 ML",
    "genericName": "Glyceryl Trinitrate (GTN)",
    "brandNames": [
      "Gitrinil"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Gitrinil",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Maximum concentration of 1 mg/ml",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 24 hours",
    "comments": [
      "Glyceryl trinitrate should not be given by bolus injection."
    ],
    "references": [
      "1. Duopharma (M) Sdn Bhd. Gitrinil 50 mg/10 ml Injection Product Leaflet.",
      "Revised 12 Jun 2019.",
      "2. Hameln Pharma. Glyceryl Trinitrate-Hameln 1 mg/ml Injection Product",
      "Leaflet. Revised Sept 2020.",
      "3. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-067",
    "pageNumber": 77,
    "rawTitle": "GLYCOPYRROLATE 200 MCG/1 ML",
    "genericName": "Glycopyrrolate",
    "brandNames": [
      "Pyronium"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Pyronium",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IM\nIV bolus: Administer over 1 – 2 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Lexi-Comp Inc. Lexi-Drug©. Version 6.4.0.",
      "2. SM Pharmaceuticals Sdn Bhd. Pyronium Product Leaflet. Revised Sept",
      "2017.",
      "3. UpToDate. Glycopyrrolate Drug Information. Wolters Kluwer."
    ]
  },
  {
    "id": "KKM-DIL-068",
    "pageNumber": 78,
    "rawTitle": "GRANISETRON 1 MG/ML",
    "genericName": "Granisetron Hydrochloride",
    "brandNames": [
      "Kytron",
      "Granisetron Kabi",
      "Granil"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Kytron, Granisetron Kabi, Granil",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "IV bolus: No further dilution required\nIV infusion: Dilute required dose in 20 ml",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer over 30 seconds\nIV infusion: Infuse over 5 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 24 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Duopharma (M) Sdn Bhd. Kytron Product Leaflet. Revised 15 Oct 2019.",
      "2. Lexi-Comp Inc. Lexi-Drug©. Version 6.4.0.",
      "3. McAuley D. [Internet]. Kytril-Granisetron. GlobalRPh;2017. Available",
      "from: https://globalrph.com/dilution/granisetron-kytril/",
      "4. UpToDate. Granisetron Drug Information. Wolters Kluwer."
    ]
  },
  {
    "id": "KKM-DIL-069",
    "pageNumber": 79,
    "rawTitle": "HALOPERIDOL 5 MG/1 ML",
    "genericName": "Haloperidol",
    "brandNames": [
      "Manace"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Manace",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution needed",
    "diluentText": "Not applicable",
    "administrationText": "IM\nIV bolus: Administer not exceeding 5 mg/min",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "After Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "2019."
    ]
  },
  {
    "id": "KKM-DIL-070",
    "pageNumber": 80,
    "rawTitle": "HEPARIN 5,000 IU/5 ML & HEPARIN 25,000 IU/5 ML",
    "genericName": "Heparin Sodium",
    "brandNames": [
      "Heparinol"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Heparinol",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "SC: No further dilution required\nIV infusion: Refer to institutional heparin protocol",
    "diluentText": "D5, NS",
    "administrationText": "SC\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "After Dilution - 24 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Ain Medicare Sdn Bhd. Heparinol Product Leaflet. Revised 1 Aug 2020.",
      "2. Lexi-Comp Inc. Lexi-Drug©. Version 6.4.0.",
      "3. UpToDate. Heparin Drug Information. Wolters Kluwer."
    ]
  },
  {
    "id": "KKM-DIL-071",
    "pageNumber": 81,
    "rawTitle": "HUMAN ALBUMIN 20% (10 G/50ML & 20 G/100 ML)",
    "genericName": "HUMAN ALBUMIN 20% (10 G/50ML & 20 G/100 ML)",
    "brandNames": [
      "Human Albumin Grifols 20% Albumex 20 Human Albumin 20%"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Human Albumin Grifols 20% Albumex 20 Human Albumin 20%",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV infusion: Infuse each vial over 30 minutes – 4 hours",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. CSL Behring Australia Pty Ltd. Albumex® 20 Human Albumin 20% (200",
      "g/L) Product Leaflet. Revised 4 Mar 2015.",
      "2. Grifols (M) Sdn Bhd. Human Albumin Grifols 20% Product Leaflet.",
      "Revised Dec 2002.",
      "3. Truven Health Analytics. Micromedex."
    ]
  },
  {
    "id": "KKM-DIL-072",
    "pageNumber": 82,
    "rawTitle": "HUMAN ALBUMIN 25% (12.5 G/50 ML & 25 G/100 ML)",
    "genericName": "HUMAN ALBUMIN 25% (12.5 G/50 ML & 25 G/100 ML)",
    "brandNames": [
      "Plasbumin® -25"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Plasbumin® -25",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV infusion: Infuse each vial over 30 minutes – 4 hours",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Grifols (M) Sdn Bhd. Product Insert for Human Albumin 25% by",
      "Plasbumin®-25. Revised Oct 2016.",
      "2. Grifols (M) Sdn Bhd. Human Albumin Grifols 25% (12.5 g/50 ml, 25 g/100",
      "ml) Product Leaflet. Revised Dec 2017.",
      "3. Truven Health Analytics. Micromedex."
    ]
  },
  {
    "id": "KKM-DIL-073",
    "pageNumber": 83,
    "rawTitle": "HYDRALAZINE 20 MG/1 ML",
    "genericName": "Hydralazine Hydrochloride",
    "brandNames": [
      "Hydralazine hydrochloride"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Hydralazine hydrochloride",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Maximum concentration of 1mg/ml",
    "diluentText": "Not applicable",
    "administrationText": "IM\nIV bolus: Administer over 3 – 5 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "After Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Ciron Drugs & Pharmaceuticals Pvt. Ltd. Hydralazine Hydrochloride 20",
      "mg/ml Product Leaflet. Revised 5 Apr 2022)",
      "2. UpToDate. Hydralazine Drug Information. Wolters Kluwer."
    ]
  },
  {
    "id": "KKM-DIL-074",
    "pageNumber": 84,
    "rawTitle": "HYDROCORTISONE 100 MG",
    "genericName": "Hydrocortisone Sodium Succinate",
    "brandNames": [
      "Zycort"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Zycort",
    "reconstitutionText": "- 72 hours",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution is required",
    "diluentText": "-",
    "administrationText": "IV infusion: Infuse over 5 – 30 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "After"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter",
    "comments": [
      "If further dilution is needed, 100 mg doses may be added to 50 ml NS or",
      "D5 (stable for 4 hours)."
    ],
    "references": [
      "1. SM Pharmaceuticals Sdn. Bhd. Product Insert for Zycort. Revised 24 Oct",
      "2018.",
      "2. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-075",
    "pageNumber": 85,
    "rawTitle": "ILOPROST 0.5 ML (CONTAINS 67 MCG ILOPROST TROMETAMOL EQUIVALENT TO 50 MCG ILOPROST)",
    "genericName": "Iloprost Trometamol",
    "brandNames": [
      "Ilomedin"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Ilomedin",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "For infusion pump use: Maximum concentration of 0.2 mcg/ml\nFor syringe pump use: Maximum concentration of 2 mcg/ml",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Solution must not be administered undiluted.",
      "The infusion solution should be made up freshly each day to ensure",
      "sterility."
    ],
    "references": [
      "Kementerian Kesihatan Malaysia (KKM) Dilution Guide for Fluid Restricted Critically Ill Adults."
    ]
  },
  {
    "id": "KKM-DIL-076",
    "pageNumber": 86,
    "rawTitle": "IMIPENEM/CILASTATIN 500 MG",
    "genericName": "Imipenem + Cilastatin",
    "brandNames": [
      "Imipenem",
      "Cilastatin Kabi"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Imipenem/Cilastatin Kabi",
    "reconstitutionText": "Reconstitute with 10 ml NS",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Maximum concentration of 5 mg/ml",
    "diluentText": "D5, NS (preferred)",
    "administrationText": "IV infusion: Infuse over 30 minutes – 3 hours",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "24 hours",
        "roomTemp": "4 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 24 hours 4 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Fresenius Kabi Malaysia Sdn. Bhd. Imipenem/cilastatin Kabi Product",
      "Leaflet. Revised Jan 2020.",
      "2. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-077",
    "pageNumber": 87,
    "rawTitle": "IMMUNOGLOBULIN G (IVIG)",
    "genericName": "Human Normal Immunoglobulin (IVIG)",
    "brandNames": [
      "Flebogamma 5% DIF (2.5 g",
      "50 ml) Intragam P (3 g",
      "50 ml)"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Flebogamma 5% DIF (2.5 g/50 ml) Intragam P (3 g/50 ml)",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV infusion: Infuse at an initial rate of 0.01 – 0.02 ml/kg/min for the first 30 minutes. If well tolerated, the rate may gradually be increased to a maximum\nof 0.1 ml/kg/min",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Should be administered by separate IV line.",
      "Administration rate may differ between brands."
    ],
    "references": [
      "1. CSL Behring (Australia) Pty Ltd. Product Insert for Intragam P. Revised",
      "Nov 2020.",
      "2. Grifols (M) Sdn Bhd. Product Insert for Flebogamma 5% DIF. Revised",
      "Aug 2011."
    ]
  },
  {
    "id": "KKM-DIL-078",
    "pageNumber": 88,
    "rawTitle": "INSULIN REGULAR",
    "genericName": "Insulin Regular (Soluble Human rDNA)",
    "brandNames": [
      "Actrapid"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Actrapid",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "SC, IV bolus: No further dilution required\nIV infusion: Maximum concentration of 0.5 – 1 IU/ml",
    "diluentText": "D5, D10, NS",
    "administrationText": "SC, IV bolus\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "After Dilution - 24 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "Kementerian Kesihatan Malaysia (KKM) Dilution Guide for Fluid Restricted Critically Ill Adults."
    ]
  },
  {
    "id": "KKM-DIL-079",
    "pageNumber": 89,
    "rawTitle": "IRON DEXTRAN 100 MG/2 ML",
    "genericName": "Iron Dextran",
    "brandNames": [
      "CosmoFer"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "CosmoFer",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Refer to Administration Regimens (IV Bolus, Slow IV Infusion, Total Dose Infusion, or Deep IM)",
    "diluentText": "10 – 20 ml 100 ml 500 ml Rate Administer over 10 – 20 minutes Infuse over at least 30 minutes Infuse over 4 – 6 hours Deep IM Administer undiluted in doses of up to 100 mg in the upper outer quadrant of the buttocks, alternate buttocks with subsequent injections.",
    "administrationText": "I. IV Injection (IV Bolus):\n• Test dose: Administer 25 mg over 1 – 2 minutes\n• Observation period: Observe for hypersensitivity reaction for at least 15 minutes after test dose\n• Therapeutic dose: 100 – 200 mg\n• Volume of diluent: 10 – 20 ml\n• Rate: Administer over 10 – 20 minutes\n\nII. Slow IV Infusion:\n• Test dose: Administer 25 mg over 15 minutes\n• Observation period: Observe for hypersensitivity reaction for at least 15 minutes after test dose\n• Therapeutic dose: 100 – 200 mg\n• Volume of diluent: 100 ml NS or D5\n• Rate: Infuse over at least 30 minutes\n\nIII. Total Dose Infusion (TDI):\n• Test dose: Administer 25 mg over 15 minutes\n• Observation period: Observe for hypersensitivity reaction for at least 15 minutes after test dose\n• Therapeutic dose: Max per dose 20 mg/kg\n• Volume of diluent: 500 ml NS (recommended)\n• Rate: Infuse over 4 – 6 hours\n\nIV. Deep Intramuscular (IM):\n• Administer undiluted in doses of up to 100 mg in the upper outer quadrant of the buttocks, alternate buttocks with subsequent injections.",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "Use immediately"
      }
    ],
    "stabilityRaw": "After Dilution - Use immediately",
    "comments": [
      "Discontinue oral iron preparations before starting IV therapy as",
      "concomitant use can cause the absorption of oral iron to be reduced. Oral",
      "iron should not be given within 5 days of last injection."
    ],
    "references": [
      "1. Lexi-Comp Inc. Lexi-Drug©. Version 6.4.0.",
      "2. Pharmacosmos. Iron Dextran 50 mg/ml Product Leaflet. Revised Mar",
      "2019."
    ]
  },
  {
    "id": "KKM-DIL-080",
    "pageNumber": 90,
    "rawTitle": "IRON SUCROSE 100 MG/5 ML",
    "genericName": "Iron (III) Hydroxide Sucrose Complex",
    "brandNames": [
      "Ainiron"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Ainiron",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "IV bolus: No further dilution required\nIV infusion: Not less than 1mg/ml",
    "diluentText": "NS",
    "administrationText": "I. Test dose (20 mg iron, 1 ml)\nIV bolus: Administer over 1 – 2 minutes\nIV infusion: Infuse over 15 minutes\nIf no adverse reactions occur, the remaining dose can be administered.\nII. Total dose\nIV bolus: Administer no faster than 20 mg per minute\nIV infusion: Infuse no faster than 6 mg per minute (100 mg over at least 15 minutes)",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "Use immediately"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - Use immediately",
    "comments": [
      "Monitor signs and symptoms of hypersensitivity reaction and hypotension",
      "during and after administration."
    ],
    "references": [
      "1. Ain Medicare Sdn Bhd. Ainiron Product Leaflet. Revised Jul 2019.",
      "2. Lexi-Comp Inc. Lexi-Drug©. Version 6.4.0.",
      "3. Truven Health Analytics. Micromedex."
    ]
  },
  {
    "id": "KKM-DIL-081",
    "pageNumber": 91,
    "rawTitle": "ISOPRENALINE 0.2 MG/1 ML & 1 MG/5 ML",
    "genericName": "Isoprenaline Hydrochloride",
    "brandNames": [
      "Isolin"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Isolin",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Maximum concentration of 20 mcg/ml",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "In dire emergencies, the drug may be administered by intracardiac",
      "injection. If time is not of the utmost importance, initial therapy by IM or",
      "SC injection is preferred.",
      "If HR > 110 bpm, it is advisable to decrease the infusion rate or",
      "temporarily discontinue."
    ],
    "references": [
      "1. Lexi-Comp Inc. Lexi-Drug©. Version 6.4.0.",
      "2. Samarth Life Sciences. Isolin Product Leaflet.",
      "3. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-082",
    "pageNumber": 92,
    "rawTitle": "ISOSORBIDE DINITRATE 10 MG/10 ML (0.1%)",
    "genericName": "Isosorbide Dinitrate (ISDN)",
    "brandNames": [
      "Isoket"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Isoket",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Maximum concentration of 0.5 mg/ml",
    "diluentText": "D5, NS",
    "administrationText": "IV continuous infusion: Initial dose 2 – 10 mg/hour. Titrate according to haemodynamic response (up to 20 mg/hour).\nNon-PVC administration sets and glass or PE/PP syringes/containers should be used if available to prevent drug sorption.\nDue to oversaturation of active ingredient, crystallization may occur in undiluted form.",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Avoid use of PVC infusion containers, administration sets and in-line filters if possible.",
      "Rigid plastics, i.e. polyethylene (PE), polytetrafluoroethylene (PTFE) or polypropylene (PP) sets and syringes should be used if available.",
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Isosorbide Dinitrate 0.05% w/v Solution for Injection or Infusion. Torbay",
      "&amp; South Devon NHS Foundation Trust; 2019. Available from:",
      "https://www.medicines.org.uk/emc/product/1994/smpc#gref",
      "2. Gray AH. Injectable Drugs Guide. London: Pharmaceutical Press; 2011.",
      "3. GSK. Isosorbide Dinitrate (Isoket®) Product Leaflet. Revised 2014."
    ]
  },
  {
    "id": "KKM-DIL-083",
    "pageNumber": 93,
    "rawTitle": "KETAMINE 200 MG/20 ML",
    "genericName": "Ketamine Hydrochloride",
    "brandNames": [
      "Aneket"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Aneket",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus: Administer at 0.5 mg/kg/min IV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "After Dilution - -",
    "comments": [
      "Rapid administration of IV bolus may result in respiratory depression and",
      "enhance pressor response (suggest to administer over 2 – 3 minutes).",
      "Do not mix with barbiturates or diazepam in the same syringe (precipitate",
      "formation is possible)."
    ],
    "references": [
      "1. Neon Laboratories. Aneket Ketamine HCl Injection USP Product Leaflet.",
      "2. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012.",
      "3. Uptodate. Ketamine Drug Information. Wolters Kluwer."
    ]
  },
  {
    "id": "KKM-DIL-084",
    "pageNumber": 94,
    "rawTitle": "LABETALOL 25 MG/5 ML",
    "genericName": "Labetalol Hydrochloride",
    "brandNames": [
      "Labetalol Hydrochloride"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Labetalol Hydrochloride",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus: Administer over 1 – 2 minutes\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "After Dilution - -",
    "comments": [
      "Patients should remain supine during and for up to 3 hours following",
      "injection (postural hypotension may occur)."
    ],
    "references": [
      "1. Lexi-Comp Inc. Lexi-Drug©. Version 6.4.0.",
      "2. Pharmaniaga. Labetalol HCl Injection Product Leaflet. Revised 19 Apr",
      "2017.",
      "3. Phelps SJ, Hageman TM, Thompson AJ, Lee KR. Pediatric injectable",
      "drugs ; the teddy bear book /by Stephanie J.Phelps, Emily B. Hak and",
      "Catherine M. Crill. 10th ed. Bethesda: American Society of Health-",
      "System Pharmacists; 2013.",
      "4. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-085",
    "pageNumber": 95,
    "rawTitle": "LEUCOVORIN CALCIUM 50 MG/5 ML",
    "genericName": "Leucovorin Calcium (Calcium Folinate)",
    "brandNames": [
      "Leucovorin Calcium"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Leucovorin Calcium",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution is required",
    "diluentText": "D5, NS",
    "administrationText": "IM\nIV bolus: Administer over 3 minutes\nIV infusion: Infuse over 15 minutes – 2 hours (rate not to exceed 160 mg/min)",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "24 hours",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 24 hours 24 hours",
    "comments": [
      "Leucovorin should not be mixed in the same infusion as 5-fluorouracil",
      "since this may lead to formation of precipitate.",
      "Protect from light."
    ],
    "references": [
      "1. Fresenius Kabi. Leucovorin Calcium Inj. USP Product Leaflet. Revised",
      "Jan 2018.",
      "2. Lexi-Comp Inc. Lexi-Drug©. Version 6.4.0.",
      "3. McAuley D. [Internet]. Leucovorin Calcium. GlobalRPh;2017. Available",
      "from: https://globalrph.com/oncology/leucovorin-calcium/"
    ]
  },
  {
    "id": "KKM-DIL-086",
    "pageNumber": 96,
    "rawTitle": "LEVETIRACETAM 500 MG/5 ML",
    "genericName": "Levetiracetam",
    "brandNames": [
      "Epitech Keppra"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Epitech Keppra",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Maximum concentration of 15 mg/ml (1500 mg in 100 ml)",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Infuse over 15 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "After Dilution - 24 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Averroes Pharmaceuticals. Epitech Product Leaflet. Revised 5 Nov",
      "2020.",
      "2. Lexi-Comp Inc. Lexi-Drug©. Version 6.4.0.",
      "3. Patheon Italia S.p.A. Keppra Product Leaflet. Revised 13 Mar 2020.",
      "4. Truven Health Analytics. Micromedex. Version 3.2.0."
    ]
  },
  {
    "id": "KKM-DIL-087",
    "pageNumber": 97,
    "rawTitle": "LEVOFLOXACIN 500 MG/100 ML",
    "genericName": "Levofloxacin",
    "brandNames": [
      "Levofloxol"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Levofloxol",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "Dose < 500 mg: Infuse over 60 minutes Dose ≥ 750 mg: Infuse over 90 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "After Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "500mg/100ml. Revised 9 Feb 2009."
    ]
  },
  {
    "id": "KKM-DIL-088",
    "pageNumber": 98,
    "rawTitle": "LIGNOCAINE HCL 20 MG/ML (PRESERVATIVE FREE)",
    "genericName": "Lignocaine Hydrochloride (Preservative Free)",
    "brandNames": [
      "INJECSOL LIG2",
      "Xylocaine"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "INJECSOL LIG2 2% w/v",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "D5",
    "administrationText": "IV bolus: Administer at rate of 25 – 50 mg/min Continuous infusion: Infusion rate of 1 – 4 mg/min",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "In cardiac arrest (e.g.: ventricular fibrillation or pulseless ventricular",
      "tachycardia), lignocaine may be administered rapidly into peripheral vein.",
      "Infusion should be given under ECG monitoring to avoid toxicity."
    ],
    "references": [
      "1. Ain Medicare Sdn. Bhd. Package Insert INJECSOL LIG2 2% w/v.",
      "Revised 26 Aug 2019.",
      "2. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-089",
    "pageNumber": 99,
    "rawTitle": "LINEZOLID 600 MG/300 ML",
    "genericName": "Linezolid",
    "brandNames": [
      "Zyvox"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Zyvox",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV infusion: Infuse over 30 – 120 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Keep infusion bags in foil overwrap until ready to use.",
      "Linezolid solution is chemically incompatible when combined with",
      "ceftriaxone sodium."
    ],
    "references": [
      "Kementerian Kesihatan Malaysia (KKM) Dilution Guide for Fluid Restricted Critically Ill Adults."
    ]
  },
  {
    "id": "KKM-DIL-090",
    "pageNumber": 100,
    "rawTitle": "MAGNESIUM SULPHATE 50% W/V 5 ML (CONTAINS 2.465 G MAGNESIUM EQUIVALENT TO 10 MMOL MAGNESIUM)",
    "genericName": "Magnesium Sulphate 50%",
    "brandNames": [
      "INJECSOL MgSO4"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "INJECSOL MgSO4",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Peripheral: Maximum concentration of 10% (1 ampoule in 50 ml)\nCentral: No further dilution required",
    "diluentText": "D5, NS",
    "administrationText": "IM: Undiluted\nIV infusion (Hypomagnesemia): Infuse over 60 minutes\nIV infusion (Asthma/Pre-Eclampsia/Eclampsia): Titrate as per dose\nprescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Incompatible with calcium salts, as calcium sulphate may precipitate",
      "when mixed together in the same intravenous solution."
    ],
    "references": [
      "1. Ain Medicare Sdn. Bhd. Package Insert INJECSOL MgSO4. Revised 8",
      "Oct 2020.",
      "2. McAuley D. [Internet]. Magnesium Sulfate Dilution. GlobalRPh;2017.",
      "Available from: https://globalrph.com/dilution/magnesium-sulfate/.",
      "3. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-091",
    "pageNumber": 101,
    "rawTitle": "MANNITOL 10% & 20%",
    "genericName": "Mannitol 10% / 20%",
    "brandNames": [
      "Infusol M10",
      "Infusol M20",
      "Mannitol Baxter"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Infusol M10, Infusol M20, Mannitol Baxter",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV infusion: Infuse over 30 – 60 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Use filter to avoid administration of crystallize solution.",
      "If crystallization occurs, warm up the solution to 70°C (using water bath)",
      "until crystals dissolve."
    ],
    "references": [
      "Apr 2020."
    ]
  },
  {
    "id": "KKM-DIL-092",
    "pageNumber": 102,
    "rawTitle": "MEROPENEM 500 MG & 1 G",
    "genericName": "Meropenem Trihydrate",
    "brandNames": [
      "Meropenem Kabi"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Meropenem Kabi",
    "reconstitutionText": "Reconstitute every 500 mg with 5 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "IV infusion: Maximum concentration of 20 mg/ml",
    "diluentText": "NS",
    "administrationText": "IV bolus: Infuse over at least 5 minutes\nIV infusion: Infuse over 30 minutes or as extended over 4 hours",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "8 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 8 hours",
    "comments": [
      "Alternatively can be diluted with D5 (stability 1 hour)"
    ],
    "references": [
      "1. Fresenius Kabi. Product Leaflet Meropenem Kabi 500 mg/1g. Revised",
      "Apr 2018.",
      "2. Loeuille G, D'Huart E, Vigneron J et al. Stability Studies of 16 Antibiotics",
      "for Continuous Infusion in Intensive Care Units and for Performing",
      "Outpatient Parenteral Antimicrobial Therapy. Antibiotics (Basel).",
      "2022;11(4):458.",
      "3. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-093",
    "pageNumber": 103,
    "rawTitle": "METHYLENE BLUE (METHYLTHIONINIUM CHLORIDE)",
    "genericName": "Methylene Blue (Methylthioninium Chloride)",
    "brandNames": [
      "Blue Beam"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Blue Beam",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "-",
    "administrationText": "IV infusion: Infuse over 5 – 30 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Product is hypotonic. Thus, it may be diluted in 50 ml D5 to avoid local",
      "pain.",
      "Do not mix with NS as it has been demonstrated that chloride reduces",
      "the solubility of methylene blue."
    ],
    "references": [
      "1. Provepharm Life Solutions. Package Insert PROVAYBLUE™. Revised",
      "Apr 2016.",
      "2. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-094",
    "pageNumber": 104,
    "rawTitle": "METHYLPREDNISOLONE 500 MG & 1000 MG",
    "genericName": "Methylprednisolone Sodium Succinate",
    "brandNames": [
      "Solu-Medrol"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Solu-Medrol",
    "reconstitutionText": "Reconstitute with diluent provided",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Peripheral: Maximum concentration of 5 mg/ml\nCentral: No further dilution required",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus (Dose < 250 mg): Administer over 5 minutes\nIV infusion (Dose ≥ 250 mg): Infuse over at least 30 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "48 hours"
      }
    ],
    "stabilityRaw": "After Dilution - 48 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. McAuley D. [Internet]. Solu Medrol-Methylprednisolone Dilution.",
      "GlobalRPh;2017. Available from:",
      "https://globalrph.com/dilution/methylprednisolone-solu-medrol/",
      "2. Pfizer (M) Sdn. Bhd. Package Insert Solu-Medrol 500mg, 1000mg.",
      "Revised 2 Jul 2021.",
      "3. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-095",
    "pageNumber": 105,
    "rawTitle": "METOCLOPRAMIDE 10 MG/2ML",
    "genericName": "Metoclopramide Hydrochloride",
    "brandNames": [
      "Malon"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Malon",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IM\nIV bolus: Administer over at least 3 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "After Dilution - -",
    "comments": [
      "Dose > 10 mg requires dilution in at least 50 ml NS."
    ],
    "references": [
      "Revised 6 Apr 2020."
    ]
  },
  {
    "id": "KKM-DIL-096",
    "pageNumber": 106,
    "rawTitle": "METRONIDAZOLE 500 MG/100ML",
    "genericName": "Metronidazole",
    "brandNames": [
      "Metronol"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Metronol",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "Infuse over 30 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "Revised 1 Jul 2019."
    ]
  },
  {
    "id": "KKM-DIL-097",
    "pageNumber": 107,
    "rawTitle": "MICAFUNGIN 50 MG",
    "genericName": "Micafungin Sodium",
    "brandNames": [
      "Mycamine"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Mycamine",
    "reconstitutionText": "Reconstitute each vial with 5 ml NS or D5",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Maximum concentration of 1 mg/ml",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Infuse over 1 hour",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "6 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 6 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Astellas Pharma Tech Co. Ltd. Package Insert Mycamine 50 mg.",
      "Revised 22 Aug 2017.",
      "2. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-098",
    "pageNumber": 108,
    "rawTitle": "MIDAZOLAM 5 MG/ML & 15 MG/3 ML",
    "genericName": "Midazolam Hydrochloride",
    "brandNames": [
      "Domi Injection",
      "Dormicum"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Domi Injection, Dormicum",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus (procedural sedation): Administer over at least 2 minutes\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Generally diluted in D5 or NS to a concentration of 1 mg/ml (stable for 24",
      "hours)."
    ],
    "references": [
      "1. Duopharma (M) Sdn. Bhd. Package Insert Domi Injection 5mg/ml.",
      "Revised 14 Jan 2021.",
      "2. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-099",
    "pageNumber": 109,
    "rawTitle": "MILRINONE 10 MG/10 ML",
    "genericName": "Milrinone Lactate",
    "brandNames": [
      "Primacor"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Primacor",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Maximum concentration of 0.2 mg/ml",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer over 10 minutes\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-100",
    "pageNumber": 110,
    "rawTitle": "MORPHINE 10 MG/1 ML",
    "genericName": "Morphine Sulphate",
    "brandNames": [
      "Morpheas"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Morpheas",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Maximum concentration of 2 mg/ml",
    "diluentText": "D5, NS",
    "administrationText": "SC\nIV bolus: Administer over 4 – 5 minutes\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 24 hours",
    "comments": [
      "Generally diluted in D5 or NS to a concentration of 1 mg/ml."
    ],
    "references": [
      "1. Duopharma (M). Sdn. Bhd. Package Insert Morpheas Injection",
      "10mg/ml. Revised 13 Feb 2020.",
      "2. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-101",
    "pageNumber": 111,
    "rawTitle": "MOXIFLOXACIN 400 MG/250 ML",
    "genericName": "Moxifloxacin Hydrochloride",
    "brandNames": [
      "Avelox"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Avelox",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV infusion: Infuse over 1 hour",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Bayer. Package Insert Avelox. Revised 27 Nov 2020.",
      "2. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-102",
    "pageNumber": 112,
    "rawTitle": "NALOXONE 0.4 MG/1 ML",
    "genericName": "Naloxone Hydrochloride",
    "brandNames": [
      "Mapin"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Mapin",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution is required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus: Administer over 3 - 5 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "May further dilute in 10 ml D5 or NS (concentration 0.04 mg/ml),",
      "administer over 3 - 5 minutes."
    ],
    "references": [
      "1. Duopharma (M) Sdn. Bhd. Package Insert MAPIN 0.4 mg/ml Injection.",
      "Revised 13 Mar 2019.",
      "2. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-103",
    "pageNumber": 113,
    "rawTitle": "NEOSTIGMINE METHYLSULPHATE 2.5 MG/1 ML",
    "genericName": "Neostigmine Methylsulphate",
    "brandNames": [
      "Setisin"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Setisin",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "-",
    "administrationText": "IM, SC\nIV bolus: Administer over at least 1 minute",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "After Dilution - -",
    "comments": [
      "Dose equivalent 0.5 mg IV = 1.0 – 1.5 mg IM/SC."
    ],
    "references": [
      "BP; Setisin Injection. Revised 22 Nov 2019."
    ]
  },
  {
    "id": "KKM-DIL-104",
    "pageNumber": 114,
    "rawTitle": "NIMODIPINE 10 MG/50 ML",
    "genericName": "Nimodipine",
    "brandNames": [
      "Nimotop"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Nimotop",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV infusion (central line only):\nBW < 70 kg: Infuse 0.5 mg/hour or less\nBW ≥ 70 kg: Infuse 1 mg/hour for 2 hours, then 2 mg/hour\nNimodipine solution should be co-infused with 1:4 ratio of NS or D5 via a\nthree-way stopcock (e.g.: Nimodipine 50 ml : co-infusion 200 ml)",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "Use immediately"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - Use immediately",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "Kementerian Kesihatan Malaysia (KKM) Dilution Guide for Fluid Restricted Critically Ill Adults."
    ]
  },
  {
    "id": "KKM-DIL-105",
    "pageNumber": 115,
    "rawTitle": "NORADRENALINE 4 MG/4 ML",
    "genericName": "Adrenaline (Epinephrine)",
    "brandNames": [
      "Cardiamed"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Cardiamed",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Peripheral: Maximum concentration of 0.08 mg/ml (4 mg in 50 ml)\nCentral: Maximum concentration of 0.64 mg/ml (32 mg in 50 ml)",
    "diluentText": "D5",
    "administrationText": "IV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 24 hours",
    "comments": [
      "Preferred dilution ranges from 4 – 8 mg in 50 ml (0.08 – 0.16 mg/ml).",
      "Administration via central line is recommended.",
      "Highly concentrated preparation may cause peripheral ischemia, use",
      "with caution."
    ],
    "references": [
      "1. Duopharma (M) Sdn. Bhd. Package Insert Cardiamed Injection 1mg/ml.",
      "Revised 31 Oct 2019.",
      "2. United Kingdom Clinical Pharmacy Association. Minimum Infusion",
      "Volumes for Critically Ill Patients. 4th ed. December 2012."
    ]
  },
  {
    "id": "KKM-DIL-106",
    "pageNumber": 116,
    "rawTitle": "OCTREOTIDE 0.05 MG/1 ML & 0.1 MG/1 ML",
    "genericName": "Octreotide Acetate",
    "brandNames": [
      "Sandostatin"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Sandostatin",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "SC, IV bolus: No further dilution required\nIV infusion: Maximum concentration of 10 mcg/ml",
    "diluentText": "D5, NS",
    "administrationText": "SC\nIV bolus: Administer over 3 minutes\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 24 hours",
    "comments": [
      "NS is the preferred diluent as octreotide can affect glucose homeostasis."
    ],
    "references": [
      "1. Graham-Clarke E. Minimum Infusion Volumes [Internet]. 4.4 ed. Vol. 4.",
      "United Kingdom Clinical Pharmacy Association; 2012. Available from:",
      "https://www.scottishintensivecare.org.uk/uploads/2014-07-24-19-56-30-",
      "MinimuminfusionvolumesinI-40262.pdf.",
      "2. Package Insert Sandostatin® 0.05mg/ml or 0.1mg/ml or 0.5mg/ml.",
      "Novartis (M) Sdn. Bhd. Revised Sept 2021."
    ]
  },
  {
    "id": "KKM-DIL-107",
    "pageNumber": 117,
    "rawTitle": "OMEPRAZOLE 40 MG",
    "genericName": "Omeprazole Sodium",
    "brandNames": [
      "Vaxcel Omeprazole"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Vaxcel Omeprazole",
    "reconstitutionText": "- 4 hours",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus: Administer over at least 3 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "After"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter",
    "comments": [
      "Protect from light. Vials that have been taken out of their original box can",
      "be kept in normal indoor light up to 24 hours."
    ],
    "references": [
      "1. Graham-Clarke E. Minimum Infusion Volumes [Internet]. 4.4 ed. Vol. 4.",
      "United Kingdom Clinical Pharmacy Association; 2012. Available from:",
      "https://www.scottishintensivecare.org.uk/uploads/2014-07-24-19-56-30-",
      "MinimuminfusionvolumesinI-40262.pdf.",
      "2. Package Insert Vaxcel Omeprazole 40mg Injection. Kotra Pharma.",
      "Revised 27 Nov 2020."
    ]
  },
  {
    "id": "KKM-DIL-108",
    "pageNumber": 118,
    "rawTitle": "ONDANSETRON 8 MG/4 ML",
    "genericName": "Ondansetron Hydrochloride",
    "brandNames": [
      "Ondatron"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Ondatron",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Dose 4 – 8 mg: No further dilution required Dose > 8 mg: Maximum concentration of 0.32 mg/ml (16 mg in 50 ml)",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus (Dose 4 – 8 mg): Administer over 2 – 5 minutes\nIV infusion (Dose > 8 mg): Infuse over at least 15 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "After Dilution - 24 hours",
    "comments": [
      "Alternatively, 4 mg dose may be administered intramuscularly (undiluted)",
      "as a single injection for adults."
    ],
    "references": [
      "1. Ain Medicare Sdn. Bhd. Package Insert Ondatron 2 mg/ml. Revised 1",
      "Jun 2020.",
      "2. McAuley D. Zofran ® – Ondansetron [Internet]. GlobalRPH. 2017 [cited",
      "2023 Apr 18]. Available from: https://globalrph.com/dilution/zofran-",
      "ondansetron/"
    ]
  },
  {
    "id": "KKM-DIL-109",
    "pageNumber": 119,
    "rawTitle": "PAMIDRONATE 30 MG/10 ML",
    "genericName": "Pamidronate Disodium",
    "brandNames": [
      "Pamisol"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Pamisol",
    "reconstitutionText": "Reconstitute with 10 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Maximum concentration of 0.36 mg/ml (90 mg in 250ml)",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Infuse over 2 – 24 hours",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "24 hours",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 24 hours 24 hours",
    "comments": [
      "Administer through a separate infusion line. Do not allow pamidronate",
      "disodium infusion to come in contact with any calcium or divalent cation-",
      "containing solutions.",
      "Longer infusion time > 2 hours may reduce risk for renal toxicity."
    ],
    "references": [
      "2. Pamisol Product Leaflet. Pfizer. Revised Sept 2020."
    ]
  },
  {
    "id": "KKM-DIL-110",
    "pageNumber": 120,
    "rawTitle": "PANTOPRAZOLE 40 MG",
    "genericName": "Pantoprazole Sodium",
    "brandNames": [
      "Vaxcel"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Vaxcel",
    "reconstitutionText": "Reconstitute with 10 ml NS",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "IV bolus: Maximum concentration of 4 mg/ml (40 mg in 10 ml)\nIV infusion: Maximum concentration of 2 mg/ml (40 mg in 20 ml)",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer over 2 – 15 minutes\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 24 hours",
    "comments": [
      "Do not administer other IV solution simultaneously through the same line."
    ],
    "references": [
      "1. Graham-Clarke E. Minimum Infusion Volumes [Internet]. 4.4 ed. Vol. 4.",
      "United Kingdom Clinical Pharmacy Association; 2012. Available from:",
      "https://www.scottishintensivecare.org.uk/uploads/2014-07-24-19-56-30-",
      "MinimuminfusionvolumesinI-40262.pdf",
      "2. Kotra Pharma. Vaxcel Product Leaflet. Revised 22 Feb 2019.",
      "3. Lexi-Comp Inc. Version 6.4.0. Lexi-Drug©. [cited 2023 Apr 18].",
      "4. McAuley D. Zofran ® – Pantoprazole-Protonix [Internet]. GlobalRPH.",
      "2017 [cited 2023 Apr 18]. Available from:",
      "https://globalrph.com/dilution/pantoprazole/"
    ]
  },
  {
    "id": "KKM-DIL-111",
    "pageNumber": 121,
    "rawTitle": "PARACETAMOL 1 G/100 ML",
    "genericName": "Paracetamol (IV Infusion)",
    "brandNames": [
      "Paracetamol Kabi Ifimol IV"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Paracetamol Kabi Ifimol IV",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV infusion: Infuse over 15 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "After Dilution - -",
    "comments": [
      "May be further diluted to 1/10 of current dilution (1 part paracetamol to 9",
      "parts D5 or NS)."
    ],
    "references": [
      "2. Lexi-Comp Inc. Version 6.4.0. Lexi-Drug©. [cited 2023 Apr 18]."
    ]
  },
  {
    "id": "KKM-DIL-112",
    "pageNumber": 122,
    "rawTitle": "PARECOXIB 40 MG",
    "genericName": "Parecoxib Sodium",
    "brandNames": [
      "Dynastat"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Dynastat",
    "reconstitutionText": "Reconstitute with 2 ml D5 or NS",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IM\nIV bolus: Administer rapidly",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "After Dilution - 24 hours",
    "comments": [
      "Use of WFI for reconstitution is not recommended (solution is not",
      "isotonic)."
    ],
    "references": [
      "Kementerian Kesihatan Malaysia (KKM) Dilution Guide for Fluid Restricted Critically Ill Adults."
    ]
  },
  {
    "id": "KKM-DIL-113",
    "pageNumber": 123,
    "rawTitle": "PARENTROVITE (AMPOULE NO. 1, 5 ML & AMPOULE NO. 2, 5 ML) (CONTAINS ASCORBIC ACID, NICOTINAMIDE, PANTOTHENIC ACID, PYRIDOXINE, RIBOFLAVIN AND THIAMINE)",
    "genericName": "Parentrovite (High Potency Multivitamins IV)",
    "brandNames": [
      "Trovite"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Trovite",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "IV bolus: No further dilution required\nIV infusion: Maximum concentration of 1 pair in 50 ml",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer over 10 minutes\nIV infusion: Infuse over 30 minutes",
    "stabilityRows": [
      {
        "phase": "Mixed Ampoules (Before Dilution)",
        "fridge": "-",
        "roomTemp": ""
      },
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "(Before Dilution) - 4 hours"
      },
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "4 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nMixed Ampoules\n(Before Dilution) - 4 hours\nAfter Dilution - 4 hours",
    "comments": [
      "IV infusion is the preferred method of administration."
    ],
    "references": [
      "Kementerian Kesihatan Malaysia (KKM) Dilution Guide for Fluid Restricted Critically Ill Adults."
    ]
  },
  {
    "id": "KKM-DIL-114",
    "pageNumber": 124,
    "rawTitle": "PENTAMIDINE 300 MG",
    "genericName": "Pentamidine Isethionate",
    "brandNames": [
      "DBL Pentamidine Isethionate"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "DBL Pentamidine Isethionate",
    "reconstitutionText": "Reconstitute with 3 to 5 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "IM: No further dilution required\nIV infusion: Maximum concentration of 6 mg/ml (300 mg in 50 ml)",
    "diluentText": "D5, NS",
    "administrationText": "IM: Deep IM\nIV infusion: Infuse over 60 – 120 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "After Dilution - 24 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Lexi-Comp Inc. Version 6.4.0. Lexi-Drug©. [cited 2023 Apr 18].",
      "2. Pfizer. DBL Pentamidine Isethionate Product Leaflet. Revised 8 Feb",
      "2018."
    ]
  },
  {
    "id": "KKM-DIL-115",
    "pageNumber": 125,
    "rawTitle": "PHENOBARBITAL SODIUM 200 MG/1 ML",
    "genericName": "Phenobarbital Sodium",
    "brandNames": [
      "Phenobarbital Sodium"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Phenobarbital Sodium",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "IM\nNo further dilution required\nIV infusion Dose < 100 mg: Dilute with 50 ml Dose > 100 mg: Dilute with 100 ml",
    "diluentText": "D5, NS",
    "administrationText": "IM: Deep IM. Not to exceed a volume of 5 ml per injection site (risk of tissue\nirritation)\nIV infusion: Not to exceed rate of 60 mg/min",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Micromedex Drug Reference. Version 4.0.0 (881) Merative US L.P. [cited",
      "2023 Apr 18].",
      "2. Product Leaflet Phenobarbital Sodium Injection. Revised Jan 2018."
    ]
  },
  {
    "id": "KKM-DIL-116",
    "pageNumber": 126,
    "rawTitle": "PHENYLEPHRINE 10 MG/1ML",
    "genericName": "Phenylephrine Hydrochloride",
    "brandNames": [
      "Zyphrin"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Zyphrin",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Maximum concentration of 1 mg/ml",
    "diluentText": "D5, NS (preferred)",
    "administrationText": "IV bolus: Administer over 20 – 30 seconds\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "24 hours",
        "roomTemp": "4 hours"
      }
    ],
    "stabilityRaw": "After Dilution 24 hours 4 hours",
    "comments": [
      "Central line is preferred if administered via continuous infusion",
      "(extravasation may cause severe ischemic necrosis)."
    ],
    "references": [
      "1. Graham-Clarke E. Minimum Infusion Volumes [Internet]. 4.4 ed. Vol. 4.",
      "United Kingdom Clinical Pharmacy Association; 2012. Available from:",
      "https://www.scottishintensivecare.org.uk/uploads/2014-07-24-19-56-30-",
      "MinimuminfusionvolumesinI-40262.pdf.",
      "2. Lexi-Comp Inc. Version 6.4.0. Lexi-Drug©. [cited 2023 Apr 18]."
    ]
  },
  {
    "id": "KKM-DIL-117",
    "pageNumber": 127,
    "rawTitle": "PHENYTOIN 250 MG/5 ML",
    "genericName": "Phenytoin Sodium",
    "brandNames": [
      "Pharmaniaga phenytoin sodium"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Pharmaniaga phenytoin sodium",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Maximum concentration of 10 mg/ml",
    "diluentText": "NS",
    "administrationText": "IV infusion: Rate not exceeding 50 mg/min. Complete within 1 hour",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "Use immediately"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - Use immediately",
    "comments": [
      "Intravenous solutions should be preceded by a saline flush and followed",
      "by an injection of sterile saline through the same needle or catheter to",
      "avoid local venous irritation due to the alkalinity of the solution:",
      "o Fluid restricted patients: 10 ml NS",
      "o Non-fluid restricted patients: 50 ml NS"
    ],
    "references": [
      "1. Graham-Clarke E. Minimum Infusion Volumes [Internet]. 4.4 ed. Vol. 4.",
      "United Kingdom Clinical Pharmacy Association; 2012. Available from:",
      "https://www.scottishintensivecare.org.uk/uploads/2014-07-24-19-56-30-",
      "MinimuminfusionvolumesinI-40262.pdf",
      "2. Lexi-Comp Inc. Version 6.4.0. Lexi-Drug©. [cited 2023 Apr 18].",
      "3. Pharmaniaga. Phenytoin Sodium 250 mg/5 ml Injection Leaflet. Revised",
      "30 May 2017."
    ]
  },
  {
    "id": "KKM-DIL-118",
    "pageNumber": 128,
    "rawTitle": "PHYTOMENADIONE 10 MG/1ML",
    "genericName": "Phytomenadione (Vitamin K1)",
    "brandNames": [
      "Kisan"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Kisan",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV infusion: Should not exceed 1 mg/min",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "IM administration are not advisable due to difficulties with the re-",
      "institution of anticoagulation therapy and risk of haematoma formation."
    ],
    "references": [
      "Revised 23 May 2019."
    ]
  },
  {
    "id": "KKM-DIL-119",
    "pageNumber": 129,
    "rawTitle": "PIPERACILLIN/TAZOBACTAM 4.5 G (PIPERACILLIN 4 G & TAZOBACTAM 0.5 G)",
    "genericName": "Piperacillin + Tazobactam",
    "brandNames": [
      "Aurotaz-P"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Aurotaz-P",
    "reconstitutionText": "48 hours 24 hours",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus: Administer over 3 – 5 minutes\nIV infusion: Infuse over 20 – 30 minutes or as extended over 4 hours",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "After"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter",
    "comments": [
      "Further dilution with 50 ml D5 or NS is recommended for extended",
      "infusion administration."
    ],
    "references": [
      "1. Aurobindo Pharma Ltd. Aurotaz-P Product Leaflet. Revised Aug 2019.",
      "2. Graham-Clarke E. Minimum Infusion Volumes [Internet]. 4.4 ed. Vol. 4.",
      "United Kingdom Clinical Pharmacy Association; 2012. Available from:",
      "https://www.scottishintensivecare.org.uk/uploads/2014-07-24-19-56-30-",
      "MinimuminfusionvolumesinI-40262.pdf",
      "3. Lexi-Comp Inc. Version 6.4.0. Lexi-Drug©. [cited 2023 Apr 18].",
      "4. Medscape. Version 1124.0. WebMD, LLC. [cited 2023 Apr 18]."
    ]
  },
  {
    "id": "KKM-DIL-120",
    "pageNumber": 130,
    "rawTitle": "PIRACETAM 1 G/5 ML",
    "genericName": "Piracetam",
    "brandNames": [
      "YSP Knowful"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "YSP Knowful",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Dilute with diluent for IV infusion",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer over several minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. MIMS Online. Knowful-Piracetam [Internet]. MIMS. [cited 2023 Apr 18].",
      "Available from: https://www.mims.com/malaysia/drug/info/knowful",
      "2. Medscape. Version 1124.0. WebMD, LLC. [cited 2023 Apr 18].",
      "3. Y.S.P. Industries (M). Product leaflet YSP Knowful Injection 200 mg/ml.",
      "Revised 25 Aug 2015."
    ]
  },
  {
    "id": "KKM-DIL-121",
    "pageNumber": 131,
    "rawTitle": "POLYMYXIN B SULPHATE 500,000 UNITS (50 MG)",
    "genericName": "Polymyxin B Sulphate",
    "brandNames": [
      "Poly-MxB"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Poly-MxB",
    "reconstitutionText": "Reconstitute with 10 ml NS",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "IT: No further dilution required\nIV infusion: Maximum concentration of 20,000 units/ml (2 mg/ml)",
    "diluentText": "D5, NS",
    "administrationText": "IT: Use a preservative-free preparation for IT administration\nIV infusion: Infuse over 60 – 90 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "24 hours",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "After Dilution 24 hours 24 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Bharat Serums and Vaccines Ltd. Poly-MxB Product Leaflet. Revised",
      "31 Oct 18.",
      "2. Lexi-Comp Inc. Version 6.4.0. Lexi-Drug©. [cited 2023 Apr 18].",
      "3. Lim TP, Hee DK, Lee W, Teo JQ, Cai Y, Chia SY, Leaw JY, Lee SJ, Lee",
      "LS, Kwa AL. Physicochemical Stability Study of Polymyxin B in Various",
      "Infusion Solutions for Administration to Critically Ill Patients. Annals of",
      "Pharmacotherapy. 2016 Sep;50(9):790-2."
    ]
  },
  {
    "id": "KKM-DIL-122",
    "pageNumber": 132,
    "rawTitle": "POTASSIUM CHLORIDE 10% W/V 10 ML (CONTAINS 1 G POTASSIUM CHLORIDE EQUIVALENT TO 13.4 MMOL POTASSIUM, 13.4 MMOL CHLORIDE)",
    "genericName": "Potassium Chloride 10% (KCl)",
    "brandNames": [
      "Injecsol K10"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Injecsol K10",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Peripheral: Maximum concentration of 1 g potassium chloride (13.4 mmol\npotassium) in at least 140 ml\nCentral: Maximum concentration of 1 g potassium chloride (13.4 mmol\npotassium) in at least 34 ml",
    "diluentText": "NS",
    "administrationText": "Peripheral: Infuse 1 g potassium chloride (13.4 mmol potassium) over at least 60 minutes\nCentral: Infuse 1 g potassium chloride (13.4 mmol potassium) over at least 30 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Do not administer undiluted or by IV push; may cause fatal cardiac arrest.",
      "Dilution in glucose solution may decrease serum potassium",
      "concentration, producing intracellular shift."
    ],
    "references": [
      "1. Ain Medicare Sdn. Bhd. Product Leaflet Potassium Chloride 10% w/v",
      "Injection BP. Revised 1 Jun 2020.",
      "2. Gray A. Injectable drugs guide. Pharmaceutical Press; 2011.",
      "3. McAuley D. Potassium Chloride – KCl. [Internet]. GlobalRPH. 2017 [cited",
      "2023 Apr 18]. Available from: https://globalrph.com/dilution/potassium-",
      "chloride-kcl/",
      "4. UpToDate [Internet]. www.uptodate.com. Wolters Kluwer; [cited 2023 Apr",
      "18]. Available from: https://www.uptodate.com/contents/potassium-",
      "chloride-drug-information."
    ]
  },
  {
    "id": "KKM-DIL-123",
    "pageNumber": 133,
    "rawTitle": "POTASSIUM DIHYDROGEN PHOSPHATE 10 ML (CONTAINS 10 MMOL POTASSIUM & 10 MMOL PHOSPHATE)",
    "genericName": "Potassium Dihydrogen Phosphate",
    "brandNames": [
      "DBL Potassium Dihydrogen Phosphate"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "DBL Potassium Dihydrogen Phosphate",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Peripheral: Maximum concentration of 10 mmol phosphate in 250 ml\nCentral: Maximum concentration of 10 mmol phosphate in 50 ml",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Infuse no faster than 7.5mmol phosphate per hour\n(recommended 4 – 6 hours)",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 24 hours",
    "comments": [
      "Phosphates are incompatible with calcium and/or magnesium containing",
      "solutions."
    ],
    "references": [
      "1. Graham-Clarke E. Minimum Infusion Volumes [Internet]. 4.4 ed. Vol. 4.",
      "United Kingdom Clinical Pharmacy Association; 2012. Available from:",
      "https://www.scottishintensivecare.org.uk/uploads/2014-07-24-19-56-30-",
      "MinimuminfusionvolumesinI-40262.pdf",
      "2. Lexi-Comp Inc. Version 6.4.0. Lexi-Drug©. [cited 2023 Apr 18].",
      "3. Pfizer. Product leaflet DBL Potassium Dihydrogen Phosphate",
      "Concentrated Injection. Revised 25 Jun 2019."
    ]
  },
  {
    "id": "KKM-DIL-124",
    "pageNumber": 134,
    "rawTitle": "PRALIDOXIME 500 MG/20 ML INJECTION",
    "genericName": "Pralidoxime Chloride (2-PAM)",
    "brandNames": [
      "Pampara"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Pampara",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Loading dose\nNo further dilution required\nMaintenance dose\nI. Fluid restricted patients: No further dilution required\nII. Non-fluid restricted patients: Maximum concentration of 20 mg/ml",
    "diluentText": "NS",
    "administrationText": "IV bolus, IV infusion\nI. Loading dose: Administer over at least 5 minutes\nII. Maintenance dose: Infuse over 15 – 30 minutes (not to exceed 200 mg/min)",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "ml. Revised 22 Nov 2017."
    ]
  },
  {
    "id": "KKM-DIL-125",
    "pageNumber": 135,
    "rawTitle": "PROCYCLIDINE 10 MG/2 ML",
    "genericName": "Procyclidine Hydrochloride",
    "brandNames": [
      "Cyclid Kemadrin"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Cyclid Kemadrin",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IM\nIV bolus: Administer rapidly",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "Injection."
    ]
  },
  {
    "id": "KKM-DIL-126",
    "pageNumber": 136,
    "rawTitle": "PROPOFOL 1% & 2%",
    "genericName": "Propofol 1% / 2%",
    "brandNames": [
      "Propofol Injectable Emulsion USP Hypro-Melt 1%"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Propofol Injectable Emulsion USP Hypro-Melt 1%",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus, IV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Avoid rapid bolus administration to minimize hypotension.",
      "Emulsion transferred to a syringe should be done immediately after",
      "opening the vial and must be used within 12 hours from transfer.",
      "If two layers can be seen after shaking, the emulsion should not be used."
    ],
    "references": [
      "1. Celon Laboratories Ltd. Product Leaflet Propofol Injectable Emulsion",
      "USP Hypro-Melt 1%.",
      "2. Micromedex Drug Reference. Version 4.0.0 (881) Merative US L.P. [cited",
      "2023 Apr 18]."
    ]
  },
  {
    "id": "KKM-DIL-127",
    "pageNumber": 137,
    "rawTitle": "PROTAMINE 50 MG/5 ML",
    "genericName": "Protamine Sulphate",
    "brandNames": [
      "Protamine Sulphate"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Protamine Sulphate",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV infusion: Infuse over 10 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "No more than 50 mg of protamine sulphate should be given in any one",
      "dose.",
      "Too rapid administration of protamine sulphate may cause severe",
      "hypotension and anaphylactic reactions."
    ],
    "references": [
      "Solution for Injection. Revised 25 Oct 2013."
    ]
  },
  {
    "id": "KKM-DIL-128",
    "pageNumber": 138,
    "rawTitle": "3 FACTORS PROTHROMBIN COMPLEX CONCENTRATE 500 IU (FACTOR II, IX & X)",
    "genericName": "Prothrombin Complex Concentrate (3-Factor PCC)",
    "brandNames": [
      "Prothrombinex"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Prothrombinex",
    "reconstitutionText": "- Use immediately",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV infusion: Infuse at rate of 3 ml/min",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "After"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter",
    "comments": [
      "Allow the vials of Prothrombinex and solvent to reach temperature 20-",
      "30°C before reconstituting."
    ],
    "references": [
      "5 Mar 2015."
    ]
  },
  {
    "id": "KKM-DIL-129",
    "pageNumber": 139,
    "rawTitle": "4 FACTORS PROTHROMBIN COMPLEX CONCENTRATE (FACTOR II, VII, IX & X AND PROTEIN C & S)",
    "genericName": "Prothrombin Complex Concentrate (4-Factor PCC)",
    "brandNames": [
      "Octaplex"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Octaplex",
    "reconstitutionText": "8 hours 8 hours",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV infusion: Initially 1ml/min, then not faster than 2 – 3ml per minute",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "After"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter",
    "comments": [
      "If the powder fails to dissolve completely or an aggregate is formed, do",
      "not use the preparation."
    ],
    "references": [
      "2018."
    ]
  },
  {
    "id": "KKM-DIL-130",
    "pageNumber": 140,
    "rawTitle": "RASBURICASE 1.5 MG",
    "genericName": "Rasburicase",
    "brandNames": [
      "Rasburnat Elitek"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Rasburnat Elitek",
    "reconstitutionText": "Reconstitute 1.5 mg with 1 ml solvent provided. Mix gently. Do not shake or vortex.",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Maximum concentration of 0.2 mg/kg in 50 ml",
    "diluentText": "NS",
    "administrationText": "IV infusion: Infuse over 30 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours Use within 3 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 24 hours Use within 3 hours",
    "comments": [
      "Infuse through a separate line or flush IV line with at least 15 ml saline",
      "prior to and following rasburicase infusion.",
      "Discard reconstituted solution if particulate matter is visible or product is",
      "discolored.",
      "Do not use filters during reconstitution or infusion."
    ],
    "references": [
      "2. Sanofi-Aventis. Rasburicase Product Leaflet. Revised Oct 2009."
    ]
  },
  {
    "id": "KKM-DIL-131",
    "pageNumber": 141,
    "rawTitle": "REMIFENTANIL 5 MG/10 ML",
    "genericName": "Remifentanil Hydrochloride",
    "brandNames": [
      "Ultiva"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Ultiva",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Maximum concentration of 0.4 mg/ml (10 mg in 25 ml)",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer over at least 30 seconds\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "After Dilution - 24 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. GlaxoSmithKline. Remifentanil (ULTIVA®) Product Leaflet. Revised 15",
      "Mar 2021.",
      "2. Graham-Clarke E. Minimum Infusion Volumes [Internet]. 4.4 ed. Vol. 4.",
      "United Kingdom Clinical Pharmacy Association; 2012. Available from:",
      "https://www.scottishintensivecare.org.uk/uploads/2014-07-24-19-56-30-",
      "MinimuminfusionvolumesinI-40262.pdf",
      "3. Micromedex Drug Reference. Version 4.0.0 (881) Merative US L.P. [cited",
      "2023 Apr 18]."
    ]
  },
  {
    "id": "KKM-DIL-132",
    "pageNumber": 142,
    "rawTitle": "ROCURONIUM 25 MG/2.5 ML & 50 MG/5 ML",
    "genericName": "Rocuronium Bromide",
    "brandNames": [
      "Rocuronium Kabi"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Rocuronium Kabi",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus: Administer rapidly\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "After Dilution - -",
    "comments": [
      "IV infusion can be further diluted to concentration of 0.1 to 5 mg/ml with",
      "D5 or NS if required."
    ],
    "references": [
      "1. Fresenius Kabi. Rocuronium Kabi Product Leaflet. Revised Jun 2021.",
      "2. Lexi-Comp Inc. Version 6.4.0. Lexi-Drug©. [cited 2023 Apr 18].",
      "3. Medscape. Version 1124.0. WebMD, LLC. [cited 2023 Apr 18].",
      "4. Micromedex Drug Reference. Version 4.0.0 (881) Merative US L.P. [cited",
      "2023 Apr 18]."
    ]
  },
  {
    "id": "KKM-DIL-133",
    "pageNumber": 143,
    "rawTitle": "SALBUTAMOL 0.5 MG/1 ML",
    "genericName": "Salbutamol Sulphate",
    "brandNames": [
      "YSP Salbutamol"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "YSP Salbutamol",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "IV bolus: Maximum concentration of 0.05 mg/ml\nIV infusion: Maximum concentration of 0.2 mg/ml",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer slowly\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "After Dilution - 24 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Graham-Clarke E. Minimum Infusion Volumes [Internet]. 4.4 ed. Vol. 4.",
      "United Kingdom Clinical Pharmacy Association; 2012. Available from:",
      "https://www.scottishintensivecare.org.uk/uploads/2014-07-24-19-56-30-",
      "MinimuminfusionvolumesinI-40262.pdf",
      "2. Y.S.P Industries (M). Salbutamol Product Leaflet. Revised 16 Jun 2017."
    ]
  },
  {
    "id": "KKM-DIL-134",
    "pageNumber": 144,
    "rawTitle": "SODIUM BICARBONATE 8.4% W/V 10 ML (CONTAINS 10 MMOL BICARBONATE & 10 MMOL SODIUM)",
    "genericName": "Sodium Bicarbonate 8.4%",
    "brandNames": [
      "DB Sodium Bicarbonate"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "DB Sodium Bicarbonate",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer slowly\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Administration with catecholamines in the same IV catheter will result in",
      "inactivation of catecholamines."
    ],
    "references": [
      "1. Duopharma (M) Sdn. Bhd. DB Sodium Bicarbonate 8.4% w/v Injection",
      "Product Leaflet. Revised 26 Aug 2019.",
      "2. McAuley D. Sodium Bicarbonate [Internet]. GlobalRPH. 2017 [cited 2023",
      "Apr 18]. Available from: https://globalrph.com/dilution/zofran-",
      "ondansetron/",
      "3. Medscape. Version 1124.0. WebMD, LLC. [cited 2023 Apr 18].",
      "4. Micromedex Drug Reference. Version 4.0.0 (881) Merative US L.P. [cited",
      "2023 Apr 18]."
    ]
  },
  {
    "id": "KKM-DIL-135",
    "pageNumber": 145,
    "rawTitle": "SODIUM GLYCEROPHOSPHATE 20 ML (CONTAINS 20 MMOL PHOSPHATE & 40 MMOL SODIUM)",
    "genericName": "Sodium Glycerophosphate",
    "brandNames": [
      "Glycophos"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Glycophos",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Peripheral: Maximum concentration of 20 mmol phosphate in 100 ml\nCentral: Maximum concentration of 20 mmol phosphate in 50 ml",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Infuse no faster than 7.5 mmol phosphate per hour\n(recommended 4 – 6 hours)",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 24 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Fresenius Kabi. Glycophos Product Leaflet. Revised 3 Dec 2019.",
      "2. Graham-Clarke E. Minimum Infusion Volumes [Internet]. 4.4 ed. Vol. 4.",
      "United Kingdom Clinical Pharmacy Association; 2012. Available from:",
      "https://www.scottishintensivecare.org.uk/uploads/2014-07-24-19-56-30-",
      "MinimuminfusionvolumesinI-40262.pdf",
      "3. Lexi-Comp Inc. Version 6.4.0. Lexi-Drug©. [cited 2023 Apr 18]."
    ]
  },
  {
    "id": "KKM-DIL-136",
    "pageNumber": 146,
    "rawTitle": "SODIUM NITROPRUSSIDE 50 MG/2 ML",
    "genericName": "Sodium Nitroprusside",
    "brandNames": [
      "Nipride"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Nipride",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Maximum concentration 1 mg/ml",
    "diluentText": "D5",
    "administrationText": "IV continuous infusion: Initial rate 0.3 – 0.5 mcg/kg/min, titrate upwards every 5 minutes to desired blood pressure response (usual range 0.5 – 3 mcg/kg/min; maximum rate 10 mcg/kg/min for not more than 10 minutes).\nAdminister via dedicated infusion pump only. Protect infusion container and tubing from light with opaque foil.",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 24 hours",
    "comments": [
      "Product should always be protected from light, even during administration (wrap bag and tubing in aluminum foil).",
      "Monitor for thiocyanate / cyanide toxicity during prolonged infusion (> 72 hours) or renal failure.",
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Graham-Clarke E. Minimum Infusion Volumes [Internet]. 4.4 ed. Vol. 4.",
      "United Kingdom Clinical Pharmacy Association; 2012. Available from:",
      "https://www.scottishintensivecare.org.uk/uploads/2014-07-24-19-56-30-",
      "MinimuminfusionvolumesinI-40262.pdf",
      "2. Lexi-Comp Inc. Version 6.4.0. Lexi-Drug©. [cited 2023 Apr 18].",
      "(Retrieved from missing)",
      "3. Medscape. Version 1124.0. WebMD, LLC. [cited 2023 Apr 18].",
      "4. Pfizer. Sodium Nitroprusside Product Leaflet. Revised 27 Jul 2017.",
      "5. UpToDate [Internet]. www.uptodate.com. Wolters Kluwer; [cited 2023 Apr",
      "18]. Available from: https://www.uptodate.com/contents/nitroprusside-",
      "drug-information"
    ]
  },
  {
    "id": "KKM-DIL-137",
    "pageNumber": 147,
    "rawTitle": "SODIUM VALPROATE 400 MG",
    "genericName": "Sodium Valproate",
    "brandNames": [
      "Epilim"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Epilim",
    "reconstitutionText": "Reconstitute with solvent (4 ml) provided",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "IV bolus: No further dilution required\nIV infusion: Dilute prescribed dose with 50 ml",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer over 3 – 5 minutes\nIV infusion: Infuse over 1 hour (maximum rate of 20 mg/min)",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "24 hours",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "After Dilution 24 hours 24 hours",
    "comments": [
      "Rapid infusion is associated with increased risk of adverse events, but",
      "reported to be well-tolerated in limited studies."
    ],
    "references": [
      "1. Lexi-Comp Inc. Version 6.4.0. Lexi-Drug©. [cited 2023 Apr 18].",
      "2. Medscape. Version 1124.0. WebMD, LLC. [cited 2023 Apr 18].",
      "3. Micromedex Drug Reference. Version 4.0.0 (881) Merative US L.P. [cited",
      "2023 Apr 18].",
      "4. Sanofi-Aventis. Sodium Valproate (Epilim) Product Leaflet. Revised May",
      "2020.",
      "5. UpToDate [Internet]. www.uptodate.com. Wolters Kluwer; [cited 2023 Apr",
      "18]. Available from: https://www.uptodate.com/contents/valproate-",
      "chloride-drug-information."
    ]
  },
  {
    "id": "KKM-DIL-138",
    "pageNumber": 148,
    "rawTitle": "STREPTOKINASE 1,500,000 IU",
    "genericName": "Streptokinase",
    "brandNames": [
      "Streptase",
      "Streptokinase Karma",
      "Streptokinase Biofactor"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Streptase, Streptokinase Karma 1,500,000 IU, Streptokinase Biofactor",
    "reconstitutionText": "Reconstitute with 5 ml NS or WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Maximum concentration of 30,000 IU/ml (1,500,000 IU in 50 ml)",
    "diluentText": "D5, NS",
    "administrationText": "Myocardial infarction: 1.5 MU over 1 hour\nPulmonary embolism, deep vein thrombosis: 250,000 IU over 30 minutes, then 100,000 IU/hour for 24 hours (72 hours for DVT)",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "12 hours (Biofactor), 24 hours (Karma / Streptase)"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution: 12 hours (Biofactor) / 24 hours (Karma & Streptase)",
    "comments": [
      "Solution should be swirled gently to facilitate quick reconstitution, avoid",
      "shaking to avoid foaming.",
      "Stability of diluted solution is brand specific."
    ],
    "references": [
      "1. Biofactor GmbH. Streptokinase Product Leaflet. Revised Jul 2009.",
      "2. CSL Behring Canada Inc. Streptase® Product Leaflet. Revised 23 Feb",
      "2007.",
      "3. Karma Pharmatech GmbH. Streptokinase Karma Product Leaflet.",
      "Revised Dec 2020."
    ]
  },
  {
    "id": "KKM-DIL-139",
    "pageNumber": 149,
    "rawTitle": "STREPTOMYCIN 1 G",
    "genericName": "Streptomycin Sulphate",
    "brandNames": [
      "Streptin"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Streptin",
    "reconstitutionText": "Reconstitute with NS or WFI; 3.5 ml (250 mg/ml) 4.5 ml (200 mg/ml)",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "IM: No further dilution required\nIV infusion: Dilute prescribed dose in 100 ml",
    "diluentText": "D5, NS",
    "administrationText": "IM\nIV infusion: Infuse over 30 – 60 minutes (off label route)",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - 24 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "[cited 2023 Apr 18]."
    ]
  },
  {
    "id": "KKM-DIL-140",
    "pageNumber": 150,
    "rawTitle": "SUGAMMADEX 200 MG/2 ML",
    "genericName": "Sugammadex Sodium",
    "brandNames": [
      "Bridion"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Bridion",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus: Administer over 10 seconds",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Flush the infusion line with NS between administration of sugammadex",
      "and other medicinal agents.",
      "Some experts suggest administering slow IV push to reduce incidence of",
      "serious adverse events."
    ],
    "references": [
      "1. Merck Sharp & Dohme (M) Sdn Bhd. Sugammadex Sodium (Bridion)",
      "Injection Product Leaflet. Revised May 2020.",
      "2. Micromedex Drug Reference. Version 4.0.0 (881) Merative US L.P. [cited",
      "2023 Apr 18]."
    ]
  },
  {
    "id": "KKM-DIL-141",
    "pageNumber": 151,
    "rawTitle": "SUXAMETHONIUM CHLORIDE 100 MG/2 ML",
    "genericName": "Suxamethonium Chloride",
    "brandNames": [
      "Scolax"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Scolax",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus: Administer over 10 – 30 seconds",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Incompatible with alkaline solutions."
    ],
    "references": [
      "1. Chandra Bhagat Pharma Ltd. Product Leaflet Scolax® Injection 50",
      "mg/ml.",
      "2. Medscape. Version 1124.0. WebMD, LLC. [cited 2023 Apr 18].",
      "3. Micromedex Drug Reference. Version 4.0.0 (881) Merative US L.P.",
      "[cited 2023 Apr 18].",
      "4. Patricia Dwyer Schull. Mcgraw-Hill’s I.V. drug handbook. New York",
      "Mcgraw Hill Professional; 2009."
    ]
  },
  {
    "id": "KKM-DIL-142",
    "pageNumber": 152,
    "rawTitle": "TENECTEPLASE 50 MG (10,000 UNITS)",
    "genericName": "Tenecteplase (TNK-tPA)",
    "brandNames": [
      "Metalyse"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Metalyse",
    "reconstitutionText": "24 hours 8 hours",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus: Administer over 5 – 10 seconds",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "After"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter",
    "comments": [
      "Incompatible with dextrose."
    ],
    "references": [
      "1. Boehringer Ingelheim Pharma GmbH & Co. KG. Product Leaftlet",
      "Metalyse® Powder and Solvent for Solution for Injection. Revised 7 Feb",
      "2014."
    ]
  },
  {
    "id": "KKM-DIL-143",
    "pageNumber": 153,
    "rawTitle": "TERLIPRESSIN 1 MG/8.5 ML",
    "genericName": "Terlipressin Acetate",
    "brandNames": [
      "Glypressin"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Glypressin",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV bolus: Administer over 3 – 5 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Injection must be given intravenously to avoid local necrosis at the",
      "injection site."
    ],
    "references": [
      "1. Nottingham University Hospital. Critical Care Pharmacy Drug Guidelines",
      "Folder. Jan 2019.",
      "2. Zentiva. Product Leaflet Glypressin® 1 mg/8.5 ml Solution for Injection.",
      "Revised Jan 2019."
    ]
  },
  {
    "id": "KKM-DIL-144",
    "pageNumber": 154,
    "rawTitle": "TETANUS IMMUNOGLOBULIN (HUMAN) 250 IU/1 ML",
    "genericName": "Tetanus Immunoglobulin (Human TIG)",
    "brandNames": [
      "Sero-Tet"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Sero-Tet",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "Deep IM injection: Administer by deep intramuscular injection, preferably in the anterolateral aspect of the thigh or deltoid muscle. Do NOT administer intravenously (IV contraindicated).",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Should not be administered intravenously (IV contraindicated).",
      "Give concurrent active immunisation (tetanus vaccine) at a separate anatomical injection site using a separate syringe.",
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "Kementerian Kesihatan Malaysia (KKM) Dilution Guide for Fluid Restricted Critically Ill Adults."
    ]
  },
  {
    "id": "KKM-DIL-145",
    "pageNumber": 155,
    "rawTitle": "THIAMINE HYDROCHLORIDE 100 MG/1 ML & 200 MG/2 ML",
    "genericName": "Thiamine Hydrochloride (Vitamin B1)",
    "brandNames": [
      "Benerva Thiamin"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Benerva Thiamin",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "IM, IV bolus: No further dilution required\nIV infusion: Prescribed dose in 50 ml",
    "diluentText": "D5, NS",
    "administrationText": "IM\nIV bolus: Administer over 5 – 10 minutes\nIV infusion: Infuse over 15 – 30 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "24 hours",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 24 hours 24 hours",
    "comments": [
      "Protect from light.",
      "An extended infusion time over 15 – 30 minutes is suggested for doses",
      "≥ 100 mg."
    ],
    "references": [
      "1. Exeltis Rethinking Healthcare. Thiamin ® Product Leaftlet.",
      "2. Joint Formulary Committee. BNF 83 (British National Formulary) March",
      "2022. S.L.: Pharmaceutical Press; 2022.",
      "3. Lexi-Comp Inc. Version 6.4.0. Lexi-Drug©. [cited 2023 Apr 18].",
      "4. McAuley D. Thiamine [Internet]. GlobalRPH. 2017 [cited 2023 Apr 18].",
      "Available from: https://globalrph.com/dilution/thiamine/",
      "5. Patricia Dwyer Schull. Mcgraw-Hill’s I.V. drug handbook. New York",
      "Mcgraw Hill Professional; 2009.",
      "6. Young P, Psirides A. Intensive Care Drug Manual. 2nd ed. Wellington",
      "Regional Hospital; 2013."
    ]
  },
  {
    "id": "KKM-DIL-146",
    "pageNumber": 156,
    "rawTitle": "THIOPENTAL SODIUM 500 MG",
    "genericName": "Thiopental Sodium",
    "brandNames": [
      "Pentotex"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Pentotex",
    "reconstitutionText": "Reconstitute with diluent",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "IV bolus: Maximum concentration of 50 mg/ml\nIV infusion: Maximum concentration of 4 mg/ml",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer over at least 30 seconds\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "24 hours",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "After Dilution 24 hours -",
    "comments": [
      "Administer centrally, as high pH of thiopental sodium can cause",
      "peripheral vein irritancy."
    ],
    "references": [
      "1. Graham-Clarke E. Minimum Infusion Volumes [Internet]. 4.4 ed. Vol. 4.",
      "United Kingdom Clinical Pharmacy Association; 2012. Available from:",
      "https://www.scottishintensivecare.org.uk/uploads/2014-07-24-19-56-30-",
      "MinimuminfusionvolumesinI-40262.pdf",
      "2. McAuley D. Thiopental – Pentothal ® [Internet]. GlobalRPH. 2017 [cited",
      "2023 Apr 18]. Available from: https://globalrph.com/dilution/thiopental/",
      "3. Nottingham University Hospital. Critical Care Pharmacy Drug Guidelines",
      "Folder. Jan 2019.",
      "4. Pharmaforte Malaysia. Product Leaflet Pentotex Injection 0.5g. Revised",
      "Oct 2018.",
      "5. Young P, Psirides A. Intensive Care Drug Manual. 2nd ed. Wellington",
      "Regional Hospital; 2013."
    ]
  },
  {
    "id": "KKM-DIL-147",
    "pageNumber": 157,
    "rawTitle": "TIGECYCLINE 50 MG",
    "genericName": "Tigecycline",
    "brandNames": [
      "Tygacil"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Tygacil",
    "reconstitutionText": "Reconstitute with 5.3 ml NS (10 mg/ml)",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Maximum concentration of 1 mg/ml",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Infuse over 30 – 60 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "48 hours (if kept in IV"
      },
      {
        "phase": "After Dilution",
        "fridge": "bag)",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 48 hours (if kept in IV\nbag) -",
    "comments": [
      "Flush IV line before and after tigecycline administration."
    ],
    "references": [
      "1. McAuley D. Tigecycline – Tygacil ® [Internet]. GlobalRPH. 2017 [cited",
      "2023 Apr 18]. Available from: https://globalrph.com/dilution/tigecycline-",
      "tygacil/",
      "2. Micromedex Drug Reference. Version 4.0.0 (881) Merative US L.P. [cited",
      "2023 Apr 18].",
      "3. Pfizer. Product Leaflet Tygacil 50mg. Revised Sept 2013."
    ]
  },
  {
    "id": "KKM-DIL-148",
    "pageNumber": 158,
    "rawTitle": "TOCILIZUMAB 80 MG/4 ML & 400 MG/20 ML",
    "genericName": "Tocilizumab",
    "brandNames": [
      "Actemra"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Actemra",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "< 30 kg: Dilute to 50 ml\n≥ 30 kg: Dilute to 100 ml",
    "diluentText": "NS",
    "administrationText": "IV infusion: Infuse over 1 hour",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "24 hours",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 24 hours 24 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Chungai Pharma Manufacturing Co. Ltd.",
      "2. Joint Formulary Committee. BNF 83 (British National Formulary) March",
      "2022. S.L.: Pharmaceutical Press; 2022.",
      "3. Micromedex Drug Reference. Version 4.0.0 (881) Merative US L.P.",
      "[cited 2023 Apr 18].",
      "4. Product Leaftlet Actemra® Concentrate Solution for Infusion."
    ]
  },
  {
    "id": "KKM-DIL-149",
    "pageNumber": 159,
    "rawTitle": "TRAMADOL HYDROCHLORIDE 50 MG/1 ML",
    "genericName": "Tramadol Hydrochloride",
    "brandNames": [
      "Acugesic"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Acugesic",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IM\nIV bolus: Administer over at least 2 – 3 minutes",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "After Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Duopharma (M) Sdn. Bhd. Product Leaftlet Tramadol Hydrochloride.",
      "Revised 18 Apr 2019.",
      "2. Gray AH. Injectable Drugs Guide. London: Pharmaceutical Press; 2011.",
      "3. Young P, Psirides A. Intensive Care Drug Manual. 2nd ed. Wellington",
      "Regional Hospital; 2013."
    ]
  },
  {
    "id": "KKM-DIL-150",
    "pageNumber": 160,
    "rawTitle": "TRANEXAMIC ACID 500 MG/5 ML",
    "genericName": "Tranexamic Acid",
    "brandNames": [
      "Tranexamic Acid"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Tranexamic Acid",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "IV infusion: Infuse at rate not more than 100 mg/min (1 ml/min)",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Administration faster than 1 ml/min may cause hypotension.",
      "May be further diluted in D5 or NS to a maximum concentration of 20",
      "mg/ml (stable for 24 hours refrigerated or room temperature)."
    ],
    "references": [
      "1. McAuley D. Tranexamic Acid [Internet]. GlobalRPH. 2017 [cited 2023 Apr",
      "18]. Available from: https://globalrph.com/dilution/tranexamic-acid/",
      "2. Micromedex Drug Reference. Version 4.0.0 (881) Merative US L.P. [cited",
      "2023 Apr 18].",
      "3. UpToDate [Internet]. www.uptodate.com. Wolters Kluwer; [cited 2023 Apr",
      "18]. Available from: https://www.uptodate.com/contents/tranexamic-acid-",
      "drug-information."
    ]
  },
  {
    "id": "KKM-DIL-151",
    "pageNumber": 161,
    "rawTitle": "TRIAMCINOLONE ACETONIDE 40 MG/ 1ML",
    "genericName": "Triamcinolone Acetonide",
    "brandNames": [
      "Sivkort"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Sivkort",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "No further dilution required",
    "diluentText": "Not applicable",
    "administrationText": "Deep IM\nIntra-articular",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "After Dilution - -",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "Suspension For Injection Product Leaftlet. Revised 2017."
    ]
  },
  {
    "id": "KKM-DIL-152",
    "pageNumber": 162,
    "rawTitle": "UROKINASE 5,000 IU & 500,000 IU",
    "genericName": "Urokinase",
    "brandNames": [
      "U-frag"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "U-frag",
    "reconstitutionText": "Reconstitute with 2 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Further dilute reconstituted solution with 200 ml of compatible diluents",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "24 hours",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 24 hours 24 hours",
    "comments": [
      "After administration, the infusion tubing should be flushed with NS or D5.",
      "This volume of fluid should be flushed through the entire tubing length."
    ],
    "references": [
      "2023 Apr 18]."
    ]
  },
  {
    "id": "KKM-DIL-153",
    "pageNumber": 163,
    "rawTitle": "VANCOMYCIN 500 MG",
    "genericName": "Vancomycin Hydrochloride",
    "brandNames": [
      "Vivocin"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Vivocin",
    "reconstitutionText": "Reconstitute with 10 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Peripheral: Maximum concentration of 5 mg/ml\nCentral: Maximum concentration of 10 mg/ml",
    "diluentText": "D5, NS",
    "administrationText": "IV intermittent infusion:\n• Doses ≤ 1 g: Infuse over at least 60 minutes (rate ≤ 10 mg/min).\n• Doses > 1 g (e.g. 1.5 g – 2 g): Infuse over at least 90 – 120 minutes.\n• If infusion-related events ('Red Man Syndrome') occur, slow the infusion rate to over 1.5 – 2 hours and increase the dilution volume.",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "96 hours",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 96 hours 24 hours",
    "comments": [
      "Infusion-related events (Red Man Syndrome, hypotension, flushing) are related to both concentration and rate of administration of vancomycin.",
      "Monitor serum trough concentration (target 15 – 20 mcg/mL in severe infections) and renal function regularly.",
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. Gland Pharma Ltd. Vivocin Product Leaflet. Revised 5 Sept 2019.",
      "2. Graham-Clarke E. Minimum Infusion Volumes [Internet]. 4.4 ed. Vol. 4.",
      "United Kingdom Clinical Pharmacy Association; 2012. Available from:",
      "https://www.scottishintensivecare.org.uk/uploads/2014-07-24-19-56-30-",
      "MinimuminfusionvolumesinI-40262.pdf",
      "3. McAuley D. Vancomycin [Internet]. GlobalRPH. 2017 [cited 2023 Apr 18].",
      "Available from: https://globalrph.com/dilution/vancomycin/",
      "4. Micromedex Drug Reference. Version 4.0.0 (881) Merative US L.P. [cited",
      "2023 Apr 18].",
      "5. UpToDate [Internet]. www.uptodate.com. Wolters Kluwer; [cited 2023 Apr",
      "18]. Available from: https://www.uptodate.com/contents/vancomycin-",
      "drug-information."
    ]
  },
  {
    "id": "KKM-DIL-154",
    "pageNumber": 164,
    "rawTitle": "VASOPRESSIN 20 IU/1 ML",
    "genericName": "Vasopressin",
    "brandNames": [
      "Vasopressin"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Vasopressin",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Maximum concentration of 1 units/ml",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "-"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution - -",
    "comments": [
      "Infusion through central line is recommended."
    ],
    "references": [
      "1. McAuley D. Vasopressin – Pitressin ® [Internet]. GlobalRPH. 2017 [cited",
      "2023 Apr 18]. Available from: https://globalrph.com/dilution/vasopressin-",
      "pitressin/",
      "2. Micromedex Drug Reference. Version 4.0.0 (881) Merative US L.P. [cited",
      "2023 Apr 18].",
      "3. UpToDate [Internet]. www.uptodate.com. Wolters Kluwer; [cited 2023 Apr",
      "18]. Available from: https://www.uptodate.com/contents/vasopressin-",
      "drug-information."
    ]
  },
  {
    "id": "KKM-DIL-155",
    "pageNumber": 165,
    "rawTitle": "VERAPAMIL 5 MG/2 ML",
    "genericName": "Verapamil Hydrochloride",
    "brandNames": [
      "Zypamil"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Zypamil",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "IV bolus: No further dilution required\nIV infusion: Maximum concentration of 0.5 mg/ml",
    "diluentText": "D5, NS",
    "administrationText": "IV bolus: Administer over at least 2 minutes\nIV infusion: Titrate as per dose prescribed",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "-",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "After Dilution - 24 hours",
    "comments": [
      "Adhere to the 7 Rights of Parenteral Medication Administration & National Aseptic Technique."
    ],
    "references": [
      "1. McAuley D. Verapamil [Internet]. GlobalRPH. 2017 [cited 2023 Apr 18].",
      "Available from: https://globalrph.com/dilution/verapamil/",
      "2. Micromedex Drug Reference. Version 4.0.0 (881) Merative US L.P. [cited",
      "2023 Apr 18].",
      "3. UpToDate [Internet]. www.uptodate.com. Wolters Kluwer; [cited 2023 Apr",
      "18]. Available from: https://www.uptodate.com/contents/verapamil-drug-",
      "information."
    ]
  },
  {
    "id": "KKM-DIL-156",
    "pageNumber": 166,
    "rawTitle": "VORICONAZOLE 200 MG",
    "genericName": "Voriconazole",
    "brandNames": [
      "Vfend"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Vfend",
    "reconstitutionText": "Reconstitute with 19 ml WFI",
    "isReconstitutionRequired": true,
    "suggestedMinimumDilutions": "Maximum concentration of 5 mg/ml",
    "diluentText": "D5, NS",
    "administrationText": "IV infusion: Infuse over 1 – 2 hours (maximum rate of 3 mg/kg/hr)",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "24 hours",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 24 hours 24 hours",
    "comments": [
      "Do not infuse concomitantly into the same line or cannula with other drug",
      "infusions.",
      "Do not infuse concomitantly even in separate lines or cannulas with",
      "concentrated electrolyte solutions or blood products."
    ],
    "references": [
      "1. Pfizer (M) Sdn. Bhd. Product Leaflet Voriconazole 200 mg. Revised 15",
      "Nov 2017.",
      "2. UpToDate [Internet]. www.uptodate.com. Wolters Kluwer; [cited 2023 Apr",
      "18]. Available from: https://www.uptodate.com/contents/voriconazole-",
      "drug-information."
    ]
  },
  {
    "id": "KKM-DIL-157",
    "pageNumber": 167,
    "rawTitle": "ZOLEDRONIC ACID 4 MG/5 ML",
    "genericName": "Zoledronic Acid",
    "brandNames": [
      "Oledron"
    ],
    "sourceGuideline": "KKM Dilution Guide for Fluid Restricted Critically Ill Adults (First Edition April 2024 / Update Dec 2025)",
    "brandText": "Oledron",
    "reconstitutionText": "Not required",
    "isReconstitutionRequired": false,
    "suggestedMinimumDilutions": "Dilute prescribed dose with 100 ml",
    "diluentText": "D5, NS",
    "administrationText": ".\n Flush IV line with 10 ml NS flush following infusion.\n Patients must be appropriately hydrated prior to treatment.",
    "stabilityRows": [
      {
        "phase": "After Dilution",
        "fridge": "24 hours",
        "roomTemp": "24 hours"
      }
    ],
    "stabilityRaw": "Fridge (2 – 8°C) RT (< 25°C)\nAfter Dilution 24 hours 24 hours",
    "comments": [
      "If refrigerated, allow solution to reach room temperature before"
    ],
    "references": [
      "1. McAuley D. Zoledronic Acid [Internet]. GlobalRPH. 2017 [cited 2023 Apr",
      "18]. Available from: https://globalrph.com/dilution/zoledronic-acid/",
      "2. Micromedex Drug Reference. Version 4.0.0 (881) Merative US L.P. [cited",
      "2023 Apr 18].",
      "3. UpToDate [Internet]. www.uptodate.com. Wolters Kluwer; [cited 2023 Apr",
      "18]. Available from: https://www.uptodate.com/contents/zoledronic-acid-",
      "drug-information."
    ]
  }
];

const COMMON_STOP_WORDS = new Set([
  'sodium', 'potassium', 'calcium', 'chloride', 'acetate', 'sulfate', 'sulphate',
  'hydrochloride', 'hcl', 'phosphate', 'tartrate', 'besylate', 'succinate',
  'maleate', 'citrate', 'gluconate', 'fumarate', 'nitrate', 'bromide', 'iodide',
  'lactate', 'mesylate', 'trihydrate', 'disodium', 'dipotassium', 'dihydrate',
  'injection', 'infusion', 'solution', 'powder', 'sterile', 'water', 'for',
  'concentrate', 'concentrated', 'suspension', 'emulsion', 'oral', 'tablet',
  'capsule', 'ampoule', 'vial', 'complex', 'human', 'recombinant', 'rdna',
  'wfi', 'drops', 'syrup', 'mixture', 'cream', 'ointment', 'gel', 'eye', 'ear',
  'with', 'and', 'acid'
])

function normalizeDrugName(name: string): string {
  if (!name) return ''
  return name.toLowerCase()
    .replace(/[()]/g, ' ')
    .replace(/\b\d+(\.\d+)?\s*(mg|g|mcg|iu|mu|%|w\/v|ml)(\/\d+\s*ml)?\b/gi, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getDistinctiveTokens(name: string): string[] {
  const norm = normalizeDrugName(name)
  return norm.split(' ').filter(w => w.length >= 3 && !COMMON_STOP_WORDS.has(w))
}

function getFactorDesignation(text: string): string | null {
  const m = text.match(/factor\s*(viii\/vwf|viii|ix|viia|vii|xiii|ii|x)\b/i)
  if (m) return m[1].toLowerCase()
  if (/factor\s*8/i.test(text)) return 'viii'
  if (/factor\s*9/i.test(text)) return 'ix'
  if (/factor\s*7a/i.test(text)) return 'viia'
  if (/factor\s*7/i.test(text)) return 'vii'
  return null
}

/**
 * Helper to look up an authentic KKM dilution protocol for any drug name or code.
 * Ensures strict pharmaceutical specificity and eliminates false cross-matching.
 */
export function getKkmDilutionProtocol(drugName: string): KkmDilutionMonograph | undefined {
  if (!drugName) return undefined
  const q = drugName.toLowerCase().trim()
  const qNorm = normalizeDrugName(drugName)
  const qTokens = getDistinctiveTokens(drugName)

  if (qTokens.length === 0) return undefined

  // 1. Direct exact genericName or rawTitle match
  for (const entry of KKM_DILUTION_MASTER_DATABASE) {
    if (entry.genericName.toLowerCase() === q || entry.rawTitle.toLowerCase() === q) {
      return entry
    }
  }

  // 2. Normalized string exact match
  for (const entry of KKM_DILUTION_MASTER_DATABASE) {
    const entryNormGen = normalizeDrugName(entry.genericName)
    const entryNormTitle = normalizeDrugName(entry.rawTitle)
    if (qNorm === entryNormGen || qNorm === entryNormTitle) {
      return entry
    }
  }

  // Factor differentiation check (never cross-match different coagulation factors)
  const qFactor = getFactorDesignation(drugName)

  // Vaccine / toxoid safety check (vaccines are never IV dilution monographs)
  const isVaccineOrToxoid = /vaccine|toxoid/i.test(drugName)

  // 3. Distinctive active ingredient token match
  for (const entry of KKM_DILUTION_MASTER_DATABASE) {
    // Factor check
    if (qFactor !== null) {
      const entryFactor = getFactorDesignation(entry.rawTitle) || getFactorDesignation(entry.genericName)
      if (qFactor !== entryFactor) continue
    } else {
      const entryFactor = getFactorDesignation(entry.rawTitle) || getFactorDesignation(entry.genericName)
      if (entryFactor !== null) continue
    }

    // Vaccine / Toxoid exclusion
    if (isVaccineOrToxoid && /immunoglobulin/i.test(entry.genericName)) {
      continue
    }

    const entryTokens = getDistinctiveTokens(entry.genericName)
    const entryTitleTokens = getDistinctiveTokens(entry.rawTitle)
    const allEntryTokens = new Set([...entryTokens, ...entryTitleTokens])

    // Query tokens must all match the entry's distinctive tokens
    const allMatch = qTokens.length > 0 && qTokens.every(t => allEntryTokens.has(t))
    if (allMatch) {
      const entrySignificantTokens = entryTokens.filter(t => t !== 'sodium' && t !== 'factor')
      if (entrySignificantTokens.length > qTokens.length + 1) {
        continue
      }
      return entry
    }
  }

  // 4. Brand name lookup (strict whole-word matching, no junk tokens)
  for (const entry of KKM_DILUTION_MASTER_DATABASE) {
    for (const b of entry.brandNames) {
      const bTrim = b.trim().toLowerCase()
      if (bTrim.length < 3 || /^(ml|mg|vial|ampoule|iu|v|500|3 ml|m20|ns|d5)$/i.test(bTrim)) {
        continue
      }
      if (q === bTrim) return entry
      const escaped = bTrim.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`\\b${escaped}\\b`, 'i')
      if (regex.test(q)) {
        return entry
      }
    }
  }

  return undefined
}
