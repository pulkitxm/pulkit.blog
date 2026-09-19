import{GA}from"./index-apf7fdxr.js";var t={x:!1,y:!1};function BA(){return t.x||t.y}function QA(n,r){let o=GA(n),e=new AbortController,s={passive:!0,...r,signal:e.signal};return[o,s,()=>e.abort()]}
export{BA,QA};
