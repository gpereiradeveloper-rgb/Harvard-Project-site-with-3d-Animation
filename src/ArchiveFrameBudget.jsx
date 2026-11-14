import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';

/** Auto mode adapts its drawing buffer; explicit High/Cinema choices stay fixed. */
export default function ArchiveFrameBudget({quality,active,paused,motion,onScale}){
 const {gl}=useThree(),sample=useRef({seconds:0,frames:0,warm:0,shadow:0,progress:-1});
 useEffect(()=>{
  const previous=gl.shadowMap.autoUpdate;
  gl.shadowMap.autoUpdate=quality!=='auto';gl.shadowMap.needsUpdate=true;
  sample.current={seconds:0,frames:0,warm:0,shadow:0,progress:-1};
  return()=>{gl.shadowMap.autoUpdate=previous;gl.shadowMap.needsUpdate=true;};
 },[gl,quality]);
 useFrame((_,dt)=>{
  if(quality!=='auto'||!active||document.hidden)return;
  const s=sample.current,delta=Math.min(Math.max(dt,0),.25),p=motion.progress;
  s.shadow+=delta;
  if(s.progress!==p||(!paused&&s.shadow>=1/30)){
   gl.shadowMap.needsUpdate=true;s.shadow=0;s.progress=p;
  }
  if(paused){s.seconds=0;s.frames=0;return;}
  s.warm+=delta;if(s.warm<3)return;
  s.seconds+=delta;s.frames++;
  if(s.seconds<2.5)return;
  const fps=s.frames/s.seconds;
  onScale(previous=>{
   const next=fps<43?Math.max(.72,previous-.10):fps>57?Math.min(1,previous+.04):previous;
   return Math.round(next*100)/100;
  });
  gl.domElement.dataset.worldAutoFps=fps.toFixed(1);
  s.seconds=0;s.frames=0;
 },-90);
 return null;
}
