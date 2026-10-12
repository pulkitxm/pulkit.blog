import{U}from"./index-tg3a6emz.js";import{A,I}from"./index.js";import{Q,o}from"./index-9xe00pb0.js";var g=(e)=>{let t=45,a=800;e.innerHTML=Q("gap-6 p-6",I`
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
    ${o("Lower perspective values create more dramatic 3D effects. Higher values feel more subtle.")}
  `);let n=A(e,"flat",HTMLDivElement),r=A(e,"stage",HTMLDivElement),i=A(e,"depth",HTMLDivElement),p=A(e,"rotationValue",HTMLSpanElement),m=A(e,"perspectiveValue",HTMLSpanElement);function s(){n.style.transform=`rotateY(${t}deg)`,i.style.transform=`rotateY(${t}deg)`,r.style.perspective=`${a}px`,p.textContent=`${t}deg`,m.textContent=`${a}px`}let c=U({min:-90,max:90,step:5,value:t,className:"w-full",onValueChange:(l)=>{t=l,s()}}),d=U({min:200,max:2000,step:100,value:a,className:"w-full",onValueChange:(l)=>{a=l,s()}});A(e,"rotationGroup",HTMLDivElement).append(c.element),A(e,"perspectiveGroup",HTMLDivElement).append(d.element),s()};export{g as mount};
