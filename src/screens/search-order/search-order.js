"use strict";

angular.module('app').controller(
    'SearchOrderScreenController',
    ['$scope', '$routeParams', 'backend',
        'redirect', '$timeout', 'utils', 'fancyboxTools', SearchOrderScreenController]
);

function SearchOrderScreenController($scope, $routeParams, backend, redirect, $timeout, utils, fancyboxTools) {

    var vm = this;
    vm.loading = true;
    vm.searchOrderLoading = true;
    vm.orderServicesLoading = true;
    vm.showSearchForm = true;
    vm.searchParams = {};
    vm.partiallyAddedPassengers = [];
    vm.submitPayment = submitPayment;
    vm.submitSearch = submitSearch;
    vm.confirmHandler = confirmHandler;
    vm.clear = clear;
    vm.addPassenger = addPassenger;
    vm.swithcSubmitButtonHoverState = swithcSubmitButtonHoverState;

    backend.ready.then(function () {

        angular.element('title').text(backend.getAliasWithPrefix('web.pageTitle.', 'searchOrder'));


        vm.passengerLastNameRegexp = backend.applicationConstants.passengerLastNameRegexp;
        vm.pnrOrTicketRegexp = backend.applicationConstants.pnrOrTicketRegexp;
        vm.ticketRegexp = backend.applicationConstants.ticketRegexp;


        backend.clearOrderInfoListeners();
        backend.clearUpdateOrderServicesListeners();


        if (
            $routeParams.pnrOrTicketNumber &&
            $routeParams.lastName &&
            backend.getParam('site.searchOrdersBy') === 'LAST_NAME_PNR_TICKET'
        ) {
            vm.searchParams.pnrOrTicketNumber = $routeParams.pnrOrTicketNumber;
            vm.searchParams.lastName = $routeParams.lastName;
            vm.loading = false;
            console.log('submit search');
            $timeout(submitSearch);
        } else {
            console.log('else block');
            updateOrderInfoHandler();
            initAddServicesListeners();
        }

        // add-services logic
        backend.addOrderInfoListener(function (orderInfo) {
            console.log('add order info listener');
            vm.orderInfo = orderInfo;
        });

    });

    function submitPayment(removeInsuranceAeroexpress) {
        if (vm.agree && !vm.modifyServicesLoading && !vm.orderServicesLoading) {
            if (vm.selectedPaymentForm && vm.selectedPaymentType) {
                submitPaymentConfirm(removeInsuranceAeroexpress);
            } else {
                vm.showNeedSelectPaymentFormMesage = true;
            }
        }
    }

    function submitPaymentConfirm(removeInsuranceAeroexpress, email, phone) {
        vm.confirmLoading = true;

        if (vm.confirmError) {
            delete vm.confirmError;
        }

        backend.startPaymentForExtraServices(vm.selectedPaymentForm, vm.selectedPaymentType,
            removeInsuranceAeroexpress, email, phone, vm.card).then(function (resp) {
            if (resp.pnr && resp.lastName) {
                redirect.goToConfirmOrder();
            } else if (resp.eraseAeroexpressBecauseOfCurrency || resp.eraseInsuranceBecauseOfCurrency) {
                fancyboxTools.openHandler('popupChangeCurrencyError', false, {
                    eraseAeroexpressBecauseOfCurrency: resp.eraseAeroexpressBecauseOfCurrency,
                    eraseInsuranceBecauseOfCurrency: resp.eraseInsuranceBecauseOfCurrency,
                    mode: 'addServices',
                    submitCallback: submitPayment
                });
            } else if (resp.removedSvcs && resp.removedSvcs.length) {
                fancyboxTools.openHandler('popupRemovedServicesWarning', false, {
                    submitCallback: function submitCallback() {
                        submitPaymentConfirm(removeInsuranceAeroexpress, email, phone);
                    },
                    closeCallback: function closeCallback() {
                        backend.updateOrderServices(true);
                    },

                    removedSvcs: resp.removedSvcs,
                    svcsToIssue: resp.svcsToIssue,
                    noExtraServicesLeft: resp.noExtraServicesLeft,
                    disableOutsideCloseClick: true
                });
            }

            vm.confirmLoading = false;
        }, function (resp) {
            if (resp.error === 'web.noBookedConfirmedExtraServices') {
                vm.fatalError = resp.error;
            } else {
                vm.confirmError = resp.error;
            }

            vm.confirmLoading = false;
        });
    }

    function paymentFormChangeHandler() {
        vm.showNeedSelectPaymentFormMesage = false;
    }

    function reloadPage() {
        $window.location.reload();
        return false;
    }

    function clearSession() {
        backend.clearSession().then(function () {
            redirect.goToSearchOrder();
        });
    }

    function clear() {
        backend.clearSession();
        backend.clearOrderInfo();
        vm.orderInfo = false;
        vm.showSearchForm = true;
        vm.partiallyAddedPassengers = [];
    }

    function submitSearch() {
        vm.submitTouched = true;
        if (
            (!backend.getParam('site.useSearchOrderAgreeCheckbox') || vm.searchOrderAgree) &&
            vm.searchOrderForm.$valid
        ) {
            vm.searchLoading = true;
            vm.errorMessage = false;
            backend.searchOrderByParams(vm.searchParams, !!vm.partiallyAddedPassengers.length).then(function (resp) {
                if (vm.searchParams.flight && vm.searchParams.date) {
                    vm.searchParams = {
                        flight: vm.searchParams.flight,
                        date: vm.searchParams.date
                    };
                } else if (!resp.needToSpecifyDocument) {
                    vm.searchParams = {};
                }
                vm.needToSpecifyDocument = resp.needToSpecifyDocument;
                vm.showSearchForm = false;
                vm.submitTouched = false;

                initAddServicesListeners();

                if (resp.orderCompletelyInitialized) {
                    vm.partiallyAddedPassengers = [];
                    // call updateOrderInfo with callback
                    // because need to redirect to add-services
                    // only if adding extra services allowed
                    updateOrderInfoHandler();
                } else {
                    if (resp.partiallyAddedPassengers) {
                        vm.partiallyAddedPassengers = resp.partiallyAddedPassengers;
                    }
                    if (vm.needToSpecifyDocument) {
                        vm.showSearchForm = true;
                    }
                }
                vm.searchLoading = false;
            }, errorHandler);
        }
    }

    function initAddServicesListeners() {

        backend.addUpdateOrderServicesListener(function (resp) {
            vm.orderInfo = resp[1];
            vm.priceVariant = resp[2];
            vm.isFreePricevariant = utils.isFreePricevariant(resp[2]);

            if (vm.isFreePricevariant) {
                vm.showNeedSelectPaymentFormMesage = false;
            }

            vm.es = utils.reformatAvailableExtraServices(resp[0], vm.orderInfo, vm.es);
            vm.esList = utils.getAvailableExtraServicesList(resp[0], vm.es);

            vm.searchOrderLoading = false;
            vm.orderServicesLoading = false;

            if (backend.getParam('ffp.enable') && (vm.orderInfo.hasBonusCard || vm.orderInfo.ffpSumm)) {
                backend.ffpBonus().then(function (resp) {
                    vm.ffpBonus = resp.total || 0;
                });
            }
        }, function (resp) {
            vm.searchOrderLoading = false;
            vm.orderServicesLoading = false;
            vm.errorMessage = resp.error;
        });

        backend.updateOrderServices(true).then(function () {
            vm.loading = true;

            backend.switchDefaultSelectedServices(vm.esList, vm.es, vm.orderInfo).then(function () {
                vm.loading = false;
            }, function (resp) {
                vm.errorMessage = resp.error;
                vm.loading = false;
            });
        });

        backend.addExtraServiceListener(function (state) {
            vm.modifyServicesLoading = !state;
            vm.orderServicesLoading = true;
        });

        backend.addExtraServiceErrorListener(function (resp, req) {
            if (!req || req.code !== 'seat') {
                vm.modifyServicesError = resp.error;
            }

            vm.modifyServicesLoading = false;
            vm.orderServicesLoading = true;
        });


    }

    function updateOrderInfoHandler(cb) {
        backend.updateOrderInfo().then(function (orderInfo) {
            if (orderInfo.passengers) {
                vm.orderInfo = orderInfo;
                vm.showSearchForm = false;
                if (typeof cb === 'function') {
                    cb();
                }
            }
            vm.loading = false;
        }, errorHandler);
    }

    function errorHandler(resp) {
        vm.loading = false;
        vm.searchLoading = false;
        if (resp.error !== 'web.messages.emptyOrder') {
            vm.errorMessage = resp.error;
        }
    }

    function confirmHandler() {
        backend.finishSeparatePassengersSearch().then(updateOrderInfoHandler, errorHandler);
    }

    function addPassenger() {
        vm.showSearchForm = true;
    }

    function swithcSubmitButtonHoverState() {
        vm.submitButtonHover = !vm.submitButtonHover;
    }
}
