import{A,g,I}from"./index.js";import{Q,o}from"./index-9xe00pb0.js";var l=(e)=>{e.innerHTML=Q("gap-8 p-6",I`
    <div class="flex flex-wrap items-center justify-center gap-6">
      ${g({attrs:'style="transition-duration: 0.2s; transition-property: color, background-color, border-color; transition-timing-function: ease"',className:"border-2 border-blue-500 bg-transparent text-blue-600 hover:bg-blue-500 hover:text-white dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white",label:"Hover me",variant:"outline"})}
      ${g({attrs:'data-ref="multi" style="transition: 0.2s ease; transition-property: color, background-color"',className:"rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300",label:"Multiple properties"})}
    </div>
    ${o("Same duration and easing for multiple properties: use shorthand plus transition-property for consistency.")}
  `);let t=A(e,"multi",HTMLButtonElement);t.addEventListener("mouseenter",()=>{t.style.backgroundColor="rgb(34 197 94)",t.style.color="white"}),t.addEventListener("mouseleave",()=>{t.style.backgroundColor="",t.style.color=""})};export{l as mount};
