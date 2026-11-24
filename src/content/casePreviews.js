import previews from '../data/case-previews.json';

export function casePreview(src, sizes) {
 // The build renames /assets/x.webp to /i/assets/x.<hash>.webp; the list is keyed by the original name.
 const variants = previews[src.split('/').pop().replace(/\.[0-9a-f]{10}(?=\.\w+$)/, '')];
 if (!variants) return {src};
 const url = name => `/assets/case-previews/${name}`;
 return {src:url(variants[1][1]), sizes, srcSet:variants.map(([width,name]) => `${url(name)} ${width}w`).join(', ')};
}
