import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';

/** Auto mode adapts its drawing buffer; explicit High/Cinema choices stay fixed. */
export default function ArchiveFrameBudget({quality,active,paused,motion,onScale,minimumScale=1}){
 const {gl}=useThree(),sample=useRef({seconds:0,frames:0,warm:0,shadow:0,progress:-1});
 useEffect(()=>{
  const previous=gl.shadowMap.autoUpdate;
  gl.shadowMap.autoUpdate=quality==='cinema';gl.shadowMap.needsUpdate=true;
  sample.current={seconds:0,frames:0,warm:0,shadow:0,progress:-1};
  return()=>{gl.shadowMap.autoUpdate=previous;gl.shadowMap.needsUpdate=true;};
 },[gl,quality]);
 useFrame((_,dt)=>{
  if(!active||document.hidden)return;
  const s=sample.current,delta=Math.min(Math.max(dt,0),.25),p=motion.progress;
  s.shadow+=delta;
  // A moving camera does not change light-space shadows. Refresh the shared
  // shadow map at 30 Hz instead of redrawing every mesh on every scroll tick.
  if(quality!=='cinema'&&((paused&&s.progress!==p)||(!paused&&s.shadow>=1/30))){
   gl.shadowMap.needsUpdate=true;s.shadow=0;s.progress=p;
  }
  if(quality!=='auto'||paused){s.seconds=0;s.frames=0;return;}
  s.warm+=delta;if(s.warm<3)return;
  s.seconds+=delta;s.frames++;
  if(s.seconds<2.5)return;
  const fps=s.frames/s.seconds;
  onScale(previous=>{
   const next=fps<43?Math.max(minimumScale,previous-.05):fps>57?Math.min(1,previous+.04):previous;
   return Math.round(next*100)/100;
  });
  gl.domElement.dataset.worldAutoFps=fps.toFixed(1);
  s.seconds=0;s.frames=0;
 },-90);
 return null;
}
