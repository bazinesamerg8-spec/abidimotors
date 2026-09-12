const aura=document.querySelector('.cursor-aura');
const performanceLite=document.documentElement.classList.contains('performance-lite');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const simpleMotion=performanceLite||reducedMotion;
const progress=document.createElement('div');progress.className='scroll-progress';progress.innerHTML='<i></i>';document.body.prepend(progress);

// Public vehicle presentation is fully self-hosted; no external 3D iframe is used.
detail=function(id){
  const v=state.vehicles.find(vehicle=>vehicle.id===id);
  if(!v)return;
  const frames=v.spinFrames||16;
  const viewer=v.has360?`<div class="spin-shell"><div class="spin-stage" id="spinStage" tabindex="0" style="--car-image:url('${v.sprite}')" role="img" aria-label="Manual 360 degree view of ${v.brand} ${v.model}"></div><div class="spin-progress"><button data-spin-step="-1" aria-label="Previous angle">‹</button><input id="spinSlider" type="range" min="0" max="${frames-1}" value="0" step="1" aria-label="Vehicle rotation angle"><button data-spin-step="1" aria-label="Next angle">›</button></div><p class="spin-counter"><span id="spinAngle">0°</span> / 360°</p><p class="spin-help">DRAG • SWIPE • USE ARROW KEYS</p><small class="asset-note">Self-hosted Abidi Motors 360° presentation.</small></div>`:`<div class="detail-photo-shell"><img src="${v.photo}" alt="${v.brand} ${v.model}" decoding="async"></div>`;
  const shareText=`${v.brand} ${v.model} — ${v.price?v.price+'M':'price on request'} at Abidi Motors`;
  const studioLabel=v.has360?'INTERACTIVE 360° STUDIO':'CURATED VEHICLE PREVIEW';
  const studioHint=v.has360?'Drag the vehicle to inspect every angle':'A closer look at the selected vehicle';
  document.querySelector('#modalContent').innerHTML=`<button class="modal-close" aria-label="Close vehicle details">×</button><div class="modal-layout"><div class="modal-viewer vehicle-${v.id} ${v.has360?'has-spin':''}"><div class="detail-viewer-top"><span>ABIDI PRIVATE VIEW</span><b>${studioLabel}</b></div>${viewer}<div class="detail-viewer-foot"><i></i><span>${studioHint}</span><small>${String(v.id).padStart(2,'0')} / 31</small></div></div><div class="modal-copy"><div class="detail-heading"><p class="eyebrow">${v.brand} • ${v.year}</p><span class="detail-status"><i></i>${v.status}</span></div><h2>${v.model}</h2><div class="detail-price"><small>${v.price?'CURRENT DISPLAY PRICE':'PRICE'}</small><strong>${v.price?v.price+'M':'ON REQUEST'}</strong><span>Confirmed by our showroom team</span></div><p class="detail-intro">A private digital viewing, curated by Abidi Motors. Explore the vehicle, review its key information, then speak directly with our team.</p><div class="modal-specs"><div><small>01 / BODY</small><b>${v.body}</b></div><div><small>02 / TRANSMISSION</small><b>${v.transmission}</b></div><div><small>03 / MODEL YEAR</small><b>${v.year}</b></div><div><small>04 / AVAILABILITY</small><b>${v.status}</b></div></div><div class="modal-actions"><button class="button enquire" data-model="${v.brand} ${v.model}">Request a private viewing <span>↗</span></button><a class="button detail-whatsapp" href="https://wa.me/213795263552?text=${encodeURIComponent(`Hello Abidi Motors, I am interested in ${v.brand} ${v.model}.`)}" target="_blank" rel="noreferrer">WhatsApp <span>↗</span></a><button class="button button-outline detail-share" data-share-vehicle="${encodeURIComponent(shareText)}" aria-label="Share ${v.brand} ${v.model}">Share</button></div><p class="detail-assurance"><span>✓ Direct showroom assistance</span><span>✓ Availability confirmation</span></p></div></div>`;
  document.querySelector('#vehicleModal').showModal();
  if(window.gsap&&!simpleMotion){gsap.fromTo('#vehicleModal .modal-viewer',{autoAlpha:0,x:-28},{autoAlpha:1,x:0,duration:.65,ease:'power3.out'});gsap.fromTo('#vehicleModal .modal-copy',{autoAlpha:0,x:28},{autoAlpha:1,x:0,duration:.65,delay:.08,ease:'power3.out'})}
  if(v.has360)initSpin(frames,v.sprite);
};
document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-share-vehicle]');
  if(!button)return;
  const text=decodeURIComponent(button.dataset.shareVehicle),share={title:'Abidi Motors',text,url:location.href};
  try{
    if(navigator.share)await navigator.share(share);
    else{await navigator.clipboard.writeText(`${text} ${location.href}`);showToast('Vehicle link copied.')}
  }catch(error){if(error.name!=='AbortError')showToast('Unable to share this vehicle.')}
});
if(!performanceLite&&aura&&matchMedia('(pointer: fine)').matches){
  let auraFrame=0,auraX=0,auraY=0;
  window.addEventListener('pointermove',event=>{
    auraX=event.clientX;auraY=event.clientY;
    if(auraFrame)return;
    auraFrame=requestAnimationFrame(()=>{aura.style.transform=`translate3d(${auraX}px,${auraY}px,0) translate(-50%,-50%)`;auraFrame=0});
  },{passive:true});
}
if(!performanceLite){
gsap.registerPlugin(ScrollTrigger);
const motion=gsap.matchMedia();
motion.add('(prefers-reduced-motion: no-preference)',()=>{
  // The tour owns hero camera movement; do not animate the vehicle's scale.
  gsap.fromTo('.inventory-atmosphere',{yPercent:-4,scale:1.05},{yPercent:9,scale:1,ease:'none',scrollTrigger:{trigger:'.inventory-section',start:'top bottom',end:'bottom top',scrub:1.4}});
  gsap.fromTo('.contact-atmosphere',{yPercent:-4,scale:1.06},{yPercent:6,scale:1.02,ease:'none',scrollTrigger:{trigger:'.contact-section',start:'top bottom',end:'bottom top',scrub:1.5}});
  gsap.from('.service-grid article',{y:70,autoAlpha:0,duration:.9,stagger:.16,ease:'power3.out',scrollTrigger:{trigger:'.service-grid',start:'top 82%',once:true}});
  gsap.fromTo('.experience-backdrop',{yPercent:-4,scale:1.12},{yPercent:5,scale:1.04,ease:'none',scrollTrigger:{trigger:'.experience',start:'top bottom',end:'bottom top',scrub:1.2}});
  gsap.fromTo('.experience-light',{xPercent:-65},{xPercent:210,ease:'none',scrollTrigger:{trigger:'.experience',start:'top 95%',end:'bottom top',scrub:1.4}});
  gsap.fromTo('.about-environment',{xPercent:-2,scale:1.1},{xPercent:3,scale:1.04,ease:'none',scrollTrigger:{trigger:'.about-section',start:'top bottom',end:'bottom top',scrub:1.2}});
  gsap.to('.about-art',{y:-48,ease:'none',scrollTrigger:{trigger:'.about-section',start:'top bottom',end:'bottom top',scrub:1.2}});
  gsap.from('.brand-track span',{y:24,autoAlpha:0,duration:.7,stagger:.06,ease:'power2.out',scrollTrigger:{trigger:'.brand-strip',start:'top 94%',once:true}});
});
motion.add('(prefers-reduced-motion: no-preference) and (pointer: fine)',()=>{
  const cleanups=[];
  document.querySelectorAll('.inventory-section,.experience,.about-section,.contact-section').forEach(section=>{
    const layer=section.querySelector('.inventory-atmosphere,.experience-backdrop,.about-environment,.contact-atmosphere');
    if(!layer)return;
    const move=event=>{
      const box=section.getBoundingClientRect(),x=(event.clientX-box.left)/box.width-.5,y=(event.clientY-box.top)/box.height-.5;
      gsap.to(layer,{x:x*18,y:y*12,duration:1.15,ease:'power3.out',overwrite:'auto'});
    };
    const leave=()=>gsap.to(layer,{x:0,y:0,duration:1.4,ease:'power3.out',overwrite:'auto'});
    section.addEventListener('pointermove',move);
    section.addEventListener('pointerleave',leave);
    cleanups.push(()=>{section.removeEventListener('pointermove',move);section.removeEventListener('pointerleave',leave)});
  });
  return()=>cleanups.forEach(cleanup=>cleanup());
});
ScrollTrigger.create({start:0,end:'max',onUpdate:self=>{
  document.documentElement.style.setProperty('--scroll',self.progress);
  document.querySelector('.site-header')?.classList.toggle('scrolled',self.scroll()>40);
}});
}else{
  let scrollFrame=0;
  const updateScroll=()=>{
    const maximum=document.documentElement.scrollHeight-innerHeight;
    document.documentElement.style.setProperty('--scroll',maximum?scrollY/maximum:0);
    document.querySelector('.site-header')?.classList.toggle('scrolled',scrollY>40);
    scrollFrame=0;
  };
  addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll)},{passive:true});
  updateScroll();
}
// The landing scene intentionally has no hero vehicle; detail 360° viewers are loaded on demand.

const tilt=(card,event)=>{
  if(matchMedia('(pointer:coarse)').matches)return;
  const box=card.getBoundingClientRect(),x=(event.clientX-box.left)/box.width-.5,y=(event.clientY-box.top)/box.height-.5;
  card.style.transform=`perspective(900px) rotateX(${-y*3}deg) rotateY(${x*4}deg) translateY(-6px)`;
};
if(!simpleMotion&&matchMedia('(pointer: fine)').matches){
  document.querySelector('#vehicleGrid')?.addEventListener('pointermove',event=>{const card=event.target.closest('.vehicle-card');if(card)tilt(card,event)});
  document.querySelector('#vehicleGrid')?.addEventListener('pointerout',event=>{const card=event.target.closest('.vehicle-card');if(card)card.style.transform=''});
}

document.querySelectorAll('.section-heading,.experience-panel,.about-art,.about-copy,.contact-copy,#contactForm').forEach(element=>{
  if(simpleMotion){element.classList.add('in-view');return}
  gsap.fromTo(element,{autoAlpha:0,y:42},{autoAlpha:1,y:0,duration:.8,ease:'power3.out',onStart:()=>element.classList.add('in-view'),scrollTrigger:{trigger:element,start:'top 88%',once:true}});
});

const watchCards=()=>document.querySelectorAll('.vehicle-card:not([data-motion-ready])').forEach((card,index)=>{
  card.dataset.motionReady='true';
  card.style.setProperty('--delay',`${Math.min(index%6,5)*85}ms`);
  if(simpleMotion){card.classList.add('card-visible');return}
  gsap.fromTo(card,{autoAlpha:0,y:42,scale:.985},{autoAlpha:1,y:0,scale:1,duration:.7,delay:(index%3)*.065,ease:'power3.out',onStart:()=>card.classList.add('card-visible'),scrollTrigger:{trigger:card,start:'top 94%',once:true}});
});
watchCards();new MutationObserver(()=>{watchCards();if(!performanceLite)ScrollTrigger.refresh()}).observe(document.querySelector('#vehicleGrid'),{childList:true});

if(!simpleMotion&&matchMedia('(pointer: fine)').matches)document.querySelectorAll('.button').forEach(button=>button.addEventListener('pointermove',event=>{const box=button.getBoundingClientRect();button.style.setProperty('--mx',`${event.clientX-box.left}px`);button.style.setProperty('--my',`${event.clientY-box.top}px`)}));
