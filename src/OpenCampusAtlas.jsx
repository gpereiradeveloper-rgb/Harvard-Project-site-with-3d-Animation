import React,{useEffect,useRef} from 'react';
import {Map as LibreMap,Marker,AttributionControl,setWorkerUrl} from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import gsap from 'gsap';
import {openAtlasCameraAt,OPEN_ATLAS_LANDMARKS} from './OpenCampusAtlasCamera';
import './OpenCampusAtlas.css';

// Official Vite setup: https://openfreemap.org/quick_start/
setWorkerUrl(workerUrl);
const STYLE='https://tiles.openfreemap.org/styles/liberty';
const SOURCE='harvard-open-buildings';
const BUILDINGS='harvard-campus-buildings';
const PALETTE={paper:'#ebe4d6',park:'#c6c9b1',water:'#9daeb0',road:'#f9f3e7',line:'#c9bfae',ink:'#263e4b',building:'#d9c9ab'};

function finishMap(map){
 const style=map.getStyle(),layers=style.layers||[];
 for(const layer of layers){
  const sourceLayer=layer['source-layer']||'',id=layer.id.toLowerCase();
  if(layer.type==='background')map.setPaintProperty(layer.id,'background-color',PALETTE.paper);
  else if(layer.type==='fill-extrusion')map.setLayoutProperty(layer.id,'visibility','none');
  else if(layer.type==='fill'){
   if(sourceLayer==='water')map.setPaintProperty(layer.id,'fill-color',PALETTE.water);
   else if(sourceLayer==='landcover'||sourceLayer==='park')map.setPaintProperty(layer.id,'fill-color',PALETTE.park);
   else if(sourceLayer==='building'){
    map.setPaintProperty(layer.id,'fill-color',PALETTE.building);
    map.setPaintProperty(layer.id,'fill-outline-color',PALETTE.line);
   }
  }else if(layer.type==='line'&&sourceLayer==='transportation'){
   map.setPaintProperty(layer.id,'line-color',/casing|outline|rail/.test(id)?PALETTE.line:PALETTE.road);
  }else if(layer.type==='symbol'){
   if(sourceLayer==='poi'||/housenumber/.test(id))map.setLayoutProperty(layer.id,'visibility','none');
   else if(layer.layout?.['text-field']){
    map.setPaintProperty(layer.id,'text-color',PALETTE.ink);
    map.setPaintProperty(layer.id,'text-halo-color',PALETTE.paper);
    map.setPaintProperty(layer.id,'text-halo-width',1.4);
   }
  }
 }
 const vector=Object.entries(style.sources||{}).find(([,source])=>source.type==='vector'&&/openfreemap\.org/.test(source.url||''))||Object.entries(style.sources||{}).find(([,source])=>source.type==='vector');
 let sourceId=vector?.[0];
 if(!sourceId){map.addSource(SOURCE,{type:'vector',url:'https://tiles.openfreemap.org/planet'});sourceId=SOURCE;}
 const labels=layers.find(layer=>layer.type==='symbol'&&layer.layout?.['text-field'])?.id;
 const height=['to-number',['coalesce',['get','render_height'],['get','height']],6];
 const base=['to-number',['coalesce',['get','render_min_height'],['get','min_height']],0];
 map.addLayer({id:BUILDINGS,type:'fill-extrusion',source:sourceId,'source-layer':'building',minzoom:14,
  filter:['!=',['get','hide_3d'],true],
  paint:{'fill-extrusion-color':PALETTE.building,'fill-extrusion-opacity':1,'fill-extrusion-vertical-gradient':true,
   'fill-extrusion-height':['interpolate',['linear'],['zoom'],14,0,15,['max',height,3]],
   'fill-extrusion-base':['interpolate',['linear'],['zoom'],14,0,15,base]}},labels);
 map.setLight({anchor:'viewport',position:[1.4,210,38],color:'#fff3dd',intensity:.46});
}

/** Public, no-key cartographic 3D. Building footprints/heights are OpenStreetMap data. */
export default function OpenCampusAtlas({motion,active=true,onReady,onError,onSelect}){
 const host=useRef(),activeRef=useRef(active),callbacks=useRef({onReady,onError,onSelect}),controller=useRef();
 activeRef.current=active;callbacks.current={onReady,onError,onSelect};
 useEffect(()=>{controller.current?.activity();},[active]);
 useEffect(()=>{
  if(!host.current)return;
  let map,alive=true,ready=false,failed=false,styleReady=false,ticking=false,deadline,lastProgress=-1;
  const markers=[],cleanups=[],mobile=matchMedia('(max-width:700px)');
  const status=value=>{if(alive&&host.current)host.current.dataset.mapStatus=value;};
  const fail=code=>{
   if(!alive||failed)return;failed=true;clearTimeout(deadline);stopTicker();map?.stop();status('error');
   callbacks.current.onError?.(new Error(code));
  };
  const writeCamera=()=>{
   if(!alive||failed||!styleReady||!map||!activeRef.current||document.hidden)return;
   const p=Math.max(0,Math.min(1,Number(motion?.progress)||0));
   if(Math.abs(p-lastProgress)<.00002)return;
   lastProgress=p;const camera=openAtlasCameraAt(p,mobile.matches);map.jumpTo(camera);
   Object.assign(host.current.dataset,{cameraLng:camera.center[0].toFixed(7),cameraLat:camera.center[1].toFixed(7),cameraZoom:camera.zoom.toFixed(3),cameraHeading:camera.bearing.toFixed(3),cameraTilt:camera.pitch.toFixed(3)});
  };
  const stopTicker=()=>{if(ticking){gsap.ticker.remove(writeCamera);ticking=false;}};
  const activity=()=>{
   clearTimeout(deadline);
   if(!alive||failed||!map)return;
   if(activeRef.current&&!document.hidden){
    map.resize();lastProgress=-1;writeCamera();
    if(!ticking){gsap.ticker.add(writeCamera);ticking=true;}
    if(!ready)deadline=setTimeout(()=>fail('OPEN_MAP_FIRST_SCENE_TIMEOUT'),45000);
   }else{stopTicker();map.stop();}
  };
  controller.current={activity};status('loading-style');
  try{
   map=new LibreMap({container:host.current,style:STYLE,...openAtlasCameraAt(motion?.progress||0,mobile.matches),
    minZoom:13,maxZoom:20,maxPitch:60,attributionControl:false,cooperativeGestures:true,pixelRatio:Math.min(devicePixelRatio||1,mobile.matches?1.35:1.5),
    canvasContextAttributes:{antialias:true},renderWorldCopies:false,fadeDuration:0,trackResize:false,
    dragRotate:false,touchPitch:false,locale:{'Map.Title':'Harvard campus in 3D'}});
   map.repaint=false;
   map.addControl(new AttributionControl({compact:false,customAttribution:'<a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer">OpenFreeMap</a>'}),'bottom-right');
   map.getCanvas().setAttribute('aria-label','Harvard in 3D. Scroll the page to continue; use two fingers or hold Ctrl to explore the map.');
   const loaded=()=>{
    if(!alive||failed)return;
    try{
     finishMap(map);styleReady=true;status('loading-map');
     for(const place of OPEN_ATLAS_LANDMARKS){
      const element=document.createElement('button');element.type='button';element.className='oca-landmark'+(place.id==='church'?' is-destination':'');
      element.dataset.landmark=place.id;element.setAttribute('aria-label',`Discover ${place.name}`);
      const dot=document.createElement('span');dot.className='oca-landmark-dot';dot.setAttribute('aria-hidden','true');
      const label=document.createElement('span');label.className='oca-landmark-label';label.textContent=place.name;
      element.append(dot,label);
      const select=event=>{event.stopPropagation();if(activeRef.current)callbacks.current.onSelect?.(place.id);};
      element.addEventListener('click',select);cleanups.push(()=>element.removeEventListener('click',select));
      markers.push(new Marker({element,anchor:'bottom',offset:[0,-4]}).setLngLat(place.coordinates).addTo(map));
     }
     lastProgress=-1;writeCamera();
    }catch{fail('OPEN_MAP_STYLE_INITIALIZATION_FAILED');}
   };
   const firstFrame=()=>{
    if(!alive||failed||ready||!styleReady||!map.isStyleLoaded()||!map.areTilesLoaded())return;
    ready=true;clearTimeout(deadline);status('ready');map.off('render',firstFrame);callbacks.current.onReady?.();
   };
   const error=event=>{
    // A single unavailable tile is recoverable; the active first-scene timeout
    // handles persistent network/style failures without flashing the fallback.
    if(alive&&host.current)host.current.dataset.mapWarning=event.error?.name||'resource-unavailable';
   };
   const resize=()=>{if(activeRef.current&&!document.hidden){map.resize();lastProgress=-1;writeCamera();}};
   map.on('load',loaded);map.on('render',firstFrame);map.on('error',error);
   document.addEventListener('visibilitychange',activity);mobile.addEventListener('change',resize);
   const observer=new ResizeObserver(resize);observer.observe(host.current);
   cleanups.push(()=>map.off('load',loaded),()=>map.off('render',firstFrame),()=>map.off('error',error),()=>document.removeEventListener('visibilitychange',activity),()=>mobile.removeEventListener('change',resize),()=>observer.disconnect());
   activity();
  }catch{fail('OPEN_MAP_INITIALIZATION_FAILED');}
  return()=>{
   alive=false;controller.current=null;clearTimeout(deadline);stopTicker();
   cleanups.forEach(remove=>remove());markers.forEach(marker=>marker.remove());map?.remove();
  };
 },[motion]);
 return <div ref={host} className="open-campus-atlas" data-provider="openfreemap-maplibre" data-harvard-geographic-map="true" role="region" aria-label="A 3D map of Harvard’s campus"/>;
}
