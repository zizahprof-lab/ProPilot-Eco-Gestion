import React, { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './supabase'
import { Plus, Pencil, Trash2, Copy, BriefcaseBusiness, FileText, Download, Upload, Save, X, RefreshCw, LockKeyhole, ClipboardCheck } from 'lucide-react'

const LEARNING=[['D','Découverte'],['E','Entraînement'],['A','Approfondissement'],['M','Maîtrise / autonomie']]
const STATUS=['Prévu','En cours','Terminé','À ajuster']
const GROUP_STYLE={
  G1:{personal:'GC1',label:'Conseiller et vendre',color:'#5B8DEF'},
  G2:{personal:'GC2',label:'Suivre les ventes',color:'#F4A259'},
  G3:{personal:'GC3',label:'Fidéliser la clientèle et développer la relation client',color:'#A678DE'},
  G4A:{personal:'GC4A',label:'Animer et gérer l’espace commercial',color:'#61B58C'},
  G4B:{personal:'GC4B',label:'Prospecter et valoriser l’offre commerciale',color:'#2EA6A1'}
}
const PERSONAL_GROUP_CODE=Object.fromEntries(Object.entries(GROUP_STYLE).map(([k,v])=>[k,v.personal]))
const PERSONAL_TO_GROUP=Object.fromEntries(Object.entries(GROUP_STYLE).map(([k,v])=>[v.personal,k]))

function err(e){return e?.message||String(e||'Erreur')}
function lines(v){return String(v||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean)}
function unique(values){return [...new Set(values.filter(Boolean))]}
function safeName(v){return String(v||'fichier').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'_')}
function learningLabel(code){return LEARNING.find(x=>x[0]===code)?.[1]||code||'—'}
function competencyCodes(value){if(!Array.isArray(value))return [];return value.map(x=>typeof x==='string'?x:(x.code||x.parent_code||x.comp_code||null)).filter(Boolean)}
function groupKey(item){const c=Array.isArray(item?.competencies)?item.competencies[0]:null;const raw=(c&&typeof c==='object'?(c.group||c.group_code):null)||item?.group_code||'';return PERSONAL_TO_GROUP[raw]||raw||'G1'}
function groupInfo(item){const key=groupKey(item);return {key,...(GROUP_STYLE[key]||{personal:key,label:key,color:'#94A3B8'})}}
function primaryCompetency(item){const c=Array.isArray(item?.competencies)?item.competencies[0]:null;if(!c)return 'Compétence à préciser';return typeof c==='string'?c:(c.comp||c.label||c.code||'Compétence')}
function formatDate(v){return v?new Date(`${v}T12:00:00`).toLocaleDateString('fr-FR'):'À renseigner'}

export default function PersonalProgression({klass,readOnly=false,onEvaluateContext=null,addRequestToken=0}){
  const [items,setItems]=useState([])
  const [periods,setPeriods]=useState([])
  const [pfmps,setPfmps]=useState([])
  const [attachments,setAttachments]=useState([])
  const [referenceCompetencies,setReferenceCompetencies]=useState([])
  const [referenceGroups,setReferenceGroups]=useState([])
  const [teacherOptions,setTeacherOptions]=useState([])
  const [open,setOpen]=useState(false)
  const [newPeriod,setNewPeriod]=useState(null)
  const [editItem,setEditItem]=useState(null)
  const [teacherFilter,setTeacherFilter]=useState('')
  const [groupFilter,setGroupFilter]=useState('')
  const [levelFilter,setLevelFilter]=useState('')
  const [syncState,setSyncState]=useState('Synchronisation…')
  const timelineRef=useRef(null)

  async function load(){
    setSyncState('Synchronisation…')
    const [i,p,f,c,g,m]=await Promise.all([
      supabase.from('pp_progression_items').select('*').eq('class_id',klass.id).order('sort_order').order('created_at'),
      supabase.from('pp_class_periods').select('*').eq('class_id',klass.id).order('sort_order'),
      supabase.from('pp_pfmp_periods').select('*').eq('class_id',klass.id).order('sort_order'),
      supabase.from('pp_competencies').select('code,label,group_code').eq('diploma_code',klass.diploma_code).is('parent_code',null).order('sort_order'),
      supabase.from('pp_competency_groups').select('code,label,sort_order').eq('diploma_code',klass.diploma_code).order('sort_order'),
      supabase.from('pp_class_members').select('user_id,member_role').eq('class_id',klass.id)
    ])
    setItems(i.data||[]);setPeriods(p.data||[]);setPfmps(f.data||[]);setReferenceCompetencies(c.data||[]);setReferenceGroups(g.data||[])
    const ids=(i.data||[]).map(x=>x.id)
    if(ids.length){const {data}=await supabase.from('pp_progression_attachments').select('*').in('progression_item_id',ids).order('created_at');setAttachments(data||[])}else setAttachments([])
    const userIds=unique((m.data||[]).map(x=>x.user_id))
    let names=[]
    if(userIds.length){const {data:profiles}=await supabase.from('pp_profiles').select('user_id,display_name,email').in('user_id',userIds);names=(profiles||[]).map(p=>p.display_name||String(p.email||'').split('@')[0]).filter(Boolean)}
    const itemNames=(i.data||[]).map(x=>x.teacher_label).filter(Boolean)
    const base=unique([...names,...itemNames])
    const combos=[]
    if(names.length>=2)combos.push(names.slice(0,2).join(' & '))
    if(names.length>=3)combos.push(names.slice(0,3).join(' & '))
    setTeacherOptions(unique([...base,...combos]))
    setSyncState('✓ Progression synchronisée')
  }
  useEffect(()=>{load()},[klass.id,klass.diploma_code])
  useEffect(()=>{if(addRequestToken>0&&!readOnly)setOpen(true)},[addRequestToken,readOnly])

  async function remove(item){if(!confirm(`Supprimer « ${item.context_name} » ?`))return;await supabase.from('pp_progression_items').delete().eq('id',item.id);load()}
  async function duplicate(item){const {data:{user}}=await supabase.auth.getUser();const {id,created_at,updated_at,revision,...copy}=item;await supabase.from('pp_progression_items').insert({...copy,class_id:klass.id,context_name:`${item.context_name} — copie`,created_by:user.id,status:'Prévu',updated_at:new Date().toISOString()});load()}
  async function downloadAttachment(a){const {data,error}=await supabase.storage.from('pp-progression-files').createSignedUrl(a.storage_path,60);if(error)alert(err(error));else window.open(data.signedUrl,'_blank','noopener,noreferrer')}
  async function moveItem(item,direction){
    const siblings=items.filter(x=>x.period_id===item.period_id).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)||new Date(a.created_at)-new Date(b.created_at))
    const index=siblings.findIndex(x=>x.id===item.id);const target=index+direction
    if(index<0||target<0||target>=siblings.length)return
    const reordered=[...siblings];const [moved]=reordered.splice(index,1);reordered.splice(target,0,moved)
    await Promise.all(reordered.map((row,i)=>supabase.from('pp_progression_items').update({sort_order:(i+1)*10,updated_at:new Date().toISOString()}).eq('id',row.id)))
    load()
  }
  function scrollTimeline(where){const el=timelineRef.current;if(!el)return;if(where==='start')el.scrollTo({left:0,behavior:'smooth'});else if(where==='end')el.scrollTo({left:el.scrollWidth,behavior:'smooth'});else el.scrollBy({left:where*420,behavior:'smooth'})}

  const visible=useMemo(()=>items.filter(i=>(!teacherFilter||i.teacher_label===teacherFilter)&&(!groupFilter||groupKey(i)===groupFilter)&&(!levelFilter||i.learning_level===levelFilter)),[items,teacherFilter,groupFilter,levelFilter])
  const covered=useMemo(()=>new Set(items.flatMap(i=>competencyCodes(i.competencies))),[items])
  const totalTop=referenceCompetencies.length
  const pByCode=useMemo(()=>Object.fromEntries(periods.map(p=>[p.code,p])),[periods])
  const orderedPfmp=[...pfmps].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0))
  const timelineColumns=useMemo(()=>{
    const period=(code,label,subtitle)=>({kind:'period',code,label:pByCode[code]?.label||label,subtitle:pByCode[code]?.subtitle||subtitle})
    const pfmp=(index)=>{const row=orderedPfmp[index];return {kind:'pfmp',code:`PFMP${index+1}`,label:row?.label||`PFMP ${index+1}`,subtitle:row?`${formatDate(row.start_date)} → ${formatDate(row.end_date)}`:'Dates à renseigner',row}}
    const cols=[period('P1','Rentrée → Toussaint','Sept. – oct.'),period('P2','Toussaint → PFMP 1','Oct. – nov.'),pfmp(0),period('P3','Retour PFMP → Noël','Déc.'),period('P4','Noël → Hiver','Janv. – fév.'),period('P5','Hiver → Printemps','Fév. – avril'),period('P6','Printemps → PFMP 2','Avril – mai'),pfmp(1),period('P7','Fin d’année','Juin')]
    if(orderedPfmp.length>2)cols.splice(cols.length-1,0,...orderedPfmp.slice(2).map((row,index)=>({kind:'pfmp',code:`PFMP${index+3}`,label:row.label||`PFMP ${index+3}`,subtitle:`${formatDate(row.start_date)} → ${formatDate(row.end_date)}`,row})))
    return cols
  },[periods,pfmps])

  return <div className="personal-progression personal-reference-ui">
    <div className="personal-progression-toolbar">
      <div><span className="eyebrow">Ergonomie de la version personnelle</span><h3>Progression pédagogique partagée</h3><p>La classe reste vide au départ ; le référentiel, les périodes et les PFMP structurent la progression.</p></div>
      {!readOnly&&<button className="btn primary" onClick={()=>{setNewPeriod(null);setOpen(true)}}><Plus/>Ajouter un contexte</button>}
    </div>

    <div className="personal-controls">
      <label className="inline-control"><span>Filtrer par enseignant</span><select value={teacherFilter} onChange={e=>setTeacherFilter(e.target.value)}><option value="">Tous les enseignants</option>{teacherOptions.map(n=><option key={n}>{n}</option>)}</select></label>
      <label className="inline-control"><span>Groupe de compétences</span><select value={groupFilter} onChange={e=>setGroupFilter(e.target.value)}><option value="">Tous les groupes</option>{referenceGroups.map(g=><option key={g.code} value={g.code}>{GROUP_STYLE[g.code]?.personal||g.code} · {g.label}</option>)}</select></label>
      <label className="inline-control"><span>Niveau</span><select value={levelFilter} onChange={e=>setLevelFilter(e.target.value)}><option value="">Tous les niveaux</option>{LEARNING.map(([k,l])=><option key={k} value={k}>{k} · {l}</option>)}</select></label>
      <div className="personal-controls-spacer"/><span className="sync-state">{syncState}</span>
    </div>

    <div className="personal-legend">{referenceGroups.map(g=>{const style=GROUP_STYLE[g.code]||{personal:g.code,color:'#94A3B8'};return <span key={g.code} style={{'--c':style.color}}><b>{style.personal}</b> · {g.label}</span>})}</div>

    <div className="personal-kpis">
      <div className="personal-kpi"><span>Compétences programmées</span><strong>{covered.size} / {totalTop}</strong></div>
      <div className="personal-kpi"><span>Contextes / activités</span><strong>{items.length}</strong></div>
      <div className="personal-kpi"><span>Éléments terminés</span><strong>{items.filter(i=>i.status==='Terminé').length}</strong></div>
      <div className="personal-kpi"><span>À ajuster</span><strong>{items.filter(i=>i.status==='À ajuster').length}</strong></div>
    </div>

    <style>{`
      /* Reprise des proportions et couleurs de la progression personnelle V14.1 */
      .personal-timeline{align-items:stretch;gap:12px}
      .personal-period-column{height:70vh;min-height:570px;max-height:760px;display:flex;flex-direction:column;overflow:hidden;background:#f8fafc}
      .personal-period-head{flex:0 0 auto;min-height:110px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:13px 12px 10px}
      .personal-period-head>div{text-align:center;width:100%}
      .personal-period-head h4{font-weight:900;letter-spacing:.01em}
      .personal-period-add{display:grid;place-items:center;position:relative;margin:8px auto 0;width:34px;height:34px;min-width:34px;min-height:34px;border-radius:50%;background:#fff;color:#1d4ed8;border:1px solid #dbe4ef;box-shadow:0 3px 10px #0f172a20}
      .personal-period-body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-color:#64748b #e2e8f0;scrollbar-width:thin}
      .personal-period-theme-p1 .personal-period-head,.personal-period-theme-p5 .personal-period-head{background:linear-gradient(135deg,#2f80ed,#56a8ff);color:#fff}
      .personal-period-theme-p2 .personal-period-head,.personal-period-theme-p6 .personal-period-head{background:linear-gradient(135deg,#18a96b,#58cf8b);color:#fff}
      .personal-period-theme-p3 .personal-period-head,.personal-period-theme-p7 .personal-period-head{background:linear-gradient(135deg,#ef4444,#fb7185);color:#fff}
      .personal-period-theme-p4 .personal-period-head{background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff}
      .personal-pfmp-column{width:108px;min-width:108px;max-width:108px;background:linear-gradient(180deg,#fff8dc,#ffefad);border:1px solid #f2cf61;align-items:center;justify-content:center}
      .personal-pfmp-vertical{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;height:100%;padding:12px 8px;color:#5f4500;text-align:center}
      .personal-pfmp-vertical strong{writing-mode:vertical-rl;text-orientation:upright;letter-spacing:.12em;font-size:16px}
      .personal-pfmp-vertical span{writing-mode:vertical-rl;text-orientation:mixed;font-size:11px}
      @media(max-width:760px){.personal-period-column{height:64vh;min-height:500px}}
      .personal-v14-dashboard{margin:18px 0 22px;padding:18px;border:1px solid #dbe4ef;border-radius:16px;background:#f8faff}
      .personal-v14-dashboard-title{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px}
      .personal-v14-dashboard-title strong{font-size:19px;color:#12233c}.personal-v14-dashboard-title span{color:#64748b}
      .personal-v14-ring-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
      .personal-v14-ring-card{background:white;border:1px solid #e2e8f0;border-radius:14px;padding:14px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px}
      .personal-v14-ring-card>strong{font-size:14px;color:#334155}
      .personal-v14-ring{height:114px;width:114px;border-radius:50%;display:grid;place-items:center}
      .personal-v14-ring>div{background:white;width:83px;height:83px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
      .personal-v14-ring b{font-size:16px}.personal-v14-ring span{font-size:13px;color:#64748b}
      .personal-v14-groups{background:white;border:1px solid #e2e8f0;border-radius:14px;padding:14px;margin-top:14px}
      .personal-v14-group-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:14px;margin-top:12px}
      .personal-v14-group-grid>div{display:grid;gap:6px;font-size:13px}
      .personal-v14-meter{height:9px;border-radius:20px;background:#e8edf5;overflow:hidden}.personal-v14-meter i{display:block;height:100%;border-radius:20px}
      .personal-v14-levels{display:flex;flex-wrap:wrap;gap:9px;margin-top:12px}.personal-v14-levels span{padding:9px 12px;border-radius:10px;background:#f1f5f9;font-size:13px}
      @media(max-width:700px){.personal-v14-ring-grid{grid-template-columns:1fr}}
    `}</style>
    <section className="personal-v14-dashboard" aria-label="Tableau de bord de progression V14.1">
      <div className="personal-v14-dashboard-title"><strong>Tableau de bord pédagogique</strong><span>Programmation et couverture des compétences</span></div>
      <div className="personal-v14-ring-grid">
        {[
          {label:'Compétences programmées',value:covered.size,total:totalTop,color:'#2589e8'},
          {label:'Couverture engagée',value:items.filter(i=>i.status==='En cours'||i.status==='Terminé').length,total:items.length,color:'#f59e0b'},
          {label:'Contextes finalisés',value:items.filter(i=>i.status==='Terminé').length,total:items.length,color:'#10b981'}
        ].map(k=>{const pct=k.total?Math.round(k.value/k.total*100):0;return <div key={k.label} className="personal-v14-ring-card"><strong>{k.label}</strong><div className="personal-v14-ring" style={{background:`conic-gradient(${k.color} ${pct}%, #e8edf5 0)`}}><div><b>{k.value} / {k.total}</b><span>{pct}%</span></div></div></div>})}
      </div>
      <div className="personal-v14-groups"><strong>Répartition par groupe de compétences</strong><div className="personal-v14-group-grid">{referenceGroups.map(g=>{const related=referenceCompetencies.filter(c=>c.group_code===g.code);const done=related.filter(c=>covered.has(c.code)).length;const pct=related.length?Math.round(done/related.length*100):0;return <div key={g.code}><span>{GROUP_STYLE[g.code]?.personal||g.code} · {done}/{related.length}</span><div className="personal-v14-meter"><i style={{width:pct+'%',background:GROUP_STYLE[g.code]?.color||'#64748b'}}/></div><small>{pct}%</small></div>})}</div></div>
      <div className="personal-v14-groups"><strong>Niveaux de complexité programmés</strong><div className="personal-v14-levels">{LEARNING.map(([code,label])=><span key={code}><b>{code}</b> {label} : {items.filter(i=>i.learning_level===code).length}</span>)}</div></div>
    </section>
    <div className="personal-timeline-navigation no-print"><button onClick={()=>scrollTimeline('start')}>« Début</button><button onClick={()=>scrollTimeline(-1)}>←</button><div className="personal-scroll-track"><span>Progression annuelle</span></div><button onClick={()=>scrollTimeline(1)}>→</button><button onClick={()=>scrollTimeline('end')}>Fin »</button></div>
    <div className="personal-timeline-wrap" ref={timelineRef}>
      <div className="personal-timeline" style={{gridTemplateColumns:timelineColumns.map(col=>col.kind==='pfmp'?'108px':'290px').join(' ')}}>
        {timelineColumns.map(col=>col.kind==='pfmp'
          ? <PfmpColumn key={col.code} col={col}/>
          : <PeriodColumn key={col.code} col={col} items={visible.filter(i=>i.period_id===col.code)} files={attachments} readOnly={readOnly} onAdd={()=>{setNewPeriod(col.code);setOpen(true)}} onEdit={setEditItem} onDelete={remove} onDuplicate={duplicate} onDownload={downloadAttachment} onMove={moveItem} onEvaluate={onEvaluateContext}/>
        )}
      </div>
    </div>

    {!readOnly&&open&&<ProgressionEditor klass={klass} periods={periods} teacherOptions={teacherOptions} initial={newPeriod?{period_id:newPeriod}:null} onClose={()=>{setOpen(false);setNewPeriod(null)}} onSaved={()=>{setOpen(false);setNewPeriod(null);load()}}/>}
    {!readOnly&&editItem&&<ProgressionEditor klass={klass} periods={periods} teacherOptions={teacherOptions} initial={editItem} onClose={()=>setEditItem(null)} onSaved={()=>{setEditItem(null);load()}}/>}
  </div>
}

function PeriodColumn({col,items,files,readOnly,onAdd,onEdit,onDelete,onDuplicate,onDownload,onMove,onEvaluate}){
  return <section className={`personal-period-column personal-period-theme-${col.code.toLowerCase()}`}>
    <div className="personal-period-head"><div><h4>{col.label}</h4><small>{col.subtitle}</small><span>{col.code}</span></div>{!readOnly&&<button type="button" className="personal-period-add" onClick={onAdd} title={`Ajouter un contexte ou une activité en ${col.label}`} aria-label={`Ajouter un contexte ou une activité en ${col.label}`}><Plus size={22}/></button>}</div>
    <div className="personal-period-body">
      {items.map((item,index)=><ProgressionCard key={item.id} item={item} files={files.filter(a=>a.progression_item_id===item.id)} readOnly={readOnly} onEdit={()=>onEdit(item)} onDelete={()=>onDelete(item)} onDuplicate={()=>onDuplicate(item)} onDownload={onDownload} onMove={onMove} canMoveUp={index>0} canMoveDown={index<items.length-1} onEvaluate={onEvaluate}/>)}
      {!items.length&&<div className="personal-period-empty">Aucun élément</div>}
    </div>
  </section>
}

function PfmpColumn({col}){
  return <section className="personal-period-column personal-pfmp-column">
    <div className="personal-pfmp-vertical"><strong>{col.row?.label||col.label}</strong><span>{col.row?`${formatDate(col.row.start_date)} → ${formatDate(col.row.end_date)}`:'Dates à renseigner'}</span></div>
  </section>
}

function ProgressionCard({item,files,readOnly,onEdit,onDelete,onDuplicate,onDownload,onMove,canMoveUp,canMoveDown,onEvaluate}){
  const group=groupInfo(item)
  return <article className="personal-context-card" style={{'--gc':group.color}} onClick={()=>!readOnly&&onEdit()}>
    {!readOnly&&<div className="personal-card-order"><button disabled={!canMoveUp} title="Monter" onClick={e=>{e.stopPropagation();onMove(item,-1)}}>↑</button><button disabled={!canMoveDown} title="Descendre" onClick={e=>{e.stopPropagation();onMove(item,1)}}>↓</button></div>}
    <h4>{item.context_name}</h4>
    <p>{primaryCompetency(item)}</p>
    {item.problematic&&<p className="personal-card-problem">{item.problematic}</p>}
    <div className="personal-card-badges"><span>{group.personal}</span><span className={`level-${item.learning_level||'D'}`}>{item.learning_level||'D'}</span><span>{item.status||'Prévu'}</span>{item.item_kind==='event'&&<span>{item.activity_type||'Évènement'}</span>}</div>
    <p><b>{item.teacher_label||'Enseignant à préciser'}</b> · {Number(item.duration_hours||0).toFixed(1)} h</p>
    <div className="personal-card-meta"><span>{(item.competencies||[]).length} compétence(s)</span><span>{(item.econ_law_links||[]).length} lien(s) éco-droit</span>{files.length>0&&<span>{files.length} pièce(s)</span>}</div>
    {files.length>0&&<div className="personal-card-files">{files.slice(0,2).map(f=><button key={f.id} onClick={e=>{e.stopPropagation();onDownload(f)}} title={f.file_name}><FileText/>{f.file_name}</button>)}</div>}
    {!readOnly&&onEvaluate&&<button className="personal-evaluate-btn" onClick={e=>{e.stopPropagation();onEvaluate(item)}}><ClipboardCheck/>Évaluer mes élèves</button>}
    <div className="personal-card-footer"><span>{readOnly?<><LockKeyhole/> Consultation seule</>:<>✎ Modifiable</>}</span>{!readOnly&&<div><button title="Dupliquer" onClick={e=>{e.stopPropagation();onDuplicate()}}><Copy/></button><button title="Supprimer" onClick={e=>{e.stopPropagation();onDelete()}}><Trash2/></button></div>}</div>
  </article>
}

function ProgressionEditor({klass,periods,teacherOptions=[],initial=null,onClose,onSaved}){
  const [competencies,setCompetencies]=useState([])
  const [resources,setResources]=useState([])
  const [econ,setEcon]=useState([])
  const [files,setFiles]=useState([])
  const [existingFiles,setExistingFiles]=useState([])
  const [busy,setBusy]=useState(false)
  const [analyzing,setAnalyzing]=useState(false)
  const [aiProgress,setAiProgress]=useState(0)
  const [aiStage,setAiStage]=useState('')
  const [aiSuggestion,setAiSuggestion]=useState(null)
  const [aiChecks,setAiChecks]=useState({})
  const [message,setMessage]=useState('')
  const isEditing=Boolean(initial?.id)
  const initialCodes=competencyCodes(initial?.competencies)
  const [f,setF]=useState({
    item_kind:initial?.item_kind||'context', activity_type:initial?.activity_type||'', custom_activity_type:initial?.custom_activity_type||'',
    period_id:initial?.period_id||periods?.[0]?.code||'P1', context_name:initial?.context_name||'', problematic:initial?.problematic||'', teacher_label:initial?.teacher_label||teacherOptions[0]||'',
    learning_level:initial?.learning_level||'D', status:initial?.status||'Prévu', duration_hours:Number(initial?.duration_hours??initial?.planned_hours??2), cycle_level:initial?.cycle_level||levelToCycle(klass.level_label),
    behavioursText:(initial?.behaviours||[]).join('\n'), knowledgeText:(initial?.knowledge||[]).join('\n'), expectedText:(initial?.expected_results||[]).join('\n'), activities:initial?.activities||'', notes:initial?.notes||'',
    competencyCodes:initialCodes, econ_law_links:normalizeEcon(initial?.econ_law_links||[])
  })

  useEffect(()=>{loadLists()},[klass.diploma_code])
  useEffect(()=>{if(isEditing)loadFiles()},[initial?.id])
  async function loadLists(){
    const [c,l,r]=await Promise.all([
      supabase.from('pp_competencies').select('code,label,group_code').eq('diploma_code',klass.diploma_code).is('parent_code',null).order('sort_order'),
      supabase.from('pp_diploma_econ_law_links').select('econ_law_code').eq('diploma_code',klass.diploma_code),
      supabase.from('pp_competency_resources').select('*').eq('diploma_code',klass.diploma_code)
    ])
    setCompetencies(c.data||[]);setResources(r.data||[])
    const codes=(l.data||[]).map(x=>x.econ_law_code)
    if(codes.length){const {data}=await supabase.from('pp_econ_law_items').select('*').in('code',codes).order('sort_order');setEcon(data||[])}else setEcon([])
  }
  async function loadFiles(){const {data}=await supabase.from('pp_progression_attachments').select('*').eq('progression_item_id',initial.id).order('created_at');setExistingFiles(data||[])}
  function resourceText(codes){const selected=resources.filter(r=>codes.includes(r.competency_code));return {beh:unique(selected.flatMap(r=>r.behaviours||[])).join('\n'),know:unique(selected.flatMap(r=>r.knowledge||[])).join('\n'),res:unique(selected.flatMap(r=>r.expected_results||[])).join('\n')}}
  function refillFromReferential(){const x=resourceText(f.competencyCodes);setF(prev=>({...prev,behavioursText:x.beh,knowledgeText:x.know,expectedText:x.res}))}
  function toggleCode(code){setF(prev=>{const codes=prev.competencyCodes.includes(code)?prev.competencyCodes.filter(x=>x!==code):[...prev.competencyCodes,code];const next={...prev,competencyCodes:codes};if(!prev.behavioursText.trim()&&!prev.knowledgeText.trim()&&!prev.expectedText.trim()){const x=resourceText(codes);next.behavioursText=x.beh;next.knowledgeText=x.know;next.expectedText=x.res}return next})}
  function toggleEcon(code){setF({...f,econ_law_links:f.econ_law_links.includes(code)?f.econ_law_links.filter(x=>x!==code):[...f.econ_law_links,code]})}
  async function removeFile(a){if(!confirm(`Supprimer ${a.file_name} ?`))return;await supabase.storage.from('pp-progression-files').remove([a.storage_path]);await supabase.from('pp_progression_attachments').delete().eq('id',a.id);loadFiles()}
  async function uploadPending(itemId,userId){for(const file of files){const path=`${userId}/${itemId}/${Date.now()}-${safeName(file.name)}`;const {error}=await supabase.storage.from('pp-progression-files').upload(path,file);if(error)throw error;const {error:dbError}=await supabase.from('pp_progression_attachments').insert({progression_item_id:itemId,file_name:file.name,storage_path:path,mime_type:file.type||null,file_size:file.size,uploaded_by:userId});if(dbError)throw dbError}}
  async function analyzeDocument(fileOverride=null){
    const file=fileOverride instanceof File?fileOverride:files[0]
    if(!file){setMessage('Ajoutez un document dans la section Pièces jointes avant de lancer l’analyse.');return}
    setAnalyzing(true);setAiProgress(5);setAiStage('Préparation du document');setMessage('Analyse du document en cours…');setAiSuggestion(null)
    try{
      const {data:{user},error:authError}=await supabase.auth.getUser();if(authError||!user)throw new Error('Connectez-vous pour analyser un document.');setAiProgress(15);setAiStage('Envoi sécurisé du document')
      if(file.size>5_000_000)throw new Error('Document trop volumineux pour l’analyse (maximum 5 Mo).')
      setAiProgress(25);setAiStage('Lecture locale du document')
      const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Lecture du fichier impossible'));reader.readAsDataURL(file)})
      setAiProgress(55);setAiStage('Reconnaissance IA en cours — durée variable')
      const referential=competencies.map(c=>({code:c.code,label:c.label,group:c.group_code,resources:resources.filter(r=>r.competency_code===c.code).map(r=>({behaviours:r.behaviours,knowledge:r.knowledge,expected_results:r.expected_results}))}))
      const {data,error}=await supabase.functions.invoke('analyze-progression-document',{body:{file_data:dataUrl,file_name:file.name,context_name:f.context_name,problematic:f.problematic,referential,economy_law_referential:econ.map(x=>({code:x.code,label:x.question_label}))}})
      if(error){
        let detail=''
        try{const response=error.context;if(response&&typeof response.json==='function'){const payload=await response.json();detail=payload?.message||payload?.error||''}}catch{}
        throw new Error(detail||error.message||'Erreur de communication avec le service IA')
      }
      if(data?.error)throw new Error(data.message||data.error)
      if(!data?.analysis)throw new Error('Aucune proposition reçue.')
      setAiProgress(100);setAiStage('Analyse terminée — propositions prêtes')
      const analysis=data.analysis
      const normalize=v=>String(v||'').trim().toLocaleLowerCase('fr')
      const matched=(Array.isArray(analysis.selections)?analysis.selections:[]).length?analysis.selections:(Array.isArray(analysis.competencies)?analysis.competencies:[]).map(entry=>{
        const raw=typeof entry==='string'?entry:(entry.code||entry.competence_code||entry.competence||'')
        const ref=competencies.find(c=>normalize(c.code)===normalize(raw)||normalize(c.label)===normalize(raw))
        if(!ref)return null
        const resourcesFor=resources.filter(x=>x.competency_code===ref.code)
        const flatten=key=>unique(resourcesFor.flatMap(x=>Array.isArray(x[key])?x[key]:[]))
        return {group_code:ref.group_code,competence:ref.code,competence_label:ref.label,behaviours:flatten('behaviours'),knowledge:flatten('knowledge'),expected_results:flatten('expected_results')}
      }).filter(Boolean)
      const economySelections=(analysis.economy_law_selections||[]).length?analysis.economy_law_selections:(analysis.econ_law_links||[]).map(code=>{const match=econ.find(x=>x.code===code);return match?{module_code:match.code,question:match.question_label}:null}).filter(Boolean)
      setAiSuggestion({...analysis,selections:matched,economy_law_selections:economySelections});setAiChecks({});setMessage(matched.length||economySelections.length?'Propositions reçues : décochez les éléments non pertinents avant de les appliquer.':'Analyse terminée, mais aucune compétence du référentiel n’a été reconnue. Vérifiez le document et les références.')
    }catch(e){setAiStage('Analyse interrompue');setMessage('Analyse IA indisponible : '+err(e))}finally{setAnalyzing(false)}
  }
  function aiChecked(key){return aiChecks[key]!==false}
  function aiToggle(key){setAiChecks(p=>({...p,[key]:!aiChecked(key)}))}
  function aiSelections(){return (aiSuggestion?.selections||[]).filter((v,i)=>aiChecked('s'+i))}
  function applyAiSuggestion(){
    const a=aiSuggestion;if(!a)return
    const selected=(a.selections||[]).map((v,i)=>({v,i})).filter(({i})=>aiChecked('s'+i))
    const normalize=v=>String(v||'').trim().toLocaleLowerCase('fr')
    const codes=selected.map(({v})=>competencies.find(c=>normalize(c.code)===normalize(v.competence)||normalize(c.label)===normalize(v.competence))?.code).filter(Boolean)
    const fallback=(Array.isArray(a.competencies)?a.competencies:[]).map(x=>typeof x==='string'?x:x.code||x.competence_code).filter(x=>competencies.some(c=>c.code===x))
    const values=(kind)=>selected.flatMap(({v,i})=>(v[kind]||[]).filter((x,j)=>aiChecked(i+':'+kind+':'+j)))
    const arr=x=>Array.isArray(x)?x.join('\\n'):typeof x==='string'?x:''
    const econCodes=(a.economy_law_selections||[]).map((v,i)=>aiChecked('ed'+i)?econ.find(x=>x.code===v.module_code||normalize(x.question_label)===normalize(v.question))?.code:null).filter(Boolean)
    const hasSelection=selected.length>0
    setF(prev=>({...prev,context_name:a.suggested_context_name||a.context_name||prev.context_name,problematic:a.suggested_problematic||a.problematic||prev.problematic,activities:arr(a.suggested_activities||a.activities)||prev.activities,competencyCodes:codes.length?unique([...prev.competencyCodes,...codes]):fallback.length?unique([...prev.competencyCodes,...fallback]):prev.competencyCodes,behavioursText:hasSelection?unique([...lines(prev.behavioursText),...values('behaviours')]).join('\\n'):arr(a.behaviours||a.professional_behaviours)||prev.behavioursText,knowledgeText:hasSelection?unique([...lines(prev.knowledgeText),...values('knowledge')]).join('\\n'):arr(a.knowledge||a.associated_knowledge||a.savoirs_associes)||prev.knowledgeText,expectedText:hasSelection?unique([...lines(prev.expectedText),...values('expected_results')]).join('\\n'):arr(a.expected_results)||prev.expectedText,econ_law_links:unique([...prev.econ_law_links,...econCodes,...(Array.isArray(a.econ_law_links)?a.econ_law_links.filter(x=>econ.some(y=>y.code===x)):[])]),learning_level:['D','E','A','M'].includes(a.suggested_level)?a.suggested_level:prev.learning_level}))
    setAiSuggestion(null);setMessage('Propositions sélectionnées appliquées. Vérifiez les champs avant d’enregistrer.')
  }
  async function submit(e){
    e.preventDefault();setBusy(true);setMessage('')
    try{
      const {data:{user}}=await supabase.auth.getUser();const beh=lines(f.behavioursText),know=lines(f.knowledgeText),res=lines(f.expectedText)
      const selected=competencies.filter(c=>f.competencyCodes.includes(c.code)).map(c=>({code:c.code,comp:c.label,group:c.group_code,personal_group:PERSONAL_GROUP_CODE[c.group_code]||c.group_code,level:f.learning_level,beh,know,res}))
      const primary=selected[0]
      const payload={item_kind:f.item_kind,activity_type:f.item_kind==='event'?(f.activity_type||null):null,custom_activity_type:f.item_kind==='event'&&f.activity_type==='Autre'?(f.custom_activity_type||null):null,period_id:f.period_id,context_name:f.context_name,problematic:f.problematic||null,teacher_label:f.teacher_label||null,group_code:primary?.personal_group||primary?.group||null,learning_level:f.learning_level,status:f.status,duration_hours:Number(f.duration_hours||0),behaviours:beh,knowledge:know,expected_results:res,activities:f.activities||null,notes:f.notes||null,competencies:selected,cycle_level:f.cycle_level,econ_law_links:f.econ_law_links,sort_order:Number(initial?.sort_order||10),updated_at:new Date().toISOString()}
      let itemId=initial?.id
      if(isEditing){
        const {data,error}=await supabase.from('pp_progression_items').update(payload).eq('id',initial.id).eq('revision',Number(initial.revision||1)).select('id,revision').maybeSingle()
        if(error)throw error
        if(!data){setMessage('Ce contexte a été modifié par un autre enseignant depuis son ouverture. Fermez cette fenêtre puis rouvrez le contexte pour récupérer la dernière version avant de modifier à nouveau.');return}
      }else{
        const {data,error}=await supabase.from('pp_progression_items').insert({...payload,class_id:klass.id,created_by:user.id}).select('id,revision').single();if(error)throw error;itemId=data.id
      }
      if(files.length)await uploadPending(itemId,user.id);onSaved()
    }catch(e){setMessage(err(e))}finally{setBusy(false)}
  }

  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal progression-editor-modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">Progression personnelle</span><h3>{isEditing?'Modifier':'Ajouter'} un contexte / évènement</h3></div><button onClick={onClose}><X/></button></div><form onSubmit={submit} className="progression-editor-form">
    <div className="editor-section"><h4>1. Identification</h4><div className="form-grid"><label>Type<select value={f.item_kind} onChange={e=>setF({...f,item_kind:e.target.value})}><option value="context">Contexte pédagogique</option><option value="event">Évènement / activité</option></select></label>{f.item_kind==='event'&&<label>Type d’activité<select value={f.activity_type} onChange={e=>setF({...f,activity_type:e.target.value})}><option value="">Choisir…</option><option>Oral post-PFMP</option><option>PFMP</option><option>Évaluation</option><option>Sortie pédagogique</option><option>Autre</option></select></label>}<label className="full">Nom du contexte / activité<input value={f.context_name} onChange={e=>setF({...f,context_name:e.target.value})} required/></label><label className="full">Problématique<textarea rows="2" value={f.problematic} onChange={e=>setF({...f,problematic:e.target.value})}/></label><label>Période<select value={f.period_id} onChange={e=>setF({...f,period_id:e.target.value})}>{periods.map(p=><option key={p.id} value={p.code}>{p.code} — {p.label}</option>)}</select></label><label>Enseignant(s)<input list="teacher-options" value={f.teacher_label} onChange={e=>setF({...f,teacher_label:e.target.value})} placeholder="M. … / Mme …"/><datalist id="teacher-options">{teacherOptions.map(n=><option value={n} key={n}/>)}</datalist></label><label>Niveau d’apprentissage<select value={f.learning_level} onChange={e=>setF({...f,learning_level:e.target.value})}>{LEARNING.map(([k,l])=><option key={k} value={k}>{k} — {l}</option>)}</select></label><label>Statut<select value={f.status} onChange={e=>setF({...f,status:e.target.value})}>{STATUS.map(s=><option key={s}>{s}</option>)}</select></label><label>Durée prévue (h)<input type="number" min="0" step="0.5" value={f.duration_hours} onChange={e=>setF({...f,duration_hours:e.target.value})}/></label><label>Niveau de classe<select value={f.cycle_level} onChange={e=>setF({...f,cycle_level:e.target.value})}><option value="seconde">Seconde</option><option value="premiere">Première</option><option value="terminale">Terminale</option></select></label></div></div>
    <div className="editor-section"><h4>2. Compétences du référentiel</h4><p className="muted">Le référentiel officiel de la classe est chargé automatiquement. Les comportements, savoirs et résultats attendus peuvent être préremplis comme dans votre version personnelle.</p><div className="competency-choice-grid">{competencies.map(c=><button type="button" key={c.code} className={f.competencyCodes.includes(c.code)?'competency-choice selected':'competency-choice'} onClick={()=>toggleCode(c.code)}><span style={{borderLeft:`4px solid ${GROUP_STYLE[c.group_code]?.color||'#94A3B8'}`}}>{GROUP_STYLE[c.group_code]?.personal||c.group_code}</span><b>{c.code}</b><small>{c.label}</small></button>)}</div></div>
    <div className="editor-section"><div className="editor-section-title"><h4>3. Éléments pédagogiques</h4><button type="button" className="btn small" onClick={refillFromReferential} disabled={!f.competencyCodes.length}><RefreshCw/>Préremplir depuis le référentiel</button></div><div className="form-grid"><label>Comportements professionnels <small>1 par ligne</small><textarea rows="6" value={f.behavioursText} onChange={e=>setF({...f,behavioursText:e.target.value})}/></label><label>Savoirs mobilisés <small>1 par ligne</small><textarea rows="6" value={f.knowledgeText} onChange={e=>setF({...f,knowledgeText:e.target.value})}/></label><label className="full">Résultats attendus <small>1 par ligne</small><textarea rows="5" value={f.expectedText} onChange={e=>setF({...f,expectedText:e.target.value})}/></label><label className="full">Activités prévues<textarea rows="7" value={f.activities} onChange={e=>setF({...f,activities:e.target.value})} placeholder="- Activité 1\n- Activité 2…"/></label><label className="full">Notes enseignant<textarea rows="3" value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/></label></div></div>
    <div className="editor-section"><h4>4. Transversalités économie-droit</h4><div className="econ-choice-grid">{econ.map(x=><button type="button" key={x.code} className={f.econ_law_links.includes(x.code)?'econ-choice selected':'econ-choice'} onClick={()=>toggleEcon(x.code)}><b>{x.code}</b><span>{x.question_label}</span></button>)}{!econ.length&&<div className="small-empty">Aucun lien économie-droit configuré pour ce diplôme.</div>}</div></div>
    <div className="editor-section"><h4>5. Pièces jointes</h4>{existingFiles.length>0&&<div className="attachment-list">{existingFiles.map(a=><div key={a.id}><FileText/><span>{a.file_name}</span><button type="button" className="icon-btn danger-text" onClick={()=>removeFile(a)}><Trash2/></button></div>)}</div>}<label className="file-drop"><Upload/><span>Ajouter des fichiers au contexte</span><input type="file" multiple onChange={e=>{const chosen=[...e.target.files];setFiles(chosen);if(chosen.length)analyzeDocument(chosen[0])}}/><small>{files.length?`${files.length} nouveau(x) fichier(s) sélectionné(s)`:'PDF, Word, Excel, PowerPoint, images…'}</small></label></div>
    <div className="editor-section"><h4>6. Analyse IA du document</h4><p className="muted">L’analyse démarre automatiquement après sélection d’un document compatible. Vous pouvez aussi la relancer manuellement. Les propositions restent à vérifier et ne sont jamais enregistrées automatiquement.</p>{(analyzing||aiProgress===100)&&<div className="ai-progress-box" role="status" aria-live="polite"><div className="ai-progress-head"><strong>{aiStage}</strong><strong>{aiProgress}%</strong></div><div className="ai-progress-track" role="progressbar" aria-label="Progression de la reconnaissance IA" aria-valuenow={aiProgress} aria-valuemin="0" aria-valuemax="100"><div className="ai-progress-fill" style={{width:aiProgress+'%'}}/></div><small>{analyzing&&aiProgress===55?'L’IA traite le document. Le pourcentage avancera à la réception du résultat.':'Étapes de préparation et de traitement du document'}</small></div>}<button type="button" className="btn primary" onClick={()=>analyzeDocument()} disabled={analyzing||busy||!files.length}>{analyzing?'Analyse en cours…':'✨ Analyser le document avec l’IA'}</button>{aiSuggestion&&<div className="ai-proposal"><h4>Propositions IA à vérifier {aiSuggestion.confidence&&<small>· Confiance : {aiSuggestion.confidence}</small>}</h4>{aiSuggestion.rationale&&<p className="muted">{aiSuggestion.rationale}</p>}{(aiSuggestion.selections||[]).map((v,i)=><div key={i} className="ai-review-card"><label><input type="checkbox" checked={aiChecked('s'+i)} onChange={()=>aiToggle('s'+i)}/><strong>{v.group_code} · {v.competence_label||v.competence}</strong> <small>{v.confidence||''}</small></label>{v.competence_evidence&&<p className="muted">Justification : {v.competence_evidence}</p>}{[['behaviours','Comportements professionnels','behaviour_evidence'],['knowledge','Savoirs associés','knowledge_evidence'],['expected_results','Résultats attendus','result_evidence']].map(([kind,label,evidence])=><div key={kind}><strong>{label}</strong>{(v[kind]||[]).map((x,j)=><label key={j} className="ai-review-item"><input type="checkbox" checked={aiChecked(i+':'+kind+':'+j)} onChange={()=>aiToggle(i+':'+kind+':'+j)}/><span>{x}{(v[evidence]||[]).find(e=>e.label===x)?.evidence&&<small>Preuve : {(v[evidence]||[]).find(e=>e.label===x).evidence}</small>}</span></label>)}</div>)}</div>)}{(aiSuggestion.economy_law_selections||[]).length>0&&<div className="ai-review-card"><strong>Transversalités Économie-Droit</strong>{aiSuggestion.economy_law_selections.map((v,i)=><label className="ai-review-item" key={i}><input type="checkbox" checked={aiChecked('ed'+i)} onChange={()=>aiToggle('ed'+i)}/><span>{v.module_code} · {v.question}<small>{v.question_evidence||''}</small></span></label>)}</div>}<button type="button" className="btn primary" onClick={applyAiSuggestion}>Appliquer uniquement les propositions cochées</button><button type="button" className="btn ghost" onClick={()=>setAiSuggestion(null)}>Ignorer</button></div>}</div>
    {message&&<div className="form-message">{message}</div>}<div className="modal-actions"><button type="button" className="btn ghost" onClick={onClose}>Annuler</button><button className="btn primary" disabled={busy}><Save/>{busy?'Enregistrement…':'Enregistrer'}</button></div>
  </form></div></div>
}

function levelToCycle(label){const v=String(label||'').toLowerCase();if(v.includes('term'))return 'terminale';if(v.includes('2'))return 'seconde';return 'premiere'}
function normalizeEcon(arr){return (Array.isArray(arr)?arr:[]).map(x=>typeof x==='string'?x:(x.code||x.econ_law_code||null)).filter(Boolean)}
