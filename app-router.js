'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if('value'in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor}}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function')}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')}return call&&(typeof call==='object'||typeof call==='function')?call:self}function _inherits(subClass,superClass){if(typeof superClass!=='function'&&superClass!==null){throw new TypeError('Super expression must either be null or a function, not '+typeof superClass)}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass}(function(window,document){var utilities={};var importedURIs={};var isIE='ActiveXObject'in window;var isEdge=!!window.navigator.userAgent.match(/Edge/);var previousUrl={};var AppRoute=function(_HTMLElement){_inherits(AppRoute,_HTMLElement);function AppRoute(){_classCallCheck(this,AppRoute);return _possibleConstructorReturn(this,(AppRoute.__proto__||Object.getPrototypeOf(AppRoute)).apply(this,arguments))}return AppRoute}(HTMLElement);;window.customElements.define('app-route',AppRoute);var AppRouter=function(_HTMLElement2){_inherits(AppRouter,_HTMLElement2);function AppRouter(){_classCallCheck(this,AppRouter);return _possibleConstructorReturn(this,(AppRouter.__proto__||Object.getPrototypeOf(AppRouter)).apply(this,arguments))}_createClass(AppRouter,[{key:'connectedCallback',value:function connectedCallback(){if(this.getAttribute('init')!=='manual'){this.init()}}},{key:'disconnectedCallback',value:function disconnectedCallback(){window.removeEventListener('popstate',this.stateChangeHandler,false);if(isIE||isEdge){window.removeEventListener('hashchange',this.stateChangeHandler,false)}}},{key:'init',value:function init(){var router=this;if(router.isInitialized){return}router.isInitialized=true;if(!router.hasAttribute('trailingSlash')){router.setAttribute('trailingSlash','strict')}if(!router.hasAttribute('mode')){router.setAttribute('mode','auto')}if(!router.hasAttribute('typecast')){router.setAttribute('typecast','auto')}if(!router.hasAttribute('scroll-to-hash')){router.setAttribute('scroll-to-hash','auto')}router.stateChangeHandler=stateChange.bind(null,router);window.addEventListener('popstate',router.stateChangeHandler,false);if(isIE||isEdge){window.addEventListener('hashchange',router.stateChangeHandler,false)}stateChange(router)}},{key:'go',value:function go(path,options){if(this.getAttribute('mode')!=='pushstate'){if(this.getAttribute('mode')==='hashbang'){path='#!'+path}else{path='#'+path}}var currentState=window.history.state;if(options&&options.replace===true){window.history.replaceState(currentState,null,path)}else{window.history.pushState(currentState,null,path)}try{var popstateEvent=new PopStateEvent('popstate',{bubbles:false,cancelable:false,state:currentState});if('dispatchEvent_'in window){window.dispatchEvent_(popstateEvent)}else{window.dispatchEvent(popstateEvent)}}catch(error){var fallbackEvent=document.createEvent('CustomEvent');fallbackEvent.initCustomEvent('popstate',false,false,{state:currentState});window.dispatchEvent(fallbackEvent)}}},{key:'util',get:function get(){return utilities}}]);return AppRouter}(HTMLElement);;window.customElements.define('app-router',AppRouter);function fire(type,detail,node){var event=document.createEvent('CustomEvent');event.initCustomEvent(type,false,true,detail);return node.dispatchEvent(event)}function stateChange(router){var url=utilities.parseUrl(window.location.href,router.getAttribute('mode'));if(url.hash!==previousUrl.hash&&url.path===previousUrl.path&&url.search===previousUrl.search&&url.isHashPath===previousUrl.isHashPath){if(router.getAttribute('scroll-to-hash')!=='disabled'){scrollToHash(url.hash)}previousUrl=url;return}previousUrl=url;var eventDetail={path:url.path,state:window.history.state};if(!fire('state-change',eventDetail,router)){return}var route=router.firstElementChild;while(route){if(route.tagName==='APP-ROUTE'&&utilities.testRoute(route.getAttribute('path'),url.path,router.getAttribute('trailingSlash'),route.hasAttribute('regex'))){activateRoute(router,route,url);return}route=route.nextSibling}fire('not-found',eventDetail,router)}function activateRoute(router,route,url){if(route.hasAttribute('redirect')){router.go(route.getAttribute('redirect'),{replace:true});return}if(route===router.activeRoute&&route.getAttribute('onUrlChange')==='noop'){return}var eventDetail={path:url.path,route:route,oldRoute:router.activeRoute,state:window.history.state};if(!fire('activate-route-start',eventDetail,router)){return}if(!fire('activate-route-start',eventDetail,route)){return}router.loadingRoute=route;if(route===router.activeRoute&&route.getAttribute('onUrlChange')==='updateModel'){updateModelAndActivate(router,route,url,eventDetail)}else if(route.hasAttribute('import')){importAndActivate(router,route.getAttribute('import'),route,url,eventDetail)}else if(route.hasAttribute('element')){activateCustomElement(router,route.getAttribute('element'),route,url,eventDetail)}else if(route.firstElementChild&&route.firstElementChild.tagName==='TEMPLATE'){route.isInlineTemplate=true;activateTemplate(router,route.firstElementChild,route,url,eventDetail)}}function updateModelAndActivate(router,route,url,eventDetail){var model=createModel(router,route,url,eventDetail);if(route.hasAttribute('template')||route.isInlineTemplate){setObjectProperties(route.lastElementChild.templateInstance.model,model)}else{setObjectProperties(route.firstElementChild,model)}fire('activate-route-end',eventDetail,router);fire('activate-route-end',eventDetail,eventDetail.route)}function importAndActivate(router,importUri,route,url,eventDetail){var importLink;function importLoadedCallback(){importLink.loaded=true;activateImport(router,importLink,importUri,route,url,eventDetail)}function importErrorCallback(event){var errorDetail={errorEvent:event,importUri:importUri,routeDetail:eventDetail};fire('import-error',errorDetail,router);fire('import-error',errorDetail,route)}if(!importedURIs.hasOwnProperty(importUri)){importLink=document.createElement('link');importLink.setAttribute('rel','import');importLink.setAttribute('href',importUri);importLink.setAttribute('async','async');importLink.addEventListener('load',importLoadedCallback);importLink.addEventListener('error',importErrorCallback);importLink.loaded=false;document.head.appendChild(importLink);importedURIs[importUri]=importLink}else{importLink=importedURIs[importUri];if(!importLink.loaded){importLink.addEventListener('load',importLoadedCallback);importLink.addEventListener('error',importErrorCallback)}else{activateImport(router,importLink,importUri,route,url,eventDetail)}}}function activateImport(router,importLink,importUri,route,url,eventDetail){route.importLink=importLink;if(route===router.loadingRoute){if(route.hasAttribute('template')){var templateId=route.getAttribute('template');var template;if(templateId){template=importLink.import.getElementById(templateId)}else{template=importLink.import.querySelector('template')}activateTemplate(router,template,route,url,eventDetail)}else{activateCustomElement(router,route.getAttribute('element')||importUri.split('/').slice(-1)[0].replace('.html',''),route,url,eventDetail)}}}function activateCustomElement(router,elementName,route,url,eventDetail){var customElement=document.createElement(elementName);var model=createModel(router,route,url,eventDetail);setObjectProperties(customElement,model);activateElement(router,customElement,url,eventDetail)}function activateTemplate(router,template,route,url,eventDetail){var templateInstance;if('createInstance'in template){var model=createModel(router,route,url,eventDetail);templateInstance=template.createInstance(model)}else{templateInstance=document.importNode(template.content,true)}activateElement(router,templateInstance,url,eventDetail)}function createModel(router,route,url,eventDetail){var model=utilities.routeArguments(route.getAttribute('path'),url.path,url.search,route.hasAttribute('regex'),router.getAttribute('typecast')==='auto');if(route.hasAttribute('bindRouter')||router.hasAttribute('bindRouter')){model.router=router}eventDetail.model=model;fire('before-data-binding',eventDetail,router);fire('before-data-binding',eventDetail,eventDetail.route);return eventDetail.model}function setObjectProperties(object,model){for(var property in model){if(model.hasOwnProperty(property)){object[property]=model[property]}}}function activateElement(router,element,url,eventDetail){deactivateRoute(router.previousRoute);router.previousRoute=router.activeRoute;router.activeRoute=router.loadingRoute;router.loadingRoute=null;if(router.previousRoute){router.previousRoute.removeAttribute('active')}router.activeRoute.setAttribute('active','active');if(eventDetail.route!==eventDetail.oldRoute){deactivateRoute(router.previousRoute)}router.activeRoute.appendChild(element);if(url.hash&&router.getAttribute('scroll-to-hash')!=='disabled'){scrollToHash(url.hash)}fire('activate-route-end',eventDetail,router);fire('activate-route-end',eventDetail,eventDetail.route)}function deactivateRoute(route){if(route){var node=route.firstChild;if(route.isInlineTemplate){node=route.querySelector('template').nextSibling}while(node){var nodeToRemove=node;node=node.nextSibling;route.removeChild(nodeToRemove)}}}function scrollToHash(hash){if(!hash)return;setTimeout(function(){var hashElement;try{hashElement=document.querySelector('html /deep/ '+hash)||document.querySelector('html /deep/ [name="'+hash.substring(1)+'"]')}catch(e){hashElement=document.querySelector(hash)||document.querySelector('[name="'+hash.substring(1)+'"]')}if(hashElement&&hashElement.scrollIntoView){hashElement.scrollIntoView(true)}},0)}utilities.parseUrl=function(location,mode){var url={isHashPath:mode==='hash'};if(typeof URL==='function'){var nativeUrl=new URL(location);url.path=nativeUrl.pathname;url.hash=nativeUrl.hash;url.search=nativeUrl.search}else{var anchor=document.createElement('a');anchor.href=location;url.path=anchor.pathname;if(url.path.charAt(0)!=='/'){url.path='/'+url.path}url.hash=anchor.hash;url.search=anchor.search}if(mode!=='pushstate'){if(url.hash.substring(0,2)==='#/'){url.isHashPath=true;url.path=url.hash.substring(1)}else if(url.hash.substring(0,3)==='#!/'){url.isHashPath=true;url.path=url.hash.substring(2)}else if(url.isHashPath){if(url.hash.length===0){url.path='/'}else{url.path=url.hash.substring(1)}}if(url.isHashPath){url.hash='';var secondHashIndex=url.path.indexOf('#');if(secondHashIndex!==-1){url.hash=url.path.substring(secondHashIndex);url.path=url.path.substring(0,secondHashIndex)}var searchIndex=url.path.indexOf('?');if(searchIndex!==-1){url.search=url.path.substring(searchIndex);url.path=url.path.substring(0,searchIndex)}}}return url};utilities.testRoute=function(routePath,urlPath,trailingSlashOption,isRegExp){if(trailingSlashOption==='ignore'){if(urlPath.slice(-1)==='/'){urlPath=urlPath.slice(0,-1)}if(routePath.slice(-1)==='/'&&!isRegExp){routePath=routePath.slice(0,-1)}}if(isRegExp){return utilities.testRegExString(routePath,urlPath)}if(routePath===urlPath||routePath==='*'){return true}if(routePath.charAt(0)!=='/'){routePath='/**/'+routePath}return segmentsMatch(routePath.split('/'),1,urlPath.split('/'),1)};function segmentsMatch(routeSegments,routeIndex,urlSegments,urlIndex,pathVariables){var routeSegment=routeSegments[routeIndex];var urlSegment=urlSegments[urlIndex];if(routeSegment==='**'&&routeIndex===routeSegments.length-1){return true}if(typeof routeSegment==='undefined'||typeof urlSegment==='undefined'){return routeSegment===urlSegment}if(routeSegment===urlSegment||routeSegment==='*'||routeSegment.charAt(0)===':'){if(routeSegment.charAt(0)===':'&&typeof pathVariables!=='undefined'){pathVariables[routeSegment.substring(1)]=urlSegments[urlIndex]}return segmentsMatch(routeSegments,routeIndex+1,urlSegments,urlIndex+1,pathVariables)}if(routeSegment==='**'){for(var i=urlIndex;i<urlSegments.length;i++){if(segmentsMatch(routeSegments,routeIndex+1,urlSegments,i,pathVariables)){return true}}}return false}utilities.routeArguments=function(routePath,urlPath,search,isRegExp,typecast){var args={};if(!isRegExp){if(routePath.charAt(0)!=='/'){routePath='/**/'+routePath}segmentsMatch(routePath.split('/'),1,urlPath.split('/'),1,args)}var queryParameters=search.substring(1).split('&');if(queryParameters.length===1&&queryParameters[0]===''){queryParameters=[]}for(var i=0;i<queryParameters.length;i++){var queryParameter=queryParameters[i];var queryParameterParts=queryParameter.split('=');args[queryParameterParts[0]]=queryParameterParts.splice(1,queryParameterParts.length-1).join('=')}if(typecast){for(var arg in args){args[arg]=utilities.typecast(args[arg])}}return args};utilities.typecast=function(value){if(value==='true'){return true}if(value==='false'){return false}if(!isNaN(value)&&value!==''&&value.charAt(0)!=='0'){return+value}return decodeURIComponent(value)};utilities.testRegExString=function(pattern,value){if(pattern.charAt(0)!=='/'){return false}pattern=pattern.slice(1);var options='';if(pattern.slice(-1)==='/'){pattern=pattern.slice(0,-1)}else if(pattern.slice(-2)==='/i'){pattern=pattern.slice(0,-2);options='i'}else{return false}return new RegExp(pattern,options).test(value)}})(window,document);