const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const VEHICLE_KEY='abidi-vehicles';
const LEAD_KEY='abidi-enquiries';
let vehicles=getVehicles();
let leads=readList(LEAD_KEY);
let activeView='dashboard';
let pendingPhotos=[];
let creatingVehicle=false;

function readList(key){
  try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[]}
  catch{return []}
}
function escapeHtml(value=''){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function slug(value=''){return String(value).toLowerCase().replace(/\s+/g,'-')}
function initials(name='Customer'){return name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase()||'C'}
function formatDate(value,short=false){const date=new Date(value);if(Number.isNaN(date.getTime()))return 'Date unavailable';return new Intl.DateTimeFormat('en-GB',short?{day:'2-digit',month:'short'}:{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(date)}
function normalizeWhatsApp(phone=''){let digits=String(phone).replace(/\D/g,'');if(digits.startsWith('0'))digits='213'+digits.slice(1);if(!digits.startsWith('213')&&digits.length===9)digits='213'+digits;return digits}
function toast(message){const element=$('#adminToast');element.textContent=message;element.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>element.classList.remove('show'),2600)}
function download(filename,data){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),anchor=document.createElement('a');anchor.href=url;anchor.download=filename;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),500)}
function persistVehicles(){try{localStorage.setItem(VEHICLE_KEY,JSON.stringify(vehicles));return true}catch(error){console.error(error);toast('Storage is full. Remove some photos and try again.');return false}}

function setDate(){
  const now=new Date(),hour=now.getHours();
  $('#todayLabel').textContent=new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}).format(now).toUpperCase();
  $('#dayPeriod').textContent=hour<12?'morning':hour<18?'afternoon':'evening';
}
function showView(name){
  activeView=name;
  $$('[data-admin-view]').forEach(view=>{const active=view.dataset.adminView===name;view.hidden=!active;view.classList.toggle('active',active)});
  $$('[data-view]').forEach(button=>button.classList.toggle('active',button.dataset.view===name));
  $('#currentSection').textContent=name.toUpperCase();
  closeSidebar();
  scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  if(name==='dashboard')renderDashboard();
  if(name==='inventory')renderInventory();
  if(name==='enquiries')renderLeads();
}

function renderMetrics(){
  const published=vehicles.filter(vehicle=>vehicle.published).length;
  const newLeads=leads.filter(lead=>(lead.status||'New')==='New').length;
  const arriving=vehicles.filter(vehicle=>vehicle.status==='Arriving').length;
  const attention=vehicles.filter(vehicle=>!vehicle.price||!vehicle.published).length;
  $('#activeMetric').textContent=published;$('#leadMetric').textContent=newLeads;$('#arrivingMetric').textContent=arriving;$('#attentionMetric').textContent=attention;
  $('#activeMetricNote').textContent=`${vehicles.length-published} hidden from visitors`;
  $('#leadMetricNote').textContent=newLeads===1?'Waiting for response':'Waiting for responses';
  $('#navVehicleCount').textContent=vehicles.length;$('#navLeadCount').textContent=newLeads;
}
function renderDashboard(){
  renderMetrics();
  const total=Math.max(vehicles.length,1),published=vehicles.filter(v=>v.published).length,priced=vehicles.filter(v=>v.price!=null).length,media=vehicles.filter(v=>v.photo).length;
  const percent=value=>Math.round(value/total*100);
  const overall=Math.round((percent(published)+percent(priced)+percent(media))/3);
  $('#healthScore').textContent=`${overall}%`;
  [['published',published],['priced',priced],['media',media]].forEach(([name,value])=>{$(`#${name}Summary`).textContent=`${value} / ${vehicles.length}`;$(`#${name}Bar`).style.width=`${percent(value)}%`});
  const latest=[...leads].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,4);
  $('#recentLeads').innerHTML=latest.length?latest.map(lead=>`<article class="recent-lead"><span>${escapeHtml(initials(lead.name))}</span><div><b>${escapeHtml(lead.name||'Unnamed customer')}</b><small>${escapeHtml(lead.vehicle||'General enquiry')} · ${formatDate(lead.createdAt,true)}</small></div><button data-open-lead="${escapeHtml(lead.id)}" aria-label="Open enquiry">→</button></article>`).join(''):`<div class="recent-empty"><b>No enquiries yet</b><span>Website requests will appear here.</span></div>`;
}

function filteredVehicles(){
  const query=$('#adminSearch').value.trim().toLowerCase(),status=$('#adminStatusFilter').value,visibility=$('#adminVisibilityFilter').value;
  return vehicles.filter(vehicle=>(vehicle.brand+' '+vehicle.model).toLowerCase().includes(query)&&(status==='all'||vehicle.status===status)&&(visibility==='all'||(visibility==='published'&&vehicle.published)||(visibility==='hidden'&&!vehicle.published)));
}
function renderInventory(){
  renderMetrics();
  const shown=filteredVehicles();
  $('#adminRows').innerHTML=shown.map(vehicle=>`<tr data-vehicle-row="${vehicle.id}"><td><div class="vehicle-cell"><img class="vehicle-thumb" src="${escapeHtml(vehicle.photo)}" alt="" loading="lazy" decoding="async"><span><b>${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)}</b><small>${vehicle.year} · ${escapeHtml(vehicle.body)} · ${escapeHtml(vehicle.transmission)}</small></span></div></td><td class="price-cell"><b>${vehicle.price!=null?escapeHtml(vehicle.price)+'M':'On request'}</b><small>${vehicle.price!=null?'DISPLAY PRICE':'PRICE NOT SET'}</small></td><td><span class="status-pill ${slug(vehicle.status)}">${escapeHtml(vehicle.status)}</span></td><td><span class="visibility-pill ${vehicle.published?'':'hidden'}">${vehicle.published?'Published':'Hidden'}</span></td><td><span class="feature-pill ${vehicle.featured?'':'off'}">${vehicle.featured?'Featured':'Standard'}</span></td><td><button class="row-edit" data-edit="${vehicle.id}">Edit vehicle</button></td></tr>`).join('');
  $('#inventoryResultCount').textContent=`${shown.length} ${shown.length===1?'vehicle':'vehicles'}`;
  $('#inventoryEmpty').hidden=shown.length!==0;$('.table-wrap').hidden=shown.length===0;
}
function openEditor(vehicle){
  if(!vehicle)return;
  const fields=$('#editForm').elements;
  fields.namedItem('id').value=vehicle.id;fields.namedItem('brand').value=vehicle.brand;fields.namedItem('model').value=vehicle.model;fields.namedItem('price').value=vehicle.price??'';fields.namedItem('status').value=vehicle.status;fields.namedItem('published').checked=vehicle.published;fields.namedItem('featured').checked=vehicle.featured;
  $('#editTitle').textContent=`${vehicle.brand} ${vehicle.model}`;$('#editPhoto').src=vehicle.photo;$('#editPhoto').alt=`${vehicle.brand} ${vehicle.model}`;$('#editPreviewStatus').textContent=vehicle.status;$('#saveStatus').textContent='';
  $('#editDialog').showModal();
}
function saveVehicle(event){
  event.preventDefault();
  const fields=event.currentTarget.elements,id=Number(fields.namedItem('id').value),current=vehicles.find(vehicle=>vehicle.id===id);
  if(!current){$('#saveStatus').textContent='This vehicle is not in the approved catalogue.';return}
  const priceValue=fields.namedItem('price').value;
  const updated={...current,price:priceValue===''?null:Number(priceValue),status:fields.namedItem('status').value,published:fields.namedItem('published').checked,featured:fields.namedItem('featured').checked};
  vehicles=vehicles.map(vehicle=>vehicle.id===id?updated:vehicle);localStorage.setItem(VEHICLE_KEY,JSON.stringify(vehicles));
  renderInventory();renderDashboard();$('#saveStatus').textContent='Changes saved and published to this browser.';toast(`${updated.brand} ${updated.model} updated`);setTimeout(()=>$('#editDialog').close(),650);
}

function filteredLeads(){
  const query=$('#leadSearch').value.trim().toLowerCase(),status=$('#leadStatusFilter').value;
  return [...leads].filter(lead=>`${lead.name||''} ${lead.phone||''} ${lead.vehicle||''}`.toLowerCase().includes(query)&&(status==='all'||(lead.status||'New')===status)).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
}
function renderLeads(){
  renderMetrics();
  const shown=filteredLeads();
  $('#leadGrid').innerHTML=shown.map(lead=>`<article class="lead-card"><div class="lead-card-head"><span class="lead-status ${slug(lead.status||'New')}">${escapeHtml(lead.status||'New')}</span><time>${formatDate(lead.createdAt,true)}</time></div><h3>${escapeHtml(lead.name||'Unnamed customer')}</h3><p>${escapeHtml(lead.phone||'No phone supplied')}</p><p class="lead-vehicle">${escapeHtml(lead.vehicle||'General vehicle request')}</p><button data-open-lead="${escapeHtml(lead.id)}">Open enquiry →</button></article>`).join('');
  $('#leadEmpty').hidden=shown.length!==0;$('#leadGrid').hidden=shown.length===0;
}
function openLead(id){
  const lead=leads.find(item=>String(item.id)===String(id));if(!lead)return;
  const phone=normalizeWhatsApp(lead.phone),message=encodeURIComponent(`Hello ${lead.name||''}, this is Abidi Motors regarding your enquiry${lead.vehicle?' about '+lead.vehicle:''}.`);
  $('#leadDialogContent').innerHTML=`<div class="lead-dialog-inner"><button class="dialog-close" data-close-dialog aria-label="Close">×</button><p class="admin-eyebrow">SALES ENQUIRY</p><h2>${escapeHtml(lead.name||'Unnamed customer')}</h2><p class="lead-phone">${escapeHtml(lead.phone||'No phone supplied')}</p><div class="lead-message">${escapeHtml(lead.message||'No additional message was provided.')}</div><div class="lead-detail-grid"><div><small>VEHICLE</small><b>${escapeHtml(lead.vehicle||'Not specified')}</b></div><div><small>RECEIVED</small><b>${formatDate(lead.createdAt)}</b></div></div><div class="lead-dialog-actions"><select data-lead-status="${escapeHtml(lead.id)}" aria-label="Enquiry status"><option ${!lead.status||lead.status==='New'?'selected':''}>New</option><option ${lead.status==='Contacted'?'selected':''}>Contacted</option><option ${lead.status==='Qualified'?'selected':''}>Qualified</option><option ${lead.status==='Closed'?'selected':''}>Closed</option></select>${phone?`<a class="admin-button primary" href="https://wa.me/${phone}?text=${message}" target="_blank" rel="noreferrer">Reply on WhatsApp ↗</a>`:''}</div><button class="danger-action" data-delete-lead="${escapeHtml(lead.id)}">Delete this enquiry</button></div>`;
  $('#leadDialog').showModal();
}
function updateLeadStatus(id,status){leads=leads.map(lead=>String(lead.id)===String(id)?{...lead,status}:lead);localStorage.setItem(LEAD_KEY,JSON.stringify(leads));renderLeads();renderDashboard();toast(`Enquiry marked ${status.toLowerCase()}`)}
function deleteLead(id){if(!confirm('Delete this enquiry? This cannot be undone.'))return;leads=leads.filter(lead=>String(lead.id)!==String(id));localStorage.setItem(LEAD_KEY,JSON.stringify(leads));$('#leadDialog').close();renderLeads();renderDashboard();toast('Enquiry deleted')}

function openSidebar(){$('#adminSidebar').classList.add('open');$('#sidebarBackdrop').classList.add('show')}
function closeSidebar(){$('#adminSidebar').classList.remove('open');$('#sidebarBackdrop').classList.remove('show')}

document.addEventListener('click',event=>{
  const viewButton=event.target.closest('[data-view],[data-go-view]');if(viewButton){showView(viewButton.dataset.view||viewButton.dataset.goView);return}
  const editButton=event.target.closest('[data-edit]');if(editButton){openEditor(vehicles.find(vehicle=>vehicle.id===Number(editButton.dataset.edit)));return}
  const leadButton=event.target.closest('[data-open-lead]');if(leadButton){openLead(leadButton.dataset.openLead);return}
  const closeButton=event.target.closest('[data-close-dialog]');if(closeButton){closeButton.closest('dialog')?.close();return}
  const deleteButton=event.target.closest('[data-delete-lead]');if(deleteButton)deleteLead(deleteButton.dataset.deleteLead);
});
$('#editDialog').addEventListener('click',event=>{if(event.target===$('#editDialog'))$('#editDialog').close()});
$('#leadDialog').addEventListener('click',event=>{if(event.target===$('#leadDialog'))$('#leadDialog').close()});
$('#editForm').addEventListener('submit',saveVehicle);
['#adminSearch','#adminStatusFilter','#adminVisibilityFilter'].forEach(selector=>$(selector).addEventListener('input',renderInventory));
['#leadSearch','#leadStatusFilter'].forEach(selector=>$(selector).addEventListener('input',renderLeads));
$('#leadDialog').addEventListener('change',event=>{if(event.target.matches('[data-lead-status]'))updateLeadStatus(event.target.dataset.leadStatus,event.target.value)});
$('#menuButton').addEventListener('click',openSidebar);$('#sidebarClose').addEventListener('click',closeSidebar);$('#sidebarBackdrop').addEventListener('click',closeSidebar);
$('#exportInventory').addEventListener('click',()=>{download(`abidi-inventory-${new Date().toISOString().slice(0,10)}.json`,vehicles);toast('Inventory export prepared')});
$('#exportLeads').addEventListener('click',()=>{download(`abidi-enquiries-${new Date().toISOString().slice(0,10)}.json`,leads);toast('Enquiry export prepared')});
$('#resetInventory').addEventListener('click',()=>{if(!confirm('Restore all catalogue prices, statuses and visibility to their original values?'))return;localStorage.removeItem(VEHICLE_KEY);vehicles=getVehicles();renderInventory();renderDashboard();toast('Catalogue restored')});
window.addEventListener('storage',event=>{if(event.key===VEHICLE_KEY){vehicles=getVehicles();renderMetrics();if(activeView==='inventory')renderInventory()}if(event.key===LEAD_KEY){leads=readList(LEAD_KEY);renderMetrics();if(activeView==='enquiries')renderLeads();if(activeView==='dashboard')renderDashboard()}});

setDate();renderDashboard();renderInventory();renderLeads();showView('dashboard');

// Full inventory CRUD and media management.
const legacySaveVehicle=saveVehicle;
$('#editForm').removeEventListener('submit',legacySaveVehicle);

function updateEditorPreview(){
  const photo=pendingPhotos[0]||'',preview=$('#editPhoto');
  preview.src=photo;preview.hidden=!photo;$('#previewEmpty').hidden=Boolean(photo);
}
function renderPhotoList(){
  const photos=pendingPhotos.map((photo,index)=>`<article class="photo-item ${index===0?'cover':''}"><img src="${escapeHtml(photo)}" alt="Vehicle photo ${index+1}"><span>${index===0?'COVER':`PHOTO ${index+1}`}</span><div>${index?`<button type="button" data-photo-cover="${index}">Make cover</button>`:''}<button type="button" data-photo-remove="${index}">Remove</button></div></article>`).join('');
  const emptySlots=Array.from({length:Math.max(0,5-pendingPhotos.length)},(_,index)=>`<button type="button" class="photo-slot" data-add-photo-slot><span>+</span><b>PHOTO ${pendingPhotos.length+index+1}</b><small>Empty slot</small></button>`).join('');
  $('#photoList').innerHTML=photos+emptySlots;
  $('#mediaStatus').textContent=`${pendingPhotos.length} / 5 photos added`;
  updateEditorPreview();
}
openEditor=function(vehicle=null){
  creatingVehicle=!vehicle;
  const current=vehicle||{id:'',brand:'',model:'',year:2026,price:null,mileage:0,body:'SUV',transmission:'Automatic',status:'In stock',engine:'',color:'',description:'',published:true,featured:false,photos:[],photo:''};
  const fields=$('#editForm').elements;
  ['id','brand','model','year','price','mileage','body','transmission','status','engine','color','description'].forEach(name=>{fields.namedItem(name).value=current[name]??''});
  fields.namedItem('published').checked=current.published!==false;fields.namedItem('featured').checked=Boolean(current.featured);
  pendingPhotos=Array.isArray(current.photos)&&current.photos.length?[...current.photos]:(current.photo?[current.photo]:[]);
  $('#editTitle').textContent=creatingVehicle?'Add a new vehicle':`${current.brand} ${current.model}`;$('#editPhoto').alt=`${current.brand} ${current.model}`;$('#editPreviewStatus').textContent=current.status;$('#saveStatus').textContent='';$('#deleteVehicle').hidden=creatingVehicle;$('#photoUpload').value='';renderPhotoList();
  $('#editDialog').showModal();
};
saveVehicle=function(event){
  event.preventDefault();
  const fields=event.currentTarget.elements,id=creatingVehicle?Math.max(0,...vehicles.map(vehicle=>Number(vehicle.id)||0))+1:Number(fields.namedItem('id').value),current=vehicles.find(vehicle=>vehicle.id===id)||{},priceValue=fields.namedItem('price').value;
  const updated={...current,id,brand:fields.namedItem('brand').value.trim(),model:fields.namedItem('model').value.trim(),year:Number(fields.namedItem('year').value),price:priceValue===''?null:Number(priceValue),mileage:Number(fields.namedItem('mileage').value||0),body:fields.namedItem('body').value.trim()||'Other',transmission:fields.namedItem('transmission').value,status:fields.namedItem('status').value,engine:fields.namedItem('engine').value.trim(),color:fields.namedItem('color').value.trim(),description:fields.namedItem('description').value.trim(),photos:[...pendingPhotos],photo:pendingPhotos[0]||'',published:fields.namedItem('published').checked,featured:fields.namedItem('featured').checked};
  const previous=vehicles;vehicles=creatingVehicle?[updated,...vehicles]:vehicles.map(vehicle=>vehicle.id===id?updated:vehicle);
  if(!persistVehicles()){vehicles=previous;return}
  renderInventory();renderDashboard();$('#saveStatus').textContent='Vehicle saved to the public catalogue.';toast(`${updated.brand} ${updated.model} ${creatingVehicle?'added':'updated'}`);setTimeout(()=>$('#editDialog').close(),450);
};
$('#editForm').addEventListener('submit',saveVehicle);

function deleteVehicle(){
  const id=Number($('#editForm').elements.namedItem('id').value),vehicle=vehicles.find(item=>item.id===id);if(!vehicle)return;
  if(!confirm(`Delete ${vehicle.brand} ${vehicle.model}? This removes it from the public catalogue.`))return;
  const previous=vehicles;vehicles=vehicles.filter(item=>item.id!==id);if(!persistVehicles()){vehicles=previous;return}$('#editDialog').close();renderInventory();renderDashboard();toast(`${vehicle.brand} ${vehicle.model} deleted`);
}
function compressPhoto(file){
  return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('Could not read image'));reader.onload=()=>{const image=new Image();image.onerror=()=>reject(new Error('Invalid image'));image.onload=()=>{const max=1280,scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/webp',.76))};image.src=reader.result};reader.readAsDataURL(file)});
}
async function addPhotos(files){
  const accepted=[...files].filter(file=>/^image\/(jpeg|png|webp)$/.test(file.type)).slice(0,5-pendingPhotos.length);if(!accepted.length){$('#mediaStatus').textContent=pendingPhotos.length>=5?'This vehicle already has all 5 photos.':'Choose JPG, PNG or WebP images.';return}
  $('#mediaStatus').textContent='Optimising photos...';
  try{for(const file of accepted)pendingPhotos.push(await compressPhoto(file));renderPhotoList()}catch{$('#mediaStatus').textContent='One selected image could not be processed.'}
}
$('#addVehicle').addEventListener('click',()=>openEditor());
$('#deleteVehicle').addEventListener('click',deleteVehicle);
$('#photoUpload').addEventListener('change',event=>addPhotos(event.target.files));
$('#photoList').addEventListener('click',event=>{
  const remove=event.target.closest('[data-photo-remove]'),cover=event.target.closest('[data-photo-cover]');
  if(event.target.closest('[data-add-photo-slot]')){$('#photoUpload').click();return}
  if(remove){pendingPhotos.splice(Number(remove.dataset.photoRemove),1);renderPhotoList()}
  if(cover){const [photo]=pendingPhotos.splice(Number(cover.dataset.photoCover),1);pendingPhotos.unshift(photo);renderPhotoList()}
});
