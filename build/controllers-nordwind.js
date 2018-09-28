!function(){function e(r,n,a){function o(t,i){if(!n[t]){if(!r[t]){var c="function"==typeof require&&require;if(!i&&c)return c(t,!0);if(s)return s(t,!0);var d=new Error("Cannot find module '"+t+"'");throw d.code="MODULE_NOT_FOUND",d}var l=n[t]={exports:{}};r[t][0].call(l.exports,function(e){var n=r[t][1][e];return o(n||e)},l,l.exports,e,r,n,a)}return n[t].exports}for(var s="function"==typeof require&&require,t=0;t<a.length;t++)o(a[t]);return o}return e}()({1:[function(e,r,n){"use strict";function a(e,r,n){function a(){var e=_.find(c.es,{code:"insurance"});c.service=c.es.insurance,e.active=!e.active,console.log(e),e.active?1===e.items.length&&r.modifyExtraService(o(e.items[0])):r.removeExtraService({code:e.onlineMode?"insuranceOnline":"insurance"})}function o(e,r){var n={code:"insurance",ins:e.ins,tins:e.tins};return r&&(n.passenger_id=r),c.service.onlineMode&&(n.code="insuranceOnline",n.productCode=e.productCode),n}function s(){_.forEach(c.es,function(e){e.active=!0})}function t(e,r){c.selected=e}function i(){c.selected=null}var c=this;c.selected=null,c.handleEsSelect=t,c.closePopup=i,c.addInsurance=a,r.ready.then(function(){r.addExtraServiceListener(function(e){e&&r.updateOrderInfo().then(function(e){c.orderInfo=e})}),r.getExtraServices().then(function(e){c.extraServicesList=e.extraServices.slice(),c.es=n.reformatAvailableExtraServices(e.extraServices.slice(),c.orderInfo,void 0),s(),c.loading=!1})})}angular.module("app").component("nordwindEs",{templateUrl:"components/nordwind-es/nordwind-es.html",bindings:{orderInfo:"=",loading:"="},controller:["$scope","backend","utils",a],controllerAs:"vm"})},{}],2:[function(e,r,n){"use strict";function a(e){var r=this;e.ready.then(function(){e.getExtraServices().then(function(e){r.extraServicesList=e.slice()})})}angular.module("app").component("nordwindMeal",{templateUrl:"components/nordwind-meal/nordwind-meal.html",bindings:{service:"="},controller:["backend",a],controllerAs:"vm"})},{}],3:[function(e,r,n){"use strict";function a(e){}var o=angular.module("app");o.directive("switchInsurance",function(){return{controller:"switchInsuranceCtrl",scope:{service:"="},bindToController:!0,controllerAs:"vm"}}),o.controller("switchInsuranceCtrl",["$scope",a])},{}],4:[function(e,r,n){"use strict";e("./screens/add-services/AddServicesScreenController"),e("./screens/search-order/search-order"),e("./components/nordwind-es/nordwind-es"),e("./components/nordwind-meal/nordwind-meal"),e("./directives/switchInsurance")},{"./components/nordwind-es/nordwind-es":1,"./components/nordwind-meal/nordwind-meal":2,"./directives/switchInsurance":3,"./screens/add-services/AddServicesScreenController":5,"./screens/search-order/search-order":6}],5:[function(e,r,n){"use strict";angular.module("app").controller("AddServicesScreenController",["$scope","$routeParams","$window","redirect","backend","utils","fancyboxTools",function(e,r,n,a,o,s,t){function i(){o.addOrderInfoListener(function(e){p.orderInfo=e}),o.addUpdateOrderServicesListener(function(e){p.orderInfo=e[1],p.priceVariant=e[2],p.isFreePricevariant=s.isFreePricevariant(e[2]),p.isFreePricevariant&&(p.showNeedSelectPaymentFormMesage=!1),p.es=s.reformatAvailableExtraServices(e[0],p.orderInfo,p.es),p.esList=s.getAvailableExtraServicesList(e[0],p.es),p.searchOrderLoading=!1,p.orderServicesLoading=!1,o.getParam("ffp.enable")&&(p.orderInfo.hasBonusCard||p.orderInfo.ffpSumm)&&o.ffpBonus().then(function(e){p.ffpBonus=e.total||0})},function(e){p.searchOrderLoading=!1,p.orderServicesLoading=!1,p.errorMessage=e.error,"web.extraServices.submitError"===p.errorMessage&&(p.showBackButton=!0)}),o.updateOrderServices(!0).then(function(){p.loading=!0,o.switchDefaultSelectedServices(p.esList,p.es,p.orderInfo).then(function(){p.loading=!1})}),o.addExtraServiceListener(function(e){p.modifyServicesLoading=!e,p.orderServicesLoading=!0}),o.addExtraServiceErrorListener(function(e,r){r&&"seat"===r.code||(p.modifyServicesError=e.error),p.modifyServicesLoading=!1,p.orderServicesLoading=!0})}function c(e){!p.agree||p.modifyServicesLoading||p.orderServicesLoading||(p.selectedPaymentForm&&p.selectedPaymentType?o.getParam("site.rossiyaAirlineMode")?t.openHandler("popupOrderEmailRequired",!1,{phoneRequiredToo:!0,submitCallback:function(r,n){d(e,r,n)}}):d(e):p.showNeedSelectPaymentFormMesage=!0)}function d(e,r,n){p.confirmLoading=!0,p.confirmError&&delete p.confirmError,o.startPaymentForExtraServices(p.selectedPaymentForm,p.selectedPaymentType,e,r,n,p.card).then(function(s){s.pnr&&s.lastName?a.goToConfirmOrder(s.pnr,s.lastName):s.eraseAeroexpressBecauseOfCurrency||s.eraseInsuranceBecauseOfCurrency?t.openHandler("popupChangeCurrencyError",!1,{eraseAeroexpressBecauseOfCurrency:s.eraseAeroexpressBecauseOfCurrency,eraseInsuranceBecauseOfCurrency:s.eraseInsuranceBecauseOfCurrency,mode:"addServices",submitCallback:c}):s.removedSvcs&&s.removedSvcs.length&&t.openHandler("popupRemovedServicesWarning",!1,{submitCallback:function(){d(e,r,n)},closeCallback:function(){o.updateOrderServices(!0)},removedSvcs:s.removedSvcs,svcsToIssue:s.svcsToIssue,noExtraServicesLeft:s.noExtraServicesLeft,disableOutsideCloseClick:!0}),p.confirmLoading=!1},function(e){"web.noBookedConfirmedExtraServices"===e.error?p.fatalError=e.error:p.confirmError=e.error,p.confirmLoading=!1})}function l(){p.showNeedSelectPaymentFormMesage=!1}function u(){return n.location.reload(),!1}function f(e,r){o.getParam("site.separatePassengersSearchOrder")?a.goToViewSeparateOrder(e,r):a.goToSearchOrder(e,r)}function m(){o.clearSession().then(function(){a.goToSearchOrder()})}var p=this;p.loading=!0,p.searchOrderLoading=!0,p.orderServicesLoading=!0,p.openOrder=f,p.submitPayment=c,p.paymentFormChangeHandler=l,p.reloadPage=u,p.clearSession=m,e.$on("plasticCardForPaymentChangeEvent",function(e,r){p.card=r}),o.ready.then(function(){angular.element("title").text(o.getAliasWithPrefix("web.pageTitle.","addServices")),p.pnrOrTicketNumber=r.pnrOrTicketNumber,p.lastName=r.lastName,p.loading=!1,o.clearOrderInfoListeners(),o.clearUpdateOrderServicesListeners(),p.orderInfo=o.getOrderInfo(),p.orderInfo?i():o.searchOrder(p.pnrOrTicketNumber,p.lastName,!0).then(i,function(e){p.searchOrderLoading=!1,p.orderServicesLoading=!1,p.errorMessage=e.error})})}])},{}],6:[function(e,r,n){"use strict";function a(e,r,n){function a(){r.clearSession(),r.clearOrderInfo(),d.orderInfo=!1,d.showSearchForm=!0,d.partiallyAddedPassengers=[]}function o(){d.submitTouched=!0,r.getParam("site.useSearchOrderAgreeCheckbox")&&!d.searchOrderAgree||!d.searchOrderForm.$valid||(d.searchLoading=!0,d.errorMessage=!1,r.searchOrderByParams(d.searchParams,!!d.partiallyAddedPassengers.length).then(function(e){d.searchParams.flight&&d.searchParams.date?d.searchParams={flight:d.searchParams.flight,date:d.searchParams.date}:e.needToSpecifyDocument||(d.searchParams={}),d.needToSpecifyDocument=e.needToSpecifyDocument,d.showSearchForm=!1,d.submitTouched=!1,e.orderCompletelyInitialized?(d.partiallyAddedPassengers=[],s()):(e.partiallyAddedPassengers&&(d.partiallyAddedPassengers=e.partiallyAddedPassengers),d.needToSpecifyDocument&&(d.showSearchForm=!0)),d.searchLoading=!1},t))}function s(){r.updateOrderInfo().then(function(e){e.passengers&&(d.orderInfo=e,d.showSearchForm=!1),d.loading=!1},t)}function t(e){d.loading=!1,d.searchLoading=!1,"web.messages.emptyOrder"!==e.error&&(d.errorMessage=e.error)}function i(){r.finishSeparatePassengersSearch().then(s,t)}function c(){d.showSearchForm=!0}var d=this;d.loading=!0,d.showSearchForm=!0,d.searchParams={},d.partiallyAddedPassengers=[],d.submitSearch=o,d.confirmHandler=i,d.clear=a,d.addPassenger=c,r.ready.then(function(){angular.element("title").text(r.getAliasWithPrefix("web.pageTitle.","searchOrder")),d.passengerLastNameRegexp=r.applicationConstants.passengerLastNameRegexp,d.pnrOrTicketRegexp=r.applicationConstants.pnrOrTicketRegexp,d.ticketRegexp=r.applicationConstants.ticketRegexp,e.pnrOrTicketNumber&&e.lastName&&"LAST_NAME_PNR_TICKET"===r.getParam("site.searchOrdersBy")?(d.searchParams.pnrOrTicketNumber=e.pnrOrTicketNumber,d.searchParams.lastName=e.lastName,d.loading=!1,n(o)):s()})}angular.module("app").controller("SearchOrderScreenController",["$routeParams","backend","$timeout",a])},{}]},{},[4]);
//# sourceMappingURL=controllers-nordwind.js.map
