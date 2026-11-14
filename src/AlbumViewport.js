const PAGE_WIDTH=5.55,PAGE_HEIGHT=6.65;
const finite=(value,fallback)=>Number.isFinite(value)&&value>0?value:fallback;
const clamp=value=>Math.min(1,Math.max(0,Number.isFinite(value)?value:0));

/** Physical folio bounds fitted into the space left by the catalogue and controls. */
export function albumViewportInsets(width,height,{safeTop=0,safeBottom=0}={}){
 const w=finite(width,1),h=finite(height,1),portrait=w/h<.88,compact=w<=760,short=!portrait&&h<=520;
 const side=Math.min(w*.12,64,Math.max(14,w*.035));
 const top=Math.min(h*.25,(short?12:portrait&&h<680?44:60)+Math.max(0,safeTop));
 const bottom=Math.min(Math.max(0,h-top-60),(short?112:portrait?(compact?216:176):136)+Math.max(0,safeBottom));
 return{top,bottom,left:side,right:side,portrait};
}

export function fitAlbumViewport({width=1,height=1,opening=1,selected=false,safeTop=0,safeBottom=0}={}){
 const w=finite(width,1),h=finite(height,1),o=clamp(opening),insets=albumViewportInsets(w,h,{safeTop,safeBottom});
 const {portrait}=insets,eyeY=portrait?.25:1.35,eyeZ=16.3,distance=Math.hypot(eyeY,eyeZ),cos=eyeZ/distance,sin=eyeY/distance;
 const tangent=Math.tan(36*Math.PI/360),aspect=w/h;
 const ndcCenter=(insets.bottom-insets.top)/h;
 const centerY=ndcCenter*tangent*distance/(cos+ndcCenter*tangent*sin);
 const selectionVisible=selected&&o>.7,maxDepth=selectionVisible?2.8:.56,sideOverhang=selectionVisible?.95:.2,points=[];
 const addBox=(x0,x1,z0,z1,hinge=false)=>{
  for(const x of [x0,x1])for(const y of [-PAGE_HEIGHT/2-.2,PAGE_HEIGHT/2+.2])for(const z of [z0,z1]){
   const angle=-Math.PI*o,c=Math.cos(angle),s=Math.sin(angle);
   let px=hinge?x*c+z*s:x,pz=hinge?-x*s+z*c+.995-o*1.015:z;
   px-=(1-o)*PAGE_WIDTH*.5;
   points.push(portrait?[-y,px,pz]:[px,y,pz]);
  }
 };
 addBox(-sideOverhang,PAGE_WIDTH+sideOverhang,-.4,maxDepth);
 addBox(-sideOverhang,PAGE_WIDTH+sideOverhang,-maxDepth,.24,true);
 const limits={left:-1+2*insets.left/w,right:1-2*insets.right/w,bottom:-1+2*insets.bottom/h,top:1-2*insets.top/h};
 const project=(point,scale)=>{
  const x=point[0]*scale,y=point[1]*scale+centerY,z=point[2]*scale,depth=distance-sin*y-cos*z;
  return{x:x/(depth*tangent*aspect),y:(cos*y-sin*z)/(depth*tangent),depth};
 };
 const fits=scale=>points.every(point=>{const p=project(point,scale);return p.depth>.15&&p.x>=limits.left&&p.x<=limits.right&&p.y>=limits.bottom&&p.y<=limits.top;});
 let low=0,high=4;
 for(let i=0;i<20;i++){const mid=(low+high)/2;if(fits(mid))low=mid;else high=mid;}
 const scale=low*.985,offset=(1-o)*PAGE_WIDTH*.5*scale;
 return{scale,position:portrait?[0,centerY-offset,0]:[-offset,centerY,0],portrait,eye:[0,eyeY,eyeZ],insets,limits,projected:points.map(point=>project(point,scale))};
}
