import{_,W}from"./index-9kj23q99.js";import{j}from"./index-hmfmqxyn.js";import{Q,i,p,I,E,DA,A,g}from"./index.js";var S=[["path",{d:"m15 18-6-6 6-6"}]];var N=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"}],["path",{d:"M3 3v5h5"}]];var y=10,J=3,b=15,Y=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],c=[{decision:"allow",detail:"Window spans the last 10 seconds. The log is empty, so the request is accepted and timestamp 1 is stored.",evicted:[],incomingAt:1,logAfter:[1],logAfterCleanup:[],now:1,title:"First request"},{decision:"allow",detail:"Only one prior accepted request sits inside the sliding window. Under the limit, so timestamp 3 is appended.",evicted:[],incomingAt:3,logAfter:[1,3],logAfterCleanup:[1],now:3,title:"Second request"},{decision:"allow",detail:"After cleanup two prior timestamps remain inside this window (there is still headroom), so timestamp 8 is accepted and stored.",evicted:[],incomingAt:8,logAfter:[1,3,8],logAfterCleanup:[1,3],now:8,title:"Third request fills the quota"},{decision:"deny",detail:"After trimming entries older than t−10, three accepted timestamps remain. Adding a fourth would break 3 reqs / 10 secs, so it is denied and never logged.",evicted:[],incomingAt:9,logAfter:[1,3,8],logAfterCleanup:[1,3,8],now:9,title:"Fourth request rejected"},{decision:"allow",detail:"At t=12 the window reaches back to t=2. Timestamp 1 is outside and removed from the log. Two slots remain inside the quota, so 12 is accepted.",evicted:[1],incomingAt:12,logAfter:[3,8,12],logAfterCleanup:[3,8],now:12,title:"Window slides, room appears"},{decision:"allow",detail:"Trailing edge moves to t=4. Timestamp 3 drops out of the sliding window and is trimmed from the log, then 14 is appended.",evicted:[3],incomingAt:14,logAfter:[8,12,14],logAfterCleanup:[8,12],now:14,title:"Another eviction"},{decision:"deny",detail:"No timestamps expire relative to t=15; the window sits on [5, 15]. The log already carries three accepted requests, so the new arrival is rejected.",evicted:[],incomingAt:15,logAfter:[8,12,14],logAfterCleanup:[8,12,14],now:15,title:"Log full again"}],Z=c.map((r)=>({allowed:r.decision==="allow",t:r.incomingAt})),x=6,B=88;function f(r){let s=Math.min(Math.max(r,0),b);return x+s/b*B}var ee="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",te={default:"border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",destructive:"border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",outline:"text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",secondary:"border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90"};function ae(r,s){return Q(ee,te[r],s)}function u(r,s,e,n=""){return`<span data-slot="badge" class="${ae(r,s)}" ${n}>${e}</span>`}var ne=Q("rounded-xl border bg-card text-card-foreground shadow","flex min-h-0 w-full min-w-0 flex-1 flex-col border-none bg-transparent"),re=Q("flex flex-col space-y-1.5 p-6","space-y-3 pb-4"),se=Q("font-semibold leading-none tracking-tight","text-balance text-base leading-tight sm:text-lg"),ie=Q("p-6 pt-0","flex flex-1 flex-col gap-4 px-4 pb-4 sm:px-6 sm:pb-6"),le=Q("shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px","bg-neutral-200 dark:bg-neutral-800"),R="h-[3.125rem] w-px -translate-x-1/2 border-neutral-400 border-l border-dashed dark:border-neutral-500";function oe(r,s,e){return Q("relative flex size-6 items-center justify-center rounded-full border-2 font-mono text-[10px] tracking-tight sm:size-[1.75rem] sm:text-xs",r.allowed?Q("border-emerald-700 bg-emerald-500 text-white shadow-sm dark:border-emerald-500",!(s||e)&&"border-emerald-800/45 bg-emerald-500/30 text-emerald-950 dark:bg-emerald-500/35 dark:text-emerald-50",s&&"shadow-emerald-900/25 dark:shadow-emerald-950/35"):"border-rose-600 bg-rose-500 text-white shadow-sm dark:border-rose-600",e&&"ring-2 ring-sky-400 ring-offset-2 ring-offset-white dark:ring-sky-400 dark:ring-offset-neutral-950")}function ge(r){let s=DA(),e=0,n=!1,C=!1,o=!1,v=0,T=!1,H=s?"":"duration-[380ms] ease-[cubic-bezier(0.33,1,0.68,1)] will-change-[left,width] motion-reduce:transition-none",z=s?"":"duration-[380ms] ease-[cubic-bezier(0.33,1,0.68,1)] will-change-[left] motion-reduce:transition-none";r.innerHTML=A`<div data-ref="container" class="flex min-h-0 w-full flex-1 items-stretch overflow-auto p-2 sm:p-3">
    <div class="${ne}">
      <div class="${re}">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0 space-y-1">
            <div class="${se}">Sliding window log</div>
            <p class="text-pretty text-neutral-600 text-xs leading-relaxed sm:text-sm dark:text-neutral-400">Only accepted requests are stored. Each arrival trims expired timestamps, then compares the log size to the limit.</p>
          </div>
          <div class="flex shrink-0 flex-wrap gap-2">
            ${u("secondary","font-mono text-[11px] sm:text-xs",`${J} req / ${y}s`)}
            ${u("outline","font-mono text-[11px] tabular-nums sm:text-xs","",'data-ref="nowBadge"')}
            ${u("outline","font-mono text-[11px] tabular-nums sm:text-xs","",'data-ref="rangeBadge"')}
          </div>
        </div>
        <div class="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-neutral-600 sm:text-xs dark:text-neutral-400">
          <span class="inline-flex items-center gap-1.5"><span class="size-2 shrink-0 rounded-full bg-emerald-500 shadow-sm ring-1 ring-emerald-600/30"></span>Accepted (in window)</span>
          <span class="inline-flex items-center gap-1.5"><span class="size-2 shrink-0 rounded-full bg-emerald-500/35 ring-1 ring-emerald-500/40"></span>Accepted (outside window)</span>
          <span class="inline-flex items-center gap-1.5"><span class="size-2 shrink-0 rounded-full bg-rose-500 shadow-sm ring-1 ring-rose-600/40"></span>Denied</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-3 w-0.5 shrink-0 rounded-full border border-sky-500/80 border-dashed bg-sky-400/25"></span>Window edge</span>
        </div>
      </div>
      <div class="${ie}">
        <div class="overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
          <div class="relative mx-auto w-full min-w-[min(100%,300px)] max-w-2xl pb-6">
            <div
              class="rounded-xl border border-neutral-200 bg-white px-4 pt-8 pb-4 sm:px-6 dark:border-neutral-800 dark:bg-neutral-950"
              style="background-image: linear-gradient(to right, rgb(212 212 216 / 0.22) 1px, transparent 1px), linear-gradient(to bottom, rgb(212 212 216 / 0.18) 1px, transparent 1px); background-position: ${x}% 0, 0 0; background-size: ${B/b}% 100%, 100% 14px"
            >
              <div class="relative mx-auto h-[5.75rem] max-w-xl" role="presentation" aria-hidden="true">
                <div class="absolute bottom-11 h-px bg-neutral-300 dark:bg-neutral-700" style="left: ${x}%; right: ${x}%"></div>
                <div
                  data-ref="band"
                  class="${Q("pointer-events-none absolute bottom-14 h-[3.125rem] rounded-md bg-sky-500/10 ring-1 ring-sky-500/25 ring-inset transition-[left,width] dark:bg-sky-400/10 dark:ring-sky-400/30",H)}"
                ></div>
                <div data-ref="leftEdge" class="${Q("pointer-events-none absolute bottom-14 transition-[left]",z)}"><div class="${R}"></div></div>
                <div data-ref="rightEdge" class="${Q("pointer-events-none absolute bottom-14 transition-[left]",z)}"><div class="${R}"></div></div>
                ${Y.map((a)=>A`<div class="absolute bottom-9 flex w-0 flex-col items-center" style="left: ${f(a)}%; transform: translateX(-50%)">
                    <div class="h-2.5 w-px bg-neutral-400 dark:bg-neutral-500"></div>
                    <span class="mt-1.5 font-mono text-[10px] text-neutral-500 tabular-nums sm:text-[11px] dark:text-neutral-400">${a}</span>
                  </div>`)}
                <div data-ref="attempts" class="contents"></div>
              </div>
              <p class="px-1 text-center font-mono text-[10px] text-neutral-500 sm:text-[11px] dark:text-neutral-400">Timeline axis (seconds) · shaded band = sliding window counted for this decision</p>
            </div>
          </div>
        </div>
        <div data-slot="separator-root" role="none" data-orientation="horizontal" class="${le}"></div>
        <div class="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
          <div data-ref="details" class="flex flex-col gap-3 lg:col-span-7"></div>
          <div class="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 lg:col-span-5 dark:border-neutral-800 dark:bg-neutral-950/60">
            <p class="font-medium font-mono text-neutral-700 text-xs sm:text-sm dark:text-neutral-200">Log (newest first)</p>
            <ul data-ref="log" class="flex flex-wrap gap-2" aria-label="Request log stamps"></ul>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100/70 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900/55">
          ${I({variant:"outline",size:"icon",className:"size-9 shrink-0",label:E(S,"size-4"),attrs:'data-ref="prev" aria-label="Previous step"'})}
          ${I({variant:"outline",size:"icon",className:"size-9 shrink-0",label:E(j,"size-4"),attrs:'data-ref="next" aria-label="Next step"'})}
          <button type="button" data-ref="play" class="${i({variant:"secondary",size:"sm",className:"gap-1.5 px-4"})}"></button>
          ${I({variant:"ghost",size:"sm",className:"gap-1.5",label:`${E(N,"size-4")}Reset`,attrs:'data-ref="reset"'})}
          <span data-ref="stepLabel" class="ml-auto whitespace-nowrap font-mono text-[11px] text-neutral-600 tabular-nums sm:text-xs dark:text-neutral-400"></span>
        </div>
      </div>
    </div>
  </div>`;let t=g(r);function D(){if(clearTimeout(v),!n)return;if(e>=c.length-1){n=!1,h();return}v=setTimeout(()=>{e+=1,d()},1250)}function d(){h(),D()}function h(){let a=c[Math.min(Math.max(e,0),c.length-1)],m=a.now-y,w=a.now,M=Z.slice(0,e+1),V=Math.max(0,m),X=Math.min(b,w),k=f(V),P=f(X),F=Math.max(0,P-k);t.nowBadge.textContent=`now = ${a.now}s`,t.rangeBadge.textContent=`[${m}, ${w}]`,t.band.style.left=`${k}%`,t.band.style.width=`${F}%`,t.leftEdge.style.left=`${k}%`,t.rightEdge.style.left=`${P}%`,t.attempts.innerHTML=M.map((l,K)=>{let U=l.t>m&&l.t<=w,G=l.t===a.incomingAt&&K===M.length-1;return A`<div class="absolute bottom-[2.45rem] flex flex-col items-center" style="left: ${f(l.t)}%; transform: translateX(-50%)">
          <span class="${oe(l,U,G)}" title="${l.allowed?`t=${l.t} accepted`:`t=${l.t} denied`}">${l.t}</span>
        </div>`}).join(""),t.details.innerHTML=A`<div class="flex flex-wrap gap-2">
        ${u(a.decision==="allow"?"secondary":"destructive",Q("font-mono font-normal text-[11px]",a.decision==="allow"?"bg-emerald-500/15 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-100":""),a.decision==="allow"?"Accepted (logged)":"Rejected (not logged)")}
        ${u("outline","font-mono text-[11px] tabular-nums",`Log size after cleanup ${a.logAfterCleanup.length}`)}
      </div>
      <div>
        <h4 class="mb-1.5 font-semibold text-sm sm:text-base">${p(a.title)}</h4>
        <p class="text-pretty text-neutral-600 text-xs leading-relaxed sm:text-sm dark:text-neutral-400">${p(a.detail)}</p>
      </div>
      ${a.evicted.length>0?A`<p class="text-neutral-600 text-xs sm:text-sm dark:text-neutral-400">Removed from log: <span class="rounded bg-neutral-200 px-1 py-px font-mono tabular-nums dark:bg-neutral-800">${a.evicted.join(", ")}</span><span class="text-neutral-500"> · older than t−${y}</span></p>`:""}`;let q=[...a.logAfter].reverse();t.log.innerHTML=q.length>0?q.map((l)=>`<li class="rounded-md border border-emerald-500/35 bg-emerald-500/[0.07] px-2.5 py-1.5 font-mono text-emerald-950 text-sm tabular-nums tracking-tight dark:border-emerald-500/35 dark:bg-emerald-950/35 dark:text-emerald-50">${l}</li>`).join(""):'<li class="text-neutral-500 text-sm dark:text-neutral-400">Empty</li>',t.prev.disabled=e<=0,t.next.disabled=e>=c.length-1,t.play.innerHTML=n?`${E(_,"size-4")}Pause`:`${E(W,"size-4")}Play`,t.stepLabel.textContent=`Step ${e+1} / ${c.length}`}t.prev.addEventListener("click",()=>{o=!1,e=Math.max(0,e-1),d()}),t.next.addEventListener("click",()=>{o=!1,e=Math.min(c.length-1,e+1),d()}),t.play.addEventListener("click",()=>{if(n)o=!1;n=!n,d()}),t.reset.addEventListener("click",()=>{o=!1,e=0,n=!1,d()});let O=c.length-1,L=new IntersectionObserver((a)=>{queueMicrotask(()=>{if(T)return;let m=a[0];if(!m)return;if(!m.isIntersecting){if(n)o=!0;n=!1,d();return}if(!C){if(C=!0,s)return;e=0,n=!0,o=!1,d();return}if(s)return;if(o&&e<O){o=!1,n=!0,d();return}o=!1})},{rootMargin:"0px 0px -12% 0px",threshold:0.2});return L.observe(t.container),h(),{replay(){o=!1,e=0,n=!1,d()},destroy(){T=!0,L.disconnect(),clearTimeout(v)}}}export{ge as mount};
