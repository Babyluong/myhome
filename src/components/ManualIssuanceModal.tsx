// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';

interface ManualIssuanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillItem?: {
    itemName: string;
    drugCode: string;
    category: string;
    quantity: number;
    batchNumber: string;
    expiryDate: string;
    unitCost: number;
    priority: string;
  };
  bulkItems?: any[];
}

interface IssuanceItem {
  id: string;
  itemName: string;
  drugCode: string;
  dosageForm: string;
  quantity: number;
  unit: string;
  batchNumber: string;
  expiryDate: string;
  location: string;
  sku: string;
  pku: string;
  packaging: string;
  balance: number;
  category: string;
}

export default function ManualIssuanceModal({
  isOpen,
  onClose,
  prefillItem,
  bulkItems,
}: ManualIssuanceModalProps) {
  const [items, setItems] = useState<IssuanceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<IssuanceItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [recipient, setRecipient] = useState('');
  const [department, setDepartment] = useState('');
  const [notes, setNotes] = useState('');
  const [currentStep, setCurrentStep] = useState<'create' | 'review' | 'approve' | 'issue'>('create');
  const [reviewComments, setReviewComments] = useState('');
  const [approvalComments, setApprovalComments] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'drug' | 'non-drug'>('all');
  const [editingItem, setEditingItem] = useState<IssuanceItem | null>(null);
  const [editQuantity, setEditQuantity] = useState(1);

  // Handle prefillItem and bulkItems when modal opens
  useEffect(() => {
    if (isOpen) {
      if (bulkItems && bulkItems.length > 0) {
        // Handle bulk items
        const mockItems: IssuanceItem[] = bulkItems.map((item, index) => ({
          id: `bulk-${Date.now()}-${index}`,
          itemName: item.name,
          drugCode: item.sku,
          dosageForm: item.category === 'Drug' ? 'Tablet' : 'Unit',
          quantity: item.quantity || item.currentStock || 1,
          unit: item.category === 'Drug' ? 'tablets' : 'units',
          batchNumber: item.batch,
          expiryDate: item.expiry,
          location: 'Cabinet A, Level 1, Column 1', // Default location
          sku: item.sku,
          pku: `PKU-${item.sku}`,
          packaging: `pack of ${item.quantity || item.currentStock || 1}`,
          balance: (item.quantity || item.currentStock || 1) * 2, // Assume double the quantity is available
          category: item.category.toLowerCase(),
        }));
        
        setItems(mockItems);
        
        // Set default recipient based on first item's priority
        const firstItem = bulkItems[0];
        const priority = firstItem.priority || firstItem.status;
        if (priority === 'URGENT' || priority === 'CRITICAL') {
          setRecipient('Emergency Department');
          setDepartment('EMERGENCY');
        } else {
          setRecipient('General Ward');
          setDepartment('WARD A');
        }
      } else if (prefillItem) {
        // Handle single item prefill (legacy support)
        const mockItem: IssuanceItem = {
          id: `prefill-${Date.now()}`,
          itemName: prefillItem.itemName,
          drugCode: prefillItem.drugCode,
          dosageForm: prefillItem.category === 'Drug' ? 'Tablet' : 'Unit',
          quantity: prefillItem.quantity,
          unit: prefillItem.category === 'Drug' ? 'tablets' : 'units',
          batchNumber: prefillItem.batchNumber,
          expiryDate: prefillItem.expiryDate,
          location: 'Cabinet A, Level 1, Column 1', // Default location
          sku: prefillItem.drugCode,
          pku: `PKU-${prefillItem.drugCode}`,
          packaging: `pack of ${prefillItem.quantity}`,
          balance: prefillItem.quantity * 2, // Assume double the quantity is available
          category: prefillItem.category.toLowerCase(),
        };
        
        setItems([mockItem]);
        
        // Set default recipient based on priority
        if (prefillItem.priority === 'URGENT') {
          setRecipient('Emergency Department');
          setDepartment('EMERGENCY');
        } else {
          setRecipient('General Ward');
          setDepartment('WARD A');
        }
      }
    }
  }, [isOpen, prefillItem, bulkItems]);

  // Mock inventory data
  const inventoryItems = [
    { 
      id: '1', 
      name: 'Paracetamol 500mg', 
      code: 'PAR-500', 
      form: 'Tablet', 
      unit: 'tablets', 
      location: 'Cabinet A, Level 2, Column 15',
      sku: 'SKU-001',
      pku: 'PKU-001',
      packaging: 'pack of 100 tab',
      batchNumber: 'B2024001',
      expiry: '2025-12-31',
      balance: 2500,
      category: 'drug'
    },
    { 
      id: '2', 
      name: 'Ibuprofen 400mg', 
      code: 'IBU-400', 
      form: 'Tablet', 
      unit: 'tablets', 
      location: 'Cabinet A, Level 3, Column 8',
      sku: 'SKU-002',
      pku: 'PKU-002',
      packaging: 'pack of 50 tab',
      batchNumber: 'B2024002',
      expiry: '2025-10-15',
      balance: 1800,
      category: 'drug'
    },
    { 
      id: '3', 
      name: 'Amoxicillin 250mg', 
      code: 'AMX-250', 
      form: 'Capsule', 
      unit: 'capsules', 
      location: 'Cabinet B, Level 1, Column 12',
      sku: 'SKU-003',
      pku: 'PKU-003',
      packaging: 'pack of 20 cap',
      batchNumber: 'B2024003',
      expiry: '2025-08-20',
      balance: 320,
      category: 'drug'
    },
    { 
      id: '4', 
      name: 'Insulin Syringe 1ml', 
      code: 'INS-1ML', 
      form: 'Syringe', 
      unit: 'units', 
      location: 'Cabinet C, Level 2, Column 5',
      sku: 'SKU-004',
      pku: 'PKU-004',
      packaging: 'pack of 10 unit',
      batchNumber: 'B2024004',
      expiry: '2025-06-30',
      balance: 150,
      category: 'non-drug'
    },
    { 
      id: '5', 
      name: 'Gauze Pad 4x4', 
      code: 'GAU-4X4', 
      form: 'Pad', 
      unit: 'pads', 
      location: 'Cabinet D, Level 1, Column 20',
      sku: 'SKU-005',
      pku: 'PKU-005',
      packaging: 'pack of 50 pad',
      batchNumber: 'B2024005',
      expiry: '2026-03-15',
      balance: 1200,
      category: 'non-drug'
    },
    { 
      id: '6', 
      name: 'Oxygen Mask', 
      code: 'OXY-MASK', 
      form: 'Mask', 
      unit: 'units', 
      location: 'Cabinet E, Level 2, Column 3',
      sku: 'SKU-006',
      pku: 'PKU-006',
      packaging: 'pack of 5 unit',
      batchNumber: 'B2024006',
      expiry: '2026-01-10',
      balance: 45,
      category: 'non-drug'
    },
  ];

  const filteredItems = inventoryItems.filter(item => {
    // Filter by search term
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by category
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    // Don't show items that are already in the issuance list
    const alreadyChosen = items.some(issuedItem => issuedItem.itemName === item.name);
    
    return matchesSearch && matchesCategory && !alreadyChosen;
  });

  const handleAddItem = () => {
    if (selectedItem && quantity > 0 && quantity <= selectedItem.balance) {
      const newItem: IssuanceItem = {
        id: `${selectedItem.id}-${Date.now()}`,
        itemName: selectedItem.name,
        drugCode: selectedItem.code,
        dosageForm: selectedItem.form,
        quantity,
        unit: selectedItem.unit,
        batchNumber: selectedItem.batchNumber,
        expiryDate: selectedItem.expiry,
        location: selectedItem.location,
        sku: selectedItem.sku,
        pku: selectedItem.pku,
        packaging: selectedItem.packaging,
        balance: selectedItem.balance,
        category: selectedItem.category,
      };
      setItems([...items, newItem]);
      setSelectedItem(null);
      setQuantity(1);
      setSearchTerm(''); // Clear search to show all available items
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleEditItem = (item: IssuanceItem) => {
    setEditingItem(item);
    setEditQuantity(item.quantity);
  };

  const handleSaveEdit = () => {
    if (editingItem && editQuantity > 0 && editQuantity <= editingItem.balance) {
      setItems(items.map(item => 
        item.id === editingItem.id 
          ? { ...item, quantity: editQuantity }
          : item
      ));
      setEditingItem(null);
      setEditQuantity(1);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditQuantity(1);
  };

  const handleSubmitForReview = () => {
    if (items.length === 0 || !recipient || !department) return;
    setCurrentStep('review');
  };

  const handleReviewApprove = () => {
    setCurrentStep('approve');
  };

  const handleReviewReject = () => {
    setCurrentStep('create');
    setReviewComments('');
  };

  const handleApprovalApprove = () => {
    setCurrentStep('issue');
  };

  const handleApprovalReject = () => {
    setCurrentStep('create');
    setReviewComments('');
    setApprovalComments('');
  };

  const handleFinalIssue = () => {
    // Here you would typically save to database
    console.log('Manual Issuance Approved:', {
      items,
      recipient,
      department,
      notes,
      reviewComments,
      approvalComments,
      issuedAt: new Date().toISOString()
    });
    
    onClose();
    // Reset form
    setItems([]);
    setRecipient('');
    setDepartment('');
    setNotes('');
    setCurrentStep('create');
    setReviewComments('');
    setApprovalComments('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-6xl h-[95vh] bg-surface rounded-3xl shadow-2xl overflow-hidden border border-border-default">
        {/* Header */}
        <div className="flex items-center justify-between p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold">Manual Item Issuance</h2>
              <p className="text-slate-300 text-lg">
                {currentStep === 'create' && 'Create manual issuance request'}
                {currentStep === 'review' && 'Review issuance request'}
                {currentStep === 'approve' && 'Approve issuance request'}
                {currentStep === 'issue' && 'Issue items'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl hover:bg-surface/10 transition-[transform,opacity,box-shadow,border-color] duration-200 group"
          >
            <svg className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-8 py-4 bg-subtle/50 border-b border-border-default">
          <div className="flex items-center justify-center space-x-8">
            {[
              { key: 'create', label: 'Create', icon: 'ðŸ“' },
              { key: 'review', label: 'Review', icon: 'ðŸ‘€' },
              { key: 'approve', label: 'Approve', icon: 'âœ…' },
              { key: 'issue', label: 'Issue', icon: 'ðŸ“¦' }
            ].map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold ${
                  currentStep === step.key 
                    ? 'bg-slate-900 text-white' 
                    : ['create', 'review', 'approve', 'issue'].indexOf(currentStep) > index
                    ? 'bg-green-500 text-white'
                    : 'bg-subtle text-text-muted'
                }`}>
                  {step.icon}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep === step.key ? 'text-text-primary' : 'text-text-muted'
                }`}>
                  {step.label}
                </span>
                {index < 3 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    ['create', 'review', 'approve', 'issue'].indexOf(currentStep) > index
                      ? 'bg-green-500' 
                      : 'bg-subtle'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex h-[calc(95vh-200px)]">
          {currentStep === 'create' && (
            <>
              {/* Left Panel - Item Selection */}
              <div className="w-1/2 p-8 border-r border-border-default overflow-y-auto bg-subtle/50">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-text-primary">Add Items</h3>
            </div>
            
            {/* Category Filter */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-text-secondary mb-2">Item Category</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-[transform,opacity,box-shadow,border-color] duration-200 ${
                    categoryFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-surface text-text-secondary border border-border-default hover:bg-subtle/50'
                  }`}
                >
                  All Items
                </button>
                <button
                  onClick={() => setCategoryFilter('drug')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-[transform,opacity,box-shadow,border-color] duration-200 ${
                    categoryFilter === 'drug'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-surface text-text-secondary border border-border-default hover:bg-subtle/50'
                  }`}
                >
                  Drugs
                </button>
                <button
                  onClick={() => setCategoryFilter('non-drug')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-[transform,opacity,box-shadow,border-color] duration-200 ${
                    categoryFilter === 'non-drug'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-surface text-text-secondary border border-border-default hover:bg-subtle/50'
                  }`}
                >
                  Non-Drugs
                </button>
              </div>
            </div>
            
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search items by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border-default rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-[transform,opacity,box-shadow,border-color] duration-200 bg-surface shadow-sm"
                />
              </div>
            </div>

            {/* Quantity and Add Button - Moved to top for convenience */}
            {selectedItem && (
              <div className="space-y-4 p-4 bg-surface rounded-2xl border border-border-default shadow-sm mb-6">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedItem.balance}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border border-border-default rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-[transform,opacity,box-shadow,border-color] duration-200 font-medium"
                  />
                  <div className="mt-1 text-xs text-text-muted">
                    Available: <span className="font-medium">{selectedItem.balance.toLocaleString()} {selectedItem.unit}</span>
                  </div>
                </div>
                <button
                  onClick={handleAddItem}
                  disabled={quantity > selectedItem.balance}
                  className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-[transform,opacity,box-shadow,border-color] duration-200 font-semibold text-sm shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add to Issuance
                </button>
              </div>
            )}

            {/* Item List */}
            <div className="space-y-3">
              {filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full p-4 text-left rounded-2xl border transition-[transform,opacity,box-shadow,border-color] duration-200 group ${
                    selectedItem?.id === item.id
                      ? 'border-slate-900 bg-slate-900 text-white shadow-lg scale-[1.02]'
                      : 'border-border-default hover:border-border-default hover:bg-surface hover:shadow-md hover:scale-[1.01] bg-surface'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className={`font-semibold text-lg mb-2 ${
                        selectedItem?.id === item.id ? 'text-white' : 'text-text-primary'
                      }`}>
                        {item.name}
                      </div>
                      <div className={`text-sm mb-2 ${
                        selectedItem?.id === item.id ? 'text-slate-200' : 'text-text-muted'
                      }`}>
                        {item.code} â€¢ {item.form}
                      </div>
                      
                      {/* Packaging Information */}
                      <div className={`text-xs mb-2 ${
                        selectedItem?.id === item.id ? 'text-slate-300' : 'text-text-secondary'
                      }`}>
                        <span className="font-medium">Packaging:</span> {item.packaging}
                      </div>
                      
                      {/* Batch and Expiry */}
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className={`text-xs ${
                          selectedItem?.id === item.id ? 'text-slate-300' : 'text-text-muted'
                        }`}>
                          <span className="font-medium">Batch:</span> {item.batchNumber}
                        </div>
                        <div className={`text-xs ${
                          selectedItem?.id === item.id ? 'text-slate-300' : 'text-text-muted'
                        }`}>
                          <span className="font-medium">Expiry:</span> {new Date(item.expiry).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      
                      {/* Balance */}
                      <div className={`text-xs mb-2 ${
                        selectedItem?.id === item.id ? 'text-slate-300' : 'text-text-secondary'
                      }`}>
                        <span className="font-medium">Balance:</span> 
                        <span className={`ml-1 font-bold ${
                          item.balance < 100 ? 'text-red-600' : 
                          item.balance < 500 ? 'text-orange-600' : 
                          'text-green-600'
                        }`}>
                          {item.balance.toLocaleString()} {item.unit}
                        </span>
                      </div>
                      
                      {/* Location */}
                      <div className={`text-xs flex items-center gap-1 ${
                        selectedItem?.id === item.id ? 'text-slate-300' : 'text-slate-400'
                      }`}>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {item.location}
                      </div>
                    </div>
                    {selectedItem?.id === item.id && (
                      <div className="p-2 rounded-full bg-white/20">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel - Issuance Details */}
          <div className="w-1/2 p-8 overflow-y-auto bg-surface">
            <h3 className="text-xl font-bold text-text-primary mb-6">Issuance Details</h3>
            
            {/* Recipient and Department */}
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Recipient Name</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter recipient name"
                  className="w-full px-4 py-3 border border-border-default rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-[transform,opacity,box-shadow,border-color] duration-200 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 border border-border-default rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-[transform,opacity,box-shadow,border-color] duration-200 font-medium"
                >
                  <option value="">Select department</option>
                  <option value="ICU">ICU</option>
                  <option value="ETU">ETU</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="OT">Operating Theater</option>
                  <option value="CARDIOLOGY">Cardiology</option>
                  <option value="WARD A">Ward A</option>
                  <option value="WARD B">Ward B</option>
                </select>
              </div>
            </div>

            {/* Items List */}
            <div className="mb-8">
              <h4 className="text-lg font-bold text-text-primary mb-4">Items to Issue ({items.length})</h4>
              {items.length === 0 ? (
                <div className="text-center text-text-muted py-12 bg-subtle/50 rounded-2xl border-2 border-dashed border-border-default">
                  <div className="p-4 rounded-full bg-subtle w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">No items selected</p>
                  <p className="text-sm text-slate-400 mt-1">Select items from the left panel to add them here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={item.id} className="p-4 bg-subtle/50 rounded-2xl border border-border-default hover:shadow-md transition-[transform,opacity,box-shadow,border-color] duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-text-primary text-lg">{item.itemName}</div>
                          <div className="text-sm text-text-secondary mb-2">{item.drugCode} â€¢ {item.dosageForm}</div>
                          
                          {/* Packaging Information */}
                          <div className="text-xs text-text-secondary mb-2">
                            <span className="font-medium">Packaging:</span> {item.packaging}
                          </div>
                          
                          {/* Batch and Expiry */}
                          <div className="grid grid-cols-2 gap-3 mb-2">
                            <div className="text-xs text-text-muted">
                              <span className="font-medium">Batch:</span> {item.batchNumber}
                            </div>
                            <div className="text-xs text-text-muted">
                              <span className="font-medium">Expiry:</span> {new Date(item.expiryDate).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          
                          {/* Balance Information - Reorganized Layout */}
                          <div className="space-y-1 mb-2">
                            <div className="text-xs text-text-secondary">
                              <span className="font-medium">Available Balance:</span> 
                              <span className="ml-1 font-bold text-blue-600">
                                {item.balance.toLocaleString()} {item.unit}
                              </span>
                            </div>
                            <div className="text-xs text-text-secondary">
                              <span className="font-medium">Issue Quantity:</span> 
                              <span className="ml-1 font-bold text-purple-600">
                                {item.quantity.toLocaleString()} {item.unit}
                              </span>
                            </div>
                            <div className="text-xs text-text-secondary">
                              <span className="font-medium">After Issue Quantity:</span> 
                              <span className={`ml-1 font-bold ${
                                (item.balance - item.quantity) < 100 ? 'text-red-600' : 
                                (item.balance - item.quantity) < 500 ? 'text-orange-600' : 
                                'text-green-600'
                              }`}>
                                {(item.balance - item.quantity).toLocaleString()} {item.unit}
                              </span>
                            </div>
                          </div>
                          
                          {/* Location */}
                          <div className="text-xs text-text-muted flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {item.location}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-500/10 rounded-xl transition-[transform,opacity,box-shadow,border-color] duration-200 group"
                            title="Edit item quantity"
                          >
                            <svg className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-[transform,opacity,box-shadow,border-color] duration-200 group"
                            title="Remove item"
                          >
                            <svg className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-text-secondary mb-2">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                rows={3}
                className="w-full px-4 py-3 border border-border-default rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 resize-none transition-[transform,opacity,box-shadow,border-color] duration-200 font-medium"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 text-text-secondary hover:bg-subtle rounded-xl transition-[transform,opacity,box-shadow,border-color] duration-200 font-semibold text-sm border border-border-default hover:border-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitForReview}
                disabled={items.length === 0 || !recipient || !department}
                className="px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-[transform,opacity,box-shadow,border-color] duration-200 font-semibold text-sm shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submit for Review
              </button>
            </div>
          </div>
            </>
          )}
          
          {/* Review Step */}
          {currentStep === 'review' && (
            <div className="w-full p-8 overflow-y-auto bg-surface">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-text-primary mb-6">Review Issuance Request</h3>
                <div className="space-y-6">
                  <div className="bg-subtle/50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-text-primary mb-4">Request Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-text-secondary">Recipient:</span>
                        <p className="text-text-primary">{recipient}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-text-secondary">Department:</span>
                        <p className="text-text-primary">{department}</p>
                      </div>
                    </div>
                    {notes && (
                      <div className="mt-4">
                        <span className="text-sm font-medium text-text-secondary">Notes:</span>
                        <p className="text-text-primary mt-1">{notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-subtle/50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-text-primary mb-4">Items to Issue ({items.length})</h4>
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="bg-surface rounded-lg p-4 border border-border-default">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-semibold text-text-primary">{item.itemName}</h5>
                              <p className="text-sm text-text-secondary">{item.drugCode} â€¢ {item.dosageForm}</p>
                              <p className="text-xs text-text-muted">Packaging: {item.packaging}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-text-primary">Qty: {item.quantity} {item.unit}</p>
                              <p className="text-xs text-text-muted">Batch: {item.batchNumber}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Review Comments</label>
                    <textarea
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                      placeholder="Add your review comments..."
                      rows={4}
                      className="w-full px-4 py-3 border border-border-default rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-[transform,opacity,box-shadow,border-color] duration-200 font-medium"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={handleReviewReject}
                      className="px-6 py-3 text-text-secondary hover:bg-subtle rounded-xl transition-[transform,opacity,box-shadow,border-color] duration-200 font-semibold text-sm border border-border-default hover:border-slate-400"
                    >
                      Reject
                    </button>
                    <button
                      onClick={handleReviewApprove}
                      className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-[transform,opacity,box-shadow,border-color] duration-200 font-semibold text-sm shadow-lg hover:shadow-xl"
                    >
                      Approve for Final Approval
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Approval Step */}
          {currentStep === 'approve' && (
            <div className="w-full p-8 overflow-y-auto bg-surface">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-text-primary mb-6">Approve Issuance Request</h3>
                <div className="space-y-6">
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-full bg-green-500 text-white">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-green-800">Ready for Final Approval</h4>
                    </div>
                    <p className="text-green-700">This request has been reviewed and is ready for final approval and issuance.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Approval Comments</label>
                    <textarea
                      value={approvalComments}
                      onChange={(e) => setApprovalComments(e.target.value)}
                      placeholder="Add your approval comments..."
                      rows={4}
                      className="w-full px-4 py-3 border border-border-default rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-[transform,opacity,box-shadow,border-color] duration-200 font-medium"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={handleApprovalReject}
                      className="px-6 py-3 text-text-secondary hover:bg-subtle rounded-xl transition-[transform,opacity,box-shadow,border-color] duration-200 font-semibold text-sm border border-border-default hover:border-slate-400"
                    >
                      Reject
                    </button>
                    <button
                      onClick={handleApprovalApprove}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-[transform,opacity,box-shadow,border-color] duration-200 font-semibold text-sm shadow-lg hover:shadow-xl"
                    >
                      Approve for Issuance
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Issue Step */}
          {currentStep === 'issue' && (
            <div className="w-full p-8 overflow-y-auto bg-surface">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-text-primary mb-6">Issue Items</h3>
                <div className="space-y-6">
                  <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-full bg-blue-500 text-white">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-blue-400">Ready to Issue</h4>
                    </div>
                    <p className="text-blue-700">All approvals completed. Items are ready for physical issuance.</p>
                  </div>
                  
                  <div className="bg-subtle/50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-text-primary mb-4">Final Issuance Summary</h4>
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="bg-surface rounded-lg p-4 border border-border-default">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-semibold text-text-primary">{item.itemName}</h5>
                              <p className="text-sm text-text-secondary">{item.drugCode} â€¢ {item.dosageForm}</p>
                              <p className="text-xs text-text-muted">Batch: {item.batchNumber} â€¢ Expiry: {new Date(item.expiryDate).toLocaleDateString('en-MY')}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-text-primary">Qty: {item.quantity} {item.unit}</p>
                              <p className="text-xs text-text-muted">{item.location}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => setCurrentStep('create')}
                      className="px-6 py-3 text-text-secondary hover:bg-subtle rounded-xl transition-[transform,opacity,box-shadow,border-color] duration-200 font-semibold text-sm border border-border-default hover:border-slate-400"
                    >
                      Back to Create
                    </button>
                    <button
                      onClick={handleFinalIssue}
                      className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-[transform,opacity,box-shadow,border-color] duration-200 font-semibold text-sm shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Complete Issuance
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Item Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-surface rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Edit Item Quantity</h3>
              
              <div className="mb-4">
                <div className="font-medium text-text-primary">{editingItem.itemName}</div>
                <div className="text-sm text-text-secondary">{editingItem.drugCode} â€¢ {editingItem.dosageForm}</div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Issue Quantity ({editingItem.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  max={editingItem.balance}
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="text-xs text-text-muted mt-1">
                  Available: {editingItem.balance.toLocaleString()} {editingItem.unit}
                </div>
                {editQuantity > editingItem.balance && (
                  <div className="text-xs text-red-600 mt-1">
                    Cannot issue more than available balance
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-2 text-text-secondary bg-subtle rounded-lg hover:bg-subtle transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={editQuantity <= 0 || editQuantity > editingItem.balance}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
