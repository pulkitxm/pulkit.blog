import{BA,QA}from"./index-5chy28jj.js";import{A,e,I,C}from"./index.js";import{nA,B}from"./index-apf7fdxr.js";var E=(t,n)=>{if(!n)return!1;else if(t===n)return!0;else return E(t,n.parentElement)};var h=(t)=>{if(t.pointerType==="mouse")return typeof t.button!=="number"||t.button<=0;else return t.isPrimary!==!1};var S=new Set(["BUTTON","INPUT","SELECT","TEXTAREA","A"]);function x(t){return S.has(t.tagName)||t.isContentEditable===!0}var m=new WeakSet;function k(t){return(n)=>{if(n.key!=="Enter")return;t(n)}}function w(t,n){t.dispatchEvent(new PointerEvent("pointer"+n,{isPrimary:!0,bubbles:!0}))}var P=(t,n)=>{let r=t.currentTarget;if(!r)return;let i=k(()=>{if(m.has(r))return;w(r,"down");let a=k(()=>{w(r,"up")}),l=()=>w(r,"cancel");r.addEventListener("keyup",a,n),r.addEventListener("blur",l,n)});r.addEventListener("keydown",i,n),r.addEventListener("blur",()=>r.removeEventListener("keydown",i),n)};function v(t){return h(t)&&!BA()}var T=new WeakSet;function L(t,n,r={}){let[i,a,l]=QA(t,r),f=(o)=>{let s=o.currentTarget;if(!v(o))return;if(T.has(o))return;if(m.add(s),r.stopPropagation)T.add(o);let u=n(s,o),d={...a,capture:!0},b=(c,g)=>{if(window.removeEventListener("pointerup",p,d),window.removeEventListener("pointercancel",y,d),m.has(s))m.delete(s);if(!v(c))return;if(typeof u==="function")u(c,{success:g})},p=(c)=>{b(c,s===window||s===document||r.useGlobalTarget||E(s,c.target))},y=(c)=>{b(c,!1)};window.addEventListener("pointerup",p,d),window.addEventListener("pointercancel",y,d)};return i.forEach((o)=>{if((r.useGlobalTarget?window:o).addEventListener("pointerdown",f,a),nA(o)){if(o.addEventListener("focus",(u)=>P(u,a)),!x(o)&&!o.hasAttribute("tabindex"))o.tabIndex=0}}),l}var Z=(t)=>{let n=!1,r=C();t.innerHTML=I`<div class="flex size-full flex-col items-center justify-center gap-6 p-4">
    <p class="text-center text-neutral-600 text-sm dark:text-neutral-400">Click the heart</p>
    <div data-ref="wrapper">
      <button
        type="button"
        data-ref="button"
        class="${e({className:"size-16 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700",size:"icon",variant:"ghost"})}"
        aria-label="Like"
      >
        <svg data-ref="heart" class="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>
    <div class="max-w-xs space-y-1 text-center text-neutral-600 text-xs dark:text-neutral-400">
      <p><span class="font-medium text-neutral-700 dark:text-neutral-300">Feedback:</span> The button compresses on press</p>
      <p><span class="font-medium text-neutral-700 dark:text-neutral-300">Delight:</span> The heart bounces and fills with color</p>
    </div>
  </div>`;let i=A(t,"wrapper",HTMLDivElement),a=A(t,"button",HTMLButtonElement),l=A(t,"heart",SVGSVGElement),f=getComputedStyle(l).color,o=1,s,u;function d(){l.style.color=f,l.style.transform=o===1?"none":`scale(${o})`}function b(){a.setAttribute("aria-label",n?"Unlike":"Like"),l.setAttribute("fill",n?"currentColor":"none"),s?.stop(),u?.stop(),s=B(f,n?"#ef4444":"#a3a3a3",{duration:0.3,onUpdate:(p)=>{f=p,d()}}),u=B(o,n?[1,1.3,1]:1,{duration:0.3,onUpdate:(p)=>{o=p,d()}})}return r.add(L(i,()=>(B(i,{scale:0.9}),()=>B(i,{scale:1})))),a.addEventListener("click",()=>{n=!n,b()}),b(),r.add(()=>{s?.stop(),u?.stop()}),{destroy:r.dispose}};export{Z as mount};
