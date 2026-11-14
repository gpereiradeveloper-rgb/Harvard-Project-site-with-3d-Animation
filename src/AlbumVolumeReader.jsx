import React, {useCallback, useEffect, useId, useRef, useState} from 'react';
import './AlbumVolumeReader.css';

const SOURCES = {
  history: 'https://www.harvard.edu/about/history/',
  widener: 'https://library.harvard.edu/libraries/widener/about',
  gutenberg: 'https://library.harvard.edu/collections/gutenberg-bible',
  library: 'https://library.harvard.edu/',
  hollis: 'https://hollis.harvard.edu/',
  dash: 'https://dash.harvard.edu/',
  focus: 'https://www.harvard.edu/in-focus/',
  maps: 'https://www.harvard.edu/visit/maps-directions/',
  campus: 'https://college.harvard.edu/about/campus',
  church: 'https://memorialchurch.harvard.edu/history-0',
};
const PHOTOS = {
  loker: {src: '/assets/loker-4k-web.jpg', alt: 'Reading tables, bookshelves, and natural light in the Loker Reading Room at Widener Library.', caption: 'Loker Reading Room · Widener Library', credit: 'Jerem43 · CC BY-SA 3.0', href: 'https://commons.wikimedia.org/wiki/File:Loker_Reading_Room.jpg'},
  widener: {src: '/assets/widener-4k-web.jpg', alt: 'The facade and steps of the Harry Elkins Widener Memorial Library.', caption: 'Harry Elkins Widener Memorial Library', credit: 'Photograph: Ajay Suresh'},
  memorial: {src: '/assets/memorial-hall-web.jpg', alt: 'The brick architecture and tower of Memorial Hall at Harvard.', caption: 'Memorial Hall · Harvard University', credit: 'Photograph: Daderot'},
  church: {src: '/assets/memorial-church-front-web.jpg', alt: 'The facade of Memorial Church and the central path leading to its entrance.', caption: 'Memorial Church · Harvard University', credit: 'Ingfbruno · CC BY-SA 3.0', href: 'https://commons.wikimedia.org/wiki/File:USA-Harvard_Memorial_Church.jpg'},
  organ: {src: '/assets/memorial-church-organ-web.jpg', alt: 'The interior of Memorial Church, showing the organ and the surrounding architecture.', caption: 'Inside Memorial Church', credit: 'Ingfbruno · CC BY-SA 3.0', href: 'https://commons.wikimedia.org/wiki/File:USA-Harvard_Memorial_Church0.jpg'},
  inscription: {src: '/assets/memorial-church-inscription-web.jpg', alt: 'A photographic detail of the memorial inscription at Harvard’s Memorial Church.', caption: 'The Memorial Church inscription', credit: 'Greger Ravik · CC BY 2.0', href: 'https://commons.wikimedia.org/wiki/File:Harvard_University_7_(49340526081).jpg'},
};
const VOLUMES = {
  origins: {
    roman: 'I', title: 'Origins', subtitle: 'The beginning of\na lasting conversation.', theme: 'Memory & continuity', intro: 'A public decision, a legacy of books, and a story still being written. Returning to the beginning helps us look more closely at the present.',
    pages: [
      {kind: 'opening', title: 'Origins', subtitle: 'The beginning of\na lasting conversation.', label: 'A story unfolds', text: 'A public decision, a legacy of books, and a story still being written. Returning to the beginning helps us look more closely at the present.'},
      {kind: 'date', title: 'A beginning\nin Massachusetts.', label: 'The founding act', number: '1636', numberLabel: 'October 28', paragraphs: ['Harvard was founded on October 28, 1636, by a decision of the General Court of the Massachusetts Bay Colony.', 'That date marks a beginning. The institution’s history brings together the people, decisions, and transformations that followed.'], links: [{label: 'Read Harvard’s history', href: SOURCES.history}]},
      {kind: 'essay', title: 'A legacy\nof books.', label: 'John Harvard', initial: 'H', paragraphs: ['John Harvard was the institution’s first major benefactor. He left a share of his estate and his library.', 'That early gift of books offers an enduring image: knowledge can be received, cared for, and shared.'], note: 'A library is also an invitation to continue a reading begun by someone else.', links: [{label: 'Discover the story behind the name', href: SOURCES.history}]},
      {kind: 'photo', title: 'Memory\nfinds a home.', label: 'A photograph of Harvard', photo: 'widener', paragraphs: ['Widener belongs to a later chapter of this history. Opened in 1915, it was a gift from Eleanor Elkins Widener in memory of her son Harry.', 'The building brings together two forms of continuity: preserving a memory and making room for new readers.'], links: [{label: 'The history of Widener', href: SOURCES.widener}]},
      {kind: 'paths', title: 'Follow\nthe sources.', label: 'Three ways to continue', paragraphs: ['Explore the institution’s history, find a book, and follow a question to its next reference.'], paths: [{number: '01', title: 'The history', text: 'People and milestones in Harvard’s official account.', href: SOURCES.history}, {number: '02', title: 'The library', text: 'Services, collections, and places to read.', href: SOURCES.library}, {number: '03', title: 'The catalog', text: 'Search HOLLIS by author, title, or subject.', href: SOURCES.hollis}]},
      {kind: 'closing', title: 'Every beginning\nopens a future.', label: 'Reading notes', paragraphs: ['The past does not end with a date. It returns in names, libraries, and the questions we carry with us.', 'This volume offers a first encounter. The official sources provide the context to take the story further.'], note: 'Choose a reference. Open another page. Continue the conversation.', links: [{label: 'Return to Harvard’s history', href: SOURCES.history}]},
    ],
  },
  library: {
    roman: 'II', title: 'The library', theme: 'Books & discoveries',
    pages: [
      {kind: 'opening', title: 'The library', subtitle: 'There is always\nanother page.', label: 'Places to discover', text: 'Between a reading room and a catalog search, curiosity finds different rhythms. This volume follows three simple acts: entering, searching, and reading.'},
      {kind: 'photo', title: 'Time\nto read.', label: 'Loker Reading Room', photo: 'loker', paragraphs: ['Tables, bookshelves, and natural light shape the Loker Reading Room in Widener Library.', 'The photograph invites a slower pace. To learn about spaces, services, and access, consult Harvard Library’s guidance.'], links: [{label: 'Explore Harvard Library', href: SOURCES.library}]},
      {kind: 'date', title: 'A name,\na memory.', label: 'Harry Elkins Widener Memorial Library', number: '1915', numberLabel: 'Widener opens', paragraphs: ['Widener opened in 1915. Eleanor Elkins Widener gave the building in memory of her son Harry.', 'The library’s official history explains this memorial and Widener’s place in the life of Harvard.'], links: [{label: 'Read the library’s history', href: SOURCES.widener}]},
      {kind: 'paths', title: 'Find\na way in.', label: 'Research tools', paths: [{number: '01', title: 'Harvard Library', text: 'Start with the library’s services and collections.', href: SOURCES.library}, {number: '02', title: 'HOLLIS', text: 'Search the catalog for a title, author, or subject.', href: SOURCES.hollis}, {number: '03', title: 'DASH', text: 'Explore Harvard’s open-access research repository.', href: SOURCES.dash}]},
      {kind: 'essay', title: 'Reading begins\nbefore the book.', label: 'A small practice', initial: 'R', paragraphs: ['Before opening a book, choose a question. It might be broad: how does a city change? Or more specific: who has written about this building?', 'Try different search terms in the catalog. When you find a work, note its author, edition, and references. Each detail may suggest another direction.'], note: 'Write down three things: an idea, a reference, and a question that remains.', links: [{label: 'Start a HOLLIS search', href: SOURCES.hollis}]},
      {kind: 'closing', title: 'The book ends.\nThe search continues.', label: 'The next encounter', paragraphs: ['You can return to a room, an author, or a question. The library offers a starting point for each of these journeys.', 'Keep a reference you would like to explore at greater length. A good reading can begin later, too.'], links: [{label: 'Open Harvard Library', href: SOURCES.library}, {label: 'Explore research in DASH', href: SOURCES.dash}]},
    ],
  },
  architecture: {
    roman: 'III', title: 'Architecture', theme: 'Form & presence',
    pages: [
      {kind: 'opening', title: 'Architecture', subtitle: 'Places that\nteach us to look.', label: 'A notebook of observations', text: 'A facade rewards a patient eye. Proportion, material, shadow, and light reveal details a first glance can miss. Here, buildings invite closer attention.'},
      {kind: 'photo', title: 'The scale\nof arrival.', label: 'Memorial Church', photo: 'church', paragraphs: ['The central path, steps, and portico of Memorial Church guide the eye toward its entrance.', 'Notice the relationship between the building and the space in front of it. Architecture begins before the door, in the way we approach.'], links: [{label: 'The history of Memorial Church', href: SOURCES.church}]},
      {kind: 'essay', title: 'Four ways\nof seeing.', label: 'Notes in the margin', initial: 'A', paragraphs: ['Proportion. Compare the height of an opening with the length of a facade. Repetition. Follow the rhythm of windows and columns.', 'Material. Notice the texture of brick and stone. Light. Look for bright surfaces and the shadows that give them depth.'], note: 'Look at the same detail up close, then from a distance. Your reading changes.', links: [{label: 'Find the places on the official map', href: SOURCES.maps}]},
      {kind: 'photo', title: 'Another\nperspective.', label: 'Inside the church', photo: 'organ', paragraphs: ['This photograph shows the interior of Memorial Church, including the organ and the proportions of the space.', 'Compare it with the facade. Which forms guide your eye? Which details invite a second look?'], links: [{label: 'Discover Memorial Church', href: SOURCES.church}]},
      {kind: 'paths', title: 'Looking\nat three scales.', label: 'For your next observation', paths: [{number: '01', title: 'The detail', text: 'A frame, a joint, a change of texture. Pause at a single element.', href: SOURCES.campus}, {number: '02', title: 'The building', text: 'Bring the details together and study the facade’s rhythm.', href: SOURCES.campus}, {number: '03', title: 'The place', text: 'Use the official map to understand how the spaces relate.', href: SOURCES.maps}]},
      {kind: 'closing', title: 'A landscape\ncan be read.', label: 'A personal record', paragraphs: ['Bring a question to the next building you encounter. Does its form suit its use? Does the place invite you inside? What does the light change?', 'An architectural notebook can begin with a photograph, a drawing, or simply a carefully observed sentence.'], links: [{label: 'Consult maps and directions', href: SOURCES.maps}]},
    ],
  },
  collections: {
    roman: 'IV', title: 'Collections', theme: 'Objects & stories',
    pages: [
      {kind: 'opening', title: 'Collections', subtitle: 'One object.\nMany readings.', label: 'Memory in your hands', text: 'A book holds more than words. Paper, binding, and traces of use offer other ways to ask questions. A collection brings these layers together and opens paths for research.'},
      {kind: 'essay', title: 'The printed\npage.', label: 'Harvard’s Gutenberg Bible', initial: 'G', paragraphs: ['Harvard’s copy of the Gutenberg Bible was printed on paper and is bound in two volumes.', 'Selected pages have been digitized. Harvard Library’s presentation introduces the copy and provides access to these images.'], note: 'A digital page does not replace the object. It offers another way to begin looking.', links: [{label: 'Explore Harvard’s copy', href: SOURCES.gutenberg}]},
      {kind: 'photo', title: 'Preserve\nand discover.', label: 'A place to read', photo: 'loker', paragraphs: ['A collection finds new connections when someone consults it. One name leads to another; a reference brings once-distant subjects together.', 'The Loker Reading Room photograph accompanies this encounter between a reader and what has been preserved.'], links: [{label: 'Explore Harvard Library', href: SOURCES.library}]},
      {kind: 'essay', title: 'Look beyond\nthe text.', label: 'An exercise in observation', initial: 'P', paragraphs: ['When you open a digitized page, begin with the whole. Notice the arrangement of text, the width of the margins, and how its elements relate.', 'Then look more closely at one detail. Record what you see before interpreting it. Distinguishing observation from hypothesis helps you ask more careful questions.'], note: 'What can you see? What would you like to confirm? Which source might help?', links: [{label: 'Examine the digitized pages', href: SOURCES.gutenberg}]},
      {kind: 'paths', title: 'From an object\nto a question.', label: 'Three starting points', paths: [{number: '01', title: 'A copy', text: 'Begin with the presentation of Harvard’s Gutenberg Bible.', href: SOURCES.gutenberg}, {number: '02', title: 'A catalog', text: 'Find related authors, titles, and subjects in HOLLIS.', href: SOURCES.hollis}, {number: '03', title: 'A library', text: 'Discover more resources and collections at Harvard Library.', href: SOURCES.library}]},
      {kind: 'closing', title: 'Preservation\nopens possibilities.', label: 'The next question', paragraphs: ['A collection can be revisited many times. At each encounter, a new question rearranges the same details.', 'Choose a page from the Gutenberg Bible. Observe, take notes, and follow a reference. Inquiry begins with that small act.'], links: [{label: 'Revisit the Gutenberg collection', href: SOURCES.gutenberg}]},
    ],
  },
  campus: {
    roman: 'V', title: 'Campus life', theme: 'Encounters & everyday life',
    pages: [
      {kind: 'opening', title: 'Campus life', subtitle: 'Between places,\nlife unfolds.', label: 'Harvard in motion', text: 'One dimension of campus reveals itself between the buildings: arriving, meeting someone, and finding another path. This volume brings together photographs and official starting points.'},
      {kind: 'photo', title: 'A place\nto arrive.', label: 'Memorial Church', photo: 'church', paragraphs: ['A photograph holds one view still. The experience of a place includes many others: the approach, the sounds, the encounters, and the time spent there.', 'Memorial Church is one place to observe in this encounter with campus. Its official website presents the building’s history.'], links: [{label: 'Discover Memorial Church', href: SOURCES.church}]},
      {kind: 'film', title: 'A new\nperspective.', label: 'The campus in motion', paragraphs: ['Harvard College’s official film offers another view of campus: spaces, rhythms, and scenes that a still image cannot bring together.', 'Open the film to continue this visual visit. Then return to the volume and explore the next references.'], links: [{label: 'Open the official campus page', href: SOURCES.campus}]},
      {kind: 'photo', title: 'Memory\nin the details.', label: 'The memorial inscription', photo: 'inscription', paragraphs: ['A detail can change how we read a place. This photograph brings the inscription at Memorial Church into focus.', 'First look at what the image records. Then consult the official source to connect your observation with its context.'], links: [{label: 'Read the history of Memorial Church', href: SOURCES.church}]},
      {kind: 'paths', title: 'Plan\nyour visit.', label: 'Official references', paths: [{number: '01', title: 'See the campus', text: 'Start with Harvard College’s introduction.', href: SOURCES.campus}, {number: '02', title: 'Find your bearings', text: 'Consult maps and directions to orient yourself.', href: SOURCES.maps}, {number: '03', title: 'Discover', text: 'Find themes and stories in Harvard In Focus.', href: SOURCES.focus}]},
      {kind: 'closing', title: 'Bring\nyour curiosity.', label: 'After the last page', paragraphs: ['A good visit begins with openness: noticing something you do not yet know.', 'Choose a place to observe more closely, a story to read, or a question to pursue. Campus comes to life through these encounters.'], links: [{label: 'Continue on the official campus site', href: SOURCES.campus}, {label: 'Consult maps and directions', href: SOURCES.maps}]},
    ],
  },
  research: {
    roman: 'VI', title: 'Research', theme: 'Questions & possibilities',
    pages: [
      {kind: 'opening', title: 'Research', subtitle: 'A question can\nchange the world.', label: 'Curiosity in practice', text: 'Research means asking a question and accepting that the answer may change it. This volume follows a short reading journey, from discovering a topic to consulting its sources.'},
      {kind: 'essay', title: 'Begin with\nyour interest.', label: 'Harvard In Focus', initial: '?', paragraphs: ['Harvard In Focus brings together content around shared themes. It is a starting point for discovering stories, perspectives, and subjects to explore.', 'Choose a topic that sparks your curiosity. Before going further, write one sentence about what you would like to understand better.'], note: 'A useful question does not need to be perfect. It needs to suggest a next step.', links: [{label: 'Explore Harvard In Focus', href: SOURCES.focus}]},
      {kind: 'photo', title: 'Read, connect,\nask again.', label: 'The work of attention', photo: 'loker', paragraphs: ['An idea gains context through other references. Consider where a claim comes from and which questions it leaves open.', 'The HOLLIS catalog can help you find works related to your chosen topic.'], links: [{label: 'Search the HOLLIS catalog', href: SOURCES.hollis}]},
      {kind: 'essay', title: 'An open door\nto research.', label: 'DASH · open access', initial: 'D', paragraphs: ['DASH is Harvard’s open-access research repository. It provides another way to find scholarly work and follow its references.', 'As you read, look for the problem investigated, the approach taken, and the limitations discussed. The conclusion makes more sense alongside these choices.'], note: 'Record the source alongside the idea. Later, you can return to its context.', links: [{label: 'Explore the DASH repository', href: SOURCES.dash}]},
      {kind: 'paths', title: 'Three steps\ntoward inquiry.', label: 'A reading practice', paths: [{number: '01', title: 'Discover', text: 'Find a topic and form your first question.', href: SOURCES.focus}, {number: '02', title: 'Connect', text: 'Search the catalog for works, authors, and subjects.', href: SOURCES.hollis}, {number: '03', title: 'Go deeper', text: 'Read work in DASH and follow its references.', href: SOURCES.dash}]},
      {kind: 'closing', title: 'The next\nquestion is yours.', label: 'An open notebook', paragraphs: ['After reading, note what has changed in your understanding. Which ideas are clearer? What still needs a source?', 'Research also means learning to express more clearly what we do not know. The next question may begin right there.'], links: [{label: 'Discover a topic in Harvard In Focus', href: SOURCES.focus}, {label: 'Continue reading in DASH', href: SOURCES.dash}]},
    ],
  },
};
function Arrow({back = false, diagonal = false}) {
  return <svg className={back ? 'avr-arrow-back' : undefined} viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function SourceLink({href, children}) {
  return <a className="avr-source-link" href={href} target="_blank" rel="noopener noreferrer">{children}<Arrow diagonal/></a>;
}
function Lines({text}) { return text.split('\n').map((line, index) => <React.Fragment key={line}>{index > 0 && <br/>}{line}</React.Fragment>); }
function VolumeMark({number}) {
  return <div className="avr-volume-mark" aria-hidden="true"><span>H</span><i/><small>VERITAS</small><b>{number}</b></div>;
}
function PageContent({data, edition, number, onOpenMedia}) {
  if (data.kind === 'opening') return <div className="avr-opening"><span className="avr-eyebrow">{data.label}</span><h2>{data.title}</h2><p className="avr-opening-subtitle"><Lines text={data.subtitle}/></p><div className="avr-opening-rule"/><p className="avr-opening-intro">{data.text}</p><VolumeMark number={edition.roman}/><p className="avr-edition">An atlas of ideas · Cambridge, Massachusetts</p></div>;
  return <>
    <div className="avr-chapter-heading"><span className="avr-eyebrow">{data.label}</span><h3><Lines text={data.title}/></h3></div>
    {data.kind === 'date' && <div className="avr-date">{data.number}<span>{data.numberLabel}</span></div>}
    {data.kind === 'photo' && <figure className="avr-photo"><img src={PHOTOS[data.photo].src} alt={PHOTOS[data.photo].alt} loading="eager" draggable="false"/><figcaption><span>{PHOTOS[data.photo].caption}</span>{PHOTOS[data.photo].href ? <a href={PHOTOS[data.photo].href} target="_blank" rel="noopener noreferrer">{PHOTOS[data.photo].credit}</a> : <span>{PHOTOS[data.photo].credit}</span>}</figcaption></figure>}
    {data.kind === 'essay' && <span className="avr-initial" aria-hidden="true">{data.initial}</span>}
    {data.kind === 'film' && <div className="avr-film"><img src={PHOTOS.widener.src} alt="The facade of Widener Library, shown in a campus photograph." draggable="false"/><button type="button" onClick={() => onOpenMedia?.('film')} disabled={!onOpenMedia} aria-label="Watch the official Harvard College film"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="m12 8 13 8-13 8V8Z" fill="currentColor"/></svg><span>Watch the official film</span><small>Harvard College</small></button><span className="avr-film-credit">Photograph: Ajay Suresh</span></div>}
    <div className="avr-prose">{data.paragraphs?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
    {data.paths && <div className="avr-paths">{data.paths.map(path => <a key={path.number} href={path.href} target="_blank" rel="noopener noreferrer"><span className="avr-path-number">{path.number}</span><div><h4>{path.title}</h4><p>{path.text}</p></div><Arrow diagonal/></a>)}</div>}
    {data.note && <aside className="avr-note"><span>In the margin</span><p>{data.note}</p></aside>}
    {data.kind === 'closing' && <div className="avr-colophon"><span>End of volume {edition.roman}</span><p>An independent digital edition with no institutional affiliation with Harvard. Editorial text refers to official sources; photographs are credited on each page.</p><svg className="avr-colophon-flower" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v18M3 12h18M5.64 5.64l12.72 12.72M5.64 18.36 18.36 5.64" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg></div>}
    {data.links && <div className="avr-source-list">{data.links.map(link => <SourceLink key={link.href} href={link.href}>{link.label}</SourceLink>)}</div>}
  </>;
}
function Page({number, edition, side = 'single', decorative = false, onOpenMedia}) {
  const data = edition.pages[number];
  return <article className={`avr-page avr-page-${side} avr-page-${data.kind}`} aria-label={`Page ${number + 1} of 6: ${data.title.replaceAll('\n', ' ')}`} aria-hidden={decorative || undefined} inert={decorative || undefined}>
    <header className="avr-running-head"><span>Harvard</span><span>{edition.theme}</span></header>
    <div className="avr-page-body" data-lenis-prevent data-lenis-prevent-wheel tabIndex={decorative ? -1 : 0} role="region" aria-label={`Page ${number + 1} content`}><PageContent data={data} edition={edition} number={number} onOpenMedia={onOpenMedia}/></div>
    <footer className="avr-page-footer"><span>{edition.title}</span><span>{String(number + 1).padStart(2, '0')}</span></footer>
  </article>;
}

/** Place inside the parent's native dialog. The parent owns its close button. */
export default function AlbumVolumeReader({volume, onClose, onOpenMedia, reduced: reducedByApp = false}) {
  const edition = VOLUMES[volume?.id] || VOLUMES.origins;
  const root = useRef(null), book = useRef(null), wheel = useRef({amount: 0, at: 0, sign: 0}), cooldown = useRef(0), turnLock = useRef(false), touch = useRef(null);
  const [page, setPage] = useState(0), [turn, setTurn] = useState(null);
  const [single, setSingle] = useState(() => typeof window !== 'undefined' && window.innerWidth < 800);
  const [prefersReduced, setPrefersReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const reduced = Boolean(reducedByApp || prefersReduced);
  const headingId = useId(), statusId = useId();
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setPrefersReduced(media.matches);
    media.addEventListener('change', updateMotion);
    const observer = new ResizeObserver(entries => setSingle(entries[0].contentRect.width < 800));
    observer.observe(root.current);
    const focus = requestAnimationFrame(() => root.current?.focus({preventScroll: true}));
    return () => {media.removeEventListener('change', updateMotion); observer.disconnect(); cancelAnimationFrame(focus);};
  }, []);
  useEffect(() => {setPage(0); setTurn(null); turnLock.current = false; wheel.current.amount = 0;}, [volume?.id]);
  useEffect(() => {setPage(current => single ? current : Math.floor(current / 2) * 2); setTurn(null); turnLock.current = false;}, [single]);
  const finishTurn = useCallback(() => {
    if (!turn) return;
    setPage(turn.to);
    setTurn(null);
    turnLock.current = false;
  }, [turn]);
  useEffect(() => {
    if (!turn) return;
    if (reduced) {finishTurn(); return;}
    const timer = setTimeout(finishTurn, 880);
    return () => clearTimeout(timer);
  }, [turn, reduced, finishTurn]);
  const navigate = useCallback(requested => {
    if (turnLock.current) return;
    const to = single ? Math.max(0, Math.min(5, requested)) : Math.max(0, Math.min(4, Math.floor(requested / 2) * 2));
    if (to === page) return;
    cooldown.current = performance.now() + (reduced ? 480 : 1000);
    wheel.current = {amount: 0, at: 0, sign: 0};
    if (reduced) setPage(to);
    else {turnLock.current = true; setTurn({from: page, to, direction: to > page ? 'next' : 'previous'});}
  }, [page, single, reduced]);
  useEffect(() => {
    const element = root.current;
    const onWheel = event => {
      if (event.ctrlKey) return;
      event.stopPropagation();
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.3 ? event.deltaX : event.deltaY;
      if (!delta) return;
      const body = event.target instanceof Element ? event.target.closest('.avr-page-body') : null;
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.3;
      if (!horizontal && body && body.scrollHeight > body.clientHeight + 3) {
        const canScroll = delta > 0 ? body.scrollTop + body.clientHeight < body.scrollHeight - 3 : body.scrollTop > 3;
        if (canScroll) {wheel.current.amount = 0; return;}
      }
      event.preventDefault();
      const now = performance.now();
      if (turnLock.current || now < cooldown.current) {wheel.current.amount = 0; return;}
      const sign = Math.sign(delta), scaled = delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 500 : 1);
      // A mouse notch must reach the threshold on its own. Small trackpad
      // deltas accumulate, including deliberate, slower wheel movements.
      if (now - wheel.current.at > 750 || sign !== wheel.current.sign) wheel.current.amount = 0;
      const amount = event.deltaMode ? Math.max(100, Math.abs(scaled)) : Math.abs(scaled);
      wheel.current.amount += Math.min(240, amount);
      wheel.current.at = now; wheel.current.sign = sign;
      if (wheel.current.amount >= 100) {wheel.current.amount = 0; navigate(page + sign * (single ? 1 : 2));}
    };
    element.addEventListener('wheel', onWheel, {passive: false});
    return () => element.removeEventListener('wheel', onWheel);
  }, [navigate, page, single]);
  const step = single ? 1 : 2;
  const visible = single ? [turn ? turn.to : page] : turn ? turn.direction === 'next' ? [turn.from, turn.to + 1] : [turn.to, turn.from + 1] : [page, page + 1];
  const front = turn && (single ? turn.from : turn.direction === 'next' ? turn.from + 1 : turn.from);
  const back = turn && (single ? turn.to : turn.direction === 'next' ? turn.to : turn.to + 1);
  const announcement = `${edition.title}. ${single ? `Page ${page + 1} of 6` : `Pages ${page + 1} and ${page + 2} of 6`}.`;
  return <section ref={root} lang="en" className={`album-volume-reader ${single ? 'avr-single' : 'avr-spread'} ${reduced ? 'avr-reduced' : ''}`} tabIndex={-1} aria-labelledby={headingId} aria-describedby={statusId} data-volume={volume?.id || 'origins'} data-page-index={page} onKeyDown={event => {
    if (event.altKey || event.ctrlKey || event.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    if (['ArrowRight', 'PageDown', 'ArrowLeft', 'PageUp', 'Home', 'End'].includes(event.key)) {event.preventDefault(); navigate(event.key === 'Home' ? 0 : event.key === 'End' ? 5 : page + (['ArrowRight', 'PageDown'].includes(event.key) ? step : -step));}
    if (event.key === 'Escape' && onClose) {event.preventDefault(); event.stopPropagation(); onClose();}
  }}>
    <header className="avr-toolbar"><div className="avr-toolbar-brand"><span className="avr-brand-monogram" aria-hidden="true">H</span><span>Harvard<span>An atlas of ideas</span></span></div><div className="avr-toolbar-title"><span>Volume {edition.roman}</span><h1 id={headingId}>{edition.title}</h1></div><span className="avr-toolbar-edition">Reading edition<span>Cambridge, Massachusetts</span></span></header>
    <div className="avr-stage"><div ref={book} className="avr-book" onTouchStart={event => {if (event.touches.length === 1) touch.current = {x: event.touches[0].clientX, y: event.touches[0].clientY};}} onTouchEnd={event => {if (!touch.current || !event.changedTouches.length) return; const dx = event.changedTouches[0].clientX - touch.current.x, dy = event.changedTouches[0].clientY - touch.current.y; touch.current = null; if (Math.abs(dx) > 75 && Math.abs(dx) > Math.abs(dy) * 1.6) navigate(page + (dx < 0 ? step : -step));}}>
      <div className="avr-book-cover" aria-hidden="true"/><div className="avr-page-edges" aria-hidden="true"/>
      <div className="avr-page-pair">{visible.map((number, index) => <Page key={`${volume?.id}-${index}-${number}`} number={number} edition={edition} side={single ? 'single' : index === 0 ? 'left' : 'right'} onOpenMedia={onOpenMedia}/>)}</div>
      {!single && <span className="avr-gutter" aria-hidden="true"/>}
      {turn && <div className={`avr-leaf avr-leaf-${turn.direction}`} aria-hidden="true" onAnimationEnd={event => {if (event.target === event.currentTarget) finishTurn();}}><div className="avr-leaf-face avr-leaf-front"><Page number={front} edition={edition} decorative onOpenMedia={onOpenMedia}/></div><div className="avr-leaf-face avr-leaf-back"><Page number={back} edition={edition} decorative onOpenMedia={onOpenMedia}/></div></div>}
    </div></div>
    <footer className="avr-controls"><p className="avr-control-hint"><span aria-hidden="true">↔</span> Scroll or use the arrow keys<span className="avr-wheel-hint"> · Scroll at the end of the page to continue</span></p><nav className="avr-pagination" aria-label="Volume navigation"><button type="button" onClick={() => navigate(page - step)} disabled={page === 0 || Boolean(turn)} aria-label={single ? 'Previous page' : 'Previous pages'}><Arrow back/><span>Previous</span></button><span className="avr-counter" aria-hidden="true"><b>{String(page + 1).padStart(2, '0')}{!single && ` — ${String(page + 2).padStart(2, '0')}`}</b><i/>06</span><button type="button" onClick={() => navigate(page + step)} disabled={page >= (single ? 5 : 4) || Boolean(turn)} aria-label={single ? 'Next page' : 'Next pages'}><span>Next</span><Arrow/></button></nav><span className="avr-controls-theme">{edition.theme}</span></footer>
    <p id={statusId} className="avr-sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
  </section>;
}
