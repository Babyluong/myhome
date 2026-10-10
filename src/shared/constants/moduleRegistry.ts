/**
 * Central Module Registry for H.O.M.E. (Hospital Operation & Management Ecosystem)
 * Defines all system modules, sub-features, granular action capabilities, and role presets.
 * Designed to be future-proof: any new module added here will automatically appear in RBAC matrices and access controls.
 */

export type ActionType = 'view' | 'create' | 'edit' | 'approve' | 'delete' | 'export' | 'admin'

export interface ModuleFeatureDef {
  code: string
  name: string
  description: string
  supportedActions: ActionType[]
}

export interface ModuleDefinition {
  code: string
  name: string
  officialName: string
  category: 'clinical' | 'pharmacy' | 'logistics' | 'facility' | 'administrative' | 'support'
  routePath: string
  iconName: string
  description: string
  features: ModuleFeatureDef[]
  defaultRoles: string[]
  isCore?: boolean
}

export const ACTION_DEFINITIONS: Record<ActionType, { label: string; description: string; icon: string }> = {
  view: {
    label: 'View',
    description: 'View dashboard, transaction records, and information lists',
    icon: 'Eye',
  },
  create: {
    label: 'Create',
    description: 'Create new records, orders, requests, or registrations',
    icon: 'PlusCircle',
  },
  edit: {
    label: 'Edit',
    description: 'Modify existing records or update statuses',
    icon: 'Edit3',
  },
  approve: {
    label: 'Approve',
    description: 'Provide authorization, approve requests, indents, or allocations',
    icon: 'CheckCircle2',
  },
  delete: {
    label: 'Delete',
    description: 'Delete records or void entered transactions',
    icon: 'Trash2',
  },
  export: {
    label: 'Export',
    description: 'Download official ledgers (KEW.PS-4), PDF reports, and Excel data',
    icon: 'Download',
  },
  admin: {
    label: 'Admin',
    description: 'Configure module settings, quota limits, and system parameters',
    icon: 'Settings',
  },
}

export const SYSTEM_MODULE_REGISTRY: ModuleDefinition[] = [
  {
    code: 'pharmacy_logistics',
    name: 'MyWarrant',
    officialName: 'Pharmacy Warrant & Procurement Management',
    category: 'pharmacy',
    routePath: '/pharmacy/dashboard',
    iconName: 'Banknote',
    description: 'Management of MOH warrants, operating budget, LPO procurement, and pharmacy expenditure monitoring.',
    defaultRoles: ['system_admin', 'hospital_admin', 'hospital_administrator', 'hospital_director', 'pharmacy_director', 'pharmacy_manager', 'pharmacist', 'pharmacy_assistant', 'assistant_pharmacist', 'procurement_officer', 'budget_officer', 'inventory_manager'],
    features: [
      {
        code: 'warrant_allocation',
        name: 'Warrant & Vote Allocation',
        description: 'Management of government warrant funds by activity code and vote.',
        supportedActions: ['view', 'create', 'edit', 'approve', 'delete', 'export', 'admin'],
      },
      {
        code: 'lpo_procurement',
        name: 'Local Purchase Order (LPO)',
        description: 'LPO generation, order tracking, and payment voucher processing.',
        supportedActions: ['view', 'create', 'edit', 'approve', 'delete', 'export'],
      },
      {
        code: 'supplier_contracts',
        name: 'Supplier Contracts & Penalties',
        description: 'Supplier performance evaluation, delay penalty clauses, and LOU records.',
        supportedActions: ['view', 'create', 'edit', 'approve', 'delete', 'export'],
      },
      {
        code: 'financial_reports',
        name: 'Financial & APPL Reports',
        description: 'Generation of financial commitment reports, vote balances, and budget projections.',
        supportedActions: ['view', 'export'],
      },
    ],
  },
  {
    code: 'inventory',
    name: 'MyInventory',
    officialName: 'Inventory & Stock Logistics Management',
    category: 'pharmacy',
    routePath: '/pharmacy/inventory',
    iconName: 'Package',
    description: 'Management of drug & non-drug stock, KEW.PS-4 ledgers, ward indents, and stock verification.',
    defaultRoles: ['system_admin', 'hospital_admin', 'hospital_administrator', 'hospital_director', 'pharmacy_director', 'pharmacy_manager', 'pharmacist', 'pharmacy_assistant', 'assistant_pharmacist', 'pharmacy_storekeeper', 'pharmacy_staff', 'procurement_officer', 'inventory_manager'],
    features: [
      {
        code: 'stock_catalog',
        name: 'Drug & Non-Drug Catalogue',
        description: 'Registration of stock items, min/max stock levels, and shelf locations.',
        supportedActions: ['view', 'create', 'edit', 'delete', 'export'],
      },
      {
        code: 'stock_distribution',
        name: 'Ward Distribution & Indents',
        description: 'Receipt and processing of medication indent requests from wards and clinical units.',
        supportedActions: ['view', 'create', 'edit', 'approve', 'delete', 'export'],
      },
      {
        code: 'kewps4_ledger',
        name: 'KEW.PS-4 Stock Ledger',
        description: 'Official government stock control ledger and item movement audit trail.',
        supportedActions: ['view', 'create', 'edit', 'export'],
      },
      {
        code: 'stock_expiry_analysis',
        name: 'Expiry Analysis & Verification',
        description: 'Monitoring near-expiry items, slow-moving stock, and write-offs.',
        supportedActions: ['view', 'edit', 'approve', 'export'],
      },
    ],
  },
  {
    code: 'cylinder',
    name: 'MyCylinder',
    officialName: 'Medical Oxygen Cylinder Management',
    category: 'pharmacy',
    routePath: '/pharmacy/oxygen',
    iconName: 'Wind',
    description: 'Medical oxygen cylinder tracking, ward movement records, QR scanning, and tank safety compliance.',
    defaultRoles: ['system_admin', 'hospital_admin', 'hospital_administrator', 'hospital_director', 'pharmacy_director', 'pharmacy_manager', 'pharmacist', 'pharmacy_assistant', 'assistant_pharmacist', 'pharmacy_storekeeper', 'pharmacy_staff', 'nurse', 'sister', 'matron', 'assistant_medical_officer', 'senior_assistant_medical_officer', 'doctor', 'medical_officer', 'inventory_manager', 'staff'],
    features: [
      {
        code: 'cylinder_tracking',
        name: 'Cylinder Inventory & Tracking',
        description: 'Registration of tank serial numbers, cylinder size monitoring, and full/empty status.',
        supportedActions: ['view', 'create', 'edit', 'export'],
      },
      {
        code: 'cylinder_dispatch',
        name: 'Gas Dispatch & Issuance',
        description: 'Requests for oxygen cylinder replacement to wards and emergency zones.',
        supportedActions: ['view', 'create', 'edit', 'approve', 'export'],
      },
      {
        code: 'cylinder_maintenance',
        name: 'Maintenance & Hydrostatic Testing',
        description: 'Tank safety test schedules, supplier quality certificates, and tank returns.',
        supportedActions: ['view', 'create', 'edit', 'approve', 'delete', 'export'],
      },
    ],
  },
  {
    code: 'mysuhu',
    name: 'MySuhu',
    officialName: 'Cold Chain Temperature Monitoring',
    category: 'facility',
    routePath: '/suhu/dashboard',
    iconName: 'Thermometer',
    description: 'IoT monitoring of pharmacy refrigerators, temperature breach alerts, and corrective action workflows.',
    defaultRoles: ['system_admin', 'hospital_admin', 'hospital_administrator', 'hospital_director', 'pharmacy_director', 'pharmacy_manager', 'pharmacist', 'pharmacy_assistant', 'assistant_pharmacist', 'nurse', 'sister', 'matron', 'assistant_medical_officer', 'senior_assistant_medical_officer', 'medical_lab_technician', 'pathologist'],
    features: [
      {
        code: 'temperature_logging',
        name: 'IoT Temperature Logging & Charts',
        description: 'Daily recording and monitoring of vaccine and medication refrigerator temperatures.',
        supportedActions: ['view', 'create', 'edit', 'export'],
      },
      {
        code: 'breach_management',
        name: 'Breach Logs & CAPA',
        description: 'Management of excursions outside standard temperature range (+2°C to +8°C).',
        supportedActions: ['view', 'create', 'edit', 'approve', 'export'],
      },
      {
        code: 'unit_configuration',
        name: 'Threshold Settings & Sensor Locations',
        description: 'Setting min/max temperature limits and managing refrigerator sensor locations.',
        supportedActions: ['view', 'create', 'edit', 'delete', 'admin'],
      },
    ],
  },
  {
    code: 'myformulari',
    name: 'MyFormulari',
    officialName: 'Hospital Formulary & Clinical Reference',
    category: 'clinical',
    routePath: '/formulari/dashboard',
    iconName: 'BookOpen',
    description: 'Hospital drug formulary catalogue, high-alert medications (HAM), LASA registry, and dilution protocols.',
    defaultRoles: ['system_admin', 'hospital_admin', 'hospital_administrator', 'hospital_director', 'pharmacy_director', 'pharmacy_manager', 'pharmacist', 'pharmacy_assistant', 'assistant_pharmacist', 'doctor', 'medical_officer', 'nurse', 'sister', 'matron', 'assistant_medical_officer', 'senior_assistant_medical_officer', 'pathologist', 'staff'],
    features: [
      {
        code: 'formulari_catalog',
        name: 'Formulary Catalogue & Indications',
        description: 'Generic search, prescription category (A, A*, B, C), and clinical restrictions.',
        supportedActions: ['view', 'create', 'edit', 'export', 'admin'],
      },
      {
        code: 'ham_lasa_registry',
        name: 'HAM & LASA / TALL-man Registry',
        description: 'High-alert medication safety protocols and look-alike sound-alike drug lists.',
        supportedActions: ['view', 'create', 'edit', 'delete', 'export'],
      },
      {
        code: 'dilution_protocols',
        name: 'IV Dilution Protocols & Guidelines',
        description: 'Injection dosage dilution guides and national antimicrobial guidelines.',
        supportedActions: ['view', 'create', 'edit', 'export'],
      },
      {
        code: 'hospital_lawas_formulary',
        name: 'Hospital Lawas Formulary',
        description: 'Official Lawas Hospital drug formulary database — categorized by Eye Drops, Ear Drops, Insulin, MDI, Anticoagulants, and clinical classes.',
        supportedActions: ['view', 'export'],
      },
    ],
  },
  {
    code: 'myperolehan',
    name: 'MyPerolehan',
    officialName: 'Hospital Procurement & Development System',
    category: 'administrative',
    routePath: '/perolehan/dashboard',
    iconName: 'ShoppingBag',
    description: 'Management of non-drug procurement, development expenditures (P), and administrative supplies.',
    defaultRoles: ['system_admin', 'hospital_admin', 'hospital_administrator', 'hospital_director', 'procurement_officer', 'budget_officer', 'department_head', 'inventory_manager', 'staff'],
    features: [
      {
        code: 'pengurusan_budget',
        name: 'Operating Budget (B21, B24, B27)',
        description: 'Monitoring of services, rentals, office supplies, and raw materials votes.',
        supportedActions: ['view', 'create', 'edit', 'approve', 'delete', 'export', 'admin'],
      },
      {
        code: 'pembangunan_budget',
        name: 'Development Budget (Special Projects)',
        description: 'Capital asset procurement allocations and facility development projects.',
        supportedActions: ['view', 'create', 'edit', 'approve', 'delete', 'export'],
      },
      {
        code: 'order_payment_tracking',
        name: 'Orders & Payment Invoicing',
        description: 'Management of goods receipt notes, debit/credit notes, and payment disbursement records.',
        supportedActions: ['view', 'create', 'edit', 'approve', 'export'],
      },
    ],
  },
  {
    code: 'mytransporter',
    name: 'MyTransporter',
    officialName: 'Vehicle Fleet Logistics & Patient Transport',
    category: 'logistics',
    routePath: '/transporter/dashboard',
    iconName: 'Truck',
    description: 'Official hospital vehicle bookings, ambulance dispatch, vehicle inspections, and driver scheduling.',
    defaultRoles: ['system_admin', 'hospital_admin', 'hospital_administrator', 'hospital_director', 'transport_admin', 'transport_driver', 'hospital_driver', 'staff', 'nurse', 'sister', 'matron', 'assistant_medical_officer', 'senior_assistant_medical_officer', 'doctor', 'medical_officer', 'general_service_assistant'],
    features: [
      {
        code: 'transport_booking',
        name: 'Vehicle Requests & Bookings',
        description: 'Official vehicle requisition forms, patient referrals, and external official duties.',
        supportedActions: ['view', 'create', 'edit', 'approve', 'delete', 'export'],
      },
      {
        code: 'fleet_management',
        name: 'Vehicle Registry & Maintenance',
        description: 'Departmental fleet records, service schedules, road tax renewals, and defect reporting.',
        supportedActions: ['view', 'create', 'edit', 'approve', 'delete', 'admin'],
      },
      {
        code: 'driver_panel',
        name: 'Driver Panel & Pre-Trip Inspection',
        description: 'Daily vehicle pre-trip checklist, mileage logging, and trip completion sign-offs.',
        supportedActions: ['view', 'create', 'edit', 'export'],
      },
    ],
  },
  {
    code: 'mykunci',
    name: 'MyKunci',
    officialName: 'Physical Key Management & Security Control',
    category: 'facility',
    routePath: '/kunci/dashboard',
    iconName: 'Key',
    description: 'Master key registry, checkout/return logs, and security seal envelope integrity audits.',
    defaultRoles: ['system_admin', 'hospital_admin', 'hospital_administrator', 'hospital_director', 'staff', 'nurse', 'sister', 'matron', 'assistant_medical_officer', 'senior_assistant_medical_officer', 'pharmacist', 'physiotherapist', 'radiographer', 'medical_lab_technician', 'occupational_therapist', 'pathologist', 'general_service_assistant'],
    features: [
      {
        code: 'key_registry',
        name: 'Department Master Key Registry',
        description: 'Key code registration, room location, security category, and key custodian.',
        supportedActions: ['view', 'create', 'edit', 'delete', 'export'],
      },
      {
        code: 'key_movement_log',
        name: 'Key Checkout & Return Log',
        description: 'Logging checkout/return timestamps, borrower identity, and access purpose.',
        supportedActions: ['view', 'create', 'edit', 'export'],
      },
      {
        code: 'key_monthly_audit',
        name: 'Monthly Audit & Seal Inspection',
        description: 'Physical verification of key counts and security seal envelope integrity.',
        supportedActions: ['view', 'create', 'edit', 'approve', 'export'],
      },
    ],
  },
  {
    code: 'mystaff',
    name: 'MyStaff',
    officialName: 'Staff Operations, Movement & Rostering',
    category: 'support',
    routePath: '/staff/dashboard',
    iconName: 'Users',
    description: 'Daily staff movement logs, departmental leave calendar, on-call rostering, and organizational chart.',
    defaultRoles: ['system_admin', 'hospital_admin', 'hospital_administrator', 'hospital_director', 'staff', 'nurse', 'sister', 'matron', 'doctor', 'medical_officer', 'assistant_medical_officer', 'senior_assistant_medical_officer', 'pharmacist', 'assistant_pharmacist', 'pharmacy_staff', 'physiotherapist', 'radiographer', 'medical_lab_technician', 'occupational_therapist', 'pathologist', 'procurement_officer', 'budget_officer', 'inventory_manager', 'general_service_assistant', 'hospital_driver', 'department_head'],
    features: [
      {
        code: 'staff_movement',
        name: 'Duty Movement & External Tasks',
        description: 'Logging attendance for training, external meetings, roving duties, and clinical rounds.',
        supportedActions: ['view', 'create', 'edit', 'export'],
      },
      {
        code: 'staff_leave_calendar',
        name: 'Department Leave Calendar',
        description: 'Visual schedule of annual leave, emergency leave, and shift coverage planning.',
        supportedActions: ['view', 'create', 'edit', 'approve', 'export'],
      },
      {
        code: 'org_chart_management',
        name: 'Organizational Chart & HOD Roles',
        description: 'Hospital department hierarchy structure and head-of-department assignments.',
        supportedActions: ['view', 'create', 'edit', 'delete', 'admin'],
      },
    ],
  },
  {
    code: 'mycrossborder',
    name: 'MyCrossBorder',
    officialName: 'Cross-Border Patient Escort & Referral',
    category: 'clinical',
    routePath: '/crossborder/dashboard',
    iconName: 'PlaneTakeoff',
    description: 'Cross-border medical transit permits, referral patient records, and clinical escort assignments.',
    defaultRoles: ['system_admin', 'hospital_admin', 'hospital_administrator', 'hospital_director', 'doctor', 'medical_officer', 'nurse', 'sister', 'matron', 'assistant_medical_officer', 'senior_assistant_medical_officer'],
    features: [
      {
        code: 'permit_application',
        name: 'Cross-Border Permit Application',
        description: 'Official transit document issuance for inter-district/cross-border patient conveyance.',
        supportedActions: ['view', 'create', 'edit', 'approve', 'delete', 'export'],
      },
      {
        code: 'escort_assignment',
        name: 'Medical Escort Team',
        description: 'Assignment of medical officers, nurses, and medical assistants for critical patient escorts.',
        supportedActions: ['view', 'create', 'edit', 'export'],
      },
    ],
  },
  {
    code: 'myphis',
    name: 'MyPHiS',
    officialName: 'PHiS Backup Support System',
    category: 'support',
    routePath: '/hub/myphis',
    iconName: 'Server',
    description: 'Hospital PHiS server backup tape/disk rotation logs and integration status tracking.',
    defaultRoles: ['system_admin', 'hospital_admin', 'hospital_administrator', 'hospital_director', 'pharmacy_director', 'pharmacy_manager', 'pharmacist', 'pharmacy_assistant', 'assistant_pharmacist'],
    features: [
      {
        code: 'backup_disk_rotation',
        name: 'Daily Backup Disk Rotation',
        description: 'Recommendation and sign-off for daily hospital PHiS server backup disk swap.',
        supportedActions: ['view', 'create', 'edit', 'export'],
      },
    ],
  },
  {
    code: 'mymsds',
    name: 'MyMSDS',
    officialName: 'Chemical Safety Data Sheets (MSDS / SDS)',
    category: 'support',
    routePath: '/hub/mymsds',
    iconName: 'FileText',
    description: 'Safety data sheet repository (MSDS/CSDS) and hazardous spill emergency response procedures.',
    defaultRoles: ['system_admin', 'hospital_admin', 'hospital_administrator', 'hospital_director', 'pharmacist', 'pharmacy_assistant', 'assistant_pharmacist', 'nurse', 'sister', 'matron', 'assistant_medical_officer', 'senior_assistant_medical_officer', 'doctor', 'medical_officer', 'medical_lab_technician', 'pathologist', 'physiotherapist', 'radiographer', 'staff'],
    features: [
      {
        code: 'msds_directory',
        name: 'MSDS / SDS Directory',
        description: 'Quick search for hazardous chemicals, hazard pictograms, and first-aid measures.',
        supportedActions: ['view', 'create', 'edit', 'export'],
      },
    ],
  },
  {
    code: 'mytempahan',
    name: 'MyTempahan',
    officialName: 'Hospital Venue & Facility Booking System',
    category: 'facility',
    routePath: '/tempahan',
    iconName: 'CalendarDays',
    description: 'Meeting room, seminar hall, auditorium, and hospital AV equipment reservation management.',
    defaultRoles: ['system_admin', 'hospital_admin', 'hospital_administrator', 'hospital_director', 'staff', 'nurse', 'sister', 'matron', 'doctor', 'medical_officer', 'assistant_medical_officer', 'senior_assistant_medical_officer', 'pharmacist', 'assistant_pharmacist', 'physiotherapist', 'radiographer', 'medical_lab_technician', 'occupational_therapist', 'pathologist', 'procurement_officer', 'budget_officer', 'department_head'],
    features: [
      {
        code: 'venue_booking',
        name: 'Room Requisition & Booking',
        description: 'Facility reservation request form, availability check, and equipment requirement verification.',
        supportedActions: ['view', 'create', 'edit', 'delete', 'export'],
      },
      {
        code: 'booking_approval',
        name: 'Booking Review & Approvals',
        description: 'Facility administrator approval panel, schedule conflict resolution, and alternative room proposals.',
        supportedActions: ['view', 'approve', 'edit', 'export'],
      },
      {
        code: 'room_registry',
        name: 'Facility & Room Directory',
        description: 'Facility room registration, capacity updates, and maintenance status configuration.',
        supportedActions: ['view', 'create', 'edit', 'delete', 'admin'],
      },
      {
        code: 'utilization_reports',
        name: 'Facility Utilization Reports',
        description: 'Analysis of room utilization rates, peak hours, and official ledger exports.',
        supportedActions: ['view', 'export'],
      },
    ],
  },
  {
    code: 'admin',
    name: 'MyAdmin',
    officialName: 'System Administration & Command Center',
    category: 'administrative',
    routePath: '/hub/admin',
    iconName: 'ShieldAlert',
    description: 'Central security management, staff account provisioning, RBAC matrix, and audit logging.',
    defaultRoles: ['system_admin', 'hospital_admin', 'hospital_administrator', 'hospital_director'],
    isCore: true,
    features: [
      {
        code: 'user_management',
        name: 'User Management & Account Status',
        description: 'Provisioning, personal profile updates, and activating/suspending staff accounts.',
        supportedActions: ['view', 'create', 'edit', 'delete', 'export', 'admin'],
      },
      {
        code: 'access_approvals',
        name: 'Staff Registration Approvals',
        description: 'Verification of new staff registration requests and initial role assignment.',
        supportedActions: ['view', 'approve', 'delete', 'export'],
      },
      {
        code: 'rbac_matrix',
        name: 'Access Control & Permission Matrix (RBAC)',
        description: 'Configuring role permission toggles, granular action authorizations, and module access rights.',
        supportedActions: ['view', 'edit', 'export', 'admin'],
      },
      {
        code: 'department_monitoring',
        name: 'Department Structure Monitoring',
        description: 'Managing departmental structure, assigning Heads of Department (HOD), and staff distribution.',
        supportedActions: ['view', 'create', 'edit', 'delete', 'export'],
      },
      {
        code: 'audit_logs',
        name: 'Security Audit Trail & System Logs',
        description: 'Permanent log of administrative actions, authentication attempts, and data updates.',
        supportedActions: ['view', 'export'],
      },
    ],
  },
]

/**
 * Standard Role Capability Presets for Quick Configuration in RBAC Matrix
 */
export const ROLE_CAPABILITY_PRESETS: Record<string, { label: string; description: string; actions: ActionType[] }> = {
  read_only: {
    label: 'Read-Only',
    description: 'View dashboards and record lists without data modification rights.',
    actions: ['view'],
  },
  operator: {
    label: 'Operator',
    description: 'View, create new records, and update own assigned task details.',
    actions: ['view', 'create', 'edit'],
  },
  supervisor: {
    label: 'Supervisor / HOD',
    description: 'View, create, update, export reports, and approve documents.',
    actions: ['view', 'create', 'edit', 'approve', 'export'],
  },
  manager: {
    label: 'Manager / Approver',
    description: 'Full management authority including financial approvals, ledger exports, and record voiding.',
    actions: ['view', 'create', 'edit', 'approve', 'delete', 'export'],
  },
  full_admin: {
    label: 'Full Admin',
    description: 'Full unrestricted administrative access including module parameter configuration and system administration.',
    actions: ['view', 'create', 'edit', 'approve', 'delete', 'export', 'admin'],
  },
}
