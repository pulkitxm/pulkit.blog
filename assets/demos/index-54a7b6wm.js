import{sA}from"./index-0gt3gf92.js";var t={x:!1,y:!1};function P(){return t.x||t.y}function Z(n,r){let o=sA(n),e=new AbortController,s={passive:!0,...r,signal:e.signal};return[o,s,()=>e.abort()]}
export{P,Z};
