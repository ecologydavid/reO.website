import previews from '../data/case-previews.json';

export function casePreview(src, sizes) {
 const variants = previews[src.split('/').pop()];
 if (!variants) return {src};
 const url = name => `/assets/case-previews/${name}`;
 return {src:url(variants[1][1]), sizes, srcSet:variants.map(([width,name]) => `${url(name)} ${width}w`).join(', ')};
}
