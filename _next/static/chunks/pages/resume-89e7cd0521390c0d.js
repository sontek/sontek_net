(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[647],{4184:function(e,n){var r;!function(){"use strict";var t={}.hasOwnProperty;function i(){for(var e=[],n=0;n<arguments.length;n++){var r=arguments[n];if(r){var s=typeof r;if("string"===s||"number"===s)e.push(r);else if(Array.isArray(r)&&r.length){var l=i.apply(null,r);l&&e.push(l)}else if("object"===s)for(var c in r)t.call(r,c)&&r[c]&&e.push(c)}}return e.join(" ")}e.exports?(i.default=i,e.exports=i):void 0===(r=function(){return i}.apply(n,[]))||(e.exports=r)}()},2416:function(e,n,r){(window.__NEXT_P=window.__NEXT_P||[]).push(["/resume",function(){return r(3175)}])},8418:function(e,n,r){"use strict";function t(e,n){return function(e){if(Array.isArray(e))return e}(e)||function(e,n){var r=[],t=!0,i=!1,s=void 0;try{for(var l,c=e[Symbol.iterator]();!(t=(l=c.next()).done)&&(r.push(l.value),!n||r.length!==n);t=!0);}catch(o){i=!0,s=o}finally{try{t||null==c.return||c.return()}finally{if(i)throw s}}return r}(e,n)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}n.default=void 0;var i,s=(i=r(7294))&&i.__esModule?i:{default:i},l=r(6273),c=r(387),o=r(7190);var a={};function u(e,n,r,t){if(e&&l.isLocalURL(n)){e.prefetch(n,r,t).catch((function(e){0}));var i=t&&"undefined"!==typeof t.locale?t.locale:e&&e.locale;a[n+"%"+r+(i?"%"+i:"")]=!0}}var f=function(e){var n,r=!1!==e.prefetch,i=c.useRouter(),f=s.default.useMemo((function(){var n=t(l.resolveHref(i,e.href,!0),2),r=n[0],s=n[1];return{href:r,as:e.as?l.resolveHref(i,e.as):s||r}}),[i,e.href,e.as]),d=f.href,h=f.as,p=e.children,v=e.replace,m=e.shallow,j=e.scroll,x=e.locale;"string"===typeof p&&(p=s.default.createElement("a",null,p));var y=(n=s.default.Children.only(p))&&"object"===typeof n&&n.ref,_=t(o.useIntersection({rootMargin:"200px"}),2),b=_[0],g=_[1],k=s.default.useCallback((function(e){b(e),y&&("function"===typeof y?y(e):"object"===typeof y&&(y.current=e))}),[y,b]);s.default.useEffect((function(){var e=g&&r&&l.isLocalURL(d),n="undefined"!==typeof x?x:i&&i.locale,t=a[d+"%"+h+(n?"%"+n:"")];e&&!t&&u(i,d,h,{locale:n})}),[h,d,g,x,r,i]);var w={ref:k,onClick:function(e){n.props&&"function"===typeof n.props.onClick&&n.props.onClick(e),e.defaultPrevented||function(e,n,r,t,i,s,c,o){("A"!==e.currentTarget.nodeName||!function(e){var n=e.currentTarget.target;return n&&"_self"!==n||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.nativeEvent&&2===e.nativeEvent.which}(e)&&l.isLocalURL(r))&&(e.preventDefault(),null==c&&t.indexOf("#")>=0&&(c=!1),n[i?"replace":"push"](r,t,{shallow:s,locale:o,scroll:c}))}(e,i,d,h,v,m,j,x)},onMouseEnter:function(e){l.isLocalURL(d)&&(n.props&&"function"===typeof n.props.onMouseEnter&&n.props.onMouseEnter(e),u(i,d,h,{priority:!0}))}};if(e.passHref||"a"===n.type&&!("href"in n.props)){var N="undefined"!==typeof x?x:i&&i.locale,E=i&&i.isLocaleDomain&&l.getDomainLocale(h,N,i&&i.locales,i&&i.domainLocales);w.href=E||l.addBasePath(l.addLocale(h,N,i&&i.defaultLocale))}return s.default.cloneElement(n,w)};n.default=f},7190:function(e,n,r){"use strict";function t(e,n){return function(e){if(Array.isArray(e))return e}(e)||function(e,n){var r=[],t=!0,i=!1,s=void 0;try{for(var l,c=e[Symbol.iterator]();!(t=(l=c.next()).done)&&(r.push(l.value),!n||r.length!==n);t=!0);}catch(o){i=!0,s=o}finally{try{t||null==c.return||c.return()}finally{if(i)throw s}}return r}(e,n)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}Object.defineProperty(n,"__esModule",{value:!0}),n.useIntersection=function(e){var n=e.rootMargin,r=e.disabled||!l,o=i.useRef(),a=t(i.useState(!1),2),u=a[0],f=a[1],d=i.useCallback((function(e){o.current&&(o.current(),o.current=void 0),r||u||e&&e.tagName&&(o.current=function(e,n,r){var t=function(e){var n=e.rootMargin||"",r=c.get(n);if(r)return r;var t=new Map,i=new IntersectionObserver((function(e){e.forEach((function(e){var n=t.get(e.target),r=e.isIntersecting||e.intersectionRatio>0;n&&r&&n(r)}))}),e);return c.set(n,r={id:n,observer:i,elements:t}),r}(r),i=t.id,s=t.observer,l=t.elements;return l.set(e,n),s.observe(e),function(){l.delete(e),s.unobserve(e),0===l.size&&(s.disconnect(),c.delete(i))}}(e,(function(e){return e&&f(e)}),{rootMargin:n}))}),[r,n,u]);return i.useEffect((function(){if(!l&&!u){var e=s.requestIdleCallback((function(){return f(!0)}));return function(){return s.cancelIdleCallback(e)}}}),[u]),[d,u]};var i=r(7294),s=r(9311),l="undefined"!==typeof IntersectionObserver;var c=new Map},3175:function(e,n,r){"use strict";r.r(n),r.d(n,{__N_SSG:function(){return p},default:function(){return v}});var t=r(5893),i=(r(7294),r(7094)),s=r.n(i),l=r(8024),c=r(4184),o=r.n(c);function a(e,n,r){return n in e?Object.defineProperty(e,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[n]=r,e}function u(e){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{},t=Object.keys(r);"function"===typeof Object.getOwnPropertySymbols&&(t=t.concat(Object.getOwnPropertySymbols(r).filter((function(e){return Object.getOwnPropertyDescriptor(r,e).enumerable})))),t.forEach((function(n){a(e,n,r[n])}))}return e}function f(e){return(0,t.jsxs)("div",{className:s().historyItem,children:[(0,t.jsx)("h2",{children:e.name}),(0,t.jsx)("small",{children:e.dates}),(0,t.jsx)("p",{children:(0,t.jsx)("strong",{children:e.title})}),e.description.split("\n").map((function(e){return(0,t.jsx)("p",{children:e})})),(0,t.jsxs)("div",{className:s().accomplishments,children:[(0,t.jsx)("h3",{children:"Accomplishments"}),(0,t.jsx)("ul",{children:e.accomplishments.map((function(e){return(0,t.jsx)("li",{children:e})}))})]})]})}function d(e){return(0,t.jsxs)("div",{className:s().history,children:[(0,t.jsx)("h1",{children:"Work History"}),e.companies.map((function(e){return(0,t.jsx)(f,u({},e))}))]})}function h(e){return(0,t.jsxs)("div",{className:"grid",children:[(0,t.jsxs)("div",{className:o()("col",s().col),children:[(0,t.jsx)("h2",{children:e.name}),(0,t.jsxs)("p",{children:["Location: ",e.location.city]}),(0,t.jsx)("small",{children:e.description}),(0,t.jsxs)("div",{className:s().skills,children:[(0,t.jsx)("h3",{children:"Top Skills:"}),e.skills.map((function(e){return(0,t.jsx)("span",{className:s().skill,children:e},e)}))]})]}),(0,t.jsx)("div",{className:s().col,children:(0,t.jsxs)("div",{children:[(0,t.jsx)("h2",{children:"Contact Information"}),(0,t.jsx)("ul",{children:Object.keys(e.contact).map((function(n){return"email"===n?(0,t.jsx)("li",{children:e.contact[n]},n):(0,t.jsx)("li",{children:(0,t.jsx)("a",{href:e.contact[n],target:"_blank",rel:"noopener",children:e.contact[n]})},n)}))})]})})]})}var p=!0;function v(e){var n=e.resumeDetails;return(0,t.jsx)(l.Z,{children:(0,t.jsx)("div",{className:s().resume,children:(0,t.jsxs)("div",{className:"container",children:[(0,t.jsx)(h,u({},n.about)),(0,t.jsx)(d,u({},n.history))]})})})}},8024:function(e,n,r){"use strict";r.d(n,{Z:function(){return l}});var t=r(5893),i=r(1664);function s(){return(0,t.jsx)(t.Fragment,{children:(0,t.jsxs)("div",{className:"grid",children:[(0,t.jsx)("div",{className:"col",children:(0,t.jsx)("header",{id:"banner",className:"body",children:(0,t.jsx)("h1",{children:(0,t.jsx)("a",{href:"/",children:"sontek.net"})})})}),(0,t.jsx)("div",{className:"col menu",children:(0,t.jsx)("nav",{children:(0,t.jsxs)("ul",{children:[(0,t.jsx)("li",{children:(0,t.jsx)(i.default,{href:"/",children:(0,t.jsx)("a",{children:"Home"})})}),(0,t.jsx)("li",{children:(0,t.jsx)(i.default,{href:"/blog",children:(0,t.jsx)("a",{children:"Blog"})})}),(0,t.jsx)("li",{children:(0,t.jsx)(i.default,{href:"/resume",children:(0,t.jsx)("a",{children:"Resume"})})}),(0,t.jsx)("li",{children:(0,t.jsx)(i.default,{href:"/about",children:(0,t.jsx)("a",{children:"About"})})})]})})})]})})}function l(e){var n=e.children;return(0,t.jsxs)("div",{children:[(0,t.jsx)(s,{}),(0,t.jsx)("div",{className:"container",children:n})]})}},7094:function(e){e.exports={loading:"resume_loading__2mfPa",spin:"resume_spin__2lw_A",resume:"resume_resume__3D9yM",col:"resume_col__1J_FW",skills:"resume_skills__32hWf",skill:"resume_skill__1vsYB",history:"resume_history__LntUm",historyItem:"resume_historyItem__2ypoX"}},1664:function(e,n,r){e.exports=r(8418)}},function(e){e.O(0,[774,888,179],(function(){return n=2416,e(e.s=n);var n}));var n=e.O();_N_E=n}]);