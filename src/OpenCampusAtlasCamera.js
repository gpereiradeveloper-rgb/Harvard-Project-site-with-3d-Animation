const clamp=n=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
const smooth=n=>n*n*(3-2*n);
const mix=(a,b,t)=>a+(b-a)*t;

// Geographic look-at points, not an indoor route or a surveyed entrance.
export const OPEN_ATLAS_STOPS=Object.freeze([
 {at:0,center:[-71.1172,42.3743],zoom:15.35,pitch:42,bearing:8},
 {at:.28,center:[-71.1169,42.3746],zoom:16.05,pitch:48,bearing:5},
 {at:.56,center:[-71.1162,42.3746],zoom:16.85,pitch:54,bearing:2},
 {at:.80,center:[-71.1161,42.37475],zoom:17.50,pitch:58,bearing:0},
 {at:1,center:[-71.11603,42.37487],zoom:18.05,pitch:60,bearing:0},
]);

export const OPEN_ATLAS_LANDMARKS=Object.freeze([
 {id:'yard',name:'Harvard Yard',coordinates:[-71.1175,42.3745]},
 {id:'memorial',name:'Memorial Hall',coordinates:[-71.1150,42.3761]},
 {id:'university',name:'University Hall',coordinates:[-71.1171,42.3745]},
 {id:'church',name:'Memorial Church',coordinates:[-71.11603,42.37491]},
]);

export function openAtlasCameraAt(progress,mobile=false){
 const p=clamp(progress);
 const i=Math.max(0,OPEN_ATLAS_STOPS.findIndex((point,index)=>index<OPEN_ATLAS_STOPS.length-1&&p>=point.at&&p<=OPEN_ATLAS_STOPS[index+1].at));
 const a=OPEN_ATLAS_STOPS[i],b=OPEN_ATLAS_STOPS[i+1],t=smooth(clamp((p-a.at)/(b.at-a.at)));
 return{center:[mix(a.center[0],b.center[0],t),mix(a.center[1],b.center[1],t)],zoom:mix(a.zoom,b.zoom,t)-(mobile?.35:0),pitch:Math.min(mobile?52:60,mix(a.pitch,b.pitch,t)),bearing:mix(a.bearing,b.bearing,t)};
}
