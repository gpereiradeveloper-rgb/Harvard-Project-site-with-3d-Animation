import React,{Suspense,useCallback,useEffect,useMemo,useRef,useState} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import LoopingFilm from './LoopingFilm';
import {createQuietScore} from './QuietScore';
import ArchiveEditorial from './ArchiveEditorial';
import {usePersistentRenderQuality,useViewportRenderQuality} from './RenderQuality';
import './styles.css';
import './HarvardJourney.css';
gsap.registerPlugin(ScrollTrigger);
const GoogleCampusAtlas=React.lazy(()=>import('./GoogleCampusAtlas'));
const OpenCampusAtlas=React.lazy(()=>import('./OpenCampusAtlas'));
const HarvardArchiveWorld=React.lazy(()=>import('./HarvardArchiveWorld'));
const HarvardAlbum3D=React.lazy(()=>import('./HarvardAlbum3D'));
const AlbumVolumeReader=React.lazy(()=>import('./AlbumVolumeReader'));
const KEY=import.meta.env.DEV&&new URLSearchParams(location.search).get('map')==='google'?(import.meta.env.VITE_GOOGLE_MAPS_DEMO_KEY||''):'';
const CampusMap=KEY?GoogleCampusAtlas:OpenCampusAtlas;
const clamp=n=>Math.max(0,Math.min(1,n));
const range=(a,b,n)=>clamp((n-a)/(b-a));
const smooth=(a,b,n)=>{const t=range(a,b,n);return t*t*(3-2*t);};
const FILM='https://college.harvard.edu/sites/default/files/2024-04/Webpage%20Landing%20Cut%20%28Campus%29_v2.mp4';
const CHAPTERS=[{id:'cover',at:0,label:'Arrival'},{id:'campus',at:.19,label:'The campus'},{id:'world',at:.58,label:'The atelier'},{id:'album',at:.93,label:'The album'}];
const VOLUMES=[
 {id:'origins',title:'Origins',kicker:'I / 1636',description:'The origins of Harvard and a continuing story of knowledge.',image:'/assets/widener-4k-web.jpg',source:'https://www.harvard.edu/about/history/',sourceName:'Harvard University · History'},
 {id:'library',title:'The library',kicker:'II / PLACES',description:'Widener Library and the light of the Loker Reading Room, in original photographs.',image:'/assets/loker-4k-web.jpg',source:'https://library.harvard.edu/libraries/widener',sourceName:'Harvard Library · Widener'},
 {id:'architecture',title:'Architecture',kicker:'III / FORM & MEMORY',description:'Discover the buildings, their rhythms, materials and stories.',image:'/assets/memorial-church-front-web.jpg',source:'https://memorialchurch.harvard.edu/history-0',sourceName:'Harvard · Memorial Church'},
 {id:'collections',title:'Collections',kicker:'IV / BETWEEN PAGES',description:'Books, collections and paths of research at Harvard Library.',image:'/assets/loker-4k-web.jpg',source:'https://library.harvard.edu/collections/gutenberg-bible',sourceName:'Harvard Library · Gutenberg Bible'},
 {id:'campus',title:'The campus',kicker:'V / CAMBRIDGE',description:'Places and perspectives for discovering Harvard.',image:'/assets/widener-4k-web.jpg',source:'https://www.harvard.edu/visit/maps-directions/',sourceName:'Harvard University · Maps'},
 {id:'research',title:'New ideas',kicker:'VI / DISCOVER',description:'A question, a source, a new possibility.',image:'/assets/loker-4k-web.jpg',source:'https://www.harvard.edu/in-focus/',sourceName:'Harvard University · In Focus'},
];
function Shield(){return <svg viewBox="0 0 50 60" aria-hidden="true" fill="none"><path d="M3 3h44v27c0 14-22 27-22 27S3 44 3 30V3Z" stroke="currentColor" strokeWidth="1.5"/><path d="M10 12h13v12H10zM27 12h13v12H27zM18 31h14v12H18z" stroke="currentColor"/><path d="M16.5 12v12m17-12v12M25 31v12" stroke="currentColor"/><text x="16.5" y="21" textAnchor="middle">VE</text><text x="33.5" y="21" textAnchor="middle">RI</text><text x="25" y="40" textAnchor="middle">TAS</text></svg>;}
function Arrow(){return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.3"/></svg>;}
function Speaker({muted}){return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m11 4-6 5H2v6h3l6 5V4Z" stroke="currentColor" strokeWidth="1.3"/>{muted?<path d="m16 9 6 6m0-6-6 6" stroke="currentColor" strokeWidth="1.3"/>:<path d="M15 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14" stroke="currentColor" strokeWidth="1.3"/>}</svg>;}
class SceneBoundary extends React.Component{state={failed:false};static getDerivedStateFromError(){return{failed:true};}componentDidCatch(){this.props.onError?.();}render(){return this.state.failed?this.props.fallback||null:this.props.children;}}

export default function HarvardJourneyApp(){
 const root=useRef(),track=useRef(),lenis=useRef(),chapterDestination=useRef(null),menuRef=useRef(),settingsRef=useRef(),aboutRef=useRef(),readerRef=useRef(),filmRef=useRef(),videoRef=useRef();
 const mapMotion=useRef({progress:0,pointerX:0,pointerY:0}).current,photoMotion=useRef({progress:0,pointerX:0,pointerY:0}).current,albumMotion=useRef({progress:0,pointerX:0,pointerY:0}).current;
 const score=useMemo(()=>createQuietScore(),[]),[quality,setQuality]=usePersistentRenderQuality('auto'),profile=useViewportRenderQuality(quality);
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion:reduce)').matches),reducedRef=useRef(reduced);
 const [phase,setPhase]=useState('cover'),[mapVisible,setMapVisible]=useState(false),[mapReady,setMapReady]=useState(false),[mapFailed,setMapFailed]=useState(false),[photoReady,setPhotoReady]=useState(false),[posterReady,setPosterReady]=useState(false);
 const [worldMounted,setWorldMounted]=useState(false),[albumMounted,setAlbumMounted]=useState(false),[mapMounted,setMapMounted]=useState(false),[mapGeneration,setMapGeneration]=useState(0);
 const warmed=useRef({world:false,album:false});
 const heroSource=useMemo(()=>innerWidth<760?'/assets/harvard-cinematic-mobile.mp4':'/assets/harvard-cinematic-web.mp4',[]);
 const [paused,setPaused]=useState(false),[sound,setSound]=useState(false),[volume,setVolume]=useState(.32),[notice,setNotice]=useState('');
 const [menu,setMenu]=useState(false),[settings,setSettings]=useState(false),[about,setAbout]=useState(false),[reader,setReader]=useState(null),[film,setFilm]=useState(false);
 const modal=menu||settings||about||Boolean(reader)||film;
 const onMapReady=useCallback(()=>setMapReady(true),[]),onMapError=useCallback(()=>setMapFailed(true),[]),onPhotoReady=useCallback(()=>setPhotoReady(true),[]),openVolume=useCallback(id=>setReader(id),[]);
 // Warm the next chapter while it approaches, then retain its scene and clock.
 // The opening film should not compete with two hidden WebGL scenes and models.
 useEffect(()=>{if(phase==='world'||phase==='passage')setWorldMounted(true);if(phase==='passage'||phase==='album')setAlbumMounted(true);if(phase==='campus')setMapMounted(true);},[phase]);
 useEffect(()=>{if(!posterReady)return;const timer=setTimeout(()=>setMapMounted(true),1200);return()=>clearTimeout(timer);},[posterReady]);
 useEffect(()=>{const timer=setTimeout(()=>setPosterReady(true),2500);return()=>clearTimeout(timer);},[]);
 useEffect(()=>{const m=matchMedia('(prefers-reduced-motion:reduce)'),change=e=>setReduced(e.matches);m.addEventListener('change',change);return()=>m.removeEventListener('change',change);},[]);
 useEffect(()=>{reducedRef.current=reduced;if(lenis.current)lenis.current.options.smoothWheel=!reduced;},[reduced]);
 useEffect(()=>{
  const controller=new Lenis({duration:.78,smoothWheel:!reducedRef.current,syncTouch:false});lenis.current=controller;controller.on('scroll',ScrollTrigger.update);controller.on('virtual-scroll',()=>{chapterDestination.current=null;});
  let target=0,current=0,lastPhase='cover',lastMapVisible=false;
  const sync=self=>{target=self.progress;};
  const trigger=ScrollTrigger.create({trigger:track.current,start:'top top',end:'bottom bottom',onUpdate:sync,onRefresh:sync});sync(trigger);current=target;
  const tick=(time,delta)=>{
   controller.raf(time*1000);const dt=Math.min((delta||16.667)/1000,.08);
   current=reducedRef.current?target:current+(target-current)*(1-Math.exp(-15*dt));if(Math.abs(current-target)<.00002)current=target;
   if(current>.24&&!warmed.current.world){warmed.current.world=true;setWorldMounted(true);}
   if(current>.79&&!warmed.current.album){warmed.current.album=true;setAlbumMounted(true);}
   mapMotion.progress=range(.065,.355,current);photoMotion.progress=range(.38,.865,current);albumMotion.progress=range(.865,1,current);
   const nextMapVisible=current>=.035&&current<.415;if(nextMapVisible!==lastMapVisible){lastMapVisible=nextMapVisible;setMapVisible(nextMapVisible);}
   const next=current<.075?'cover':current<.38?'campus':current<.72?'world':current<.865?'passage':'album';if(lastPhase!==next){lastPhase=next;setPhase(next);}
   const el=root.current;if(!el)return;
   const values={ '--j-hero':1-smooth(.025,.078,current),'--j-map':smooth(.035,.085,current)*(1-smooth(.355,.415,current)),'--j-photo':smooth(.355,.415,current)*(1-smooth(.855,.885,current)),'--j-album':smooth(.855,.885,current),'--j-progress':current,'--j-photo-exit':smooth(.82,.88,current),'--j-map-copy':smooth(.095,.13,current)*(1-smooth(.29,.37,current)),'--j-church-copy':smooth(.42,.47,current)*(1-smooth(.65,.70,current)),'--j-drawer-cue':smooth(.704,.723,current)*(1-smooth(.775,.805,current)),'--j-portal':0};
   for(const[name,value]of Object.entries(values))el.style.setProperty(name,value);
   el.dataset.journeyProgress=current.toFixed(4);el.dataset.mapProgress=mapMotion.progress.toFixed(4);el.dataset.photoProgress=photoMotion.progress.toFixed(4);el.dataset.albumProgress=albumMotion.progress.toFixed(4);
  };gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);
  // A resize during a chapter tween must preserve its requested destination,
  // rather than cancel the tween at its first (often still cover) frame.
  const resize=()=>{const progress=chapterDestination.current?.progress??target;controller.resize();ScrollTrigger.refresh();controller.scrollTo(track.current.offsetTop+(track.current.offsetHeight-innerHeight)*progress,{immediate:true,force:true});chapterDestination.current=null;ScrollTrigger.update();};addEventListener('resize',resize,{passive:true});
  return()=>{gsap.ticker.remove(tick);trigger.kill();controller.destroy();removeEventListener('resize',resize);};
 },[mapMotion,photoMotion,albumMotion]);
 useEffect(()=>{if(modal)lenis.current?.stop();else lenis.current?.start();},[modal]);
 useEffect(()=>{for(const[ref,open]of[[menuRef,menu],[settingsRef,settings],[aboutRef,about],[readerRef,Boolean(reader)],[filmRef,film]]){const d=ref.current;if(open&&!d.open)d.showModal();else if(!open&&d.open)d.close();}if(film)videoRef.current?.play().catch(()=>{});else videoRef.current?.pause();},[menu,settings,about,reader,film]);
 useEffect(()=>{score.setVolume(volume);},[score,volume]);
 useEffect(()=>{const update=()=>{if(sound&&!paused&&!reader&&!film&&!document.hidden)score.start().catch(()=>{setSound(false);setNotice('Select Music to start the sound.');});else score.stop();};update();document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[score,sound,paused,reader,film]);
 useEffect(()=>()=>score.dispose(),[score]);
 const go=p=>{setMenu(false);setReader(null);const controller=lenis.current;if(!controller||!track.current)return;controller.start();controller.resize();const destination={progress:clamp(p)};chapterDestination.current=destination;controller.scrollTo(track.current.offsetTop+(track.current.offsetHeight-innerHeight)*destination.progress,{duration:reduced?0:1.05,immediate:reduced,force:true,onComplete:()=>{if(chapterDestination.current===destination)chapterDestination.current=null;}});};
 const toggleMusic=async()=>{setNotice('');if(sound){score.stop();setSound(false);}else{try{await score.start();setSound(true);}catch{setNotice('Select Music again to start the sound.');}}};
 const pointer=e=>{const x=e.clientX/innerWidth*2-1,y=1-e.clientY/innerHeight*2;mapMotion.pointerX=photoMotion.pointerX=albumMotion.pointerX=x;mapMotion.pointerY=photoMotion.pointerY=albumMotion.pointerY=y;};
 const inWorld=phase==='world'||phase==='passage',headerHidden=phase==='album'||phase==='passage';
 const photoActive=inWorld&&!modal,albumActive=phase==='album'&&!modal;
 return <div ref={root} className={`experience harvard-journey is-${phase} ${reduced?'reduced':''} ${paused?'ambient-paused':''}`}>
  <a className="skip" href="#journey-controls">Skip to journey controls</a>
  <header className="header" aria-hidden={headerHidden} inert={headerHidden||undefined}><button className="brand" onClick={()=>go(0)} aria-label="Harvard, back to the beginning"><Shield/><span>HARVARD<small>THE PURSUIT OF POSSIBILITY</small></span></button><nav className="navigation" aria-label="Main navigation"><button onClick={()=>go(.19)}>The campus <span>↗</span></button><button onClick={()=>go(.93)}>The album</button><button onClick={()=>setAbout(true)}>About the experience</button></nav><button className="menu-toggle" aria-expanded={menu} onClick={()=>setMenu(true)}>Menu <span>+</span></button></header>
  <main><div ref={track} className="hj-track"><section className="hj-stage" aria-label="A scroll journey through Harvard" onPointerMove={pointer} onPointerLeave={()=>{photoMotion.pointerX=photoMotion.pointerY=0;}}>
   <div className="hj-hero-layer" aria-hidden={phase!=='cover'}><LoopingFilm src={heroSource} poster="/assets/harvard-cinematic-poster-web.jpg" active={phase==='cover'&&!paused&&!modal} reducedMotion={reduced} onPosterReady={()=>setPosterReady(true)}/><div className="film-shade"/></div>
   <div className="hj-map-layer" aria-hidden={phase!=='campus'} inert={phase!=='campus'||undefined}>{mapMounted&&!mapFailed&&<SceneBoundary key={mapGeneration} onError={onMapError}><Suspense fallback={null}><CampusMap apiKey={KEY} motion={mapMotion} active={mapVisible&&!modal} onReady={onMapReady} onError={onMapError} onSelect={id=>{if(id==='church')go(.58);else setReader(id==='yard'?'origins':'architecture');}}/></Suspense></SceneBoundary>}{mapFailed&&<div className="hj-map-unavailable"><p>The campus map could not load.</p><button onClick={()=>{setMapFailed(false);setMapReady(false);setMapGeneration(value=>value+1);}}>Try the map again <Arrow/></button><button onClick={()=>go(.58)}>Continue to the atelier <Arrow/></button></div>}</div>
   <div className="hj-world-layer" aria-hidden={!inWorld} inert={!inWorld||undefined}><SceneBoundary fallback={<button className="hj-direct-reader" onClick={()=>go(.93)}>Open the Harvard album <Arrow/></button>}><Suspense fallback={<p className="hj-preparing">Preparing the atelier…</p>}>{worldMounted&&<HarvardArchiveWorld motion={photoMotion} active={photoActive} quality={quality} reduced={reduced} paused={paused} onReady={onPhotoReady} onSelect={openVolume}/>}</Suspense></SceneBoundary></div>
   <div className="hj-album-layer" aria-hidden={phase!=='album'} inert={phase!=='album'||undefined}><SceneBoundary fallback={<button className="hj-direct-reader" onClick={()=>openVolume('origins')}>Discover the stories of Harvard <Arrow/></button>}><Suspense fallback={<p className="hj-preparing">Opening the album…</p>}>{albumMounted&&<HarvardAlbum3D motion={albumMotion} quality={quality} reduced={reduced} paused={paused} active={albumActive} onVolume={openVolume}/>}</Suspense></SceneBoundary></div>
   <div className={`intro-copy scene-copy ${phase==='cover'?'visible':''}`} aria-hidden={phase!=='cover'} inert={phase!=='cover'||undefined}><p className="eyebrow">CURIOSITY MOVES US.</p><h1>Harvard<span>.</span></h1><h2>A place to imagine<br/><em>what comes next.</em></h2><p className="caption">A journey through ideas, stories and possibilities.</p><button className="begin-button" tabIndex={phase==='cover'?0:-1} onClick={()=>go(.13)}>Step into the story <Arrow/></button></div>
   <div className="hj-map-copy" aria-hidden={phase!=='campus'} inert={phase!=='campus'||undefined}><p className="hj-kicker">01 / A PLACE OF POSSIBILITY</p><h2>A new<br/><em>perspective.</em></h2><p>Along the paths of the Yard,<br/>curiosity finds its place.</p><button tabIndex={phase==='campus'?0:-1} onClick={()=>go(.58)}>Discover the atelier of ideas <Arrow/></button></div>
   <ArchiveEditorial phase={phase}/>
   <div className="hj-arrival-type" aria-hidden="true"><span>One story opens another.</span><small>HARVARD · AN ATLAS OF IDEAS</small></div>
   {phase==='campus'&&!mapReady&&!mapFailed&&<p className="hj-loading" role="status">Finding our way to Harvard…</p>}
   <div className={`loading-screen ${posterReady?'ready':''}`} aria-hidden={posterReady}><Shield/><span>HARVARD</span><p>Curiosity moves us.</p><i/></div>
  </section></div></main>
  <footer className="hj-footer"><span>A CREATIVE STUDY BY GUILHERME GALVÃO · HARVARD</span><button onClick={()=>go(.19)}>Revisit the campus <Arrow/></button><button onClick={()=>setAbout(true)}>Sources & credits ↗</button></footer>
  <div className="hj-controls" id="journey-controls"><button className="hj-sound" aria-pressed={sound} onClick={toggleMusic}><Speaker muted={!sound}/><span>{sound?'Music on':'Ambient music'}</span></button><nav aria-label="Journey chapters">{CHAPTERS.map((c,i)=><button key={c.id} aria-label={c.label} aria-current={(phase===c.id||(c.id==='world'&&phase==='passage'))?'step':undefined} onClick={()=>go(c.at)}><span>0{i+1}</span><i/><b>{c.label}</b></button>)}</nav><div className="hj-options"><button aria-label={paused?'Resume ambient motion':'Pause ambient motion'} onClick={()=>setPaused(!paused)}>{paused?'▷':'Ⅱ'}</button><button onClick={()=>setSettings(true)}>{quality==='cinema'?'Cinema':quality==='high'?'High':'Settings'} <span>◦</span></button></div></div>
  {notice&&<button className="hj-notice" role="status" onClick={()=>setNotice('')}>{notice} ×</button>}
  <dialog ref={menuRef} className="modal hj-menu" data-lenis-prevent onCancel={()=>setMenu(false)} onClose={()=>setMenu(false)}><button className="modal-close" aria-label="Close menu" onClick={()=>setMenu(false)}>×</button><p className="hj-kicker">CHOOSE YOUR PATH</p>{CHAPTERS.map(c=><button key={c.id} className="hj-menu-link" onClick={()=>go(c.at)}>{c.label}<Arrow/></button>)}</dialog>
  <dialog ref={settingsRef} className="modal hj-settings" data-lenis-prevent onCancel={()=>setSettings(false)} onClose={()=>setSettings(false)}><button className="modal-close" aria-label="Close settings" onClick={()=>setSettings(false)}>×</button><p className="hj-kicker">AT YOUR OWN PACE</p><h2>Your<br/><em>perspective.</em></h2><label className="setting-row"><span>Scene and album quality<small>Your choice stays as you scroll.</small></span><select value={quality} onChange={e=>setQuality(e.target.value)}><option value="auto">Automatic</option><option value="high">High</option><option value="cinema">Cinema · maximum</option></select></label><p className="resolution-readout">Rendering: {profile.renderWidth} × {profile.renderHeight} px.</p><label className="setting-row"><span>Music</span><input aria-label="Music volume" type="range" min="0" max="1" step=".01" value={volume} onChange={e=>setVolume(Number(e.target.value))}/></label><label className="setting-row"><span>Reduced motion</span><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/></label></dialog>
  <dialog ref={aboutRef} className="modal hj-about" data-lenis-prevent onCancel={()=>setAbout(false)} onClose={()=>setAbout(false)}><button className="modal-close" aria-label="Close credits" onClick={()=>setAbout(false)}>×</button><p className="hj-kicker">AN ATLAS OF IDEAS</p><h2>A new<br/><em>perspective.</em></h2><p>An independent creative study by Guilherme Galvão, with no institutional affiliation with Harvard University.</p><p>{KEY?'This local preview uses Google Maps geographic imagery. The imagery does not represent live traffic.':'The public campus map uses real OpenStreetMap geography, rendered in 3D with MapLibre and OpenFreeMap. Building shapes and heights are cartographic approximations.'}</p><p>The atelier is an original animated world of reading, receiving and archiving. It does not reproduce an actual Harvard interior. Explore six interactive volumes with photographs of real places.</p><p>The opening film is from Harvard College. The optional ambient score is an original composition inspired by plucked strings and flute.</p><div className="credit-links"><a href="/assets/CREDITS-atlas.md" target="_blank" rel="noopener noreferrer">Authorship, sources & licenses ↗</a><a href="/assets/study-devices/CREDITS.md" target="_blank" rel="noopener noreferrer">Devices & backpacks · licensed models ↗</a><a href="/assets/ready-models/CREDITS.md" target="_blank" rel="noopener noreferrer">People, plants & books · CC0 models ↗</a><a href="/assets/warehouse-models/CREDITS.md" target="_blank" rel="noopener noreferrer">Receiving & forklift · CC0 models ↗</a><a href="/assets/kenney-conveyor/CREDITS.md" target="_blank" rel="noopener noreferrer">Scanner & conveyors · CC0 models ↗</a><a href="/assets/collection-models/CREDITS.md" target="_blank" rel="noopener noreferrer">Furniture & lighting · CC0 models ↗</a><a href="https://www.figma.com/design/5JLgqQ96GqZeNzydUQIA0K?node-id=3-2" target="_blank" rel="noopener noreferrer">Editorial design in Figma ↗</a><a href="/assets/CREDITS-memorial-church.md" target="_blank" rel="noopener noreferrer">Memorial Church photographs ↗</a><a href="https://memorialchurch.harvard.edu/" target="_blank" rel="noopener noreferrer">The Memorial Church · Harvard ↗</a></div></dialog>
  <dialog ref={readerRef} className="hj-reader-dialog" data-lenis-prevent onCancel={()=>setReader(null)} onClose={()=>setReader(null)}><button className="hj-reader-close" aria-label="Close the book and return to the scene" onClick={()=>setReader(null)}>Return to the scene <span>×</span></button><Suspense fallback={<p className="hj-preparing">Opening the volume…</p>}>{reader&&<AlbumVolumeReader key={reader} volume={VOLUMES.find(v=>v.id===reader)||VOLUMES[0]} reduced={reduced} onClose={()=>setReader(null)} onOpenMedia={()=>{setReader(null);setFilm(true);}}/>}</Suspense></dialog>
  <dialog ref={filmRef} className="film-dialog" data-lenis-prevent onCancel={()=>setFilm(false)} onClose={()=>setFilm(false)}><button className="film-close" aria-label="Close film" onClick={()=>setFilm(false)}>×</button>{film&&<video ref={videoRef} src={FILM} controls playsInline/>}<p>Official Harvard College film, presented without editing. The original film is silent.</p></dialog>
 </div>;
}
