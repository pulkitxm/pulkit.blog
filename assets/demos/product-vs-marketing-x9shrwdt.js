import{i,A,g}from"./index.js";import{C}from"./index-0gt3gf92.js";var m="bg-linear-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600",d={marketing:{backdrop:{className:"fixed inset-0 z-40 bg-black/40 backdrop-blur-sm",transition:{duration:0.3}},content:A`<div data-ref="content">
      <p class="mb-3 font-medium text-sm">Memorable and expressive</p>
      <button type="button" data-close class="${i({className:`w-full ${m}`,size:"sm"})}">Got it</button>
    </div>`,modal:{animate:{opacity:1,scale:1,y:0},className:"absolute top-full left-1/2 z-50 mt-2 w-56 -translate-x-1/2 overflow-hidden rounded-2xl border border-purple-200 bg-linear-to-br from-white to-purple-50 p-4 shadow-2xl dark:border-purple-800 dark:from-neutral-800 dark:to-purple-900/20",exit:{opacity:0,scale:0.9,y:10},initial:{opacity:0,scale:0.8,y:20},transition:{duration:0.4,ease:[0.16,1,0.3,1],scale:{damping:25,stiffness:300,type:"spring"}}}},product:{backdrop:{className:"fixed inset-0 z-40 bg-black/20",transition:{duration:0.15}},content:A`<p class="mb-3 text-sm">Quick and functional</p>
      <button type="button" data-close class="${i({className:"w-full",size:"sm"})}">Close</button>`,modal:{animate:{opacity:1,scale:1},className:"absolute top-full left-1/2 z-50 mt-2 w-48 -translate-x-1/2 rounded-lg border border-neutral-300 bg-white p-4 shadow-xl dark:border-neutral-600 dark:bg-neutral-800",exit:{opacity:0,scale:0.95},initial:{opacity:0,scale:0.95},transition:{duration:0.15,ease:[0.16,1,0.3,1]}}}};function p(o,e){let a=null;function r(){if(a?.exiting){a.exiting=!1;for(let c of a.animations)c.stop();a.animations=[C(a.backdrop,{opacity:1},e.backdrop.transition),C(a.modal,e.modal.animate,e.modal.transition)];return}if(a)return;let t=document.createElement("div");t.className=e.backdrop.className,t.style.opacity="0",t.addEventListener("click",s);let n=document.createElement("div");n.className=e.modal.className,n.innerHTML=e.content,n.addEventListener("click",(c)=>{if(c.target.closest("[data-close]"))s()}),o.append(t,n),C(n,e.modal.initial,{duration:0});let{content:l}=g(n);if(l)C(l,{opacity:0,y:10},{duration:0}),C(l,{opacity:1,y:0},{delay:0.1});a={animations:[C(t,{opacity:1},e.backdrop.transition),C(n,e.modal.animate,e.modal.transition)],backdrop:t,exiting:!1,modal:n}}function s(){if(!a||a.exiting)return;let t=a;t.exiting=!0;for(let n of t.animations)n.stop();t.animations=[C(t.backdrop,{opacity:0},e.backdrop.transition),C(t.modal,e.modal.exit,e.modal.transition)],Promise.all(t.animations).then(()=>{if(a===t&&t.exiting)t.backdrop.remove(),t.modal.remove(),a=null})}return{open:r}}function b(o){o.innerHTML=A`<div class="flex size-full items-center justify-center gap-8 p-4">
    <div class="flex flex-col items-center gap-3">
      <span class="font-medium text-neutral-600 text-xs dark:text-neutral-400">Product UI</span>
      <div data-ref="product" class="relative">
        <button type="button" data-ref="productOpen" class="${i({variant:"secondary"})}">Open Modal</button>
      </div>
      <span class="text-neutral-600 text-xs dark:text-neutral-400">150ms, subtle</span>
    </div>
    <div class="h-24 w-px bg-neutral-300 dark:bg-neutral-700"></div>
    <div class="flex flex-col items-center gap-3">
      <span class="font-medium text-neutral-600 text-xs dark:text-neutral-400">Marketing Page</span>
      <div data-ref="marketing" class="relative">
        <button type="button" data-ref="marketingOpen" class="${i({className:m})}">Learn More</button>
      </div>
      <span class="text-neutral-600 text-xs dark:text-neutral-400">400ms, expressive</span>
    </div>
  </div>`;let{product:e,productOpen:a,marketing:r,marketingOpen:s}=g(o),t=p(e,d.product),n=p(r,d.marketing);a.addEventListener("click",t.open),s.addEventListener("click",n.open)}export{b as mount};
