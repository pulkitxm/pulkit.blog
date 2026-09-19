import{u,x,X,Q,i,I,E,A,g}from"./index.js";var z=[{name:"linear",p1:{x:0,y:0},p2:{x:1,y:1}},{name:"ease",p1:{x:0.25,y:0.1},p2:{x:0.25,y:1}},{name:"ease-out",p1:{x:0,y:0},p2:{x:0.58,y:1}},{name:"ease-in",p1:{x:0.42,y:0},p2:{x:1,y:1}},{name:"ease-in-out",p1:{x:0.42,y:0},p2:{x:0.58,y:1}},{name:"snappy",p1:{x:0.16,y:1},p2:{x:0.3,y:1}},{name:"bounce",p1:{x:0.34,y:1.56},p2:{x:0.64,y:1}}],t=176,B=24,P=t*0.35,G=t+B*2+P*2,T=B+P,S=B+P,w=T,h=S+t,F=T+t,j=S;function pe(v,s,n){let l=3*s.x,p=3*(n.x-s.x)-l,o=1-l-p,k=3*s.y,f=3*(n.y-s.y)-k,C=1-k-f,L=(b)=>((o*b+p)*b+l)*b,y=v;for(let b=0;b<8;b++){let M=L(y)-v;if(Math.abs(M)<0.001)break;let Y=(3*o*y+2*p)*y+l;if(Math.abs(Y)<0.000001)break;y-=M/Y}return((C*y+f)*y+k)*y}function fe(v){return i({className:Q("h-8 rounded-md px-2.5 py-1 font-mono text-xs transition-colors",v?"bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300":"bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700")})}var le="cursor-grab stroke-2 stroke-white opacity-75 transition-transform hover:opacity-100 active:cursor-grabbing dark:stroke-neutral-900",J="fill-neutral-400 text-[10px] dark:fill-neutral-500";function me(v){let s={x:0.25,y:0.1},n={x:0.25,y:1},l=!1,p=0,o=null,k=!1,f=null,C=null,L=null;v.innerHTML=A`<div class="flex size-full flex-col items-center justify-center p-4 sm:p-6">
    <div class="flex w-full max-w-3xl flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
      <div class="flex w-full min-w-0 flex-1 items-center justify-center">
        <svg data-ref="svg" viewBox="0 0 ${G} ${G}" class="aspect-square h-auto w-full max-w-64 cursor-crosshair touch-none overflow-visible lg:max-w-80" role="img" aria-label="Interactive cubic bezier curve editor">
          <title>Cubic Bezier Curve Editor</title>
          <defs>
            <pattern id="grid" width="${t/4}" height="${t/4}" patternUnits="userSpaceOnUse" x="${T}" y="${S}">
              <path d="M ${t/4} 0 L 0 0 0 ${t/4}" fill="none" stroke="currentColor" stroke-width="0.5" class="text-neutral-200 dark:text-neutral-800"></path>
            </pattern>
          </defs>
          <rect x="${T}" y="${S}" width="${t}" height="${t}" fill="url(#grid)"></rect>
          <rect x="${T}" y="${S}" width="${t}" height="${t}" fill="none" stroke="currentColor" stroke-width="1" class="text-neutral-300 dark:text-neutral-700"></rect>
          <line x1="${w}" y1="${h}" x2="${F}" y2="${j}" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="text-neutral-300 dark:text-neutral-600"></line>
          <line data-ref="line1" x1="${w}" y1="${h}" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"></line>
          <line data-ref="line2" x1="${F}" y1="${j}" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"></line>
          <path data-ref="curve" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-linecap="round"></path>
          <circle cx="${w}" cy="${h}" r="5" class="fill-neutral-400 dark:fill-neutral-500"></circle>
          <circle cx="${F}" cy="${j}" r="5" class="fill-neutral-400 dark:fill-neutral-500"></circle>
          <circle data-ref="ball" r="6" class="fill-violet-500" style="filter: drop-shadow(0 2px 4px rgba(139, 92, 246, 0.4)); display: none"></circle>
          <circle data-ref="handle1" data-point="p1" r="10" class="${Q("fill-pink-500",le)}"></circle>
          <circle data-ref="handle2" data-point="p2" r="10" class="${Q("fill-cyan-500",le)}"></circle>
          <text x="${T-8}" y="${h+4}" class="${J}" text-anchor="end">0</text>
          <text x="${F}" y="${h+14}" class="${J}" text-anchor="middle">1</text>
          <text x="${T-8}" y="${j+4}" class="${J}" text-anchor="end">1</text>
        </svg>
      </div>
      <div class="flex w-full shrink-0 flex-col gap-4 sm:w-64 lg:w-72">
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap justify-center gap-1.5 sm:justify-start">
            ${z.map((e,a)=>`<button type="button" data-preset="${a}">${e.name}</button>`)}
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
          <code data-ref="code" class="min-w-0 flex-1 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-center font-mono text-neutral-700 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"></code>
          ${I({variant:"outline",size:"icon",label:E(x,"size-4"),attrs:'data-ref="copy" title="Copy to clipboard"'})}
        </div>
      </div>
    </div>
  </div>`;let{svg:y,line1:b,line2:M,curve:Y,ball:U,handle1:q,handle2:N,label1:ie,label2:oe,box:K,play:V,reset:ce,code:de,copy:Z}=g(v),_=[...v.querySelectorAll("[data-preset]")];function ee(){return`cubic-bezier(${s.x.toFixed(2)}, ${s.y.toFixed(2)}, ${n.x.toFixed(2)}, ${n.y.toFixed(2)})`}function c(){let e=w+s.x*t,a=h-s.y*t,r=w+n.x*t,d=h-n.y*t;b.setAttribute("x2",e),b.setAttribute("y2",a),M.setAttribute("x2",r),M.setAttribute("y2",d),Y.setAttribute("d",`M ${w} ${h} C ${e} ${a}, ${r} ${d}, ${F} ${j}`),q.setAttribute("cx",e),q.setAttribute("cy",a),N.setAttribute("cx",r),N.setAttribute("cy",d),q.style.filter=o==="p1"?"drop-shadow(0 0 8px rgba(236, 72, 153, 0.6))":"",N.style.filter=o==="p2"?"drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))":"";let H=pe(p,s,n);U.style.display=l?"":"none",U.setAttribute("cx",w+p*t),U.setAttribute("cy",h-H*t);let W=z.find((m)=>Math.abs(m.p1.x-s.x)<0.01&&Math.abs(m.p1.y-s.y)<0.01&&Math.abs(m.p2.x-n.x)<0.01&&Math.abs(m.p2.y-n.y)<0.01);_.forEach((m,D)=>{m.className=fe(W===z[D])}),ie.textContent=`(${s.x.toFixed(2)}, ${s.y.toFixed(2)})`,oe.textContent=`(${n.x.toFixed(2)}, ${n.y.toFixed(2)})`,K.style.left=`calc(12px + (100% - 48px) * ${H})`,K.style.transition=l?"none":"left 0.1s ease-out",V.disabled=l,de.textContent=ee(),Z.innerHTML=E(k?u:x,"size-4")}function O(){if(f)cancelAnimationFrame(f),f=null}function te(){O(),l=!0,p=0,c();let e=performance.now(),a=(r)=>{let d=Math.min((r-e)/1000,1);if(p=d,d<1)f=requestAnimationFrame(a);else l=!1,f=null;c()};f=requestAnimationFrame(a)}function ae(){O(),l=!1,p=0,c()}function ue(e,a){let r=y.getBoundingClientRect(),d=r.width/G,H=(B+P)*d,W=(B+P)*d,m=t*d,D=(e-r.left-H)/m,xe=1-(a-r.top-W)/m;return{x:Math.max(0,Math.min(1,D)),y:Math.max(-0.5,Math.min(1.5,xe))}}function se(e,a){let r=ue(e,a);if(o==="p1")s=r;else n=r;c()}let ne=(e)=>{if(o)se(e.clientX,e.clientY)},re=(e)=>{if(o&&e.touches[0])se(e.touches[0].clientX,e.touches[0].clientY)},R=()=>{if(o)o=null,c()};for(let e of[q,N]){let a=()=>{o=e.dataset.point,c()};e.addEventListener("mousedown",a),e.addEventListener("touchstart",a,{passive:!0})}return globalThis.addEventListener("mousemove",ne),globalThis.addEventListener("mouseup",R),globalThis.addEventListener("touchmove",re),globalThis.addEventListener("touchend",R),_.forEach((e,a)=>{e.addEventListener("click",()=>{s=z[a].p1,n=z[a].p2,c()})}),V.addEventListener("click",te),ce.addEventListener("click",ae),Z.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(ee()),k=!0,c(),clearTimeout(C),C=setTimeout(()=>{k=!1,c()},2000)}catch{k=!1}}),c(),{replay(){ae(),clearTimeout(L),L=setTimeout(te,50)},destroy(){O(),clearTimeout(C),clearTimeout(L),globalThis.removeEventListener("mousemove",ne),globalThis.removeEventListener("mouseup",R),globalThis.removeEventListener("touchmove",re),globalThis.removeEventListener("touchend",R)}}}export{me as mount};
