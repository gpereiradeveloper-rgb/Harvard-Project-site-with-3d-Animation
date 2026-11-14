import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {supplyChainAt,SUPPLY_OPERATION_END,SUPPLY_FORK_INSET,supplyCradleHeight} from '../src/ArchiveSupplyChain.js';

// Read original geometry, not hand-tuned silhouettes. These warehouse GLBs
// have no skins; no browser or GPU is needed for the mechanical bounds.
globalThis.self=globalThis;
globalThis.ProgressEvent=class{};
globalThis.createImageBitmap=async()=>({width:1,height:1,close(){}});
async function model(name){
 const b=fs.readFileSync(new URL('../public/assets/warehouse-models/'+name+'.glb',import.meta.url));
 const {scene}=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
 scene.updateMatrixWorld(true);const parts=[];
 scene.traverse(m=>{if(m.isMesh)parts.push({name:m.name,bounds:new THREE.Box3().setFromObject(m)});});return parts;
}
const local=(lo,hi)=>({center:lo.map((v,i)=>(v+hi[i])/2),half:lo.map((v,i)=>(hi[i]-v)/2)});
const shape=box=>local(box.min.toArray(),box.max.toArray());
function world(part,p,yaw=0,lift=0){const c=Math.cos(yaw),s=Math.sin(yaw),[x,y,z]=part.center;return{center:[p[0]+c*x+s*z,p[1]+y+lift,p[2]-s*x+c*z],half:part.half,c,s};}
// Separating-axis gap for upright oriented boxes. A negative result is actual
// envelope penetration; zero is planned surface contact (fork/pallet or shelf).
function gap(a,b){
 const dx=b.center[0]-a.center[0],dz=b.center[2]-a.center[2],c=Math.abs(a.c*b.c+a.s*b.s),s=Math.abs(a.c*b.s-a.s*b.c);
 return Math.max(Math.abs(b.center[1]-a.center[1])-a.half[1]-b.half[1],
  Math.abs(dx*a.c-dz*a.s)-a.half[0]-c*b.half[0]-s*b.half[2],
  Math.abs(dx*a.s+dz*a.c)-a.half[2]-s*b.half[0]-c*b.half[2],
  Math.abs(dx*b.c-dz*b.s)-b.half[0]-c*a.half[0]-s*a.half[2],
  Math.abs(dx*b.s+dz*b.c)-b.half[2]-s*a.half[0]-c*a.half[2]);
}

test('full original forklift and held pallet clear stocked rack, receiving cases, cradles and staff through both returns',async()=>{
 const [fork,rack]=await Promise.all([model('forklift'),model('rack')]);
 const forkParts=fork.map(p=>{if(/^Fork_(blade|upright)/.test(p.name))p.bounds.translate(new THREE.Vector3(p.bounds.getCenter(new THREE.Vector3()).x<0?SUPPLY_FORK_INSET:-SUPPLY_FORK_INSET,0,0));return{name:p.name,shape:shape(p.bounds),lift:/^(Carriage|Fork_blade|Fork_upright)/.test(p.name)};});
 const originalPallet=new THREE.Box3();
 rack.filter(p=>/^Pallet_/.test(p.name)&&p.bounds.getCenter(new THREE.Vector3()).x<0&&p.bounds.getCenter(new THREE.Vector3()).y<.5).forEach(p=>originalPallet.union(p.bounds));
 originalPallet.translate(new THREE.Vector3(.68,-.22,0));originalPallet.min.multiplyScalar(.9);originalPallet.max.multiplyScalar(.9);
 const palletParts=rack.filter(p=>/^Pallet_/.test(p.name)&&p.bounds.getCenter(new THREE.Vector3()).x<0&&p.bounds.getCenter(new THREE.Vector3()).y<.5).map(p=>{const b=p.bounds.clone().translate(new THREE.Vector3(.68,-.22,0));b.min.multiplyScalar(.9);b.max.multiplyScalar(.9);return shape(b);});
 const pallet=shape(originalPallet),carton=local([-.15,0,-.20],[.15,.265,.20]),person=local([-.20,.055,-.20],[.20,1.72,.20]);
 const fixed=rack.filter(p=>!/^Post_web_between/.test(p.name)&&(!/^Pallet_/.test(p.name)||p.bounds.getCenter(new THREE.Vector3()).y<.5)).map(p=>({name:'rack/'+p.name,box:world(shape(p.bounds),[10.7,.095,-6.4])}));
 // Fully stocked lower shelves are real obstacles, not empty rack illustrations.
 for(const side of[-1,1])for(const x of[-1,1])for(const z of[-1,1])for(let layer=0;layer<2;layer++)fixed.push({name:'lower stock',box:world(carton,[10.7+side*.68+x*.16,.4475+layer*.265,-6.4+z*.21])});
 fixed.push({name:'receiving conveyor',box:world(local([9.74,.095,-.915],[11.5,1.014,-.385]),[0,0,0])},{name:'scanner housing',box:world(local([10.75,1.02,-.915],[11.45,2.32,-.385]),[0,0,0])});
 
 let minimum=Infinity,samples=0;
 for(let n=0;n<=SUPPLY_OPERATION_END*50;n++){
  const state=supplyChainAt(n/50),f=state.forklift,j=state.jack;
  const people=[state.driver,state.loader,state.receiver,state.porter,{position:[j.position[0]-Math.sin(j.yaw)*1.13,j.position[1],j.position[2]-Math.cos(j.yaw)*1.13]}];
  const cradles=[[7.1,-2.65],[8.7,-1.25],[8.5,-6.4]].flatMap(([x,z],station)=>{const h=supplyCradleHeight(state.t,station);return h<.001?[]:[-1,1].map(side=>({name:'support cradle',box:world(local([-.025,0,-.06],[.025,h,.06]),[x+side*.46,.095,z])}));});
  const obstacles=[...fixed,...cradles,...state.pallets.filter(p=>p.host!=='forklift').flatMap(p=>palletParts.map(part=>({name:'pallet '+p.id,box:world(part,p.position,p.yaw)}))),...state.cases.filter(c=>!c.host.startsWith('pallet-')||state.pallets[+c.host.at(-1)]?.host!=='forklift').map(c=>({name:'case '+c.id,box:world(carton,c.position,c.yaw)})),...people.filter(p=>(p.seated||0)<.5).map(p=>({name:'staff',box:world(person,p.position)}))];
  const moving=forkParts.map(p=>({name:p.name,box:world(p.shape,f.position,f.yaw,p.lift?f.lift:0)}));
  for(const p of state.pallets.filter(p=>p.host==='forklift')){moving.push({name:'held pallet',box:world(pallet,p.position,p.yaw)});for(const c of state.cases.filter(c=>c.host==='pallet-'+p.id))moving.push({name:'held case',box:world(carton,c.position,c.yaw)});}
  for(const a of moving)for(const b of obstacles){const d=gap(a.box,b.box);assert.ok(d>=-1e-6,`${a.name} penetrates ${b.name} at ${state.t}s (${d}m)`);if(d>.003)minimum=Math.min(minimum,d);}
  samples++;
 }
 assert.equal(samples,13801);assert.ok(minimum>0);
});

test('forks rise outside the rack, enter square, then withdraw fully before lowering or steering',()=>{
 for(const start of[102,232]){
  for(let n=0;n<=4400;n++){
   const t=start+n/100,s=supplyChainAt(t),f=s.forklift;
   if(t>=start+20&&t<start+26)assert.equal(f.position[2],-3.3,'raise only in the clear pre-insertion bay');
   if(t>=start+26&&t<start+34)assert.ok(Math.abs(f.yaw-Math.PI)<1e-10,'no turning with forks inside rack');
   if(t>=start+30&&t<start+34)assert.equal(f.lift,1.47525,'withdraw high, do not lower through stocked shelves');
   if(t>=start+34&&t<start+36){assert.equal(f.position[2],-3.3);assert.ok(f.position[2]-2.39>-5.85+.15,'entire original fork length clears rack before lowering');}
  }
 }
});
