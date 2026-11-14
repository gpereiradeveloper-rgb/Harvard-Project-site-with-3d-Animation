const positive=(n,fallback)=>Number.isFinite(n)&&n>0?n:fallback;

/** The camera fits into the part of the viewport left clear by journey UI. */
export function archiveSafeFrame(width,height,{safeTop=0,safeBottom=0}={}){
 const w=positive(width,1),h=positive(height,1),portrait=w/h<1.1,compact=w<760;
 let top=portrait&&compact?Math.min(188,h*.28):Math.min(h<600?72:112,h*.22);
 let bottom=portrait&&compact?Math.min(140,h*.22):Math.min(h<600?84:104,h*.22);
 top+=Math.max(0,Number(safeTop)||0);bottom+=Math.max(0,Number(safeBottom)||0);
 // Short split-screen windows still reserve at least forty percent for 3D.
 const scale=Math.min(1,h*.60/Math.max(1,top+bottom));top*=scale;bottom*=scale;
 const horizontal=Math.min(compact?12:24,w*.04);
 return {left:horizontal,right:w-horizontal,top,bottom:h-bottom,width:w-horizontal*2,height:h-top-bottom,
  centerX:w/2,centerY:(top+h-bottom)/2};
}

/** Perspective fit including depth, rather than an orthographic approximation. */
export function fitArchiveBounds({bounds,target,direction,width,height,fov=18,frame=archiveSafeFrame(width,height),padding=1.035}){
 const w=positive(width,1),h=positive(height,1),length=Math.hypot(...direction)||1;
 const d=direction.map(n=>n/length),rLength=Math.hypot(d[2],d[0])||1,right=[d[2]/rLength,0,-d[0]/rLength];
 const up=[d[1]*right[2]-d[2]*right[1],d[2]*right[0]-d[0]*right[2],d[0]*right[1]-d[1]*right[0]];
 const tangent=Math.tan(fov*Math.PI/360),horizontal=tangent*w/h*frame.width/w,vertical=tangent*frame.height/h;
 const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
 let distance=0;
 for(const x of [bounds.min[0],bounds.max[0]])for(const y of [bounds.min[1],bounds.max[1]])for(const z of [bounds.min[2],bounds.max[2]]){
  const p=[x-target[0],y-target[1],z-target[2]],depth=dot(p,d);
  distance=Math.max(distance,depth+Math.abs(dot(p,right))/Math.max(horizontal,1e-8),depth+Math.abs(dot(p,up))/Math.max(vertical,1e-8));
 }
 distance=Math.max(.1,distance*padding);
 return {distance,position:target.map((n,i)=>n+d[i]*distance),offsetX:w/2-frame.centerX,offsetY:h/2-frame.centerY};
}

export const ARCHIVE_OVERVIEW_BOUNDS=Object.freeze({min:Object.freeze([-6.9,-.9,-8.1]),max:Object.freeze([13.9,5.2,9.45])});
export const ARCHIVE_RECEIVING_BOUNDS=Object.freeze({min:Object.freeze([6.6,-.35,-7.9]),max:Object.freeze([13.8,4.1,2.0])});
