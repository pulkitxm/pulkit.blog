import{D,A,e,g,Q,I,sA,ZA}from"./index.js";import{B}from"./index-8jvjtsmp.js";var r={damping:25,stiffness:300,type:"spring"},a=(i)=>`<div data-slot="skeleton" class="${e("animate-pulse rounded-md bg-accent",i)}"></div>`,y=(i)=>{let l=!1,n,o;i.innerHTML=I`<div data-ref="container" class="relative flex h-full min-h-48 w-full items-center justify-center overflow-hidden">
    ${g({label:Q(sA,"size-4"),attrs:'data-ref="toggle"'})}
  </div>`;let u=A(i,"container",HTMLDivElement),d=A(i,"toggle",HTMLButtonElement),c=document.createTextNode("Open ");d.append(c,document.createTextNode("Settings"));function p(){let t=document.createElement("div");return t.className="absolute top-0 right-0 flex h-full w-52 flex-col border-neutral-300 border-l bg-white dark:border-neutral-700 dark:bg-neutral-900",t.innerHTML=I`<div class="flex items-center justify-between border-neutral-300 border-b p-3 dark:border-neutral-700">
        <span class="font-medium text-sm">Settings</span>
        ${g({variant:"ghost",size:"icon",className:"size-7",label:Q(ZA,"size-4"),attrs:"data-close"})}
      </div>
      <div class="flex flex-col gap-4 p-4">
        <div class="space-y-2">${a("h-3 w-16 animate-none")}${a("h-8 w-full animate-none")}</div>
        <div class="space-y-2">${a("h-3 w-20 animate-none")}${a("h-8 w-full animate-none")}</div>
        <div class="space-y-2">${a("h-3 w-14 animate-none")}${a("h-8 w-full animate-none")}</div>
      </div>`,D(t,"[data-close]",HTMLButtonElement).addEventListener("click",()=>m(!1)),t}function m(t){if(l=t,c.textContent=`${l?"Close":"Open"} `,l){if(n&&o){o=void 0,B(n,{x:0},r);return}n=p(),u.append(n),B(n,{x:"100%"},{duration:0}),B(n,{x:0},r)}else if(n){let f=n,s=B(f,{x:"100%"},r);o=s,s.then(()=>{if(o===s)o=void 0,n=void 0,f.remove()})}}d.addEventListener("click",()=>m(!l))};export{y as mount};
