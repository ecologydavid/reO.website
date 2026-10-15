import React from 'react';
const paths={
  arrow:'M4 12h16m-6-6 6 6-6 6', back:'M20 12H4m6-6-6 6 6 6',
  download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  text:'M4 5V3h16v2M12 3v18M8 21h8', image:'M3 3h18v18H3ZM3 17l6-6 5 5 3-3 4 4M16 7h.01',
  undo:'M8 4 3 9l5 5M3 9h10a7 7 0 0 1 0 14',redo:'M16 4l5 5-5 5m5-5h-10a7 7 0 0 0 0 14',
  trash:'M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7',
  copy:'M8 8h13v13H8ZM3 16V3h13', plus:'M12 4v16M4 12h16',
  close:'m5 5 14 14M5 19 19 5',menu:'M3 6h18M3 12h18M3 18h18',
  save:'M4 3h13l4 4v14H3V3ZM7 3v6h10V3M7 21v-8h10v8',
  left:'M4 4h16M4 8h10M4 12h16M4 16h10M4 20h16',
  center:'M4 4h16M7 8h10M4 12h16M7 16h10M4 20h16',
  right:'M4 4h16M10 8h10M4 12h16M10 16h10M4 20h16',
  up:'M12 20V4m-6 6 6-6 6 6',down:'M12 4v16m-6-6 6 6 6-6',
  check:'m4 12 5 5L20 6',chevronDown:'m6 9 6 6 6-6',expand:'M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5',
};
export default function Icon({name,size=20,...props}) {return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name]||paths.arrow}/></svg>}
