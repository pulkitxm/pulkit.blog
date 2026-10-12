import{A,n,g,I,C}from"./index.js";import{B}from"./index-apf7fdxr.js";import{v}from"./index-9xe00pb0.js";var p=40,b=16,x=0;function E(e){return e==="duration"||e==="bounce"}function L(e){let t=JSON.parse((e instanceof HTMLElement?e.dataset.frame:void 0)??"{}"),o=typeof t==="object"&&t!==null&&"focusCode"in t?t.focusCode:void 0;return Boolean(o??!0)}function M(e){let t=e.getRootNode(),o=t instanceof ShadowRoot?t.host:t;return L(o)&&window.innerWidth<1024}var K=(e)=>{x+=1;let t=`perceptual-duration-${x}`,o={duration:0.5,bounce:0.2},r=!1,s=0,c=C();e.innerHTML=I`<div class="flex h-full w-full flex-col items-center justify-center gap-6 p-6">
    <div class="w-full max-w-sm space-y-4">
      ${v({id:`${t}-duration`,label:"Duration",key:"duration",value:0.5,min:0.1,max:1.5,step:0.05,unit:"s"})}
      ${v({id:`${t}-bounce`,label:"Bounce",key:"bounce",value:0.2,min:0,max:0.5,step:0.05,unit:""})}
    </div>
    <div data-ref="container" class="relative h-16 w-full max-w-sm rounded-lg bg-neutral-100 dark:bg-neutral-800">
      <div data-ref="box" class="absolute top-1/2 left-4 h-10 w-10 -translate-y-1/2 rounded-lg bg-orange-500 shadow-lg"></div>
    </div>
    ${g({className:"w-32",label:"Animate",attrs:'data-ref="animateButton"'})}
    <div class="rounded-md bg-neutral-100 p-3 font-mono text-xs dark:bg-neutral-800">
      <span class="text-neutral-600 dark:text-neutral-300">transition:</span>
      <span data-ref="code" class="text-orange-600 dark:text-orange-400"></span>
    </div>
    <p class="max-w-sm text-center text-neutral-600 text-xs dark:text-neutral-300">Apple's approach: define springs with perceptual duration and bounce instead of stiffness/damping.</p>
  </div>`;let y=A(e,"container",HTMLDivElement),w=A(e,"box",HTMLDivElement),h=A(e,"animateButton",HTMLButtonElement),k=A(e,"code",HTMLSpanElement),u=0;function l(){let a=r?s:0;if(a===u)return;u=a,B(w,{x:u},{bounce:o.bounce,duration:o.duration,type:"spring"})}function f(){k.textContent=`{ type: "spring", duration: ${o.duration}, bounce: ${o.bounce} }`}function m(){s=y.offsetWidth-p-b*2,l()}if(e.addEventListener("input",(a)=>{let d=a.target;if(!(d instanceof HTMLInputElement))return;let i=d.dataset.key;if(!E(i))return;o[i]=Number(d.value),A(e,`${i}Value`,HTMLSpanElement).textContent=String(o[i]),f()}),h.addEventListener("click",()=>{r=!r,l()}),M(e))s=-p-b*2;else m();return c.add(n("resize",m)),f(),{destroy:c.dispose}};export{K as mount};
