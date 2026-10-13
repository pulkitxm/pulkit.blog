import{X,A,a,o,I}from"./index.js";import{B}from"./index-8jvjtsmp.js";var p="bg-linear-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600",f={backdrop:{className:"fixed inset-0 z-40 bg-black/40 backdrop-blur-sm",transition:{duration:0.3}},content:I`<div data-ref="content">
      <p class="mb-3 font-medium text-sm">Memorable and expressive</p>
      <button type="button" data-close class="${o({className:`w-full ${p}`,size:"sm"})}">Got it</button>
    </div>`,modal:{animate:{opacity:1,scale:1,y:0},className:"absolute top-full left-1/2 z-50 mt-2 w-56 -translate-x-1/2 overflow-hidden rounded-2xl border border-purple-200 bg-linear-to-br from-white to-purple-50 p-4 shadow-2xl dark:border-purple-800 dark:from-neutral-800 dark:to-purple-900/20",exit:{opacity:0,scale:0.9,y:10},initial:{opacity:0,scale:0.8,y:20},transition:{duration:0.4,ease:[0.16,1,0.3,1],scale:{damping:25,stiffness:300,type:"spring"}}}},b={backdrop:{className:"fixed inset-0 z-40 bg-black/20",transition:{duration:0.15}},content:I`<p class="mb-3 text-sm">Quick and functional</p>
      <button type="button" data-close class="${o({className:"w-full",size:"sm"})}">Close</button>`,modal:{animate:{opacity:1,scale:1},className:"absolute top-full left-1/2 z-50 mt-2 w-48 -translate-x-1/2 rounded-lg border border-neutral-300 bg-white p-4 shadow-xl dark:border-neutral-600 dark:bg-neutral-800",exit:{opacity:0,scale:0.95},initial:{opacity:0,scale:0.95},transition:{duration:0.15,ease:[0.16,1,0.3,1]}}};function d(i,e){return[B(i.backdrop,{opacity:1},e.backdrop.transition),B(i.modal,e.modal.animate,e.modal.transition)]}function m(i,e){let n=null;function u(){if(n?.exiting){n.exiting=!1;for(let l of n.animations)l.stop();n.animations=d(n,e);return}if(n)return;let t=document.createElement("div");t.className=e.backdrop.className,t.style.opacity="0",t.addEventListener("click",c);let s=document.createElement("div");s.className=e.modal.className,s.innerHTML=e.content,s.addEventListener("click",(l)=>{if(a(l,"[data-close]",Element))c()}),i.append(t,s),B(s,e.modal.initial,{duration:0});let r=X(s,"content",HTMLElement);if(r)B(r,{opacity:0,y:10},{duration:0}),B(r,{opacity:1,y:0},{delay:0.1});n={animations:d({backdrop:t,modal:s},e),backdrop:t,exiting:!1,modal:s}}function c(){if(!n||n.exiting)return;let t=n;t.exiting=!0;for(let s of t.animations)s.stop();t.animations=[B(t.backdrop,{opacity:0},e.backdrop.transition),B(t.modal,e.modal.exit,e.modal.transition)],Promise.all(t.animations).then(()=>{if(n===t&&t.exiting)t.backdrop.remove(),t.modal.remove(),n=null})}return u}var g=(i)=>{i.innerHTML=I`<div class="flex size-full items-center justify-center gap-8 p-4">
    <div class="flex flex-col items-center gap-3">
      <span class="font-medium text-neutral-600 text-xs dark:text-neutral-400">Product UI</span>
      <div data-ref="product" class="relative">
        <button type="button" data-ref="productOpen" class="${o({variant:"secondary"})}">Open Modal</button>
      </div>
      <span class="text-neutral-600 text-xs dark:text-neutral-400">150ms, subtle</span>
    </div>
    <div class="h-24 w-px bg-neutral-300 dark:bg-neutral-700"></div>
    <div class="flex flex-col items-center gap-3">
      <span class="font-medium text-neutral-600 text-xs dark:text-neutral-400">Marketing Page</span>
      <div data-ref="marketing" class="relative">
        <button type="button" data-ref="marketingOpen" class="${o({className:p})}">Learn More</button>
      </div>
      <span class="text-neutral-600 text-xs dark:text-neutral-400">400ms, expressive</span>
    </div>
  </div>`;let e=m(A(i,"product",HTMLDivElement),b),n=m(A(i,"marketing",HTMLDivElement),f);A(i,"productOpen",HTMLButtonElement).addEventListener("click",e),A(i,"marketingOpen",HTMLButtonElement).addEventListener("click",n)};export{g as mount};
