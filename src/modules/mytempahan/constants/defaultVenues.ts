// src/modules/mytempahan/constants/defaultVenues.ts
// Master Venue Catalog & Initial Mock Seed for Hospital Lawas / MOH Facilities

import { Room, Booking } from '@/shared/types/mytempahan'

export const DEFAULT_HOSPITAL_ROOMS: Room[] = [
  {
    id: 'room-lawas-01',
    room_code: 'BM-KNGA-03',
    name: 'Main Conference Room Kenanga',
    category: 'meeting_room',
    capacity: 45,
    location: 'Level 3, Administration Block, Lawas Hospital',
    floor_level: 'Level 3',
    building_block: 'Administration Block',
    status: 'available',
    amenities: [
      'smart_tv',
      'video_conferencing',
      'pa_sound_system',
      'wireless_mic',
      'whiteboard',
      'wifi_kkm',
      'aircond',
      'vip_lounge',
      'podium'
    ],
    layouts: [
      { layout: 'boardroom', capacity: 35 },
      { layout: 'u_shape', capacity: 45 },
      { layout: 'hollow_square', capacity: 30 }
    ],
    operating_hours: {
      start: '07:30',
      end: '22:00',
      is24Hours: false,
      operatingDays: [0, 1, 2, 3, 4, 5, 6]
    },
    min_notice_hours: 2,
    max_advance_days: 180,
    setup_buffer_minutes: 15,
    cleanup_buffer_minutes: 15,
    requires_approval: true,
    pic: {
      name: 'Puan Noor Aishah binti Omar',
      phone: '016-3224178',
      email: 'aishah.omar@moh.gov.my',
      jawatan: 'Assistant Administrative Officer N29',
      department: 'Administration & Facilities Unit'
    },
    pic_user_id: 'user-admin-1',
    image_url: '/images/venues/room-kenanga.jpg',
    color_code: '#0284c7', // Sky Blue
    hospital_id: 'hosp-lawas',
    house_rules: [
      'Webex / Zoom Rooms terminals must be powered off after the session ends.',
      'Only covered beverages are permitted on the main conference table.',
      'Please return the key card to the administration counter upon completion.'
    ],
    is_active: true,
    created_at: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'room-lawas-02',
    room_code: 'DWN-KNYL-01',
    name: 'Main Multipurpose Hall (Kenyalang Hall)',
    category: 'conference_hall',
    capacity: 250,
    location: 'Ground Floor, Administration & Support Block',
    floor_level: 'Ground Floor',
    building_block: 'Administration Block',
    status: 'available',
    amenities: [
      'projector',
      'pa_sound_system',
      'wireless_mic',
      'video_conferencing',
      'vip_lounge',
      'podium',
      'recording_facility',
      'catering_space',
      'aircond',
      'wifi_kkm'
    ],
    layouts: [
      { layout: 'theatre', capacity: 250 },
      { layout: 'banquet', capacity: 160 },
      { layout: 'classroom', capacity: 120 },
      { layout: 'u_shape', capacity: 60 }
    ],
    operating_hours: {
      start: '07:00',
      end: '23:00',
      is24Hours: false,
      operatingDays: [0, 1, 2, 3, 4, 5, 6]
    },
    min_notice_hours: 4,
    max_advance_days: 180,
    setup_buffer_minutes: 30,
    cleanup_buffer_minutes: 45,
    requires_approval: true,
    pic: {
      name: 'En. Emung Rigi',
      phone: '019-4855640',
      email: 'emung.rigi@moh.gov.my',
      jawatan: 'General Operations Assistant',
      department: 'Administration & Assets Unit'
    },
    pic_user_id: 'user-admin-1',
    image_url: '/images/venues/room-kenyalang.jpg',
    color_code: '#c026d3', // Fuchsia
    hospital_id: 'hosp-lawas',
    house_rules: [
      'No open food or gravy is permitted on the main stage.',
      'Hall audio/PA systems must be operated in coordination with the technician on duty.',
      'Catering waste clearance must be completed within 45 minutes after the event.'
    ],
    is_active: true,
    created_at: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'room-lawas-03',
    room_code: 'BS-PHARM-01',
    name: 'Pharmacy Seminar & CPD Room',
    category: 'training_room',
    capacity: 40,
    location: 'Level 2, Pharmacy Logistics Complex',
    floor_level: 'Level 2',
    building_block: 'Pharmacy Complex',
    status: 'available',
    amenities: [
      'projector',
      'smart_tv',
      'whiteboard',
      'pa_sound_system',
      'wireless_mic',
      'wifi_kkm',
      'aircond',
      'flipchart',
      'catering_space'
    ],
    layouts: [
      { layout: 'classroom', capacity: 35 },
      { layout: 'theatre', capacity: 45 },
      { layout: 'cluster', capacity: 30 }
    ],
    operating_hours: {
      start: '08:00',
      end: '18:00',
      is24Hours: false,
      operatingDays: [1, 2, 3, 4, 5]
    },
    min_notice_hours: 1,
    max_advance_days: 90,
    setup_buffer_minutes: 15,
    cleanup_buffer_minutes: 20,
    requires_approval: false,
    pic: {
      name: 'En. Tan Yuan Zhang',
      phone: '016-3224178',
      email: 'hosplawas@gmail.com',
      jawatan: 'Head of Pharmacy (HOD UF52)',
      department: 'Pharmacy Department'
    },
    pic_user_id: 'user-pharm-1',
    image_url: '/images/venues/room-pharmacy-seminar.jpg',
    color_code: '#059669', // Emerald
    hospital_id: 'hosp-lawas',
    house_rules: [
      'Refreshment area is designated in the outer foyer of the seminar room.',
      'Please arrange tables and chairs back to standard classroom layout after use.'
    ],
    is_active: true,
    created_at: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'room-lawas-04',
    room_code: 'BL-ARG-BGB01',
    name: 'Emergency Operations Center (EOC / Crisis Room)',
    category: 'command_center',
    capacity: 20,
    location: 'Ground Floor, Adjacent to Emergency & Trauma Department',
    floor_level: 'Ground Floor',
    building_block: 'Emergency Block',
    status: 'available',
    amenities: [
      'video_conferencing',
      'smart_tv',
      'pa_sound_system',
      'wifi_kkm',
      'aircond',
      'backup_generator',
      'recording_facility',
      'whiteboard'
    ],
    layouts: [
      { layout: 'boardroom', capacity: 20 }
    ],
    operating_hours: {
      start: '00:00',
      end: '23:59',
      is24Hours: true,
      operatingDays: [0, 1, 2, 3, 4, 5, 6]
    },
    min_notice_hours: 0,
    max_advance_days: 365,
    setup_buffer_minutes: 10,
    cleanup_buffer_minutes: 10,
    requires_approval: true,
    pic: {
      name: 'Dr. On-Call Medical Officer (EOC)',
      phone: '085-284100',
      email: 'lawas.eoc@moh.gov.my',
      jawatan: 'Operations Room Coordinator',
      department: 'Emergency & Trauma Department'
    },
    pic_user_id: 'user-admin-1',
    image_url: '/images/venues/room-eoc-crisis.jpg',
    color_code: '#dc2626', // Red
    hospital_id: 'hosp-lawas',
    house_rules: [
      'Absolute priority given to operational disaster calls, epidemics, and district emergencies.',
      'Any non-emergency bookings are subject to immediate cancellation during a crisis.'
    ],
    is_active: true,
    created_at: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'room-lawas-05',
    room_code: 'LAB-IT-01',
    name: 'IT Training Computer Lab (EMR / HIS)',
    category: 'computer_lab',
    capacity: 28,
    location: 'Level 2, Information & Records Management Block',
    floor_level: 'Level 2',
    building_block: 'Academic & IT Block',
    status: 'available',
    amenities: [
      'smart_tv',
      'projector',
      'document_camera',
      'whiteboard',
      'wifi_kkm',
      'aircond',
      'pa_sound_system'
    ],
    layouts: [
      { layout: 'classroom', capacity: 28 }
    ],
    operating_hours: {
      start: '08:00',
      end: '17:30',
      is24Hours: false,
      operatingDays: [1, 2, 3, 4, 5]
    },
    min_notice_hours: 2,
    max_advance_days: 90,
    setup_buffer_minutes: 15,
    cleanup_buffer_minutes: 15,
    requires_approval: true,
    pic: {
      name: 'En. Amri Amit',
      phone: '011-1657713',
      email: 'amri.amit@yahoo.com',
      jawatan: 'Assistant Pharmacy Officer (IT Coordinator)',
      department: 'Information Systems & IT Unit'
    },
    pic_user_id: 'user-staff-amri',
    image_url: '/images/venues/room-it-lab.jpg',
    color_code: '#0891b2', // Cyan
    hospital_id: 'hosp-lawas',
    house_rules: [
      'Strictly no food or drinks permitted at computer workstations.',
      'Do not disconnect workstation power cords or LAN network cables.'
    ],
    is_active: true,
    created_at: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'room-lawas-06',
    room_code: 'BD-TRTI-01',
    name: 'Clinical Discussion & Counseling Room (Teratai Room)',
    category: 'discussion_room',
    capacity: 10,
    location: 'Level 1, Outpatient Department (OPD) Block',
    floor_level: 'Level 1',
    building_block: 'Clinical Block (OPD)',
    status: 'available',
    amenities: [
      'smart_tv',
      'whiteboard',
      'wifi_kkm',
      'aircond'
    ],
    layouts: [
      { layout: 'round_table', capacity: 10 },
      { layout: 'cluster', capacity: 8 }
    ],
    operating_hours: {
      start: '07:30',
      end: '21:00',
      is24Hours: false,
      operatingDays: [0, 1, 2, 3, 4, 5, 6]
    },
    min_notice_hours: 1,
    max_advance_days: 60,
    setup_buffer_minutes: 10,
    cleanup_buffer_minutes: 10,
    requires_approval: false,
    pic: {
      name: 'En. Mohamad Aiman bin Mat Zaki',
      phone: '017-2274015',
      email: 'aimanmz135@gmail.com',
      jawatan: 'Head of Pharmacy Logistics Unit UF9',
      department: 'Pharmacy Department'
    },
    pic_user_id: 'user-lead-logistik',
    image_url: '/images/venues/room-teratai.jpg',
    color_code: '#f59e0b', // Amber
    hospital_id: 'hosp-lawas',
    house_rules: [
      'Sound-dampened room for clinical case discussions and patient counseling.',
      'Please ensure the whiteboard is cleanly erased after meetings.'
    ],
    is_active: true,
    created_at: '2026-01-01T08:00:00.000Z'
  }
]

// Sample initial seed bookings
export const DEFAULT_BOOKINGS_SEED: Booking[] = [
  {
    id: 'bk-2026-0001',
    booking_number: 'TMP-2026-00001',
    room_id: 'room-lawas-03',
    user_id: 'user-hod-tyz',
    pemohon_name: 'Tan Yuan Zhang',
    pemohon_jawatan: 'Head of Pharmacy (HOD)',
    pemohon_department: 'Pharmacy Department',
    pemohon_email: 'hosplawas@gmail.com',
    pemohon_phone: '016-3224178',
    department_id: 'dept-pharmacy',
    purpose: 'High-Alert Medication & Antimicrobial Stewardship Workshop 2026',
    event_type: 'Training / Course',
    date: '2026-09-02',
    start_time: '08:30',
    end_time: '13:00',
    duration_hours: 4.5,
    attendees_count: 30,
    layout_type: 'classroom',
    requested_amenities: ['projector', 'smart_tv', 'pa_sound_system', 'wireless_mic', 'whiteboard', 'wifi_kkm', 'aircond'],
    peralatan_tambahan: [{ equipment_name: 'Presenter Laser Clicker', quantity: 2 }],
    tempahan_makanan: {
      diperlukan: true,
      jenis_hidangan: 'sarapan',
      pembekal_makanan: 'Lawas Hospital Cafeteria',
      anggaran_pax: 30,
      lokasi_hidang: 'Seminar Room Foyer Area'
    },
    tetamu_vip: { ada_vip: false },
    status: 'approved',
    priority: 'normal',
    approved_by: 'node-root-pengarah',
    approved_by_name: 'Lawas Hospital Director',
    approved_at: '2026-08-26T02:15:00.000Z',
    catatan_pelulus: 'Application approved. Please comply with facility cleanliness SOPs.',
    hospital_id: 'hosp-lawas',
    created_at: '2026-08-25T08:00:00.000Z',
    updated_at: '2026-08-26T02:15:00.000Z'
  },
  {
    id: 'bk-2026-0002',
    booking_number: 'TMP-2026-00002',
    room_id: 'room-lawas-02',
    user_id: 'user-lead-logistik',
    pemohon_name: 'Mohamad Aiman bin Mat Zaki',
    pemohon_jawatan: 'Head of Pharmacy Logistics Unit',
    pemohon_department: 'Pharmacy Department',
    pemohon_email: 'aimanmz135@gmail.com',
    pemohon_phone: '017-2274015',
    department_id: 'dept-pharmacy',
    purpose: 'Sarawak State Health Director Official Working Visit & Engagement Session',
    event_type: 'VIP Visit',
    date: '2026-09-08',
    start_time: '09:00',
    end_time: '16:00',
    duration_hours: 7.0,
    attendees_count: 140,
    layout_type: 'theatre',
    requested_amenities: [
      'projector',
      'pa_sound_system',
      'wireless_mic',
      'video_conferencing',
      'vip_lounge',
      'podium',
      'recording_facility',
      'catering_space',
      'wifi_kkm',
      'aircond'
    ],
    peralatan_tambahan: [{ equipment_name: 'Bunting Stands & Red Carpet', quantity: 4 }],
    tempahan_makanan: {
      diperlukan: true,
      jenis_hidangan: 'makan_tengahari',
      pembekal_makanan: 'State Health Department Official Catering',
      anggaran_pax: 140,
      lokasi_hidang: 'Kenyalang Hall Foyer'
    },
    tetamu_vip: {
      ada_vip: true,
      senarai_vip: ['YBhg. Sarawak State Health Director', 'Limbang Division Health Officer'],
      memerlukan_holding_room: true,
      holding_room_id: 'room-lawas-01',
      susunan_protokol_khas: 'Security protocol and VIP holding room prepared starting at 08:30 AM.'
    },
    status: 'pending',
    priority: 'vvip_event',
    hospital_id: 'hosp-lawas',
    created_at: '2026-08-29T10:30:00.000Z',
    updated_at: '2026-08-29T10:30:00.000Z'
  },
  {
    id: 'bk-2026-0003',
    booking_number: 'TMP-2026-00003',
    room_id: 'room-lawas-01',
    user_id: 'user-staff-amri',
    pemohon_name: 'Amri Amit',
    pemohon_jawatan: 'Assistant Pharmacy Officer (Logistics)',
    pemohon_department: 'Pharmacy Department',
    pemohon_email: 'amri.amit@yahoo.com',
    pemohon_phone: '011-1657713',
    department_id: 'dept-pharmacy',
    purpose: 'Dangerous Drugs (DDA) & Q3 Stock Review Audit Meeting',
    event_type: 'Official Meeting',
    date: '2026-08-28',
    start_time: '14:30',
    end_time: '16:30',
    duration_hours: 2.0,
    attendees_count: 14,
    layout_type: 'boardroom',
    requested_amenities: ['smart_tv', 'whiteboard', 'wifi_kkm', 'aircond'],
    tempahan_makanan: { diperlukan: false },
    tetamu_vip: { ada_vip: false },
    status: 'completed',
    priority: 'normal',
    approved_by: 'user-hod-tyz',
    approved_by_name: 'Tan Yuan Zhang',
    approved_at: '2026-08-21T01:00:00.000Z',
    check_in_at: '2026-08-28T06:25:00.000Z',
    check_out_at: '2026-08-28T08:35:00.000Z',
    hospital_id: 'hosp-lawas',
    created_at: '2026-08-20T03:00:00.000Z',
    updated_at: '2026-08-28T08:35:00.000Z'
  }
]

export const PUBLIC_HOLIDAYS_DATABASE: Record<string, { en: string; ms: string }> = {
  '2026-01-01': { en: "New Year's Day", ms: 'Tahun Baharu' },
  '2026-01-28': { en: 'Chinese New Year', ms: 'Tahun Baharu Cina' },
  '2026-01-29': { en: 'Chinese New Year (Day 2)', ms: 'Tahun Baharu Cina (Hari Ke-2)' },
  '2026-03-21': { en: 'Hari Raya Aidilfitri', ms: 'Hari Raya Aidilfitri' },
  '2026-03-22': { en: 'Hari Raya Aidilfitri (Day 2)', ms: 'Hari Raya Aidilfitri (Hari Ke-2)' },
  '2026-05-01': { en: 'Labour Day', ms: 'Hari Pekerja' },
  '2026-05-31': { en: 'Wesak Day', ms: 'Hari Wesak' },
  '2026-06-01': { en: 'Gawai Dayak Festival', ms: 'Hari Gawai Dayak (Sarawak)' },
  '2026-06-02': { en: 'Gawai Dayak Festival (Day 2)', ms: 'Hari Gawai Dayak (Hari Ke-2)' },
  '2026-06-08': { en: "Agong's Birthday", ms: 'Hari Keputeraan YDP Agong' },
  '2026-07-22': { en: 'Sarawak Independence Day', ms: 'Hari Kemerdekaan Sarawak' },
  '2026-08-31': { en: 'National Day (Merdeka)', ms: 'Hari Kebangsaan' },
  '2026-09-16': { en: 'Malaysia Day', ms: 'Hari Malaysia' },
  '2026-10-10': { en: "Sarawak Governor's Birthday", ms: 'Hari Jadi TYT Sarawak' },
  '2026-12-25': { en: 'Christmas Day', ms: 'Hari Krismas' }
}

export function getPublicHolidayName(dateStr: string, lang: 'en' | 'ms' = 'en'): string | undefined {
  const item = PUBLIC_HOLIDAYS_DATABASE[dateStr]
  if (!item) return undefined
  return item[lang] || item.en
}
