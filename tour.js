(() => {
  'use strict';
  const root = document.querySelector('.showroom-tour');
  if (!root) return;
  const query = selector => root.querySelector(selector);
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const performanceLite = document.documentElement.classList.contains('performance-lite');
  const rooms = [
    {id:'arrival',name:'The arrival',kicker:'01 / THE ARRIVAL',
      title:'Your next chapter.',accent:'Parked here.',
      description:'Step into Abidi Motors. Look around, get closer to your next car, and make yourself at home.',
      action:'Enter the showroom',fact:'YOUR PRIVATE VISIT',note:'Explore at your own pace',next:'Begin the walkthrough',camera:14,zoom:1.04},
    {id:'passage',name:'The walkthrough',kicker:'02 / THE WALKTHROUGH',
      title:'Follow the light.',accent:'The room opens.',
      description:'Move through the architecture and let the showroom lead you toward the Abidi Motors collection.',
      action:'Continue walking',fact:'AN IMMERSIVE ARRIVAL',note:'Scroll to move deeper into the showroom',next:'Enter the collection',camera:0,zoom:1.09},
    {id:'collection',name:'The collection',kicker:'03 / THE COLLECTION',
      title:'A closer look.',accent:'A clearer choice.',
      description:'Step between our display stands. Select a vehicle for its details, or discover the full collection below.',
      action:'Explore all vehicles',fact:'THE ABIDI COLLECTION',note:'Availability and prices confirmed by our team',next:'Return to the arrival',camera:-14,zoom:1.05}
  ];
  const gallery = query('#tourGallery');
  const copy = query('.tour-room-copy');
  let current = 0, reduced = preference.matches, roomTransition = null, autoTimer = 0;
  let raf = 0, lookX = 0, lookY = 0, lookRX = 0, lookRY = 0, targetX = 0, targetY = 0, targetRX = 0, targetRY = 0, visible = true;
  const motionAllowed = () => !reduced && !performanceLite && visible && !document.hidden;
  const animate = (element, properties) => {
    if (window.gsap && motionAllowed()) gsap.to(element, properties);
    else {
      if (window.gsap) gsap.killTweensOf(element);
      Object.entries(properties).filter(([key]) => key.startsWith('--')).forEach(([key,value]) => element.style.setProperty(key,value));
    }
  };
  function clearAutoTour() {
    clearTimeout(autoTimer);
    autoTimer = 0;
  }
  function scheduleAutoTour() {
    clearAutoTour();
    if(reduced||!visible||document.hidden)return;
    autoTimer=setTimeout(()=>{
      autoTimer=0;
      if(reduced||!visible||document.hidden)return;
      setRoom((current+1)%rooms.length,true,true);
      scheduleAutoTour();
    },2000);
  }
  function renderLook() {
    raf = 0;
    if (!motionAllowed()) return;
    lookX += (targetX - lookX) * .09;
    lookY += (targetY - lookY) * .09;
    lookRX += (targetRX - lookRX) * .09;
    lookRY += (targetRY - lookRY) * .09;
    root.style.setProperty('--look-x', lookX.toFixed(2) + 'px');
    root.style.setProperty('--look-y', lookY.toFixed(2) + 'px');
    root.style.setProperty('--look-rx', lookRX.toFixed(3) + 'deg');
    root.style.setProperty('--look-ry', lookRY.toFixed(3) + 'deg');
    if (Math.abs(lookX-targetX)+Math.abs(lookY-targetY)+Math.abs(lookRX-targetRX)+Math.abs(lookRY-targetRY) > .06) raf = requestAnimationFrame(renderLook);
  }
  function resetLook() {
    cancelAnimationFrame(raf); raf = 0;
    targetX = targetY = targetRX = targetRY = lookX = lookY = lookRX = lookRY = 0;
    root.style.setProperty('--look-x','0px');
    root.style.setProperty('--look-y','0px');
    root.style.setProperty('--look-rx','0deg');
    root.style.setProperty('--look-ry','0deg');
  }
  function updateMotion() {
    root.classList.toggle('is-paused', reduced);
    root.classList.toggle('is-optimized', performanceLite && !reduced);
    root.dataset.motionPaused = String(reduced);
    if (!motionAllowed()) {
      resetLook();
      if (window.gsap) {
        roomTransition?.kill(); roomTransition = null;
        gsap.killTweensOf(root);
        gsap.killTweensOf([copy,gallery]);
        gsap.set([copy,gallery],{clearProps:'opacity,visibility,transform,filter'});
      }
      applyRoom(current);
      root.style.setProperty('--room-x', rooms[current].camera+'vw');
      root.style.setProperty('--room-scale', rooms[current].zoom);
    }
    if(!performanceLite)window.ScrollTrigger?.refresh();
  }
  function applyRoom(index) {
    const room = rooms[index];
    root.dataset.room = room.id;
    query('#tourKicker').textContent = room.kicker;
    const title = query('#tourTitle');
    title.replaceChildren(document.createTextNode(room.title),document.createElement('br'));
    const accent = document.createElement('em'); accent.textContent = room.accent; title.append(accent);
    query('#tourDescription').textContent = room.description;
    query('#tourAction').hidden = index !== 2;
    query('#tourAction').textContent = 'Explore all vehicles ↗';
    query('#tourFact').textContent = room.fact;
    query('#tourFactDetail').textContent = room.note;
    query('#tourLocation').textContent = room.name;
    gallery.hidden = index !== 2;
    if(index===2)gallery.querySelectorAll('img[data-src]').forEach(image=>{
      image.src=image.dataset.src;
      image.removeAttribute('data-src');
    });
  }
  function setRoom(index, announce = true, driveCamera = true) {
    if (index < 0 || index >= rooms.length || index === current && announce) return;
    const previous = current, direction = index >= previous ? 1 : -1;
    current = index;
    const room = rooms[index];
    if (driveCamera) animate(root, {'--room-x':room.camera+'vw','--room-scale':room.zoom,duration:1.35,ease:'power3.inOut',overwrite:true});
    if (window.gsap && motionAllowed() && announce) {
      roomTransition?.kill();
      const outgoing=[copy,...(!gallery.hidden?[gallery]:[])];
      const incoming=[copy,...(index===2?[gallery]:[])];
      gsap.killTweensOf([copy,gallery]);
      roomTransition=gsap.timeline({onComplete:()=>{roomTransition=null}})
        .to(outgoing,{autoAlpha:0,y:-20*direction,duration:.26,stagger:.02,ease:'power2.in'})
        .add(()=>{
          applyRoom(index);
          gsap.set(incoming,{autoAlpha:0,y:28*direction});
        })
        .to(incoming,{autoAlpha:1,y:0,duration:.52,stagger:.06,ease:'power3.out'})
        .set(incoming,{clearProps:'opacity,visibility,transform'});
    } else {
      applyRoom(index);
      if(performanceLite&&!reduced&&announce&&copy.animate){
        [copy,...(index===2?[gallery]:[])].forEach((element,position)=>element.animate(
          [{opacity:.45,transform:`translateY(${direction*12}px)`},{opacity:1,transform:'translateY(0)'}],
          {duration:360,delay:position*70,easing:'cubic-bezier(.2,.8,.2,1)'}
        ));
      }
    }
    if (announce) query('#tourStatus').textContent = room.name + '. ' + room.description;
  }
  function goToSection(id) {
    const destination = document.getElementById(id);
    destination.scrollIntoView({behavior:reduced || performanceLite ? 'instant' : 'smooth'});
    const heading = destination.querySelector('h2');
    heading?.setAttribute('tabindex','-1');
    heading?.focus({preventScroll:true});
  }
  const chosen = [4,29].map(id => state.vehicles.find(car => car.id === id)).filter(Boolean);
  if (!chosen.length) {
    const empty = document.createElement('p');
    empty.textContent = 'Our displays are being updated. Browse the collection or speak with our team.';
    gallery.append(empty);
  }
  chosen.forEach(car => {
    const stand = document.createElement('button');
    stand.type = 'button'; stand.className = 'tour-display';
    stand.setAttribute('aria-label','View details of ' + car.brand + ' ' + car.model);
    const photo = document.createElement('img');
    photo.dataset.src = car.photo; photo.alt = car.brand + ' ' + car.model; photo.loading = 'lazy'; photo.fetchPriority = 'low'; photo.decoding = 'async';
    const label = document.createElement('span'); label.className = 'tour-display-copy';
    const brand = document.createElement('small'); brand.textContent = car.brand + ' / ' + car.year;
    const name = document.createElement('strong'); name.textContent = car.model;
    const price = document.createElement('b'); price.textContent = (car.price ? car.price + 'M' : 'Price on request') + ' · View details ↗';
    label.append(brand,name,price); stand.append(photo,label);
    stand.addEventListener('click',() => detail(car.id)); gallery.append(stand);
  });
  query('#tourAction').addEventListener('click',()=>goToSection('inventory'));
  preference.addEventListener('change',event => {
    reduced=event.matches;
    clearAutoTour();
    updateMotion();
    if(!reduced)scheduleAutoTour();
  });
  root.addEventListener('pointermove',event => {
    if (event.pointerType !== 'mouse' || !motionAllowed() || event.buttons || document.querySelector('dialog[open]')) return;
    const box = root.getBoundingClientRect();
    const nx=(event.clientX-box.left)/box.width-.5,ny=(event.clientY-box.top)/box.height-.5;
    targetX = nx*-76;
    targetY = ny*-38;
    targetRX = ny*1.4;
    targetRY = nx*-2.4;
    if (!raf) raf = requestAnimationFrame(renderLook);
  },{passive:true});
  root.addEventListener('pointerleave',() => {targetX=targetY=targetRX=targetRY=0;if (!raf && motionAllowed()) raf=requestAnimationFrame(renderLook)});
  new IntersectionObserver(([entry]) => {
    visible=entry.isIntersecting;
    if (!visible){resetLook();clearAutoTour()}
    else scheduleAutoTour();
  },{threshold:0}).observe(root);
  document.addEventListener('visibilitychange',() => {
    if(document.hidden){resetLook();clearAutoTour()}
    else scheduleAutoTour();
  });
  // Keep customer-facing counts and brand labels tied to the actual published inventory.
  const brands = [...new Set(state.vehicles.map(car => car.brand))];
  const rail = document.querySelector('.brand-track');
  rail.replaceChildren(...brands.map(brand => {const span=document.createElement('span');span.textContent=brand.toUpperCase();return span}));
  document.querySelector('.trust-strip article b').textContent=state.vehicles.length+' vehicles';
  document.querySelector('.trust-strip article:last-child b').textContent='Explore in 360°';
  const menu=document.querySelector('.main-nav'),toggle=document.querySelector('.nav-toggle');
  toggle.addEventListener('click',() => toggle.setAttribute('aria-expanded',String(menu.classList.contains('open'))));
  menu.addEventListener('click',event => {
    if(event.target.closest('a')) {menu.classList.remove('open');toggle.setAttribute('aria-expanded','false')}
  });
  setRoom(0,false); updateMotion(); scheduleAutoTour();
})();
