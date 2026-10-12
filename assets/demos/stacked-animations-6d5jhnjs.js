import{I}from"./index.js";var s=(e)=>{e.innerHTML=I`<div class="flex size-full flex-col items-center justify-center gap-8 p-6">
    <div class="flex flex-wrap items-center justify-center gap-12">
      <div class="flex flex-col items-center gap-3">
        <div
          class="size-14 rounded-lg bg-fuchsia-500"
          style="animation: demo-spin-slow 3s linear infinite, demo-pulse-scale 1s ease-in-out infinite alternate"
        ></div>
        <span class="text-neutral-600 text-xs dark:text-neutral-300">Spin + Pulse</span>
      </div>
      <div class="flex flex-col items-center gap-3">
        <div
          class="size-14 rounded-lg bg-cyan-500"
          style="animation: demo-float 2s ease-in-out infinite alternate, demo-color-shift 4s ease infinite"
        ></div>
        <span class="text-neutral-600 text-xs dark:text-neutral-300">Float + Color</span>
      </div>
    </div>
    <style>
      @keyframes demo-spin-slow {
        to { rotate: 360deg; }
      }
      @keyframes demo-pulse-scale {
        to { scale: 1.3; }
      }
      @keyframes demo-float {
        to { transform: translateY(-16px); }
      }
      @keyframes demo-color-shift {
        0% { background-color: rgb(6 182 212); }
        33% { background-color: rgb(168 85 247); }
        66% { background-color: rgb(244 63 94); }
        100% { background-color: rgb(6 182 212); }
      }
    </style>
    <p class="max-w-md text-center text-neutral-600 text-sm dark:text-neutral-300">Comma-separate multiple animations on the same element. Each runs independently with its own timing and iteration count.</p>
  </div>`};export{s as mount};
