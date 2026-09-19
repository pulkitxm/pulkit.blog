import{oA,sA}from"./index-4de55hnm.js";import{A,s,n,b,z,aA,E,e,g,t,I,C,pA}from"./index.js";var H=[{name:"linear",p1:{x:0,y:0},p2:{x:1,y:1}},{name:"ease",p1:{x:0.25,y:0.1},p2:{x:0.25,y:1}},{name:"ease-out",p1:{x:0,y:0},p2:{x:0.58,y:1}},{name:"ease-in",p1:{x:0.42,y:0},p2:{x:1,y:1}},{name:"ease-in-out",p1:{x:0.42,y:0},p2:{x:0.58,y:1}},{name:"snappy",p1:{x:0.16,y:1},p2:{x:0.3,y:1}},{name:"bounce",p1:{x:0.34,y:1.56},p2:{x:0.64,y:1}}],r=176,L=24,P=r*0.35,j=r+L*2+P*2,v=L+P,S=L+P,m=v,u=S+r,w=v+r,M=S;function fe(a){return e({className:E("h-8 rounded-md px-2.5 py-1 font-mono text-xs transition-colors",a?"bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300":"bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700")})}function ye(a,o,c){return Math.abs(a.p1.x-o.x)<0.01&&Math.abs(a.p1.y-o.y)<0.01&&Math.abs(a.p2.x-c.x)<0.01&&Math.abs(a.p2.y-c.y)<0.01}function T(a,o,c,p){a.setAttribute(o,String(m+p.x*r)),a.setAttribute(c,String(u-p.y*r))}var Z="cursor-grab stroke-2 stroke-white opacity-75 transition-transform hover:opacity-100 active:cursor-grabbing dark:stroke-neutral-900",N="fill-neutral-400 text-[10px] dark:fill-neutral-500",we=(a)=>{let o={x:0.25,y:0.1},c={x:0.25,y:1},p=!1,k=0,f=null,y=C(),B=y.slot(),_=y.slot(),X=pA(y,()=>x());a.innerHTML=I`<div class="flex size-full flex-col items-center justify-center p-4 sm:p-6">
    <div class="flex w-full max-w-3xl flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
      <div class="flex w-full min-w-0 flex-1 items-center justify-center">
        <svg data-ref="svg" viewBox="0 0 ${j} ${j}" class="aspect-square h-auto w-full max-w-64 cursor-crosshair touch-none overflow-visible lg:max-w-80" role="img" aria-label="Interactive cubic bezier curve editor">
          <title>Cubic Bezier Curve Editor</title>
          <defs>
            <pattern id="grid" width="${r/4}" height="${r/4}" patternUnits="userSpaceOnUse" x="${v}" y="${S}">
              <path d="M ${r/4} 0 L 0 0 0 ${r/4}" fill="none" stroke="currentColor" stroke-width="0.5" class="text-neutral-200 dark:text-neutral-800"></path>
            </pattern>
          </defs>
          <rect x="${v}" y="${S}" width="${r}" height="${r}" fill="url(#grid)"></rect>
          <rect x="${v}" y="${S}" width="${r}" height="${r}" fill="none" stroke="currentColor" stroke-width="1" class="text-neutral-300 dark:text-neutral-700"></rect>
          <line x1="${m}" y1="${u}" x2="${w}" y2="${M}" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="text-neutral-300 dark:text-neutral-600"></line>
          <line data-ref="line1" x1="${m}" y1="${u}" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"></line>
          <line data-ref="line2" x1="${w}" y1="${M}" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"></line>
          <path data-ref="curve" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-linecap="round"></path>
          <circle cx="${m}" cy="${u}" r="5" class="fill-neutral-400 dark:fill-neutral-500"></circle>
          <circle cx="${w}" cy="${M}" r="5" class="fill-neutral-400 dark:fill-neutral-500"></circle>
          <circle data-ref="ball" r="6" class="fill-violet-500" style="filter: drop-shadow(0 2px 4px rgba(139, 92, 246, 0.4)); display: none"></circle>
          <circle data-ref="handle1" data-point="p1" r="10" class="${E("fill-pink-500",Z)}"></circle>
          <circle data-ref="handle2" data-point="p2" r="10" class="${E("fill-cyan-500",Z)}"></circle>
          <text x="${v-8}" y="${u+4}" class="${N}" text-anchor="end">0</text>
          <text x="${w}" y="${u+14}" class="${N}" text-anchor="middle">1</text>
          <text x="${v-8}" y="${M+4}" class="${N}" text-anchor="end">1</text>
        </svg>
      </div>
      <div class="flex w-full shrink-0 flex-col gap-4 sm:w-64 lg:w-72">
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap justify-center gap-1.5 sm:justify-start">
            ${H.map((l,d)=>`<button type="button" data-preset="${d}">${l.name}</button>`)}
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
            ${g({className:"flex-1",label:"Play",attrs:'data-ref="play"'})}
            ${g({variant:"outline",size:"icon",label:t(aA,"size-4"),attrs:'data-ref="reset" title="Reset"'})}
          </div>
        </div>
        <div class="flex w-full items-center gap-2">
          <code data-ref="code" class="min-w-0 flex-1 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-center font-mono text-neutral-700 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"></code>
          ${g({variant:"outline",size:"icon",label:t(z,"size-4"),attrs:'data-ref="copy" title="Copy to clipboard"'})}
        </div>
      </div>
    </div>
  </div>`;let ee=A(a,"svg",SVGSVGElement),te=A(a,"line1",SVGLineElement),ne=A(a,"line2",SVGLineElement),ae=A(a,"curve",SVGPathElement),F=A(a,"ball",SVGCircleElement),G=A(a,"handle1",SVGCircleElement),V=A(a,"handle2",SVGCircleElement),le=A(a,"label1",HTMLSpanElement),se=A(a,"label2",HTMLSpanElement),Y=A(a,"box",HTMLDivElement),D=A(a,"play",HTMLButtonElement),re=A(a,"reset",HTMLButtonElement),ie=A(a,"code",HTMLElement),R=A(a,"copy",HTMLButtonElement),U=s(a,"[data-preset]",HTMLButtonElement);function q(){return`cubic-bezier(${o.x.toFixed(2)}, ${o.y.toFixed(2)}, ${c.x.toFixed(2)}, ${c.y.toFixed(2)})`}function oe(){T(te,"x2","y2",o),T(ne,"x2","y2",c);let l=m+o.x*r,d=u-o.y*r,i=m+c.x*r,h=u-c.y*r;ae.setAttribute("d",`M ${m} ${u} C ${l} ${d}, ${i} ${h}, ${w} ${M}`),T(G,"cx","cy",o),T(V,"cx","cy",c),G.style.filter=f==="p1"?"drop-shadow(0 0 8px rgba(236, 72, 153, 0.6))":"",V.style.filter=f==="p2"?"drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))":""}function x(){oe();let l=oA(k,[o.x,o.y,c.x,c.y]);F.style.display=p?"":"none",F.setAttribute("cx",String(m+k*r)),F.setAttribute("cy",String(u-l*r));let d=H.find((i)=>ye(i,o,c));U.forEach((i,h)=>{i.className=fe(d===H[h])}),le.textContent=`(${o.x.toFixed(2)}, ${o.y.toFixed(2)})`,se.textContent=`(${c.x.toFixed(2)}, ${c.y.toFixed(2)})`,Y.style.left=`calc(12px + (100% - 48px) * ${l})`,Y.style.transition=p?"none":"left 0.1s ease-out",D.disabled=p,ie.textContent=q(),R.innerHTML=t(X.copied?b:z,"size-4")}function W(){B.cancel(),p=!0,k=0,x(),sA(B,{duration:1000,onUpdate(l){if(k=l,l>=1)p=!1;x()}})}function O(){B.cancel(),p=!1,k=0,x()}function ce(l,d){let i=ee.getBoundingClientRect(),h=i.width/j,de=(L+P)*h,ue=(L+P)*h,Q=r*h,pe=(l-i.left-de)/Q,xe=1-(d-i.top-ue)/Q;return{x:Math.max(0,Math.min(1,pe)),y:Math.max(-0.5,Math.min(1.5,xe))}}function J(l,d){let i=ce(l,d);if(f==="p1")o=i;else c=i;x()}let K=()=>{if(f)f=null,x()};for(let[l,d]of[[G,"p1"],[V,"p2"]]){let i=()=>{f=d,x()};l.addEventListener("mousedown",i),l.addEventListener("touchstart",i,{passive:!0})}return y.add(n("mousemove",(l)=>{if(f)J(l.clientX,l.clientY)})),y.add(n("mouseup",K)),y.add(n("touchmove",(l)=>{let d=l.touches[0];if(f&&d)J(d.clientX,d.clientY)})),y.add(n("touchend",K)),U.forEach((l,d)=>{l.addEventListener("click",()=>{let i=H[d];if(i)o=i.p1,c=i.p2,x()})}),D.addEventListener("click",W),re.addEventListener("click",O),R.addEventListener("click",()=>{X.copy(q())}),x(),{replay(){O(),_.later(W,50)},destroy:y.dispose}};export{we as mount};
