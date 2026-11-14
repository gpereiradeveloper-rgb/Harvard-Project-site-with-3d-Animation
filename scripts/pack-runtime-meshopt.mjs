/** Lossless runtime delivery, preserving every accessor byte and image payload.
 * Uses the installed meshoptimizer encoder and the exact decoder used by Drei.
 * No quantization, topology reorder, texture resize or animation resampling.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {MeshoptEncoder} from 'meshoptimizer/encoder';
import {MeshoptDecoder as createThreeDecoder} from 'three-stdlib';
const ROOT=path.resolve('public/assets');
const decoder=createThreeDecoder();
await Promise.all([MeshoptEncoder.ready,decoder.ready]);
const files=[
 'ready-models/sam-locomotion-runtime-webp.glb',
 'ready-models/sam-locomotion-runtime-mobile-webp.glb',
 'ready-models/harper-walk-runtime-webp.glb',
 'ready-models/harper-walk-runtime-mobile-webp.glb',
 'study-devices/macbook-pro-13-runtime-webp.glb',
 'study-devices/ipad-mini-6-runtime-webp.glb',
 'study-devices/jansport-backpack-runtime-webp.glb',
 'ready-models/potted-plant/potted_plant_01_web.gltf',
 'ready-models/encyclopedias/book_encyclopedia_web.gltf',
];
const COMPONENT={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4};
const ELEMENT={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16};
const sha=b=>createHash('sha256').update(b).digest('hex');
const align=n=>(n+3)&~3;
function parse(bytes){
 assert.equal(bytes.readUInt32LE(0),0x46546c67);assert.equal(bytes.readUInt32LE(4),2);
 const jsonLength=bytes.readUInt32LE(12),json=JSON.parse(bytes.subarray(20,20+jsonLength));
 const binaryOffset=20+jsonLength+8;
 assert.equal(bytes.readUInt32LE(binaryOffset-4),0x004e4942);
 return {json,binary:bytes.subarray(binaryOffset)};
}
function serialize(json,binary){
 const raw=Buffer.from(JSON.stringify(json)),j=Buffer.alloc(align(raw.length),0x20);raw.copy(j);
 const bin=Buffer.alloc(align(binary.length));binary.copy(bin);
 const out=Buffer.alloc(12+8+j.length+8+bin.length);
 out.writeUInt32LE(0x46546c67,0);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);
 out.writeUInt32LE(j.length,12);out.writeUInt32LE(0x4e4f534a,16);j.copy(out,20);
 out.writeUInt32LE(bin.length,20+j.length);out.writeUInt32LE(0x004e4942,24+j.length);bin.copy(out,28+j.length);
 return out;
}
const report=[];
for(const file of files){
 const input=await fs.readFile(path.join(ROOT,file));
 let original,sourceBuffers,sourceBytes=input.length;
 if(file.endsWith('.gltf')){
  original=JSON.parse(input);
  sourceBuffers=await Promise.all(original.buffers.map(b=>fs.readFile(path.resolve(ROOT,path.dirname(file),b.uri))));
  sourceBytes+=sourceBuffers.reduce((sum,b)=>sum+b.length,0);
 }else{const parsed=parse(input);original=parsed.json;sourceBuffers=[parsed.binary];}
 const json=structuredClone(original);
 const images=new Set((json.images||[]).map(x=>x.bufferView));
 const indices=new Set((json.meshes||[]).flatMap(mesh=>mesh.primitives.map(p=>p.indices)).filter(Number.isInteger));
 const segments=[];let physicalOffset=0,virtualOffset=0,compressedViews=0,decodedBytes=0,decodeMilliseconds=0;
 const append=bytes=>{const at=physicalOffset;const padded=Buffer.alloc(align(bytes.length));Buffer.from(bytes).copy(padded);segments.push(padded);physicalOffset+=padded.length;return at;};
 for(let i=0;i<json.bufferViews.length;i++){
  const view=json.bufferViews[i],old=original.bufferViews[i],bytes=sourceBuffers[old.buffer].subarray(old.byteOffset||0,(old.byteOffset||0)+old.byteLength);
  let compressed;
  if(!images.has(i)&&bytes.length>=384){
   const accessors=json.accessors.map((a,n)=>({a,n})).filter(({a})=>a.bufferView===i);
   let stride=view.byteStride||0,mode='ATTRIBUTES';
   if(accessors.length===1&&indices.has(accessors[0].n)){
    const a=accessors[0].a;stride=COMPONENT[a.componentType];mode='INDICES';
   }else if(!stride&&accessors.length===1){const a=accessors[0].a;stride=COMPONENT[a.componentType]*ELEMENT[a.type];}
   if(mode==='ATTRIBUTES'&&(!stride||stride%4||stride>256))stride=4;
   if(stride&&bytes.length%stride===0&&((mode==='INDICES'&&(stride===2||stride===4))||mode==='ATTRIBUTES')){
    const count=bytes.length/stride,encoded=MeshoptEncoder.encodeGltfBuffer(bytes,count,stride,mode,0);
    if(bytes.length-encoded.length>=200){
     const decoded=new Uint8Array(bytes.length),start=performance.now();
     decoder.decodeGltfBuffer(decoded,count,stride,encoded,mode,'NONE');decodeMilliseconds+=performance.now()-start;
     assert.deepEqual(Buffer.from(decoded),bytes,`${file} view ${i} differs after decode`);
     compressed={encoded,count,stride,mode};
    }
   }
  }
  if(compressed){
   const {encoded,count,stride,mode}=compressed,at=append(encoded);
   view.buffer=1;view.byteOffset=virtualOffset;
   view.extensions={...view.extensions,EXT_meshopt_compression:{buffer:0,byteOffset:at,byteLength:encoded.length,byteStride:stride,count,mode,filter:'NONE'}};
   virtualOffset+=align(bytes.length);compressedViews++;decodedBytes+=bytes.length;
  }else{view.buffer=0;view.byteOffset=append(bytes);}
 }
 json.buffers=[{byteLength:physicalOffset},{byteLength:virtualOffset,extensions:{EXT_meshopt_compression:{fallback:true}}}];
 json.extensionsUsed=[...new Set([...(json.extensionsUsed||[]),'EXT_meshopt_compression'])];
 json.extensionsRequired=[...new Set([...(json.extensionsRequired||[]),'EXT_meshopt_compression'])];
 const output=serialize(json,Buffer.concat(segments)),outputFile=file.endsWith('.gltf')?file.replace(/_web\.gltf$/,'-runtime-meshopt.glb'):file.replace(/\.glb$/,'-meshopt.glb');
 assert.ok(output.length<sourceBytes,`${file} did not shrink`);
 // Decode every output view using the actual browser decoder, not only each
 // candidate before packing. This also catches offset/padding/repacking errors.
 const packed=parse(output);
 for(let i=0;i<original.bufferViews.length;i++){
  const old=original.bufferViews[i],view=packed.json.bufferViews[i],ext=view.extensions?.EXT_meshopt_compression;
  const decoded=ext?new Uint8Array(view.byteLength):packed.binary.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength);
  if(ext)decoder.decodeGltfBuffer(decoded,ext.count,ext.byteStride,packed.binary.subarray(ext.byteOffset,ext.byteOffset+ext.byteLength),ext.mode,ext.filter);
  assert.deepEqual(Buffer.from(decoded),sourceBuffers[old.buffer].subarray(old.byteOffset||0,(old.byteOffset||0)+old.byteLength),`${outputFile} repacked view ${i}`);
 }
 for(const key of Object.keys(original).filter(k=>!['buffers','bufferViews','extensionsUsed','extensionsRequired'].includes(k)))assert.deepEqual(packed.json[key],original[key],`${file} changed ${key}`);
 await fs.writeFile(path.join(ROOT,outputFile),output);
 report.push({source:file,output:outputFile,sourceBytes,runtimeBytes:output.length,savedBytes:sourceBytes-output.length,savedFraction:1-output.length/sourceBytes,externalTexturesUnchanged:file.endsWith('.gltf'),compressedViews,decodedBytes,decoder:'Drei three-stdlib MeshoptDecoder, codec v0, NONE filter',decodeMilliseconds,allBufferViewBytesIdentical:true,allAccessorRigAnimationAndImageMetadataIdentical:true,sourceSha256:sha(Buffer.concat([input,...(file.endsWith('.gltf')?sourceBuffers:[])])),runtimeSha256:sha(output)});
 console.log(`${file}: ${(sourceBytes/1e6).toFixed(2)} → ${(output.length/1e6).toFixed(2)} MB; ${compressedViews} views; decoded bytes identical`);
}
await fs.writeFile(path.join(ROOT,'meshopt-delivery-report.json'),JSON.stringify(report,null,2)+'\n');
