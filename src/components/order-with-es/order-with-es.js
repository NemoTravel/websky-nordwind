var app = angular.module('app');

app.component('orderWithEs', {
    templateUrl: 'components/order-with-es/order-with-es.html',
    controller: 'orderWithEsController',
    controllerAs: 'vm',
    transclude: {
        'extra-services': 'extraServicesList',
        'payment': 'div'
    },
    bindings: {
        orderInfo: '='
    }
});

app.controller('orderWithEsController', ['$scope', '$window', '$timeout', 'backend',
    'utils', 'redirect', 'fancyboxTools', 'uniqueTabIdGenerator', orderWithEsController]);

function orderWithEsController($scope, $window, $timeout, backend,
                               utils, redirect, fancyboxTools, uniqueTabIdGenerator) {
    var vm = this;
    vm.loading = true;
    vm.errorMessage = false;
    vm.choosePayMethodFailMsg = false;
    vm.tabId = uniqueTabIdGenerator();
    vm.openExchange = redirect.goToExchange;
    vm.openRefund = redirect.goToRefund;
    vm.openAddServices = redirect.goToAddServices;
    vm.suffixCount = utils.suffixCount;

    vm.retryPayment = retryPayment;
    vm.bindOrder = bindOrder;
    vm.clearSession = clearSession;
    vm.newBooking = newBooking;

    $scope.$on("popupChoosePayMethodChoosePayMethodFailMsg", function (event, data) {
        vm.choosePayMethodFailMsg = data;
    });

    $scope.$on("popupChoosePayMethodPending", function (event, data) {
        vm.popupChoosePayMethodPending = data;
    });

    vm.$onInit = function () {
        var resultParam = utils.getParamFromLocation("result");

        if (resultParam === "success") {
            if (
                vm.orderInfo.header &&
                (vm.orderInfo.header.status === "being_paid" ||
                    vm.orderInfo.header.status === "being_paid_for_exchange")
            ) {
                backend
                    .waitPayment(vm.orderInfo.header.regnum, vm.orderInfo.header.lastName)
                    .then(
                        function () {
                            $window.location =
                                "./order?pnr=" +
                                vm.orderInfo.header.regnum +
                                "&lastName=" +
                                vm.orderInfo.header.lastName +
                                "&result=success";
                            return;
                        },
                        function () {
                            vm.loading = false;
                        }
                    );
            } else {
                vm.loading = false;
            }
        } else {
            // Платежный фрэйм открывается независимо от статуса заказа
            // Необходимое условие для оплаты онлайн страховок
            if (!vm.orderInfo.hasFailedServices && vm.orderInfo.paymentRedirectTo) {
                vm.showPaymentFrame = true;
            }
            vm.loading = false;
        }

        if (
            vm.orderInfo.hasFailedServices &&
            !resultParam &&
            vm.orderInfo.header &&
            (vm.orderInfo.header.status === "being_paid" ||
                vm.orderInfo.header.status === "booked")
        ) {
            $timeout(function () {
                fancyboxTools.openHandler("popupRemovedServicesWarningByOrder", false, {
                    submitCallback: function submitCallback() {
                        if (vm.orderInfo.paymentRedirectTo) {
                            vm.showPaymentFrame = true;
                        }
                        vm.ignoreFailedServices = true;
                    },

                    disableOutsideCloseClick: true
                });
            });
        }

        if (
            backend.getParam("ffp.enable") &&
            (vm.orderInfo.hasBonusCard || vm.orderInfo.ffpSumm)
        ) {
            backend.ffpBonus().then(function (resp) {
                vm.ffpBonus = resp.total || 0;
            });
        }
    };

    function retryPayment(removeInsuranceAeroexpress) {
        vm.loading = true;
        backend.retryRegister(removeInsuranceAeroexpress).then(
            function (resp) {
                if (resp.pnr && resp.lastName) {
                    $window.location =
                        "./order?pnr=" + resp.pnr + "&lastName=" + resp.lastName;
                } else if (
                    resp.eraseAeroexpressBecauseOfCurrency ||
                    resp.eraseInsuranceBecauseOfCurrency
                ) {
                    fancyboxTools.openHandler("popupChangeCurrencyError", false, {
                        eraseAeroexpressBecauseOfCurrency:
                        resp.eraseAeroexpressBecauseOfCurrency,
                        eraseInsuranceBecauseOfCurrency: resp.eraseInsuranceBecauseOfCurrency,
                        mode: "retryRegister",
                        submitCallback: retryPayment
                    });
                }
                vm.loading = false;
            },
            function (resp) {
                vm.loading = false;
                vm.errorMessage = resp.error;
            }
        );
    }

    function bindOrder() {
        if (
            !vm.orderInfo.header ||
            !vm.orderInfo.header.regnum ||
            !vm.orderInfo.header.lastName
        ) {
            return;
        }
        vm.loading = true;
        backend
            .bindOrder(vm.orderInfo.header.regnum, vm.orderInfo.header.lastName)
            .then(
                function () {
                    vm.loading = false;
                    vm.orderInfo.bindAlowed = false;
                    vm.showBindOrderSuccessMessage = true;
                    $timeout(function () {
                        vm.showBindOrderSuccessMessage = false;
                    }, 10000);
                },
                function () {
                    vm.loading = false;
                    vm.showBindOrderFailMessage = true;
                    $timeout(function () {
                        vm.showBindOrderFailMessage = false;
                    }, 10000);
                }
            );
    }

    function clearSession() {
        backend.clearSession().then(function () {
            redirect.goToSearchOrder();
        });
    }

    function newBooking() {
        backend.clearLastSearchParams().then(function () {
            $window.location = backend.getAlias("web.site.firstStepUrl");
        });
    }
}