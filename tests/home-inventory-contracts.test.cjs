const assert=require('node:assert/strict');
const {test}=require('node:test');
const {loadSource}=require('./home-health-regressions.test.cjs');
const H1='11111111-1111-4111-8111-111111111111',H2='22222222-2222-4222-8222-222222222222';
function storage(){const values=new Map();return {values,getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};}
function queryClient(response){const calls=[];return {calls,from(table){const call={table,filters:{}};calls.push(call);const query={select(){return this;},eq(k,v){call.filters[k]=v;return this;},in(k,v){call.filters[k]=v;return this;},or(){return this;},order(){return this;},limit(){return this;},insert(v){call.operation='insert';call.values=v;return this;},update(v){call.operation='update';call.values=v;return this;},delete(){call.operation='delete';return this;},maybeSingle(){return Promise.resolve(response(call));},single(){return Promise.resolve(response(call));},then(fn){return Promise.resolve(response(call)).then(fn);}};return query;}};}
function stores(client){return loadSource('src/services/pharmacy/facilityStoreService.ts',{'@/services/supabase':{supabase:client,isSupabaseConfigured:()=>true}});}
test('store resolution uses actual hospital LOG/IPD/OPD/ETU; absent and query-error states stay errors',async()=>{
 const codes=['LOG','IPD','OPD','ETU'];const client=queryClient(call=>({data:codes.map(code=>({id:`${call.filters.hospital_id}-${code}`,hospital_id:call.filters.hospital_id,location_code:`LOC-${code}-01`})),error:null}));
 const service=loadSource('src/services/pharmacy/facilityStoreService.ts',{'@/services/supabase':{supabase:client,isSupabaseConfigured:()=>true}});
 for(const hospital of [H1,H2])for(const code of codes)assert.equal((await service.resolveFacilityStore(hospital,code)).id,`${hospital}-${code}`);
 const absent=loadSource('src/services/pharmacy/facilityStoreService.ts',{'@/services/supabase':{supabase:queryClient(()=>({data:[],error:null})),isSupabaseConfigured:()=>true}});await assert.rejects(absent.resolveFacilityStore(H2,'IPD'),/unavailable/i);
 const failed=loadSource('src/services/pharmacy/facilityStoreService.ts',{'@/services/supabase':{supabase:queryClient(()=>({data:null,error:new Error('denied')})),isSupabaseConfigured:()=>true}});await assert.rejects(failed.listFacilityStores(H2),/Unable/i);
});
test('occupancy loads every hospital store with both scoped inventory services and ignores legacy unscoped cache',async()=>{
 const localStorage=storage();localStorage.setItem(`facility_nondrug_items_${H2}`,JSON.stringify([{id:'stale',location:'Fixture OPD'}]));const calls=[];const codes=['LOG','IPD','OPD','ETU'];
 const client=queryClient(()=>({data:codes.map(code=>({id:`physical-${code}`,hospital_id:H2,store_name:`Fixture ${code}`,cabinet_rack:'-',shelf_level:'-',department:code,location_code:`${code}-FIX-01`,location_type:'both',is_active:true})),error:null}));
 const service=loadSource('src/services/pharmacy/storeLocationService.ts',{'@/services/supabase':{supabase:client,isSupabaseConfigured:()=>true},'@/services/offlineSession':{offlineScope:()=>`actor:${H2}`},'./facilityStoreService':{listFacilityStores:async hospital=>codes.map(code=>({id:`${hospital}-${code}`,location_code:`LOC-${code}-01`}))},'./facilityDrugInventoryService':{loadFacilityDrugInventory:async(h,s)=>{calls.push(['drug',h,s]);return [{id:'drug',location:`Fixture ${s.split('-').at(-1)}`}];}},'./facilityNonDrugInventoryService':{loadFacilityNonDrugInventory:async(h,s)=>{calls.push(['nondrug',h,s]);return [{id:'nondrug',location:`Fixture ${s.split('-').at(-1)}`}];}}},{localStorage});
 const result=await service.getStoreLocationsWithOccupancy(H2);assert.equal(result.length,4);assert.ok(result.every(row=>row.drug_items_count===1&&row.non_drug_items_count===1&&row.total_items_count===2));assert.equal(calls.length,8);assert.ok(calls.every(call=>call[1]===H2&&call[2].startsWith(H2)));
});
test('facility load query failures never turn stale non-drug cache into authoritative success',async()=>{
 const localStorage=storage();localStorage.setItem(`facility_nondrug_items_actor:${H1}_${H1}_fixture-store`,JSON.stringify([{id:'stale'}]));
 const client=queryClient(()=>({data:null,error:new Error('Isolated RLS denial')}));const service=loadSource('src/services/pharmacy/facilityNonDrugInventoryService.ts',{'./facilityStoreService':stores(client),'@/services/supabase':{supabase:client,isSupabaseConfigured:()=>true},'@/services/offlineSession':{offlineScope:()=>`actor:${H1}`}},{localStorage});
 await assert.rejects(service.loadFacilityNonDrugInventory(H1,'fixture-store'),/unavailable|denial/i);
});
test('actual facility mutations constrain hospital and selected store and missing store fails',async()=>{
 for(const [file,prefix,idField]of [['facilityDrugInventoryService','Drug','drug_id'],['facilityNonDrugInventoryService','NonDrug','nondrug_id']]){
 const client=queryClient(call=>({data:call.table==='pharmacy_stock_locations'?[{id:'selected-store',hospital_id:H1,location_code:'LOC-IPD-01'}]:[{id:'affected'}],error:null}));const service=loadSource(`src/services/pharmacy/${file}.ts`,{'./facilityStoreService':stores(client),'@/services/supabase':{supabase:client,isSupabaseConfigured:()=>true},'@/services/offlineSession':{offlineScope:()=>`actor:${H1}`}},{localStorage:storage()});
 const response=await service[`updateFacility${prefix}InventoryItem`](H1,'same-catalog',{location:'Fixture',min_stock_level:2,max_stock_level:10},'selected-store');assert.equal(response.success,true);const call=client.calls.find(x=>x.operation==='update');assert.equal(call.filters.hospital_id,H1);assert.equal(call.filters.store_location_id,'selected-store');assert.equal(call.filters[idField],'same-catalog');assert.equal(call.values.min_stock_level,2);assert.equal(call.values.max_stock_level,10);assert.ok(client.calls.every(call=>!['drugs','non_drugs'].includes(call.table)),'facility thresholds never change global catalog');
 const missing=await service[`updateFacility${prefix}InventoryItem`](H1,'same-catalog',{location:'Fixture'});assert.equal(missing.success,false);
 await service[`bulkAssignLocationToFacility${prefix}Items`](H1,['same-catalog'],'Fixture','selected-store');assert.equal(client.calls.at(-1).filters.store_location_id,'selected-store');
 for(const invalid of [{min_stock_level:-1},{max_stock_level:1.5},{min_stock_level:9,max_stock_level:2}])assert.equal((await service[`updateFacility${prefix}InventoryItem`](H1,'same-catalog',invalid,'selected-store')).success,false);
 }
});
function prepack(client,storeError=false){const storeClient=queryClient(()=>({data:storeError?[]:[{id:'H1-IPD',hospital_id:H1,location_code:'LOC-IPD-01'}],error:null}));return loadSource('src/modules/myprepacking/services/prepackService.ts',{'@/services/supabase':{supabase:client},'@/services/offlineAdapter':{offlineAdapter:{}},'@/services/auditLogService':{recordAuditLog:async()=>{}},xlsx:{},jspdf:()=>{},'jspdf-autotable':()=>{},'./prepackKewPs4Service':{recordPrepackProductionTransaction:async()=>{}},'../data/kkmGalenicalMasterDatabase':{KKM_GALENICAL_MASTER_DATABASE:[]},'@/services/pharmacy/facilityStoreService':stores(storeClient)});}
test('prepack resolver/catalog errors are explicit and never use Lawas fallback',async()=>{
 const failed=prepack(queryClient(()=>({data:null,error:new Error('Catalog denied')})));const result=await failed.searchFacilityCatalogDrugs('Alpha',H1);assert.ok(result.error);assert.equal(result.data.length,0);
 const absent=prepack(queryClient(()=>({data:[],error:null})),true);const missing=await absent.searchFacilityCatalogDrugs('',H2);assert.ok(missing.error);assert.equal(missing.data.length,0);
});
test('prepack store override outside hospital is rejected rather than successful empty inventory',async()=>{
 const service=prepack(queryClient(()=>({data:[],error:null})));const result=await service.searchFacilityCatalogDrugs('',H1,'H2-IPD');assert.ok(result.error,'foreign store override must be an explicit scope error');
});
