import{A,a,e,g,Q,I,mA,YA,HA,tA,XA,VA}from"./index.js";import{B}from"./index-8jvjtsmp.js";var x=[{color:"bg-blue-500",description:"23 files, 1.2 GB",icon:HA,id:1,title:"Documents"},{color:"bg-green-500",description:"847 files, 4.8 GB",icon:YA,id:2,title:"Photos"},{color:"bg-purple-500",description:"156 files, 2.1 GB",icon:VA,id:3,title:"Music"},{color:"bg-orange-500",description:"12 folders",icon:mA,id:4,title:"Projects"}],d={duration:0.1};function b(t){return I`<div class="flex h-full flex-col">
    <div class="flex items-center gap-2 border-neutral-200 border-b p-3 dark:border-neutral-700">
      ${g({variant:"ghost",size:"icon",className:"size-7 cursor-pointer",label:Q(XA,"size-4"),attrs:"data-back"})}
      <div class="${e("flex size-6 items-center justify-center rounded text-white",t.color)}">${Q(t.icon,"size-4")}</div>
      <span class="font-medium text-sm">${t.title}</span>
    </div>
    <div class="flex flex-1 flex-col gap-3 p-4">
      <div class="text-neutral-600 text-xs dark:text-neutral-300">${t.description}</div>
      <div class="space-y-2">
        ${[1,2,3].map(()=>`<div class="flex items-center gap-2 rounded-md bg-neutral-100 p-2 dark:bg-neutral-800">
            <div class="size-8 rounded bg-neutral-200 dark:bg-neutral-700"></div>
            <div class="flex-1">
              <div class="h-3 w-24 rounded bg-neutral-200 dark:bg-neutral-700"></div>
              <div class="mt-1 h-2 w-16 rounded bg-neutral-200 dark:bg-neutral-700"></div>
            </div>
          </div>`)}
      </div>
    </div>
  </div>`}function h(){return x.map((t)=>g({variant:"ghost",className:"group min-h-12 justify-start gap-3 rounded-none border-neutral-200 border-b px-3 py-3 font-normal last:border-b-0",label:I`<div class="${e("flex size-8 items-center justify-center rounded text-white",t.color)}">${Q(t.icon,"size-4")}</div>
        <div class="flex-1">
          <div class="font-medium text-sm">${t.title}</div>
          <div class="text-neutral-600 text-xs dark:text-neutral-300">${t.description}</div>
        </div>
        ${Q(tA,"size-4 text-neutral-400 transition-transform group-hover:translate-x-0.5")}`,attrs:`data-item="${t.id}"`}))}function v(t,i,l){return I`<div class="flex items-center justify-between border-neutral-200 border-b p-2 dark:border-neutral-700">
    <span class="font-medium text-xs">${t}</span>
    ${g({variant:"ghost",size:"sm",className:"h-6 cursor-pointer text-xs",label:i,attrs:`data-ref="${l}"`})}
  </div>`}function p(t){let i=document.createElement("div");if(t)i.className="flex-1",i.innerHTML=b(t);else i.className="flex flex-col",i.innerHTML=h().join("");return i}var j=(t)=>{let i=null,l=null,c=Promise.resolve();t.innerHTML=I`<div data-ref="plain" class="${e("flex h-full w-full flex-col overflow-hidden","hidden")}">
      ${v("Without Animation","Try Animated","toAnimated")}
      <div data-ref="plainBody" class="contents"></div>
    </div>
    <div data-ref="animated" class="${e("flex h-full w-full flex-col overflow-hidden")}">
      ${v("With Animation","Try Without","toPlain")}
    </div>`;let L=A(t,"plain",HTMLDivElement),y=A(t,"plainBody",HTMLDivElement),o=A(t,"animated",HTMLDivElement),w=A(t,"toAnimated",HTMLButtonElement),M=A(t,"toPlain",HTMLButtonElement);function f(){y.innerHTML=i?b(i):`<div class="flex flex-col">${h().join("")}</div>`}function T(){let n=i;c=c.then(async()=>{if(l)await B(l,{opacity:0},d),l.remove();let s=p(n);s.style.opacity="0",o.append(s),l=s,await B(s,{opacity:1},d)})}function u(n){i=n,f(),T()}function m(n){L.className=e("flex h-full w-full flex-col overflow-hidden",n&&"hidden"),o.className=e("flex h-full w-full flex-col overflow-hidden",!n&&"hidden")}t.addEventListener("click",(n)=>{let s=a(n,"[data-item]",HTMLElement)?.dataset.item;if(s)u(x.find((k)=>String(k.id)===s)??null);else if(a(n,"[data-back]",Element))u(null)}),w.addEventListener("click",()=>m(!0)),M.addEventListener("click",()=>m(!1)),f();let r=p(null);l=r,o.append(r),B(r,{opacity:0},{duration:0}),B(r,{opacity:1},d)};export{j as mount};
