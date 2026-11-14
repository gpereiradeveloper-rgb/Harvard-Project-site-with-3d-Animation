import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Capability selection must resolve outside React, preserve working fallback
// URLs, and only select packed files that actually exist in the deployment.
async function withBrowser({width=390,coarse=false,webp=true,wasm=true}={},run){
 const keys=['window','Image','document','WebAssembly'];
 const original=new Map(keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 let probes=0;
 globalThis.window={innerWidth:width,matchMedia:()=>({matches:coarse})};
 globalThis.document={documentElement:{dataset:{}}};
 globalThis.Image=class{constructor(){probes++;}set src(_){this.width=webp?1:0;queueMicrotask(()=>webp?this.onload?.():this.onerror?.());}};
 if(!wasm)globalThis.WebAssembly=undefined;
 try{
  const module=await import(`../src/RuntimeAssets.js?delivery-test=${Math.random()}`);
  await run(module,()=>probes);
 }finally{
  for(const key of keys){const d=original.get(key);if(d)Object.defineProperty(globalThis,key,d);else delete globalThis[key];}
 }
}
const sam='/assets/ready-models/sam-locomotion-runtime.glb';
const plant='/assets/ready-models/potted-plant/potted_plant_01_web.gltf';

test('modern mobile warming resolves once and selects existing lossless runtime files',async()=>{
 await withBrowser({},async(m,probeCount)=>{
  const prepared=m.prepareRuntimeDelivery();
  assert.ok(prepared instanceof Promise);
  const [a,b]=await Promise.all([prepared,m.prepareRuntimeDelivery()]);
  assert.deepEqual(a,b);assert.equal(probeCount(),1);
  assert.equal(a.mobile,true);assert.equal(a.webp,true);assert.equal(a.meshopt,true);
  const model=m.runtimeAssetUrl(sam,{mobileVariant:true});
  assert.equal(model,'/assets/ready-models/sam-locomotion-runtime-mobile-webp-meshopt.glb');
  assert.ok(fs.existsSync(new URL('../public'+model,import.meta.url)));
  const packed=m.runtimeStaticAssetUrl(plant);
  assert.ok(fs.existsSync(new URL('../public'+packed,import.meta.url)));
  assert.equal(m.runtimeStaticAssetUrl('/assets/warehouse-models/rack.glb'),'/assets/warehouse-models/rack.glb');
 });
});

test('desktop and coarse tablet profiles keep a stable appropriate asset choice',async()=>{
 await withBrowser({width:1440},async m=>{
  await m.prepareRuntimeDelivery();assert.equal(m.runtimeAssetUrl(sam,{mobileVariant:true}),'/assets/ready-models/sam-locomotion-runtime-webp-meshopt.glb');
 });
 await withBrowser({width:1024,coarse:true},async m=>{
  await m.prepareRuntimeDelivery();const first=m.runtimeAssetUrl(sam,{mobileVariant:true});window.innerWidth=1366;
  assert.equal(m.runtimeAssetUrl(sam,{mobileVariant:true}),first,'orientation changes must not trigger a second model download');
  assert.ok(first.includes('-mobile-'));
 });
});

test('unsupported decoders keep the prior supported paths without missing derivatives',async()=>{
 await withBrowser({webp:false},async m=>{
  await m.prepareRuntimeDelivery();const url=m.runtimeAssetUrl(sam,{mobileVariant:true});
  assert.equal(url,'/assets/ready-models/sam-locomotion-runtime-mobile.glb');assert.ok(fs.existsSync(new URL('../public'+url,import.meta.url)));
 });
 await withBrowser({wasm:false},async m=>{
  await m.prepareRuntimeDelivery();assert.equal(m.runtimeAssetUrl(sam,{mobileVariant:true}),'/assets/ready-models/sam-locomotion-runtime-mobile-webp.glb');
  assert.equal(m.runtimeStaticAssetUrl(plant),plant);
 });
});
