// src/modules/mypriviledging/components/SubmitProcedureModal.tsx
// Multi-step modal for logging new clinical procedures or revising existing drafts
// Full English default with seamless language toggle support

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileCheck2,
  Calendar,
  Building,
  Upload,
  AlertCircle,
  Paperclip,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import {
  ALL_PROCEDURE_CATEGORIES,
  getCategoriesForRole,
  findCategoryById
} from '../data/procedureCatalogData';
import type {
  ProcedureSubmission,
  ProcedureCategory,
  ProcedureItem,
  StaffPrivilegingProfile,
  SupervisionLevel,
  CredentialRole,
  ProcedureAttachment
} from '../types/priviledgingTypes';

interface SubmitProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (submissionData: Partial<ProcedureSubmission>, isDraft: boolean) => void;
  initialCategory?: ProcedureCategory | null;
  initialProcedure?: ProcedureItem | null;
  editingSubmission?: ProcedureSubmission | null;
  activeStaff?: StaffPrivilegingProfile;
}

export const SubmitProcedureModal: React.FC<SubmitProcedureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCategory,
  initialProcedure,
  editingSubmission,
  activeStaff
}) => {
  const { language } = useLanguage();
  const isMs = language === 'ms';

  const [role, setRole] = useState<CredentialRole>(
    editingSubmission?.staffRole || activeStaff?.role || 'nurses'
  );
  const [categoryId, setCategoryId] = useState<string>('');
  const [procedureKey, setProcedureKey] = useState<string>('');
  const [isCustomProcedure, setIsCustomProcedure] = useState<boolean>(false);
  const [customProcedureName, setCustomProcedureName] = useState<string>('');

  const [supervisionLevel, setSupervisionLevel] = useState<SupervisionLevel>('level_4_independent');
  const [procedureDate, setProcedureDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [department, setDepartment] = useState<string>(
    activeStaff?.department || 'Operating Theatre (OT)'
  );
  const [patientIdentifier, setPatientIdentifier] = useState<string>('');
  const [clinicalPlan, setClinicalPlan] = useState<string>('');
  const [equipmentUsed, setEquipmentUsed] = useState<string>('');
  const [complicationsOrNotes, setComplicationsOrNotes] = useState<string>('');
  const [attachments, setAttachments] = useState<ProcedureAttachment[]>([]);
  const [validationError, setValidationError] = useState<string>('');

  const availableCategories = useMemo(() => {
    return getCategoriesForRole(role);
  }, [role]);

  const selectedCategoryObj = useMemo(() => {
    return availableCategories.find((c) => c.id === categoryId);
  }, [availableCategories, categoryId]);

  const allProceduresInCategory = useMemo(() => {
    if (!selectedCategoryObj) return [];
    return selectedCategoryObj.groups.flatMap((g) => g.items);
  }, [selectedCategoryObj]);

  // Reset or populate fields when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (editingSubmission) {
      setRole(editingSubmission.staffRole || 'nurses');
      setCategoryId(editingSubmission.categoryId);
      setProcedureKey(editingSubmission.procedureKey);
      setIsCustomProcedure(!!editingSubmission.isCustomProcedure);
      setCustomProcedureName(editingSubmission.procedureName || '');
      setSupervisionLevel(editingSubmission.supervisionLevel);
      setProcedureDate(editingSubmission.procedureDate);
      setDepartment(editingSubmission.staffDepartment);
      setPatientIdentifier(editingSubmission.patientIdentifier || '');
      setClinicalPlan(editingSubmission.clinicalPlan || '');
      setEquipmentUsed(editingSubmission.equipmentUsed || '');
      setComplicationsOrNotes(editingSubmission.complicationsOrNotes || '');
      setAttachments(editingSubmission.attachments || []);
      setValidationError('');
    } else if (initialCategory && initialProcedure) {
      setRole(initialCategory.applicableRole === 'amos' ? 'amos' : 'nurses');
      setCategoryId(initialCategory.id);
      setProcedureKey(initialProcedure.id);
      setIsCustomProcedure(false);
      setCustomProcedureName('');
      setSupervisionLevel('level_4_independent');
      setProcedureDate(new Date().toISOString().split('T')[0]);
      setDepartment(activeStaff?.department || 'Operating Theatre (OT)');
      setPatientIdentifier('');
      setClinicalPlan('');
      setEquipmentUsed('');
      setComplicationsOrNotes('');
      setAttachments([]);
      setValidationError('');
    } else {
      // New blank submission
      setRole(activeStaff?.role || 'nurses');
      const firstCat = getCategoriesForRole(activeStaff?.role || 'nurses')[0];
      setCategoryId(firstCat?.id || '');
      setProcedureKey(firstCat?.groups[0]?.items[0]?.id || '');
      setIsCustomProcedure(false);
      setCustomProcedureName('');
      setSupervisionLevel('level_4_independent');
      setProcedureDate(new Date().toISOString().split('T')[0]);
      setDepartment(activeStaff?.department || 'Operating Theatre (OT)');
      setPatientIdentifier('');
      setClinicalPlan('');
      setEquipmentUsed('');
      setComplicationsOrNotes('');
      setAttachments([]);
      setValidationError('');
    }
  }, [isOpen, editingSubmission, initialCategory, initialProcedure, activeStaff]);

  if (!isOpen) return null;

  const handleAddMockAttachment = () => {
    const mockAtt: ProcedureAttachment = {
      id: `att-${Date.now()}`,
      name: `Clinical_Log_Verification_${new Date().toISOString().slice(0, 10)}.pdf`,
      size: Math.floor(250000 + Math.random() * 300000),
      type: 'application/pdf',
      uploadedAt: new Date().toISOString()
    };
    setAttachments((prev) => [...prev, mockAtt]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSave = (isDraft: boolean) => {
    setValidationError('');

    if (!isDraft) {
      if (!clinicalPlan.trim() || !equipmentUsed.trim()) {
        setValidationError(
          isMs
            ? 'Sila lengkapkan Pelan Klinikal & Rasionale serta Senarai Peralatan sebelum menghantar.'
            : 'Please complete Clinical Plan & Rationale as well as Equipment List before submitting.'
        );
        return;
      }
      if (isCustomProcedure && !customProcedureName.trim()) {
        setValidationError(
          isMs
            ? 'Sila masukkan nama prosedur tersuai yang dicadangkan.'
            : 'Please enter the proposed custom procedure name.'
        );
        return;
      }
      if (!isCustomProcedure && !procedureKey) {
        setValidationError(
          isMs
            ? 'Sila pilih prosedur dari katalog.'
            : 'Please select a procedure from the catalog.'
        );
        return;
      }
    }

    let finalProcedureName = customProcedureName.trim();
    if (!isCustomProcedure) {
      const foundItem = allProceduresInCategory.find((i) => i.id === procedureKey);
      finalProcedureName = foundItem?.label || 'Clinical Procedure';
    }

    const payload: Partial<ProcedureSubmission> = {
      id: editingSubmission?.id,
      staffId: activeStaff?.id || editingSubmission?.staffId || 'staff-nurse-01',
      staffName: activeStaff?.fullName || editingSubmission?.staffName || 'Hospital Lawas Clinical Staff',
      staffIc: activeStaff?.icNumber || editingSubmission?.staffIc || '940512-13-5682',
      staffGrade: activeStaff?.grade || editingSubmission?.staffGrade || 'U29',
      staffRegistrationNo: activeStaff?.boardRegistrationNo || editingSubmission?.staffRegistrationNo || 'LJM-RN-65432-MY',
      staffApcNo: activeStaff?.apcNumber || editingSubmission?.staffApcNo || 'APC-2026-RN-998821',
      staffDepartment: department,
      staffRole: role,
      categoryId,
      categoryName: selectedCategoryObj?.name || 'Clinical Category',
      procedureKey: isCustomProcedure ? `custom-${Date.now()}` : procedureKey,
      procedureName: finalProcedureName,
      isCustomProcedure,
      supervisionLevel,
      procedureDate,
      patientIdentifier: patientIdentifier.trim() || undefined,
      clinicalPlan: clinicalPlan.trim(),
      equipmentUsed: equipmentUsed.trim(),
      complicationsOrNotes: complicationsOrNotes.trim() || undefined,
      attachments,
      status: isDraft ? 'draft' : 'pending'
    };

    onSave(payload, isDraft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                {editingSubmission
                  ? (isMs ? 'Kemaskini Log Prosedur' : 'Edit Procedure Log')
                  : (isMs ? 'Log & Permohonan Prosedur Privileging' : 'Log & Request Clinical Privilege')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isMs
                  ? 'Perekodan kompetensi klinikal bagi pengiktirafan Surat Penurunan Kuasa KKM'
                  : 'Clinical competency recording for MOH Letter of Credentialing & Clinical Privileging'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Changes Requested Banner if applicable */}
        {editingSubmission?.status === 'changes_requested' && editingSubmission.review && (
          <div className="m-5 md:m-6 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                {isMs
                  ? `Catatan Pindaan Dari Penilai JKCP (${editingSubmission.review.reviewerName})`
                  : `Revision Notes from JKCP Reviewer (${editingSubmission.review.reviewerName})`}
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                "{editingSubmission.review.adminNotes}"
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 font-medium">
                {isMs
                  ? 'Sila buat pembetulan yang diminta dan klik "Hantar untuk Semakan Semula".'
                  : 'Please make requested amendments and click "Resubmit for Review".'}
              </p>
            </div>
          </div>
        )}

        {/* Modal Form Body */}
        <div className="p-5 md:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {validationError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: Role & Category Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {isMs ? 'Peranan Klinikal' : 'Clinical Role'}
              </label>
              <select
                value={role}
                onChange={(e) => {
                  const newRole = e.target.value as CredentialRole;
                  setRole(newRole);
                  const firstCat = getCategoriesForRole(newRole)[0];
                  setCategoryId(firstCat?.id || '');
                  setProcedureKey(firstCat?.groups[0]?.items[0]?.id || '');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              >
                <option value="nurses">{isMs ? 'Jururawat (RN)' : 'Registered Nurses (RN)'}</option>
                <option value="amos">{isMs ? 'Penolong Pegawai Perubatan (AMO)' : 'Assistant Medical Officers (AMO)'}</option>
                <option value="allied_health">{isMs ? 'Sains Kesihatan Bersekutu (AHP)' : 'Allied Health Professionals (AHP)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {isMs ? 'Kategori Klinikal KKM' : 'MOH Clinical Category'}
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  const cat = availableCategories.find((c) => c.id === e.target.value);
                  setProcedureKey(cat?.groups[0]?.items[0]?.id || '');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              >
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.groups.reduce((a, g) => a + g.items.length, 0)} {isMs ? 'prosedur' : 'procedures'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Procedure Selection or Custom */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {isMs ? 'Prosedur Klinikal' : 'Clinical Procedure'}
              </label>
              <button
                type="button"
                onClick={() => setIsCustomProcedure(!isCustomProcedure)}
                className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
              >
                {isMs
                  ? (isCustomProcedure ? 'Pilih dari Katalog Standard' : '+ Cadang Prosedur Lain (Custom)')
                  : (isCustomProcedure ? 'Select from Standard Catalog' : '+ Propose Custom Procedure')}
              </button>
            </div>

            {isCustomProcedure ? (
              <input
                type="text"
                value={customProcedureName}
                onChange={(e) => setCustomProcedureName(e.target.value)}
                placeholder={isMs ? 'cth: Pemasangan Central Venous Line Lanjutan / Pembedahan Khas...' : 'e.g. Advanced Central Venous Catheterization / Specialized Surgery...'}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            ) : (
              <select
                value={procedureKey}
                onChange={(e) => setProcedureKey(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              >
                {selectedCategoryObj?.groups.map((group, gIdx) => (
                  <optgroup key={gIdx} label={`--- ${group.label} ---`}>
                    {group.items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
          </div>

          {/* Section 2: Clinical Details & Supervision Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {isMs ? 'Tarikh Prosedur' : 'Procedure Date'}
              </label>
              <input
                type="date"
                value={procedureDate}
                onChange={(e) => setProcedureDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {isMs ? 'Wad / Unit / Lokasi' : 'Ward / Unit / Location'}
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder={isMs ? 'cth: Dewan Bedah / ETD / ICU' : 'e.g. Operating Theatre / ETD / ICU'}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {isMs ? 'No. Rujukan Kes / MRN' : 'Case Reference No. / MRN'}
              </label>
              <input
                type="text"
                value={patientIdentifier}
                onChange={(e) => setPatientIdentifier(e.target.value)}
                placeholder={isMs ? 'cth: OT-2026-099 (Tanpa Nama)' : 'e.g. OT-2026-099 (Anonymized)'}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Supervision Level Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {isMs ? 'Tahap Pengawasan Dilakukan (Supervision Level)' : 'Supervision Level Performed'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'level_1_observed',
                  label: isMs ? 'Tahap 1: Pemerhatian Sahaja (Observed)' : 'Level 1: Observed Only',
                  desc: isMs ? 'Memerhatikan prosedur dilakukan oleh pakar/penyelia' : 'Observed procedure performed by specialist / supervisor'
                },
                {
                  id: 'level_2_direct_supervision',
                  label: isMs ? 'Tahap 2: Pengawasan Terus (Direct)' : 'Level 2: Direct Supervision',
                  desc: isMs ? 'Melakukan prosedur dengan kehadiran penyelia di sisi' : 'Performed procedure with bedside direct supervisor presence'
                },
                {
                  id: 'level_3_indirect_supervision',
                  label: isMs ? 'Tahap 3: Pengawasan Tidak Terus (Indirect)' : 'Level 3: Indirect Supervision',
                  desc: isMs ? 'Melakukan prosedur dengan penyelia bersedia dipanggil' : 'Performed procedure with supervisor immediately available on call'
                },
                {
                  id: 'level_4_independent',
                  label: isMs ? 'Tahap 4: Kompeten & Berdikari (Independent)' : 'Level 4: Competent & Independent',
                  desc: isMs ? 'Telah mahir & boleh melakukan prosedur secara mandiri' : 'Demonstrated competency to perform procedure independently'
                }
              ].map((lvl) => (
                <div
                  key={lvl.id}
                  onClick={() => setSupervisionLevel(lvl.id as SupervisionLevel)}
                  className={cn(
                    'p-3 rounded-xl border text-left cursor-pointer transition-all',
                    supervisionLevel === lvl.id
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  )}
                >
                  <p className="text-xs font-bold">{lvl.label}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{lvl.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Clinical Textfields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {isMs ? 'Pelan Klinikal, Indikasi & Rasionale' : 'Clinical Plan, Indications & Rationale'} <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={clinicalPlan}
                onChange={(e) => setClinicalPlan(e.target.value)}
                placeholder={isMs ? 'Nyatakan indikasi klinikal pesakit, langkah persediaan aseptik dan protokol yang dipatuhi...' : 'Specify clinical indications, aseptic preparation steps, and guidelines adhered to...'}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {isMs ? 'Peralatan Digunakan & Langkah Keselamatan' : 'Equipment Used & Safety Measures'} <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={equipmentUsed}
                onChange={(e) => setEquipmentUsed(e.target.value)}
                placeholder={isMs ? 'Senaraikan instrumen, set steril, PPE, ubatan atau peranti pemantauan yang digunakan...' : 'List instruments, sterile sets, PPE, medications, or monitoring devices used...'}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {isMs ? 'Refleksi Klinikal, Komplikasi atau Catatan Tambahan (Pilihan)' : 'Clinical Reflection, Complications or Additional Notes (Optional)'}
              </label>
              <input
                type="text"
                value={complicationsOrNotes}
                onChange={(e) => setComplicationsOrNotes(e.target.value)}
                placeholder={isMs ? 'cth: Prosedur lancar, hemostasis tercapai, tiada desaturasi...' : 'e.g. Procedure uneventful, hemostasis achieved, no desaturation...'}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 4: Attachments */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {isMs ? 'Lampiran Bukti Log / Sijil Pengesahan' : 'Logbook Evidence / Verification Attachments'}
              </label>
              <button
                type="button"
                onClick={handleAddMockAttachment}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isMs ? '+ Muat Naik Fail Bukti' : '+ Upload Evidence File'}</span>
              </button>
            </div>

            {attachments.length === 0 ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center">
                <Paperclip className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isMs
                    ? 'Tiada lampiran. Klik butang di atas untuk melampirkan salinan log bertandatangan atau borang pengesahan.'
                    : 'No attachments. Click above to attach signed log sheet or competency verification.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs md:max-w-md">
                        {att.name} ({(att.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 md:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {isMs ? 'Batal' : 'Cancel'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs md:text-sm font-semibold rounded-xl transition-all"
            >
              {isMs ? 'Simpan sebagai Draf' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs md:text-sm font-bold rounded-xl shadow-xs hover:shadow-sm transition-all active:scale-95"
            >
              {editingSubmission?.status === 'changes_requested'
                ? (isMs ? 'Hantar Semakan Semula' : 'Resubmit for Review')
                : (isMs ? 'Hantar untuk Semakan JKCP' : 'Submit for JKCP Review')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
