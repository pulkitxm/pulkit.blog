import{D}from"./index-z9tsxw2r.js";import{A,g}from"./index.js";function v(l){let e=45,t=800;l.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-6 p-6">
    <div class="flex flex-col gap-8 sm:flex-row sm:gap-12">
      <div class="flex flex-col items-center gap-3">
        <p class="font-medium text-neutral-700 text-sm dark:text-neutral-300">Without perspective</p>
        <div class="flex h-32 w-32 items-center justify-center">
          <div data-ref="flat" class="flex size-20 items-center justify-center rounded-lg bg-linear-to-br from-rose-500 to-pink-600 font-medium text-sm text-white shadow-lg">Flat</div>
        </div>
        <p class="text-neutral-500 text-xs dark:text-neutral-400">Just gets narrower</p>
      </div>
      <div class="flex flex-col items-center gap-3">
        <p class="font-medium text-neutral-700 text-sm dark:text-neutral-300">With perspective</p>
        <div data-ref="stage" class="flex h-32 w-32 items-center justify-center">
          <div data-ref="depth" class="flex size-20 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 font-medium text-sm text-white shadow-lg">3D</div>
        </div>
        <p class="text-neutral-500 text-xs dark:text-neutral-400">Has depth and dimension</p>
      </div>
    </div>
    <div class="flex w-full max-w-sm flex-col gap-4">
      <div data-ref="rotationGroup" class="flex flex-col gap-2">
        <div class="flex items-center justify-between text-sm">
          <span class="text-neutral-600 dark:text-neutral-400">rotateY</span>
          <span data-ref="rotationValue" class="font-mono text-neutral-800 dark:text-neutral-200"></span>
        </div>
      </div>
      <div data-ref="perspectiveGroup" class="flex flex-col gap-2">
        <div class="flex items-center justify-between text-sm">
          <span class="text-neutral-600 dark:text-neutral-400">perspective</span>
          <span data-ref="perspectiveValue" class="font-mono text-neutral-800 dark:text-neutral-200"></span>
        </div>
      </div>
    </div>
    <p class="max-w-md text-center text-neutral-500 text-xs dark:text-neutral-400">Lower perspective values create more dramatic 3D effects. Higher values feel more subtle.</p>
  </div>`;let{flat:r,stage:n,depth:i,rotationGroup:d,perspectiveGroup:o,rotationValue:p,perspectiveValue:c}=g(l);function a(){r.style.transform=`rotateY(${e}deg)`,i.style.transform=`rotateY(${e}deg)`,n.style.perspective=`${t}px`,p.textContent=`${e}deg`,c.textContent=`${t}px`}let x=D({min:-90,max:90,step:5,value:e,className:"w-full",onValueChange:(s)=>{e=s??0,a()}}),f=D({min:200,max:2000,step:100,value:t,className:"w-full",onValueChange:(s)=>{t=s??800,a()}});d.append(x.element),o.append(f.element),a()}export{v as mount};
