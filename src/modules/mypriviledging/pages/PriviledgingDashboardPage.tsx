// src/modules/mypriviledging/pages/PriviledgingDashboardPage.tsx
// Professional Modern Government Landing Dashboard for MyPriviledging

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PriviledgingHeader,
  PriviledgingKpiCards,
  SubmissionsTable,
  SubmitProcedureModal,
  ReviewSubmissionModal
} from '../components';
import { priviledgingService } from '../services/priviledgingService';
import type {
  ProcedureSubmission,
  StaffPrivilegingProfile,
  PrivilegingLevel
} from '../types/priviledgingTypes';
import {
  BookOpen,
  ShieldCheck,
  Printer,
  ArrowRight,
  Clock,
  FileText,
  Award
} from 'lucide-react';
import { Fab } from '@/shared/components/mobile';

export const PriviledgingDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    return priviledgingService.getActiveMode() === 'admin';
  });
  const [submissions, setSubmissions] = useState<ProcedureSubmission[]>([]);
  const [staffProfiles, setStaffProfiles] = useState<StaffPrivilegingProfile[]>([]);
  const [activeStaff, setActiveStaff] = useState<StaffPrivilegingProfile | undefined>();

  // Modal States
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [editingSubmission, setEditingSubmission] = useState<ProcedureSubmission | null>(null);
  const [reviewingSubmission, setReviewingSubmission] = useState<ProcedureSubmission | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadData = () => {
    const allSubs = priviledgingService.getAllSubmissions();
    const allStaff = priviledgingService.getAllStaffProfiles();
    setSubmissions(allSubs);
    setStaffProfiles(allStaff);

    // Active staff: default to the first profile (Jururawat or AMO)
    const current = allStaff[0];
    setActiveStaff(current);
  };

  useEffect(() => {
    loadData();

    const handleModeChange = (e: any) => {
      setIsAdminMode(e.detail === 'admin');
    };
    window.addEventListener('priviledging_mode_change', handleModeChange);
    return () => window.removeEventListener('priviledging_mode_change', handleModeChange);
  }, []);

  const kpis = useMemo(() => {
    return priviledgingService.getKpis();
  }, [submissions, staffProfiles]);

  // Handle Save / Submit
  const handleSaveSubmission = (data: Partial<ProcedureSubmission>, isDraft: boolean) => {
    priviledgingService.saveSubmission(data as any);
    loadData();
  };

  // Handle Submit Draft
  const handleSubmitDraft = (id: string) => {
    priviledgingService.submitDraftForReview(id);
    loadData();
  };

  // Handle Delete
  const handleDeleteSubmission = (id: string) => {
    if (window.confirm('Are you sure you want to delete this procedure submission?')) {
      priviledgingService.deleteSubmission(id);
      loadData();
    }
  };

  // Handle Admin Review Decision
  const handleRecordReviewDecision = (params: {
    submissionId: string;
    decision: 'approved' | 'changes_requested' | 'rejected';
    adminNotes: string;
    privilegingLevel?: PrivilegingLevel;
    validityYears?: number;
  }) => {
    priviledgingService.recordReviewDecision({
      ...params,
      reviewerId: 'admin-jkcp-01',
      reviewerName: 'Matron Hasnah binti Kassim (JKCP)',
      reviewerRole: 'Lawas Hospital Nursing Supervisor'
    });
    loadData();
  };

  // Switch Active Staff Profile
  const handleSelectStaff = (staffId: string) => {
    const found = staffProfiles.find((s) => s.id === staffId);
    if (found) setActiveStaff(found);
  };

  const userSubmissions = useMemo(() => {
    if (isAdminMode) return submissions;
    return activeStaff ? submissions.filter((s) => s.staffId === activeStaff.id) : submissions;
  }, [submissions, activeStaff, isAdminMode]);

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <PriviledgingHeader
        isAdminMode={isAdminMode}
        onToggleAdminMode={setIsAdminMode}
        onOpenSubmitModal={() => {
          setEditingSubmission(null);
          setIsSubmitModalOpen(true);
        }}
        pendingReviewsCount={kpis.pendingSubmissions}
        changesCount={activeStaff?.changesCount || 0}
      />

      {/* Staff Profile Switcher Bar */}
      <div className="bg-surface border border-border-default rounded-xl p-4 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-subtle border border-border-default flex items-center justify-center text-text-primary font-bold text-sm">
            {activeStaff?.fullName.slice(0, 2).toUpperCase() || 'ST'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted uppercase font-semibold tracking-wider">
                Active Profile:
              </span>
              <h3 className="text-sm font-bold text-text-primary">
                {activeStaff?.fullName}
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-accent-base/10 text-accent-base border border-accent-base/20 text-[10px] font-bold">
                {activeStaff?.grade}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              {activeStaff?.position} • {activeStaff?.department}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Switch Staff:</label>
          <select
            value={activeStaff?.id || ''}
            onChange={(e) => handleSelectStaff(e.target.value)}
            className="px-3 py-1.5 bg-canvas border border-border-default rounded-lg text-xs font-medium text-text-primary focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          >
            {staffProfiles.map((st) => (
              <option key={st.id} value={st.id}>
                {st.fullName} ({st.position} - {st.grade})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <PriviledgingKpiCards
        isAdminMode={isAdminMode}
        kpis={kpis}
        activeStaff={activeStaff}
        onFilterClick={(status) => setStatusFilter(status)}
      />

      {/* Quick Access Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4 mb-6">
        {/* Card 1: Credentialing Criteria */}
        <div
          onClick={() => navigate('/priviledging/criteria')}
          className="group p-4 md:p-5 bg-surface border border-border-default hover:border-accent-base/40 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sky-700 dark:text-sky-400 border border-slate-200 dark:border-slate-700">
              <Award className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-sky-700 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-text-primary">
            Credentialing Criteria
          </h4>
          <p className="text-xs text-text-muted mt-1">
            Eligibility criteria, required supporting documentation & clinical checklists for Staff Nurses & Assistant Medical Officers.
          </p>
        </div>

        {/* Card 2: Catalog Explorer */}
        <div
          onClick={() => navigate('/priviledging/catalog')}
          className="group p-4 md:p-5 bg-surface border border-border-default hover:border-accent-base/40 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700">
              <BookOpen className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-700 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-text-primary">
            Procedure Catalog (500+)
          </h4>
          <p className="text-xs text-text-muted mt-1">
            Explore 14 clinical procedure categories and select items for your competency logbook.
          </p>
        </div>

        {/* Card 3: Admin Queue or My Submissions */}
        <div
          onClick={() => navigate(isAdminMode ? '/priviledging/review-queue' : '/priviledging/my-submissions')}
          className="group p-4 md:p-5 bg-surface border border-border-default hover:border-accent-base/40 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-400 border border-slate-200 dark:border-slate-700">
              {isAdminMode ? <ShieldCheck className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-700 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-text-primary">
            {isAdminMode ? 'JKCP Committee Review Queue' : 'My Submissions & Logbook'}
          </h4>
          <p className="text-xs text-text-muted mt-1">
            {isAdminMode
              ? `${kpis.pendingSubmissions} procedures awaiting clinical assessment & endorsement.`
              : 'Track drafts, active submissions, approved privileges and amendment requests.'}
          </p>
        </div>

        {/* Card 4: Print Privileging Certificate */}
        <div
          onClick={() => navigate('/priviledging/print')}
          className="group p-4 md:p-5 bg-surface border border-border-default hover:border-accent-base/40 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Printer className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-900 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-text-primary">
            Print Privileging Certificate
          </h4>
          <p className="text-xs text-text-muted mt-1">
            Official MOH credentialing certificate & letters of authorization with national crest for approved privileges.
          </p>
        </div>
      </div>

      {/* Recent Submissions Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent-base" />
            {isAdminMode ? 'Hospital Privileging Registry' : 'Your Clinical Procedures Logbook'}
          </h3>
          <button
            onClick={() => navigate(isAdminMode ? '/priviledging/review-queue' : '/priviledging/my-submissions')}
            className="text-xs text-accent-base hover:underline font-semibold flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <SubmissionsTable
          submissions={userSubmissions}
          isAdminMode={isAdminMode}
          activeStatusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onEditSubmission={(sub) => {
            setEditingSubmission(sub);
            setIsSubmitModalOpen(true);
          }}
          onSubmitDraft={handleSubmitDraft}
          onDeleteSubmission={handleDeleteSubmission}
          onReviewSubmission={(sub) => setReviewingSubmission(sub)}
          onViewCertificate={(staffId) => navigate(`/priviledging/print/${staffId}`)}
        />
      </div>

      {/* Modals */}
      <SubmitProcedureModal
        isOpen={isSubmitModalOpen}
        onClose={() => {
          setIsSubmitModalOpen(false);
          setEditingSubmission(null);
        }}
        onSave={handleSaveSubmission}
        editingSubmission={editingSubmission}
        activeStaff={activeStaff}
      />

      <ReviewSubmissionModal
        isOpen={!!reviewingSubmission}
        onClose={() => setReviewingSubmission(null)}
        submission={reviewingSubmission}
        onRecordDecision={handleRecordReviewDecision}
      />

      {/* Mobile Floating Action Button */}
      <Fab 
        onClick={() => {
          setEditingSubmission(null);
          setIsSubmitModalOpen(true);
        }} 
        aria-label="Submit Clinical Procedure" 
      />
    </div>
  );
};

export default PriviledgingDashboardPage;
