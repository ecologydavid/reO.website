// JSX factory for the whole app (vite.config.js: esbuild.jsxFactory). It is React.createElement, with one addition:
// an <a> whose href names a route in the old hash form ('#/read/pages/x') is rendered with that route's real address
// ('/pages/x/'). Components, navigation.js and page data keep the route names; only the rendered link changes.
import React from 'react';
import {toPath} from './router.js';
export function reoH(type,props,...children){
 if(type==='a'&&props&&typeof props.href==='string'&&props.href.startsWith('#/'))props={...props,href:toPath(props.href)};
 return React.createElement(type,props,...children);
}
