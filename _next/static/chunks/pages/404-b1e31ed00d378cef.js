(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[197],{2448:function(e,r,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/404",function(){return n(1635)}])},8418:function(e,r,n){"use strict";function t(e,r){(null==r||r>e.length)&&(r=e.length);for(var n=0,t=new Array(r);n<r;n++)t[n]=e[n];return t}function o(e,r){return function(e){if(Array.isArray(e))return e}(e)||function(e,r){var n=null==e?null:"undefined"!==typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=n){var t,o,a=[],i=!0,l=!1;try{for(n=n.call(e);!(i=(t=n.next()).done)&&(a.push(t.value),!r||a.length!==r);i=!0);}catch(u){l=!0,o=u}finally{try{i||null==n.return||n.return()}finally{if(l)throw o}}return a}}(e,r)||function(e,r){if(!e)return;if("string"===typeof e)return t(e,r);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(n);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return t(e,r)}(e,r)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}r.default=void 0;var a,i=(a=n(7294))&&a.__esModule?a:{default:a},l=n(6273),u=n(387),c=n(7190);var f={};function s(e,r,n,t){if(e&&l.isLocalURL(r)){e.prefetch(r,n,t).catch((function(e){0}));var o=t&&"undefined"!==typeof t.locale?t.locale:e&&e.locale;f[r+"%"+n+(o?"%"+o:"")]=!0}}var d=function(e){var r,n=!1!==e.prefetch,t=u.useRouter(),a=i.default.useMemo((function(){var r=o(l.resolveHref(t,e.href,!0),2),n=r[0],a=r[1];return{href:n,as:e.as?l.resolveHref(t,e.as):a||n}}),[t,e.href,e.as]),d=a.href,h=a.as,p=e.children,v=e.replace,y=e.shallow,m=e.scroll,b=e.locale;"string"===typeof p&&(p=i.default.createElement("a",null,p));var g=(r=i.default.Children.only(p))&&"object"===typeof r&&r.ref,j=o(c.useIntersection({rootMargin:"200px"}),2),x=j[0],w=j[1],E=i.default.useCallback((function(e){x(e),g&&("function"===typeof g?g(e):"object"===typeof g&&(g.current=e))}),[g,x]);i.default.useEffect((function(){var e=w&&n&&l.isLocalURL(d),r="undefined"!==typeof b?b:t&&t.locale,o=f[d+"%"+h+(r?"%"+r:"")];e&&!o&&s(t,d,h,{locale:r})}),[h,d,w,b,n,t]);var _={ref:E,onClick:function(e){r.props&&"function"===typeof r.props.onClick&&r.props.onClick(e),e.defaultPrevented||function(e,r,n,t,o,a,i,u){("A"!==e.currentTarget.nodeName.toUpperCase()||!function(e){var r=e.currentTarget.target;return r&&"_self"!==r||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.nativeEvent&&2===e.nativeEvent.which}(e)&&l.isLocalURL(n))&&(e.preventDefault(),r[o?"replace":"push"](n,t,{shallow:a,locale:u,scroll:i}))}(e,t,d,h,v,y,m,b)},onMouseEnter:function(e){r.props&&"function"===typeof r.props.onMouseEnter&&r.props.onMouseEnter(e),l.isLocalURL(d)&&s(t,d,h,{priority:!0})}};if(e.passHref||"a"===r.type&&!("href"in r.props)){var A="undefined"!==typeof b?b:t&&t.locale,I=t&&t.isLocaleDomain&&l.getDomainLocale(h,A,t&&t.locales,t&&t.domainLocales);_.href=I||l.addBasePath(l.addLocale(h,A,t&&t.defaultLocale))}return i.default.cloneElement(r,_)};r.default=d},7190:function(e,r,n){"use strict";function t(e,r){(null==r||r>e.length)&&(r=e.length);for(var n=0,t=new Array(r);n<r;n++)t[n]=e[n];return t}function o(e,r){return function(e){if(Array.isArray(e))return e}(e)||function(e,r){var n=null==e?null:"undefined"!==typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=n){var t,o,a=[],i=!0,l=!1;try{for(n=n.call(e);!(i=(t=n.next()).done)&&(a.push(t.value),!r||a.length!==r);i=!0);}catch(u){l=!0,o=u}finally{try{i||null==n.return||n.return()}finally{if(l)throw o}}return a}}(e,r)||function(e,r){if(!e)return;if("string"===typeof e)return t(e,r);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(n);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return t(e,r)}(e,r)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}Object.defineProperty(r,"__esModule",{value:!0}),r.useIntersection=function(e){var r=e.rootRef,n=e.rootMargin,t=e.disabled||!l,f=a.useRef(),s=o(a.useState(!1),2),d=s[0],h=s[1],p=o(a.useState(r?r.current:null),2),v=p[0],y=p[1],m=a.useCallback((function(e){f.current&&(f.current(),f.current=void 0),t||d||e&&e.tagName&&(f.current=function(e,r,n){var t=function(e){var r,n={root:e.root||null,margin:e.rootMargin||""},t=c.find((function(e){return e.root===n.root&&e.margin===n.margin}));t?r=u.get(t):(r=u.get(n),c.push(n));if(r)return r;var o=new Map,a=new IntersectionObserver((function(e){e.forEach((function(e){var r=o.get(e.target),n=e.isIntersecting||e.intersectionRatio>0;r&&n&&r(n)}))}),e);return u.set(n,r={id:n,observer:a,elements:o}),r}(n),o=t.id,a=t.observer,i=t.elements;return i.set(e,r),a.observe(e),function(){if(i.delete(e),a.unobserve(e),0===i.size){a.disconnect(),u.delete(o);var r=c.findIndex((function(e){return e.root===o.root&&e.margin===o.margin}));r>-1&&c.splice(r,1)}}}(e,(function(e){return e&&h(e)}),{root:v,rootMargin:n}))}),[t,v,n,d]);return a.useEffect((function(){if(!l&&!d){var e=i.requestIdleCallback((function(){return h(!0)}));return function(){return i.cancelIdleCallback(e)}}}),[d]),a.useEffect((function(){r&&y(r.current)}),[r]),[m,d]};var a=n(7294),i=n(9311),l="undefined"!==typeof IntersectionObserver;var u=new Map,c=[]},1635:function(e,r,n){"use strict";n.r(r),n.d(r,{default:function(){return a}});var t=n(5893),o=n(8024);function a(){return(0,t.jsx)(o.Z,{children:(0,t.jsx)("h1",{children:"404 - Page Not Found"})})}},8024:function(e,r,n){"use strict";n.d(r,{Z:function(){return i}});var t=n(5893),o=n(1664);function a(){return(0,t.jsx)(t.Fragment,{children:(0,t.jsxs)("div",{className:"grid",children:[(0,t.jsx)("div",{className:"col",children:(0,t.jsx)("header",{id:"banner",className:"body",children:(0,t.jsx)("h1",{children:(0,t.jsx)("a",{href:"/",children:"sontek.net"})})})}),(0,t.jsx)("div",{className:"col menu",children:(0,t.jsx)("nav",{children:(0,t.jsxs)("ul",{children:[(0,t.jsx)("li",{children:(0,t.jsx)(o.default,{href:"/",children:(0,t.jsx)("a",{children:"Home"})})}),(0,t.jsx)("li",{children:(0,t.jsx)(o.default,{href:"/blog",children:(0,t.jsx)("a",{children:"Blog"})})}),(0,t.jsx)("li",{children:(0,t.jsx)(o.default,{href:"/resume",children:(0,t.jsx)("a",{children:"Resume"})})}),(0,t.jsx)("li",{children:(0,t.jsx)(o.default,{href:"/about",children:(0,t.jsx)("a",{children:"About"})})})]})})})]})})}function i(e){var r=e.children;return(0,t.jsxs)("div",{children:[(0,t.jsx)(a,{}),(0,t.jsx)("div",{className:"container",children:r})]})}},1664:function(e,r,n){e.exports=n(8418)}},function(e){e.O(0,[774,888,179],(function(){return r=2448,e(e.s=r);var r}));var r=e.O();_N_E=r}]);