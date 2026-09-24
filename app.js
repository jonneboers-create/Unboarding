(function(){
"use strict";
var HEAD='<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<title>Onboarding nieuwe medewerkers</title>\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">';
var LS_KEY='onboarding-dashboard-state';
var state=JSON.parse(JSON.stringify(DEFAULT_STATE));
var ui={sel:null,q:'',role:'Alle',openOnly:false,openNotes:{}};
try{var s=sessionStorage.getItem('onb-ui');if(s){var p=JSON.parse(s);ui.sel=p.sel||null;ui.role=p.role||'Alle';ui.openOnly=!!p.openOnly;}}catch(e){}
var saveMode='idle'; // idle | saving | saved | local | readonly
var readOnly=false, dirty=false, timer=null;
var root=document.getElementById('root');

try{var raw=localStorage.getItem(LS_KEY);if(raw){var ls=JSON.parse(raw);if(ls&&ls.hires)state=ls;}}catch(e){}

/* ---------- helpers ---------- */
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function parseD(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2]);}
function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function today(){var d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate());}
function addDays(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x;}
function diff(a,b){return Math.round((a-b)/86400000);}
function fmt(d){return d.toLocaleDateString('nl-NL',{weekday:'short',day:'numeric',month:'short'});}
function fmtLong(s){return parseD(s).toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'});}
function hire(id){for(var i=0;i<state.hires.length;i++)if(state.hires[i].id===id)return state.hires[i];return null;}
function uid(){return 'h'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function dayNo(h){return diff(today(),parseD(h.start));}
function itemsFor(h){return state.items.concat((h.extra||[]).map(function(x){return Object.assign({own:true},x);}));}
function progress(h,faseId){var its=itemsFor(h).filter(function(i){return !faseId||i.fase===faseId;});var d=its.filter(function(i){return h.done[i.id];}).length;return{done:d,total:its.length,pct:its.length?Math.round(d/its.length*100):0};}
function lateItems(h){var t=today(),st=parseD(h.start);return itemsFor(h).filter(function(i){return !h.done[i.id]&&addDays(st,i.dag)<t;});}
function currentPhase(h){var n=dayNo(h);var ph=state.phases;if(n<ph[0].van)return{label:'Nog niet begonnen',idx:-1};for(var i=0;i<ph.length;i++){if(n>=ph[i].van&&n<=ph[i].tot)return{label:ph[i].naam,idx:i};}return{label:'Periode voorbij',idx:ph.length};}
function nextAction(h){var st=parseD(h.start);var open=itemsFor(h).filter(function(i){return !h.done[i.id];}).sort(function(a,b){return a.dag-b.dag;});if(!open.length)return null;var i=open[0];return{item:i,due:addDays(st,i.dag)};}
function roles(h){var r=[];(h?itemsFor(h):state.items).forEach(function(i){if(r.indexOf(i.wie)<0)r.push(i.wie);});return r;}
function dayLabel(h){var n=dayNo(h);if(n<0)return 'Start over '+(-n)+(n===-1?' dag':' dagen');if(n===0)return 'Vandaag eerste dag';return 'Dag '+(n+1);}
function stashUi(){try{sessionStorage.setItem('onb-ui',JSON.stringify({sel:ui.sel,role:ui.role,openOnly:ui.openOnly}));}catch(e){}}

var ICON_CHECK='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"/></svg>';
var ICON_PEN='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M10.8 2.7l2.5 2.5L6 12.5l-3.2.7.7-3.2z"/></svg>';

/* ---------- saving ---------- */
function markDirty(){
  if(readOnly)return;
  state.updated=new Date().toISOString();
  dirty=true;
  clearTimeout(timer);
  timer=setTimeout(save,2200);
  setSave('saving');
}
function save(){
  if(!dirty)return;
  try{localStorage.setItem(LS_KEY,JSON.stringify(state));dirty=false;setSave('saved');}
  catch(e){setSave('error');}
}
function download(name,text,type){
  var blob=new Blob([text],{type:type||'application/json'});
  var url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=name;document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(url);a.remove();},0);
}
function exportJson(){
  var d=new Date(),n='onboarding-'+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'.json';
  download(n,JSON.stringify(state,null,2));
}
function importJson(file){
  var r=new FileReader();
  r.onload=function(){
    try{
      var d=JSON.parse(r.result);
      if(!d||!d.hires||!d.items||!d.phases)throw 0;
      if(state.hires.length&&!confirm('Dit vervangt de gegevens die nu in deze browser staan. Doorgaan?'))return;
      state=d;ui.sel=null;markDirty();render();
    }catch(e){alert('Dit bestand kon niet worden gelezen. Kies een JSON-bestand dat met de exportknop is gemaakt.');}
  };
  r.readAsText(file);
}
function setSave(m){saveMode=m;var el=document.getElementById('saveChip');if(el)el.outerHTML=saveChip();}
function saveChip(){
  var t={idle:'Gegevens staan in deze browser',saving:'Opslaan…',saved:'Opgeslagen in deze browser',local:'Gegevens staan in deze browser',readonly:'Alleen lezen',error:'Opslaan mislukt, geheugen van de browser is mogelijk vol'}[saveMode]||'';
  return '<div class="save '+saveMode+'" id="saveChip"><i></i>'+esc(t)+'</div>';
}

/* ---------- render ---------- */
function render(){
  if(ui.sel&&!hire(ui.sel))ui.sel=null;
  root.className=ui.sel?'detail':'over';
  root.innerHTML='<aside class="side">'+renderSide()+'</aside><main class="main" id="main"><div class="wrap">'+(ui.sel?renderDetail(hire(ui.sel)):renderOverview())+'</div></main>';
}
function renderSide(){
  var q=ui.q.toLowerCase();
  var list=state.hires.filter(function(h){return !q||(h.naam+' '+h.functie+' '+h.afdeling).toLowerCase().indexOf(q)>=0;});
  var running=list.filter(function(h){return progress(h).pct<100;}).sort(function(a,b){return a.start<b.start?1:-1;});
  var finished=list.filter(function(h){return progress(h).pct===100;});
  function row(h){var p=progress(h),l=lateItems(h).length;
    return '<button class="hire" data-act="sel" data-id="'+esc(h.id)+'" aria-current="'+(ui.sel===h.id)+'"><span class="n"><span>'+esc(h.naam)+'</span>'+(l?'<span class="late">'+l+' te laat</span>':'')+'</span><span class="r">'+esc(h.functie)+(h.afdeling?', '+esc(h.afdeling):'')+'</span><span class="mini"><i style="width:'+p.pct+'%"></i></span></button>';}
  return '<div class="side-head"><div class="brand">Onboarding<small>Nieuwe medewerkers</small></div></div>'+
    '<div class="side-tools"><input class="search" id="search" type="search" placeholder="Zoek medewerker" value="'+esc(ui.q)+'" aria-label="Zoek medewerker">'+
    (readOnly?'':'<button class="btn-add" data-act="new">+ Medewerker toevoegen</button>')+'</div>'+
    '<nav class="nav"><button class="nav-over" data-act="over" aria-current="'+(!ui.sel)+'">Overzicht</button>'+
    (running.length?'<div class="nav-group">Lopend</div>'+running.map(row).join(''):'')+
    (finished.length?'<div class="nav-group">Afgerond</div>'+finished.map(row).join(''):'')+
    (!list.length?'<div class="nav-group">Geen medewerkers gevonden</div>':'')+
    '</nav><div class="side-foot"><div class="io"><button data-act="export">Exporteren</button><button data-act="import">Importeren</button></div>'+saveChip()+'<input type="file" id="file" accept="application/json,.json" hidden></div>';
}
function renderOverview(){
  var hs=state.hires.slice().sort(function(a,b){return a.start<b.start?1:-1;});
  var active=hs.filter(function(h){return progress(h).pct<100;});
  var startingSoon=hs.filter(function(h){var n=dayNo(h);return n<0&&n>=-30;}).length;
  var lateTot=hs.reduce(function(s,h){return s+lateItems(h).length;},0);
  var html='<h1>Overzicht</h1><p class="sub">Voortgang van iedereen die in onboarding zit.</p>';
  if(readOnly)html+='<div class="ro-note" style="margin-top:14px">Je bekijkt dit dashboard alleen. Wijzigingen worden niet opgeslagen.</div>';
  html+='<div class="kpis"><div class="kpi"><b>'+active.length+'</b><span>in onboarding</span></div><div class="kpi"><b>'+startingSoon+'</b><span>start binnen 30 dagen</span></div><div class="kpi'+(lateTot?' bad':'')+'"><b>'+lateTot+'</b><span>acties te laat</span></div></div>';
  if(!hs.length){return html+'<div class="tablewrap"><div class="empty">Nog niemand in onboarding.<br>'+(readOnly?'':'<button class="btn primary" data-act="new">Medewerker toevoegen</button>')+'</div></div>';}
  html+='<div class="tablewrap"><table><thead><tr><th>Medewerker</th><th>Start</th><th>Fase</th><th>Voortgang</th><th>Te laat</th><th>Eerstvolgende actie</th></tr></thead><tbody>';
  hs.forEach(function(h){var p=progress(h),l=lateItems(h).length,na=nextAction(h),ph=currentPhase(h);
    html+='<tr data-act="sel" data-id="'+esc(h.id)+'" tabindex="0"><td><b>'+esc(h.naam)+'</b><br><span class="sub" style="font-size:13px">'+esc(h.functie)+'</span></td><td>'+esc(fmtLong(h.start))+'</td><td>'+esc(ph.label)+'</td><td><span style="display:flex;align-items:center"><span class="pbar"><i style="width:'+p.pct+'%"></i></span><span class="pct">'+p.pct+'%</span></span></td><td>'+(l?'<span class="late-txt">'+l+'</span>':'<span class="sub">0</span>')+'</td><td>'+(na?esc(na.item.titel)+'<br><span class="sub" style="font-size:13px">'+esc(na.item.wie)+', '+esc(fmt(na.due))+'</span>':'<span class="sub">Alles afgerond</span>')+'</td></tr>';});
  return html+'</tbody></table></div>';
}
function renderTrack(h){
  var n=dayNo(h),ph=state.phases,out='<div class="track" aria-label="Fases">';
  ph.forEach(function(f,i){var p=progress(h,f.id);var cur=currentPhase(h).idx===i;
    out+='<div class="seg'+(cur?' now':'')+'"><div class="bar"><i style="width:'+p.pct+'%"></i></div><div class="lbl">'+esc(f.naam)+'</div><div class="cnt">'+p.done+' van '+p.total+'</div></div>';});
  // today marker
  var idx=currentPhase(h).idx,pos;
  if(idx>=0&&idx<ph.length){var f=ph[idx];var frac=f.tot===f.van?0.5:(n-f.van)/(f.tot-f.van+1);pos=(idx+frac)/ph.length*100;}
  else if(idx<0){pos=0;}else{pos=100;}
  out+='<div class="today'+(pos>80?' flip':'')+'" style="left:'+pos.toFixed(2)+'%" data-l="Vandaag"></div>';
  return out+'</div>';
}
function renderDetail(h){
  var st=parseD(h.start),t=today();
  var html='<button class="back" data-act="over">‹ Alle medewerkers</button>';
  if(readOnly)html+='<div class="ro-note">Je bekijkt dit dashboard alleen. Wijzigingen worden niet opgeslagen.</div>';
  html+='<div class="dhead"><div><h1>'+esc(h.naam)+'</h1><p class="sub">'+esc(h.functie)+(h.afdeling?', '+esc(h.afdeling):'')+'</p></div>'+
    (readOnly?'':'<div class="dact"><button class="btn" data-act="edit">Gegevens wijzigen</button><button class="btn danger" data-act="del">Verwijderen</button></div>')+'</div>';
  html+='<div class="meta"><div><span>Startdatum</span><b>'+esc(fmtLong(h.start))+'</b></div><div><span>Stand</span><b>'+esc(dayLabel(h))+'</b></div><div><span>Leidinggevende</span><b>'+esc(h.leidinggevende||'–')+'</b></div></div>';
  html+=renderTrack(h);
  html+='<div class="filters"><label>Taken voor <select id="role"><option>Alle</option>'+roles(h).map(function(r){return '<option'+(ui.role===r?' selected':'')+'>'+esc(r)+'</option>';}).join('')+'</select></label><label class="chk"><input type="checkbox" id="openOnly"'+(ui.openOnly?' checked':'')+'> Alleen openstaande taken</label></div>';
  state.phases.forEach(function(f){
    var its=itemsFor(h).filter(function(i){return i.fase===f.id&&(ui.role==='Alle'||i.wie===ui.role)&&(!ui.openOnly||!h.done[i.id]);}).sort(function(a,b){return a.dag-b.dag;});
    if(!its.length&&readOnly)return;
    var p=progress(h,f.id);
    var from=addDays(st,f.van),to=addDays(st,f.tot);
    html+='<section class="phase"><h2>'+esc(f.naam)+' <small>'+(f.van===f.tot?esc(fmt(from)):esc(fmt(from))+' t/m '+esc(fmt(to)))+', '+p.done+' van '+p.total+' gedaan</small></h2><div class="list">';
    its.forEach(function(i){
      var due=addDays(st,i.dag),dn=h.done[i.id],note=(h.notes||{})[i.id]||'',status,cls;
      if(dn){status='Gedaan '+fmt(parseD(dn));cls='ok';}
      else if(due<t){status='Te laat, '+fmt(due);cls='late';}
      else if(diff(due,t)<=7){status=diff(due,t)===0?'Vandaag':'Deze week, '+fmt(due);cls='soon';}
      else{status=fmt(due);cls='plain';}
      var open=!!ui.openNotes[h.id+':'+i.id];
      html+='<div class="item'+(dn?' done':'')+'"><button class="tick" data-act="tick" data-item="'+esc(i.id)+'" aria-pressed="'+(!!dn)+'" aria-label="'+esc(i.titel)+(dn?' – gedaan':' – nog open')+'"'+(readOnly?' disabled':'')+'>'+ICON_CHECK+'</button>'+
        '<span class="t"><span class="tt">'+esc(i.titel)+'</span>'+(i.own?' <span class="own">Extra</span>'+(readOnly?'':' <button class="rm" data-act="rmitem" data-item="'+esc(i.id)+'">Verwijderen</button>'):'')+'</span><span class="who">'+esc(i.wie)+'</span><span class="st '+cls+'">'+esc(status)+'</span>'+
        '<button class="pen'+(note?' has':'')+'" data-act="note" data-item="'+esc(i.id)+'" aria-label="Notitie" title="Notitie"'+(readOnly&&!note?' disabled':'')+'>'+ICON_PEN+'</button>'+
        (open?'<div class="note open"><textarea data-note="'+esc(i.id)+'" placeholder="Notitie"'+(readOnly?' readonly':'')+'>'+esc(note)+'</textarea></div>':(note?'<div class="note-view">'+esc(note)+'</div>':''))+
        '</div>';
    });
    if(!its.length)html+='<div class="noitems">Geen punten'+(ui.role!=='Alle'||ui.openOnly?' met dit filter':'')+'.</div>';
    if(!readOnly)html+='<button class="additem" data-act="additem" data-fase="'+esc(f.id)+'">+ Punt toevoegen</button>';
    html+='</div></section>';
  });
  return html;
}

/* ---------- dialog ---------- */
function select(name,list,current){
  var opts=list.slice();
  if(current&&opts.indexOf(current)<0)opts.push(current);
  return '<select name="'+name+'"><option value="">Kies…</option>'+opts.map(function(o){
    return '<option'+(o===current?' selected':'')+'>'+esc(o)+'</option>';
  }).join('')+'</select>';
}
function openForm(h){
  var d=document.createElement('dialog');
  var v=h||{naam:'',functie:'',afdeling:'',start:iso(addDays(today(),14)),leidinggevende:''};
  d.innerHTML='<form class="dlg" method="dialog"><h3>'+(h?'Gegevens wijzigen':'Medewerker toevoegen')+'</h3><div class="fgrid">'+
    '<label class="full">Naam<input name="naam" required value="'+esc(v.naam)+'"></label>'+
    '<label>Functie'+select('functie',FUNCTIES,v.functie)+'</label>'+
    '<label>Afdeling'+select('afdeling',AFDELINGEN,v.afdeling)+'</label>'+
    '<label>Startdatum<input name="start" type="date" required value="'+esc(v.start)+'"></label>'+
    '<label class="full">Leidinggevende<input name="leidinggevende" value="'+esc(v.leidinggevende)+'"></label>'+
    '</div><div class="err" id="ferr"></div><div class="dlg-act"><button type="button" class="btn" value="cancel" id="fcancel">Annuleren</button><button class="btn primary" id="fok">'+(h?'Wijzigingen opslaan':'Toevoegen')+'</button></div></form>';
  document.body.appendChild(d);
  var form=d.querySelector('form');
  d.querySelector('#fcancel').onclick=function(){d.close();};
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var f=new FormData(form);var naam=(f.get('naam')||'').trim(),start=f.get('start');
    if(!naam||!start){d.querySelector('#ferr').textContent='Vul een naam en startdatum in.';return;}
    var data={naam:naam,functie:(f.get('functie')||'').trim(),afdeling:(f.get('afdeling')||'').trim(),start:start,leidinggevende:(f.get('leidinggevende')||'').trim()};
    if(h){Object.assign(h,data);}else{var nh=Object.assign({id:uid(),done:{},notes:{}},data);state.hires.push(nh);ui.sel=nh.id;}
    d.close();markDirty();render();
  });
  d.addEventListener('close',function(){d.remove();});
  if(d.showModal)d.showModal();else d.setAttribute('open','');
  setTimeout(function(){var i=d.querySelector('input');if(i)i.focus();},30);
}

function openItemForm(h,faseId){
  if(!h)return;
  var st=parseD(h.start),t=today();
  function defDate(fid){var f=state.phases.filter(function(x){return x.id===fid;})[0]||state.phases[0];var n=diff(t,st);var dd=(n>=f.van&&n<=f.tot)?n:f.van;return iso(addDays(st,dd));}
  var d=document.createElement('dialog');
  var rl=roles(h);
  d.innerHTML='<form class="dlg"><h3>Punt toevoegen voor '+esc(h.naam)+'</h3><div class="fgrid">'+
    '<label class="full">Omschrijving<input name="titel" required></label>'+
    '<label>Fase<select name="fase">'+state.phases.map(function(f){return '<option value="'+esc(f.id)+'"'+(f.id===faseId?' selected':'')+'>'+esc(f.naam)+'</option>';}).join('')+'</select></label>'+
    '<label>Datum<input name="datum" type="date" required value="'+defDate(faseId)+'"></label>'+
    '<label class="full">Wie<input name="wie" list="rolelist" placeholder="Bijvoorbeeld HR of een naam" value="'+esc(h.leidinggevende||'')+'"><datalist id="rolelist">'+rl.map(function(r){return '<option value="'+esc(r)+'">';}).join('')+'</datalist></label>'+
    '</div><div class="err" id="ierr"></div><div class="dlg-act"><button type="button" class="btn" id="icancel">Annuleren</button><button class="btn primary">Punt toevoegen</button></div></form>';
  document.body.appendChild(d);
  var form=d.querySelector('form'),E=form.elements;
  var dirtyDate=false;
  E.datum.addEventListener('input',function(){dirtyDate=true;});
  E.fase.addEventListener('change',function(){if(!dirtyDate)E.datum.value=defDate(E.fase.value);});
  d.querySelector('#icancel').onclick=function(){d.close();};
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var titel=E.titel.value.trim(),datum=E.datum.value;
    if(!titel||!datum){d.querySelector('#ierr').textContent='Vul een omschrijving en datum in.';return;}
    h.extra=h.extra||[];
    h.extra.push({id:'x'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),fase:E.fase.value,titel:titel,wie:E.wie.value.trim()||'Nog niet toegewezen',dag:diff(parseD(datum),st)});
    d.close();markDirty();render();
  });
  d.addEventListener('close',function(){d.remove();});
  if(d.showModal)d.showModal();else d.setAttribute('open','');
  setTimeout(function(){E.titel.focus();},30);
}

/* ---------- events ---------- */
root.addEventListener('click',function(e){
  var b=e.target.closest('[data-act]');if(!b)return;
  var a=b.getAttribute('data-act');
  if(a==='sel'){ui.sel=b.getAttribute('data-id');stashUi();render();var m=document.getElementById('main');if(m)m.scrollTop=0;window.scrollTo(0,0);}
  else if(a==='over'){ui.sel=null;stashUi();render();}
  else if(a==='export'){exportJson();}
  else if(a==='import'){document.getElementById('file').click();}
  else if(a==='new'){openForm(null);}
  else if(a==='edit'){openForm(hire(ui.sel));}
  else if(a==='del'){var h=hire(ui.sel);if(h&&confirm('Onboarding van '+h.naam+' verwijderen? Dit kan niet ongedaan worden gemaakt.')){state.hires=state.hires.filter(function(x){return x.id!==h.id;});ui.sel=null;stashUi();markDirty();render();}}
  else if(a==='tick'){var h2=hire(ui.sel),id=b.getAttribute('data-item');if(!h2||readOnly)return;if(h2.done[id])delete h2.done[id];else h2.done[id]=iso(today());markDirty();render();}
  else if(a==='additem'){openItemForm(hire(ui.sel),b.getAttribute('data-fase'));}
  else if(a==='rmitem'){var h3=hire(ui.sel),rid=b.getAttribute('data-item');if(!h3||readOnly)return;var it=(h3.extra||[]).filter(function(x){return x.id===rid;})[0];if(it&&confirm('Punt "'+it.titel+'" verwijderen?')){h3.extra=h3.extra.filter(function(x){return x.id!==rid;});delete h3.done[rid];if(h3.notes)delete h3.notes[rid];markDirty();render();}}
  else if(a==='note'){var k=ui.sel+':'+b.getAttribute('data-item');ui.openNotes[k]=!ui.openNotes[k];render();var ta=root.querySelector('textarea[data-note="'+b.getAttribute('data-item')+'"]');if(ta)ta.focus();}
});
root.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.matches('tr[data-act]'))e.target.click();});
root.addEventListener('input',function(e){
  if(e.target.id==='search'){ui.q=e.target.value;var pos=e.target.selectionStart;var side=root.querySelector('.side');side.innerHTML=renderSide();var s=document.getElementById('search');s.focus();try{s.setSelectionRange(pos,pos);}catch(x){}}
  else if(e.target.matches('textarea[data-note]')){var h=hire(ui.sel);if(!h||readOnly)return;h.notes=h.notes||{};var v=e.target.value;if(v.trim())h.notes[e.target.getAttribute('data-note')]=v;else delete h.notes[e.target.getAttribute('data-note')];markDirty();var pen=e.target.closest('.item').querySelector('.pen');if(pen)pen.classList.toggle('has',!!v.trim());}
});
root.addEventListener('change',function(e){
  if(e.target.id==='file'){if(e.target.files&&e.target.files[0])importJson(e.target.files[0]);e.target.value='';return;}
  if(e.target.id==='role'){ui.role=e.target.value;stashUi();render();}
  else if(e.target.id==='openOnly'){ui.openOnly=e.target.checked;stashUi();render();}
});
window.addEventListener('beforeunload',function(){if(dirty){try{localStorage.setItem(LS_KEY,JSON.stringify(state));}catch(e){}}});

render();
})();
