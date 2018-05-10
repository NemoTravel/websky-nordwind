angular.module('app').controller(
    'SearchOrderScreenController',
    ['$routeParams', 'backend', 'redirect', SearchOrderScreenController]
);

function SearchOrderScreenController($routeParams, backend, redirect) {

    var vm = this;
    vm.loading = true;
    vm.searchParams = {};
    vm.submitSearch = submitSearch;
    vm.clear = clear;

    backend.ready.then(function () {

        if (backend.getParam('site.rossiyaAirlineMode')) {
            redirect.goToSearchSeparateOrder();
            return;
        }

        angular.element('title').text(backend.getAliasWithPrefix('web.pageTitle.', 'searchOrder'));

        vm.passengerLastNameRegexp = backend.applicationConstants.passengerLastNameRegexp;
        vm.pnrOrTicketRegexp = backend.applicationConstants.pnrOrTicketRegexp;

        backend.clearOrderInfo();
        backend.addOrderInfoListener(function () {
            vm.orderLoaded = true;
        });

        if ($routeParams.pnrOrTicketNumber && $routeParams.lastName) {

            vm.searchParams.pnrOrTicketNumber = $routeParams.pnrOrTicketNumber;
            vm.searchParams.lastName = $routeParams.lastName;

            vm.pnrOrTicketNumber = $routeParams.pnrOrTicketNumber;
            vm.lastName = $routeParams.lastName;

            vm.submitTouched = true;

        }

        vm.loading = false;

    });

    function submitSearch() {
        vm.submitTouched = true;
        if (
            (!backend.getParam('site.useSearchOrderAgreeCheckbox') || vm.searchOrderAgree) &&
            vm.searchOrderForm.$valid
        ) {
            redirect.goToAddServices(vm.searchParams.pnrOrTicketNumber, vm.searchParams.lastName);
        }
    }

    function clear() {
        vm.pnrOrTicketNumber = false;
        vm.lastName = false;
    }

}
