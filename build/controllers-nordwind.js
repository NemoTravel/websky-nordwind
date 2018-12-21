!function(){function e(r,n,o){function a(t,i){if(!n[t]){if(!r[t]){var c="function"==typeof require&&require;if(!i&&c)return c(t,!0);if(s)return s(t,!0);var d=new Error("Cannot find module '"+t+"'");throw d.code="MODULE_NOT_FOUND",d}var u=n[t]={exports:{}};r[t][0].call(u.exports,function(e){var n=r[t][1][e];return a(n||e)},u,u.exports,e,r,n,o)}return n[t].exports}for(var s="function"==typeof require&&require,t=0;t<o.length;t++)a(o[t]);return a}return e}()({1:[function(e,r,n){"use strict";function o(e,r){function n(){s&&(s(!0),o())}function o(){jQuery.fancybox.close()}var a=this,s=!1;a.close=o,a.submit=n,e.setOpenListener("nw-meal-popup",function(e,r){})}angular.module("app").component("nwMealPopup",{templateUrl:"components/nw-meal-popup/nw-meal-popup.html",controller:"nwMealPopupController",controllerAs:"vm",transclude:{"es-meal":"div"}}),angular.module("app").controller("nwMealPopupController",["$scope","backend",o])},{}],2:[function(e,r,n){"use strict";function o(e,r,n,o,a,s,t,i){function c(e){f.loading=!0,o.retryRegister(e).then(function(e){e.pnr&&e.lastName?r.location="./order?pnr="+e.pnr+"&lastName="+e.lastName:(e.eraseAeroexpressBecauseOfCurrency||e.eraseInsuranceBecauseOfCurrency)&&t.openHandler("popupChangeCurrencyError",!1,{eraseAeroexpressBecauseOfCurrency:e.eraseAeroexpressBecauseOfCurrency,eraseInsuranceBecauseOfCurrency:e.eraseInsuranceBecauseOfCurrency,mode:"retryRegister",submitCallback:c}),f.loading=!1},function(e){f.loading=!1,f.errorMessage=e.error})}function d(){f.orderInfo.header&&f.orderInfo.header.regnum&&f.orderInfo.header.lastName&&(f.loading=!0,o.bindOrder(f.orderInfo.header.regnum,f.orderInfo.header.lastName).then(function(){f.loading=!1,f.orderInfo.bindAlowed=!1,f.showBindOrderSuccessMessage=!0,n(function(){f.showBindOrderSuccessMessage=!1},1e4)},function(){f.loading=!1,f.showBindOrderFailMessage=!0,n(function(){f.showBindOrderFailMessage=!1},1e4)}))}function u(){o.clearSession().then(function(){s.goToSearchOrder()})}function l(){o.clearLastSearchParams().then(function(){r.location=o.getAlias("web.site.firstStepUrl")})}var f=this;f.loading=!0,f.errorMessage=!1,f.choosePayMethodFailMsg=!1,f.tabId=i(),f.openExchange=s.goToExchange,f.openRefund=s.goToRefund,f.openAddServices=s.goToAddServices,f.suffixCount=a.suffixCount,f.retryPayment=c,f.bindOrder=d,f.clearSession=u,f.newBooking=l,e.$on("popupChoosePayMethodChoosePayMethodFailMsg",function(e,r){f.choosePayMethodFailMsg=r}),e.$on("popupChoosePayMethodPending",function(e,r){f.popupChoosePayMethodPending=r}),f.$onInit=function(){var e=a.getParamFromLocation("result");"success"===e?!f.orderInfo.header||"being_paid"!==f.orderInfo.header.status&&"being_paid_for_exchange"!==f.orderInfo.header.status?f.loading=!1:o.waitPayment(f.orderInfo.header.regnum,f.orderInfo.header.lastName).then(function(){r.location="./order?pnr="+f.orderInfo.header.regnum+"&lastName="+f.orderInfo.header.lastName+"&result=success"},function(){f.loading=!1}):(!f.orderInfo.hasFailedServices&&f.orderInfo.paymentRedirectTo&&(f.showPaymentFrame=!0),f.loading=!1),!f.orderInfo.hasFailedServices||e||!f.orderInfo.header||"being_paid"!==f.orderInfo.header.status&&"booked"!==f.orderInfo.header.status||n(function(){t.openHandler("popupRemovedServicesWarningByOrder",!1,{submitCallback:function(){f.orderInfo.paymentRedirectTo&&(f.showPaymentFrame=!0),f.ignoreFailedServices=!0},disableOutsideCloseClick:!0})}),o.getParam("ffp.enable")&&(f.orderInfo.hasBonusCard||f.orderInfo.ffpSumm)&&o.ffpBonus().then(function(e){f.ffpBonus=e.total||0})}}var a=angular.module("app");a.component("orderWithEs",{templateUrl:"components/order-with-es/order-with-es.html",controller:"orderWithEsController",controllerAs:"vm",transclude:{"extra-services":"extraServicesList",payment:"div"},bindings:{orderInfo:"="}}),a.controller("orderWithEsController",["$scope","$window","$timeout","backend","utils","redirect","fancyboxTools","uniqueTabIdGenerator",o])},{}],3:[function(e,r,n){"use strict";function o(e,r,n){function o(e){e&&_.forEach(e,function(e){_.forEach(e.flights,function(e){var n=e.originport?e.originport:e.origincity,o=e.destinationport?e.destinationport:e.destinationcity,a=!1;_.forEach(l.redefineRules,function(s){_.forEach(s.routes,function(t){if(n===t.from&&o===t.to||t.from===o&&t.to===n){console.log("we redefine some rules here, check the replacWith directive"),a=!0;var i={brand:e.brand,brandAvailableProps:e.brandAvailableProps,brandUnavailableProps:e.brandUnavailableProps,brandPaidProps:e.brandPaidProps},c=r.getBrandConfig();c.filter(function(e){return e.code===i.brand})[0];_.forEach(s.brands,function(r){if(i.brand===r.brand){_.forEach(r.props,function(r){switch(r.available){case"yes":e.brandAvailableProps.push(r.name);break;case"no":e.brandUnavailableProps.push(r.name);break;case"paid":e.brandPaidProps.push(r.name)}})}})}})})})})}function a(e){l.needToRestoreBrandsInfo=!1,e&&"boolean"==typeof l.originalBrands&&(l.originalBrands=angular.copy(r.getBrandConfig()));var n=!1;s(e)&&(n=!0),n?t(e.brandsList):"boolean"!=typeof l.originalBrands&&e.brandsList&&(e.brandsList=e.brandsList.map(function(e,r){return l.originalBrands.filter(function(r){return r.code===e.code})[0]}),l.needToRestoreBrandsInfo=!0)}function s(e){var r=!1;return _.forEach(l.redefineRules,function(n){_.forEach(n.routes,function(n){_.forEach(e.segmentRows,function(e){_.forEach(e,function(e){var o=e.flightsInfo.originport?e.flightsInfo.originport:e.flightsInfo.origincity,a=e.flightsInfo.destinationport?e.flightsInfo.destinationport:e.flightsInfo.destinationcity;(o===n.from&&a===n.to||o===n.to&&a===n.from)&&(r=!0)})})})}),r}function t(e){_.forEach(l.redefineRules,function(r){_.forEach(r.brands,function(r){_.forEach(e.slice(),function(e){e.code===r.brand&&i(e,r)})})})}function i(e,r){console.log("we redefine some rules here, head to web.brandConfig.redefine"),console.log(e,r),_.forEach(e.props,function(e){r.props[e.code]&&_.extend(e,r.props[e.code])})}function c(){l.selectedVariantsInfo&&l.needToRestoreBrandsInfo&&(console.log("restoreBrandsInfo"),_.forEach(l.selectedVariantsInfo,d))}function d(e){var r=u(e.brand),n=[],o=[],a=[];_.forEach(r.props,function(e){switch(e.available){case"yes":e.shortDesc?n.push(e.shortDesc):n.push(e.name);break;case"paid":o.push(e.name);break;case"no":a.push(e.name);break;default:return}}),e.brandAvailableProps=n.slice(),e.brandPaidProps=o.slice(),e.brandUnavailableProps=a.slice()}function u(e){return l.originalBrands.filter(function(r){return r.code===e})[0]}var l=e.$parent.vm;l.originalBrands=!1,l.needToRestoreBrandsInfo=!1,r.ready.then(function(){try{var s=JSON.parse(r.getAlias("web.brandConfig.redefine"))}catch(t){console.error("redefine rules parse error",t)}l.redefineRules=s,e.$watch(angular.bind(this,function(){return l.selectedVariantsInfo}),c),e.$watch(angular.bind(this,function(){return l.searchResult}),function(e){"/search-order"!==n.path()&&a(e)}),e.$watch(angular.bind(this,function(){return l.orderInfo?l.orderInfo.flights:void 0}),function(e){o(e)})})}var a=angular.module("app");a.directive("replaceWith",function(){return{scope:!1,controllerAs:"replaceWith",bindToController:!0,scopeAs:"vm",controller:"isRouteController"}}),a.controller("isRouteController",["$scope","backend","$location",o])},{}],4:[function(e,r,n){"use strict";e("./screens/add-services/AddServicesScreenController"),e("./screens/search-order/search-order"),e("./directives/replaceWith"),e("./components/nw-meal-popup/nw-meal-popup"),e("./components/order-with-es/order-with-es"),angular.module("app").config(["$compileProvider",function(e){e.debugInfoEnabled(!0)}]),angular.module("app").run(["$rootScope","redirect","backend",function(e,r,n){e.$on("$locationChangeStart",function(e){var n=location.href.split("#")[1];n=n.split("/");var o=n[1],a=n[2],s=n[3];"add-services"===o&&a&&s&&(s=decodeURIComponent(s),r.goToSearchOrder(a,s))})}])},{"./components/nw-meal-popup/nw-meal-popup":1,"./components/order-with-es/order-with-es":2,"./directives/replaceWith":3,"./screens/add-services/AddServicesScreenController":5,"./screens/search-order/search-order":6}],5:[function(e,r,n){"use strict";angular.module("app").controller("AddServicesScreenController",["$scope","$routeParams","$window","redirect","backend","utils","fancyboxTools",function(e,r,n,o,a,s,t){function i(e){!p.agree||p.modifyServicesLoading||p.orderServicesLoading||(p.selectedPaymentForm&&p.selectedPaymentType?c(e):p.showNeedSelectPaymentFormMesage=!0)}function c(e,r,n){p.confirmLoading=!0,p.confirmError&&delete p.confirmError,a.startPaymentForExtraServices(p.selectedPaymentForm,p.selectedPaymentType,e,r,n,p.card).then(function(s){s.pnr&&s.lastName?o.goToConfirmOrder():s.eraseAeroexpressBecauseOfCurrency||s.eraseInsuranceBecauseOfCurrency?t.openHandler("popupChangeCurrencyError",!1,{eraseAeroexpressBecauseOfCurrency:s.eraseAeroexpressBecauseOfCurrency,eraseInsuranceBecauseOfCurrency:s.eraseInsuranceBecauseOfCurrency,mode:"addServices",submitCallback:i}):s.removedSvcs&&s.removedSvcs.length&&t.openHandler("popupRemovedServicesWarning",!1,{submitCallback:function(){c(e,r,n)},closeCallback:function(){a.updateOrderServices(!0)},removedSvcs:s.removedSvcs,svcsToIssue:s.svcsToIssue,noExtraServicesLeft:s.noExtraServicesLeft,disableOutsideCloseClick:!0}),p.confirmLoading=!1},function(e){"web.noBookedConfirmedExtraServices"===e.error?p.fatalError=e.error:p.confirmError=e.error,p.confirmLoading=!1})}function d(){p.showNeedSelectPaymentFormMesage=!1}function u(){return n.location.reload(),!1}function l(){a.clearSession().then(function(){o.goToSearchOrder()})}function f(){p.submitButtonHover=!p.submitButtonHover}var p=this;p.loading=!0,p.searchOrderLoading=!0,p.orderServicesLoading=!0,p.openOrder=o.goToSearchOrder,p.submitPayment=i,p.paymentFormChangeHandler=d,p.reloadPage=u,p.clearSession=l,p.swithcSubmitButtonHoverState=f,e.$on("plasticCardForPaymentChangeEvent",function(e,r){p.card=r}),a.ready.then(function(){angular.element("title").text(a.getAliasWithPrefix("web.pageTitle.","addServices")),p.loading=!1,a.clearOrderInfoListeners(),a.clearUpdateOrderServicesListeners(),a.addOrderInfoListener(function(e){p.orderInfo=e}),a.addUpdateOrderServicesListener(function(e){p.orderInfo=e[1],p.priceVariant=e[2],p.isFreePricevariant=s.isFreePricevariant(e[2]),p.isFreePricevariant&&(p.showNeedSelectPaymentFormMesage=!1),p.es=s.reformatAvailableExtraServices(e[0],p.orderInfo,p.es),p.esList=s.getAvailableExtraServicesList(e[0],p.es),p.searchOrderLoading=!1,p.orderServicesLoading=!1,a.getParam("ffp.enable")&&(p.orderInfo.hasBonusCard||p.orderInfo.ffpSumm)&&a.ffpBonus().then(function(e){p.ffpBonus=e.total||0})},function(e){p.searchOrderLoading=!1,p.orderServicesLoading=!1,p.errorMessage=e.error}),a.updateOrderServices(!0).then(function(){p.loading=!0,a.switchDefaultSelectedServices(p.esList,p.es,p.orderInfo).then(function(){p.loading=!1},function(e){p.errorMessage=e.error,p.loading=!1})}),a.addExtraServiceListener(function(e){p.modifyServicesLoading=!e,p.orderServicesLoading=!0}),a.addExtraServiceErrorListener(function(e,r){r&&"seat"===r.code||(p.modifyServicesError=e.error),p.modifyServicesLoading=!1,p.orderServicesLoading=!0})})}])},{}],6:[function(e,r,n){"use strict";function o(e,r,n,o,a,s,t){function i(e){!g.agree||g.modifyServicesLoading||g.orderServicesLoading||(g.selectedPaymentForm&&g.selectedPaymentType?c(e):g.showNeedSelectPaymentFormMesage=!0)}function c(e,r,a){g.confirmLoading=!0,g.confirmError&&delete g.confirmError,n.startPaymentForExtraServices(g.selectedPaymentForm,g.selectedPaymentType,e,r,a,g.card).then(function(s){s.pnr&&s.lastName?o.goToConfirmOrder():s.eraseAeroexpressBecauseOfCurrency||s.eraseInsuranceBecauseOfCurrency?t.openHandler("popupChangeCurrencyError",!1,{eraseAeroexpressBecauseOfCurrency:s.eraseAeroexpressBecauseOfCurrency,eraseInsuranceBecauseOfCurrency:s.eraseInsuranceBecauseOfCurrency,mode:"addServices",submitCallback:i}):s.removedSvcs&&s.removedSvcs.length&&t.openHandler("popupRemovedServicesWarning",!1,{submitCallback:function(){c(e,r,a)},closeCallback:function(){n.updateOrderServices(!0)},removedSvcs:s.removedSvcs,svcsToIssue:s.svcsToIssue,noExtraServicesLeft:s.noExtraServicesLeft,disableOutsideCloseClick:!0}),g.confirmLoading=!1},function(e){"web.noBookedConfirmedExtraServices"===e.error?g.fatalError=e.error:g.confirmError=e.error,g.confirmLoading=!1})}function d(){n.clearSession(),n.clearOrderInfo(),g.orderInfo=!1,g.showSearchForm=!0,g.partiallyAddedPassengers=[]}function u(){g.submitTouched=!0,n.getParam("site.useSearchOrderAgreeCheckbox")&&!g.searchOrderAgree||!g.searchOrderForm.$valid||(g.searchLoading=!0,g.errorMessage=!1,n.searchOrderByParams(g.searchParams,!!g.partiallyAddedPassengers.length).then(function(e){g.searchParams.flight&&g.searchParams.date?g.searchParams={flight:g.searchParams.flight,date:g.searchParams.date}:e.needToSpecifyDocument||(g.searchParams={}),g.needToSpecifyDocument=e.needToSpecifyDocument,g.showSearchForm=!1,g.submitTouched=!1,e.orderCompletelyInitialized?(g.partiallyAddedPassengers=[],l()):(e.partiallyAddedPassengers&&(g.partiallyAddedPassengers=e.partiallyAddedPassengers),g.needToSpecifyDocument&&(g.showSearchForm=!0)),g.searchLoading=!1},f))}function l(e){n.updateOrderInfo().then(function(r){r.passengers&&(g.orderInfo=r,g.showSearchForm=!1,"function"==typeof e&&e()),g.loading=!1},f)}function f(e){g.loading=!1,g.searchLoading=!1,"web.messages.emptyOrder"!==e.error&&(g.errorMessage=e.error)}function p(){n.finishSeparatePassengersSearch().then(l,f)}function m(){g.showSearchForm=!0}function h(){g.submitButtonHover=!g.submitButtonHover}var g=this;g.loading=!0,g.searchOrderLoading=!0,g.orderServicesLoading=!0,g.showSearchForm=!0,g.searchParams={},g.partiallyAddedPassengers=[],g.submitPayment=i,g.submitSearch=u,g.confirmHandler=p,g.clear=d,g.addPassenger=m,g.swithcSubmitButtonHoverState=h,n.ready.then(function(){angular.element("title").text(n.getAliasWithPrefix("web.pageTitle.","searchOrder")),g.passengerLastNameRegexp=n.applicationConstants.passengerLastNameRegexp,g.pnrOrTicketRegexp=n.applicationConstants.pnrOrTicketRegexp,g.ticketRegexp=n.applicationConstants.ticketRegexp,r.pnrOrTicketNumber&&r.lastName&&"LAST_NAME_PNR_TICKET"===n.getParam("site.searchOrdersBy")?(g.searchParams.pnrOrTicketNumber=r.pnrOrTicketNumber,g.searchParams.lastName=r.lastName,g.loading=!1,a(u)):l(),n.clearOrderInfoListeners(),n.clearUpdateOrderServicesListeners(),n.addOrderInfoListener(function(e){g.orderInfo=e}),n.addUpdateOrderServicesListener(function(e){g.orderInfo=e[1],g.priceVariant=e[2],g.isFreePricevariant=s.isFreePricevariant(e[2]),g.isFreePricevariant&&(g.showNeedSelectPaymentFormMesage=!1),g.es=s.reformatAvailableExtraServices(e[0],g.orderInfo,g.es),g.esList=s.getAvailableExtraServicesList(e[0],g.es),g.searchOrderLoading=!1,g.orderServicesLoading=!1,n.getParam("ffp.enable")&&(g.orderInfo.hasBonusCard||g.orderInfo.ffpSumm)&&n.ffpBonus().then(function(e){g.ffpBonus=e.total||0})},function(e){g.searchOrderLoading=!1,g.orderServicesLoading=!1,g.errorMessage=e.error}),n.updateOrderServices(!0).then(function(){g.loading=!0,n.switchDefaultSelectedServices(g.esList,g.es,g.orderInfo).then(function(){g.loading=!1},function(e){g.errorMessage=e.error,g.loading=!1})}),n.addExtraServiceListener(function(e){g.modifyServicesLoading=!e,g.orderServicesLoading=!0}),n.addExtraServiceErrorListener(function(e,r){r&&"seat"===r.code||(g.modifyServicesError=e.error),g.modifyServicesLoading=!1,g.orderServicesLoading=!0})})}angular.module("app").controller("SearchOrderScreenController",["$scope","$routeParams","backend","redirect","$timeout","utils","fancyboxTools",o])},{}]},{},[4]);
//# sourceMappingURL=controllers-nordwind.js.map
