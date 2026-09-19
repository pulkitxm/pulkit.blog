import{I,A,g}from"./index.js";import{C}from"./index-0gt3gf92.js";var y="font-medium text-neutral-700 text-xs dark:text-neutral-300",h="font-mono text-neutral-600 text-xs dark:text-neutral-300",L="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-neutral-900 dark:bg-neutral-700 dark:accent-neutral-100",m=0;function x({id:e,label:a,key:t,value:n,min:r,max:i,step:l,unit:o=""}){return A`<div class="flex flex-col gap-1.5">
    <div class="flex items-center justify-between">
      <label for="${e}" class="${y}">${a}</label>
      <span class="${h}"><span data-ref="${t}Value">${n}</span>${o}</span>
    </div>
    <input id="${e}" data-key="${t}" type="range" min="${r}" max="${i}" step="${l}" value="${n}" class="${L}" />
  </div>`}function E(e){return(JSON.parse(e.getRootNode().host?.dataset.frame??"{}").focusCode??!0)&&window.innerWidth<1024}function z(e){m+=1;let a=`perceptual-duration-${m}`,t={duration:0.5,bounce:0.2},n=!1,r=0,i=40,l=16;e.innerHTML=A`<div class="flex h-full w-full flex-col items-center justify-center gap-6 p-6">
    <div class="w-full max-w-sm space-y-4">
      ${x({id:`${a}-duration`,label:"Duration",key:"duration",value:0.5,min:0.1,max:1.5,step:0.05,unit:"s"})}
      ${x({id:`${a}-bounce`,label:"Bounce",key:"bounce",value:0.2,min:0,max:0.5,step:0.05})}
    </div>
    <div data-ref="container" class="relative h-16 w-full max-w-sm rounded-lg bg-neutral-100 dark:bg-neutral-800">
      <div data-ref="box" class="absolute top-1/2 left-4 h-10 w-10 -translate-y-1/2 rounded-lg bg-orange-500 shadow-lg"></div>
    </div>
    ${I({className:"w-32",label:"Animate",attrs:'data-ref="animateButton"'})}
    <div class="rounded-md bg-neutral-100 p-3 font-mono text-xs dark:bg-neutral-800">
      <span class="text-neutral-600 dark:text-neutral-300">transition:</span>
      <span data-ref="code" class="text-orange-600 dark:text-orange-400"></span>
    </div>
    <p class="max-w-sm text-center text-neutral-600 text-xs dark:text-neutral-300">Apple's approach: define springs with perceptual duration and bounce instead of stiffness/damping.</p>
  </div>`;let o=g(e),{container:b,box:v,animateButton:w,code:k}=o,u=0;function f(){let s=n?r:0;if(s===u)return;u=s,C(v,{x:u},{bounce:t.bounce,duration:t.duration,type:"spring"})}function p(){k.textContent=`{ type: "spring", duration: ${t.duration}, bounce: ${t.bounce} }`}function c(){r=b.offsetWidth-i-l*2,f()}if(e.addEventListener("input",(s)=>{let d=s.target.dataset.key;if(!d)return;t[d]=Number(s.target.value),o[`${d}Value`].textContent=t[d],p()}),w.addEventListener("click",()=>{n=!n,f()}),E(e))r=-i-l*2;else c();return window.addEventListener("resize",c),p(),{destroy(){window.removeEventListener("resize",c)}}}export{z as mount};
