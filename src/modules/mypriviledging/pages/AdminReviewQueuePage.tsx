// src/modules/mypriviledging/pages/AdminReviewQueuePage.tsx
// Dedicated Admin & JKCP Committee Verification and Review Center

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PriviledgingHeader,
  SubmissionsTable,
  ReviewSubmissionModal
} from '../components';
import { priviledgingService } from '../services/priviledgingService';
import type {
  ProcedureSubmission,
  PrivilegingLevel
} from '../types/priviledgingTypes';
import { ShieldCheck } from 'lucide-react';

export const AdminReviewQueuePage: React.FC = () => {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<ProcedureSubmission[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [reviewingSubmission, setReviewingSubmission] = useState<ProcedureSubmission | null>(null);

  const loadData = () => {
    const allSubs = priviledgingService.getAllSubmissions();
    setSubmissions(allSubs);
  };

  useEffect(() => {
    priviledgingService.setActiveMode('admin');
    loadData();
  }, []);

  const kpis = useMemo(() => {
    return priviledgingService.getKpis();
  }, [submissions]);

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

  return (
    <div className="min-h-screen pb-12">
      <PriviledgingHeader
        isAdminMode={true}
        pendingReviewsCount={kpis.pendingSubmissions}
      />

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface dark:bg-slate-900 border border-border-default dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-xl border border-amber-500/20 dark:border-amber-800">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-text-primary dark:text-white">
              JKCP Committee Review Queue & Privileging Approvals
            </h2>
            <p className="text-xs text-text-muted dark:text-slate-400 mt-0.5">
              Assessment of clinical log evidence, validity duration setting, and authorization letter issuance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-amber-500/10 dark:bg-amber-950/50 text-amber-400 dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-500/20 dark:border-amber-800">
            {kpis.pendingSubmissions} Procedures Pending Review
          </span>
        </div>
      </div>

      <SubmissionsTable
        submissions={submissions}
        isAdminMode={true}
        activeStatusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onReviewSubmission={(sub) => setReviewingSubmission(sub)}
        onViewCertificate={(staffId) => navigate(`/priviledging/print/${staffId}`)}
      />

      <ReviewSubmissionModal
        isOpen={!!reviewingSubmission}
        onClose={() => setReviewingSubmission(null)}
        submission={reviewingSubmission}
        onRecordDecision={handleRecordReviewDecision}
      />
    </div>
  );
};

export default AdminReviewQueuePage;
