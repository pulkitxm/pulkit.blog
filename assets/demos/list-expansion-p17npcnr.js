import{j}from"./index-hmfmqxyn.js";import{Q,I,E,A,g}from"./index.js";import{C}from"./index-0gt3gf92.js";var p=[["path",{d:"m12 19-7-7 7-7"}],["path",{d:"M19 12H5"}]];var v=[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5"}],["path",{d:"M10 9H8"}],["path",{d:"M16 13H8"}],["path",{d:"M16 17H8"}]];var x=[["path",{d:"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"}]];var m=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2"}],["circle",{cx:"9",cy:"9",r:"2"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"}]];var h=[["path",{d:"M9 18V5l12-2v13"}],["circle",{cx:"6",cy:"18",r:"3"}],["circle",{cx:"18",cy:"16",r:"3"}]];var M=[{color:"bg-blue-500",description:"23 files, 1.2 GB",icon:v,id:1,title:"Documents"},{color:"bg-green-500",description:"847 files, 4.8 GB",icon:m,id:2,title:"Photos"},{color:"bg-purple-500",description:"156 files, 2.1 GB",icon:h,id:3,title:"Music"},{color:"bg-orange-500",description:"12 folders",icon:x,id:4,title:"Projects"}],s={duration:0.1};function b(e){return A`<div class="flex h-full flex-col">
    <div class="flex items-center gap-2 border-neutral-200 border-b p-3 dark:border-neutral-700">
      ${I({variant:"ghost",size:"icon",className:"size-7 cursor-pointer",label:E(p,"size-4"),attrs:"data-back"})}
      <div class="${Q("flex size-6 items-center justify-center rounded text-white",e.color)}">${E(e.icon,"size-4")}</div>
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
  </div>`}function y(){return M.map((e)=>I({variant:"ghost",className:"group min-h-12 justify-start gap-3 rounded-none border-neutral-200 border-b px-3 py-3 font-normal last:border-b-0",label:A`<div class="${Q("flex size-8 items-center justify-center rounded text-white",e.color)}">${E(e.icon,"size-4")}</div>
        <div class="flex-1">
          <div class="font-medium text-sm">${e.title}</div>
          <div class="text-neutral-600 text-xs dark:text-neutral-300">${e.description}</div>
        </div>
        ${E(j,"size-4 text-neutral-400 transition-transform group-hover:translate-x-0.5")}`,attrs:`data-item="${e.id}"`}))}function w(e,l,n){return A`<div class="flex items-center justify-between border-neutral-200 border-b p-2 dark:border-neutral-700">
    <span class="font-medium text-xs">${e}</span>
    ${I({variant:"ghost",size:"sm",className:"h-6 cursor-pointer text-xs",label:l,attrs:`data-ref="${n}"`})}
  </div>`}function R(e){let l=null,n=!0,i=null,d=Promise.resolve();e.innerHTML=A`<div data-ref="plain" class="${Q("flex h-full w-full flex-col overflow-hidden","hidden")}">
      ${w("Without Animation","Try Animated","toAnimated")}
      <div data-ref="plainBody" class="contents"></div>
    </div>
    <div data-ref="animated" class="${Q("flex h-full w-full flex-col overflow-hidden")}">
      ${w("With Animation","Try Without","toPlain")}
    </div>`;let{plain:k,plainBody:z,animated:r,toAnimated:H,toPlain:L}=g(e);function o(a){let t=document.createElement("div");if(a)t.className="flex-1",t.innerHTML=b(a);else t.className="flex flex-col",t.innerHTML=y().join("");return t}function c(){z.innerHTML=l?b(l):`<div class="flex flex-col">${y().join("")}</div>`}function T(){let a=l;d=d.then(async()=>{if(i)await C(i,{opacity:0},s),i.remove();let t=o(a);t.style.opacity="0",r.append(t),i=t,await C(t,{opacity:1},s)})}function u(a){l=a,c(),T()}function f(a){n=a,k.className=Q("flex h-full w-full flex-col overflow-hidden",n&&"hidden"),r.className=Q("flex h-full w-full flex-col overflow-hidden",!n&&"hidden")}e.addEventListener("click",(a)=>{let t=a.target.closest("[data-item]")?.dataset.item;if(t)u(M.find((N)=>String(N.id)===t));else if(a.target.closest("[data-back]"))u(null)}),H.addEventListener("click",()=>f(!0)),L.addEventListener("click",()=>f(!1)),c(),i=o(null),r.append(i),C(i,{opacity:0},{duration:0}),C(i,{opacity:1},s)}export{R as mount};
