// src/modules/mypriviledging/components/PriviledgingCertificatePrint.tsx
// Official Malaysian Ministry of Health (KKM) Privileging Certificate & Authorisation Letter
// Formatted for A4 High-Resolution Print and PDF Export

import React, { useRef } from 'react';
import {
  Printer,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  ArrowLeft,
  Award,
  Calendar,
  Building,
  User
} from 'lucide-react';
import type { PrivilegingCertificateData } from '../types/priviledgingTypes';

interface PriviledgingCertificatePrintProps {
  certificateData: PrivilegingCertificateData;
  onBack?: () => void;
}

export const PriviledgingCertificatePrint: React.FC<PriviledgingCertificatePrintProps> = ({
  certificateData,
  onBack
}) => {
  const printContainerRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const { staff, approvedProcedures, jkcpChairperson, hospitalDirector } = certificateData;

  const totalProcedures = approvedProcedures.reduce(
    (acc, cat) => acc + cat.procedures.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden during print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface dark:bg-slate-900 border border-border-default dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-text-muted hover:text-text-primary dark:hover:text-white hover:bg-subtle dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-lg md:text-xl font-bold text-text-primary dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              Privileging Certificate & Clinical Authorization Letter
            </h2>
            <p className="text-xs text-text-muted dark:text-slate-400">
              Official MOH document for physical printing or hospital audit archive
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs md:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Certificate (A4)</span>
          </button>
        </div>
      </div>

      {/* Printable Certificate Page */}
      <div
        ref={printContainerRef}
        id="kkm-privileging-certificate"
        className="bg-surface text-text-primary border border-border-default rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:rounded-none"
        style={{ minHeight: '1050px', fontFamily: '"Times New Roman", Times, serif' }}
      >
        {/* Certificate Outer Border Frame */}
        <div className="border-4 border-double border-slate-800 p-6 md:p-8 relative">
          {/* Subtle Watermark Seal */}
          <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none select-none">
            <img
              src="/images/jata-negara.svg"
              alt="KKM Crest"
              className="w-96 h-96 object-contain"
            />
          </div>

          {/* Official Malaysian Government Header */}
          <div className="text-center pb-5 border-b-2 border-slate-800 relative z-10">
            <div className="flex justify-center mb-3">
              <img
                src="/images/jata-negara.svg"
                alt="Jata Negara"
                className="w-20 h-20 object-contain mx-auto"
              />
            </div>
            <h1 className="text-base md:text-lg font-bold tracking-widest uppercase text-slate-950 font-sans">
              MINISTRY OF HEALTH MALAYSIA
            </h1>
            <h2 className="text-sm md:text-base font-bold tracking-wider uppercase text-text-primary font-sans mt-0.5">
              LAWAS HOSPITAL, SARAWAK
            </h2>
            <p className="text-xs text-text-muted font-sans mt-0.5 uppercase tracking-wide">
              Hospital Credentialing & Privileging Committee (JKCP)
            </p>
          </div>

          {/* Document Title Banner */}
          <div className="text-center my-6 relative z-10">
            <div className="inline-block border-y-2 border-slate-800 py-2 px-6">
              <h3 className="text-lg md:text-xl font-bold uppercase tracking-wider text-text-primary">
                CLINICAL CREDENTIALING & PRIVILEGING AUTHORISATION CERTIFICATE
              </h3>
              <p className="text-[11px] font-sans font-semibold text-text-muted tracking-wide mt-0.5 uppercase">
                SIJIL PERAKUAN PRIVILEGING & SURAT PENURUNAN KUASA KLINIKAL
              </p>
            </div>
            <div className="flex justify-between items-center text-xs font-sans text-text-muted mt-3 px-2">
              <span><strong>Ref. No.:</strong> {certificateData.certificateNo}</span>
              <span><strong>Issue Date:</strong> {certificateData.issueDate}</span>
            </div>
          </div>

          {/* Officer Particulars Grid */}
          <div className="my-5 relative z-10 font-sans">
            <table className="w-full text-xs border border-slate-400">
              <tbody>
                <tr className="border-b border-border-default">
                  <td className="w-1/4 p-2 bg-subtle font-bold text-text-primary">Officer Full Name:</td>
                  <td className="w-3/4 p-2 font-bold text-slate-950 uppercase">{staff.fullName}</td>
                </tr>
                <tr className="border-b border-border-default">
                  <td className="p-2 bg-subtle font-bold text-text-primary">National Identity Card No.:</td>
                  <td className="p-2 font-mono font-semibold">{staff.icNumber}</td>
                </tr>
                <tr className="border-b border-border-default">
                  <td className="p-2 bg-subtle font-bold text-text-primary">Position & Grade:</td>
                  <td className="p-2 font-semibold">{staff.position} ({staff.grade})</td>
                </tr>
                <tr className="border-b border-border-default">
                  <td className="p-2 bg-subtle font-bold text-text-primary">Board Registration No.:</td>
                  <td className="p-2 font-mono font-semibold">{staff.boardRegistrationNo} (Nursing / MA Board)</td>
                </tr>
                <tr className="border-b border-border-default">
                  <td className="p-2 bg-subtle font-bold text-text-primary">Annual Practicing Certificate (APC):</td>
                  <td className="p-2 font-mono font-semibold">{staff.apcNumber} (Valid Until: {staff.apcExpiryDate})</td>
                </tr>
                <tr>
                  <td className="p-2 bg-subtle font-bold text-text-primary">Department / Placement:</td>
                  <td className="p-2 font-semibold text-text-primary">{staff.department}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Certification Statement */}
          <div className="my-5 text-justify text-xs md:text-sm leading-relaxed relative z-10">
            <p>
              This is to certify that the above clinical officer has undergone comprehensive clinical competency assessment, procedural skills evaluation, and logbook verification, and is hereby <strong>CLINICALLY PRIVILEGED</strong> to perform the following clinical procedures at Lawas Hospital in accordance with <em>Ministry of Health Malaysia Credentialing & Privileging Guidelines</em>:
            </p>
          </div>

          {/* List of Approved Procedures Grouped by Category */}
          <div className="my-5 relative z-10 font-sans space-y-4">
            {approvedProcedures.length === 0 ? (
              <div className="p-4 border border-dashed border-border-default text-center text-xs text-text-muted">
                No approved procedures to display yet. Please submit procedural logbook for JKCP evaluation.
              </div>
            ) : (
              approvedProcedures.map((cat, cIdx) => (
                <div key={cIdx} className="border border-slate-400 rounded-xs overflow-hidden">
                  <div className="bg-slate-800 text-white font-bold text-xs px-3 py-1.5 flex items-center justify-between">
                    <span>{cat.categoryName}</span>
                    <span className="text-[10px] font-normal opacity-80">
                      {cat.procedures.length} Procedures Certified
                    </span>
                  </div>
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-subtle border-b border-border-default text-[11px] font-bold text-text-secondary">
                        <th className="py-1.5 px-3 w-8 text-center">No.</th>
                        <th className="py-1.5 px-3">Clinical Procedure Name</th>
                        <th className="py-1.5 px-3 w-40">Privileging Level</th>
                        <th className="py-1.5 px-3 w-28 text-center">Validity Period</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-default">
                      {cat.procedures.map((proc, pIdx) => (
                        <tr key={pIdx} className="hover:bg-subtle/50">
                          <td className="py-1.5 px-3 text-center font-semibold text-text-muted">{pIdx + 1}</td>
                          <td className="py-1.5 px-3 font-semibold text-text-primary">{proc.name}</td>
                          <td className="py-1.5 px-3 font-medium text-emerald-400">
                            {proc.level === 'core'
                              ? 'Core Procedure (Independent)'
                              : proc.level === 'specialized'
                              ? 'Specialized / Advanced Procedure'
                              : 'Conditional (Supervised)'}
                          </td>
                          <td className="py-1.5 px-3 text-center text-[11px] text-text-secondary">
                            {proc.validUntil}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>

          {/* Validity & Terms */}
          <div className="my-4 p-3 bg-subtle/50 border border-border-default rounded-xs text-xs font-sans text-text-secondary relative z-10">
            <p className="font-bold text-text-primary">Privileging Terms & Validity Duration:</p>
            <p className="mt-0.5">
              This credentialing authorization is effective from <strong>{certificateData.issueDate}</strong> until <strong>{certificateData.expiryDate}</strong> (MOH 3-Year Cycle). The clinical officer is responsible for submitting renewal application 6 months prior to expiry date accompanied by verified annual logbook records.
            </p>
          </div>

          {/* Endorsement & Signatures Section */}
          <div className="mt-8 pt-4 border-t-2 border-slate-800 relative z-10 font-sans">
            <div className="grid grid-cols-3 gap-6 items-end">
              {/* QR Verification Block */}
              <div className="text-center border border-border-default p-3 rounded-xs bg-subtle/50">
                <div className="w-20 h-20 bg-surface border border-slate-400 mx-auto flex items-center justify-center p-1">
                  {/* Simplified clean SVG QR graphic */}
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <rect width="100" height="100" fill="white" />
                    <rect x="10" y="10" width="30" height="30" fill="black" />
                    <rect x="15" y="15" width="20" height="20" fill="white" />
                    <rect x="20" y="20" width="10" height="10" fill="black" />
                    <rect x="60" y="10" width="30" height="30" fill="black" />
                    <rect x="65" y="15" width="20" height="20" fill="white" />
                    <rect x="70" y="20" width="10" height="10" fill="black" />
                    <rect x="10" y="60" width="30" height="30" fill="black" />
                    <rect x="15" y="65" width="20" height="20" fill="white" />
                    <rect x="20" y="70" width="10" height="10" fill="black" />
                    <rect x="50" y="50" width="15" height="15" fill="black" />
                    <rect x="70" y="70" width="15" height="15" fill="black" />
                    <rect x="50" y="75" width="10" height="10" fill="black" />
                  </svg>
                </div>
                <p className="text-[10px] text-text-muted font-mono mt-1">Scan for MOH Digital Verification</p>
                <p className="text-[9px] text-slate-400 font-mono">{certificateData.certificateNo}</p>
              </div>

              {/* JKCP Chairperson Signature */}
              <div className="text-center">
                <div className="h-16 flex items-end justify-center pb-1">
                  <div className="font-serif italic text-sm text-text-secondary font-bold">
                    [JKCP Digital Signature]
                  </div>
                </div>
                <div className="border-t border-slate-700 pt-1 text-xs">
                  <p className="font-bold text-text-primary">{jkcpChairperson.name}</p>
                  <p className="text-[10px] text-text-muted leading-tight">{jkcpChairperson.designation}</p>
                </div>
              </div>

              {/* Hospital Director Signature */}
              <div className="text-center">
                <div className="h-16 flex items-end justify-center pb-1">
                  <div className="font-serif italic text-sm text-text-secondary font-bold">
                    [Hospital Director Digital Signature]
                  </div>
                </div>
                <div className="border-t border-slate-700 pt-1 text-xs">
                  <p className="font-bold text-text-primary">{hospitalDirector.name}</p>
                  <p className="text-[10px] text-text-muted leading-tight">{hospitalDirector.designation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
