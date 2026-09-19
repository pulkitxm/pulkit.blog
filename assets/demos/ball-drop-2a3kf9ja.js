import{A}from"./index.js";var e=[0.42,0,1,1].join(", "),t=[0.2,1.1,0.4,1].join(", ");function i(a){a.innerHTML=A`<div class="flex h-full w-full items-start justify-around overflow-hidden px-8 pt-8 pb-12">
    <style>
      @keyframes ball-drop-linear {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(15rem); }
      }
      @keyframes ball-drop-ease-in {
        0%, 100% { transform: translateY(0); animation-timing-function: cubic-bezier(${e}); }
        50% { transform: translateY(15rem); animation-timing-function: cubic-bezier(${e}); }
      }
      @keyframes ball-drop-spring {
        0%, 100% { transform: translateY(0); animation-timing-function: cubic-bezier(${t}); }
        50% { transform: translateY(15rem); animation-timing-function: cubic-bezier(${t}); }
      }
    </style>
    <div class="flex flex-col items-center">
      <div class="h-8 w-8 animate-[ball-drop-linear_2s_linear_infinite] rounded-full shadow-lg" style="background-color: #94a3b8"></div>
      <span class="absolute bottom-4 text-neutral-600 text-xs dark:text-neutral-400">Linear</span>
    </div>
    <div class="flex flex-col items-center">
      <div class="h-8 w-8 animate-[ball-drop-ease-in_2s_ease-in-out_infinite] rounded-full shadow-lg" style="background-color: #f472b6"></div>
      <span class="absolute bottom-4 text-neutral-600 text-xs dark:text-neutral-400">Ease-in</span>
    </div>
    <div class="flex flex-col items-center">
      <div class="h-8 w-8 animate-[ball-drop-spring_2s_ease-in-out_infinite] rounded-full shadow-lg" style="background-color: #fb923c"></div>
      <span class="absolute bottom-4 text-neutral-600 text-xs dark:text-neutral-400">Spring</span>
    </div>
  </div>`}export{i as mount};
