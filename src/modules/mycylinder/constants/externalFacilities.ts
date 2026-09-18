export interface ExternalFacility {
  name: string;
  district: string;
  state: 'Sabah' | 'Sarawak' | 'Wilayah Persekutuan Labuan' | 'Lain-lain';
  type: 'Hospital' | 'Klinik Kesihatan' | 'PKD' | 'Stor Integrasi' | 'Lain-lain';
  shortCode?: string;
}

export const COMMON_EXTERNAL_FACILITIES: ExternalFacility[] = [
  // Beaufort & Surrounding Sabah Hospitals
  { name: 'Hospital Beaufort', district: 'Beaufort', state: 'Sabah', type: 'Hospital', shortCode: 'HBF' },
  { name: 'Hospital Sipitang', district: 'Sipitang', state: 'Sabah', type: 'Hospital', shortCode: 'HSPT' },
  { name: 'Hospital Kuala Penyu', district: 'Kuala Penyu', state: 'Sabah', type: 'Hospital', shortCode: 'HKP' },
  { name: 'Hospital Papar', district: 'Papar', state: 'Sabah', type: 'Hospital', shortCode: 'HPR' },
  { name: 'Hospital Queen Elizabeth (HQE I)', district: 'Kota Kinabalu', state: 'Sabah', type: 'Hospital', shortCode: 'HQE1' },
  { name: 'Hospital Queen Elizabeth II (HQE II)', district: 'Kota Kinabalu', state: 'Sabah', type: 'Hospital', shortCode: 'HQE2' },
  { name: 'Hospital Wanita dan Kanak-Kanak Sabah (Likas)', district: 'Kota Kinabalu', state: 'Sabah', type: 'Hospital', shortCode: 'HWKKS' },
  { name: 'Hospital Keningau', district: 'Keningau', state: 'Sabah', type: 'Hospital', shortCode: 'HKNG' },
  { name: 'Hospital Tenom', district: 'Tenom', state: 'Sabah', type: 'Hospital', shortCode: 'HTNM' },
  { name: 'Hospital Tambunan', district: 'Tambunan', state: 'Sabah', type: 'Hospital', shortCode: 'HTBN' },
  { name: 'Hospital Tuaran', district: 'Tuaran', state: 'Sabah', type: 'Hospital', shortCode: 'HTRN' },
  { name: 'Hospital Kota Belud', district: 'Kota Belud', state: 'Sabah', type: 'Hospital', shortCode: 'HKB' },
  { name: 'Hospital Kota Marudu', district: 'Kota Marudu', state: 'Sabah', type: 'Hospital', shortCode: 'HKM' },
  { name: 'Hospital Kudat', district: 'Kudat', state: 'Sabah', type: 'Hospital', shortCode: 'HKDT' },
  { name: 'Hospital Duchess of Kent (Sandakan)', district: 'Sandakan', state: 'Sabah', type: 'Hospital', shortCode: 'HDOK' },
  { name: 'Hospital Tawau', district: 'Tawau', state: 'Sabah', type: 'Hospital', shortCode: 'HTWU' },
  { name: 'Hospital Lahad Datu', district: 'Lahad Datu', state: 'Sabah', type: 'Hospital', shortCode: 'HLD' },
  { name: 'Hospital Labuan', district: 'Labuan', state: 'Wilayah Persekutuan Labuan', type: 'Hospital', shortCode: 'HLBN' },

  // Sarawak Northern Hospitals
  { name: 'Hospital Limbang', district: 'Limbang', state: 'Sarawak', type: 'Hospital', shortCode: 'HLMB' },
  { name: 'Hospital Miri', district: 'Miri', state: 'Sarawak', type: 'Hospital', shortCode: 'HMRI' },
  { name: 'Hospital Bintulu', district: 'Bintulu', state: 'Sarawak', type: 'Hospital', shortCode: 'HBTU' },
  { name: 'Hospital Sibu', district: 'Sibu', state: 'Sarawak', type: 'Hospital', shortCode: 'HSBU' },
  { name: 'Hospital Sarikei', district: 'Sarikei', state: 'Sarawak', type: 'Hospital', shortCode: 'HSRK' },
  { name: 'Hospital Kapit', district: 'Kapit', state: 'Sarawak', type: 'Hospital', shortCode: 'HKPT' },
  { name: 'Hospital Umum Sarawak (HUS Kuching)', district: 'Kuching', state: 'Sarawak', type: 'Hospital', shortCode: 'HUS' },

  // District Health Offices & Health Clinics (Sabah & Sarawak)
  { name: 'Pejabat Kesihatan Daerah Beaufort (PKD Beaufort)', district: 'Beaufort', state: 'Sabah', type: 'PKD' },
  { name: 'Klinik Kesihatan Beaufort', district: 'Beaufort', state: 'Sabah', type: 'Klinik Kesihatan' },
  { name: 'Klinik Kesihatan Membakut', district: 'Beaufort', state: 'Sabah', type: 'Klinik Kesihatan' },
  { name: 'Pejabat Kesihatan Daerah Sipitang (PKD Sipitang)', district: 'Sipitang', state: 'Sabah', type: 'PKD' },
  { name: 'Klinik Kesihatan Sipitang', district: 'Sipitang', state: 'Sabah', type: 'Klinik Kesihatan' },
  { name: 'Pejabat Kesihatan Daerah Lawas (PKD Lawas)', district: 'Lawas', state: 'Sarawak', type: 'PKD' },
  { name: 'Klinik Kesihatan Lawas', district: 'Lawas', state: 'Sarawak', type: 'Klinik Kesihatan' },
  { name: 'Klinik Kesihatan Sundar', district: 'Lawas', state: 'Sarawak', type: 'Klinik Kesihatan' },
  { name: 'Klinik Kesihatan Merapok', district: 'Lawas', state: 'Sarawak', type: 'Klinik Kesihatan' },
  { name: 'Klinik Kesihatan Kuala Lawas', district: 'Lawas', state: 'Sarawak', type: 'Klinik Kesihatan' },
  { name: 'Pejabat Kesihatan Daerah Limbang (PKD Limbang)', district: 'Limbang', state: 'Sarawak', type: 'PKD' },
  { name: 'Klinik Kesihatan Batu Danau', district: 'Limbang', state: 'Sarawak', type: 'Klinik Kesihatan' },
  { name: 'Klinik Kesihatan Medamit', district: 'Limbang', state: 'Sarawak', type: 'Klinik Kesihatan' },
  { name: 'Stor Integrasi KKM Sabah (Kota Kinabalu)', district: 'Kota Kinabalu', state: 'Sabah', type: 'Stor Integrasi' },
];
