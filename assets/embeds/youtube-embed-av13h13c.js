function r(e){return!(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey)}function a(e,t,i=!1){e.addEventListener("keydown",(o)=>{if(o.key!=="ArrowLeft"&&o.key!=="ArrowRight")return;o.preventDefault(),t(o.key==="ArrowLeft"?-1:1)},i)}
export{r,a};
