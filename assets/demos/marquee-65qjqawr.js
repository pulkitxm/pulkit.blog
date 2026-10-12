import{I}from"./index.js";import{Q}from"./index-9xe00pb0.js";var t="1rem",s="8s",l=4,o="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi, in! ";function r(e,a){let n=`<span class="whitespace-nowrap font-medium">${o}</span>`;return I`<style>
      @keyframes marquee-${e} {
        from { transform: translateX(0); }
        to { transform: translateX(calc(-100% - ${t})); }
      }
      .marquee-${e} {
        display: flex;
        animation: marquee-${e} ${s} ${e} infinite;
      }
    </style><div class="${a}">${Array.from({length:l},()=>`<div class="flex shrink-0" style="gap: ${t}">${n}</div>`)}</div>`}var u=(e)=>{e.innerHTML=Q("gap-6 p-4",I`
    <div class="flex w-full max-w-md flex-col gap-6">
      <div class="flex flex-col gap-2">
        <span class="text-neutral-600 text-xs dark:text-neutral-300">Linear (correct)</span>
        <div class="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 py-3 dark:border-neutral-700 dark:bg-neutral-800">${r("linear","marquee-linear")}</div>
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-neutral-600 text-xs dark:text-neutral-300">Ease-in-out (wrong)</span>
        <div class="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 py-3 dark:border-neutral-700 dark:bg-neutral-800">${r("ease-in-out","marquee-ease-in-out")}</div>
      </div>
    </div>
    <p class="max-w-sm text-center text-neutral-600 text-sm dark:text-neutral-300">Marquees flow continuously. Easing makes it feel like it's "trying to get somewhere."</p>
  `)};export{u as mount};
