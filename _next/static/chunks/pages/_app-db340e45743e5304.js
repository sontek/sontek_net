(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[888],{7959:function(e,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.track=n.config=n.trackPageview=n.load=void 0;const t=(e,n)=>{window.panelbear=window.panelbear||function(){window.panelbearQ=window.panelbearQ||[],window.panelbearQ.push(arguments)};try{window.panelbear(e,n)}catch(t){console.warn("There was an error while executing a Panelbear command",t)}};n.load=(e,n)=>{var r;const o=document.createElement("script");o.async=!0,o.src=`${null!==(r=null===n||void 0===n?void 0:n.scriptSrc)&&void 0!==r?r:"https://cdn.panelbear.com/analytics.js"}?site=${e}`,document.head.appendChild(o),t("config",Object.assign({site:e,autoTrack:!1},n))};n.trackPageview=()=>{t("trackPageview")};n.config=e=>{t("config",e)};n.track=e=>{t("track",e)}},5488:function(e,n,t){"use strict";var r=this&&this.__createBinding||(Object.create?function(e,n,t,r){void 0===r&&(r=t),Object.defineProperty(e,r,{enumerable:!0,get:function(){return n[t]}})}:function(e,n,t,r){void 0===r&&(r=t),e[r]=n[t]}),o=this&&this.__setModuleDefault||(Object.create?function(e,n){Object.defineProperty(e,"default",{enumerable:!0,value:n})}:function(e,n){e.default=n}),a=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var n={};if(null!=e)for(var t in e)"default"!==t&&Object.prototype.hasOwnProperty.call(e,t)&&r(n,e,t);return o(n,e),n};Object.defineProperty(n,"__esModule",{value:!0}),n.usePanelbear=void 0;const c=a(t(7959)),i=t(1163),u=t(7294);n.usePanelbear=(e,n={})=>{const t=(0,i.useRouter)();(0,u.useEffect)((()=>{c.load(e,n),c.trackPageview();const r=()=>c.trackPageview();return t.events.on("routeChangeComplete",r),()=>{t.events.off("routeChangeComplete",r)}}),[e])}},1780:function(e,n,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/_app",function(){return t(8510)}])},8510:function(e,n,t){"use strict";t.r(n),t.d(n,{default:function(){return c}});var r=t(5893),o=(t(7284),t(4414),t(5488));function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function c(e){var n=e.Component,t=e.pageProps;return(0,o.usePanelbear)("JE5hcutbMFz"),(0,r.jsx)(n,function(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{},r=Object.keys(t);"function"===typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(t).filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable})))),r.forEach((function(n){a(e,n,t[n])}))}return e}({},t))}},4414:function(){},7284:function(){},1163:function(e,n,t){e.exports=t(387)}},function(e){var n=function(n){return e(e.s=n)};e.O(0,[774,179],(function(){return n(1780),n(387)}));var t=e.O();_N_E=t}]);