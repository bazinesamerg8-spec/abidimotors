import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const coarsePointer=matchMedia('(pointer: coarse)').matches;
const lowPower=document.documentElement.classList.contains('performance-lite') || (navigator.hardwareConcurrency && navigator.hardwareConcurrency<=4);
const restingPixelRatio=()=>Math.min(window.devicePixelRatio||1,coarsePointer||lowPower?1.15:1.5);
const movingPixelRatio=()=>Math.min(restingPixelRatio(),(coarsePointer||lowPower) ? .85 : 1);

function disposeScene(root) {
  root?.traverse(object => {
    object.geometry?.dispose?.();
    const materials=Array.isArray(object.material)?object.material:[object.material];
    materials.filter(Boolean).forEach(material => {
      Object.values(material).forEach(value => value?.isTexture && value.dispose());
      material.dispose?.();
    });
  });
}

function getVehicleBox(root) {
  root.updateMatrixWorld(true);
  const box=new THREE.Box3();
  root.traverse(object => {
    const position=object.isMesh && object.geometry?.getAttribute('position');
    if(!position || !object.visible)return;
    if(!object.geometry.boundingBox)object.geometry.computeBoundingBox();
    box.union(object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld));
  });
  return box.isEmpty()?new THREE.Box3().setFromObject(root):box;
}

function getVehicleCenter(root) {
  root.updateMatrixWorld(true);
  const meshes=[];
  root.traverse(object => {
    const position=object.isMesh && object.geometry?.getAttribute('position');
    if(!position || !object.visible)return;
    if(!object.geometry.boundingBox)object.geometry.computeBoundingBox();
    const center=object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld).getCenter(new THREE.Vector3());
    meshes.push({center,weight:position.count});
  });
  if(!meshes.length)return new THREE.Vector3();
  const weightedMedian=axis => {
    const sorted=[...meshes].sort((a,b)=>a.center.getComponent(axis)-b.center.getComponent(axis));
    const middle=sorted.reduce((sum,item)=>sum+item.weight,0)/2;
    let total=0;
    return sorted.find(item=>(total+=item.weight)>=middle)?.center.getComponent(axis) || 0;
  };
  return new THREE.Vector3(weightedMedian(0),weightedMedian(1),weightedMedian(2));
}

function hideExportArtifacts(root) {
  root.updateMatrixWorld(true);
  const meshes=[];
  root.traverse(object => {
    const position=object.isMesh && object.geometry?.getAttribute('position');
    if(!position)return;
    if(!object.geometry.boundingBox)object.geometry.computeBoundingBox();
    const size=object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld).getSize(new THREE.Vector3());
    meshes.push({object,vertices:position.count,span:Math.max(size.x,size.y,size.z)});
  });
  const spans=meshes.filter(item=>item.vertices>=100).map(item=>item.span).sort((a,b)=>a-b);
  if(!spans.length)return;
  const median=spans[Math.floor(spans.length/2)];
  const limit=Math.max(24,median*4);
  meshes.forEach(item=>{if(item.span>limit)item.object.visible=false});
}

export function mountVehicleViewer({container,url,label='Volkswagen T-Roc',fitSize=5.35}) {
  if(!container || !url)return () => {};
  let renderer,controls,model,dialogObserver,raf=0,tail=0,disposed=false;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lite=document.documentElement.classList.contains('performance-lite');
  const status=container.querySelector('[data-three-status]');
  const progress=container.querySelector('[data-three-progress]');
  const fallback=container.querySelector('.three-fallback');
  const dialog=container.closest('dialog');
  if(dialog){
    dialogObserver=new MutationObserver(()=>{if(!dialog.hasAttribute('open'))dispose()});
    dialogObserver.observe(dialog,{attributes:true,attributeFilter:['open']});
  }

  const fail=message => {
    if(disposed)return;
    container.classList.add('is-error');
    if(status)status.textContent=message;
    if(fallback)fallback.hidden=false;
  };

  try {
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:!(coarsePointer||lowPower),powerPreference:lite?'default':'high-performance'});
  } catch {
    fail('3D is unavailable on this device. Showing the vehicle photo instead.');
    return () => {};
  }

  renderer.setPixelRatio(restingPixelRatio());
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.06;
  renderer.domElement.className='three-canvas';
  renderer.domElement.tabIndex=0;
  renderer.domElement.setAttribute('role','img');
  renderer.domElement.setAttribute('aria-label',`Interactive 3D view of ${label}. Drag to rotate and scroll or pinch to zoom.`);
  container.prepend(renderer.domElement);

  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-1,1,1,-1,.05,100);
  const viewHeight=3.5;
  const stage=new THREE.Group();
  scene.add(stage);
  scene.add(new THREE.HemisphereLight(0xffffff,0xb7b9b5,2.35));
  const key=new THREE.DirectionalLight(0xfff2df,3.7); key.position.set(4,7,5); scene.add(key);
  const rim=new THREE.DirectionalLight(0xd9e8ff,1.65); rim.position.set(-5,3,-4); scene.add(rim);
  const fill=new THREE.DirectionalLight(0xffffff,1.8); fill.position.set(-2,4,5); scene.add(fill);

  const ground=new THREE.Mesh(
    new THREE.CircleGeometry(4.4,64),
    new THREE.MeshStandardMaterial({color:0xd9d8d2,roughness:1,transparent:true,opacity:.32,depthWrite:false})
  );
  ground.rotation.x=-Math.PI/2;
  ground.position.y=-.025;
  scene.add(ground);

  controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=!reducedMotion;
  controls.dampingFactor=.075;
  controls.enablePan=false;
  controls.rotateSpeed=.62;
  controls.zoomSpeed=.78;
  controls.minZoom=.72;
  controls.maxZoom=2.5;
  controls.minPolarAngle=Math.PI*.27;
  controls.maxPolarAngle=Math.PI*.48;

  const render=() => {
    raf=0;
    if(disposed)return;
    controls.update();
    renderer.render(scene,camera);
    if(tail-- > 0)raf=requestAnimationFrame(render);
  };
  const wake=(frames=28) => {
    tail=Math.max(tail,reducedMotion?2:frames);
    if(!raf)raf=requestAnimationFrame(render);
  };
  const resize=() => {
    if(disposed)return;
    const {width,height}=container.getBoundingClientRect();
    if(!width||!height)return;
    renderer.setSize(width,height,false);
    const halfHeight=viewHeight/2;
    const halfWidth=halfHeight*(width/height);
    camera.left=-halfWidth;
    camera.right=halfWidth;
    camera.top=halfHeight;
    camera.bottom=-halfHeight;
    camera.updateProjectionMatrix();
    wake(2);
  };
  const observer=new ResizeObserver(resize);
  observer.observe(container);
  let qualityTimer=0,renderScale=restingPixelRatio();
  const setRenderScale=ratio=>{
    if(Math.abs(renderScale-ratio)<.01)return;
    renderScale=ratio;
    renderer.setPixelRatio(ratio);
    resize();
  };
  const interactionStart=()=>{clearTimeout(qualityTimer);setRenderScale(movingPixelRatio());wake(14)};
  const interactionEnd=()=>{clearTimeout(qualityTimer);qualityTimer=setTimeout(()=>{setRenderScale(restingPixelRatio());wake(3)},140)};
  renderer.domElement.addEventListener('pointerdown',interactionStart,{passive:true});
  renderer.domElement.addEventListener('pointermove',()=>wake(14),{passive:true});
  renderer.domElement.addEventListener('wheel',()=>{interactionStart();interactionEnd()},{passive:true});
  window.addEventListener('pointerup',interactionEnd,{passive:true});
  window.addEventListener('pointercancel',interactionEnd,{passive:true});
  controls.addEventListener('change',()=>wake(2));

  let initialPosition=new THREE.Vector3(7,3.7,8.5);
  let initialTarget=new THREE.Vector3(0,.8,0);
  const resetView=() => {
    camera.zoom=1;
    camera.position.copy(initialPosition);
    controls.target.copy(initialTarget);
    controls.update();
    wake(18);
  };
  container.querySelector('[data-three-reset]')?.addEventListener('click',resetView);

  new GLTFLoader().load(url,gltf => {
    if(disposed){disposeScene(gltf.scene);return}
    model=gltf.scene;
    hideExportArtifacts(model);
    const sourceBox=getVehicleBox(model);
    const sourceSize=sourceBox.getSize(new THREE.Vector3());
    const scale=fitSize/Math.max(sourceSize.x,sourceSize.z,sourceSize.y);
    model.scale.setScalar(scale);
    model.rotation.y=-Math.PI*.18;
    let box=getVehicleBox(model);
    const center=getVehicleCenter(model);
    model.position.set(-center.x,-box.min.y,-center.z);
    model.traverse(object => {
      if(!object.isMesh)return;
      object.frustumCulled=true;
      const materials=Array.isArray(object.material)?object.material:[object.material];
      materials.filter(Boolean).forEach(material=>{
        if('envMapIntensity' in material)material.envMapIntensity=.65;
        if('roughness' in material)material.roughness=Math.max(.22,material.roughness);
      });
    });
    stage.add(model);
    box=getVehicleBox(model);
    const fitted=box.getSize(new THREE.Vector3());
    const targetY=Math.max(.4,fitted.y*.42);
    const radius=Math.max(6.4,Math.max(fitted.x,fitted.z)*1.1);
    initialTarget.set(0,targetY,0);
    initialPosition.set(radius*.72,Math.max(1.55,fitted.y*1.5),radius);
    resetView();
    container.classList.add('is-ready');
    if(status)status.textContent='3D vehicle ready';
    if(progress)progress.style.setProperty('--model-progress','100%');
  },event => {
    if(!event.total||!progress)return;
    const amount=Math.min(99,Math.round(event.loaded/event.total*100));
    progress.style.setProperty('--model-progress',`${amount}%`);
    if(status)status.textContent=`Loading 3D vehicle - ${amount}%`;
  },()=>fail('The 3D model could not load. Showing the vehicle photo instead.'));

  function dispose() {
    if(disposed)return;
    disposed=true;
    cancelAnimationFrame(raf);
    clearTimeout(qualityTimer);
    window.removeEventListener('pointerup',interactionEnd);
    window.removeEventListener('pointercancel',interactionEnd);
    observer.disconnect();
    dialogObserver?.disconnect();
    controls.dispose();
    disposeScene(model);
    ground.geometry.dispose();
    ground.material.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
    dialog?.removeEventListener('close',dispose);
  }
  dialog?.addEventListener('close',dispose,{once:true});
  resize();
  wake(2);
  return dispose;
}
