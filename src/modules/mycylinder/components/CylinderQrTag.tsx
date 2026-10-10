import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Printer } from 'lucide-react';
import { JATA_NEGARA_BASE64 } from '@/modules/mytransporter/pages/jataNegaraBase64';
import type { OxygenCylinderWithRelations } from '@/types/pharmacy';

export interface CylinderQrTagProps {
  cylinder: OxygenCylinderWithRelations | any;
  id?: string;
  className?: string;
  onPrint?: (id: string) => void;
  showPrintButton?: boolean;
}

/**
 * Resolves cylinder details strictly matching the official physical tag format:
 * - SIZE & VOL: P101-F / 1.4 m3
 * - VALVE TYPE: Bullnose / Pin Index
 * - SERIAL NO: P101-F-0108
 * - OWNERSHIP: (Private) ASSET REGISTRY / (Supplier) LOAN
 */
export function resolveCylinderTagDetails(cylinder: any) {
  const fullSerial = cylinder.serial_number || cylinder.qr_code || cylinder.qr_code_value || '';
  // Clean serial: strip "O2-" prefix if present (e.g. O2-P101-F-0108 -> P101-F-0108)
  const cleanSerial = fullSerial.replace(/^O2-/i, '') || fullSerial;
  
  // Full scannable QR payload
  const qrValue = cylinder.qr_code_value || cylinder.qr_code || fullSerial || 'O2-GEN';

  // Size code
  let sizeCode = cylinder.size_info?.code || '';
  if (!sizeCode) {
    const match = cleanSerial.match(/^([A-Z0-9]+-[A-Z0-9]+)/i);
    if (match) {
      sizeCode = match[1].toUpperCase();
    }
  }
  if (!sizeCode && cylinder.type_info?.type_name) {
    const match = cylinder.type_info.type_name.match(/(P?101-[A-Z0-9]+)/i);
    if (match) sizeCode = match[1].toUpperCase();
  }
  if (!sizeCode && (cleanSerial.toUpperCase().startsWith('SABOXY') || cleanSerial.toUpperCase().startsWith('SOX') || cleanSerial.toUpperCase().includes('SABOXY'))) {
    sizeCode = '101-N';
  }
  if (!sizeCode) sizeCode = 'P101-F';

  // Capacity / Volume
  let capacity = cylinder.size_info?.capacity ? String(cylinder.size_info.capacity) : '';
  if (!capacity && cylinder.type_info?.type_name) {
    const capMatch = cylinder.type_info.type_name.match(/([0-9.]+)\s*(?:M3|M³|m3|m³)/i);
    if (capMatch) capacity = capMatch[1];
  }
  if (!capacity) {
    if (sizeCode.includes('P101-D')) capacity = '0.5';
    else if (sizeCode.includes('P101-E')) capacity = '0.7';
    else if (sizeCode.includes('P101-F') || sizeCode.includes('101-F')) capacity = '1.4';
    else if (sizeCode.includes('P101-HS')) capacity = '6.4';
    else if (sizeCode.includes('101-N')) capacity = '8.0';
    else capacity = '1.4';
  }
  const numCap = parseFloat(capacity);
  const formattedCap = !isNaN(numCap) ? `${numCap} m3` : (capacity.includes('m3') ? capacity : `${capacity} m3`);

  // Valve Type
  let valveType = cylinder.type_info?.name || '';
  const typeCode = (cylinder.type_info?.code || '').toUpperCase();
  if (!valveType) {
    if (typeCode === 'BN' || cleanSerial.includes('BN') || (cylinder.type_info?.type_name || '').includes('BN')) {
      valveType = 'Bullnose';
    } else if (typeCode === 'PI' || cleanSerial.includes('PI') || (cylinder.type_info?.type_name || '').includes('PI')) {
      valveType = 'Pin Index';
    } else if (sizeCode.includes('P101-D') || sizeCode.includes('P101-E') || sizeCode.includes('101-F')) {
      valveType = 'Pin Index';
    } else {
      valveType = 'Bullnose';
    }
  }

  // Ownership
  const isLoan = cylinder.supplier_tagged === true || 
                 cylinder.size_info?.is_loan === true || 
                 sizeCode.startsWith('101-') || 
                 cleanSerial.startsWith('SABOXY');
  
  const ownership = isLoan ? '(Supplier) LOAN' : '(Private) ASSET REGISTRY';

  return {
    cleanSerial,
    qrValue,
    sizeCode,
    capacity: formattedCap,
    valveType,
    ownership,
    hospitalName: 'HOSPITAL LAWAS'
  };
}

export const CylinderQrTag: React.FC<CylinderQrTagProps> = ({
  cylinder,
  id,
  className = '',
  onPrint,
  showPrintButton = true,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const details = resolveCylinderTagDetails(cylinder);

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(details.qrValue, {
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#00000000', // transparent
      },
      width: 256,
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [details.qrValue]);

  const tagId = id || `sticker-${cylinder.id || cylinder.serial_number}`;

  return (
    <div
      id={tagId}
      className={`cylinder-qr-tag-container relative group select-none ${className}`}
      style={{
        backgroundColor: '#ffffff',
        padding: '5px',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '580px',
        height: '160px',
        display: 'flex',
        flexDirection: 'column',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {/* Individual Print Button Overlay */}
      {showPrintButton && onPrint && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 no-print-sticker-btn">
          <button
            onClick={() => onPrint(cylinder.id || tagId)}
            type="button"
            title="Print Label"
            className="p-1.5 bg-white/95 hover:bg-white border border-black/30 hover:border-black text-black rounded-lg shadow-md transition-all active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Inner Black Border Frame */}
      <div
        className="w-full h-full flex flex-col"
        style={{
          border: '1.5px solid #000000',
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Top Header Row */}
        <div
          className="w-full flex items-center"
          style={{
            height: '34px',
            borderBottom: '1.5px solid #000000',
            paddingLeft: '8px',
            paddingRight: '8px',
            gap: '8px',
            boxSizing: 'border-box',
          }}
        >
          {/* Jata Negara Coat of Arms */}
          <img
            src={JATA_NEGARA_BASE64}
            alt="Jata Negara"
            style={{
              height: '24px',
              width: 'auto',
              objectFit: 'contain',
              filter: 'grayscale(100%) contrast(160%)',
              flexShrink: 0,
            }}
          />

          {/* Header Text */}
          <div
            className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 800,
              fontSize: '11px',
              color: '#000000',
              letterSpacing: '0.2px',
              textTransform: 'uppercase',
            }}
          >
            <span>KEMENTERIAN KESIHATAN MALAYSIA</span>
            <span
              style={{
                display: 'inline-block',
                width: '1.5px',
                height: '11px',
                backgroundColor: '#000000',
                margin: '0 2px',
                flexShrink: 0,
              }}
            />
            <span>{details.hospitalName}</span>
          </div>
        </div>

        {/* Lower Main Content Row (QR Code + Data Table) */}
        <div className="w-full flex-1 flex" style={{ boxSizing: 'border-box', overflow: 'hidden' }}>
          {/* Left Column: QR Code Box */}
          <div
            className="flex items-center justify-center"
            style={{
              width: '125px',
              borderRight: '1.5px solid #000000',
              padding: '5px',
              boxSizing: 'border-box',
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: '100px',
                height: '100px',
                border: '1.2px solid #000000',
                borderRadius: '6px',
                padding: '4px',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
              }}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR ${details.qrValue}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    imageRendering: 'pixelated',
                  }}
                />
              ) : (
                <div className="w-full h-full animate-pulse bg-black/10 rounded" />
              )}
            </div>
          </div>

          {/* Right Column: 4 Data Rows */}
          <div
            className="flex-1 flex flex-col"
            style={{
              boxSizing: 'border-box',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            {/* Row 1: SIZE & VOL */}
            <div
              className="flex-1 flex items-center justify-between"
              style={{
                borderBottom: '1.2px solid #000000',
                paddingLeft: '12px',
                paddingRight: '12px',
                boxSizing: 'border-box',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#000000',
                  letterSpacing: '0.2px',
                  textTransform: 'uppercase',
                }}
              >
                SIZE &amp; VOL
              </span>
              <div
                className="flex items-baseline gap-1"
                style={{ color: '#000000' }}
              >
                <span
                  style={{
                    fontSize: '17px',
                    fontWeight: 900,
                    letterSpacing: '-0.2px',
                    lineHeight: 1,
                  }}
                >
                  {details.sizeCode}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  / {details.capacity}
                </span>
              </div>
            </div>

            {/* Row 2: VALVE TYPE */}
            <div
              className="flex-1 flex items-center justify-between"
              style={{
                borderBottom: '1.2px solid #000000',
                paddingLeft: '12px',
                paddingRight: '12px',
                boxSizing: 'border-box',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#000000',
                  letterSpacing: '0.2px',
                  textTransform: 'uppercase',
                }}
              >
                VALVE TYPE
              </span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: '#000000',
                  lineHeight: 1,
                }}
              >
                {details.valveType}
              </span>
            </div>

            {/* Row 3: SERIAL NO */}
            <div
              className="flex-1 flex items-center justify-between"
              style={{
                borderBottom: '1.2px solid #000000',
                paddingLeft: '12px',
                paddingRight: '12px',
                boxSizing: 'border-box',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#000000',
                  letterSpacing: '0.2px',
                  textTransform: 'uppercase',
                }}
              >
                SERIAL NO
              </span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: '#000000',
                  letterSpacing: '0.3px',
                  lineHeight: 1,
                }}
              >
                {details.cleanSerial}
              </span>
            </div>

            {/* Row 4: OWNERSHIP */}
            <div
              className="flex-1 flex items-center justify-between"
              style={{
                paddingLeft: '12px',
                paddingRight: '12px',
                boxSizing: 'border-box',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#000000',
                  letterSpacing: '0.2px',
                  textTransform: 'uppercase',
                }}
              >
                OWNERSHIP
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#000000',
                  letterSpacing: '0.2px',
                  lineHeight: 1,
                }}
              >
                {details.ownership}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CylinderQrTag;
