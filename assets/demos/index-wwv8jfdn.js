import{A,e,o,g,Q,I,C,tA,aA,WA,jA,nA,m}from"./index.js";function le(){return globalThis.matchMedia("(prefers-reduced-motion: reduce)")}function q(){return le().matches}var d=10,D=3,k=15,j=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],y=6,R=88,x=[{decision:"allow",detail:"Window spans the last 10 seconds. The log is empty, so the request is accepted and timestamp 1 is stored.",evicted:[],incomingAt:1,logAfter:[1],logAfterCleanup:[],now:1,title:"First request"},{decision:"allow",detail:"Only one prior accepted request sits inside the sliding window. Under the limit, so timestamp 3 is appended.",evicted:[],incomingAt:3,logAfter:[1,3],logAfterCleanup:[1],now:3,title:"Second request"},{decision:"allow",detail:"After cleanup two prior timestamps remain inside this window (there is still headroom), so timestamp 8 is accepted and stored.",evicted:[],incomingAt:8,logAfter:[1,3,8],logAfterCleanup:[1,3],now:8,title:"Third request fills the quota"},{decision:"deny",detail:"After trimming entries older than t−10, three accepted timestamps remain. Adding a fourth would break 3 reqs / 10 secs, so it is denied and never logged.",evicted:[],incomingAt:9,logAfter:[1,3,8],logAfterCleanup:[1,3,8],now:9,title:"Fourth request rejected"},{decision:"allow",detail:"At t=12 the window reaches back to t=2. Timestamp 1 is outside and removed from the log. Two slots remain inside the quota, so 12 is accepted.",evicted:[1],incomingAt:12,logAfter:[3,8,12],logAfterCleanup:[3,8],now:12,title:"Window slides, room appears"},{decision:"allow",detail:"Trailing edge moves to t=4. Timestamp 3 drops out of the sliding window and is trimmed from the log, then 14 is appended.",evicted:[3],incomingAt:14,logAfter:[8,12,14],logAfterCleanup:[8,12],now:14,title:"Another eviction"},{decision:"deny",detail:"No timestamps expire relative to t=15; the window sits on [5, 15]. The log already carries three accepted requests, so the new arrival is rejected.",evicted:[],incomingAt:15,logAfter:[8,12,14],logAfterCleanup:[8,12,14],now:15,title:"Log full again"}],V=x.map((t)=>({allowed:t.decision==="allow",t:t.incomingAt}));function c(t){return 6+Math.min(Math.max(t,0),15)/15*88}var de="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",ce={default:"border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",destructive:"border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",outline:"text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",secondary:"border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90"};function pe(t,s){return e(de,ce[t],s)}function b(t,s,n,r=""){return`<span data-slot="badge" class="${pe(t,s)}" ${r}>${n}</span>`}var me=e("rounded-xl border bg-card text-card-foreground shadow","flex min-h-0 w-full min-w-0 flex-1 flex-col border-none bg-transparent"),ue=e("flex flex-col space-y-1.5 p-6","space-y-3 pb-4"),ge=e("font-semibold leading-none tracking-tight","text-balance text-base leading-tight sm:text-lg"),fe=e("p-6 pt-0","flex flex-1 flex-col gap-4 px-4 pb-4 sm:px-6 sm:pb-6"),xe=e("shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px","bg-neutral-200 dark:bg-neutral-800"),N="h-[3.125rem] w-px -translate-x-1/2 border-neutral-400 border-l border-dashed dark:border-neutral-500";function be(t,s,n){return e("relative flex size-6 items-center justify-center rounded-full border-2 font-mono text-[10px] tracking-tight sm:size-[1.75rem] sm:text-xs",t.allowed?e("border-emerald-700 bg-emerald-500 text-white shadow-sm dark:border-emerald-500",!(s||n)&&"border-emerald-800/45 bg-emerald-500/30 text-emerald-950 dark:bg-emerald-500/35 dark:text-emerald-50",s&&"shadow-emerald-900/25 dark:shadow-emerald-950/35"):"border-rose-600 bg-rose-500 text-white shadow-sm dark:border-rose-600",n&&"ring-2 ring-sky-400 ring-offset-2 ring-offset-white dark:ring-sky-400 dark:ring-offset-neutral-950")}function W(t){let s=t?"":"duration-[380ms] ease-[cubic-bezier(0.33,1,0.68,1)] will-change-[left,width] motion-reduce:transition-none",n=t?"":"duration-[380ms] ease-[cubic-bezier(0.33,1,0.68,1)] will-change-[left] motion-reduce:transition-none";return I`<div data-ref="container" class="flex min-h-0 w-full flex-1 items-stretch overflow-auto p-2 sm:p-3">
    <div class="${me}">
      <div class="${ue}">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0 space-y-1">
            <div class="${ge}">Sliding window log</div>
            <p class="text-pretty text-neutral-600 text-xs leading-relaxed sm:text-sm dark:text-neutral-400">Only accepted requests are stored. Each arrival trims expired timestamps, then compares the log size to the limit.</p>
          </div>
          <div class="flex shrink-0 flex-wrap gap-2">
            ${b("secondary","font-mono text-[11px] sm:text-xs",`${D} req / ${d}s`)}
            ${b("outline","font-mono text-[11px] tabular-nums sm:text-xs","",'data-ref="nowBadge"')}
            ${b("outline","font-mono text-[11px] tabular-nums sm:text-xs","",'data-ref="rangeBadge"')}
          </div>
        </div>
        <div class="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-neutral-600 sm:text-xs dark:text-neutral-400">
          <span class="inline-flex items-center gap-1.5"><span class="size-2 shrink-0 rounded-full bg-emerald-500 shadow-sm ring-1 ring-emerald-600/30"></span>Accepted (in window)</span>
          <span class="inline-flex items-center gap-1.5"><span class="size-2 shrink-0 rounded-full bg-emerald-500/35 ring-1 ring-emerald-500/40"></span>Accepted (outside window)</span>
          <span class="inline-flex items-center gap-1.5"><span class="size-2 shrink-0 rounded-full bg-rose-500 shadow-sm ring-1 ring-rose-600/40"></span>Denied</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-3 w-0.5 shrink-0 rounded-full border border-sky-500/80 border-dashed bg-sky-400/25"></span>Window edge</span>
        </div>
      </div>
      <div class="${fe}">
        <div class="overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
          <div class="relative mx-auto w-full min-w-[min(100%,300px)] max-w-2xl pb-6">
            <div
              class="rounded-xl border border-neutral-200 bg-white px-4 pt-8 pb-4 sm:px-6 dark:border-neutral-800 dark:bg-neutral-950"
              style="background-image: linear-gradient(to right, rgb(212 212 216 / 0.22) 1px, transparent 1px), linear-gradient(to bottom, rgb(212 212 216 / 0.18) 1px, transparent 1px); background-position: ${y}% 0, 0 0; background-size: ${R/k}% 100%, 100% 14px"
            >
              <div class="relative mx-auto h-[5.75rem] max-w-xl" role="presentation" aria-hidden="true">
                <div class="absolute bottom-11 h-px bg-neutral-300 dark:bg-neutral-700" style="left: ${y}%; right: ${y}%"></div>
                <div
                  data-ref="band"
                  class="${e("pointer-events-none absolute bottom-14 h-[3.125rem] rounded-md bg-sky-500/10 ring-1 ring-sky-500/25 ring-inset transition-[left,width] dark:bg-sky-400/10 dark:ring-sky-400/30",s)}"
                ></div>
                <div data-ref="leftEdge" class="${e("pointer-events-none absolute bottom-14 transition-[left]",n)}"><div class="${N}"></div></div>
                <div data-ref="rightEdge" class="${e("pointer-events-none absolute bottom-14 transition-[left]",n)}"><div class="${N}"></div></div>
                ${j.map((r)=>I`<div class="absolute bottom-9 flex w-0 flex-col items-center" style="left: ${c(r)}%; transform: translateX(-50%)">
                    <div class="h-2.5 w-px bg-neutral-400 dark:bg-neutral-500"></div>
                    <span class="mt-1.5 font-mono text-[10px] text-neutral-500 tabular-nums sm:text-[11px] dark:text-neutral-400">${r}</span>
                  </div>`)}
                <div data-ref="attempts" class="contents"></div>
              </div>
              <p class="px-1 text-center font-mono text-[10px] text-neutral-500 sm:text-[11px] dark:text-neutral-400">Timeline axis (seconds) · shaded band = sliding window counted for this decision</p>
            </div>
          </div>
        </div>
        <div data-slot="separator-root" role="none" data-orientation="horizontal" class="${xe}"></div>
        <div class="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
          <div data-ref="details" class="flex flex-col gap-3 lg:col-span-7"></div>
          <div class="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 lg:col-span-5 dark:border-neutral-800 dark:bg-neutral-950/60">
            <p class="font-medium font-mono text-neutral-700 text-xs sm:text-sm dark:text-neutral-200">Log (newest first)</p>
            <ul data-ref="log" class="flex flex-wrap gap-2" aria-label="Request log stamps"></ul>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100/70 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900/55">
          ${g({variant:"outline",size:"icon",className:"size-9 shrink-0",label:Q(WA,"size-4"),attrs:'data-ref="prev" aria-label="Previous step"'})}
          ${g({variant:"outline",size:"icon",className:"size-9 shrink-0",label:Q(tA,"size-4"),attrs:'data-ref="next" aria-label="Next step"'})}
          <button type="button" data-ref="play" class="${o({variant:"secondary",size:"sm",className:"gap-1.5 px-4"})}"></button>
          ${g({variant:"ghost",size:"sm",className:"gap-1.5",label:`${Q(jA,"size-4")}Reset`,attrs:'data-ref="reset"'})}
          <span data-ref="stepLabel" class="ml-auto whitespace-nowrap font-mono text-[11px] text-neutral-600 tabular-nums sm:text-xs dark:text-neutral-400"></span>
        </div>
      </div>
    </div>
  </div>`}function O(t,s){let n=t.now-d,r=t.now,p=V.slice(0,s+1);return p.map((a,h)=>{let u=a.t>n&&a.t<=r,w=a.t===t.incomingAt&&h===p.length-1;return I`<div class="absolute bottom-[2.45rem] flex flex-col items-center" style="left: ${c(a.t)}%; transform: translateX(-50%)">
          <span class="${be(a,u,w)}" title="${a.allowed?`t=${a.t} accepted`:`t=${a.t} denied`}">${a.t}</span>
        </div>`}).join("")}function F(t){return I`<div class="flex flex-wrap gap-2">
        ${b(t.decision==="allow"?"secondary":"destructive",e("font-mono font-normal text-[11px]",t.decision==="allow"?"bg-emerald-500/15 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-100":""),t.decision==="allow"?"Accepted (logged)":"Rejected (not logged)")}
        ${b("outline","font-mono text-[11px] tabular-nums",`Log size after cleanup ${t.logAfterCleanup.length}`)}
      </div>
      <div>
        <h4 class="mb-1.5 font-semibold text-sm sm:text-base">${m(t.title)}</h4>
        <p class="text-pretty text-neutral-600 text-xs leading-relaxed sm:text-sm dark:text-neutral-400">${m(t.detail)}</p>
      </div>
      ${t.evicted.length>0?I`<p class="text-neutral-600 text-xs sm:text-sm dark:text-neutral-400">Removed from log: <span class="rounded bg-neutral-200 px-1 py-px font-mono tabular-nums dark:bg-neutral-800">${t.evicted.join(", ")}</span><span class="text-neutral-500"> · older than t−${d}</span></p>`:""}`}function U(t){let s=[...t.logAfter].reverse();return s.length>0?s.map((n)=>`<li class="rounded-md border border-emerald-500/35 bg-emerald-500/[0.07] px-2.5 py-1.5 font-mono text-emerald-950 text-sm tabular-nums tracking-tight dark:border-emerald-500/35 dark:bg-emerald-950/35 dark:text-emerald-50">${n}</li>`).join(""):'<li class="text-neutral-500 text-sm dark:text-neutral-400">Empty</li>'}var v=x.length-1,Pe=(t)=>{let s=q(),n=0,r=!1,p=!1,a=!1,h=!1,u=C(),w=u.slot();t.innerHTML=W(s);let X=A(t,"container",HTMLDivElement),G=A(t,"nowBadge",HTMLSpanElement),J=A(t,"rangeBadge",HTMLSpanElement),E=A(t,"band",HTMLDivElement),K=A(t,"leftEdge",HTMLDivElement),Y=A(t,"rightEdge",HTMLDivElement),Z=A(t,"attempts",HTMLDivElement),_=A(t,"details",HTMLDivElement),ee=A(t,"log",HTMLUListElement),T=A(t,"prev",HTMLButtonElement),z=A(t,"next",HTMLButtonElement),S=A(t,"play",HTMLButtonElement),te=A(t,"reset",HTMLButtonElement),ne=A(t,"stepLabel",HTMLSpanElement);function ae(){if(w.cancel(),!r)return;if(n>=v){r=!1,M();return}w.later(()=>{n+=1,l()},1250)}function l(){M(),ae()}function M(){let i=x[Math.min(Math.max(n,0),v)];if(!i)return;let f=i.now-d,H=i.now,se=Math.max(0,f),ie=Math.min(k,H),L=c(se),B=c(ie),oe=Math.max(0,B-L);G.textContent=`now = ${i.now}s`,J.textContent=`[${f}, ${H}]`,E.style.left=`${L}%`,E.style.width=`${oe}%`,K.style.left=`${L}%`,Y.style.left=`${B}%`,Z.innerHTML=O(i,n),_.innerHTML=F(i),ee.innerHTML=U(i),T.disabled=n<=0,z.disabled=n>=v,S.innerHTML=r?`${Q(nA,"size-4")}Pause`:`${Q(aA,"size-4")}Play`,ne.textContent=`Step ${n+1} / ${x.length}`}T.addEventListener("click",()=>{a=!1,n=Math.max(0,n-1),l()}),z.addEventListener("click",()=>{a=!1,n=Math.min(v,n+1),l()}),S.addEventListener("click",()=>{if(r)a=!1;r=!r,l()}),te.addEventListener("click",()=>{a=!1,n=0,r=!1,l()});function re(i){if(!i.isIntersecting){if(r)a=!0;r=!1,l();return}if(!p){if(p=!0,s)return;n=0,r=!0,a=!1,l();return}if(s)return;if(a&&n<v){a=!1,r=!0,l();return}a=!1}let P=new IntersectionObserver((i)=>{queueMicrotask(()=>{let f=i[0];if(!h&&f)re(f)})},{rootMargin:"0px 0px -12% 0px",threshold:0.2});return P.observe(X),u.add(()=>{h=!0,P.disconnect()}),M(),{replay(){a=!1,n=0,r=!1,l()},destroy:u.dispose}};export{Pe as mount};
