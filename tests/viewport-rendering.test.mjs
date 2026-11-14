import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {archiveSafeFrame,fitArchiveBounds,ARCHIVE_OVERVIEW_BOUNDS,ARCHIVE_RECEIVING_BOUNDS} from '../src/ArchiveViewport.js';
import {getRenderQualityProfile,getMinimumAutoRenderScale,sanitizeStoredQuality} from '../src/RenderQualityProfile.js';

const viewports=[[320,568],[390,844],[430,932],[568,320],[844,390],[768,1024],[1024,768],[1512,982],[2560,1440],[3840,2160]];

test('overview and receiving geometry fit the unoccluded viewport across portrait, landscape and desktop',()=>{
 for(const [width,height] of viewports)for(const safe of [{},{safeTop:30,safeBottom:34}]){
  const frame=archiveSafeFrame(width,height,safe),portrait=width/height<1.1;
  for(const angle of [.54,.63,.72])for(const receiving of [false,true]){
   const bounds=receiving?ARCHIVE_RECEIVING_BOUNDS:ARCHIVE_OVERVIEW_BOUNDS;
   const target=receiving?[10.2,1.75,-2.95]:[portrait?3.1:2.45,1.1,portrait?1:1.75];
   const direction=receiving?[3.6,3.8,5.8]:[Math.sin(angle)*22,17.8,Math.cos(angle)*22],fov=receiving?32:18;
   const fit=fitArchiveBounds({bounds,target,direction,width,height,fov,frame});
   const camera=new THREE.PerspectiveCamera(fov,width/height,.01,1000);
   camera.position.fromArray(fit.position);camera.lookAt(...target);
   camera.setViewOffset(width,height,fit.offsetX,fit.offsetY,width,height);camera.updateMatrixWorld();
   for(const x of [bounds.min[0],bounds.max[0]])for(const y of [bounds.min[1],bounds.max[1]])for(const z of [bounds.min[2],bounds.max[2]]){
    const point=new THREE.Vector3(x,y,z).project(camera),px=(point.x+1)/2*width,py=(1-point.y)/2*height;
    assert.ok(px>=frame.left-1e-6&&px<=frame.right+1e-6&&py>=frame.top-1e-6&&py<=frame.bottom+1e-6,
     `${width}×${height} ${receiving?'receiving':'overview'} cropped at ${px.toFixed(1)}, ${py.toFixed(1)}`);
    assert.ok(point.z>=-1&&point.z<=1,'bounds must lie between clipping planes');
   }
  }
 }
});

test('automatic phone buffers retain useful pixel density even at their adaptation floor',()=>{
 for(const [width,height] of [[320,568],[390,844],[430,932]])for(const devicePixelRatio of [2,3]){
  const profile=getRenderQualityProfile({width,height,devicePixelRatio,quality:'auto'});
  assert.equal(profile.dpr,2,'phones should start at 2 physical pixels per CSS pixel');
  assert.ok(profile.dpr*getMinimumAutoRenderScale(profile)>=1.6-1e-6,'adaptation must not blur below the readability floor');
 }
});

test('all buffer dimensions remain within pixel and hardware limits; manual choices remain stable',()=>{
 for(const [width,height] of viewports)for(const quality of ['auto','high','cinema'])for(const devicePixelRatio of [1,2,3,4]){
  const profile=getRenderQualityProfile({quality,width,height,devicePixelRatio,maxDimension:4096});
  assert.ok(profile.renderWidth<=4096&&profile.renderHeight<=4096);
  assert.ok(profile.pixelCount<=profile.maxPixels);
  assert.ok(profile.dpr>0&&Number.isFinite(profile.dpr));
  if(quality!=='auto'){assert.equal(profile.manual,true);assert.equal(getMinimumAutoRenderScale(profile),1);}
 }
 assert.equal(sanitizeStoredQuality('"high"'),'high');
 assert.equal(sanitizeStoredQuality('broken'),'auto');
});
