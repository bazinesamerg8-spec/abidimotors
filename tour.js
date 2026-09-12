(() => {
  'use strict';
  const root = document.querySelector('.showroom-tour');
  if (!root) return;
  const query = selector => root.querySelector(selector);
  const journey = root.closest('.showroom-journey') || root;
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
  const motionButton = query('#tourMotion');
  const route = [...root.querySelectorAll('[data-room-target]')];
  let current = 0, paused = false, reduced = preference.matches, roomTransition = null, travelTarget = null, travelTimer = 0;
  let raf = 0, lookX = 0, lookY = 0, lookRX = 0, lookRY = 0, targetX = 0, targetY = 0, targetRX = 0, targetRY = 0, visible = true;
  const motionAllowed = () => !paused && !reduced && !performanceLite && visible && !document.hidden;
  const animate = (element, properties) => {
    if (window.gsap && motionAllowed()) gsap.to(element, properties);
    else {
      if (window.gsap) gsap.killTweensOf(element);
      Object.entries(properties).filter(([key]) => key.startsWith('--')).forEach(([key,value]) => element.style.setProperty(key,value));
    }
  };
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
    root.classList.toggle('is-paused', paused || reduced || performanceLite);
    root.dataset.motionPaused = String(paused || reduced || performanceLite);
    motionButton.setAttribute('aria-pressed',String(paused || reduced || performanceLite));
    motionButton.textContent = performanceLite ? 'Optimized motion' : reduced ? 'Reduced motion on' : paused ? 'Resume motion ▶' : 'Pause motion Ⅱ';
    motionButton.disabled = reduced || performanceLite;
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
    query('#tourAction').textContent = room.action + ' ↗';
    query('#tourFact').textContent = room.fact;
    query('#tourFactDetail').textContent = room.note;
    query('#tourLocation').textContent = room.name;
    query('#tourHotspotLabel').textContent = room.next;
    gallery.hidden = index !== 2;
    if(index===2)gallery.querySelectorAll('img[data-src]').forEach(image=>{
      image.src=image.dataset.src;
      image.removeAttribute('data-src');
    });
    query('#tourPrevious').disabled = index === 0;
    query('#tourNext').disabled = index === rooms.length - 1;
    route.forEach(button => {
      if (button.dataset.roomTarget === room.id) button.setAttribute('aria-current','step');
      else button.removeAttribute('aria-current');
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
        copy.animate(
          [{opacity:.55,transform:`translateY(${direction*10}px)`},{opacity:1,transform:'translateY(0)'}],
          {duration:220,easing:'cubic-bezier(.2,.8,.2,1)'}
        );
      }
    }
    if (announce) query('#tourStatus').textContent = room.name + '. ' + room.description;
  }
  function travelTo(index) {
    if (index < 0 || index >= rooms.length) return;
    setRoom(index,true,reduced||performanceLite);
    if (reduced) return;
    travelTarget=index;
    clearTimeout(travelTimer);
    travelTimer=setTimeout(()=>{travelTarget=null},1600);
    const start = journey.getBoundingClientRect().top + scrollY;
    const distance = Math.max(0,journey.offsetHeight-innerHeight);
    scrollTo({top:start+distance*(index/(rooms.length-1)),behavior:paused?'auto':'smooth'});
  }
  function scrubShowroom(progress) {
    if (reduced || performanceLite) return;
    const scaled=Math.max(0,Math.min(1,progress))*2,from=Math.min(1,Math.floor(scaled)),to=Math.min(2,from+1),mix=scaled-from;
    const index=progress<.25?0:progress<.75?1:2;
    if(travelTarget!==null&&Math.abs(progress-travelTarget/2)<.025){travelTarget=null;clearTimeout(travelTimer)}
    if(travelTarget===null&&index!==current)setRoom(index,true,false);
    const x=rooms[from].camera+(rooms[to].camera-rooms[from].camera)*mix;
    const zoom=rooms[from].zoom+(rooms[to].zoom-rooms[from].zoom)*mix;
    root.style.setProperty('--room-x',(paused?rooms[index].camera:x).toFixed(3)+'vw');
    root.style.setProperty('--room-scale',(paused?rooms[index].zoom:zoom).toFixed(4));
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
  route.forEach((button,index) => button.addEventListener('click',() => travelTo(index)));
  query('.tour-route').addEventListener('keydown',event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : Math.min(2,Math.max(0,current+(event.key==='ArrowRight'?1:-1)));
    travelTo(next); route[next].focus();
  });
  query('#tourPrevious').addEventListener('click',() => travelTo(current-1));
  query('#tourNext').addEventListener('click',() => travelTo(current+1));
  query('#tourHotspot').addEventListener('click',() => travelTo((current+1)%rooms.length));
  query('#tourAction').addEventListener('click',() => current<2 ? travelTo(current+1) : goToSection('inventory'));
  motionButton.addEventListener('click',() => {paused=!paused; updateMotion()});
  preference.addEventListener('change',event => {reduced=event.matches;updateMotion()});
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
    if (!visible) resetLook();
  },{threshold:0}).observe(root);
  document.addEventListener('visibilitychange',() => {if(document.hidden) resetLook()});
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
  setRoom(0,false); updateMotion();
  if (window.ScrollTrigger && !performanceLite) ScrollTrigger.create({
    trigger:journey,start:'top top',end:'bottom bottom',invalidateOnRefresh:true,
    onUpdate:self=>scrubShowroom(self.progress)
  });
  else if(performanceLite&&!reduced){
    let liteScrollFrame=0;
    const updateLiteRoom=()=>{
      const distance=Math.max(1,journey.offsetHeight-innerHeight);
      const progress=Math.max(0,Math.min(1,-journey.getBoundingClientRect().top/distance));
      const next=progress<.25?0:progress<.75?1:2;
      if(travelTarget!==null){
        if(Math.abs(progress-travelTarget/2)<.035){travelTarget=null;clearTimeout(travelTimer)}
      }else if(next!==current)setRoom(next,true,true);
      liteScrollFrame=0;
    };
    addEventListener('scroll',()=>{if(!liteScrollFrame)liteScrollFrame=requestAnimationFrame(updateLiteRoom)},{passive:true});
  }
})();
