window.defaultVehicles = [
  [1,'Volkswagen','Golf 8.5',559,'Hatchback','Automatic','In stock'],[2,'Volkswagen','Golf 8.6 Fimi',564,'Hatchback','Automatic','Arriving'],[3,'Volkswagen','Tharu XR',null,'SUV','Automatic','On request'],[4,'Volkswagen','T-Roc Grenardo',539,'SUV','Automatic','In stock'],[5,'Volkswagen','Jetta VS5',379,'SUV','Automatic','In stock'],[6,'Volkswagen','Jetta VS8',445,'SUV','Automatic','Arriving'],
  [7,'Audi','A3',610,'Sedan','Automatic','In stock'],[8,'Audi','Q3',645,'SUV','Automatic','On request'],[9,'Changan','X5 Manual',255,'SUV','Manual','In stock'],[10,'Changan','X5 Plus',280,'SUV','Automatic','In stock'],[11,'Roewe','i5',202,'Sedan','Automatic','In stock'],
  [12,'Geely','Coolray Manual',260,'SUV','Manual','In stock'],[13,'Geely','Coolray Battle',332,'SUV','Automatic','Arriving'],[14,'Geely','Coolray Full',320,'SUV','Automatic','In stock'],[15,'Livan','GX3 Pro Manual',235,'SUV','Manual','In stock'],[16,'Livan','GX3 Pro Automatic',250,'SUV','Automatic','In stock'],
  [17,'GAC','GS3 Base',265,'SUV','Automatic','In stock'],[18,'GAC','GS3 Medium',290,'SUV','Automatic','In stock'],[19,'GAC','GS3 Full',320,'SUV','Automatic','Arriving'],[20,'GAC','GS3 R Style',345,'SUV','Automatic','In stock'],[21,'GAC','GS4 Max',398,'SUV','Automatic','In stock'],
  [22,'Kaiyi','X3 Pro',255,'SUV','Automatic','In stock'],[23,'Kaiyi','X7',null,'SUV','Automatic','On request'],[24,'Lynk & Co','06',385,'SUV','Automatic','In stock'],[25,'Jetour','X70 5 Seat',440,'SUV','Automatic','Arriving'],[26,'Jetour','Dashing 7 Seat',455,'SUV','Automatic','In stock'],[27,'Jetour','Dashing',395,'SUV','Automatic','In stock'],[28,'Jetour','T1 1.5',490,'SUV','Automatic','Arriving'],[29,'Jetour','T2 1.5',595,'SUV','Automatic','In stock'],[30,'Kia','K3',null,'Sedan','Automatic','On request'],[31,'Kia','KX1',null,'SUV','Automatic','On request']
].map(([id,brand,model,price,body,transmission,status])=>({id,brand,model,price,body,transmission,status,year:2026,published:true,featured:[29,7,4,20,14,11].includes(id),...(id===4?{has360:true,spinFrames:16,sprite:'assets/cars/volkswagen-t-roc/t-roc-360-sprite-16-white-v3.png'}:id===11?{has360:true,spinFrames:16,sprite:'assets/cars/roewe-i5/roewe-i5-detail-360-16-white-v4.png'}:{})}));

const catalogPhotos={
  1:'golf.jpg',2:'golf.jpg',3:'tharu-xr.jpg',4:'t-roc.jpg',5:'jetta-vs5.jpg',6:'jetta-vs8.jpg',
  7:'audi-a3.jpg',8:'audi-q3.jpg',9:'changan-x5.jpg',10:'changan-x5.jpg',11:'roewe-i5.jpg',
  12:'geely-coolray.jpg',13:'geely-coolray.jpg',14:'geely-coolray.jpg',15:'livan-x3-pro.webp',16:'livan-x3-pro.webp',
  17:'gac-gs3.jpg',18:'gac-gs3.jpg',19:'gac-gs3.jpg',20:'gac-gs3.jpg',21:'gac-gs4-max.jpg',
  22:'kaiyi-x3-pro.webp',23:'kaiyi-x7.jpg',24:'lynk-co-06.webp',25:'jetour-x70.png',
  26:'jetour-dashing.jpg',27:'jetour-dashing.jpg',28:'jetour-t1.png',29:'jetour-t2.png',30:'kia-k3.jpg',31:'kia-kx1.jpg'
};
window.defaultVehicles.forEach(vehicle=>vehicle.photo=`assets/cars/catalog/${catalogPhotos[vehicle.id]}`);
window.inventoryVehicleIds=Object.freeze(window.defaultVehicles.map(vehicle=>vehicle.id));

window.getVehicles = () => {
  const saved = localStorage.getItem('abidi-vehicles');
  if (!saved) return window.defaultVehicles;
  let records;
  try { records = JSON.parse(saved); } catch { return window.defaultVehicles; }
  if(!Array.isArray(records))return window.defaultVehicles;
  const savedById=new Map(records.filter(vehicle=>vehicle&&window.inventoryVehicleIds.includes(vehicle.id)).map(vehicle=>[vehicle.id,vehicle]));
  return window.defaultVehicles.map(original => {
    const savedVehicle = savedById.get(original.id) || {};
    const merged = {...original, ...savedVehicle, id:original.id, brand:original.brand, model:original.model, photo:original.photo};
    return [4,11].includes(original.id) ? {...merged, has360:original.has360, has3d:false, spinFrames:original.spinFrames, sprite:original.sprite, modelUrl:undefined, modelCredit:undefined} : merged;
  });
};
