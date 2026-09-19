import{A,I,C}from"./index.js";import{B}from"./index-apf7fdxr.js";var u={damping:15,mass:1,stiffness:200,type:"spring"},f="transform 600ms cubic-bezier(0.16, 1, 0.3, 1)",v=(e)=>{let r="start",n=C();e.innerHTML=I`<div class="flex h-full w-full flex-col items-center justify-center gap-8 p-8">
    <div class="flex w-full max-w-md flex-col gap-6">
      <div class="flex items-center gap-4">
        <span class="w-24 font-medium text-neutral-600 text-sm dark:text-neutral-300">Ease-out</span>
        <div data-ref="track" class="relative h-12 flex-1 rounded-lg bg-neutral-100 dark:bg-neutral-800">
          <div
            data-ref="ease"
            class="absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 rounded-full bg-neutral-400 dark:bg-neutral-500"
          ></div>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <span class="w-24 font-medium text-neutral-600 text-sm dark:text-neutral-300">Spring</span>
        <div class="relative h-12 flex-1 rounded-lg bg-neutral-100 dark:bg-neutral-800">
          <div
            data-ref="spring"
            class="absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 rounded-full bg-orange-500"
          ></div>
        </div>
      </div>
    </div>
    <p class="max-w-sm text-center text-neutral-600 text-xs dark:text-neutral-300">The spring overshoots and settles naturally. The ease-out follows a fixed curve.</p>
  </div>`;let d=A(e,"track",HTMLDivElement),l=A(e,"ease",HTMLDivElement),i=A(e,"spring",HTMLDivElement);B(i,{x:0},{duration:0});function o(){return d.offsetWidth-32-16}function t(a){let s=o();if(s<=0)return;let c=a==="end"?s:0;l.style.transition=f,l.style.transform=a==="end"?`translateX(${s}px)`:"translateX(0)",B(i,{x:c},u),r=a}return n.later(()=>t("end"),100),{destroy:n.dispose,replay(){if(r==="end")t("start"),n.later(()=>t("end"),700);else t("end")}}};export{v as mount};
