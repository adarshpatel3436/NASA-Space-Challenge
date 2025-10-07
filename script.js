const map = L.map('map', {center:[0,0], zoom:2, worldCopyJump:true});
const satelliteBase = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
satelliteBase.addTo(map);

const demoConfig = {
  heat: {layerId:'MODIS_Terra_L3_SST_MUR', format:'jpg'},
  coral:{layerId:'JPL_Ocean_Bleaching_Index', format:'png'},
  clouds:{layerId:'MODIS_Terra_CorrectedReflectance_TrueColor', format:'jpg'}
};

const overlays = {};
const sampleDates = [
  '2015-01-01','2016-01-01','2017-01-01','2018-01-01',
  '2019-01-01','2019-07-01','2020-01-01','2020-07-01',
  '2021-01-01','2022-01-01','2023-01-01'
];

function gibstile(layerId, date, z,x,y,fmt='jpg'){
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layerId}/default/${date}/GoogleMapsCompatible_Level9/${z}/${y}/${x}.${fmt}`;
}

function addOverlay(key, date){
  const cfg = demoConfig[key];
  if(!cfg) return;
  // Remove all overlays first
  Object.values(overlays).forEach(l => map.removeLayer(l));
  overlays[key] = null;
  // Add overlay only if key is valid
  const layer = L.tileLayer('', {tileSize:256, opacity:0.85});
  layer.getTileUrl = c => gibstile(cfg.layerId, date, c.z, c.x, c.y, cfg.format);
  overlays[key] = layer.addTo(map);
}

const timeRange = document.getElementById('timeRange');
const timeLabel = document.getElementById('timeLabel');

function setTimeFromSlider(){
  const idx = Number(timeRange.value);
  const date = sampleDates[idx];
  timeLabel.textContent = date;
  document.querySelectorAll('#layerButtons button.active').forEach(btn=>{
    addOverlay(btn.dataset.layer, date);
  });
}
timeRange.addEventListener('input', setTimeFromSlider);

document.getElementById('layerButtons').addEventListener('click', e=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  document.querySelectorAll('#layerButtons button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  addOverlay(btn.dataset.layer, sampleDates[timeRange.value]);
});

document.getElementById('chapters').addEventListener('click', e=>{
  const ch = e.target.closest('.chapter');
  if(!ch) return;
  document.querySelectorAll('.chapter').forEach(c=>c.classList.remove('active'));
  ch.classList.add('active');
  const id = ch.dataset.chapter;
  if(id==='heat'){ map.flyTo([0,-150],3); document.querySelector('[data-layer=\"heat\"]').click();}
  else if(id==='coral'){ map.flyTo([-15,145],4); document.querySelector('[data-layer=\"coral\"]').click();}
  else if(id==='clouds'){ map.flyTo([20,-60],3); document.querySelector('[data-layer=\"clouds\"]').click();}
  else{ map.flyTo([20,0],2);}
});

timeRange.value = 5;
setTimeFromSlider();
document.querySelector('[data-layer="heat"]').click();
document.querySelector('.chapter[data-chapter="intro"]').click();
// End of script.js
