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
export default defineConfig({base,plugins:[rebase]});
