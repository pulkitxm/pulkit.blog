import{P,Z}from"./index-54a7b6wm.js";import{i,A,g}from"./index.js";import{V,C}from"./index-0gt3gf92.js";var E=(e,t)=>{if(!t)return!1;else if(e===t)return!0;else return E(e,t.parentElement)};var h=(e)=>{if(e.pointerType==="mouse")return typeof e.button!=="number"||e.button<=0;else return e.isPrimary!==!1};var U=new Set(["BUTTON","INPUT","SELECT","TEXTAREA","A"]);function y(e){return U.has(e.tagName)||e.isContentEditable===!0}var m=new WeakSet;function k(e){return(t)=>{if(t.key!=="Enter")return;e(t)}}function w(e,t){e.dispatchEvent(new PointerEvent("pointer"+t,{isPrimary:!0,bubbles:!0}))}var v=(e,t)=>{let n=e.currentTarget;if(!n)return;let a=k(()=>{if(m.has(n))return;w(n,"down");let s=k(()=>{w(n,"up")}),l=()=>w(n,"cancel");n.addEventListener("keyup",s,t),n.addEventListener("blur",l,t)});n.addEventListener("keydown",a,t),n.addEventListener("blur",()=>n.removeEventListener("keydown",a),t)};function T(e){return h(e)&&!P()}var L=new WeakSet;function N(e,t,n={}){let[a,s,l]=Z(e,n),p=(r)=>{let o=r.currentTarget;if(!T(r))return;if(L.has(r))return;if(m.add(o),n.stopPropagation)L.add(r);let u=t(o,r),c={...s,capture:!0},b=(d,S)=>{if(window.removeEventListener("pointerup",f,c),window.removeEventListener("pointercancel",x,c),m.has(o))m.delete(o);if(!T(d))return;if(typeof u==="function")u(d,{success:S})},f=(d)=>{b(d,o===window||o===document||n.useGlobalTarget||E(o,d.target))},x=(d)=>{b(d,!1)};window.addEventListener("pointerup",f,c),window.addEventListener("pointercancel",x,c)};return a.forEach((r)=>{if((n.useGlobalTarget?window:r).addEventListener("pointerdown",p,s),V(r)){if(r.addEventListener("focus",(u)=>v(u,s)),!y(r)&&!r.hasAttribute("tabindex"))r.tabIndex=0}}),l}function Y(e){let t=!1;e.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-6 p-4">
    <p class="text-center text-neutral-600 text-sm dark:text-neutral-400">Click the heart</p>
    <div data-ref="wrapper">
      <button
        type="button"
        data-ref="button"
        class="${i({className:"size-16 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700",size:"icon",variant:"ghost"})}"
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
  </div>`;let{wrapper:n,button:a,heart:s}=g(e),l=getComputedStyle(s).color,p=1,r,o;function u(){s.style.color=l,s.style.transform=p===1?"none":`scale(${p})`}function c(){a.setAttribute("aria-label",t?"Unlike":"Like"),s.setAttribute("fill",t?"currentColor":"none"),r?.stop(),o?.stop(),r=C(l,t?"#ef4444":"#a3a3a3",{duration:0.3,onUpdate:(f)=>{l=f,u()}}),o=C(p,t?[1,1.3,1]:1,{duration:0.3,onUpdate:(f)=>{p=f,u()}})}let b=N(n,()=>(C(n,{scale:0.9}),()=>C(n,{scale:1})));return a.addEventListener("click",()=>{t=!t,c()}),c(),{destroy(){b(),r?.stop(),o?.stop()}}}export{Y as mount};
