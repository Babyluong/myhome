import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Printer, 
  FileText, 
  Truck, 
  FileCheck, 
  Edit2, 
  Trash2, 
  X, 
  AlertTriangle, 
  History as HistoryIcon, 
  MoreVertical, 
  PackageCheck, 
  CheckCircle2, 
  Eye,
  Search,
  Filter,
  Copy,
  Check,
  Calendar,
  Building2,
  Layers,
  RotateCcw,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import type { OxygenReturnDocumentWithRelations, OxygenRequestDocumentWithRelations, OxygenReceiveDocumentWithRelations } from '@/types/pharmacy';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabase';
import {
  updateReturnDocument,
  deleteReturnDocument,
  updateRequestDocument,
  deleteRequestDocument,
  updateReturnDocumentCylinders,
  getEmptyCylindersInStore,
  updateCylinderValveType,
  deleteReceiveDocument,
  updateReceiveDocument,
  updateReceiveDocumentCylinders,
  getReceiveDocumentById,
  searchCylindersInDatabase,
  getSupplierCylinderReconciliationData,
} from '@/modules/mycylinder/services/oxygenService';
import { SupplierCylinderTrackingSection } from './SupplierCylinderTrackingSection';

interface SupplierReturnsSectionProps {
  documents: OxygenReturnDocumentWithRelations[];
  requestDocuments?: OxygenRequestDocumentWithRelations[];
  receiveDocuments?: OxygenReceiveDocumentWithRelations[];
  hospitalId?: string;
  onCreateClick: () => void;
  onCreateRequestClick?: () => void;
  onCreateReceiveClick?: () => void;
  onScanClick: () => void;
  onOpenEmptyListModal?: () => void;
  onPrintClick: (docId: string) => void;
  onPrintRequestClick?: (docId: string) => void;
  onPrintReceiveClick?: (docId: string) => void;
  isViewOnly: boolean;
  subTab?: 'returns' | 'requests' | 'received' | 'tracking';
  onSubTabChange?: (tab: 'returns' | 'requests' | 'received' | 'tracking') => void;
  hideSubTabBar?: boolean;
  onSuccess?: () => void;
}

export const SupplierReturnsSection: React.FC<SupplierReturnsSectionProps> = ({
  documents,
  requestDocuments = [],
  receiveDocuments = [],
  hospitalId,
  onCreateClick,
  onCreateRequestClick = () => {},
  onCreateReceiveClick = () => {},
  onScanClick,
  onOpenEmptyListModal,
  onPrintClick,
  onPrintRequestClick = () => {},
  onPrintReceiveClick = () => {},
  isViewOnly,
  subTab: propSubTab,
  onSubTabChange,
  hideSubTabBar = false,
  onSuccess,
}) => {
  const [localSubTab, setLocalSubTab] = useState<'returns' | 'requests' | 'received' | 'tracking'>('returns');
  const subTab = propSubTab !== undefined ? propSubTab : localSubTab;
  const setSubTab = onSubTabChange !== undefined ? onSubTabChange : setLocalSubTab;
  const [trackingSummary, setTrackingSummary] = useState<any>(null);

  const { user } = useAuthStore();
  const { language } = useLanguage();
  const activeHospitalId = hospitalId || user?.hospital_id || '';

  // Pre-fetch tracking count to display on tab badge
  useEffect(() => {
    if (!activeHospitalId) return;
    getSupplierCylinderReconciliationData(activeHospitalId).then(res => {
      if (res.data) setTrackingSummary(res.data);
    });
  }, [activeHospitalId]);

  const [suppliers, setSuppliers] = useState<{ id: string; company_name: string }[]>([]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // KPI summary statistics for active subTab
  const kpiStats = useMemo(() => {
    if (subTab === 'returns') {
      const totalDocs = documents.length;
      const totalCylinders = documents.reduce((sum, d) => sum + (d.items?.length || 0), 0);
      const completedCount = documents.filter(d => d.status === 'completed').length;
      const uniqueSuppliers = Array.from(new Set(documents.map(d => d.supplier?.company_name).filter(Boolean)));
      const latestDate = documents[0]?.returned_date
        ? new Date(documents[0].returned_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        : '-';
      return { totalDocs, totalCylinders, completedCount, suppliersCount: uniqueSuppliers.length, latestDate };
    } else if (subTab === 'requests') {
      const totalDocs = requestDocuments.length;
      const totalCylinders = requestDocuments.reduce((sum, d) => sum + (d.items?.filter(i => {
        const c = (i.size_code || '').toUpperCase();
        return !c.includes('VIE') && !c.includes('LIQUID');
      }).reduce((s, i) => s + (Number(i.quantity) || 0), 0) || 0), 0);
      const totalVieM3 = requestDocuments.reduce((sum, d) => sum + (d.items?.filter(i => {
        const c = (i.size_code || '').toUpperCase();
        return c.includes('VIE') || c.includes('LIQUID');
      }).reduce((s, i) => s + (Number(i.quantity) || 0), 0) || 0), 0);
      const completedCount = requestDocuments.filter(d => d.status === 'completed').length;
      const uniqueSuppliers = Array.from(new Set(requestDocuments.map(d => d.supplier?.company_name).filter(Boolean)));
      const latestDate = requestDocuments[0]?.requested_date
        ? new Date(requestDocuments[0].requested_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        : '-';
      return { totalDocs, totalCylinders, totalVieM3, completedCount, suppliersCount: uniqueSuppliers.length, latestDate };
    } else {
      const totalDocs = receiveDocuments.length;
      const totalCylinders = receiveDocuments.reduce((sum, d) => sum + (d.items?.length || 0), 0);
      const completedCount = receiveDocuments.filter(d => d.status === 'completed').length;
      const uniqueSuppliers = Array.from(new Set(receiveDocuments.map(d => d.supplier?.company_name).filter(Boolean)));
      const latestDate = receiveDocuments[0]?.received_date
        ? new Date(receiveDocuments[0].received_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        : '-';
      return { totalDocs, totalCylinders, completedCount, suppliersCount: uniqueSuppliers.length, latestDate };
    }
  }, [subTab, documents, requestDocuments, receiveDocuments]);

  // Unique suppliers for active filter
  const availableFilterSuppliers = useMemo(() => {
    const list = subTab === 'returns' 
      ? documents 
      : subTab === 'requests' 
      ? requestDocuments 
      : receiveDocuments;
    const names = list.map(d => d.supplier?.company_name).filter(Boolean) as string[];
    return Array.from(new Set(names));
  }, [subTab, documents, requestDocuments, receiveDocuments]);

  // Filtered documents for Returns
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesDoc = (doc.document_number || '').toLowerCase().includes(q);
        const matchesSup = (doc.supplier?.company_name || '').toLowerCase().includes(q);
        if (!matchesDoc && !matchesSup) return false;
      }
      if (supplierFilter !== 'all') {
        const supName = doc.supplier?.company_name || '';
        if (supName !== supplierFilter) return false;
      }
      if (statusFilter !== 'all') {
        if (doc.status !== statusFilter) return false;
      }
      return true;
    });
  }, [documents, searchTerm, supplierFilter, statusFilter]);

  // Filtered documents for Requests
  const filteredRequestDocuments = useMemo(() => {
    return requestDocuments.filter(doc => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesDoc = (doc.document_number || '').toLowerCase().includes(q);
        const matchesSup = (doc.supplier?.company_name || '').toLowerCase().includes(q);
        if (!matchesDoc && !matchesSup) return false;
      }
      if (supplierFilter !== 'all') {
        const supName = doc.supplier?.company_name || '';
        if (supName !== supplierFilter) return false;
      }
      if (statusFilter !== 'all') {
        if (doc.status !== statusFilter) return false;
      }
      return true;
    });
  }, [requestDocuments, searchTerm, supplierFilter, statusFilter]);

  // Filtered documents for Received
  const filteredReceiveDocuments = useMemo(() => {
    return receiveDocuments.filter(doc => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesDoc = (doc.document_number || '').toLowerCase().includes(q);
        const matchesDO = (doc.delivery_order_no || '').toLowerCase().includes(q);
        const matchesSup = (doc.supplier?.company_name || '').toLowerCase().includes(q);
        if (!matchesDoc && !matchesDO && !matchesSup) return false;
      }
      if (supplierFilter !== 'all') {
        const supName = doc.supplier?.company_name || '';
        if (supName !== supplierFilter) return false;
      }
      if (statusFilter !== 'all') {
        if (doc.status !== statusFilter) return false;
      }
      return true;
    });
  }, [receiveDocuments, searchTerm, supplierFilter, statusFilter]);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [docType, setDocType] = useState<'returns' | 'requests' | 'received'>('returns');
  const [isViewCylindersOpen, setIsViewCylindersOpen] = useState(false);
  const [viewCylindersDoc, setViewCylindersDoc] = useState<any>(null);

  // Edit form state
  const [editDate, setEditDate] = useState('');
  const [editSupplierId, setEditSupplierId] = useState('');
  const [editStatus, setEditStatus] = useState<'draft' | 'completed' | 'cancelled'>('completed');
  const [editRemarks, setEditRemarks] = useState('');
  const [editDeliveryOrderNo, setEditDeliveryOrderNo] = useState('');
  const [editReason, setEditReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [emptyCylinders, setEmptyCylinders] = useState<any[]>([]);
  const [supplierCylinders, setSupplierCylinders] = useState<any[]>([]);
  const [selectedCylIdList, setSelectedCylIdList] = useState<string[]>([]);
  const [supplierSizeFilter, setSupplierSizeFilter] = useState<'all' | '101-N' | '101-F'>('101-N');
  const [privateSizeFilter, setPrivateSizeFilter] = useState<string>('');

  // Edit received cylinders state
  const [editReceivedCylinders, setEditReceivedCylinders] = useState<Array<{
    itemId?: string;
    cylinderId: string;
    serialNumber: string;
    originalSerial: string;
    typeName: string;
    sizeCode?: string;
    valveType?: 'BN' | 'PI';
    isRemoved?: boolean;
    isNew?: boolean;
    combo?: any;
    cylinder?: any;
  }>>([]);
  const [receivedCylSearchTerm, setReceivedCylSearchTerm] = useState('');
  const [isLoadingReceivedCyls, setIsLoadingReceivedCyls] = useState(false);
  const [isAddingReceivedCyl, setIsAddingReceivedCyl] = useState(false);
  const [newReceivedCylSerial, setNewReceivedCylSerial] = useState('');
  const [newReceivedCylComboId, setNewReceivedCylComboId] = useState('');
  const [availableCombos, setAvailableCombos] = useState<any[]>([]);
  const [dbSearchResults, setDbSearchResults] = useState<any[]>([]);
  const [isSearchingDb, setIsSearchingDb] = useState(false);
  const [hasSearchedDb, setHasSearchedDb] = useState(false);
  const [selectedDbCylinder, setSelectedDbCylinder] = useState<any | null>(null);

  // Delete form state
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // History state
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Dropdown state
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Live store empty count state
  const [storeEmptyCount, setStoreEmptyCount] = useState<number>(0);

  const fetchStoreEmptyCount = async () => {
    try {
      if (!activeHospitalId) return;
      const res = await getEmptyCylindersInStore(activeHospitalId);
      if (res.data) {
        setStoreEmptyCount(res.data.length);
      }
    } catch (err) {
      console.error("Error fetching empty cylinders in store count:", err);
    }
  };

  useEffect(() => {
    if (activeHospitalId) {
      void fetchStoreEmptyCount();
    }
  }, [activeHospitalId, documents]);

  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdownId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const toggleDropdown = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    setActiveDropdownId(prev => prev === docId ? null : docId);
  };

  // Load active suppliers list
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const { data } = await supabase
          .from('suppliers')
          .select('id, company_name')
          .eq('status', 'active');
        if (data) {
          const filteredSuppliers = data.filter(s => {
            const name = (s.company_name || '').toLowerCase();
            return name.includes('linde') || name.includes('borneo indah');
          });
          setSuppliers(filteredSuppliers);
        }
      } catch (err) {
        console.error('Error fetching suppliers:', err);
      }
    };
    void fetchSuppliers();
  }, []);

  const fetchAvailableCylinders = async (hospitalId: string, currentCyls: any[] = []) => {
    try {
      // 1. Fetch empty cylinders in store
      const emptyRes = await getEmptyCylindersInStore(hospitalId);
      if (emptyRes.data) {
        // Filter out loan cylinders (standard only)
        const standardEmpty = emptyRes.data.filter((c: any) => {
          if (c.supplier_tagged) return false;
          const serial = (c.serial_number || '').toUpperCase();
          const typeName = (c.type_info?.type_name || '').toLowerCase();
          const isLoan = c.is_loan || 
                         typeName.includes('loan') || 
                         serial.startsWith('101-N') || 
                         serial.startsWith('101-F') ||
                         serial.startsWith('101N') ||
                         serial.startsWith('101F') ||
                         serial.startsWith('LOAN');
          return !isLoan;
        });

        // Add any standard cylinders currently selected in this document
        const currentStandardCyls = currentCyls.filter((c: any) => {
          if (c.supplier_tagged) return false;
          const serial = (c.serial_number || '').toUpperCase();
          const typeName = (c.type_info?.type_name || '').toLowerCase();
          const isLoan = c.is_loan || 
                         typeName.includes('loan') || 
                         serial.startsWith('101-N') || 
                         serial.startsWith('101-F') ||
                         serial.startsWith('101N') ||
                         serial.startsWith('101F') ||
                         serial.startsWith('LOAN');
          return !isLoan;
        });

        const combinedStandard = [...standardEmpty];
        currentStandardCyls.forEach((c: any) => {
          if (!combinedStandard.some(sc => sc.id === c.id)) {
            combinedStandard.push(c);
          }
        });

        setEmptyCylinders(combinedStandard);
        if (combinedStandard.length > 0) {
          const uniqueSizes = Array.from(new Set(combinedStandard.map((sc: any) => sc.type_info?.type_name || 'Standard')));
          if (uniqueSizes.length > 0) {
            setPrivateSizeFilter(uniqueSizes[0]);
          }
        }
      }

      // 2. Fetch supplier cylinders (loan tags)
      const { isSupabaseConfigured } = await import('@/services/supabase');
      let supCyls: any[] = [];
      if (isSupabaseConfigured()) {
        const { data } = await supabase
          .from('pharmacy_oxygen_cylinder_inventory')
          .select(`
            *,
            size_info:pharmacy_oxygen_cylinder_sizes(*),
            type_info:pharmacy_oxygen_cylinder_types(*)
          `)
          .eq('hospital_id', hospitalId)
          .eq('supplier_tagged', true)
          .neq('status', 'returned_to_supplier')
          .neq('status', 'deactivated')
          .eq('is_active', true)
          .order('serial_number', { ascending: true });
        supCyls = (data || []).filter(c => c.status !== 'deactivated' && c.is_active !== false);
      } else {
        const { mockOxygenCylinders } = await import('@/services/pharmacy/mockData');
        supCyls = mockOxygenCylinders.filter(
          c => c.supplier_tagged === true && (c.status as string) !== 'returned_to_supplier' && (c.status as string) !== 'deactivated'
        );
      }

      // Add any supplier cylinders currently selected in this document
      const currentSupplierCyls = currentCyls.filter((c: any) => c.supplier_tagged && c.status !== 'deactivated' && c.is_active !== false);
      const combinedSupplier = [...supCyls];
      currentSupplierCyls.forEach((c: any) => {
        if (!combinedSupplier.some(sc => sc.id === c.id)) {
          combinedSupplier.push(c);
        }
      });

      setSupplierCylinders(combinedSupplier);
    } catch (err) {
      console.error('Error fetching cylinders for editing:', err);
    }
  };

  const handleToggleValveType = async (e: React.MouseEvent, cyl: any) => {
    e.stopPropagation();
    e.preventDefault();
    const typeName = cyl.type_info?.type_name || '';
    const isCurrentlyPI = typeName.includes('PI') || typeName.includes('Pin');
    const targetType: 'BN' | 'PI' = isCurrentlyPI ? 'BN' : 'PI';
    const targetTypeId = targetType === 'PI' ? '1874961b-a46d-4cf6-8a47-90b18a1e0fb7' : '3edfc0fe-98fb-4592-9ce1-4229718871a2';
    
    const hospId = cyl.hospital_id || selectedDoc?.hospital_id || '85bb6adc-b868-428b-83f4-e5af2f5cf904';
    const res = await updateCylinderValveType(hospId, cyl.id, targetType);
    if (!res.error) {
      let updatedTypeName = typeName;
      if (isCurrentlyPI) {
        updatedTypeName = typeName.replace(/\bPI\b/g, 'BN').replace(/Pin Index/gi, 'Bullnose');
      } else {
        updatedTypeName = typeName.replace(/\bBN\b/g, 'PI').replace(/Bullnose/gi, 'Pin Index');
      }
      if (!updatedTypeName.includes('BN') && !updatedTypeName.includes('PI')) {
        updatedTypeName = `${typeName} ${targetType}`;
      }

      setEmptyCylinders(prev => prev.map(c => c.id === cyl.id ? {
        ...c,
        cylinder_type_id: targetTypeId,
        type_info: {
          ...c.type_info,
          type_name: updatedTypeName
        }
      } : c));
    }
  };

  const fetchCombos = async () => {
    try {
      const { data } = await supabase
        .from('pharmacy_oxygen_size_type_combos')
        .select('id, size_id, type_id, display_name')
        .order('display_order', { ascending: true });
      if (data) setAvailableCombos(data);
    } catch (err) {
      console.error('Error fetching combos:', err);
    }
  };

  const fetchFreshReceivedDoc = async (docId: string) => {
    setIsLoadingReceivedCyls(true);
    try {
      const res = await getReceiveDocumentById(docId);
      if (res.data?.items) {
        const freshCyls = res.data.items.map((it: any) => {
          const cyl = it.cylinder;
          const typeName = cyl?.combo?.display_name || cyl?.type_info?.type_name || 'Standard Cylinder';
          const isPI = typeName.includes('PI') || typeName.includes('Pin');
          const isBN = typeName.includes('BN') || typeName.includes('Bull');
          const valveType = isPI ? 'PI' : isBN ? 'BN' : undefined;
          return {
            itemId: it.id,
            cylinderId: it.cylinder_id || cyl?.id,
            serialNumber: cyl?.serial_number || '',
            originalSerial: cyl?.serial_number || '',
            typeName,
            sizeCode: cyl?.size_info?.code || '',
            valveType: valveType as 'BN' | 'PI' | undefined,
            isRemoved: false,
            cylinder: cyl,
          };
        });
        setEditReceivedCylinders(freshCyls);
      }
    } catch (err) {
      console.error('Error fetching fresh receive document for edit:', err);
    } finally {
      setIsLoadingReceivedCyls(false);
    }
  };

  const handleReceivedCylSerialChange = (cylinderId: string, val: string) => {
    setEditReceivedCylinders(prev => prev.map(c => 
      c.cylinderId === cylinderId ? { ...c, serialNumber: val.toUpperCase() } : c
    ));
  };

  const handleRevertReceivedCylSerial = (cylinderId: string) => {
    setEditReceivedCylinders(prev => prev.map(c => 
      c.cylinderId === cylinderId ? { ...c, serialNumber: c.originalSerial } : c
    ));
  };

  const handleToggleRemoveReceivedCyl = (cylinderId: string) => {
    setEditReceivedCylinders(prev => prev.map(c => 
      c.cylinderId === cylinderId ? { ...c, isRemoved: !c.isRemoved } : c
    ));
  };

  const handleToggleReceivedCylValve = (cylinderId: string) => {
    setEditReceivedCylinders(prev => prev.map(c => {
      if (c.cylinderId !== cylinderId) return c;
      const currentValve = c.valveType || (c.typeName.includes('PI') ? 'PI' : 'BN');
      const targetValve: 'BN' | 'PI' = currentValve === 'PI' ? 'BN' : 'PI';
      let updatedTypeName = c.typeName;
      if (currentValve === 'PI') {
        updatedTypeName = c.typeName.replace(/\bPI\b/g, 'BN').replace(/Pin Index/gi, 'Bullnose');
      } else {
        updatedTypeName = c.typeName.replace(/\bBN\b/g, 'PI').replace(/Bullnose/gi, 'Pin Index');
      }
      if (!updatedTypeName.includes('BN') && !updatedTypeName.includes('PI')) {
        updatedTypeName = `${c.typeName} ${targetValve}`;
      }
      return {
        ...c,
        valveType: targetValve,
        typeName: updatedTypeName,
      };
    }));
  };

  useEffect(() => {
    if (!isAddingReceivedCyl || !newReceivedCylSerial.trim() || !activeHospitalId) {
      setDbSearchResults([]);
      setHasSearchedDb(false);
      setIsSearchingDb(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingDb(true);
      setHasSearchedDb(true);
      try {
        const res = await searchCylindersInDatabase(activeHospitalId, newReceivedCylSerial.trim());
        setDbSearchResults(res.data || []);
      } catch (err) {
        console.error('Error searching cylinders in database:', err);
      } finally {
        setIsSearchingDb(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [newReceivedCylSerial, isAddingReceivedCyl, activeHospitalId]);

  const handleSelectSearchedCylinder = (cyl: any) => {
    setSelectedDbCylinder(cyl);
    setNewReceivedCylSerial(cyl.serial_number);
    const matchingCombo = availableCombos.find(c => 
      c.size_id === cyl.cylinder_size_id && c.type_id === cyl.cylinder_type_id
    );
    if (matchingCombo) {
      setNewReceivedCylComboId(matchingCombo.id);
    }
    setDbSearchResults([]);
    setHasSearchedDb(false);
  };

  const handleAddNewReceivedCylinder = (explicitCyl?: any) => {
    const targetDbCyl = explicitCyl || selectedDbCylinder;
    const cleanSerial = (targetDbCyl?.serial_number || newReceivedCylSerial).trim().toUpperCase();
    if (!cleanSerial) {
      alert('Please enter the cylinder serial number.');
      return;
    }
    if (editReceivedCylinders.some(c => !c.isRemoved && c.serialNumber.trim().toUpperCase() === cleanSerial)) {
      alert(`Silinder dengan nombor siri "${cleanSerial}" sudah ada dalam senarai penerimaan ini.`);
      return;
    }
    
    let typeName = targetDbCyl?.combo?.display_name || targetDbCyl?.type_info?.type_name;
    const selectedCombo = availableCombos.find(c => c.id === newReceivedCylComboId);
    if (!typeName) {
      typeName = selectedCombo?.display_name || 'Standard Cylinder';
    }
    const isPI = typeName.includes('PI') || typeName.includes('Pin');
    const isBN = typeName.includes('BN') || typeName.includes('Bull');
    const valveType = isPI ? 'PI' : isBN ? 'BN' : undefined;

    const cylId = targetDbCyl ? targetDbCyl.id : `new-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const isNew = true;

    setEditReceivedCylinders(prev => [
      ...prev,
      {
        itemId: undefined,
        cylinderId: cylId,
        serialNumber: cleanSerial,
        originalSerial: '',
        typeName,
        sizeCode: targetDbCyl?.size_info?.code || '',
        valveType: valveType as 'BN' | 'PI' | undefined,
        isRemoved: false,
        isNew,
        combo: selectedCombo,
        cylinder: targetDbCyl,
      } as any
    ]);
    setNewReceivedCylSerial('');
    setSelectedDbCylinder(null);
    setDbSearchResults([]);
    setHasSearchedDb(false);
    setIsAddingReceivedCyl(false);
  };

  const openEditModal = (doc: any, type: 'returns' | 'requests' | 'received') => {
    setSelectedDoc(doc);
    setDocType(type);
    setEditDate(
      type === 'returns'
        ? new Date(doc.returned_date).toISOString().split('T')[0]
        : type === 'requests'
        ? new Date(doc.requested_date).toISOString().split('T')[0]
        : new Date(doc.received_date || doc.created_at).toISOString().split('T')[0]
    );
    setEditSupplierId(doc.supplier_id || '');
    setEditStatus(doc.status || 'completed');
    setEditRemarks(doc.remarks || '');
    setEditDeliveryOrderNo(doc.delivery_order_no || '');
    setEditReason('');

    if (type === 'returns') {
      const items = doc.items || [];
      const currentCyls = items.map((x: any) => x.cylinder).filter(Boolean);
      const cylIds = items.map((x: any) => x.cylinder_id || x.cylinder?.id).filter(Boolean);
      setSelectedCylIdList(cylIds);
      fetchAvailableCylinders(doc.hospital_id, currentCyls);
    } else if (type === 'received') {
      setSelectedCylIdList([]);
      setEmptyCylinders([]);
      setSupplierCylinders([]);

      const rawItems = doc.items || [];
      const initialCyls = rawItems.map((it: any) => {
        const cyl = it.cylinder;
        const typeName = cyl?.combo?.display_name || cyl?.type_info?.type_name || 'Standard Cylinder';
        const isPI = typeName.includes('PI') || typeName.includes('Pin');
        const isBN = typeName.includes('BN') || typeName.includes('Bull');
        const valveType = isPI ? 'PI' : isBN ? 'BN' : undefined;
        return {
          itemId: it.id,
          cylinderId: it.cylinder_id || cyl?.id,
          serialNumber: cyl?.serial_number || '',
          originalSerial: cyl?.serial_number || '',
          typeName,
          sizeCode: cyl?.size_info?.code || '',
          valveType: valveType as 'BN' | 'PI' | undefined,
          isRemoved: false,
          cylinder: cyl,
        };
      });
      setEditReceivedCylinders(initialCyls);
      setReceivedCylSearchTerm('');
      setIsAddingReceivedCyl(false);
      setNewReceivedCylSerial('');
      setNewReceivedCylComboId('');
      setSelectedDbCylinder(null);
      setDbSearchResults([]);
      setHasSearchedDb(false);
      void fetchCombos();
      void fetchFreshReceivedDoc(doc.id);
    } else {
      setSelectedCylIdList([]);
      setEmptyCylinders([]);
      setSupplierCylinders([]);
      setEditReceivedCylinders([]);
    }

    setIsEditOpen(true);
  };

  const openDeleteModal = (doc: any, type: 'returns' | 'requests' | 'received') => {
    setSelectedDoc(doc);
    setDocType(type);
    setDeleteReason('');
    setIsDeleteOpen(true);
  };

  const openHistoryModal = async (doc: any, type: 'returns' | 'requests' | 'received') => {
    setSelectedDoc(doc);
    setDocType(type);
    setIsHistoryOpen(true);
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          user:users(id, full_name, jawatan)
        `)
        .eq('entity_id', doc.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching document history:', error);
      } else {
        let logs = data || [];
        if (logs.length === 0) {
          // Fallback mock history logs for demo/testing
          logs = [
            {
              id: 'mock-hist-1',
              action: 'CREATE_DOCUMENT',
              created_at: doc.created_at || new Date().toISOString(),
              user: doc.creator || { full_name: 'Pharmacy Officer', jawatan: 'Pharmacist' },
              new_values: { remarks: doc.remarks }
            }
          ];
        }
        setHistoryLogs(logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const renderLogChanges = (log: any) => {
    const changes: string[] = [];
    if (log.old_values && log.new_values) {
      const oldVal = log.old_values;
      const newVal = log.new_values;

      if (newVal.returned_date && oldVal.returned_date && newVal.returned_date !== oldVal.returned_date) {
        changes.push(`Date updated from ${new Date(oldVal.returned_date).toLocaleDateString()} to ${new Date(newVal.returned_date).toLocaleDateString()}`);
      }
      if (newVal.received_date && oldVal.received_date && newVal.received_date !== oldVal.received_date) {
        changes.push(`Received date updated from ${new Date(oldVal.received_date).toLocaleDateString()} to ${new Date(newVal.received_date).toLocaleDateString()}`);
      }
      if (newVal.requested_date && oldVal.requested_date && newVal.requested_date !== oldVal.requested_date) {
        changes.push(`Requested date updated from ${new Date(oldVal.requested_date).toLocaleDateString()} to ${new Date(newVal.requested_date).toLocaleDateString()}`);
      }
      if (newVal.delivery_order_no !== undefined && oldVal.delivery_order_no !== newVal.delivery_order_no) {
        changes.push(`DO Number updated from "${oldVal.delivery_order_no || '-'}" to "${newVal.delivery_order_no || '-'}"`);
      }
      if (newVal.supplier_id && oldVal.supplier_id && newVal.supplier_id !== oldVal.supplier_id) {
        changes.push(`Supplier updated`);
      }
      if (newVal.status && oldVal.status && newVal.status !== oldVal.status) {
        changes.push(`Status updated from "${oldVal.status}" to "${newVal.status}"`);
      }
      if (newVal.remarks !== undefined && oldVal.remarks !== newVal.remarks) {
        changes.push(`Remarks updated`);
      }
      if (newVal.cylinder_serial_changes && newVal.cylinder_serial_changes.length > 0) {
        newVal.cylinder_serial_changes.forEach((c: any) => {
          changes.push(`Nombor siri silinder dikemaskini: ${c.from} ➔ ${c.to}`);
        });
      }
      if (newVal.cylinders_removed && newVal.cylinders_removed.length > 0) {
        changes.push(`Silinder dikeluarkan dari dokumen: ${newVal.cylinders_removed.join(', ')}`);
      }
      if (newVal.cylinders_added && newVal.cylinders_added.length > 0) {
        changes.push(`Silinder ditambah ke dokumen: ${newVal.cylinders_added.join(', ')}`);
      }
    }
    if (changes.length === 0) return null;
    return (
      <ul className="mt-1.5 pl-4 list-disc text-[11px] text-slate-500 space-y-0.5">
        {changes.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
    );
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    if (!editReason.trim()) {
      alert('Please enter a reason for this edit.');
      return;
    }

    if (docType === 'received') {
      const activeItems = editReceivedCylinders.filter(c => !c.isRemoved);
      for (const c of activeItems) {
        if (!c.serialNumber.trim()) {
          alert('Sila pastikan semua silinder mempunyai nombor siri yang sah (tidak boleh dibiarkan kosong).');
          return;
        }
      }
      const seen = new Set<string>();
      for (const c of activeItems) {
        const sn = c.serialNumber.trim().toUpperCase();
        if (seen.has(sn)) {
          alert(`Nombor siri berulang dikesan: "${sn}". Sila pastikan setiap silinder unik.`);
          return;
        }
        seen.add(sn);
      }
    }

    setIsSaving(true);
    try {
      const updates = {
        returned_date: docType === 'returns' ? new Date(editDate).toISOString() : undefined,
        requested_date: docType === 'requests' ? new Date(editDate).toISOString() : undefined,
        supplier_id: editSupplierId,
        status: editStatus,
        remarks: editRemarks,
      };

      let res;
      if (docType === 'returns') {
        res = await updateReturnDocument(
          selectedDoc.id,
          {
            returned_date: updates.returned_date!,
            supplier_id: updates.supplier_id,
            status: updates.status,
            remarks: updates.remarks,
          },
          editReason,
          user?.id || ''
        );
      } else if (docType === 'requests') {
        res = await updateRequestDocument(
          selectedDoc.id,
          {
            requested_date: updates.requested_date!,
            supplier_id: updates.supplier_id,
            status: updates.status,
            remarks: updates.remarks,
          },
          editReason,
          user?.id || ''
        );
      } else {
        res = await updateReceiveDocument(
          selectedDoc.id,
          {
            receivedDate: new Date(editDate).toISOString(),
            supplierId: editSupplierId,
            deliveryOrderNo: editDeliveryOrderNo,
            status: editStatus,
            remarks: editRemarks,
          },
          user?.id || '',
          editReason
        );
      }

      if (res?.error) {
        alert(res.error);
      } else {
        if (docType === 'returns') {
          const cylindersRes = await updateReturnDocumentCylinders(selectedDoc.id, selectedCylIdList);
          if (cylindersRes.error) {
            alert(`Document details updated, but failed to update cylinders: ${cylindersRes.error}`);
          }
        } else if (docType === 'received') {
          // Existing items in this document (they have an itemId)
          const existingItemsToUpdate = editReceivedCylinders
            .filter((c: any) => c.itemId)
            .map(c => ({
              itemId: c.itemId,
              cylinderId: c.cylinderId,
              serialNumber: c.serialNumber.trim().toUpperCase(),
              originalSerial: (c.originalSerial || '').trim().toUpperCase(),
              valveType: c.valveType,
              isRemoved: !!c.isRemoved,
            }));

          // Cylinders newly added to this document (no itemId, and not removed)
          const newCylindersToInsert = editReceivedCylinders
            .filter((c: any) => !c.itemId && !c.isRemoved)
            .map((c: any) => ({
              cylinderId: c.cylinder?.id || (c.cylinderId && !c.cylinderId.startsWith('new-') ? c.cylinderId : undefined),
              serialNumber: c.serialNumber.trim().toUpperCase(),
              sizeId: c.combo?.size_id || c.cylinder?.cylinder_size_id,
              typeId: c.combo?.type_id || c.cylinder?.cylinder_type_id,
              valveType: c.valveType,
            }));

          const cylindersRes = await updateReceiveDocumentCylinders(
            selectedDoc.id,
            activeHospitalId,
            existingItemsToUpdate,
            newCylindersToInsert,
            user?.id || '',
            editReason
          );
          if (cylindersRes.error) {
            alert(`Maklumat dokumen dikemaskini, tetapi gagal mengemaskini silinder: ${cylindersRes.error}`);
            return;
          }
        }
        setIsEditOpen(false);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    if (!deleteReason.trim()) {
      alert('Please enter a reason for this deletion.');
      return;
    }
    setIsDeleting(true);
    try {
      let res;
      if (docType === 'returns') {
        res = await deleteReturnDocument(selectedDoc.id, deleteReason, user?.id || '');
      } else if (docType === 'requests') {
        res = await deleteRequestDocument(selectedDoc.id, deleteReason, user?.id || '');
      } else {
        res = await deleteReceiveDocument(selectedDoc.id, deleteReason, user?.id || '');
      }

      if (res?.error) {
        alert(res.error);
      } else {
        setIsDeleteOpen(false);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Header & KPI Summary Card with Integrated Workflow Switcher */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs space-y-5">
        {/* Top Control Bar: Segmented Workflow Switcher (Left) + Contextual Actions (Right) */}
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${subTab === 'tracking' ? '' : 'pb-4 border-b border-slate-100'}`}>
          {/* Executive Segmented Workflow Selector */}
          {!hideSubTabBar && (
            <div className="inline-flex flex-wrap sm:flex-nowrap items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/70 gap-1 w-full sm:w-auto">
              <button
                onClick={() => setSubTab('returns')}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                  subTab === 'returns'
                    ? 'bg-white text-rose-700 shadow-xs ring-1 ring-slate-200/80 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Truck className={`w-3.5 h-3.5 ${subTab === 'returns' ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>{language === 'ms' ? 'Pemulangan' : 'Returns'}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  subTab === 'returns' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {documents.length}
                </span>
              </button>

              <button
                onClick={() => setSubTab('requests')}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                  subTab === 'requests'
                    ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/80 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <FileCheck className={`w-3.5 h-3.5 ${subTab === 'requests' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{language === 'ms' ? 'Pesanan / Inden' : 'Requests'}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  subTab === 'requests' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {requestDocuments.length}
                </span>
              </button>

              <button
                onClick={() => setSubTab('received')}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                  subTab === 'received'
                    ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-slate-200/80 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <PackageCheck className={`w-3.5 h-3.5 ${subTab === 'received' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{language === 'ms' ? 'Penerimaan' : 'Received'}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  subTab === 'received' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {receiveDocuments.length}
                </span>
              </button>

              <button
                onClick={() => setSubTab('tracking')}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                  subTab === 'tracking'
                    ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200/80 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${subTab === 'tracking' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{language === 'ms' ? 'Pengesanan Silinder' : 'Cylinder Tracking'}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  subTab === 'tracking' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {trackingSummary?.totalTracked ?? 0}
                </span>
              </button>
            </div>
          )}

          {/* Contextual Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {subTab === 'returns' && (
              <>
                {/* Secondary Quick Utility: Quick Barcode / Camera Scan */}
                <button
                  onClick={onScanClick}
                  disabled={isViewOnly}
                  title={isViewOnly ? 'View-only for Office Admin' : language === 'ms' ? 'Buka Pengimbas Silinder Pantas' : 'Open Quick Cylinder Scanner'}
                  className={`px-3 py-2 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs hover:border-slate-300 active:scale-95 transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                    isViewOnly ? 'opacity-60 grayscale cursor-not-allowed' : ''
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-blue-600" />
                  <span>{language === 'ms' ? 'Imbas Pantas' : 'Quick Scan'}</span>
                </button>

                {/* Primary Action Button: Unified Create Return Document */}
                <button
                  onClick={onCreateClick}
                  disabled={isViewOnly}
                  title={isViewOnly ? 'View-only for Office Admin' : undefined}
                  className={`px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs shadow-sm shadow-rose-500/25 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                    isViewOnly ? 'opacity-60 grayscale cursor-not-allowed' : ''
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'ms' ? 'Cipta Dokumen Pulang' : 'Create Return Document'}</span>
                </button>
              </>
            )}
            {subTab === 'requests' && (
              <button
                onClick={onCreateRequestClick}
                disabled={isViewOnly}
                title={isViewOnly ? 'View-only for Office Admin' : undefined}
                className={`px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm shadow-blue-500/25 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                  isViewOnly ? 'opacity-60 grayscale cursor-not-allowed' : ''
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'ms' ? 'Cipta Dokumen Permintaan' : 'Create Request Document'}</span>
              </button>
            )}
            {subTab === 'received' && (
              <button
                onClick={onCreateReceiveClick}
                disabled={isViewOnly}
                title={isViewOnly ? 'View-only for Office Admin' : undefined}
                className={`px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-sm shadow-emerald-500/25 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                  isViewOnly ? 'opacity-60 grayscale cursor-not-allowed' : ''
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'ms' ? 'Terima Dari Pembekal' : 'Receive From Supplier'}</span>
              </button>
            )}
          </div>
        </div>

        {subTab !== 'tracking' && (
          <>
            {/* Sub-workflow Information: Icon + Title + Operational Tag + Clinical Description */}
            <div className="flex items-center space-x-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
            subTab === 'returns' 
              ? 'bg-rose-50 border-rose-200/80 text-rose-600' 
              : subTab === 'requests'
              ? 'bg-blue-50 border-blue-200/80 text-blue-600'
              : 'bg-emerald-50 border-emerald-200/80 text-emerald-600'
          }`}>
            {subTab === 'returns' ? (
              <Truck className="w-5 h-5" />
            ) : subTab === 'requests' ? (
              <FileCheck className="w-5 h-5" />
            ) : (
              <PackageCheck className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {subTab === 'returns'
                  ? (language === 'ms' ? 'Pemulangan Pembekal' : 'Supplier Returns')
                  : subTab === 'requests'
                  ? (language === 'ms' ? 'Pesanan Pembekal' : 'Supplier Requests')
                  : (language === 'ms' ? 'Penerimaan Pembekal' : 'Supplier Received')}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                subTab === 'returns'
                  ? 'bg-rose-100/80 text-rose-700'
                  : subTab === 'requests'
                  ? 'bg-blue-100/80 text-blue-700'
                  : 'bg-emerald-100/80 text-emerald-700'
              }`}>
                {subTab === 'returns' ? 'Outbound Fleet' : subTab === 'requests' ? 'Procurement Indent' : 'Inbound Fleet'}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              {subTab === 'returns' 
                ? (language === 'ms' ? 'Dokumen penghantaran balik silinder gas ke pembekal perubatan rasmi.' : 'Official return document dispatch to medical gas suppliers.')
                : subTab === 'requests'
                ? (language === 'ms' ? 'Medical gas cylinder supply order and refill requisition.' : 'Official purchase order and cylinder replenishment indents.')
                : (language === 'ms' ? 'Kemasukan kelompok silinder daripada pembekal terus dikreditkan ke stor.' : 'Cylinder intake batches received from supplier directly credited to live storage.')}
            </p>
          </div>
        </div>

        {/* Live Operational Metrics Chip Row */}
        <div className={`grid grid-cols-2 ${subTab === 'returns' ? 'sm:grid-cols-5' : 'sm:grid-cols-4'} gap-3 pt-4 border-t border-slate-100`}>
          {subTab === 'returns' && (
            <div 
              onClick={onOpenEmptyListModal || onScanClick}
              className="bg-amber-50/70 hover:bg-amber-50 border border-amber-200/80 rounded-xl p-3 cursor-pointer transition-all hover:border-amber-300 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                  {language === 'ms' ? 'Kosong Di Stor' : 'Empty in Store'}
                </span>
                <span className="text-[10px] text-indigo-600 font-bold group-hover:underline flex items-center gap-0.5">
                  {language === 'ms' ? 'View List' : 'View Manifest'} &rarr;
                </span>
              </div>
              <div className="text-lg font-extrabold text-amber-900 font-mono mt-0.5">
                {storeEmptyCount}
                <span className="text-xs font-sans font-normal text-amber-700 ml-1">cyl</span>
              </div>
              <span className="text-[10px] text-amber-700/80 font-medium">
                {language === 'ms' ? 'Sedia untuk pemulangan' : 'Ready for return dispatch'}
              </span>
            </div>
          )}

          <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {language === 'ms' ? 'Jumlah Dokumen' : 'Total Documents'}
            </span>
            <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
              {kpiStats.totalDocs}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              {kpiStats.completedCount} {language === 'ms' ? 'selesai' : 'completed'}
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {subTab === 'returns' 
                ? (language === 'ms' ? 'Silinder Dipulangkan' : 'Cylinders Returned')
                : subTab === 'requests'
                ? (language === 'ms' ? 'Kuantiti Dipesan' : 'Quantities Requested')
                : (language === 'ms' ? 'Silinder Diterima' : 'Cylinders Received')}
            </span>
            <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
              {kpiStats.totalCylinders}
              <span className="text-xs font-sans font-normal text-slate-500 ml-1">cyl</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              {subTab === 'requests' && (kpiStats.totalVieM3 || 0) > 0
                ? `+ ${(kpiStats.totalVieM3 || 0).toLocaleString()} m³ VIE Tank`
                : (language === 'ms' ? 'Rentang keseluruhan' : 'Across all records')}
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {language === 'ms' ? 'Pembekal Terlibat' : 'Active Suppliers'}
            </span>
            <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
              {kpiStats.suppliersCount}
            </div>
            <span className="text-[10px] text-slate-500 font-medium truncate block">
              {availableFilterSuppliers.length > 0 ? availableFilterSuppliers.join(', ') : 'Borneo Indah / Linde'}
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {language === 'ms' ? 'Aktiviti Terkini' : 'Latest Activity'}
            </span>
            <div className="text-sm font-bold text-slate-900 mt-1 truncate">
              {kpiStats.latestDate}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {language === 'ms' ? 'Disegerakkan' : 'Live Sync'}
            </span>
          </div>
        </div>
        </>
        )}
      </div>

      {subTab === 'tracking' ? (
        <SupplierCylinderTrackingSection
          hospitalId={activeHospitalId}
          onOpenReceiveModal={onCreateReceiveClick}
          onOpenReturnModal={onCreateClick}
          onPrintDocument={onPrintClick}
          isViewOnly={isViewOnly}
          onDataLoaded={(sum) => setTrackingSummary(sum)}
        />
      ) : (
        <>
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'ms' ? 'Cari no. dokumen atau pembekal...' : 'Search document # or supplier...'}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Supplier Filter */}
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="all">{language === 'ms' ? 'Semua Pembekal' : 'All Suppliers'}</option>
            {availableFilterSuppliers.map(sup => (
              <option key={sup} value={sup}>{sup}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="all">{language === 'ms' ? 'Semua Status' : 'All Status'}</option>
            <option value="completed">{language === 'ms' ? 'Selesai' : 'Completed'}</option>
            <option value="draft">{language === 'ms' ? 'Draf' : 'Draft'}</option>
            <option value="cancelled">{language === 'ms' ? 'Dibatalkan' : 'Cancelled'}</option>
          </select>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500 font-medium px-1">
          <span>
            {language === 'ms' ? 'Memaparkan' : 'Showing'}{' '}
            <strong className="text-slate-800 font-mono">
              {subTab === 'returns' ? filteredDocuments.length : subTab === 'requests' ? filteredRequestDocuments.length : filteredReceiveDocuments.length}
            </strong>{' '}
            {language === 'ms' ? 'daripada' : 'of'}{' '}
            <strong className="text-slate-800 font-mono">
              {subTab === 'returns' ? documents.length : subTab === 'requests' ? requestDocuments.length : receiveDocuments.length}
            </strong>
          </span>

          {(searchTerm || supplierFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSupplierFilter('all');
                setStatusFilter('all');
              }}
              className="text-teal-600 hover:text-teal-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              {language === 'ms' ? 'Set Semula' : 'Reset'}
            </button>
          )}
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {subTab === 'returns' ? (
          <>
            {/* Mobile View: Cards Layout */}
            <div className="block md:hidden divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredDocuments.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                    <Truck className="w-6 h-6" />
                  </div>
                  <p className="text-slate-800 font-bold text-sm">
                    {searchTerm || supplierFilter !== 'all' || statusFilter !== 'all'
                      ? 'No matching return documents'
                      : 'No return documents found'}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {searchTerm || supplierFilter !== 'all' || statusFilter !== 'all'
                      ? 'Try clearing your search query or filters.'
                      : 'Create a return document to get started.'}
                  </p>
                </div>
              ) : (
                filteredDocuments.map((doc) => {
                  const itemsCount = doc.items?.length || 0;
                  const isCopied = copiedId === doc.id;
                  return (
                    <div key={doc.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Return Document #</span>
                          <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                            <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                            <span>{doc.document_number}</span>
                            <button
                              onClick={() => handleCopy(doc.document_number, doc.id)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-all cursor-pointer"
                              title="Copy Document #"
                            >
                              {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 relative">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            doc.status === 'completed' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-500/10' 
                              : doc.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                              : 'bg-amber-50 text-amber-700 border-amber-200/80'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              doc.status === 'completed' ? 'bg-emerald-500 animate-pulse' : doc.status === 'cancelled' ? 'bg-rose-500' : 'bg-amber-500'
                            }`} />
                            <span className="capitalize">{doc.status}</span>
                          </span>
                          <button
                            onClick={(e) => toggleDropdown(e, doc.id)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors duration-150 cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {activeDropdownId === doc.id && (
                            <div 
                              className="absolute right-0 top-9 bg-white border border-slate-200 shadow-xl rounded-2xl p-1.5 z-30 min-w-[160px] animate-in fade-in zoom-in-95 duration-100 text-left font-medium text-slate-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  onPrintClick(doc.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-400" />
                                Print Document
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  openHistoryModal(doc, 'returns');
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                              >
                                <HistoryIcon className="w-3.5 h-3.5 text-slate-400" />
                                View History
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  openEditModal(doc, 'returns');
                                }}
                                disabled={isViewOnly}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors duration-150 disabled:opacity-40 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                Edit Document
                              </button>
                              <div className="my-1 border-t border-slate-100" />
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  openDeleteModal(doc, 'returns');
                                }}
                                disabled={isViewOnly}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-650 hover:bg-red-50 transition-colors duration-150 disabled:opacity-40 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                Delete Document
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">DATE</span>
                          <span className="font-medium text-slate-700">
                            {new Date(doc.returned_date).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">SUPPLIER</span>
                          <span className="font-semibold text-slate-800 truncate block">
                            {doc.supplier?.company_name || 'Linde Malaysia'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] text-slate-400 font-bold block">CYLINDERS RETURNED</span>
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-900 text-xs mt-0.5">
                            {itemsCount} <span className="font-sans font-normal text-slate-500">cylinders</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop View: Standard Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/75 border-b border-slate-200/80">
                  <tr className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-6">Return Document #</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Supplier</th>
                    <th className="py-3.5 px-6 text-center">Cylinders Returned</th>
                    <th className="py-3.5 px-6 text-center">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-xs">
                  {filteredDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                            <Truck className="w-6 h-6" />
                          </div>
                          <p className="text-slate-800 font-bold text-sm">
                            {searchTerm || supplierFilter !== 'all' || statusFilter !== 'all'
                              ? 'No matching return documents'
                              : 'No return documents found'}
                          </p>
                          <p className="text-slate-400 text-xs mt-1">
                            {searchTerm || supplierFilter !== 'all' || statusFilter !== 'all'
                              ? 'Try adjusting your search query or active filters.'
                              : 'Create a new return document to dispatch cylinders to the supplier.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDocuments.map((doc) => {
                      const itemsCount = doc.items?.length || 0;
                      const isCopied = copiedId === doc.id;
                      return (
                        <tr
                          key={doc.id}
                          className="hover:bg-slate-50/70 transition-colors duration-150 group"
                        >
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-mono font-bold text-slate-900 text-xs tracking-tight">
                                {doc.document_number}
                              </span>
                              <button
                                onClick={() => handleCopy(doc.document_number, doc.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 rounded transition-all cursor-pointer"
                                title="Copy Document #"
                              >
                                {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-6 text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>
                                {new Date(doc.returned_date).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[220px]">
                                {doc.supplier?.company_name || 'Linde Malaysia'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-6 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono font-bold text-xs">
                              {itemsCount}
                              <span className="text-[10px] text-slate-400 font-sans font-normal">cyl</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              doc.status === 'completed' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-500/10' 
                                : doc.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                                : 'bg-amber-50 text-amber-700 border-amber-200/80'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                doc.status === 'completed' 
                                  ? 'bg-emerald-500 animate-pulse' 
                                  : doc.status === 'cancelled' 
                                  ? 'bg-rose-500' 
                                  : 'bg-amber-500'
                              }`} />
                              <span className="capitalize">{doc.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right relative">
                            <div className="flex items-center justify-end">
                              <button
                                onClick={(e) => toggleDropdown(e, doc.id)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors duration-150 cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              
                              {activeDropdownId === doc.id && (
                                <div 
                                  className="absolute right-6 top-10 bg-white border border-slate-200 shadow-xl rounded-2xl p-1.5 z-30 min-w-[160px] animate-in fade-in zoom-in-95 duration-100 text-left font-medium text-slate-700"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      onPrintClick(doc.id);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                                    Print Document
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      openHistoryModal(doc, 'returns');
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                                  >
                                    <HistoryIcon className="w-3.5 h-3.5 text-slate-400" />
                                    View History
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      openEditModal(doc, 'returns');
                                    }}
                                    disabled={isViewOnly}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors duration-150 disabled:opacity-40 cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                    Edit Document
                                  </button>
                                  <div className="my-1 border-t border-slate-100" />
                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      openDeleteModal(doc, 'returns');
                                    }}
                                    disabled={isViewOnly}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-650 hover:bg-red-50 transition-colors duration-150 disabled:opacity-40 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                    Delete Document
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : subTab === 'requests' ? (
          <>
            {/* Mobile View: Cards Layout */}
            <div className="block md:hidden divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredRequestDocuments.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <p className="text-slate-800 font-bold text-sm">
                    {searchTerm || supplierFilter !== 'all' || statusFilter !== 'all'
                      ? 'No matching request documents'
                      : 'No request documents found'}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {searchTerm || supplierFilter !== 'all' || statusFilter !== 'all'
                      ? 'Try clearing your search query or filters.'
                      : 'Create a request document to get started.'}
                  </p>
                </div>
              ) : (
                filteredRequestDocuments.map((doc) => {
                  const cylQty = doc.items?.filter(i => {
                    const c = (i.size_code || '').toUpperCase();
                    return !c.includes('VIE') && !c.includes('LIQUID');
                  }).reduce((s, i) => s + (Number(i.quantity) || 0), 0) || 0;
                  const vieQty = doc.items?.filter(i => {
                    const c = (i.size_code || '').toUpperCase();
                    return c.includes('VIE') || c.includes('LIQUID');
                  }).reduce((s, i) => s + (Number(i.quantity) || 0), 0) || 0;
                  const isCopied = copiedId === doc.id;
                  return (
                    <div key={doc.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Request Document #</span>
                          <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                            <span>{doc.document_number}</span>
                            <button
                              onClick={() => handleCopy(doc.document_number, doc.id)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-all cursor-pointer"
                              title="Copy Document #"
                            >
                              {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 relative">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            doc.status === 'completed' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-500/10' 
                              : doc.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                              : 'bg-amber-50 text-amber-700 border-amber-200/80'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              doc.status === 'completed' ? 'bg-emerald-500 animate-pulse' : doc.status === 'cancelled' ? 'bg-rose-500' : 'bg-amber-500'
                            }`} />
                            <span className="capitalize">{doc.status}</span>
                          </span>
                          <button
                            onClick={(e) => toggleDropdown(e, doc.id)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors duration-150 cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {activeDropdownId === doc.id && (
                            <div 
                              className="absolute right-0 top-9 bg-white border border-slate-200 shadow-xl rounded-2xl p-1.5 z-30 min-w-[160px] animate-in fade-in zoom-in-95 duration-100 text-left font-medium text-slate-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  onPrintRequestClick(doc.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-400" />
                                Print Document
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  openHistoryModal(doc, 'requests');
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                              >
                                <HistoryIcon className="w-3.5 h-3.5 text-slate-400" />
                                View History
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  openEditModal(doc, 'requests');
                                }}
                                disabled={isViewOnly}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors duration-150 disabled:opacity-40 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                Edit Document
                              </button>
                              <div className="my-1 border-t border-slate-100" />
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  openDeleteModal(doc, 'requests');
                                }}
                                disabled={isViewOnly}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-650 hover:bg-red-50 transition-colors duration-150 disabled:opacity-40 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                Delete Document
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">DATE</span>
                          <span className="font-medium text-slate-700">
                            {new Date(doc.requested_date).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">SUPPLIER</span>
                          <span className="font-semibold text-slate-800 truncate block">
                            {doc.supplier?.company_name || 'Linde Malaysia'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] text-slate-400 font-bold block">QUANTITIES REQUESTED</span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            {cylQty > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 font-mono font-bold text-slate-900 text-xs">
                                {cylQty} <span className="font-sans font-normal text-slate-500 text-[10px]">cyl</span>
                              </span>
                            )}
                            {vieQty > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200/60 font-mono font-bold text-blue-700 text-xs">
                                {vieQty.toLocaleString()} <span className="font-sans font-semibold text-blue-500 text-[10px]">m³ VIE</span>
                              </span>
                            )}
                            {cylQty === 0 && vieQty === 0 && (
                              <span className="font-mono text-slate-400 text-xs">0</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop View: Standard Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/75 border-b border-slate-200/80">
                  <tr className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-6">Request Document #</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Supplier</th>
                    <th className="py-3.5 px-6 text-center">Quantities / Items Requested</th>
                    <th className="py-3.5 px-6 text-center">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-xs">
                  {filteredRequestDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                            <FileCheck className="w-6 h-6" />
                          </div>
                          <p className="text-slate-800 font-bold text-sm">
                            {searchTerm || supplierFilter !== 'all' || statusFilter !== 'all'
                              ? 'No matching request documents'
                              : 'No request documents found'}
                          </p>
                          <p className="text-slate-400 text-xs mt-1">
                            {searchTerm || supplierFilter !== 'all' || statusFilter !== 'all'
                              ? 'Try adjusting your search query or active filters.'
                              : 'Create a new request document to indent cylinders from supplier.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRequestDocuments.map((doc) => {
                      const cylQty = doc.items?.filter(i => {
                        const c = (i.size_code || '').toUpperCase();
                        return !c.includes('VIE') && !c.includes('LIQUID');
                      }).reduce((s, i) => s + (Number(i.quantity) || 0), 0) || 0;
                      const vieQty = doc.items?.filter(i => {
                        const c = (i.size_code || '').toUpperCase();
                        return c.includes('VIE') || c.includes('LIQUID');
                      }).reduce((s, i) => s + (Number(i.quantity) || 0), 0) || 0;
                      const isCopied = copiedId === doc.id;
                      return (
                        <tr
                          key={doc.id}
                          className="hover:bg-slate-50/70 transition-colors duration-150 group"
                        >
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-mono font-bold text-slate-900 text-xs tracking-tight">
                                {doc.document_number}
                              </span>
                              <button
                                onClick={() => handleCopy(doc.document_number, doc.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 rounded transition-all cursor-pointer"
                                title="Copy Document #"
                              >
                                {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-6 text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>
                                {new Date(doc.requested_date).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[220px]">
                                {doc.supplier?.company_name || 'Linde Malaysia'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-6 text-center">
                            <div className="inline-flex flex-wrap items-center justify-center gap-1.5">
                              {cylQty > 0 && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono font-bold text-xs">
                                  {cylQty}
                                  <span className="text-[10px] text-slate-400 font-sans font-normal">cyl</span>
                                </span>
                              )}
                              {vieQty > 0 && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 font-mono font-bold text-xs">
                                  {vieQty.toLocaleString()}
                                  <span className="text-[10px] text-blue-500 font-sans font-bold">m³</span>
                                </span>
                              )}
                              {cylQty === 0 && vieQty === 0 && (
                                <span className="text-slate-400 font-mono text-xs">0</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-6 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              doc.status === 'completed' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-500/10' 
                                : doc.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                                : 'bg-amber-50 text-amber-700 border-amber-200/80'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                doc.status === 'completed' 
                                  ? 'bg-emerald-500 animate-pulse' 
                                  : doc.status === 'cancelled' 
                                  ? 'bg-rose-500' 
                                  : 'bg-amber-500'
                              }`} />
                              <span className="capitalize">{doc.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right relative">
                            <div className="flex items-center justify-end">
                              <button
                                onClick={(e) => toggleDropdown(e, doc.id)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors duration-150 cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              
                              {activeDropdownId === doc.id && (
                                <div 
                                  className="absolute right-6 top-10 bg-white border border-slate-200 shadow-xl rounded-2xl p-1.5 z-30 min-w-[160px] animate-in fade-in zoom-in-95 duration-100 text-left font-medium text-slate-700"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      onPrintRequestClick(doc.id);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                                    Print Document
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      openHistoryModal(doc, 'requests');
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                                  >
                                    <HistoryIcon className="w-3.5 h-3.5 text-slate-400" />
                                    View History
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      openEditModal(doc, 'requests');
                                    }}
                                    disabled={isViewOnly}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors duration-150 disabled:opacity-40 cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                    Edit Document
                                  </button>
                                  <div className="my-1 border-t border-slate-100" />
                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      openDeleteModal(doc, 'requests');
                                    }}
                                    disabled={isViewOnly}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-650 hover:bg-red-50 transition-colors duration-150 disabled:opacity-40 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                    Delete Document
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            {/* Supplier Received: Mobile View */}
            <div className="block md:hidden divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredReceiveDocuments.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                    <PackageCheck className="w-6 h-6" />
                  </div>
                  <p className="text-slate-800 font-bold text-sm">
                    {searchTerm || supplierFilter !== 'all' || statusFilter !== 'all'
                      ? 'No matching receive documents'
                      : (language === 'ms' ? 'Tiada rekod penerimaan silinder dijumpai.' : 'No receive documents found.')}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {language === 'ms' ? 'Klik "Terima Dari Pembekal" untuk mula merekod.' : 'Click "Receive From Supplier" to begin receiving stock.'}
                  </p>
                </div>
              ) : (
                filteredReceiveDocuments.map((doc) => {
                  const itemsCount = doc.items?.length || 0;
                  const isCopied = copiedId === doc.id;
                  return (
                    <div key={doc.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receive Document #</span>
                          <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                            <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{doc.document_number}</span>
                            <button
                              onClick={() => handleCopy(doc.document_number, doc.id)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-all cursor-pointer"
                              title="Copy Document #"
                            >
                              {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 relative">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            doc.status === 'completed' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-500/10' 
                              : doc.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                              : 'bg-amber-50 text-amber-700 border-amber-200/80'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              doc.status === 'completed' ? 'bg-emerald-500 animate-pulse' : doc.status === 'cancelled' ? 'bg-rose-500' : 'bg-amber-500'
                            }`} />
                            <span className="capitalize">{doc.status}</span>
                          </span>
                          <button
                            onClick={(e) => toggleDropdown(e, doc.id)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors duration-150 cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {activeDropdownId === doc.id && (
                            <div 
                              className="absolute right-0 top-9 bg-white border border-slate-200 shadow-xl rounded-2xl p-1.5 z-30 min-w-[160px] animate-in fade-in zoom-in-95 duration-100 text-left font-medium text-slate-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  setViewCylindersDoc(doc);
                                  setIsViewCylindersOpen(true);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                View Cylinders
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  onPrintReceiveClick(doc.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-400" />
                                Print Document
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  openHistoryModal(doc, 'received');
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                              >
                                <HistoryIcon className="w-3.5 h-3.5 text-slate-400" />
                                View History
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  openEditModal(doc, 'received');
                                }}
                                disabled={isViewOnly}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors duration-150 disabled:opacity-40 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                Edit Document
                              </button>
                              <div className="my-1 border-t border-slate-100" />
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  openDeleteModal(doc, 'received');
                                }}
                                disabled={isViewOnly}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-650 hover:bg-red-50 transition-colors duration-150 disabled:opacity-40 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                Delete Document
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">DATE</span>
                          <span className="font-medium text-slate-700">
                            {new Date(doc.received_date || doc.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">DO # / SURAT HANTARAN</span>
                          <span className="font-mono font-medium text-slate-800">{doc.delivery_order_no || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">SUPPLIER</span>
                          <span className="font-semibold text-slate-800 truncate block">{doc.supplier?.company_name || 'Pembekal'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">CYLINDERS RECEIVED</span>
                          <span className="font-mono font-bold text-emerald-700">{itemsCount} units</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Supplier Received: Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/75 border-b border-slate-200/80">
                  <tr className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-6">RECEIVE DOCUMENT #</th>
                    <th className="py-3.5 px-6">DATE</th>
                    <th className="py-3.5 px-6">SUPPLIER</th>
                    <th className="py-3.5 px-6">DO # (SURAT HANTARAN)</th>
                    <th className="py-3.5 px-6 text-center">CYLINDERS RECEIVED</th>
                    <th className="py-3.5 px-6 text-center">STATUS</th>
                    <th className="py-3.5 px-6 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-xs">
                  {filteredReceiveDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                            <PackageCheck className="w-6 h-6" />
                          </div>
                          <p className="text-slate-800 font-bold text-sm">
                            {searchTerm || supplierFilter !== 'all' || statusFilter !== 'all'
                              ? 'No matching receive documents'
                              : (language === 'ms' ? 'Tiada dokumen penerimaan silinder dijumpai.' : 'No receive documents found.')}
                          </p>
                          <p className="text-slate-400 text-xs mt-1">
                            {language === 'ms' ? 'Klik "Terima Dari Pembekal" untuk mula merekod.' : 'Click "Receive From Supplier" to begin receiving stock.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredReceiveDocuments.map((doc) => {
                      const itemsCount = doc.items?.length || 0;
                      const isCopied = copiedId === doc.id;
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors duration-150 group">
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                                <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                              </div>
                              <span className="font-mono font-bold text-slate-900 text-xs tracking-tight">{doc.document_number}</span>
                              <button
                                onClick={() => handleCopy(doc.document_number, doc.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 rounded transition-all cursor-pointer"
                                title="Copy Document #"
                              >
                                {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-6 text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>
                                {new Date(doc.received_date || doc.created_at).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[220px]">
                                {doc.supplier?.company_name || 'Pembekal Oksigen'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-6">
                            <span className="font-mono font-bold text-slate-700 text-xs bg-slate-100 px-2 py-0.5 rounded">
                              {doc.delivery_order_no || '-'}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-mono font-bold text-xs border border-emerald-100">
                              {itemsCount}
                              <span className="text-[10px] text-emerald-600 font-sans font-normal">units</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-center">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-500/10">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="capitalize">{doc.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right relative">
                            <div className="flex items-center justify-end">
                              <button
                                onClick={(e) => toggleDropdown(e, doc.id)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors duration-150 cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              
                              {activeDropdownId === doc.id && (
                                <div 
                                  className="absolute right-6 top-10 bg-white border border-slate-200 shadow-xl rounded-2xl p-1.5 z-30 min-w-[160px] animate-in fade-in zoom-in-95 duration-100 text-left font-medium text-slate-700"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      setViewCylindersDoc(doc);
                                      setIsViewCylindersOpen(true);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                                    View Cylinders
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      onPrintReceiveClick(doc.id);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                                    Print Document
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      openHistoryModal(doc, 'received');
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                                  >
                                    <HistoryIcon className="w-3.5 h-3.5 text-slate-400" />
                                    View History
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      openEditModal(doc, 'received');
                                    }}
                                    disabled={isViewOnly}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors duration-150 disabled:opacity-40 cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                    Edit Document
                                  </button>
                                  <div className="my-1 border-t border-slate-100" />
                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      openDeleteModal(doc, 'received');
                                    }}
                                    disabled={isViewOnly}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-650 hover:bg-red-50 transition-colors duration-150 disabled:opacity-40 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                    Delete Document
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
        </>
      )}

      {/* View Cylinders Modal for Received Document */}
      {isViewCylindersOpen && viewCylindersDoc && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-xl w-full flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Senarai Silinder Diterima
                  </h3>
                  <p className="text-xs text-slate-500 font-mono font-bold">
                    {viewCylindersDoc.document_number} {viewCylindersDoc.delivery_order_no ? `• DO: ${viewCylindersDoc.delivery_order_no}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsViewCylindersOpen(false);
                  setViewCylindersDoc(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                <span>Pembekal: <strong className="text-slate-800">{viewCylindersDoc.supplier?.company_name || 'Pembekal'}</strong></span>
                <span>Jumlah: <strong className="text-emerald-700">{viewCylindersDoc.items?.length || 0} unit</strong></span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                {(viewCylindersDoc.items || []).map((it: any, idx: number) => {
                  const cyl = it.cylinder;
                  return (
                    <div key={it.id || idx} className="p-3 flex items-center justify-between hover:bg-slate-50/60">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 w-5">#{idx + 1}</span>
                        <span className="font-mono text-xs font-extrabold text-slate-900">
                          {cyl?.serial_number || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {cyl?.combo?.display_name || cyl?.type_info?.type_name || 'Standard Cylinder'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Tersedia di Stor
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsViewCylindersOpen(false);
                  setViewCylindersDoc(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl cursor-pointer"
              >
                Tutup
              </button>
              <div className="flex items-center gap-2">
                {!isViewOnly && (
                  <button
                    onClick={() => {
                      const docToEdit = viewCylindersDoc;
                      setIsViewCylindersOpen(false);
                      setViewCylindersDoc(null);
                      openEditModal(docToEdit, 'received');
                    }}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{language === 'ms' ? 'Edit Dokumen / Silinder' : 'Edit Document / Cylinders'}</span>
                  </button>
                )}
                {onPrintReceiveClick && (
                  <button
                    onClick={() => {
                      setIsViewCylindersOpen(false);
                      onPrintReceiveClick(viewCylindersDoc.id);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Dokumen</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Side Drawer */}
      <div 
        onClick={() => setIsEditOpen(false)}
        className={`fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${
          isEditOpen && selectedDoc ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div 
        className={`fixed inset-y-0 right-0 z-[100] w-full max-w-4xl bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out border-l border-slate-200 ${
          isEditOpen && selectedDoc ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedDoc && (
          <div className="flex flex-col h-full bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Edit Document
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold font-mono">
                    {selectedDoc.document_number}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                    Document Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-350 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-xl px-3 py-2 text-sm text-slate-800 transition-all duration-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                    Document Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-350 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-xl px-3 py-2 text-sm text-slate-800 transition-all duration-200 outline-none"
                  >
                    <option value="draft">draft</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
              </div>

              <div className={docType === 'received' ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : ""}>
                <div>
                  <label className="block text-[11px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                    Supplier
                  </label>
                  <select
                    required
                    value={editSupplierId}
                    onChange={(e) => setEditSupplierId(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-350 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-xl px-3 py-2 text-sm text-slate-800 transition-all duration-200 outline-none"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.company_name}
                      </option>
                    ))}
                  </select>
                </div>

                {docType === 'received' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                      {language === 'ms' ? 'No. Surat Hantaran (DO #)' : 'Delivery Order No. (DO #)'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'ms' ? 'cth: DO-2026-98102' : 'e.g. DO-2026-98102'}
                      value={editDeliveryOrderNo}
                      onChange={(e) => setEditDeliveryOrderNo(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-350 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-xl px-3 py-2 text-sm font-mono text-slate-800 transition-all duration-200 outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                  Remarks / Internal Notes
                </label>
                <textarea
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-350 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-xl px-3 py-2 text-sm text-slate-800 transition-all duration-200 outline-none h-20 resize-none"
                  placeholder="Additional remarks..."
                />
              </div>

              {docType === 'returns' && (
                <div className="space-y-4">
                  {/* Standard Cylinders */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <label className="block text-slate-700 font-bold text-xs uppercase tracking-wide">
                        Standard / Hospital Owned Cylinders (Private Cylinders)
                      </label>
                      {(() => {
                        const uniqueSizes = Array.from(new Set(emptyCylinders.map((sc: any) => sc.type_info?.type_name || 'Standard')));
                        if (uniqueSizes.length === 0) return null;
                        return (
                          <div className="flex flex-wrap bg-slate-200/60 p-0.5 rounded-lg text-[9px] font-bold uppercase gap-0.5">
                            {uniqueSizes.map((sizeName) => {
                              const count = emptyCylinders.filter(c => (c.type_info?.type_name || 'Standard') === sizeName).length;
                              const isSelected = privateSizeFilter === sizeName;
                              return (
                                <button
                                  key={sizeName}
                                  type="button"
                                  onClick={() => setPrivateSizeFilter(sizeName)}
                                  className={`px-2 py-0.5 rounded-md transition-all ${
                                    isSelected
                                      ? 'bg-rose-500 text-white shadow-xs'
                                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-300/40'
                                  }`}
                                >
                                  {sizeName} ({count})
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                    {(() => {
                      const displayedCyls = emptyCylinders.filter(
                        c => !privateSizeFilter || (c.type_info?.type_name || 'Standard') === privateSizeFilter
                      );
                      if (displayedCyls.length === 0) {
                        return (
                          <p className="text-[11px] text-slate-400 font-semibold italic text-center py-4 bg-white border border-dashed border-slate-200 rounded-xl">
                            Select a size above to display available cylinders.
                          </p>
                        );
                      }
                      return (
                        <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                          {displayedCyls.map((cyl) => {
                            const isSelected = selectedCylIdList.includes(cyl.id);
                            const typeName = cyl.type_info?.type_name || 'Standard';
                            const isFSize = typeName.includes('1.4') || typeName.includes('101-F') || (cyl.serial_number || '').includes('101-F');
                            const isPI = typeName.includes('PI') || typeName.includes('Pin');

                            return (
                              <div
                                key={cyl.id}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedCylIdList(selectedCylIdList.filter(id => id !== cyl.id));
                                  } else {
                                    setSelectedCylIdList([...selectedCylIdList, cyl.id]);
                                  }
                                }}
                                className={`flex items-center justify-between gap-2 p-2 border rounded-xl cursor-pointer transition-all select-none hover:bg-slate-100/50 ${
                                  isSelected
                                    ? 'border-rose-400 bg-rose-50/20 text-rose-800 ring-2 ring-rose-500/5'
                                    : 'border-slate-200 bg-white text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}} // Handled by parent container click
                                    className="rounded border-slate-300 text-rose-600 w-3.5 h-3.5 cursor-pointer shrink-0"
                                  />
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-mono font-bold truncate leading-none mb-0.5">{cyl.serial_number}</span>
                                    <span className="text-[9px] text-slate-400 font-semibold leading-none truncate">{typeName}</span>
                                  </div>
                                </div>

                                {isFSize && (
                                  <button
                                    type="button"
                                    title={`Click to switch valve type to ${isPI ? 'Bullnose (BN)' : 'Pin Index (PI)'}`}
                                    onClick={(e) => handleToggleValveType(e, cyl)}
                                    className={`shrink-0 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border transition-all hover:scale-105 active:scale-95 shadow-2xs ${
                                      isPI 
                                        ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' 
                                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                    }`}
                                  >
                                    {isPI ? '➔ BN' : '➔ PI'}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Supplier-Tagged Loan Cylinders */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <label className="block text-slate-700 font-bold text-xs uppercase tracking-wide">
                        Supplier Tagged Loan Cylinders
                      </label>
                      
                      {/* Filter pills */}
                      {(() => {
                        const supplierSizes = Array.from(new Set(supplierCylinders.map(c => c.size_info?.code).filter(Boolean))) as string[];
                        if (supplierSizes.length === 0) return null;
                        return (
                          <div className="flex bg-slate-200/60 p-0.5 rounded-lg text-[9px] font-bold uppercase gap-0.5">
                            {supplierSizes.map((filterVal) => {
                              const count = supplierCylinders.filter(c => c.size_info?.code === filterVal).length;
                              const isSelected = supplierSizeFilter === filterVal;
                              return (
                                <button
                                  key={filterVal}
                                  type="button"
                                  onClick={() => setSupplierSizeFilter(filterVal as any)}
                                  className={`px-2 py-0.5 rounded-md transition-all ${
                                    isSelected
                                      ? 'bg-rose-500 text-white shadow-xs'
                                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-300/40'
                                  }`}
                                >
                                  {filterVal} ({count})
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    {(() => {
                      const displayedCyls = supplierCylinders.filter(c => !supplierSizeFilter || supplierSizeFilter === 'all' || c.size_info?.code === supplierSizeFilter);
                      if (displayedCyls.length === 0) {
                        return (
                          <p className="text-[11px] text-slate-400 font-semibold italic text-center py-4 bg-white border border-dashed border-slate-200 rounded-xl">
                            Select a size above to display loan cylinders.
                          </p>
                        );
                      }
                      return (
                        <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                          {displayedCyls.map((cyl) => {
                            const isSelected = selectedCylIdList.includes(cyl.id);
                            return (
                              <label
                                key={cyl.id}
                                className={`flex items-center gap-2 p-2 border rounded-xl cursor-pointer transition-all select-none hover:bg-slate-100/50 ${
                                  isSelected
                                    ? 'border-rose-400 bg-rose-50/20 text-rose-800 ring-2 ring-rose-500/5'
                                    : 'border-slate-200 bg-white text-slate-700'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      setSelectedCylIdList(selectedCylIdList.filter(id => id !== cyl.id));
                                    } else {
                                      setSelectedCylIdList([...selectedCylIdList, cyl.id]);
                                    }
                                  }}
                                  className="rounded border-slate-300 text-rose-600 w-3.5 h-3.5 cursor-pointer"
                                />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[10px] font-mono font-bold truncate leading-none mb-0.5">{cyl.serial_number}</span>
                                  <span className="text-[9px] text-slate-400 font-semibold leading-none">{cyl.size_info?.code || '101-N'}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {docType === 'received' && (
                <div className="space-y-3.5 bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <PackageCheck className="w-4 h-4 text-emerald-600" />
                        <label className="block text-slate-800 font-bold text-xs uppercase tracking-wide">
                          {language === 'ms' ? 'Silinder Diterima & Nombor Siri' : 'Received Cylinders & Serial Numbers'}
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {language === 'ms' 
                          ? 'Edit nombor siri silinder yang diterima jika terdapat kesilapan ejaan atau pertukaran tag.' 
                          : 'Edit received cylinder serial numbers directly to correct typos or tag mismatches.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                        {editReceivedCylinders.filter(c => !c.isRemoved).length} {language === 'ms' ? 'silinder' : 'cylinders'}
                      </span>
                      {(() => {
                        const addedCount = editReceivedCylinders.filter(c => !c.itemId && !c.isRemoved).length;
                        if (addedCount === 0) return null;
                        return (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <span>+{addedCount} {language === 'ms' ? 'ditambah' : 'added'}</span>
                          </span>
                        );
                      })()}
                      {(() => {
                        const modCount = editReceivedCylinders.filter(c => !c.isRemoved && c.originalSerial && c.serialNumber.trim().toUpperCase() !== c.originalSerial.trim().toUpperCase()).length;
                        if (modCount === 0) return null;
                        return (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 animate-pulse">
                            <span>{modCount} {language === 'ms' ? 'diubah' : 'modified'}</span>
                          </span>
                        );
                      })()}
                      {(() => {
                        const remCount = editReceivedCylinders.filter(c => c.isRemoved).length;
                        if (remCount === 0) return null;
                        return (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
                            {remCount} {language === 'ms' ? 'dikeluarkan' : 'removed'}
                          </span>
                        );
                      })()}
                      <button
                        type="button"
                        onClick={() => setIsAddingReceivedCyl(!isAddingReceivedCyl)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-slate-600" />
                        <span>{language === 'ms' ? 'Tambah Silinder' : 'Add Cylinder'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Add Cylinder Form */}
                  {isAddingReceivedCyl && (
                    <div className="p-3.5 bg-white border border-emerald-200/90 rounded-2xl space-y-3 shadow-md animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-emerald-600" />
                          {language === 'ms' ? 'Tambah Silinder ke Dokumen Penerimaan' : 'Add Cylinder to Receive Document'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingReceivedCyl(false);
                            setNewReceivedCylSerial('');
                            setSelectedDbCylinder(null);
                            setDbSearchResults([]);
                            setHasSearchedDb(false);
                          }}
                          className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>{language === 'ms' ? 'Nombor Siri / Tag' : 'Serial Number / Tag'} *</span>
                            {selectedDbCylinder && (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                ✓ Database
                              </span>
                            )}
                          </label>
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder={language === 'ms' ? 'Taip & cari no siri dlm database (cth: 0189)...' : 'Type & search serial in db (e.g. 0189)...'}
                              value={newReceivedCylSerial}
                              onChange={(e) => {
                                setNewReceivedCylSerial(e.target.value.toUpperCase());
                                setSelectedDbCylinder(null);
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-8 py-1.5 text-xs font-mono font-bold text-slate-800 uppercase focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                            />
                            {isSearchingDb ? (
                              <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
                            ) : newReceivedCylSerial ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setNewReceivedCylSerial('');
                                  setSelectedDbCylinder(null);
                                  setDbSearchResults([]);
                                  setHasSearchedDb(false);
                                }}
                                className="text-slate-400 hover:text-slate-600 p-1 absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            ) : null}
                          </div>

                          {/* Database Search Results Dropdown */}
                          {newReceivedCylSerial.trim() && (
                            <div className="mt-1.5 border border-slate-200 bg-white rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto divide-y divide-slate-100 z-20 relative">
                              {isSearchingDb ? (
                                <div className="p-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                                  <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                  <span>{language === 'ms' ? 'Mencari silinder dalam database...' : 'Searching database...'}</span>
                                </div>
                              ) : dbSearchResults.length > 0 ? (
                                <>
                                  <div className="px-2.5 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                                    <span>{language === 'ms' ? 'Silinder Dijumpai dalam Database' : 'Cylinders Found in Database'}</span>
                                    <span className="text-emerald-700 font-bold">{dbSearchResults.length} rekod</span>
                                  </div>
                                  {dbSearchResults.map((cyl) => {
                                    const isAlreadyInDoc = editReceivedCylinders.some(
                                      c => !c.isRemoved && (c.cylinderId === cyl.id || c.serialNumber.trim().toUpperCase() === cyl.serial_number.trim().toUpperCase())
                                    );
                                    const typeName = cyl.combo?.display_name || cyl.type_info?.type_name || 'Standard Cylinder';
                                    const location = cyl.current_location || 'Store';

                                    return (
                                      <div
                                        key={cyl.id}
                                        onClick={() => {
                                          if (!isAlreadyInDoc) handleSelectSearchedCylinder(cyl);
                                        }}
                                        className={`p-2 flex items-center justify-between gap-2 transition-colors ${
                                          isAlreadyInDoc
                                            ? 'bg-slate-50/70 opacity-60 cursor-not-allowed'
                                            : 'hover:bg-emerald-50/50 cursor-pointer'
                                        }`}
                                      >
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono text-xs font-bold text-slate-800">
                                              {cyl.serial_number}
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                              {typeName}
                                            </span>
                                          </div>
                                          <div className="text-[10px] text-slate-400 mt-0.5">
                                            Lokasi: <span className="font-medium text-slate-600">{location}</span> • Status: <span className="font-medium text-slate-600">{cyl.status}</span>
                                          </div>
                                        </div>

                                        <div className="shrink-0 flex items-center gap-1.5">
                                          {isAlreadyInDoc ? (
                                            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                              {language === 'ms' ? 'Sudah Ada' : 'In Document'}
                                            </span>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddNewReceivedCylinder(cyl);
                                              }}
                                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                                            >
                                              <Plus className="w-2.5 h-2.5" />
                                              <span>{language === 'ms' ? 'Pilih & Tambah' : 'Add'}</span>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </>
                              ) : hasSearchedDb ? (
                                <div className="p-3 text-center text-xs text-slate-500">
                                  <p className="font-semibold text-slate-700">
                                    {language === 'ms' ? `Tiada rekod silinder untuk "${newReceivedCylSerial}"` : `No cylinder record for "${newReceivedCylSerial}"`}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    {language === 'ms' 
                                      ? 'Silinder ini akan didaftarkan sebagai silinder baharu apabila ditambah.' 
                                      : 'This cylinder will be registered as a new cylinder upon adding.'}
                                  </p>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            {language === 'ms' ? 'Saiz & Jenis Injap' : 'Size & Valve Type'}
                          </label>
                          <select
                            value={newReceivedCylComboId}
                            onChange={(e) => setNewReceivedCylComboId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none"
                          >
                            <option value="">Standard Cylinder (Default)</option>
                            {availableCombos.map(c => (
                              <option key={c.id} value={c.id}>{c.display_name}</option>
                            ))}
                          </select>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {selectedDbCylinder 
                              ? (language === 'ms' ? 'Ditetapkan secara automatik mengikut rekod database.' : 'Automatically matched from database record.')
                              : (language === 'ms' ? 'Pilih jenis injap & saiz jika mendaftar silinder baharu.' : 'Select valve & size if registering new cylinder.')}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingReceivedCyl(false);
                            setNewReceivedCylSerial('');
                            setSelectedDbCylinder(null);
                            setDbSearchResults([]);
                            setHasSearchedDb(false);
                          }}
                          className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                        >
                          {language === 'ms' ? 'Batal' : 'Cancel'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddNewReceivedCylinder()}
                          disabled={!newReceivedCylSerial.trim()}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{language === 'ms' ? 'Masuk ke Senarai Dokumen' : 'Add to Document List'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Filter for cylinder list in this document */}
                  {editReceivedCylinders.length > 0 && (
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder={language === 'ms' ? 'Cari nombor siri silinder dalam dokumen ini (cth: 0189)...' : 'Filter cylinder serial numbers in this document (e.g. 0189)...'}
                        value={receivedCylSearchTerm}
                        onChange={(e) => setReceivedCylSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-20 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-700 placeholder-slate-400 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                      />
                      {receivedCylSearchTerm && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {editReceivedCylinders.filter(c => {
                              const q = receivedCylSearchTerm.trim().toLowerCase();
                              return (c.serialNumber || '').toLowerCase().includes(q) || (c.originalSerial || '').toLowerCase().includes(q) || (c.typeName || '').toLowerCase().includes(q);
                            }).length} / {editReceivedCylinders.length}
                          </span>
                          <button 
                            type="button" 
                            onClick={() => setReceivedCylSearchTerm('')}
                            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cylinder Items List */}
                  <div className="border border-slate-200/80 bg-white rounded-xl divide-y divide-slate-100 max-h-[360px] overflow-y-auto shadow-2xs">
                    {isLoadingReceivedCyls ? (
                      <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span>{language === 'ms' ? 'Memuatkan senarai silinder...' : 'Loading cylinders list...'}</span>
                      </div>
                    ) : (() => {
                      const q = receivedCylSearchTerm.trim().toLowerCase();
                      const displayedList = editReceivedCylinders.filter(c => {
                        if (!q) return true;
                        return (
                          (c.serialNumber || '').toLowerCase().includes(q) ||
                          (c.originalSerial || '').toLowerCase().includes(q) ||
                          (c.typeName || '').toLowerCase().includes(q)
                        );
                      });

                      if (displayedList.length === 0) {
                        return (
                          <div className="py-8 text-center text-xs text-slate-400">
                            {receivedCylSearchTerm 
                              ? (language === 'ms' ? 'Tiada silinder sepadan dengan carian.' : 'No cylinders matching search.')
                              : (language === 'ms' ? 'Tiada silinder dalam dokumen ini.' : 'No cylinders in this document.')}
                          </div>
                        );
                      }

                      return displayedList.map((cyl, idx) => {
                        const isChanged = !cyl.isRemoved && cyl.originalSerial && cyl.serialNumber.trim().toUpperCase() !== cyl.originalSerial.trim().toUpperCase();
                        const isFSize = (cyl.typeName || '').includes('1.4') || (cyl.typeName || '').includes('101-F') || (cyl.serialNumber || '').includes('101-F');
                        const isPI = (cyl.valveType === 'PI') || (!cyl.valveType && ((cyl.typeName || '').includes('PI') || (cyl.typeName || '').includes('Pin')));

                        return (
                          <div 
                            key={cyl.cylinderId || idx}
                            className={`p-2.5 sm:p-3 flex items-center justify-between gap-3 transition-colors ${
                              cyl.isRemoved 
                                ? 'bg-rose-50/40 opacity-60' 
                                : isChanged 
                                ? 'bg-amber-50/30' 
                                : 'hover:bg-slate-50/70'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <span className="text-[10px] font-mono font-bold text-slate-400 w-6 shrink-0 text-center">
                                #{idx + 1}
                              </span>

                              <div className="flex-1 min-w-0 max-w-sm">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    disabled={cyl.isRemoved}
                                    value={cyl.serialNumber}
                                    onChange={(e) => handleReceivedCylSerialChange(cyl.cylinderId, e.target.value)}
                                    className={`w-full font-mono text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all outline-none ${
                                      cyl.isRemoved
                                        ? 'line-through bg-slate-100 text-slate-400 border-slate-200'
                                        : isChanged
                                        ? 'border-amber-400 bg-amber-50/60 text-amber-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-2xs'
                                        : 'border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'
                                    }`}
                                    placeholder="Serial Number..."
                                  />
                                  {isChanged && (
                                    <button
                                      type="button"
                                      onClick={() => handleRevertReceivedCylSerial(cyl.cylinderId)}
                                      title={language === 'ms' ? `Kembalikan ke: ${cyl.originalSerial}` : `Revert to: ${cyl.originalSerial}`}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all shrink-0 cursor-pointer"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                {!cyl.itemId && (
                                  <div className="flex items-center gap-1.5 mt-1 pl-1">
                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      {language === 'ms' ? '+ Ditambah' : '+ Added'}
                                    </span>
                                    {cyl.cylinder && (
                                      <span className="text-[9px] font-semibold text-slate-500">
                                        ({language === 'ms' ? 'Dari Database' : 'From Database'})
                                      </span>
                                    )}
                                  </div>
                                )}
                                {cyl.itemId && isChanged && (
                                  <div className="flex items-center gap-1.5 mt-1 pl-1">
                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-100/80 text-amber-800 border border-amber-200">
                                      {language === 'ms' ? 'Diubah' : 'Modified'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {language === 'ms' ? 'Asal:' : 'Original:'} <span className="line-through">{cyl.originalSerial}</span>
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Badge and Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 max-w-[140px] truncate hidden sm:inline-block">
                                {cyl.typeName || 'Standard'}
                              </span>

                              {isFSize && !cyl.isRemoved && (
                                <button
                                  type="button"
                                  title={`Tukar jenis injap kepada ${isPI ? 'Bullnose (BN)' : 'Pin Index (PI)'}`}
                                  onClick={() => handleToggleReceivedCylValve(cyl.cylinderId)}
                                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border transition-all hover:scale-105 active:scale-95 shadow-2xs cursor-pointer ${
                                    isPI 
                                      ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' 
                                      : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                  }`}
                                >
                                  {isPI ? '➔ BN' : '➔ PI'}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleToggleRemoveReceivedCyl(cyl.cylinderId)}
                                title={cyl.isRemoved 
                                  ? (language === 'ms' ? 'Pulihkan silinder ini' : 'Restore this cylinder') 
                                  : (language === 'ms' ? 'Keluarkan silinder dari dokumen penerimaan' : 'Remove from receive document')}
                                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  cyl.isRemoved
                                    ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                                    : 'text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent'
                                }`}
                              >
                                {cyl.isRemoved ? (
                                  <RotateCcw className="w-3.5 h-3.5" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4 space-y-2">
                <label className="block text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Reason for Edit (Required for Audit Log)
                </label>
                <textarea
                  required
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full bg-white border border-amber-250 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-xl px-3 py-2 text-sm text-slate-800 transition-all duration-200 outline-none h-16 resize-none"
                  placeholder="Specify details or reason for editing this document..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !editReason.trim()}
                  className="px-5 py-2 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md transition-all duration-200"
                >
                  {isSaving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Delete Document Modal */}
      {isDeleteOpen && selectedDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Delete Document
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold font-mono">
                    {selectedDoc.document_number}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeleteConfirm} className="p-5 space-y-4">
              <div className="text-sm text-slate-600 font-medium leading-relaxed">
                Are you sure you want to permanently delete this {docType === 'returns' ? 'return' : 'request'} document? This action cannot be undone.
              </div>

              <div className="bg-red-50/50 border border-red-200/50 rounded-2xl p-4 space-y-2">
                <label className="block text-[11px] font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Reason for Deletion (Required for Audit Log)
                </label>
                <textarea
                  required
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full bg-white border border-red-250 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 rounded-xl px-3 py-2 text-sm text-slate-800 transition-all duration-200 outline-none h-20 resize-none"
                  placeholder="Specify the reason for deleting this document..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting || !deleteReason.trim()}
                  className="px-5 py-2 text-sm font-bold text-white bg-red-650 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md transition-all duration-200"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryOpen && selectedDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <HistoryIcon className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Document Audit History
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold font-mono">
                    {selectedDoc.document_number}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              {isLoadingHistory ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-450 font-bold">Loading audit logs...</span>
                </div>
              ) : historyLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm font-semibold">
                  No log history recorded for this document.
                </div>
              ) : (
                <div className="relative border-l border-slate-100 pl-6 space-y-6">
                  {historyLogs.map((log, idx) => {
                    const isEdit = log.action.includes('EDIT');
                    const isDelete = log.action.includes('DELETE');
                    const isCreate = log.action.includes('CREATE') || log.action === 'CREATE_DOCUMENT';

                    let actionLabel = 'Action Logged';
                    let badgeColor = 'bg-slate-50 text-slate-700 border-slate-100';
                    if (isEdit) {
                      actionLabel = 'Document Edited';
                      badgeColor = 'bg-amber-50 text-amber-700 border-amber-100';
                    } else if (isDelete) {
                      actionLabel = 'Document Deleted';
                      badgeColor = 'bg-red-50 text-red-700 border-red-100';
                    } else if (isCreate) {
                      actionLabel = 'Document Created';
                      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    }

                    const reasonText = log.new_values?.edit_reason || log.new_values?.delete_reason || log.new_values?.reason || log.remarks;

                    return (
                      <div key={log.id || idx} className="relative">
                        {/* Timeline dot */}
                        <span className={`absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full border-2 bg-white ${
                          isDelete ? 'border-red-500' : isEdit ? 'border-amber-500' : 'border-emerald-500'
                        }`} />
                        
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">
                              {log.user?.full_name || 'System / Officer'}
                            </span>
                            {log.user?.jawatan && (
                              <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                {log.user.jawatan}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-medium ml-auto">
                              {new Date(log.created_at).toLocaleString(undefined, {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                              {actionLabel}
                            </span>
                          </div>

                          {reasonText && (
                            <p className="text-xs text-slate-650 bg-slate-50 border border-slate-100 rounded-xl p-2.5 mt-1.5 leading-relaxed font-semibold italic">
                              &ldquo;{reasonText}&rdquo;
                            </p>
                          )}

                          {renderLogChanges(log)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end p-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="px-5 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

