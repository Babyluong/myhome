// @ts-nocheck
import React, { useState } from 'react';
import { 
  Search, 
  ShieldAlert, 
  Package, 
  Clock, 
  Layers,
  Info,
  X
} from 'lucide-react';

interface CylinderDetail {
  id: string;
  serial_number: string;
  qr_code: string;
  display_name: string;
  status: string;
  updated_at: string;
}

interface RequestItem {
  size_code: string;
  quantity: number;
  quantity_issued: number;
}

interface RequestDetail {
  id: string;
  request_number: string;
  status: string;
  created_at: string;
  items: RequestItem[];
}

interface DepartmentDistribution {
  department_id: string;
  department_name: string;
  in_use: number;
  available: number;
  total: number;
  status: 'OK' | 'Low' | 'Critical';
  cylinders: CylinderDetail[];
  requests?: RequestDetail[];
}

interface UnitDistributionTableProps {
  data: DepartmentDistribution[];
}

export const UnitDistributionTable: React.FC<UnitDistributionTableProps> = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagDetails, setSelectedTagDetails] = useState<{
    deptId: string;
    deptName: string;
    type: string;
    cylinders: CylinderDetail[];
  } | null>(null);

  // Helper to determine if a cylinder type is a "Personal Cylinder" (hospital asset)
  

  // Helper to normalize cylinder type names for clean columns
  const getNormalizedType = (name: string) => {
    if (name.includes('101-N')) return '101-N';
    if (name.includes('P101-D')) return 'P101-D';
    if (name.includes('P101-E')) return 'P101-E';
    if (name.includes('P101-F')) {
      if (name.includes('PI')) return 'P101-F PI';
      if (name.includes('BN')) return 'P101-F BN';
      return 'P101-F';
    }
    if (name.includes('P101-HS')) return 'P101-HS';
    if (name.includes('101-F')) return '101-F';
    return name;
  };

  // Exclude Pharmacy logistic department entirely from distribution table monitor
  const wardsData = data.filter(
    (d) => !d.department_name.toLowerCase().includes('pharmacy logistic')
  );

  // Find all unique cylinder types dynamically to form columns
  const uniqueTypesSet = new Set<string>();
  wardsData.forEach((row) => {
    row.cylinders.forEach((cyl) => {
      uniqueTypesSet.add(getNormalizedType(cyl.display_name));
    });
    (row.requests || []).forEach((req) => {
      if (req.status === 'pending' || req.status === 'approved') {
        req.items.forEach((itm) => {
          uniqueTypesSet.add(getNormalizedType(itm.size_code));
        });
      }
    });
  });

  const cylinderTypes = Array.from(uniqueTypesSet).sort();

  // Filter data by search query
  const filteredData = wardsData.filter((row) => {
    return row.department_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Calculate summary metrics based on the filtered table data
  const totalWards = filteredData.length;
  const criticalWards = filteredData.filter(r => r.status === 'Critical').length;
  const lowWards = filteredData.filter(r => r.status === 'Low').length;
  const totalCylindersInWards = filteredData.reduce((acc, curr) => acc + (curr.in_use || curr.total || 0), 0);
  const pendingRequestsCount = filteredData.reduce((acc, curr) => {
    const pending = (curr.requests || []).filter(r => r.status === 'pending').length;
    return acc + pending;
  }, 0);

  return (
    <div className="space-y-6 relative overflow-hidden">
      {/* KPI Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Monitored Wards & Units',
            value: totalWards,
            subtitle: 'Total registered departments',
            icon: Layers,
            color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-700',
            iconColor: 'text-blue-500'
          },
          {
            title: 'Critical Stock Alert',
            value: criticalWards,
            subtitle: `${lowWards} units running low`,
            icon: ShieldAlert,
            color: criticalWards > 0 
              ? 'from-rose-500/10 to-red-500/10 border-rose-500/20 text-rose-700' 
              : 'from-slate-500/10 to-slate-600/10 border-slate-500/10 text-text-secondary',
            iconColor: criticalWards > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'
          },
          {
            title: 'Cylinders In Wards',
            value: totalCylindersInWards,
            subtitle: 'Total available cylinders',
            icon: Package,
            color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-700',
            iconColor: 'text-emerald-500'
          },
          {
            title: 'Pending Wards Requests',
            value: pendingRequestsCount,
            subtitle: 'Awaiting pharmacy dispatch',
            icon: Clock,
            color: pendingRequestsCount > 0 
              ? 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-700' 
              : 'from-slate-500/10 to-slate-600/10 border-slate-500/10 text-text-secondary',
            iconColor: pendingRequestsCount > 0 ? 'text-amber-500' : 'text-slate-400'
          }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`bg-surface bg-gradient-to-br ${card.color} border border-border-default rounded-2xl p-5 shadow-xs flex items-center justify-between transition-[transform,opacity,box-shadow,border-color] duration-300 hover:scale-[1.02]`}>
              <div className="space-y-1">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{card.title}</span>
                <div className="text-3xl font-extrabold text-text-primary tracking-tight">{card.value}</div>
                <span className="text-[11px] font-semibold text-text-muted">{card.subtitle}</span>
              </div>
              <div className={`p-3.5 rounded-2xl bg-white/60 shadow-sm ${card.iconColor}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Modern Search Area */}
      <div className="bg-surface border border-white/40 rounded-3xl p-4 shadow-xl flex items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search department or ward name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-surface border border-border-default rounded-xl text-text-primary placeholder:text-text-muted font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-inner transition-[transform,opacity,box-shadow,border-color] duration-200"
          />
        </div>
      </div>

      {/* Unified Matrix Grid Layout */}
      <div className="bg-surface border border-border-default rounded-2xl shadow-xs overflow-hidden">
        {/* Mobile View: Cards Layout */}
        <div className="block md:hidden divide-y divide-border-default text-text-secondary font-medium bg-white/30">
          {filteredData.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-bold">
              No departments found.
            </div>
          ) : (
            filteredData.map((row) => {
              // Map inventory and requests to normalized cylinder types for this row
              const rowSummary: {
                [key: string]: { available: number; in_use: number; total: number; pendingRequest: number; approvedRequest: number }
              } = {};

              cylinderTypes.forEach((type) => {
                rowSummary[type] = { available: 0, in_use: 0, total: 0, pendingRequest: 0, approvedRequest: 0 };
              });

              row.cylinders.forEach((cyl) => {
                const type = getNormalizedType(cyl.display_name);
                if (rowSummary[type]) {
                  rowSummary[type].total++;
                  if (cyl.status === 'available') {
                    rowSummary[type].available++;
                  } else if (cyl.status === 'issued') {
                    rowSummary[type].in_use++;
                  }
                }
              });

              const requestItemSummary: { [key: string]: { pending: number; approved: number } } = {};
              (row.requests || []).forEach((req) => {
                if (req.status === 'pending' || req.status === 'approved') {
                  req.items.forEach((itm) => {
                    const type = getNormalizedType(itm.size_code);
                    if (!requestItemSummary[type]) {
                      requestItemSummary[type] = { pending: 0, approved: 0 };
                    }
                    const remaining = Math.max(0, itm.quantity - itm.quantity_issued);
                    if (req.status === 'pending') {
                      requestItemSummary[type].pending += remaining;
                    } else {
                      requestItemSummary[type].approved += remaining;
                    }
                  });
                }
              });

              const totalAvailable = cylinderTypes.reduce((sum, type) => sum + rowSummary[type].total, 0);
              const hasAnyAllocations = cylinderTypes.some(type => rowSummary[type].total > 0 || (requestItemSummary[type] && (requestItemSummary[type].pending > 0 || requestItemSummary[type].approved > 0)));

              return (
                <div key={row.department_id} className="p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                    <div className="font-extrabold text-text-primary text-sm">{row.department_name}</div>
                    <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-500/10 border border-emerald-100 px-2.5 py-1 rounded-xl shadow-sm">
                      Total Allocated: {totalAvailable}
                    </span>
                  </div>

                  {!hasAnyAllocations ? (
                    <div className="text-xs text-slate-400 italic py-1">No cylinders or active requests.</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {cylinderTypes.map((type) => {
                        const stats = rowSummary[type];
                        const reqs = requestItemSummary[type];
                        const hasCylinders = stats.total > 0;
                        const hasRequests = reqs && (reqs.pending > 0 || reqs.approved > 0);

                        if (!hasCylinders && !hasRequests) return null;

                        return (
                          <div key={type} className="bg-subtle/50 border border-slate-150 p-2.5 rounded-2xl flex flex-col justify-between gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                            <div>
                              <span className="text-[9px] font-extrabold text-text-secondary font-bold uppercase tracking-wider block leading-tight">{type}</span>
                              <div className="mt-1 font-bold text-xs">
                                {hasCylinders ? (
                                  <button
                                    onClick={() => setSelectedTagDetails({
                                      deptId: row.department_id,
                                      deptName: row.department_name,
                                      type: type,
                                      cylinders: row.cylinders.filter(
                                        (c) => getNormalizedType(c.display_name) === type
                                      )
                                    })}
                                    className="font-bold cursor-pointer hover:bg-blue-500/10 px-2 py-0.5 rounded-lg transition-[transform,opacity,box-shadow,border-color] duration-200 text-emerald-600 border border-transparent hover:border-blue-500/20 hover:underline inline-block text-xs"
                                    title="Click to view cylinder assets inside this unit"
                                  >
                                    {stats.total} In Unit
                                  </button>
                                ) : (
                                  <span className="text-slate-350">—</span>
                                )}
                              </div>
                            </div>
                            {hasRequests && (
                              <div className="flex flex-col gap-0.5 mt-1 border-t border-border-subtle pt-1">
                                {reqs.pending > 0 && (
                                  <span className="px-1.5 py-0.5 text-[8px] font-extrabold text-amber-700 bg-amber-500/10 rounded border border-amber-500/20 inline-block text-center w-full">
                                    +{reqs.pending} Req
                                  </span>
                                )}
                                {reqs.approved > 0 && (
                                  <span className="px-1.5 py-0.5 text-[8px] font-extrabold text-blue-700 bg-blue-500/10 rounded border border-blue-500/20 inline-block text-center w-full">
                                    +{reqs.approved} App
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Standard Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-text-secondary font-semibold text-sm">
            <thead>
              <tr className="border-b border-border-default bg-subtle/50 text-text-secondary font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-6 min-w-[180px]">Department</th>
                {cylinderTypes.map((type) => (
                  <th key={type} className="py-4 px-4 text-center min-w-[120px] border-l border-border-default">
                    <div>{type}</div>
                    <div className="text-[9px] text-text-muted font-bold mt-1">In Unit</div>
                  </th>
                ))}
                <th className="py-4 px-6 text-center min-w-[130px] border-l border-border-default">
                  <div>Total Allocation</div>
                  <div className="text-[9px] text-text-muted font-bold mt-1">Total Deployed</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={cylinderTypes.length + 2} className="py-12 text-center text-text-muted font-medium font-bold">
                    No departments found.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => {
                  // Map inventory and requests to normalized cylinder types for this row
                  const rowSummary: {
                    [key: string]: { available: number; in_use: number; total: number; pendingRequest: number; approvedRequest: number }
                  } = {};

                  cylinderTypes.forEach((type) => {
                    rowSummary[type] = { available: 0, in_use: 0, total: 0, pendingRequest: 0, approvedRequest: 0 };
                  });

                  // Populate inventory
                  row.cylinders.forEach((cyl) => {
                    const type = getNormalizedType(cyl.display_name);
                    if (rowSummary[type]) {
                      rowSummary[type].total++;
                      if (cyl.status === 'available') {
                        rowSummary[type].available++;
                      } else if (cyl.status === 'issued' || cyl.status === 'in_use') {
                        rowSummary[type].in_use++;
                      }
                    }
                  });

                  // Populate requests
                  const requestItemSummary: { [key: string]: { pending: number; approved: number } } = {};
                  (row.requests || []).forEach((req) => {
                    if (req.status === 'pending' || req.status === 'approved') {
                      req.items.forEach((itm) => {
                        const type = getNormalizedType(itm.size_code);
                        if (!requestItemSummary[type]) {
                          requestItemSummary[type] = { pending: 0, approved: 0 };
                        }
                        const remaining = Math.max(0, itm.quantity - itm.quantity_issued);
                        if (req.status === 'pending') {
                          requestItemSummary[type].pending += remaining;
                        } else {
                          requestItemSummary[type].approved += remaining;
                        }
                      });
                    }
                  });

                  // Calculate Total Allocated sum for this row
                  const totalAllocated = cylinderTypes.reduce((sum, type) => sum + rowSummary[type].total, 0);

                  return (
                    <tr key={row.department_id} className="hover:bg-subtle/50 transition-colors duration-150">
                      {/* Department Name */}
                      <td className="py-4 px-6 font-extrabold text-text-primary">
                        {row.department_name}
                      </td>

                      {/* Cylinder Type breakdown column cells */}
                      {cylinderTypes.map((type) => {
                        const stats = rowSummary[type];
                        const reqs = requestItemSummary[type];
                        const hasCylinders = stats.total > 0;
                        const hasRequests = reqs && (reqs.pending > 0 || reqs.approved > 0);

                        return (
                          <td key={type} className="py-4 px-4 text-center border-l border-border-subtle">
                            {hasCylinders ? (
                              <button
                                onClick={() => setSelectedTagDetails({
                                  deptId: row.department_id,
                                  deptName: row.department_name,
                                  type: type,
                                  cylinders: row.cylinders.filter(
                                    (c) => getNormalizedType(c.display_name) === type
                                  )
                                })}
                                className="font-bold cursor-pointer hover:bg-blue-500/10 px-3 py-1.5 rounded-xl transition-[transform,opacity,box-shadow,border-color] duration-200 text-emerald-600 border border-transparent hover:border-blue-500/20 hover:underline animate-fade-in"
                                title="Click to view cylinder assets inside this unit"
                              >
                                {stats.total}
                              </button>
                            ) : (
                              <span className="text-slate-300 font-normal">—</span>
                            )}

                            {/* Show tiny indicator for requests under specific column */}
                            {hasRequests && (
                              <div className="flex flex-col items-center gap-0.5 mt-1.5">
                                {reqs.pending > 0 && (
                                  <span className="px-1.5 py-0.5 text-[8px] font-extrabold text-amber-700 bg-amber-500/10 rounded border border-amber-500/20">
                                    +{reqs.pending} Req
                                  </span>
                                )}
                                {reqs.approved > 0 && (
                                  <span className="px-1.5 py-0.5 text-[8px] font-extrabold text-blue-700 bg-blue-500/10 rounded border border-blue-500/20">
                                    +{reqs.approved} App
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Total Allocation */}
                      <td className="py-4 px-6 text-center border-l border-border-subtle bg-subtle/50 font-extrabold text-emerald-600">
                        {totalAllocated}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backdrop overlay for slide-over drawer */}
      {selectedTagDetails && (
        <div 
          onClick={() => setSelectedTagDetails(null)}
          className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs z-40 transition-opacity duration-300 animate-fade-in"
        />
      )}

      {/* Slide-over Drawer Panel from the right */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-surface border-l border-border-default shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out transform ${
        selectedTagDetails ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {selectedTagDetails && (
          <>
            {/* Header */}
            <div className="bg-subtle/50 border-b border-border-default px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-text-primary">Available Wards Assets</h3>
                <p className="text-xs text-text-muted font-semibold mt-0.5">
                  {selectedTagDetails.deptName} â€¢ {selectedTagDetails.type}
                </p>
              </div>
              <button 
                onClick={() => setSelectedTagDetails(null)}
                className="p-1.5 rounded-full hover:bg-subtle text-slate-400 hover:text-text-secondary transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content list of cylinder tags inside unit */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {selectedTagDetails.cylinders.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-bold text-xs uppercase tracking-wider bg-subtle/50 rounded-2xl border border-border-subtle">
                  No available cylinders of this type currently in ward.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    Cylinder List ({selectedTagDetails.cylinders.length})
                  </div>
                  {selectedTagDetails.cylinders.map((cyl) => (
                    <div key={cyl.id} className="bg-surface border border-border-default p-4 rounded-2xl shadow-sm hover:shadow-md transition-[transform,opacity,box-shadow,border-color] duration-200 flex items-start gap-4">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-text-primary text-sm truncate">{cyl.serial_number}</span>
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[8px] uppercase font-bold border bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                            Available
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold font-mono truncate">{cyl.qr_code}</p>
                        <div className="text-[9px] text-slate-400 flex items-center gap-1 font-semibold pt-1 border-t border-border-subtle">
                          <Clock className="w-3 h-3" />
                          Updated: {new Date(cyl.updated_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-subtle/50 border-t border-border-default px-6 py-4 flex justify-end">
              <button
                onClick={() => setSelectedTagDetails(null)}
                className="px-5 py-2 bg-blue-600 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg hover:scale-102 active:scale-98 transition-[transform,opacity,box-shadow,border-color] duration-200"
              >
                Close Panel
              </button>
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 text-[11px] font-semibold text-slate-400 justify-end px-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Tracking Legend:</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-300 inline-block animate-pulse" />
          <span className="text-emerald-700 font-bold">Green Number</span>
          <span>= Clickable Assets (Only shows Available count. Click to view In-Ward serial numbers)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-text-secondary font-bold">Slate Number</span>
          <span>= Static Loan Cylinders (Non-Clickable)</span>
        </div>
      </div>
    </div>
  );
};
