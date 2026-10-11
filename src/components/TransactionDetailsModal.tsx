// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';

export interface TransactionDetails {
  id: string;
  date: string;
  time: string;
  type: 'RECEIVE' | 'ISSUE' | 'ADJUST' | 'TRANSFER';
  itemName: string;
  itemCode: string;
  category: 'Drug' | 'Non-drug';
  quantity: number;
  unit: string;
  requestedBy: string;
  reference: string;
  balanceBefore?: number;
  balanceAfter?: number;
  // Additional details for the modal
  batchNumber?: string;
  expiryDate?: string;
  supplier?: string;
  reason?: string;
  notes?: string;
  previousQuantity?: number;
  newQuantity?: number;
  fromLocation?: string;
  toLocation?: string;
  approvedBy?: string;
  status?: 'Pending' | 'Approved' | 'Completed' | 'Rejected';
}

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionDetails | null;
}

function getMovementTypeColor(type: string) {
  switch (type) {
    case 'RECEIVE':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'ISSUE':
      return 'bg-blue-100 text-blue-400 border-blue-500/20';
    case 'ADJUST':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'TRANSFER':
      return 'bg-purple-100 text-indigo-400 border-indigo-500/20';
    default:
      return 'bg-subtle text-text-primary border-border-default';
  }
}

function getMovementIcon(type: string) {
  switch (type) {
    case 'RECEIVE':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case 'ISSUE':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case 'ADJUST':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    case 'TRANSFER':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      );
    default:
      return null;
  }
}

export default function TransactionDetailsModal({ isOpen, onClose, transaction }: TransactionDetailsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen || !transaction) {
    return null;
  }

  // Generate additional details based on transaction type
  const generateAdditionalDetails = (transaction: TransactionDetails) => {
    const details: Partial<TransactionDetails> = {};
    
    // Use actual batch and expiry information from transaction
    details.batchNumber = transaction.batchNumber;
    details.expiryDate = transaction.expiryDate;
    details.status = 'Completed';
    
    // Use transaction ID to generate deterministic values
    const hash = transaction.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    if (transaction.type === 'RECEIVE') {
      details.supplier = ['MedSupply Co.', 'PharmaDirect', 'HealthTech Solutions', 'MediCorp Ltd.'][Math.abs(hash) % 4];
      details.approvedBy = 'Dr. Sarah Lee';
    } else if (transaction.type === 'ISSUE') {
      details.reason = ['Patient treatment', 'Emergency use', 'Routine dispensing', 'Surgical procedure'][Math.abs(hash) % 4];
      details.approvedBy = 'Dr. Ahmad Rahman';
    } else if (transaction.type === 'ADJUST') {
      details.reason = ['Inventory correction', 'Damaged goods', 'Expired items', 'Counting error'][Math.abs(hash) % 4];
      details.previousQuantity = transaction.quantity - (Math.abs(hash) % 20) - 1;
      details.newQuantity = transaction.quantity;
      details.approvedBy = 'Nurse Lisa Chen';
    } else if (transaction.type === 'TRANSFER') {
      const allUnits = ['Main Store', 'Operating Theater', 'Emergency Department', 'ICU', 'Pediatric Ward', 'Cardiology Ward', 'Orthopedic Ward', 'Pharmacy', 'Laboratory', 'Radiology'];
      const otherUnits = allUnits.filter(unit => unit !== transaction.unit);
      details.fromLocation = otherUnits[Math.abs(hash) % otherUnits.length];
      details.toLocation = transaction.unit;
      details.approvedBy = 'Dr. Lim Wei Ming';
    }
    
    return details;
  };

  const additionalDetails = generateAdditionalDetails(transaction);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-surface rounded-2xl shadow-2xl border border-border-default">
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-border-default bg-subtle/50 rounded-t-2xl">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${getMovementTypeColor(transaction.type)}`}>
                {getMovementIcon(transaction.type)}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-text-primary">
                  Transaction Details
                </h3>
                <p className="text-text-secondary font-semibold">
                  {transaction.reference}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-text-secondary transition-colors p-2 hover:bg-subtle rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-subtle/50 rounded-xl p-4">
                <label className="block text-sm font-semibold text-text-secondary mb-2">Transaction ID</label>
                <p className="text-lg font-bold text-text-primary font-mono">{transaction.id}</p>
              </div>
              <div className="bg-subtle/50 rounded-xl p-4">
                <label className="block text-sm font-semibold text-text-secondary mb-2">Date & Time</label>
                <p className="text-lg font-bold text-text-primary">{transaction.date} at {transaction.time}</p>
              </div>
              <div className="bg-subtle/50 rounded-xl p-4">
                <label className="block text-sm font-semibold text-text-secondary mb-2">Type</label>
                <span className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-bold border ${getMovementTypeColor(transaction.type)}`}>
                  {getMovementIcon(transaction.type)}
                  <span className="ml-2">{transaction.type}</span>
                </span>
              </div>
            </div>

            {/* Item Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-text-primary mb-4">Item Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Item Name</label>
                  <p className="text-lg font-bold text-text-primary">{transaction.itemName}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Item Code</label>
                  <p className="text-lg font-bold text-text-primary font-mono">{transaction.itemCode}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Category</label>
                  <p className="text-lg font-bold text-text-primary">{transaction.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Quantity</label>
                  <p className={`text-2xl font-bold ${transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                  </p>
                </div>
              </div>
            </div>

            {/* Balance Information */}
            {(transaction.balanceBefore !== undefined && transaction.balanceAfter !== undefined) && (
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-text-primary mb-6">Balance Information</h4>
                <div className="bg-surface rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <label className="block text-sm font-semibold text-text-secondary mb-3">Balance Before</label>
                      <div className="text-4xl font-bold text-text-primary mb-2">
                        {transaction.balanceBefore}
                      </div>
                      <p className="text-sm text-text-secondary font-medium">units in {transaction.unit}</p>
                    </div>
                    <div className="text-center">
                      <label className="block text-sm font-semibold text-text-secondary mb-3">Transaction</label>
                      <div className={`text-4xl font-bold ${transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                      </div>
                      <p className="text-sm text-text-secondary font-medium">{transaction.type.toLowerCase()}</p>
                    </div>
                    <div className="text-center">
                      <label className="block text-sm font-semibold text-text-secondary mb-3">Balance After</label>
                      <div className="text-4xl font-bold text-blue-600">
                        {transaction.balanceAfter}
                      </div>
                      <p className="text-sm text-text-secondary font-medium">units in {transaction.unit}</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-border-default">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-4 h-4 bg-slate-400 rounded-full"></div>
                      <div className="flex-1 h-1 bg-gradient-to-r from-slate-400 via-blue-400 to-blue-600 rounded-full"></div>
                      <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="text-center text-sm font-semibold text-text-secondary mt-3">
                      Inventory flow: {transaction.balanceBefore} â†’ {transaction.balanceAfter}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Batch & Expiry Information - Always shown for all transactions */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-text-primary mb-4">Batch & Expiry Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface rounded-xl p-4">
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Batch Number</label>
                  <p className="text-lg font-bold text-text-primary font-mono">
                    {additionalDetails.batchNumber || transaction.batchNumber || 'N/A'}
                  </p>
                </div>
                <div className="bg-surface rounded-xl p-4">
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Expiry Date</label>
                  <p className="text-lg font-bold text-text-primary">
                    {additionalDetails.expiryDate || transaction.expiryDate || 'N/A'}
                  </p>
                </div>
                {additionalDetails.supplier && (
                  <div className="bg-surface rounded-xl p-4">
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Supplier</label>
                    <p className="text-lg font-bold text-text-primary">{additionalDetails.supplier}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Location & Personnel */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-text-primary mb-4">Location & Personnel</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface rounded-xl p-4">
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Unit/Location</label>
                  <p className="text-lg font-bold text-text-primary">{transaction.unit}</p>
                </div>
                <div className="bg-surface rounded-xl p-4">
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Requested By</label>
                  <p className="text-lg font-bold text-text-primary">{transaction.requestedBy}</p>
                </div>
                {additionalDetails.approvedBy && (
                  <div className="bg-surface rounded-xl p-4">
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Approved By</label>
                    <p className="text-lg font-bold text-text-primary">{additionalDetails.approvedBy}</p>
                  </div>
                )}
                <div className="bg-surface rounded-xl p-4">
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Status</label>
                  <span className="inline-flex items-center px-3 py-2 rounded-xl text-sm font-bold bg-green-100 text-green-800">
                    {additionalDetails.status || 'Completed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Details based on transaction type */}
            {transaction.type === 'ISSUE' && additionalDetails.reason && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-text-primary mb-4">Issue Details</h4>
                <div className="bg-surface rounded-xl p-4">
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Reason</label>
                  <p className="text-lg font-bold text-text-primary">{additionalDetails.reason}</p>
                </div>
              </div>
            )}

            {transaction.type === 'ADJUST' && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-text-primary mb-4">Adjustment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {additionalDetails.reason && (
                    <div className="bg-surface rounded-xl p-4">
                      <label className="block text-sm font-semibold text-text-secondary mb-2">Reason</label>
                      <p className="text-lg font-bold text-text-primary">{additionalDetails.reason}</p>
                    </div>
                  )}
                  {additionalDetails.previousQuantity !== undefined && (
                    <div className="bg-surface rounded-xl p-4">
                      <label className="block text-sm font-semibold text-text-secondary mb-2">Previous Quantity</label>
                      <p className="text-lg font-bold text-text-primary">{additionalDetails.previousQuantity}</p>
                    </div>
                  )}
                  {additionalDetails.newQuantity !== undefined && (
                    <div className="bg-surface rounded-xl p-4">
                      <label className="block text-sm font-semibold text-text-secondary mb-2">New Quantity</label>
                      <p className="text-lg font-bold text-text-primary">{additionalDetails.newQuantity}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {transaction.type === 'TRANSFER' && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-text-primary mb-4">Transfer Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {additionalDetails.fromLocation && (
                    <div className="bg-surface rounded-xl p-4">
                      <label className="block text-sm font-semibold text-text-secondary mb-2">From Location</label>
                      <p className="text-lg font-bold text-text-primary">{additionalDetails.fromLocation}</p>
                    </div>
                  )}
                  {additionalDetails.toLocation && (
                    <div className="bg-surface rounded-xl p-4">
                      <label className="block text-sm font-semibold text-text-secondary mb-2">To Location</label>
                      <p className="text-lg font-bold text-text-primary">{additionalDetails.toLocation}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-subtle/50 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-text-primary mb-4">Additional Information</h4>
              <div className="bg-surface rounded-xl p-4">
                <p className="text-text-secondary font-medium">
                  This transaction was processed through the Pharmacy Inventory & Logistics System (PILS). 
                  All movements are automatically logged and tracked for audit purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-4 p-8 border-t border-border-default bg-subtle/50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-6 py-3 text-sm font-semibold text-text-secondary bg-surface border border-border-default rounded-xl hover:bg-subtle/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-[transform,opacity,box-shadow,border-color] duration-200 shadow-sm"
            >
              Close
            </button>
            <button
              onClick={() => {
                window.print();
              }}
              className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-[transform,opacity,box-shadow,border-color] duration-200 shadow-lg"
            >
              Print Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
