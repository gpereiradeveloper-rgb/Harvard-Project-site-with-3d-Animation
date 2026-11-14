import React from 'react';
import './ArchiveEditorial.css';

function DirectionArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 5 14 14M6 19h13V6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/** Editorial overlays designed in Figma; opacity follows the existing journey clock. */
export default function ArchiveEditorial({phase = 'world', className = ''}) {
  return (
    <>
      <aside className={`archive-editorial archive-editorial--world ${className}`} aria-hidden={phase !== 'world'}>
        <p className="archive-editorial__index"><span>02</span>The atelier of ideas</p>
        <h2 className="archive-editorial__title">Knowledge<br /><em>comes to life.</em></h2>
        <p className="archive-editorial__description">Books arrive. Ideas circulate.<br />Knowledge finds its place.</p>
        <p className="archive-editorial__direction"><span>Scroll to explore</span><DirectionArrow /></p>
      </aside>
      <aside className={`archive-editorial archive-editorial--passage ${className}`} aria-hidden={phase !== 'passage'}>
        <p className="archive-editorial__index"><span>03</span>Between pages</p>
        <h2 className="archive-editorial__title">One page.<br /><em>New worlds.</em></h2>
        <p className="archive-editorial__description">Between memories and discoveries,<br />every volume opens a path.</p>
        <p className="archive-editorial__direction"><span>Continue to the album</span><DirectionArrow /></p>
      </aside>
    </>
  );
}
