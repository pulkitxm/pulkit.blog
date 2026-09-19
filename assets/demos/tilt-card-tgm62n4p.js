import{A,g}from"./index.js";function p(n){let t={x:0,y:0},a=!1;n.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-6 p-6">
    <div class="flex items-center justify-center" style="perspective: 1000px">
      <div data-ref="card" role="img" aria-label="Interactive 3D tilt card demo" class="relative flex h-48 w-64 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 shadow-2xl">
        <div class="absolute inset-0 rounded-xl bg-white/10 backdrop-blur-sm" style="transform: translateZ(2px)"></div>
        <div class="relative text-center" style="transform: translateZ(30px)">
          <h3 class="font-bold text-white text-xl">Tilt Card</h3>
          <p class="mt-2 text-sm text-white/80">Move your mouse over me</p>
        </div>
        <div class="absolute right-4 bottom-4 left-4 flex justify-between text-white/60 text-xs" style="transform: translateZ(20px)">
          <span data-ref="xLabel"></span>
          <span data-ref="yLabel"></span>
        </div>
      </div>
    </div>
    <p class="max-w-md text-center text-neutral-500 text-xs dark:text-neutral-400">Hover and move your mouse to see the card tilt. Uses rotateX and rotateY with perspective for 3D depth.</p>
  </div>`;let{card:e,xLabel:d,yLabel:c}=g(n);function r(){e.style.transform=`rotateX(${t.x}deg) rotateY(${t.y}deg)`,e.style.transformStyle="preserve-3d",e.style.transition=a?"transform 0.1s ease-out":"transform 0.3s ease-out",d.textContent=`rotateX: ${t.x.toFixed(1)}°`,c.textContent=`rotateY: ${t.y.toFixed(1)}°`}e.addEventListener("mousemove",(o)=>{let s=e.getBoundingClientRect(),x=o.clientX-s.left,f=o.clientY-s.top,l=s.width/2,i=s.height/2;t={x:(f-i)/i*-15,y:(x-l)/l*15},r()}),e.addEventListener("mouseleave",()=>{t={x:0,y:0},a=!1,r()}),e.addEventListener("mouseenter",()=>{a=!0,r()}),r()}export{p as mount};
