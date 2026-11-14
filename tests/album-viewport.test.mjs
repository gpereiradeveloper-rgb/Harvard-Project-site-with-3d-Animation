import test from 'node:test';
import assert from 'node:assert/strict';
import {fitAlbumViewport} from '../src/AlbumViewport.js';
import {PerspectiveCamera,Vector3,Euler} from 'three';

test('the full folio, hinge sweep and raised books stay inside usable device frames',()=>{
 const devices=[[320,568],[360,640],[390,844],[430,932],[568,320],[844,390],[768,1024],[1024,768],[1280,720],[1512,982],[2560,1080],[3440,1440]];
 for(const [width,height]of devices)for(const selected of [false,true])for(let step=0;step<=100;step++){
  const fit=fitAlbumViewport({width,height,opening:step/100,selected,safeTop:width<500?24:0,safeBottom:width<500?34:0});
  assert.ok(fit.scale>0&&Number.isFinite(fit.scale),`${width}×${height} scale`);
  const camera=new PerspectiveCamera(36,width/height,.1,65);camera.position.set(...fit.eye);camera.lookAt(0,0,0);camera.updateMatrixWorld();
  const opening=step/100,depth=selected&&opening>.7?2.8:.56,overhang=selected&&opening>.7?.95:.2;
  // Project the authored hinge/body envelope independently with Three.js,
  // rather than trusting the fitter's own screen-coordinate calculation.
  for(const [xmin,xmax,zmin,zmax,hinge]of [[-overhang,5.55+overhang,-.4,depth,false],[-overhang,5.55+overhang,-depth,.24,true]]){
   for(const x of [xmin,xmax])for(const y of [-3.525,3.525])for(const z of [zmin,zmax]){
    const p=new Vector3(x,y,z);
    if(hinge){p.applyAxisAngle(new Vector3(0,1,0),-Math.PI*opening);p.z+=.995-opening*1.015;}
    if(fit.portrait)p.applyAxisAngle(new Vector3(0,0,1),Math.PI/2);
    p.multiplyScalar(fit.scale).add(new Vector3(...fit.position)).project(camera);
    assert.ok(p.z>-1&&p.z<1,'geometry stays inside camera depth');
    assert.ok(p.x>=fit.limits.left-1e-8&&p.x<=fit.limits.right+1e-8,`${width}×${height} horizontal clipping at ${step}`);
    assert.ok(p.y>=fit.limits.bottom-1e-8&&p.y<=fit.limits.top+1e-8,`${width}×${height} vertical clipping at ${step}`);
   }
  }
  if(selected&&opening>.92){
   for(const side of ['left','right'])for(let index=0;index<3;index++)for(const phase of [0,.4,.8,1]){
    const x=fit.portrait?0:(index-1)*1.64,y=fit.portrait?(1-index)*1.87:-.36;
    const rotation=new Euler(-phase*.12,-phase*.16,(fit.portrait?-Math.PI/2:0)+(index-1)*.028+phase*.025);
    for(const cx of [0,1.3])for(const cy of [-1.135,1.135])for(const cz of [-.039,.039]){
     const p=new Vector3(cx,cy,cz).applyAxisAngle(new Vector3(0,1,0),-phase*2.55).add(new Vector3(-.65,0,.143));
     p.applyEuler(rotation).add(new Vector3(x,y,.21+phase*1.16));
     if(side==='left'){
      p.applyAxisAngle(new Vector3(0,1,0),Math.PI).add(new Vector3(2.775,0,-.087));
      p.applyAxisAngle(new Vector3(0,1,0),-Math.PI*opening).add(new Vector3(0,0,.995-opening*1.015));
     }else p.add(new Vector3(2.775,0,.08));
     if(fit.portrait)p.applyAxisAngle(new Vector3(0,0,1),Math.PI/2);
     p.multiplyScalar(fit.scale).add(new Vector3(...fit.position)).project(camera);
     assert.ok(p.x>=fit.limits.left&&p.x<=fit.limits.right,`${width}×${height} selected cover horizontal clipping`);
     assert.ok(p.y>=fit.limits.bottom&&p.y<=fit.limits.top,`${width}×${height} selected cover vertical clipping`);
    }
   }
  }
 }
});

test('invalid dimensions and out-of-range progress keep a finite framing result',()=>{
 for(const value of [-1,0,NaN,Infinity]){
  const fit=fitAlbumViewport({width:value,height:value,opening:value});
  assert.ok(Number.isFinite(fit.scale));
  assert.ok(fit.position.every(Number.isFinite));
 }
});
