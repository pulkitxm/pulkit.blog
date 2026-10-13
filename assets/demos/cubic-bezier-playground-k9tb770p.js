import{iA,EA}from"./index-r42bkx1s.js";import{A,s,n,e,o,g,Q,I,C,eA,z,fA,GA}from"./index.js";var L=[{name:"linear",p1:{x:0,y:0},p2:{x:1,y:1}},{name:"ease",p1:{x:0.25,y:0.1},p2:{x:0.25,y:1}},{name:"ease-out",p1:{x:0,y:0},p2:{x:0.58,y:1}},{name:"ease-in",p1:{x:0.42,y:0},p2:{x:1,y:1}},{name:"ease-in-out",p1:{x:0.42,y:0},p2:{x:0.58,y:1}},{name:"snappy",p1:{x:0.16,y:1},p2:{x:0.3,y:1}},{name:"bounce",p1:{x:0.34,y:1.56},p2:{x:0.64,y:1}}],l=176,M=24,S=l*0.35,G=l+M*2+S*2,h=M+S,E=M+S,y=h,u=E+l,k=h+l,w=E;function xe(t){return o({className:e("h-8 rounded-md px-2.5 py-1 font-mono text-xs transition-colors",t?"bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300":"bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700")})}function fe(t,i,c){return Math.abs(t.p1.x-i.x)<0.01&&Math.abs(t.p1.y-i.y)<0.01&&Math.abs(t.p2.x-c.x)<0.01&&Math.abs(t.p2.y-c.y)<0.01}function P(t,i,c,p){t.setAttribute(i,String(y+p.x*l)),t.setAttribute(c,String(u-p.y*l))}var K="cursor-grab stroke-2 stroke-white opacity-75 transition-transform hover:opacity-100 active:cursor-grabbing dark:stroke-neutral-900",V="fill-neutral-400 text-[10px] dark:fill-neutral-500",we=(t)=>{let i={x:0.25,y:0.1},c={x:0.25,y:1},p=!1,v=0,f=null,m=C(),H=m.slot(),Z=m.slot(),j=GA(m,()=>x());t.innerHTML=I`<div class="flex size-full flex-col items-center justify-center p-4 sm:p-6">
    <div class="flex w-full max-w-3xl flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
      <div class="flex w-full min-w-0 flex-1 items-center justify-center">
        <svg data-ref="svg" viewBox="0 0 ${G} ${G}" class="aspect-square h-auto w-full max-w-64 cursor-crosshair touch-none overflow-visible lg:max-w-80" role="img" aria-label="Interactive cubic bezier curve editor">
          <title>Cubic Bezier Curve Editor</title>
          <defs>
            <pattern id="grid" width="${l/4}" height="${l/4}" patternUnits="userSpaceOnUse" x="${h}" y="${E}">
              <path d="M ${l/4} 0 L 0 0 0 ${l/4}" fill="none" stroke="currentColor" stroke-width="0.5" class="text-neutral-200 dark:text-neutral-800"></path>
            </pattern>
          </defs>
          <rect x="${h}" y="${E}" width="${l}" height="${l}" fill="url(#grid)"></rect>
          <rect x="${h}" y="${E}" width="${l}" height="${l}" fill="none" stroke="currentColor" stroke-width="1" class="text-neutral-300 dark:text-neutral-700"></rect>
          <line x1="${y}" y1="${u}" x2="${k}" y2="${w}" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="text-neutral-300 dark:text-neutral-600"></line>
          <line data-ref="line1" x1="${y}" y1="${u}" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"></line>
          <line data-ref="line2" x1="${k}" y1="${w}" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"></line>
          <path data-ref="curve" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-linecap="round"></path>
          <circle cx="${y}" cy="${u}" r="5" class="fill-neutral-400 dark:fill-neutral-500"></circle>
          <circle cx="${k}" cy="${w}" r="5" class="fill-neutral-400 dark:fill-neutral-500"></circle>
          <circle data-ref="ball" r="6" class="fill-violet-500" style="filter: drop-shadow(0 2px 4px rgba(139, 92, 246, 0.4)); display: none"></circle>
          <circle data-ref="handle1" data-point="p1" r="10" class="${e("fill-pink-500",K)}"></circle>
          <circle data-ref="handle2" data-point="p2" r="10" class="${e("fill-cyan-500",K)}"></circle>
          <text x="${h-8}" y="${u+4}" class="${V}" text-anchor="end">0</text>
          <text x="${k}" y="${u+14}" class="${V}" text-anchor="middle">1</text>
          <text x="${h-8}" y="${w+4}" class="${V}" text-anchor="end">1</text>
        </svg>
      </div>
      <div class="flex w-full shrink-0 flex-col gap-4 sm:w-64 lg:w-72">
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap justify-center gap-1.5 sm:justify-start">
            ${L.map((a,d)=>`<button type="button" data-preset="${d}">${a.name}</button>`)}
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
            ${g({variant:"outline",size:"icon",label:Q(fA,"size-4"),attrs:'data-ref="reset" title="Reset"'})}
          </div>
        </div>
        <div class="flex w-full items-center gap-2">
          <code data-ref="code" class="min-w-0 flex-1 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-center font-mono text-neutral-700 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"></code>
          ${g({variant:"outline",size:"icon",label:Q(eA,"size-4"),attrs:'data-ref="copy" title="Copy to clipboard"'})}
        </div>
      </div>
    </div>
  </div>`;let _=A(t,"svg",SVGSVGElement),ee=A(t,"line1",SVGLineElement),te=A(t,"line2",SVGLineElement),ne=A(t,"curve",SVGPathElement),T=A(t,"ball",SVGCircleElement),B=A(t,"handle1",SVGCircleElement),F=A(t,"handle2",SVGCircleElement),ae=A(t,"label1",HTMLSpanElement),le=A(t,"label2",HTMLSpanElement),N=A(t,"box",HTMLDivElement),X=A(t,"play",HTMLButtonElement),se=A(t,"reset",HTMLButtonElement),re=A(t,"code",HTMLElement),Y=A(t,"copy",HTMLButtonElement),D=s(t,"[data-preset]",HTMLButtonElement);function R(){return`cubic-bezier(${i.x.toFixed(2)}, ${i.y.toFixed(2)}, ${c.x.toFixed(2)}, ${c.y.toFixed(2)})`}function ie(){P(ee,"x2","y2",i),P(te,"x2","y2",c);let a=y+i.x*l,d=u-i.y*l,r=y+c.x*l,b=u-c.y*l;ne.setAttribute("d",`M ${y} ${u} C ${a} ${d}, ${r} ${b}, ${k} ${w}`),P(B,"cx","cy",i),P(F,"cx","cy",c),B.style.filter=f==="p1"?"drop-shadow(0 0 8px rgba(236, 72, 153, 0.6))":"",F.style.filter=f==="p2"?"drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))":""}function x(){ie();let a=iA(v,[i.x,i.y,c.x,c.y]);T.style.display=p?"":"none",T.setAttribute("cx",String(y+v*l)),T.setAttribute("cy",String(u-a*l));let d=L.find((r)=>fe(r,i,c));D.forEach((r,b)=>{r.className=xe(d===L[b])}),ae.textContent=`(${i.x.toFixed(2)}, ${i.y.toFixed(2)})`,le.textContent=`(${c.x.toFixed(2)}, ${c.y.toFixed(2)})`,N.style.left=`calc(12px + (100% - 48px) * ${a})`,N.style.transition=p?"none":"left 0.1s ease-out",X.disabled=p,re.textContent=R(),Y.innerHTML=Q(j.copied?z:eA,"size-4")}function U(){H.cancel(),p=!0,v=0,x(),EA(H,{duration:1000,onUpdate(a){if(v=a,a>=1)p=!1;x()}})}function q(){H.cancel(),p=!1,v=0,x()}function oe(a,d){let r=_.getBoundingClientRect(),b=r.width/G,ce=(M+S)*b,de=(M+S)*b,J=l*b,ue=(a-r.left-ce)/J,pe=1-(d-r.top-de)/J;return{x:Math.max(0,Math.min(1,ue)),y:Math.max(-0.5,Math.min(1.5,pe))}}function W(a,d){let r=oe(a,d);if(f==="p1")i=r;else c=r;x()}let O=()=>{if(f)f=null,x()};for(let[a,d]of[[B,"p1"],[F,"p2"]]){let r=()=>{f=d,x()};a.addEventListener("mousedown",r),a.addEventListener("touchstart",r,{passive:!0})}return m.add(n("mousemove",(a)=>{if(f)W(a.clientX,a.clientY)})),m.add(n("mouseup",O)),m.add(n("touchmove",(a)=>{let d=a.touches[0];if(f&&d)W(d.clientX,d.clientY)})),m.add(n("touchend",O)),D.forEach((a,d)=>{a.addEventListener("click",()=>{let r=L[d];if(r)i=r.p1,c=r.p2,x()})}),X.addEventListener("click",U),se.addEventListener("click",q),Y.addEventListener("click",()=>{j.copy(R())}),x(),{replay(){q(),Z.later(U,50)},destroy:m.dispose}};export{we as mount};
