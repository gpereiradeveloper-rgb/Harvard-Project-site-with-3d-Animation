// Probe once before requesting a model; unsupported decoders never download the
// WebP GLB and fall back to the same rig with PNG/JPEG textures instead.
const WEBP_PROBE='data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAEAfQ//73v4CBiOh/AAA=';
const MESHOPT_MODELS=new Set(['sam-locomotion-runtime','harper-walk-runtime','macbook-pro-13-runtime','ipad-mini-6-runtime','jansport-backpack-runtime']);
const CHARACTER_MODELS=['/assets/ready-models/sam-locomotion-runtime.glb','/assets/ready-models/harper-walk-runtime.glb'];
const DEVICE_MODELS=['/assets/study-devices/macbook-pro-13-runtime.glb','/assets/study-devices/ipad-mini-6-runtime.glb','/assets/study-devices/jansport-backpack-runtime.glb'];
const STATIC_MESHOPT_MODELS=new Map([
 ['potted_plant_01_web.gltf','potted_plant_01-runtime-meshopt.glb'],
 ['book_encyclopedia_web.gltf','book_encyclopedia-runtime-meshopt.glb'],
]);
const STATIC_MODELS=['/assets/ready-models/potted-plant/potted_plant_01_web.gltf','/assets/ready-models/encyclopedias/book_encyclopedia_web.gltf'];
let delivery;
function beginDelivery(){
 if(typeof window==='undefined'||typeof Image==='undefined')return{ready:true,webp:false,mobile:false,meshopt:false};
 if(!delivery){
  let meshopt=false;
  try{meshopt=typeof WebAssembly==='object'&&WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0]));}catch{/* Keep the original uncompressed path when WASM is unavailable. */}
  delivery={ready:false,webp:false,meshopt,mobile:window.innerWidth<760||(window.innerWidth<1100&&window.matchMedia?.('(pointer: coarse)').matches)};
  delivery.promise=new Promise(resolve=>{
   const image=new Image();let timeout;
   const finish=supported=>{if(delivery.ready)return;clearTimeout(timeout);delivery.webp=supported;delivery.ready=true;document.documentElement.dataset.modelDelivery=(delivery.mobile?'mobile-1k':'desktop-2k')+(supported?'-webp':'-png')+(supported&&delivery.meshopt?'-meshopt':'');resolve();};
   image.onload=()=>finish(image.width===1);image.onerror=()=>finish(false);timeout=setTimeout(()=>finish(false),1500);image.src=WEBP_PROBE;
  });
 }
 return delivery;
}
function readDelivery(){
 const profile=beginDelivery();
 if(!profile.ready)throw profile.promise;
 return profile;
}

/** Resolve decoder capabilities during idle time, without suspending React. */
export async function prepareRuntimeDelivery(){
 const profile=beginDelivery();
 if(!profile.ready)await profile.promise;
 return{webp:profile.webp,mobile:profile.mobile,meshopt:profile.meshopt};
}

/** Start the same parsed GLTF cache used by the scene, after its next chapter
 * approaches. Import only the GLTF helper so warming cannot pull all of Drei
 * into the opening bundle. Device warming is optional to keep the queue small.
 * `preload` schedules requests; this promise is not a guarantee of model readiness.
 */
export async function warmArchiveAssets({includeDevices=false,includeProps=false}={}){
 if(typeof window==='undefined')return{urls:[]};
 await prepareRuntimeDelivery();
 const {useGLTF}=await import('@react-three/drei/core/Gltf.js');
 const urls=CHARACTER_MODELS.map(url=>runtimeAssetUrl(url,{mobileVariant:true}));
 if(includeDevices)urls.push(...DEVICE_MODELS.map(url=>runtimeAssetUrl(url)));
 if(includeProps)urls.push(...STATIC_MODELS.map(runtimeStaticAssetUrl));
 urls.forEach(url=>useGLTF.preload(url,false,true));
 return{urls};
}

export function runtimeAssetUrl(fallbackUrl,{mobileVariant=false}={}){
 const profile=readDelivery(),stem=fallbackUrl.split('/').pop().replace(/\.glb$/,'');
 const compressed=profile.webp&&profile.meshopt&&MESHOPT_MODELS.has(stem);
 const suffix=(mobileVariant&&profile.mobile?'-mobile':'')+(profile.webp?'-webp':'')+(compressed?'-meshopt':'');
 return fallbackUrl.replace(/\.glb$/,suffix+'.glb');
}

/** Static photographed props keep their original external 2K JPEG maps. */
export function runtimeStaticAssetUrl(fallbackUrl){
 const filename=fallbackUrl.split('/').pop(),packed=STATIC_MESHOPT_MODELS.get(filename);
 if(!packed)return fallbackUrl;
 return readDelivery().meshopt?fallbackUrl.slice(0,-filename.length)+packed:fallbackUrl;
}
