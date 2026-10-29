import {defineConfig} from 'vite';

// GitHub Pages serves the site under /<repo>/. Source code keeps root paths such as '/assets/x.webp'
// and '/content/images/x.webp'; for a sub-path build (BASE_PATH=/repo/) this plugin prefixes those
// string literals in every module, JSON data included. Page JSON fetched at runtime is rebased in
// catalogue.js. Dev and root deployments (base '/') are untouched.
const base=process.env.BASE_PATH||'/';
const rebase={
 name:'reo-rebase-public-paths',
 enforce:'post',
 transform(code,id){
  if(base==='/'||id.includes('node_modules')||!/\.(jsx?|mjs|json)(\?|$)/.test(id))return null;
  const next=code.replace(/(['"`])\/(assets|content)\//g,(_,quote,dir)=>`${quote}${base}${dir}/`);
  return next===code?null:{code:next,map:null};
 }
};
// SITE_URL is the public address without a trailing slash (set by the deploy workflow). It fills
// %SITE_URL% in index.html (canonical, link previews, structured data) and the build writes
// robots.txt and sitemap.xml. Routes are hash URLs, which sitemaps cannot list, so only the home page is.
const site=(process.env.SITE_URL||'').replace(/\/$/,'');
const seo={
 name:'reo-seo-files',
 transformIndexHtml:{order:'pre',handler:html=>html.replaceAll('%SITE_URL%',site)},
 generateBundle(){
  const today=new Date().toISOString().slice(0,10);
  this.emitFile({type:'asset',fileName:'robots.txt',source:`User-agent: *\nAllow: /\n${site?`\nSitemap: ${site}/sitemap.xml\n`:''}`});
  if(site)this.emitFile({type:'asset',fileName:'sitemap.xml',source:`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n <url><loc>${site}/</loc><lastmod>${today}</lastmod></url>\n</urlset>\n`});
 }
};
export default defineConfig({base,plugins:[rebase,seo]});
