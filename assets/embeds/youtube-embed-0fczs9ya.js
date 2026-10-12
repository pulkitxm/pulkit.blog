function o(e){let r=document.createElement("iframe");if(r.title=e.title??"",r.className=e.className??"",e.sandbox!==void 0)r.setAttribute("sandbox",e.sandbox);if(e.allow!==void 0)r.setAttribute("allow",e.allow);if(e.referrerPolicy!==void 0)r.referrerPolicy=e.referrerPolicy;if(e.lazy)r.loading="lazy";if(e.allowFullscreen)r.allowFullscreen=!0;return r.src=e.src,r}
export{o};
