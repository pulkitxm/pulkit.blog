function t(r,l,o){for(let n of document.querySelectorAll(r))if(n instanceof l)o(n)}function i(r,l,o){return[...r.querySelectorAll(l)].filter((n)=>n instanceof o)}function e(r,l,o){let n=r.querySelector(l);return n instanceof o?n:void 0}function s(r,l,o){let n=e(r,l,o);if(!n)throw Error(`Missing ${l}`);return n}
export{t,i,e,s};
