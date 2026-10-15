import React from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { FacilityDrugInventoryPage } from '../../src/modules/inventory/pages/inventory/FacilityDrugInventoryPage'
import { FacilityNonDrugInventoryPage } from '../../src/modules/inventory/pages/inventory/FacilityNonDrugInventoryPage'
import { DrugInventoryPage } from '../../src/modules/inventory/pages/inventory/DrugInventoryPage'
import { NonDrugInventoryPage } from '../../src/modules/inventory/pages/inventory/NonDrugInventoryPage'
import { PrepackDrugPickerModal } from '../../src/modules/myprepacking/components/PrepackDrugPickerModal'
import { StoreLocationManagementPage } from '../../src/modules/inventory/pages/inventory/StoreLocationManagementPage'
import '../../src/index.css'

const page = new URL(location.href).searchParams.get('case')
const component = page === 'store' ? StoreLocationManagementPage : page === 'nondrug' ? FacilityNonDrugInventoryPage : page === 'master-drug' ? DrugInventoryPage : page === 'master-nondrug' ? NonDrugInventoryPage : FacilityDrugInventoryPage
function Fixture() {
  return React.createElement(MemoryRouter, null, page === 'picker'
    ? React.createElement(PrepackDrugPickerModal, { isOpen: true, onClose() {}, onSelectDrug(drug) { (window as unknown as { __qa: { selected: string[] } }).__qa.selected.push(drug.id) } })
    : React.createElement(component))
}
createRoot(document.getElementById('root')!).render(React.createElement(Fixture))
