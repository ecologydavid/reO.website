import React from 'react';
import SiteHeader from '../components/site/SiteHeader.jsx';
import SiteFooter from '../components/site/SiteFooter.jsx';
import LogoWall from '../components/site/LogoWall.jsx';
import ContentLibrary from './ContentLibrary.jsx';
import ContentReader from './ContentReader.jsx';
import {findPage,isIndexPage} from './catalogue.js';
import '../components/home.css';
import './content.css';
export default function ContentSite({route}){const page=route.kind==='read'?findPage(route.path):null;const category=page?.category==='materials'?'materials':page?.category==='cases'?'cases':page?.category==='journal'?'journal':'products';return <div className="folio-home content-site"><a className="folio-skip" href="#main-content" onClick={e=>{e.preventDefault();document.getElementById('main-content')?.focus()}}>跳至主要內容</a><SiteHeader/><div id="main-content" tabIndex={-1}>{route.kind==='brands'?<LogoWall standalone/>:route.kind==='read'?(page&&isIndexPage(page)?<ContentLibrary category={category}/>:<ContentReader path={route.path}/>):<ContentLibrary category={route.category} filter={route.filter}/>}</div><SiteFooter/></div>}
