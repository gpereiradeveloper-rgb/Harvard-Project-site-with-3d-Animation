// Probe once before requesting a model; unsupported decoders never download the
// WebP GLB and fall back to the same rig with PNG/JPEG textures instead.
const WEBP_PROBE='data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAEAfQ//73v4CBiOh/AAA=';
let delivery;
function readDelivery(){
 if(typeof window==='undefined'||typeof Image==='undefined')return{webp:false,mobile:false};
 if(!delivery){
  delivery={ready:false,webp:false,mobile:window.innerWidth<760||(window.innerWidth<1100&&window.matchMedia?.('(pointer: coarse)').matches)};
  delivery.promise=new Promise(resolve=>{
   const image=new Image();let timeout;
   const finish=supported=>{if(delivery.ready)return;clearTimeout(timeout);delivery.webp=supported;delivery.ready=true;document.documentElement.dataset.modelDelivery=(delivery.mobile?'mobile-1k':'desktop-2k')+(supported?'-webp':'-png');resolve();};
   image.onload=()=>finish(image.width===1);image.onerror=()=>finish(false);timeout=setTimeout(()=>finish(false),1500);image.src=WEBP_PROBE;
  });
 }
 if(!delivery.ready)throw delivery.promise;
 return delivery;
}

export function runtimeAssetUrl(fallbackUrl,{mobileVariant=false}={}){
 const profile=readDelivery(),suffix=(mobileVariant&&profile.mobile?'-mobile':'')+(profile.webp?'-webp':'');
 return fallbackUrl.replace(/\.glb$/,suffix+'.glb');
}
