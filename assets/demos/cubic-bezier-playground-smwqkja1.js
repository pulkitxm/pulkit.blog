import{u,x,X,Q,i,I,E,A,g}from"./index.js";var T=[{name:"linear",p1:{x:0,y:0},p2:{x:1,y:1}},{name:"ease",p1:{x:0.25,y:0.1},p2:{x:0.25,y:1}},{name:"ease-out",p1:{x:0,y:0},p2:{x:0.58,y:1}},{name:"ease-in",p1:{x:0.42,y:0},p2:{x:1,y:1}},{name:"ease-in-out",p1:{x:0.42,y:0},p2:{x:0.58,y:1}},{name:"snappy",p1:{x:0.16,y:1},p2:{x:0.3,y:1}},{name:"bounce",p1:{x:0.34,y:1.56},p2:{x:0.64,y:1}}],t=176,B=32,P=t*0.5,G=t+B*2+P*2,C=B+P,S=B+P,k=C,b=S+t,F=C+t,j=S;function pe(v,n,s){let l=3*n.x,p=3*(s.x-n.x)-l,o=1-l-p,w=3*n.y,f=3*(s.y-n.y)-w,L=1-w-f,M=(m)=>((o*m+p)*m+l)*m,y=v;for(let m=0;m<8;m++){let z=M(y)-v;if(Math.abs(z)<0.001)break;let Y=(3*o*y+2*p)*y+l;if(Math.abs(Y)<0.000001)break;y-=z/Y}return((L*y+f)*y+w)*y}function fe(v){return i({className:Q("rounded-md px-2.5 py-1 font-mono text-xs transition-colors",v?"bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300":"bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700")})}var le="cursor-grab stroke-2 stroke-white opacity-75 transition-transform hover:opacity-100 active:cursor-grabbing dark:stroke-neutral-900",J="fill-neutral-400 text-[10px] dark:fill-neutral-500";function he(v){let n={x:0.25,y:0.1},s={x:0.25,y:1},l=!1,p=0,o=null,w=!1,f=null,L=null,M=null;v.innerHTML=A`<div class="flex size-full flex-col items-center justify-center p-4 sm:p-6">
    <div class="flex h-full w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8 lg:gap-10">
      <div class="flex h-full flex-1 items-center justify-center">
        <svg data-ref="svg" viewBox="0 0 ${G} ${G}" class="h-full max-h-45 w-auto cursor-crosshair touch-none sm:max-h-65 lg:max-h-80" role="img" aria-label="Interactive cubic bezier curve editor">
          <title>Cubic Bezier Curve Editor</title>
          <defs>
            <pattern id="grid" width="${t/4}" height="${t/4}" patternUnits="userSpaceOnUse" x="${C}" y="${S}">
              <path d="M ${t/4} 0 L 0 0 0 ${t/4}" fill="none" stroke="currentColor" stroke-width="0.5" class="text-neutral-200 dark:text-neutral-800"></path>
            </pattern>
          </defs>
          <rect x="${C}" y="${S}" width="${t}" height="${t}" fill="url(#grid)"></rect>
          <rect x="${C}" y="${S}" width="${t}" height="${t}" fill="none" stroke="currentColor" stroke-width="1" class="text-neutral-300 dark:text-neutral-700"></rect>
          <line x1="${k}" y1="${b}" x2="${F}" y2="${j}" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="text-neutral-300 dark:text-neutral-600"></line>
          <line data-ref="line1" x1="${k}" y1="${b}" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"></line>
          <line data-ref="line2" x1="${F}" y1="${j}" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"></line>
          <path data-ref="curve" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-linecap="round"></path>
          <circle cx="${k}" cy="${b}" r="5" class="fill-neutral-400 dark:fill-neutral-500"></circle>
          <circle cx="${F}" cy="${j}" r="5" class="fill-neutral-400 dark:fill-neutral-500"></circle>
          <circle data-ref="ball" r="6" class="fill-violet-500" style="filter: drop-shadow(0 2px 4px rgba(139, 92, 246, 0.4)); display: none"></circle>
          <circle data-ref="handle1" data-point="p1" r="10" class="${Q("fill-pink-500",le)}"></circle>
          <circle data-ref="handle2" data-point="p2" r="10" class="${Q("fill-cyan-500",le)}"></circle>
          <text x="${C-8}" y="${b+4}" class="${J}" text-anchor="end">0</text>
          <text x="${F}" y="${b+14}" class="${J}" text-anchor="middle">1</text>
          <text x="${C-8}" y="${j+4}" class="${J}" text-anchor="end">1</text>
        </svg>
      </div>
      <div class="flex h-full max-h-45 w-full shrink-0 flex-col justify-between gap-4 sm:max-h-65 sm:w-auto sm:min-w-65 lg:max-h-80 lg:min-w-70">
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap justify-center gap-1.5 sm:justify-start">
            ${T.map((e,a)=>`<button type="button" data-preset="${a}">${e.name}</button>`)}
          </div>
          <div class="flex items-center justify-center gap-4 sm:justify-start">
            <div class="flex items-center gap-2">
              <span class="inline-block size-3 rounded-full bg-pink-500 shadow-sm"></span>
              <span data-ref="label1" class="font-mono text-neutral-600 text-xs dark:text-neutral-400"></span>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-block size-3 rounded-full bg-cyan-500 shadow-sm"></span>
              <span data-ref="label2" class="font-mono text-neutral-600 text-xs dark:text-neutral-400"></span>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <div class="relative h-12 w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
            <div data-ref="box" class="absolute top-1/2 size-6 -translate-y-1/2 rounded bg-violet-500 shadow-lg"></div>
            <div class="absolute inset-y-0 left-2 w-px bg-neutral-300 dark:bg-neutral-600"></div>
            <div class="absolute inset-y-0 right-2 w-px bg-neutral-300 dark:bg-neutral-600"></div>
          </div>
          <div class="flex gap-2">
            ${I({className:"flex-1",label:"Play",attrs:'data-ref="play"'})}
            ${I({variant:"outline",size:"icon",label:E(X,"size-4"),attrs:'data-ref="reset" title="Reset"'})}
          </div>
        </div>
        <div class="flex w-full items-center gap-2">
          <code data-ref="code" class="flex-1 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-center font-mono text-neutral-700 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"></code>
          ${I({variant:"outline",size:"icon",label:E(x,"size-4"),attrs:'data-ref="copy" title="Copy to clipboard"'})}
        </div>
      </div>
    </div>
  </div>`;let{svg:y,line1:m,line2:z,curve:Y,ball:U,handle1:q,handle2:N,label1:ie,label2:oe,box:K,play:V,reset:ce,code:de,copy:Z}=g(v),_=[...v.querySelectorAll("[data-preset]")];function ee(){return`cubic-bezier(${n.x.toFixed(2)}, ${n.y.toFixed(2)}, ${s.x.toFixed(2)}, ${s.y.toFixed(2)})`}function c(){let e=k+n.x*t,a=b-n.y*t,r=k+s.x*t,d=b-s.y*t;m.setAttribute("x2",e),m.setAttribute("y2",a),z.setAttribute("x2",r),z.setAttribute("y2",d),Y.setAttribute("d",`M ${k} ${b} C ${e} ${a}, ${r} ${d}, ${F} ${j}`),q.setAttribute("cx",e),q.setAttribute("cy",a),N.setAttribute("cx",r),N.setAttribute("cy",d),q.style.filter=o==="p1"?"drop-shadow(0 0 8px rgba(236, 72, 153, 0.6))":"",N.style.filter=o==="p2"?"drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))":"";let H=pe(p,n,s);U.style.display=l?"":"none",U.setAttribute("cx",k+p*t),U.setAttribute("cy",b-H*t);let W=T.find((h)=>Math.abs(h.p1.x-n.x)<0.01&&Math.abs(h.p1.y-n.y)<0.01&&Math.abs(h.p2.x-s.x)<0.01&&Math.abs(h.p2.y-s.y)<0.01);_.forEach((h,D)=>{h.className=fe(W===T[D])}),ie.textContent=`(${n.x.toFixed(2)}, ${n.y.toFixed(2)})`,oe.textContent=`(${s.x.toFixed(2)}, ${s.y.toFixed(2)})`,K.style.left=`calc(12px + (100% - 48px) * ${H})`,K.style.transition=l?"none":"left 0.1s ease-out",V.disabled=l,de.textContent=ee(),Z.innerHTML=E(w?u:x,"size-4")}function O(){if(f)cancelAnimationFrame(f),f=null}function te(){O(),l=!0,p=0,c();let e=performance.now(),a=(r)=>{let d=Math.min((r-e)/1000,1);if(p=d,d<1)f=requestAnimationFrame(a);else l=!1,f=null;c()};f=requestAnimationFrame(a)}function ae(){O(),l=!1,p=0,c()}function ue(e,a){let r=y.getBoundingClientRect(),d=r.width/G,H=(B+P)*d,W=(B+P)*d,h=t*d,D=(e-r.left-H)/h,xe=1-(a-r.top-W)/h;return{x:Math.max(0,Math.min(1,D)),y:Math.max(-0.5,Math.min(1.5,xe))}}function ne(e,a){let r=ue(e,a);if(o==="p1")n=r;else s=r;c()}let se=(e)=>{if(o)ne(e.clientX,e.clientY)},re=(e)=>{if(o&&e.touches[0])ne(e.touches[0].clientX,e.touches[0].clientY)},R=()=>{if(o)o=null,c()};for(let e of[q,N]){let a=()=>{o=e.dataset.point,c()};e.addEventListener("mousedown",a),e.addEventListener("touchstart",a,{passive:!0})}return window.addEventListener("mousemove",se),window.addEventListener("mouseup",R),window.addEventListener("touchmove",re),window.addEventListener("touchend",R),_.forEach((e,a)=>{e.addEventListener("click",()=>{n=T[a].p1,s=T[a].p2,c()})}),V.addEventListener("click",te),ce.addEventListener("click",ae),Z.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(ee()),w=!0,c(),clearTimeout(L),L=setTimeout(()=>{w=!1,c()},2000)}catch{w=!1}}),c(),{replay(){ae(),clearTimeout(M),M=setTimeout(te,50)},destroy(){O(),clearTimeout(L),clearTimeout(M),window.removeEventListener("mousemove",se),window.removeEventListener("mouseup",R),window.removeEventListener("touchmove",re),window.removeEventListener("touchend",R)}}}export{he as mount};
