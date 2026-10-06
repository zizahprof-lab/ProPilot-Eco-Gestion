import fs from 'node:fs'

const setup=fs.readFileSync(new URL('../src/SetupWizard.jsx',import.meta.url),'utf8')
const tour=fs.readFileSync(new URL('../src/GuidedTour.jsx',import.meta.url),'utf8')
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8')

const checks=[
  ['assistant en 6 étapes', setup.includes("Étape {step} sur 6")],
  ['organisation solo/binôme/trinôme', setup.includes("['solo','Seul']") && setup.includes("['binome','Binôme']") && setup.includes("['trinome','Trinôme']")],
  ['adresse académique obligatoire pour les collaborateurs', setup.includes('@ac-aix-marseille.fr')],
  ['import élèves avec aperçu', setup.includes('studentsPreview') && setup.includes('aperçu limité aux 8 premiers')],
  ['PFMP configurables', setup.includes('addPfmp') && setup.includes('Dates PFMP propres à cette classe')],
  ['visite guidée disponible', tour.includes('Découvrir ProPilot') && tour.includes('ProPilot est prêt')],
  ['visite guidée couvre progression', tour.includes('Progression pédagogique')],
  ['visite guidée couvre évaluations', tour.includes('Évaluations')],
  ['visite guidée couvre PFMP', tour.includes('PFMP')],
  ['visite guidée couvre CCF/documents', tour.includes('CCF et documents')],
  ['visite guidée peut être passée', tour.includes('Passer la visite')],
  ['styles visite isolés', css.includes('.tour-overlay') && css.includes('.tour-card')],
]

let failed=0
for(const [label,ok] of checks){
  if(ok) console.log(`✓ ${label}`)
  else { console.error(`✗ ${label}`); failed++ }
}
if(failed){console.error(`\n${failed} contrôle(s) onboarding en échec.`);process.exit(1)}
console.log(`\nOnboarding V22 : ${checks.length} contrôles OK.`)

assert(setup.includes("import * as XLSX from 'xlsx'"),'Excel parser is wired into setup')
assert(setup.includes('.xlsx,.xls,.csv'),'Setup accepts Excel and CSV files')
assert(main.includes("import GuidedTour from './GuidedTour'"),'Guided tour is imported by the app')
assert(main.includes('propilot-guided-tour-v22:'),'Guided tour completion is persisted per teacher')
