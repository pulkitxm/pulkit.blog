import{eA}from"./index-xr6120m0.js";import{A,a,E,g,t,I}from"./index.js";import{B}from"./index-apf7fdxr.js";var p=[["path",{d:"m12 19-7-7 7-7"}],["path",{d:"M19 12H5"}]];var v=[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5"}],["path",{d:"M10 9H8"}],["path",{d:"M16 13H8"}],["path",{d:"M16 17H8"}]];var x=[["path",{d:"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"}]];var h=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2"}],["circle",{cx:"9",cy:"9",r:"2"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"}]];var b=[["path",{d:"M9 18V5l12-2v13"}],["circle",{cx:"6",cy:"18",r:"3"}],["circle",{cx:"18",cy:"16",r:"3"}]];var M=[{color:"bg-blue-500",description:"23 files, 1.2 GB",icon:v,id:1,title:"Documents"},{color:"bg-green-500",description:"847 files, 4.8 GB",icon:h,id:2,title:"Photos"},{color:"bg-purple-500",description:"156 files, 2.1 GB",icon:b,id:3,title:"Music"},{color:"bg-orange-500",description:"12 folders",icon:x,id:4,title:"Projects"}],o={duration:0.1};function w(e){return I`<div class="flex h-full flex-col">
    <div class="flex items-center gap-2 border-neutral-200 border-b p-3 dark:border-neutral-700">
      ${g({variant:"ghost",size:"icon",className:"size-7 cursor-pointer",label:t(p,"size-4"),attrs:"data-back"})}
      <div class="${E("flex size-6 items-center justify-center rounded text-white",e.color)}">${t(e.icon,"size-4")}</div>
      <span class="font-medium text-sm">${e.title}</span>
    </div>
    <div class="flex flex-1 flex-col gap-3 p-4">
      <div class="text-neutral-600 text-xs dark:text-neutral-300">${e.description}</div>
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
  </div>`}function H(){return M.map((e)=>g({variant:"ghost",className:"group min-h-12 justify-start gap-3 rounded-none border-neutral-200 border-b px-3 py-3 font-normal last:border-b-0",label:I`<div class="${E("flex size-8 items-center justify-center rounded text-white",e.color)}">${t(e.icon,"size-4")}</div>
        <div class="flex-1">
          <div class="font-medium text-sm">${e.title}</div>
          <div class="text-neutral-600 text-xs dark:text-neutral-300">${e.description}</div>
        </div>
        ${t(eA,"size-4 text-neutral-400 transition-transform group-hover:translate-x-0.5")}`,attrs:`data-item="${e.id}"`}))}function y(e,i,l){return I`<div class="flex items-center justify-between border-neutral-200 border-b p-2 dark:border-neutral-700">
    <span class="font-medium text-xs">${e}</span>
    ${g({variant:"ghost",size:"sm",className:"h-6 cursor-pointer text-xs",label:i,attrs:`data-ref="${l}"`})}
  </div>`}function L(e){let i=document.createElement("div");if(e)i.className="flex-1",i.innerHTML=w(e);else i.className="flex flex-col",i.innerHTML=H().join("");return i}var U=(e)=>{let i=null,l=null,c=Promise.resolve();e.innerHTML=I`<div data-ref="plain" class="${E("flex h-full w-full flex-col overflow-hidden","hidden")}">
      ${y("Without Animation","Try Animated","toAnimated")}
      <div data-ref="plainBody" class="contents"></div>
    </div>
    <div data-ref="animated" class="${E("flex h-full w-full flex-col overflow-hidden")}">
      ${y("With Animation","Try Without","toPlain")}
    </div>`;let T=A(e,"plain",HTMLDivElement),k=A(e,"plainBody",HTMLDivElement),d=A(e,"animated",HTMLDivElement),z=A(e,"toAnimated",HTMLButtonElement),N=A(e,"toPlain",HTMLButtonElement);function u(){k.innerHTML=i?w(i):`<div class="flex flex-col">${H().join("")}</div>`}function D(){let n=i;c=c.then(async()=>{if(l)await B(l,{opacity:0},o),l.remove();let s=L(n);s.style.opacity="0",d.append(s),l=s,await B(s,{opacity:1},o)})}function f(n){i=n,u(),D()}function m(n){T.className=E("flex h-full w-full flex-col overflow-hidden",n&&"hidden"),d.className=E("flex h-full w-full flex-col overflow-hidden",!n&&"hidden")}e.addEventListener("click",(n)=>{let s=a(n,"[data-item]",HTMLElement)?.dataset.item;if(s)f(M.find((j)=>String(j.id)===s)??null);else if(a(n,"[data-back]",Element))f(null)}),z.addEventListener("click",()=>m(!0)),N.addEventListener("click",()=>m(!1)),u();let r=L(null);l=r,d.append(r),B(r,{opacity:0},{duration:0}),B(r,{opacity:1},o)};export{U as mount};
