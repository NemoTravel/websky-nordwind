angular.module('app').controller(
    'SearchOrderScreenController',
    [
        '$routeParams', 'backend', '$timeout',
        function ($routeParams, backend, $timeout) {

            const vm = this;
            vm.loading = true;
            vm.showSearchForm = true;
            vm.searchParams = {};
            vm.partiallyAddedPassengers = [];
            vm.submitSearch = submitSearch;
            vm.confirmHandler = confirmHandler;
            vm.clear = clear;
            vm.addPassenger = addPassenger;
            vm.swithcSubmitButtonHoverState = swithcSubmitButtonHoverState;

            backend.ready.then(() => {

                angular.element('title').text(backend.getAliasWithPrefix('web.pageTitle.', 'searchOrder'));

                vm.passengerLastNameRegexp = backend.applicationConstants.passengerLastNameRegexp;
                vm.pnrOrTicketRegexp = backend.applicationConstants.pnrOrTicketRegexp;
                vm.ticketRegexp = backend.applicationConstants.ticketRegexp;

                if (
                    $routeParams.pnrOrTicketNumber &&
                    $routeParams.lastName &&
                    backend.getParam('site.searchOrdersBy') === 'LAST_NAME_PNR_TICKET'
                ) {
                    vm.searchParams.pnrOrTicketNumber = $routeParams.pnrOrTicketNumber;
                    vm.searchParams.lastName = $routeParams.lastName;
                    vm.loading = false;
                    $timeout(submitSearch);
                } else {
                    updateOrderInfoHandler();
                }

            });

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
                    backend.searchOrderByParams(vm.searchParams, !!vm.partiallyAddedPassengers.length).then((resp) => {
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
                        if (resp.orderCompletelyInitialized) {
                            vm.partiallyAddedPassengers = [];
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

            function updateOrderInfoHandler() {
                backend.updateOrderInfo().then((orderInfo) => {
                    if (orderInfo.passengers) {
                        vm.orderInfo = orderInfo;
                        vm.showSearchForm = false;
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
    ]
);


