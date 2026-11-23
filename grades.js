(() => {
  'use strict';
  const STORAGE_KEY = 'deadline.student.grades.v2';
  const TASK_KEY = 'deadline.student.tasks.v1';
  const MAX_COURSES = 50, MAX_ITEMS = 60;
  const $ = id => document.getElementById(id);
  const math = globalThis.GradeCalcMath;
  const types = {test:'Kontrolltöö', exam:'Eksam', homework:'Kodutöö', project:'Projekt', other:'Muu'};
  const esc = text => String(text??'').replace(/[&<>"']/g, x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const fmt = value => new Intl.NumberFormat('et-EE',{maximumFractionDigits:1}).format(value);
  const newId = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `gc-${Date.now()}-${Math.random().toString(36).slice(2,12)}`);
  let courses = [], activeId = null, editingCourseId = null, editingItemId = null, storageError = false;
  function validNumber(n, min, max) { return typeof n === 'number' && Number.isFinite(n) && n>=min && n<=max; }
  function validateCourses(raw) {
    if (!Array.isArray(raw) || raw.length > MAX_COURSES) throw new Error('Vigane ainete loend');
    const ids = new Set();
    for(const course of raw){
      if(!course||typeof course!=='object'||Array.isArray(course)||typeof course.id!=='string'||!/^[-a-zA-Z0-9_]{1,100}$/.test(course.id)||ids.has(course.id)||typeof course.name!=='string'||!course.name.trim()||course.name.length>100||!validNumber(course.target,0,100)||!Array.isArray(course.assessments)||course.assessments.length>MAX_ITEMS) throw new Error('Vigane aine');
      ids.add(course.id);
      const itemIds = new Set();
      for(const item of course.assessments){
        if(!item||typeof item!=='object'||Array.isArray(item)||typeof item.id!=='string'||!/^[-a-zA-Z0-9_]{1,100}$/.test(item.id)||itemIds.has(item.id)||typeof item.name!=='string'||!item.name.trim()||item.name.length>100||!Object.hasOwn(types,item.kind)||!validNumber(item.weight,.1,100)||Math.round(item.weight*10)!==item.weight*10||!(item.score===null||validNumber(item.score,0,100)))throw new Error('Vigane hindekomponent');
        itemIds.add(item.id);
      }
    }
    return raw;
  }
  function load() {
    try {
      const stored=localStorage.getItem(STORAGE_KEY);
      if(!stored) return [];
      return validateCourses(JSON.parse(stored));
    } catch(error){storageError=true;return [];} // Never overwrite invalid storage automatically.
  }
  function update(next) {
    try {
      validateCourses(next);
      if(storageError) throw Error('Existing storage requires repair');
      localStorage.setItem(STORAGE_KEY,JSON.stringify(next));
      courses=next; render();return true;
    }catch(error){announce('Salvestamine ebaõnnestus. Muudatusi ei tehtud.');return false;}
  }
  function announce(message) {
    $('toastText').textContent=message;
    $('toastAction').hidden=true;
    $('toast').hidden=false;
  }
  function clone(data) { return JSON.parse(JSON.stringify(data)); }
  // A shared transactional helper used by the plain and encrypted backup importers.
  function restoreBundle(tasks,newCourses) {
    if(!Array.isArray(tasks)||tasks.length>5000)throw Error('Vigased tähtajad');
    if(newCourses!==null)validateCourses(newCourses);
    const oldTasks=localStorage.getItem(TASK_KEY),oldCourses=localStorage.getItem(STORAGE_KEY);
    try {
      localStorage.setItem(TASK_KEY,JSON.stringify(tasks));
      if(newCourses!==null)localStorage.setItem(STORAGE_KEY,JSON.stringify(newCourses));
    }catch(err){
      try{if(oldTasks===null)localStorage.removeItem(TASK_KEY);else localStorage.setItem(TASK_KEY,oldTasks);
          if(newCourses!==null){if(oldCourses===null)localStorage.removeItem(STORAGE_KEY);else localStorage.setItem(STORAGE_KEY,oldCourses);}}catch(_e){}
      throw err;
    }
  }
  globalThis.DeadlineGrades={
    snapshot:()=>clone(courses),validateCourses,restoreBundle,
    storageKey:STORAGE_KEY
  };
  function renderList() {
    const list=$('gcCourseList');
    if(!courses.length){list.innerHTML='<p class="gc-side-empty">Sinu ainete loend on tühi.</p>';return;}
    list.innerHTML=courses.map(c=>{
      const r=math.compute(c);
      const summary=r.state==='complete'?`${fmt(r.finalGrade)}% lõpptulemus`:`${fmt(r.knownWeight)}% hinnatud`;
      return `<button type="button" class="gc-course-choice ${c.id===activeId?'active':''}" data-course-id="${esc(c.id)}" aria-pressed="${c.id===activeId}"><span class="gc-course-dot"></span><span class="gc-choice-name">${esc(c.name)}<small>${summary}</small></span><span class="gc-choice-arrow">›</span></button>`;
    }).join('');
  }
  function message(result) {
    const f=fmt, t=fmt(result.target);
    switch(result.state){
      case 'underweight': return {tone:'warn',eyebrow:'OSAKAALUD POLE TÄIELIKUD',value:`${f(result.weight)}% / 100%`,detail:`Lisa veel ${f(100-result.weight)}% ulatuses hindamiskomponente. Eksamihinnet ei saa enne täpselt arvutada.`};
      case 'overweight': return {tone:'danger',eyebrow:'OSAKAALUD ÜLETAVAD 100%',value:`${f(result.weight)}% / 100%`,detail:'Paranda osakaale nii, et nende summa oleks täpselt 100%.'};
      case 'multiple-pending':return {tone:'neutral',eyebrow:'VAJA ON ROHKEM TULEMUSI',value:'Tulemus veel lahtine',detail:'Täpset eksamihinnet saab arvutada, kui ainult üks tulemus on teadmata ja see on eksam. Sisesta ülejäänud tööde tulemused.'};
      case 'complete':return {tone:result.finalGrade+1e-9>=result.target?'good':'warn',eyebrow:'AINE LÕPPTULEMUS',value:`${f(result.finalGrade)}%`,detail:result.finalGrade+1e-9>=result.target?`Saavutasid soovitud ${t}% tulemuse.`:`Soovitud ${t}% tulemus jäi saavutamata.`};
      case 'impossible':return {tone:'danger',eyebrow:'SOOVITUD TULEMUS POLE VÕIMALIK',value:`${f(result.required)}%`,detail:`Eksamil oleks vaja üle 100%. Parim võimalik aine lõpptulemus on ${f(result.maxPossible)}%.`};
      case 'secured':return {tone:'good',eyebrow:'SOOVITUD TULEMUS JUBA KÄES',value:'0%',detail:`Soovitud ${t}% on juba saavutatud ka siis, kui eksamilt saad 0%. Kontrolli eraldi eksami läbimise miinimumnõuet.`};
      default:return {tone:'good',eyebrow:'EKSAMIL VAJA VÄHEMALT',value:`${f(result.displayRequired)}%`,detail:`Nii jõuad aine lõpphindeni vähemalt ${t}%. Eksami osakaal: ${f(result.exam.weight)}%.`};
    }
  }
  function renderDetail(){
    const root=$('gcDetails');
    const course=courses.find(x=>x.id===activeId);
    if(!course){root.innerHTML=`<div class="gc-empty"><div class="gc-empty-symbol">∑</div><h3>Lisa esimene õppeaine</h3><p>Lisa aine ja hinde moodustavad tööd. Seejärel arvutame soovitud eksamitulemuse.</p><button type="button" class="btn btn-primary" data-gc-action="new-course">+ Lisa aine</button></div>`;return;}
    const result=math.compute(course),note=message(result);
    root.innerHTML=`
    <div class="gc-details-header"><div><span class="eyebrow">AINE HINNETE ARVESTUS</span><h2>${esc(course.name)}</h2><span class="gc-muted">Eesmärk: ${fmt(course.target)}% kursuse lõpphindest</span></div><div class="gc-header-buttons"><button type="button" class="gc-mini-btn" data-gc-action="edit-course">Muuda ainet</button><button type="button" class="gc-mini-btn gc-delete" data-gc-action="delete-course">Kustuta</button></div></div>
    <div class="gc-kpi-grid"><div class="gc-kpi"><small>Hinnatud tööde keskmine</small><strong>${result.gradedAverage===null?'—':fmt(result.gradedAverage)+'%'}</strong><span>Juba hinnatud tööde põhjal</span></div><div class="gc-kpi"><small>Kaalutud punktid</small><strong>${fmt(result.weightedPoints)} <i>/ 100</i></strong><span>Kogutud lõpphinde punktid</span></div><div class="gc-kpi"><small>Hinnatud osakaal</small><strong>${fmt(result.knownWeight)}%</strong><span>Ülejäänud: ${fmt(Math.max(0,100-result.knownWeight))}%</span></div></div>
    <div class="gc-weight-wrap"><div class="gc-weight-label"><span>Osakaalude summa</span><strong class="${result.weight>100?'gc-text-danger':''}">${fmt(result.weight)}% / 100%</strong></div><progress max="100" value="${Math.min(100,result.weight)}">${fmt(result.weight)}%</progress></div>
    <div class="gc-result gc-tone-${note.tone}" role="status" aria-live="polite"><div class="gc-result-overline">${note.eyebrow}</div><div class="gc-result-big">${note.value}</div><p>${note.detail}</p></div>
    <div class="gc-components-heading"><div><span class="eyebrow">HINDE KOMPONENDID</span><h3>Kontrolltööd ja eksam</h3></div><button type="button" class="btn btn-primary" data-gc-action="add-item">+ Lisa töö</button></div>
    <div class="gc-items">${course.assessments.length?course.assessments.map(item=>`<article class="gc-item"><span class="gc-item-symbol ${item.kind}">${item.kind==='exam'?'E':item.kind==='test'?'K':item.kind==='homework'?'T':item.kind==='project'?'P':'M'}</span><div class="gc-item-name"><strong>${esc(item.name)}</strong><small>${types[item.kind]}</small></div><div class="gc-item-weight"><small>Osakaal</small><strong>${fmt(item.weight)}%</strong></div><div class="gc-item-score"><small>Tulemus</small><strong class="${item.score===null?'gc-muted':''}">${item.score===null?'Ootel':fmt(item.score)+'%'}</strong></div><div class="gc-item-actions"><button type="button" class="gc-icon-btn" data-gc-action="edit-item" data-item-id="${esc(item.id)}" aria-label="Muuda ${esc(item.name)}" title="Muuda">✎</button><button type="button" class="gc-icon-btn gc-delete" data-gc-action="delete-item" data-item-id="${esc(item.id)}" aria-label="Kustuta ${esc(item.name)}" title="Kustuta">×</button></div></article>`).join(''):'<div class="gc-items-empty">Lisa kontrolltöö, kodutöö või eksam. Tulemust teadmata jättes arvestatakse see veel hindamata tööks.</div>'}</div>
    <p class="gc-disclaimer">Arvutus eeldab kaalude summat 100% ja tulemusi vahemikus 0–100%. Õppeaine eraldi miinimumnõuded (näiteks eksami kohustuslik läbimine) ei ole arvutuses sees.</p>`;
  }
  function render(){
    if(!courses.some(c=>c.id===activeId)) activeId=courses[0]?.id||null;
    $('gcStorageError').hidden=!storageError;
    renderList(); renderDetail();
  }
  function openCourse(id=null){
    editingCourseId=id;
    const c=courses.find(x=>x.id===id);
    $('gcCourseForm').reset();
    $('gcCourseDialogTitle').textContent=c?'Muuda õppeainet':'Uus õppeaine';
    $('gcCourseName').value=c?.name??'';
    $('gcCourseTarget').value=c?.target??80;
    $('gcCourseError').textContent='';$('gcCourseError').hidden=true;
    $('gcCourseDialog').showModal();$('gcCourseName').focus();
  }
  function openItem(id=null){
    const c=courses.find(x=>x.id===activeId);if(!c)return;
    editingItemId=id;
    const item=c.assessments.find(x=>x.id===id);
    $('gcItemForm').reset();
    $('gcItemDialogTitle').textContent=item?'Muuda tööd':'Lisa hinde komponent';
    $('gcItemName').value=item?.name??'';
    $('gcItemKind').value=item?.kind??'test';
    $('gcItemWeight').value=item?.weight??'';
    $('gcItemScore').value=item?.score??'';
    $('gcItemError').textContent='';$('gcItemError').hidden=true;
    $('gcItemDialog').showModal();$('gcItemName').focus();
  }
  const error=(id,msg)=>{$(id).textContent=msg;$(id).hidden=!msg;};
  function numberField(id,allowEmpty=false){
    const value=$(id).value.trim().replace(',','.');
    if(allowEmpty&&value==='')return null;
    if(value==='')return NaN;
    return Number(value);
  }
  $('gcCourseForm').addEventListener('submit',event=>{
    event.preventDefault();
    const name=$('gcCourseName').value.trim(),target=numberField('gcCourseTarget');
    if(!name||name.length>100||!validNumber(target,0,100)){error('gcCourseError','Sisesta aine nimi ja eesmärk vahemikus 0–100%.');return;}
    if(!editingCourseId&&courses.length>=MAX_COURSES){error('gcCourseError','Ainete piir on 50.');return;}
    const id=editingCourseId??newId();
    const next=editingCourseId?courses.map(c=>c.id===id?{...c,name,target}:c):[...courses,{id,name,target,assessments:[]}];
    if(update(next)){activeId=id;$('gcCourseDialog').close();render();announce(editingCourseId?'Aine uuendatud':'Aine lisatud');}
  });
  $('gcItemForm').addEventListener('submit',event=>{
    event.preventDefault();
    const course=courses.find(c=>c.id===activeId);if(!course)return;
    const name=$('gcItemName').value.trim(),kind=$('gcItemKind').value,weight=numberField('gcItemWeight'),score=numberField('gcItemScore',true);
    if(!name||name.length>100||!Object.hasOwn(types,kind)||!validNumber(weight,.1,100)||!Number.isInteger(Math.round(weight*10))||Math.abs(weight*10-Math.round(weight*10))>1e-8||!(score===null||validNumber(score,0,100))){error('gcItemError','Sisesta nimi, osakaal 0,1–100% (üks kümnendkoht) ja tulemus 0–100% või jäta tulemus tühjaks.');return;}
    if(!editingItemId&&course.assessments.length>=MAX_ITEMS){error('gcItemError','Ühes aines saab olla kuni 60 tööd.');return;}
    const id=editingItemId??newId();
    const item={id,name,kind,weight:Math.round(weight*10)/10,score};
    const entries=editingItemId?course.assessments.map(x=>x.id===id?item:x):[...course.assessments,item];
    if(update(courses.map(c=>c.id===activeId?{...c,assessments:entries}:c))){$('gcItemDialog').close();announce(editingItemId?'Töö uuendatud':'Töö lisatud');}
  });
  $('gcCourseList').addEventListener('click',event=>{
    const button=event.target.closest('button[data-course-id]');
    if(!button)return;activeId=button.dataset.courseId;render();
  });
  $('gcDetails').addEventListener('click',event=>{
    const button=event.target.closest('button[data-gc-action]');if(!button)return;
    const course=courses.find(x=>x.id===activeId);
    switch(button.dataset.gcAction){
      case 'new-course':openCourse();break;
      case 'edit-course':openCourse(activeId);break;
      case 'add-item':openItem();break;
      case 'edit-item':openItem(button.dataset.itemId);break;
      case 'delete-course':
        if(course&&confirm(`Kas kustutan aine „${course.name}” ja kõik selle hinded?`)){
          if(update(courses.filter(c=>c.id!==activeId)))announce('Aine kustutatud');
        }break;
      case 'delete-item':
        if(course&&confirm('Kas kustutan selle töö hinde arvestusest?')){
          if(update(courses.map(c=>c.id===activeId?{...c,assessments:c.assessments.filter(x=>x.id!==button.dataset.itemId)}:c)))announce('Töö kustutatud');
        }break;
    }
  });
  $('gcAddCourse').addEventListener('click',()=>openCourse());
  $('gcDemo').addEventListener('click',()=>{
    if(courses.length>=MAX_COURSES)return announce('Ainete piir on 50.');
    const id=newId();
    const example={id,name:'Näide: Majandusteooria',target:80,assessments:[
      {id:newId(),name:'Kontrolltöö 1',kind:'test',weight:30,score:80},
      {id:newId(),name:'Kontrolltöö 2',kind:'test',weight:30,score:70},
      {id:newId(),name:'Lõpueksam',kind:'exam',weight:40,score:null}
    ]};
    if(update([...courses,example])){activeId=id;render();announce('Näidisaine lisatud – eksamil on vaja 87,5%.');}
  });
  ['gcCloseCourse','gcCancelCourse'].forEach(id=>$(id).addEventListener('click',()=>$('gcCourseDialog').close()));
  ['gcCloseItem','gcCancelItem'].forEach(id=>$(id).addEventListener('click',()=>$('gcItemDialog').close()));
  courses=load();
  render();
})();