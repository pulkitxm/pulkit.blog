import{CA,BA}from"./index-w9041dxv.js";import{A,o,Q,I,C,JA,OA}from"./index.js";import{cA,B}from"./index-8jvjtsmp.js";var E=(e,t)=>{if(!t)return!1;else if(e===t)return!0;else return E(e,t.parentElement)};var x=(e)=>{if(e.pointerType==="mouse")return typeof e.button!=="number"||e.button<=0;else return e.isPrimary!==!1};var H=new Set(["BUTTON","INPUT","SELECT","TEXTAREA","A"]);function h(e){return H.has(e.tagName)||e.isContentEditable===!0}var m=new WeakSet;function P(e){return(t)=>{if(t.key!=="Enter")return;e(t)}}function y(e,t){e.dispatchEvent(new PointerEvent("pointer"+t,{isPrimary:!0,bubbles:!0}))}var T=(e,t)=>{let n=e.currentTarget;if(!n)return;let i=P(()=>{if(m.has(n))return;y(n,"down");let a=P(()=>{y(n,"up")}),l=()=>y(n,"cancel");n.addEventListener("keyup",a,t),n.addEventListener("blur",l,t)});n.addEventListener("keydown",i,t),n.addEventListener("blur",()=>n.removeEventListener("keydown",i),t)};function k(e){return x(e)&&!CA()}var v=new WeakSet;function L(e,t,n={}){let[i,a,l]=BA(e,n),f=(r)=>{let s=r.currentTarget;if(!k(r))return;if(v.has(r))return;if(m.add(s),n.stopPropagation)v.add(r);let u=t(s,r),d={...a,capture:!0},b=(c,g)=>{if(window.removeEventListener("pointerup",p,d),window.removeEventListener("pointercancel",w,d),m.has(s))m.delete(s);if(!k(c))return;if(typeof u==="function")u(c,{success:g})},p=(c)=>{b(c,s===window||s===document||n.useGlobalTarget||E(s,c.target))},w=(c)=>{b(c,!1)};window.addEventListener("pointerup",p,d),window.addEventListener("pointercancel",w,d)};return i.forEach((r)=>{if((n.useGlobalTarget?window:r).addEventListener("pointerdown",f,a),cA(r)){if(r.addEventListener("focus",(u)=>T(u,a)),!h(r)&&!r.hasAttribute("tabindex"))r.tabIndex=0}}),l}var te=(e)=>{let t=!1,n=C();e.innerHTML=I`<div class="flex size-full flex-col items-center justify-center gap-6 p-4">
    <p class="text-center text-neutral-600 text-sm dark:text-neutral-400">Click the heart</p>
    <div data-ref="wrapper">
      <button
        type="button"
        data-ref="button"
        class="${o({className:"size-16 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700",size:"icon",variant:"ghost"})}"
        aria-label="Like"
      >
        <span data-ref="heart" class="inline-flex size-8">${Q(JA,"size-8")}</span>
      </button>
    </div>
    <div class="max-w-xs space-y-1 text-center text-neutral-600 text-xs dark:text-neutral-400">
      <p><span class="font-medium text-neutral-700 dark:text-neutral-300">Feedback:</span> The button compresses on press</p>
      <p><span class="font-medium text-neutral-700 dark:text-neutral-300">Delight:</span> The heart bounces and fills with color</p>
    </div>
  </div>`;let i=A(e,"wrapper",HTMLDivElement),a=A(e,"button",HTMLButtonElement),l=A(e,"heart",HTMLSpanElement),f=getComputedStyle(l).color,r=1,s,u;function d(){l.style.color=f,l.style.transform=r===1?"none":`scale(${r})`}function b(){a.setAttribute("aria-label",t?"Unlike":"Like"),l.innerHTML=Q(t?OA:JA,"size-8"),s?.stop(),u?.stop(),s=B(f,t?"#ef4444":"#a3a3a3",{duration:0.3,onUpdate:(p)=>{f=p,d()}}),u=B(r,t?[1,1.3,1]:1,{duration:0.3,onUpdate:(p)=>{r=p,d()}})}return n.add(L(i,()=>(B(i,{scale:0.9}),()=>B(i,{scale:1})))),a.addEventListener("click",()=>{t=!t,b()}),b(),n.add(()=>{s?.stop(),u?.stop()}),{destroy:n.dispose}};export{te as mount};
