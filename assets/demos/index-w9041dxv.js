import{FA}from"./index-8jvjtsmp.js";var t={x:!1,y:!1};function CA(){return t.x||t.y}function BA(n,r){let o=FA(n),e=new AbortController,s={passive:!0,...r,signal:e.signal};return[o,s,()=>e.abort()]}
export{CA,BA};
