// src/modules/mypriviledging/data/credentialingCriteriaData.ts
// Official MOH Malaysia & AHP Logbook Credentialing Criteria for Nurses & Assistant Medical Officers
// Supports full English default with bilingual Malay translation support

export interface LocalizedString {
  en: string;
  ms: string;
}

export interface LocalizedStringArray {
  en: string[];
  ms: string[];
}

export interface CredentialingCriterion {
  id: string;
  roleKey: 'nurses' | 'amos';
  roleChip: LocalizedString;
  title: LocalizedString;
  subtitle: LocalizedString;
  minimumRequirements: LocalizedStringArray;
  supportingEvidence: LocalizedStringArray;
  submissionChecklist: LocalizedStringArray;
  kkmGovernanceNotes: LocalizedStringArray;
  validityPeriod: LocalizedString;
}

export const CREDENTIALING_CRITERIA: Record<'nurses' | 'amos', CredentialingCriterion> = {
  nurses: {
    id: 'nurses-criteria',
    roleKey: 'nurses',
    roleChip: {
      en: 'Registered Nurses (RN)',
      ms: 'Jururawat Berdaftar (RN)'
    },
    title: {
      en: 'Registered Nurse Credentialing & Privileging Criteria',
      ms: 'Kriteria Credentialing Jururawat Berdaftar'
    },
    subtitle: {
      en: 'Maintaining high-standard clinical nursing competency verified through MOH AHP Logbook evidence and current clinical practice standards.',
      ms: 'Mengekalkan standard kejururawatan berkualiti tinggi dengan kompetensi klinikal disahkan dan bukti amalan semasa KKM.'
    },
    minimumRequirements: {
      en: [
        'Peri-Operative / Intensive Care: 2 - 5 years of continuous active service with an officially verified logbook.',
        'Emergency Medicine & Trauma: 3 - 5 years frontline clinical duty, passed clinical viva & skill stations, holding valid life support certifications.',
        'General Paediatric / Neonatal: 2 - 5 years paediatric/NICU ward experience with documented logbook cases and resuscitation skills.'
      ],
      ms: [
        'Peri-Operative / Intensive Care: 2 - 5 tahun pengalaman berterusan dalam perkhidmatan dengan buku log lengkap disahkan.',
        'Emergency Medicine & Trauma: 3 - 5 tahun bertugas barisan hadapan, lulus viva & stesen kemahiran praktikal, serta memiliki sijil life support semasa yang berkaitan.',
        'General Paediatric / Neonatal: 2 - 5 tahun pengalaman di wad paediatrik/NICU berserta rekod buku log dan kemahiran bantuan hayat didokumenkan.'
      ]
    },
    supportingEvidence: {
      en: [
        'Clinical Logbook (AHP Logbook) reviewed and endorsed by Clinical Specialist / Nurse Supervisor.',
        'Annual Performance Evaluation Report (LNPT / SKT) for the past 3 consecutive years with exemplary competency ratings.',
        'Continuous Professional Development (CPD) Records & Life Support Certificates (BLS / ACLS / PALS / NRP / ATLS as applicable).',
        'Summary of clinical incident / adverse event audits and documented quality improvement actions (if applicable).'
      ],
      ms: [
        'Buku Log Klinikal (AHP Logbook) yang telah disemak dan ditandatangani oleh Pakar Perunding / Penyelia Klinikal.',
        'Laporan Penilaian Prestasi Tahunan (LNPT / SKT) bagi 3 tahun terkini dengan markah kompetensi cemerlang.',
        'Rekod Pembangunan Profesional Berterusan (CPD) & Sijil Bantuan Hayat (BLS / ACLS / PALS / NRP / ATLS mengikut kepakaran).',
        'Ringkasan laporan insiden klinikal / adverse events berserta langkah mitigasi penambahbaikan (jika berkenaan).'
      ]
    },
    submissionChecklist: {
      en: [
        'Upload all required supporting documents and certified certificates prior to credentialing expiration date.',
        'Ensure logbook forms are endorsed and signed by Head of Department / Nursing Supervisor.',
        'Schedule interview and clinical competency assessment with the Credentialing & Privileging Committee (JKCP) Panel.',
        'Attach updated Life Support Certifications according to subspecialty practice area.'
      ],
      ms: [
        'Muat naik semua bukti dokumen sokongan dan sijil ke portal sebelum tarikh tamat sahlaku tempoh kelayakan.',
        'Pastikan borang dan buku log telah disahkan serta ditandatangani oleh Ketua Jabatan / Matron Penyelia.',
        'Jadualkan sesi temuduga dan penilaian kompetensi bersama Panel Jawatankuasa Credentialing & Privileging (JKCP).',
        'Sertakan sijil kelayakan bantuan hayat (Life Support Certificates) terkini mengikut sub-bidang kepakaran masing-masing.'
      ]
    },
    kkmGovernanceNotes: {
      en: [
        'Strict compliance with the latest edition of MOH Nursing Credentialing & Privileging Guidelines.',
        'Active and valid Annual Practicing Certificate (APC) with the Nursing Board of Malaysia (LJM).',
        'Recognized Post-Basic / Advanced Diploma certification endorsed by MOH Nursing Division.'
      ],
      ms: [
        'Pematuhan ketat kepada Garis Panduan Credentialing & Privileging Jururawat KKM Edisi Terkini.',
        'Keperluan APC (Annual Practicing Certificate) Lembaga Jururawat Malaysia (LJM) yang aktif dan sah.',
        'Pengiktirafan sijil Pos Basik / Diploma Lanjutan yang diiktiraf oleh Bahagian Kejururawatan KKM.'
      ]
    },
    validityPeriod: {
      en: '3 Years (Subject to JKCP Triennial Re-evaluation)',
      ms: '3 Tahun (Diperbaharui melalui Penilaian Semula JKCP)'
    }
  },
  amos: {
    id: 'amos-criteria',
    roleKey: 'amos',
    roleChip: {
      en: 'Assistant Medical Officers (AMO)',
      ms: 'Penolong Pegawai Perubatan (PPP / AMO)'
    },
    title: {
      en: 'Assistant Medical Officer (AMO) Credentialing & Privileging Criteria',
      ms: 'Kriteria Credentialing Penolong Pegawai Perubatan'
    },
    subtitle: {
      en: 'Demonstrating procedural clinical competence, advanced resuscitation skills, and regulatory compliance with the Medical Assistants Board of Malaysia (LPPPM).',
      ms: 'Membuktikan kompetensi prosedur klinikal, kemahiran resusitasi, dan pematuhan peraturan Lembaga Pembantu Perubatan Malaysia (LPPPM).'
    },
    minimumRequirements: {
      en: [
        'Anaesthesia & Peri-Anaesthesia: ≥3 years active duty in Operating Theatre (OT) / ICU with certified airway management & advanced resuscitation competencies.',
        'Emergency Medicine & Trauma: ≥4 years duty in Emergency & Trauma Department with rotations in airway, trauma resuscitation & critical care.',
        'Renal Services / Dialysis: ≥2 years haemodialysis portfolio with water treatment system logs & dialysis emergency management records.'
      ],
      ms: [
        'Anaesthesia & Peri-Anaesthesia: ≥3 tahun bertugas di Dewan Bedah (OT) / ICU dengan persijilan kompetensi pengurusan salur pernafasan (Airway) & resusitasi.',
        'Emergency Medicine & Trauma: ≥4 tahun bertugas di Jabatan Kecemasan & Trauma dengan giliran salur pernafasan, trauma & penjagaan kritikal.',
        'Renal Services / Dialysis: ≥2 tahun portfolio hemodialisis berserta rekod rawatan air (water treatment) & log pengendalian kecemasan dialisis.'
      ]
    },
    supportingEvidence: {
      en: [
        'Clinical Procedure Logbook verified and endorsed by Clinical Specialist / Chief Assistant Medical Officer (KPPP).',
        'Annual Performance Evaluation Report (LNPT / SKT) for the past 3 years of service.',
        'Continuous Professional Development (CPD) Records & Valid Competency Certificates (BLS / ACLS / PALS / ATLS / MTLS).',
        'Summary of invasive procedure portfolio including case records and complication management protocols.'
      ],
      ms: [
        'Buku Log Prosedur Klinikal yang telah disahkan dan ditandatangani oleh Pakar Perunding / Ketua Penolong Pegawai Perubatan (KPPP).',
        'Laporan Penilaian Prestasi Tahunan (LNPT / SKT) bagi 3 tahun perkhidmatan terkini.',
        'Rekod Pembangunan Profesionalisme Berterusan (CPD) & Sijil Kompetensi (BLS / ACLS / PALS / ATLS / MTLS yang sah).',
        'Ringkasan portfolio prosedur invasif berserta rekod kes dan tindakan pembetulan sekiranya berlaku komplikasi.'
      ]
    },
    submissionChecklist: {
      en: [
        'Upload all supporting documentation and verified logbook copies to the portal before the credentialing cutoff date.',
        'Ensure documents are endorsed and supported by Head of Department / Hospital Chief Assistant Medical Officer.',
        'Confirm assessment date and practical evaluation session with the JKCP Special Evaluation Panel.',
        'For Dialysis Services: Attach Post-Basic / Advanced Diploma in Haemodialysis recognized by LPPPM.'
      ],
      ms: [
        'Muat naik semua bukti dokumen dan salinan buku log ke portal sebelum tarikh akhir pemfailan kelayakan.',
        'Pastikan dokumen diperakukan dan disokong oleh Ketua Jabatan / Ketua Penolong Pegawai Perubatan Hospital.',
        'Tetapkan tarikh semakan dan sesi penilaian amali bersama Panel Penilai Khas JKCP.',
        'Bagi Perkhidmatan Dialisis: Lampirkan Sijil Pos Basik / Diploma Lanjutan Hemodialisis yang diiktiraf LPPPM.'
      ]
    },
    kkmGovernanceNotes: {
      en: [
        'Compliance with Medical Assistants (Registration) Act 1977 and LPPPM Code of Professional Conduct.',
        'Hold a valid Annual Practicing Certificate (APC) issued by LPPPM for the current year.',
        'Specialized procedures subject to formal Clinical Letter of Privileging signed by Hospital Director.'
      ],
      ms: [
        'Pematuhan Akta Pembantu Perubatan (Pendaftaran) 1977 dan Kod Etika Amalan Lembaga Pembantu Perubatan Malaysia.',
        'Memegang Perakuan Amalan Tahunan (APC) LPPPM yang sah bagi tahun semasa.',
        'Prosedur khusus tertakluk kepada Surat Penurunan Kuasa Klinikal yang ditandatangani oleh Pengarah Hospital.'
      ]
    },
    validityPeriod: {
      en: '3 Years (Subject to periodic JKCP audit)',
      ms: '3 Tahun (Tertakluk kepada audit berkala oleh JKCP)'
    }
  }
};
