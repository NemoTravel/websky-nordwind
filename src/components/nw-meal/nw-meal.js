angular.module('app').component('nwMeal', {
    templateUrl: 'components/nw-meal/nw-meal.html',
    controller: ['$scope', '$element','backend', 'utils', MealController],
    controllerAs: 'vm',
    bindings: {
        service: '=service',
        locked: '=locked'
    }
});

function MealController($scope, $element, backend, utils) {

    var vm = this,
        passengersTableContainer = $element.find('div.passengersTableContainer');

    vm.switchService = switchService;
    vm.selectFlightPassenger = selectFlightPassenger;
    vm.selectFirstAvailablePassengerFlight = selectFirstAvailablePassengerFlight;
    vm.mealCountChangeHandler = mealCountChangeHandler;
    vm.removePassengerFlightMeal = removePassengerFlightMeal;
    vm.getSelectedPassengerFlightMeal = getSelectedPassengerFlightMeal;
    vm.scrollToStart = scrollToStart;
    vm.scrollToEnd = scrollToEnd;
    vm.hasAlias = backend.hasAlias;
    vm.getAvailablePassengersCount = utils.getAvailablePassengersCount;
    vm.checkServiceRemovalProhibited = backend.checkServiceRemovalProhibited;

    vm.canScrollRight = true;
    vm.canScrollLeft = false;

    vm.selectedFlight = 0;
    vm.selectedPassenger = 0;

    if (backend.getParam('site.externalStorageBaseUrl')) {
        vm.mealImagesPath = backend.getParam('site.externalStorageBaseUrl') + '/img/content/meal';
    } else {
        vm.mealImagesPath = './themes/websky/assets/static/img/content/meal';
    }

    backend.addOrderInfoListener(function (orderInfo) {
        vm.orderInfo = orderInfo;
    }, false, true);

    $scope.$watch('vm.service', function () {
        updateMealMenu();
    });

    passengersTableContainer.on('scroll', mobileTableScrollHandler);

    if (vm.service.active) {
        updateMealMenu();
    }

    function switchService() {
        if (!vm.locked && !backend.checkServiceRemovalProhibited('meal')) {
            vm.service.active = !vm.service.active;
            if (vm.service.active) {
                selectFirstAvailablePassengerFlight();
            } else {
                backend.removeExtraService({
                    code: 'meal'
                });
            }
        }
    }

    function selectFlightPassenger(flightNum, passengerNum) {
        vm.selectedFlight = flightNum;
        vm.selectedPassenger = passengerNum;
        updateMealMenu();
    }

    function selectFirstAvailablePassengerFlight() {
        vm.selectedFlight = getFirstAvailableFlightNum();
        vm.selectedPassenger = getFirstAvailablePassengerNum(vm.selectedFlight);
        updateMealMenu();
    }

    function updateMealMenu() {
        vm.mealMenu = vm.service.itemsByPassengerSegments[vm.selectedPassenger][vm.selectedFlight];
        vm.mealMenuSubgroup = false;
    }

    function mealCountChangeHandler(subgroupNum, mealItem, delta) {
        if (!vm.locked) {
            backend.modifyExtraService({
                code: 'meal',
                passenger_id: vm.orderInfo.passengers[vm.selectedPassenger].id,
                segment_id: vm.orderInfo.plainFlights[vm.selectedFlight].id,
                subgroup: vm.service.subgroups[subgroupNum],
                amount: (mealItem.alreadySelectedCount || 0) + delta,
                rfisc: mealItem.rfisc
            });
        }
    }

    function removePassengerFlightMeal(passengerNum, flightNum) {
        if (!vm.locked && !backend.checkServiceRemovalProhibited('meal', passengerNum, flightNum)) {
            backend.removeExtraService({
                code: 'meal',
                passenger_id: vm.orderInfo.passengers[passengerNum].id,
                segment_id: vm.orderInfo.plainFlights[flightNum].id
            });
        }
    }

    function getSelectedPassengerFlightMeal(passengerNum, flightNum) {

        var count = 0,
            cost = 0,
            currency;

        if (
            vm.orderInfo.groupedEditableExtraServices &&
            vm.orderInfo.groupedEditableExtraServices.meal &&
            vm.orderInfo.groupedEditableExtraServices.meal[passengerNum] &&
            vm.orderInfo.groupedEditableExtraServices.meal[passengerNum][flightNum] &&
            vm.orderInfo.groupedEditableExtraServices.meal[passengerNum][flightNum].length
        ) {
            vm.orderInfo.groupedEditableExtraServices.meal[passengerNum][flightNum].forEach(function (item) {
                if (item.amount) {
                    count += item.amount;
                }
                if (item.totalPrice) {
                    cost = Big(cost).plus(item.totalPrice).toFixed(2);
                    currency = item.currency;
                }
            });
        }

        if (count) {
            return {
                count: count,
                cost: cost,
                currency: currency
            };
        } else {
            return false;
        }

    }

    function scrollToStart() {
        passengersTableContainer.scrollTo(0);
    }

    function scrollToEnd() {
        passengersTableContainer.scrollTo(passengersTableContainer[0].scrollWidth);
    }

    function mobileTableScrollHandler() {
        var scrollLeft = passengersTableContainer[0].scrollLeft,
            scrollWidth = passengersTableContainer[0].scrollWidth,
            clientWidth = passengersTableContainer[0].clientWidth,
            scrollRight = scrollWidth - clientWidth - scrollLeft;
        vm.canScrollRight = (scrollRight !== 0);
        vm.canScrollLeft = (scrollLeft !== 0);
        $scope.$apply();
    }

    function getFirstAvailableFlightNum() {
        var i;
        for (i = 0; i < vm.orderInfo.plainFlights.length; i++) {
            if (vm.service.availableBySegments[i]) {
                return i;
            }
        }
        return -1;
    }

    function getFirstAvailablePassengerNum(flightNum) {
        var i;
        if (vm.service.availableByPassengerSegments) {
            for (i = 0; i < vm.orderInfo.passengers.length; i++) {
                if (vm.service.availableByPassengerSegments[i][flightNum]) {
                    return i;
                }
            }
        }
        return -1;
    }

}

