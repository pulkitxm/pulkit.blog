import{BA,QA}from"./index-5chy28jj.js";import{A,g,I}from"./index.js";import{B}from"./index-apf7fdxr.js";function w(t){return!(t.pointerType==="touch"||BA())}function f(t,n,r={}){let[d,a,x]=QA(t,r);return d.forEach((s)=>{let u=!1,i=!1,o,y=()=>{s.removeEventListener("pointerleave",c)},p=(e)=>{if(o)o(e),o=void 0;y()},l=(e)=>{if(u=!1,window.removeEventListener("pointerup",l),window.removeEventListener("pointercancel",l),i)i=!1,p(e)},h=()=>{u=!0,window.addEventListener("pointerup",l,a),window.addEventListener("pointercancel",l,a)},c=(e)=>{if(e.pointerType==="touch")return;if(u){i=!0;return}p(e)},b=(e)=>{if(!w(e))return;i=!1;let m=n(s,e);if(typeof m!=="function")return;o=m,s.addEventListener("pointerleave",c,a)};s.addEventListener("pointerenter",b,a),s.addEventListener("pointerdown",h,a)}),x}var v={damping:17,stiffness:400,type:"spring"},P=(t)=>{t.innerHTML=I`<div class="mt-6 flex flex-col gap-8 p-6">
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="font-medium text-neutral-900 text-sm dark:text-neutral-100">Zone 1: No Animation (Accepted)</p>
        <span class="font-medium text-neutral-700 text-xs dark:text-neutral-300">✓</span>
      </div>
      ${g({variant:"secondary",label:"Instant Change"})}
      <p class="text-neutral-600 text-xs dark:text-neutral-400">Your brain says: "It's a computer, things change instantly. Normal."</p>
    </div>
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="font-medium text-neutral-900 text-sm dark:text-neutral-100">Zone 2: Linear Animation (Uncanny)</p>
        <span class="font-medium text-neutral-700 text-xs dark:text-neutral-300">⚠️</span>
      </div>
      ${g({variant:"secondary",className:"bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-500",label:"Linear Motion",attrs:'data-ref="linear" style="transition: all 300ms linear"'})}
      <p class="text-neutral-600 text-xs dark:text-neutral-400">Your brain says: "Wait... it moved. But something feels mechanical and wrong. Like a robot trying to act human."</p>
    </div>
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="font-medium text-neutral-900 text-sm dark:text-neutral-100">Zone 3: Spring Animation (Natural)</p>
        <span class="font-medium text-neutral-700 text-xs dark:text-neutral-300">✓</span>
      </div>
      <button data-ref="spring" class="inline-flex cursor-pointer items-center gap-2 rounded-md bg-neutral-700 px-4 py-2 font-medium text-sm text-white hover:bg-neutral-800 active:scale-95 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300" type="button">Spring Motion</button>
      <p class="text-neutral-600 text-xs dark:text-neutral-400">Your brain says: "That feels right. It's responsive, has weight, and follows physics. Natural."</p>
    </div>
  </div>`;let n=A(t,"linear",HTMLButtonElement),r=A(t,"spring",HTMLButtonElement);return n.addEventListener("mouseenter",()=>{n.style.transform="scale(1.05)"}),n.addEventListener("mouseleave",()=>{n.style.transform="scale(1)"}),{destroy:f(r,()=>(B(r,{scale:1.05},v),()=>B(r,{scale:1},v)))}};export{P as mount};
