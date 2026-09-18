import { FacilityDrugItem } from '@/services/pharmacy/facilityDrugInventoryService'

export type LawasFormularyGroupId =
  | 'all'
  | 'eyedrop'
  | 'eardrop'
  | 'syrup'
  | 'pessary'
  | 'suppository'
  | 'insulin'
  | 'mdi'
  | 'anticoagulant'
  | 'oral_antidiabetic'
  | 'haart_hepc'
  | 'antibiotic'
  | 'cardiovascular'
  | 'analgesic'
  | 'psychotropic'
  | 'gastrointestinal'
  | 'respiratory'
  | 'dermatological'
  | 'corticosteroid'
  | 'iv_fluids'
  | 'supplements'
  | 'other'

export interface LawasFormularyGroupMeta {
  id: LawasFormularyGroupId
  nameEn: string
  nameMs: string
  descriptionEn: string
  descriptionMs: string
  iconName: string
  badgeColor: string
  bgLight: string
  borderColor: string
  textColor: string
  priority: number
}

export const LAWAS_FORMULARY_GROUPS: Record<Exclude<LawasFormularyGroupId, 'all'>, LawasFormularyGroupMeta> = {
  eyedrop: {
    id: 'eyedrop',
    nameEn: 'Eyedrop',
    nameMs: 'Titik Mata',
    descriptionEn: 'Ophthalmic solutions, suspensions and ointments',
    descriptionMs: 'Ubat titis mata, suspensi dan salap mata',
    iconName: 'Eye',
    badgeColor: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    bgLight: 'bg-cyan-50 dark:bg-cyan-950/30',
    borderColor: 'border-cyan-200 dark:border-cyan-800/40',
    textColor: 'text-cyan-700 dark:text-cyan-300',
    priority: 1,
  },
  eardrop: {
    id: 'eardrop',
    nameEn: 'Eardrop',
    nameMs: 'Titik Telinga',
    descriptionEn: 'Otic drops and ear canal preparations',
    descriptionMs: 'Ubat titis telinga dan pembersih salur telinga',
    iconName: 'Volume2',
    badgeColor: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
    bgLight: 'bg-teal-50 dark:bg-teal-950/30',
    borderColor: 'border-teal-200 dark:border-teal-800/40',
    textColor: 'text-teal-700 dark:text-teal-300',
    priority: 2,
  },
  syrup: {
    id: 'syrup',
    nameEn: 'Syrup & Oral Liquids',
    nameMs: 'Sirap & Cecair Oral',
    descriptionEn: 'Syrups, oral suspensions, paediatric drops & elixirs',
    descriptionMs: 'Ubat sirap, suspensi oral, cecair pediatrik & eliksir',
    iconName: 'FlaskConical',
    badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    bgLight: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800/40',
    textColor: 'text-amber-700 dark:text-amber-300',
    priority: 3,
  },
  pessary: {
    id: 'pessary',
    nameEn: 'Pessary & Vaginal',
    nameMs: 'Pesari & Tablet Faraj',
    descriptionEn: 'Vaginal tablets, pessaries, ovules & vaginal formulations',
    descriptionMs: 'Tablet faraj, ovul & formulasi pesari ginekologi',
    iconName: 'CircleDot',
    badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    bgLight: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800/40',
    textColor: 'text-purple-700 dark:text-purple-300',
    priority: 4,
  },
  suppository: {
    id: 'suppository',
    nameEn: 'Suppository & Rectal',
    nameMs: 'Supositori & Enema',
    descriptionEn: 'Rectal suppositories, laxative enemas & rectal tubes',
    descriptionMs: 'Supositori rektal, enema pelepasan & tiub rektal',
    iconName: 'Crosshair',
    badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    bgLight: 'bg-rose-50 dark:bg-rose-950/30',
    borderColor: 'border-rose-200 dark:border-rose-800/40',
    textColor: 'text-rose-700 dark:text-rose-300',
    priority: 5,
  },
  insulin: {
    id: 'insulin',
    nameEn: 'Insulin',
    nameMs: 'Insulin & Formulasi',
    descriptionEn: 'Basal, prandial, premixed insulins & penfill cartridges',
    descriptionMs: 'Insulin basal, bolus, campuran & kartrij penfill',
    iconName: 'Activity',
    badgeColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    bgLight: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800/40',
    textColor: 'text-blue-700 dark:text-blue-300',
    priority: 6,
  },
  mdi: {
    id: 'mdi',
    nameEn: 'MDI & Inhalers',
    nameMs: 'MDI & Inhaler',
    descriptionEn: 'Metered dose inhalers, dry powder devices, respules & nebules',
    descriptionMs: 'Inhaler aerosol dos terukur, serbuk kering, respule & nebule',
    iconName: 'Wind',
    badgeColor: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
    bgLight: 'bg-sky-50 dark:bg-sky-950/30',
    borderColor: 'border-sky-200 dark:border-sky-800/40',
    textColor: 'text-sky-700 dark:text-sky-300',
    priority: 7,
  },
  anticoagulant: {
    id: 'anticoagulant',
    nameEn: 'Anticoagulant',
    nameMs: 'Antikoagulan & Antiplatelet',
    descriptionEn: 'Warfarin, DOACs, LMWH, Heparins & Antiplatelets',
    descriptionMs: 'Warfarin, DOAC, LMWH suntikan, Heparin & Antiplatelet',
    iconName: 'ShieldAlert',
    badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    bgLight: 'bg-rose-50 dark:bg-rose-950/30',
    borderColor: 'border-rose-200 dark:border-rose-800/40',
    textColor: 'text-rose-700 dark:text-rose-300',
    priority: 8,
  },
  oral_antidiabetic: {
    id: 'oral_antidiabetic',
    nameEn: 'Oral Antidiabetics',
    nameMs: 'Ubat Kencing Manis Oral',
    descriptionEn: 'Metformin, Sulfonylureas, SGLT2 inhibitors & DPP4 inhibitors',
    descriptionMs: 'Metformin, Sulfonilurea, perencat SGLT2 & perencat DPP-4',
    iconName: 'Pill',
    badgeColor: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/30',
    borderColor: 'border-indigo-200 dark:border-indigo-800/40',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    priority: 9,
  },
  haart_hepc: {
    id: 'haart_hepc',
    nameEn: 'HAART / Hep C',
    nameMs: 'HAART / Hep C',
    descriptionEn: 'Antiretrovirals (HIV/HAART) & Hepatitis C/B direct-acting antivirals',
    descriptionMs: 'Terapi Antiretroviral (HIV/HAART) & antivirus Hepatitis C/B',
    iconName: 'Dna',
    badgeColor: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
    bgLight: 'bg-teal-50 dark:bg-teal-950/30',
    borderColor: 'border-teal-200 dark:border-teal-800/40',
    textColor: 'text-teal-700 dark:text-teal-300',
    priority: 10,
  },
  antibiotic: {
    id: 'antibiotic',
    nameEn: 'Antibiotics & Antimicrobials',
    nameMs: 'Antibiotik & Antimikrobial',
    descriptionEn: 'Oral and parenteral anti-infectives & antifungal agents',
    descriptionMs: 'Ubat anti-jangkitan oral & suntikan serta antikulat',
    iconName: 'ShieldCheck',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800/40',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    priority: 11,
  },
  cardiovascular: {
    id: 'cardiovascular',
    nameEn: 'Antihypertensives & CVS',
    nameMs: 'Ubat Tekanan Darah & Jantung',
    descriptionEn: 'ACEi, ARB, CCB, Beta-blockers, Diuretics & Antianginals',
    descriptionMs: 'Ubat darah tinggi, kegagalan jantung, diuretik & angina',
    iconName: 'Heart',
    badgeColor: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
    bgLight: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800/40',
    textColor: 'text-red-700 dark:text-red-300',
    priority: 12,
  },
  analgesic: {
    id: 'analgesic',
    nameEn: 'Analgesics & Pain Relief',
    nameMs: 'Ubat Tahan Sakit & NSAID',
    descriptionEn: 'Paracetamol, NSAIDs, Opioids & Pain management drugs',
    descriptionMs: 'Paracetamol, NSAID, ubat opioid & kawalan kesakitan',
    iconName: 'Flame',
    badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    bgLight: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800/40',
    textColor: 'text-amber-700 dark:text-amber-300',
    priority: 13,
  },
  psychotropic: {
    id: 'psychotropic',
    nameEn: 'Psychotropics & Neuro',
    nameMs: 'Psikiatri & Neurologi',
    descriptionEn: 'Antipsychotics, Antidepressants, Anticonvulsants & Sedatives',
    descriptionMs: 'Antipsikotik, antidepresan, ubat sawan & sedatif',
    iconName: 'Brain',
    badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    bgLight: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800/40',
    textColor: 'text-purple-700 dark:text-purple-300',
    priority: 14,
  },
  gastrointestinal: {
    id: 'gastrointestinal',
    nameEn: 'Gastrointestinal',
    nameMs: 'Saluran Pencernaan & GI',
    descriptionEn: 'PPIs, H2-blockers, Antiemetics, Antispasmodics & Laxatives',
    descriptionMs: 'Ubat gastrik PPI, tahan muntah, julap & antispasmodik',
    iconName: 'Layers',
    badgeColor: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
    bgLight: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-800/40',
    textColor: 'text-orange-700 dark:text-orange-300',
    priority: 15,
  },
  respiratory: {
    id: 'respiratory',
    nameEn: 'Respiratory & Allergy',
    nameMs: 'Sistem Pernafasan & Alahan',
    descriptionEn: 'Oral antihistamines, cough syrups & bronchodilators',
    descriptionMs: 'Antihistamin oral, ubat batuk sirap & bronkodilator',
    iconName: 'Sparkles',
    badgeColor: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
    bgLight: 'bg-violet-50 dark:bg-violet-950/30',
    borderColor: 'border-violet-200 dark:border-violet-800/40',
    textColor: 'text-violet-700 dark:text-violet-300',
    priority: 16,
  },
  dermatological: {
    id: 'dermatological',
    nameEn: 'Dermatological / Topicals',
    nameMs: 'Ubat Sapu & Kulit',
    descriptionEn: 'Creams, ointments, lotions & antiseptic preparations',
    descriptionMs: 'Krim, salap ubat, losyen emolien & antiseptik kulit',
    iconName: 'Droplets',
    badgeColor: 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30',
    bgLight: 'bg-pink-50 dark:bg-pink-950/30',
    borderColor: 'border-pink-200 dark:border-pink-800/40',
    textColor: 'text-pink-700 dark:text-pink-300',
    priority: 17,
  },
  corticosteroid: {
    id: 'corticosteroid',
    nameEn: 'Corticosteroids',
    nameMs: 'Steroid Sistemik',
    descriptionEn: 'Oral and injectable systemic corticosteroids',
    descriptionMs: 'Kortikosteroid sistemik oral dan suntikan',
    iconName: 'Shield',
    badgeColor: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/30',
    bgLight: 'bg-fuchsia-50 dark:bg-fuchsia-950/30',
    borderColor: 'border-fuchsia-200 dark:border-fuchsia-800/40',
    textColor: 'text-fuchsia-700 dark:text-fuchsia-300',
    priority: 18,
  },
  iv_fluids: {
    id: 'iv_fluids',
    nameEn: 'IV Fluids & Resuscitation',
    nameMs: 'Cecair Infusi & Elektrolit',
    descriptionEn: 'Intravenous crystalloids, electrolytes & emergency resuscitation drugs',
    descriptionMs: 'Cecair titisan IV, elektrolit pekat & ubat resusitasi kecemasan',
    iconName: 'Syringe',
    badgeColor: 'bg-blue-600/15 text-blue-800 dark:text-blue-300 border-blue-600/30',
    bgLight: 'bg-blue-50/80 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800/40',
    textColor: 'text-blue-800 dark:text-blue-300',
    priority: 19,
  },
  supplements: {
    id: 'supplements',
    nameEn: 'Vitamins & Supplements',
    nameMs: 'Vitamin & Suplemen',
    descriptionEn: 'Vitamins, minerals, iron supplements & electrolyte tablets',
    descriptionMs: 'Vitamin, zat besi, mineral & suplemen pemakanan',
    iconName: 'PlusCircle',
    badgeColor: 'bg-lime-500/15 text-lime-700 dark:text-lime-300 border-lime-500/30',
    bgLight: 'bg-lime-50 dark:bg-lime-950/30',
    borderColor: 'border-lime-200 dark:border-lime-800/40',
    textColor: 'text-lime-700 dark:text-lime-300',
    priority: 20,
  },
  other: {
    id: 'other',
    nameEn: 'General Formulary',
    nameMs: 'Formulari Am / Lain-lain',
    descriptionEn: 'Specialty medications, diagnostics and general formulations',
    descriptionMs: 'Ubat-ubatan kepakaran khas dan formulasi am hospital',
    iconName: 'Package',
    badgeColor: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
    bgLight: 'bg-slate-50 dark:bg-slate-900/30',
    borderColor: 'border-slate-200 dark:border-slate-800/40',
    textColor: 'text-slate-700 dark:text-slate-300',
    priority: 99,
  },
}

/**
 * Classifies a facility drug item into one of the specialized Lawas Hospital formulary groups.
 */
export function classifyLawasDrug(drug: Partial<FacilityDrugItem>): Exclude<LawasFormularyGroupId, 'all'> {
  const name = (drug.drug_name || '').toLowerCase()
  const generic = (drug.generic_name || '').toLowerCase()
  const form = (drug.dosage_form || '').toLowerCase()
  const subClass = (drug.item_sub_class || '').toLowerCase()
  const full = `${name} ${generic} ${form} ${subClass}`

  // 1. Eyedrop (Must precede antibiotics / steroids that are eye drops)
  if (
    name.includes('eye drop') || name.includes('eye drops') || name.includes('eye ointment') || name.includes('eye gel') ||
    (form === 'drops' && (name.includes('eye') || name.includes('latanoprost') || name.includes('timolol') || name.includes('travoprost') || name.includes('bimatoprost') || name.includes('brimonidine'))) ||
    /gutt\.\s*oc|oc\.\s*chloramphenicol|artificial tears|hypromellose.*eye|tobramycin.*eye|chloramphenicol 0\.5%|neomycin sulphate eye/i.test(full)
  ) {
    return 'eyedrop'
  }

  // 2. Eardrop (Must precede antibiotics that are ear drops)
  if (
    name.includes('ear drop') || name.includes('ear drops') || (form === 'drops' && (name.includes('ear') || name.includes('telinga') || name.includes('otic'))) ||
    /gutt\.\s*aur|cerumol|docusate.*ear|chloramphenicol 5%|chloramphenicol ear/i.test(full)
  ) {
    return 'eardrop'
  }

  // 3. Pessary & Vaginal Tablets
  if (
    form === 'pessary' || form === 'ovule' ||
    name.includes('pessary') || name.includes('pesari') || name.includes('ovule') ||
    name.includes('vaginal tablet') || name.includes('vaginal supp') || name.includes('vaginal gel') ||
    generic.includes('vaginal') || /clotrimazole.*vaginal|dinoprostone.*vaginal|dequalinium.*vaginal|metronidazole.*vaginal/i.test(full)
  ) {
    return 'pessary'
  }

  // 4. Suppository & Rectal Formulations
  if (
    form === 'suppository' ||
    name.includes('suppository') || name.includes('supositori') || name.includes('suppositoria') ||
    name.includes('enema') || name.includes('rectal') || generic.includes('suppository') ||
    /bisacodyl.*supp|diclofenac.*supp|paracetamol.*supp|glycerin.*enema|fleet.*enema|balsam peru supp/i.test(full)
  ) {
    return 'suppository'
  }

  // 5. Syrup & Oral Liquids (Paediatric & Adult liquid formulations)
  if (
    (form === 'syrup' || form === 'suspension' || form === 'elixir' || form === 'linctus' ||
      name.includes('syrup') || name.includes('sirap') || name.includes('/ 5 ml') || name.includes('/5ml') ||
      name.includes('suspension') || name.includes('oral liquid') || name.includes('oral solution') ||
      (form === 'liquid' && !name.includes('peroxide') && !name.includes('paraffin') && !name.includes('sevoflurane')) ||
      /nystatin.*susp|paracetamol.*susp|amoxicillin.*susp|cloxacillin.*susp|valproate.*syrup|lactulose/i.test(full)) &&
    !name.includes('injection') && !name.includes('intrathracheal') && form !== 'injection'
  ) {
    return 'syrup'
  }

  // 6. Insulin
  if (
    name.includes('insulin') || /aspart|glargine|detemir|lispro|glulisine|degludec|penfill|innolet|solostar|flextouch|actrapid|insulatard|mixtard|novorapid|humulin/i.test(name)
  ) {
    return 'insulin'
  }

  // 4. MDI & Inhalers
  if (
    form === 'inhaler' || name.includes('inhaler') || name.includes('mdi') || name.includes('puff') || name.includes('evohaler') ||
    name.includes('turbuhaler') || name.includes('accuhaler') || name.includes('respimat') || name.includes('diskus') ||
    name.includes('nebule') || name.includes('respule') || name.includes('solution for inhalation') ||
    /salbutamol.*inhal|budesonide.*inhal|beclomethasone.*inhal|fluticasone.*inhal|tiotropium|ipratropium.*inhal/i.test(full)
  ) {
    return 'mdi'
  }

  // 5. Anticoagulant & Antiplatelet
  if (
    /warfarin|enoxaparin|heparin|fondaparinux|rivaroxaban|apixaban|dabigatran|edoxaban|clopidogrel|ticagrelor|prasugrel|streptokinase|alteplase/i.test(full)
  ) {
    return 'anticoagulant'
  }

  // 6. Oral Antidiabetics
  if (
    /metformin|gliclazide|glimepiride|glibenclamide|linagliptin|sitagliptin|vildagliptin|empagliflozin|dapagliflozin|canagliflozin|pioglitazone|acarbose/i.test(full)
  ) {
    return 'oral_antidiabetic'
  }

  // 7. HAART / Hep C Antivirals (HIV Antiretrovirals & Hepatitis C/B DAAs)
  if (
    /abacavir|lamivudine|tenofovir|efavirenz|dolutegravir|emtricitabine|raltegravir|lopinavir|ritonavir|atazanavir|darunavir|zidovudine|nevirapine|sofosbuvir|daclatasvir|velpatasvir|ledipasvir|ribavirin|entecavir|haart|antiretroviral/i.test(full) &&
    !name.includes('vaccine')
  ) {
    return 'haart_hepc'
  }

  // 8. Antibiotics & Antimicrobials
  if (
    /amoxicillin|ampicillin|clavulanate|sulbactam|piperacillin|tazobactam|cloxacillin|penicillin|ceftriaxone|cefuroxime|ceftazidime|cefazolin|cephalexin|cefotaxime|cefepime|azithromycin|clarithromycin|erythromycin|ciprofloxacin|levofloxacin|moxifloxacin|gentamicin|amikacin|vancomycin|teicoplanin|meropenem|ertapenem|imipenem|metronidazole|doxycycline|tetracycline|co-trimoxazole|bactrim|trimethoprim|fusidic|nitrofurantoin|rifampicin|isoniazid|pyrazinamide|ethambutol|fluconazole|ketoconazole|nystatin|acyclovir|valacyclovir/i.test(full)
  ) {
    return 'antibiotic'
  }

  // 8. Antihypertensives & Cardiovascular
  if (
    /amlodipine|felodipine|nifedipine|atenolol|bisoprolol|metoprolol|carvedilol|labetalol|propranolol|enalapril|captopril|ramipril|perindopril|losartan|valsartan|candesartan|irbesartan|telmisartan|hydrochlorothiazide|indapamide|frusemide|furosemide|spironolactone|methyldopa|hydralazine|verapamil|diltiazem|glyceryl trinitrate|isosorbide|digoxin|ivabradine|sacubitril|atorvastatin|simvastatin|rosuvastatin|fenofibrate|gemfibrozil/i.test(full)
  ) {
    return 'cardiovascular'
  }

  // 9. Analgesics, NSAIDs & Pain Relief
  if (
    /paracetamol|acetaminophen|tramadol|morphine|fentanyl|oxycodone|pethidine|methadone|buprenorphine|ibuprofen|diclofenac|celecoxib|meloxicam|ketoprofen|naproxen|mefenamic|etoricoxib|indomethacin|piroxicam/i.test(full)
  ) {
    return 'analgesic'
  }

  // 10. Psychotropics, Neurological & Anticonvulsants
  if (
    /haloperidol|chlorpromazine|olanzapine|risperidone|quetiapine|sulpiride|fluphenazine|zuclopenthixol|amisulpride|aripiprazole|escitalopram|fluoxetine|sertraline|amitriptyline|valproate|valproic|phenytoin|carbamazepine|levetiracetam|lamotrigine|topiramate|gabapentin|pregabalin|diazepam|lorazepam|midazolam|clonazepam|alprazolam|phenobarbital|pyridostigmine/i.test(full)
  ) {
    return 'psychotropic'
  }

  // 11. Gastrointestinal & Antiemetics
  if (
    /metoclopramide|ondansetron|domperidone|granisetron|omeprazole|pantoprazole|esomeprazole|rabeprazole|lansoprazole|ranitidine|famotidine|hyoscine|dicyclomine|loperamide|lactulose|macrogol|smecta|gaviscon|magnesium trisilicate|bisacodyl|senna/i.test(full)
  ) {
    return 'gastrointestinal'
  }

  // 12. Respiratory & Antihistamines
  if (
    /cetirizine|loratadine|fexofenadine|chlorpheniramine|promethazine|desloratadine|theophylline|aminophylline|montelukast|bromhexine|ambroxol|dextromethorphan|diphenhydramine/i.test(full)
  ) {
    return 'respiratory'
  }

  // 13. Dermatological & Topicals
  if (
    form === 'cream' || form === 'ointment' || form === 'lotion' ||
    /hydrocortisone cream|betamethasone cream|clotrimazole cream|miconazole cream|acyclovir cream|silver sulfadiazine|calamine|aqueous cream|cetomacrogol|emulsifying|paraffin|permethrin|benzyl benzoate|acriflavine|whitfield/i.test(full)
  ) {
    return 'dermatological'
  }

  // 14. Corticosteroids (Systemic)
  if (
    /dexamethasone|hydrocortisone|prednisolone|methylprednisolone|triamcinolone|betamethasone/i.test(full)
  ) {
    return 'corticosteroid'
  }

  // 15. IV Fluids, Electrolytes & Resuscitation
  if (
    /sodium chloride|potassium chloride|normal saline|dextrose|hartmann|sodium bicarbonate|calcium gluconate|water for injection|gelafundin|adrenaline|epinephrine|noradrenaline|atropine|amiodarone|dopamine|dobutamine|antivenene/i.test(full)
  ) {
    return 'iv_fluids'
  }

  // 16. Vitamins & Supplements
  if (
    /calcium|ferrous|iron|folic acid|vitamin|ascorbic|thiamine|pyridoxine|cyanocobalamin|multivitamin|cholecalciferol|calcitriol|zinc|iberet|obimin|alfacalcidol/i.test(full)
  ) {
    return 'supplements'
  }

  return 'other'
}

/**
 * Returns grouped list of items ordered by clinical group priority
 */
export function groupLawasDrugs(drugs: FacilityDrugItem[]): {
  groupMeta: LawasFormularyGroupMeta
  items: FacilityDrugItem[]
}[] {
  const groups: Record<Exclude<LawasFormularyGroupId, 'all'>, FacilityDrugItem[]> = {
    eyedrop: [],
    eardrop: [],
    syrup: [],
    pessary: [],
    suppository: [],
    insulin: [],
    mdi: [],
    anticoagulant: [],
    oral_antidiabetic: [],
    haart_hepc: [],
    antibiotic: [],
    cardiovascular: [],
    analgesic: [],
    psychotropic: [],
    gastrointestinal: [],
    respiratory: [],
    dermatological: [],
    corticosteroid: [],
    iv_fluids: [],
    supplements: [],
    other: [],
  }

  for (const drug of drugs) {
    const grp = classifyLawasDrug(drug)
    groups[grp].push(drug)
  }

  // Sort each group alphabetically
  for (const key of Object.keys(groups) as Array<Exclude<LawasFormularyGroupId, 'all'>>) {
    groups[key].sort((a, b) => (a.drug_name || '').localeCompare(b.drug_name || ''))
  }

  return (Object.keys(groups) as Array<Exclude<LawasFormularyGroupId, 'all'>>)
    .filter(key => groups[key].length > 0)
    .sort((a, b) => LAWAS_FORMULARY_GROUPS[a].priority - LAWAS_FORMULARY_GROUPS[b].priority)
    .map(key => ({
      groupMeta: LAWAS_FORMULARY_GROUPS[key],
      items: groups[key],
    }))
}
