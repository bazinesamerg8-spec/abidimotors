const aura=document.querySelector('.cursor-aura');
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
  if(window.gsap&&!matchMedia('(prefers-reduced-motion: reduce)').matches){gsap.fromTo('#vehicleModal .modal-viewer',{autoAlpha:0,x:-28},{autoAlpha:1,x:0,duration:.65,ease:'power3.out'});gsap.fromTo('#vehicleModal .modal-copy',{autoAlpha:0,x:28},{autoAlpha:1,x:0,duration:.65,delay:.08,ease:'power3.out'})}
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
window.addEventListener('pointermove',event=>{if(aura){aura.style.left=`${event.clientX}px`;aura.style.top=`${event.clientY}px`}});
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
const initHeroSpin=()=>{
  const car=document.querySelector('[data-hero-car]');
  if(!car)return;
  const total=16,canvas=document.createElement('canvas'),context=canvas.getContext('2d'),backCanvas=document.createElement('canvas'),backContext=backCanvas.getContext('2d');
  const vehicles={troc:{id:4,name:'VOLKSWAGEN T-ROC',src:'assets/cars/volkswagen-t-roc/t-roc-360-sprite-16-white-v3.png'},roewe:{id:11,name:'ROEWE i5',src:'assets/cars/roewe-i5/roewe-i5-reference-360-16-chroma-v4.png',extractChromaBackground:true}};
  let image=new Image(),source=image,backSource=null,active=vehicles.roewe,current=1,target=1,startX=0,lastX=0,lastTime=0,previousRender=performance.now(),resumeAutoAt=0,velocity=0,dragging=false,moved=false,ready=false,backReady=false,heroVisible=true;
  const heroMotionPreference=matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion=heroMotionPreference.matches;
  heroMotionPreference.addEventListener('change',event=>{reducedMotion=event.matches});
  const heroRoot=document.querySelector('.hero');
  let lastDrawnFrame=-1;
  canvas.className='hero-spin-canvas';
  backCanvas.className='hero-spin-canvas hero-spin-back';
  canvas.setAttribute('aria-hidden','true');
  backCanvas.setAttribute('aria-hidden','true');
  car.append(canvas);
  const wrap=value=>(value%total+total)%total;
  const resize=()=>{
    const ratio=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.max(1,Math.round(car.clientWidth*ratio));
    canvas.height=Math.max(1,Math.round(car.clientHeight*ratio));
    backCanvas.width=canvas.width;
    backCanvas.height=canvas.height;
    lastDrawnFrame=-1;
    if(ready)requestAnimationFrame(render);
  };
  const drawFrame=(frame,alpha,layerSource=source,layerCanvas=canvas,layerContext=context)=>{
    const sourceWidth=layerSource.naturalWidth||layerSource.width,sourceHeight=layerSource.naturalHeight||layerSource.height;
    const cellWidth=sourceWidth/4,cellHeight=sourceHeight/4,index=wrap(frame),column=index%4,row=Math.floor(index/4),crop=active.crop||[0,0,1,1];
    const sourceX=column*cellWidth+crop[0]*cellWidth,sourceY=row*cellHeight+crop[1]*cellHeight,sourceCellWidth=cellWidth*crop[2],sourceCellHeight=cellHeight*crop[3];
    const scale=Math.min(layerCanvas.width/sourceCellWidth,layerCanvas.height/sourceCellHeight),width=sourceCellWidth*scale,height=sourceCellHeight*scale,x=(layerCanvas.width-width)/2,y=(layerCanvas.height-height)/2;
    layerContext.globalAlpha=alpha;
    layerContext.drawImage(layerSource,sourceX,sourceY,sourceCellWidth,sourceCellHeight,x,y,width,height);
  };
  const extractLightBackground=input=>{
    const output=document.createElement('canvas'),ctx=output.getContext('2d',{willReadFrequently:true}),width=input.naturalWidth,height=input.naturalHeight;
    output.width=width;output.height=height;ctx.drawImage(input,0,0);
    const pixels=ctx.getImageData(0,0,width,height),data=pixels.data,seen=new Uint8Array(width*height),blocked=new Uint8Array(width*height),queue=new Int32Array(width*height);
    let head=0,tail=0;
    const eligible=index=>{const offset=index*4,r=data[offset],g=data[offset+1],b=data[offset+2];return Math.min(r,g,b)>226&&Math.max(r,g,b)-Math.min(r,g,b)<16};
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const index=y*width+x;
      if(eligible(index))continue;
      for(let oy=-2;oy<=2;oy++)for(let ox=-2;ox<=2;ox++){
        const nx=x+ox,ny=y+oy;
        if(nx>=0&&nx<width&&ny>=0&&ny<height)blocked[ny*width+nx]=1;
      }
    }
    const add=index=>{if(!seen[index]&&!blocked[index]&&eligible(index)){seen[index]=1;queue[tail++]=index}};
    for(let x=0;x<width;x++){add(x);add((height-1)*width+x)}
    for(let y=0;y<height;y++){add(y*width);add(y*width+width-1)}
    while(head<tail){const index=queue[head++],x=index%width,y=Math.floor(index/width);data[index*4+3]=0;if(x)add(index-1);if(x<width-1)add(index+1);if(y)add(index-width);if(y<height-1)add(index+width)}
    ctx.putImageData(pixels,0,0);return output;
  };
  const extractChromaBackground=input=>{
    const output=document.createElement('canvas'),ctx=output.getContext('2d',{willReadFrequently:true});
    output.width=input.naturalWidth;output.height=input.naturalHeight;ctx.drawImage(input,0,0);
    const pixels=ctx.getImageData(0,0,output.width,output.height),data=pixels.data;
    for(let offset=0;offset<data.length;offset+=4){
      const r=data[offset],g=data[offset+1],b=data[offset+2],edge=Math.max(r,b),dominance=g-edge;
      const deepKey=g>18&&g>(edge+1)*1.45;
      const brightKey=dominance>24&&g>(edge+1)*1.18;
      if(!deepKey&&!brightKey)continue;
      // Remove the dark green contact shadow as well as the bright backdrop,
      // while preserving the low-saturation glass and paint reflections.
      data[offset+3]=deepKey?0:Math.max(0,Math.min(255,Math.round((65-dominance)*6.2)));
      data[offset+1]=Math.min(g,edge+3);
    }
    ctx.putImageData(pixels,0,0);return output;
  };
  const render=now=>{
    const deltaTime=Math.min(34,Math.max(0,now-previousRender));
    previousRender=now;
    if(ready&&!document.hidden){
      // These are 16 photographed angles, not a 3D mesh. Cross-fading their
      // silhouettes makes the car transparent and doubles its wheels.
      // The hero now deliberately uses one stable front three-quarter view.
      const frame=1;
      if(frame!==lastDrawnFrame){
        context.clearRect(0,0,canvas.width,canvas.height);
        drawFrame(frame,1);
        if(backReady){
          backContext.clearRect(0,0,backCanvas.width,backCanvas.height);
          drawFrame(frame,1,backSource,backCanvas,backContext);
        }
        lastDrawnFrame=frame;
      }
    }
    if(ready)document.querySelector('.hero-loading')?.classList.add('is-ready');
    if(!ready)requestAnimationFrame(render);
  };
  const loadVehicle=key=>{
    active=vehicles[key]||vehicles.troc;
    ready=false;velocity=0;current=target=1;
    image=new Image();
    image.onload=()=>{
      try{source=active.extractChromaBackground?extractChromaBackground(image):active.extractLightBackground?extractLightBackground(image):image}
      catch(error){source=image;car.dataset.spinFallback='raw'}
      ready=true;resize();car.dataset.spinState='ready';
    };
    image.onerror=()=>{car.dataset.spinState='error';document.querySelector('.hero-loading span').textContent='Vehicle preview unavailable'};
    image.src=active.src;
    canvas.classList.toggle('hero-spin-light',key==='roewe'&&!active.extractLightBackground&&!active.extractChromaBackground);
    document.querySelector('.stage-caption span').textContent=active.name;
  };
  loadVehicle('roewe');
  new ResizeObserver(resize).observe(car);
  car.addEventListener('click',()=>detail(active.id));
  requestAnimationFrame(render);
};
initHeroSpin();

const tilt=(card,event)=>{
  if(matchMedia('(pointer:coarse)').matches)return;
  const box=card.getBoundingClientRect(),x=(event.clientX-box.left)/box.width-.5,y=(event.clientY-box.top)/box.height-.5;
  card.style.transform=`perspective(900px) rotateX(${-y*3}deg) rotateY(${x*4}deg) translateY(-6px)`;
};
document.querySelector('#vehicleGrid')?.addEventListener('pointermove',event=>{const card=event.target.closest('.vehicle-card');if(card)tilt(card,event)});
document.querySelector('#vehicleGrid')?.addEventListener('pointerout',event=>{const card=event.target.closest('.vehicle-card');if(card)card.style.transform=''});

const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.section-heading,.experience-panel,.about-art,.about-copy,.contact-copy,#contactForm').forEach(element=>{
  if(reducedMotion){element.classList.add('in-view');return}
  gsap.fromTo(element,{autoAlpha:0,y:55,clipPath:'inset(0 0 35% 0)'},{autoAlpha:1,y:0,clipPath:'inset(0 0 0% 0)',duration:1,ease:'power3.out',onStart:()=>element.classList.add('in-view'),scrollTrigger:{trigger:element,start:'top 86%',once:true}});
});

const watchCards=()=>document.querySelectorAll('.vehicle-card:not([data-motion-ready])').forEach((card,index)=>{
  card.dataset.motionReady='true';
  card.style.setProperty('--delay',`${Math.min(index%6,5)*85}ms`);
  if(reducedMotion){card.classList.add('card-visible');return}
  gsap.fromTo(card,{autoAlpha:0,y:65,scale:.96,filter:'blur(7px)'},{autoAlpha:1,y:0,scale:1,filter:'blur(0px)',duration:.85,delay:(index%3)*.08,ease:'power3.out',onStart:()=>card.classList.add('card-visible'),scrollTrigger:{trigger:card,start:'top 92%',once:true}});
});
watchCards();new MutationObserver(()=>{watchCards();ScrollTrigger.refresh()}).observe(document.querySelector('#vehicleGrid'),{childList:true});

document.querySelectorAll('.button').forEach(button=>button.addEventListener('pointermove',event=>{if(matchMedia('(pointer:coarse)').matches)return;const box=button.getBoundingClientRect();button.style.setProperty('--mx',`${event.clientX-box.left}px`);button.style.setProperty('--my',`${event.clientY-box.top}px`)}));
