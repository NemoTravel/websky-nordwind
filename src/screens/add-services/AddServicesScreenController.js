'use strict';

angular.module('app').controller('AddServicesScreenController', ['$scope', '$routeParams', '$window', 'redirect', 'backend', 'utils', 'fancyboxTools', function ($scope, $routeParams, $window, redirect, backend, utils, fancyboxTools) {
    var vm = this;

    vm.loading = true;
    vm.searchOrderLoading = true;
    vm.orderServicesLoading = true;

    vm.openOrder = redirect.goToSearchOrder;
    vm.submitPayment = submitPayment;
    vm.paymentFormChangeHandler = paymentFormChangeHandler;
    vm.reloadPage = reloadPage;
    vm.clearSession = clearSession;
    vm.swithcSubmitButtonHoverState = swithcSubmitButtonHoverState;

    $scope.$on('plasticCardForPaymentChangeEvent', function (event, data) {
        vm.card = data;
    });

    backend.ready.then(function () {
        angular.element('title').text(backend.getAliasWithPrefix('web.pageTitle.', 'addServices'));

        vm.loading = false;

        backend.clearOrderInfoListeners();
        backend.clearUpdateOrderServicesListeners();

        backend.addOrderInfoListener(function (orderInfo) {
            vm.orderInfo = orderInfo;
        });

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

        backend.startPaymentForExtraServices(vm.selectedPaymentForm, vm.selectedPaymentType, removeInsuranceAeroexpress, email, phone, vm.card).then(function (resp) {
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

    function swithcSubmitButtonHoverState() {
        vm.submitButtonHover = !vm.submitButtonHover;
    }
}]);
