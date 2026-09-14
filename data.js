window.defaultVehicles = [
  [1,'Volkswagen','Golf 8.5',559,'Hatchback','Automatic','In stock'],[2,'Volkswagen','Golf 8.6 Fimi',564,'Hatchback','Automatic','Arriving'],[3,'Volkswagen','Tharu XR',null,'SUV','Automatic','On request'],[4,'Volkswagen','T-Roc Grenardo',539,'SUV','Automatic','In stock'],[5,'Volkswagen','Jetta VS5',379,'SUV','Automatic','In stock'],[6,'Volkswagen','Jetta VS8',445,'SUV','Automatic','Arriving'],
  [7,'Audi','A3',610,'Sedan','Automatic','In stock'],[8,'Audi','Q3',645,'SUV','Automatic','On request'],[9,'Changan','X5 Manual',255,'SUV','Manual','In stock'],[10,'Changan','X5 Plus',280,'SUV','Automatic','In stock'],[11,'Roewe','i5',202,'Sedan','Automatic','In stock'],
  [12,'Geely','Coolray Manual',260,'SUV','Manual','In stock'],[13,'Geely','Coolray Battle',332,'SUV','Automatic','Arriving'],[14,'Geely','Coolray Full',320,'SUV','Automatic','In stock'],[15,'Livan','GX3 Pro Manual',235,'SUV','Manual','In stock'],[16,'Livan','GX3 Pro Automatic',250,'SUV','Automatic','In stock'],
  [17,'GAC','GS3 Base',265,'SUV','Automatic','In stock'],[18,'GAC','GS3 Medium',290,'SUV','Automatic','In stock'],[19,'GAC','GS3 Full',320,'SUV','Automatic','Arriving'],[20,'GAC','GS3 R Style',345,'SUV','Automatic','In stock'],[21,'GAC','GS4 Max',398,'SUV','Automatic','In stock'],
  [22,'Kaiyi','X3 Pro',255,'SUV','Automatic','In stock'],[23,'Kaiyi','X7',null,'SUV','Automatic','On request'],[24,'Lynk & Co','06',385,'SUV','Automatic','In stock'],[25,'Jetour','X70 5 Seat',440,'SUV','Automatic','Arriving'],[26,'Jetour','Dashing 7 Seat',455,'SUV','Automatic','In stock'],[27,'Jetour','Dashing',395,'SUV','Automatic','In stock'],[28,'Jetour','T1 1.5',490,'SUV','Automatic','Arriving'],[29,'Jetour','T2 1.5',595,'SUV','Automatic','In stock'],[30,'Kia','K3',null,'Sedan','Automatic','On request'],[31,'Kia','KX1',null,'SUV','Automatic','On request']
].map(([id,brand,model,price,body,transmission,status])=>({id,brand,model,price,body,transmission,status,year:2026,published:true,featured:[29,7,4,20,14,11].includes(id),...(id===4?{has3d:true,modelUrl:'assets/models/volkswagen-t-roc.glb',modelCredit:'Nieve5677 / Sketchfab · CC BY 4.0',has360:true,spinFrames:16,sprite:'assets/cars/volkswagen-t-roc/t-roc-360-sprite-16-white-v3.jpg'}:id===11?{has360:true,spinFrames:16,sprite:'assets/cars/roewe-i5/roewe-i5-detail-360-16-white-v4.jpg'}:id===27?{has3d:true,modelUrl:'assets/models/jetour-dashing/jetour-dashing-realtime.glb',modelCredit:'Model supplied by Abidi Motors',viewerScale:3.05}:{})}));

const catalogPhotos={
  1:'golf-optimized.jpg',2:'golf-optimized.jpg',3:'tharu-xr-optimized.jpg',4:'t-roc-optimized.jpg',5:'jetta-vs5-optimized.jpg',6:'jetta-vs8-optimized.jpg',
  7:'audi-a3-optimized.jpg',8:'audi-q3-optimized.jpg',9:'changan-x5-optimized.jpg',10:'changan-x5-optimized.jpg',11:'roewe-i5-optimized.jpg',
  12:'geely-coolray-optimized.jpg',13:'geely-coolray-optimized.jpg',14:'geely-coolray-optimized.jpg',15:'livan-x3-pro.webp',16:'livan-x3-pro.webp',
  17:'gac-gs3.jpg',18:'gac-gs3.jpg',19:'gac-gs3.jpg',20:'gac-gs3.jpg',21:'gac-gs4-max-optimized.jpg',
  22:'kaiyi-x3-pro.webp',23:'kaiyi-x7.jpg',24:'lynk-co-06.webp',25:'jetour-x70.png',
  26:'jetour-dashing.jpg',27:'jetour-dashing.jpg',28:'jetour-t1.png',29:'jetour-t2.png',30:'kia-k3-optimized.jpg',31:'kia-kx1.jpg'
};
const galleryGroups={1:'golf',2:'golf',3:'tharu-xr',4:'t-roc',5:'jetta-vs5',6:'jetta-vs8',7:'audi-a3',8:'audi-q3',9:'changan-x5',10:'changan-x5',11:'roewe-i5',12:'geely-coolray',13:'geely-coolray',14:'geely-coolray',15:'livan-x3-pro',16:'livan-x3-pro',17:'gac-gs3',18:'gac-gs3',19:'gac-gs3',20:'gac-gs3',21:'gac-gs4-max',22:'kaiyi-x3-pro',23:'kaiyi-x7',24:'lynk-co-06',25:'jetour-x70',26:'jetour-dashing',27:'jetour-dashing',28:'jetour-t1',29:'jetour-t2',30:'kia-k3',31:'kia-kx1'};
window.defaultVehicles.forEach(vehicle=>{
  vehicle.photo=`assets/cars/catalog/${catalogPhotos[vehicle.id]}`;
  const gallery=galleryGroups[vehicle.id];
  vehicle.photos=[vehicle.photo,...Array.from({length:4},(_,index)=>`assets/cars/gallery/${gallery}/view-${index+1}.jpg`)];
});
window.inventoryVehicleIds=Object.freeze(window.defaultVehicles.map(vehicle=>vehicle.id));

window.getVehicles = () => {
  const saved = localStorage.getItem('abidi-vehicles');
  if (!saved) return window.defaultVehicles;
  let records;
  try { records = JSON.parse(saved); } catch { return window.defaultVehicles; }
  if(!Array.isArray(records))return window.defaultVehicles;
  return records.filter(vehicle=>vehicle&&Number.isFinite(Number(vehicle.id))).map(vehicle=>{
    const id=Number(vehicle.id),original=window.defaultVehicles.find(item=>item.id===id);
    const merged={published:true,featured:false,year:new Date().getFullYear(),body:'Other',transmission:'Automatic',status:'In stock',...original,...vehicle,id,catalogPhoto:original?.photo||''};
    const savedPhotos=Array.isArray(vehicle.photos)?vehicle.photos.filter(Boolean):[];
    const useDefaultGallery=Boolean(original)&&(!savedPhotos.length||(savedPhotos.length===1&&!savedPhotos[0].startsWith('data:image/')));
    const photos=(useDefaultGallery?original.photos:Array.isArray(merged.photos)?merged.photos.filter(Boolean):[]).slice(0,5);
    merged.photos=photos.length?photos:(merged.photo?[merged.photo]:[]);
    merged.photo=merged.photos[0]||merged.photo||'';
    return original&&[4,11,27].includes(id)?{...merged,has360:original.has360,has3d:original.has3d||false,spinFrames:original.spinFrames,sprite:original.sprite,modelUrl:original.modelUrl,modelCredit:original.modelCredit,viewerScale:original.viewerScale}:merged;
  });
};
