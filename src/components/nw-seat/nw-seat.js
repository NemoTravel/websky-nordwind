angular.module("app").component("nwSeat", {
    templateUrl: "components/nw-seat/nw-seat.html",
    controller: [
        "$scope",
        "$element",
        "$timeout",
        "redirect",
        "backend",
        "utils",
        SeatController
    ],
    controllerAs: "vm",
    bindings: {
        service: "=service",
        locked: "=locked",
        closePopup: '&',
    }
});

function SeatController($scope, $element, $timeout, redirect, backend, utils) {
    var vm = this,
        passengersTableContainer = $element.find("div.passengersTableContainer"),
        seatMapContainerTopPosition = "0px";

    vm.switchService = switchService;

    vm.selectFlightPassenger = selectFlightPassenger;
    vm.selectFirstAvailablePassengerFlight = selectFirstAvailablePassengerFlight;
    vm.setPassengerFlightSeat = setPassengerFlightSeat;
    vm.closePopup = vm.closePopup();

    vm.hasAlias = backend.hasAlias;

    vm.scrollToStart = scrollToStart;
    vm.scrollToEnd = scrollToEnd;

    vm.getAvailablePassengersCount = utils.getAvailablePassengersCount;
    vm.getAvailablePassengersCountWrap = getAvailablePassengersCountWrap;

    vm.removePassengerFlightSeat = removePassengerFlightSeat;

    vm.checkServiceRemovalProhibited = backend.checkServiceRemovalProhibited;

    vm.canScrollRight = true;
    vm.canScrollLeft = false;

    vm.isBookingScreen = redirect.isBookingScreen();

    backend.addOrderInfoListener(
        function (orderInfo) {
            vm.orderInfo = orderInfo;
        },
        false,
        true
    );

    updateSunInfoByFlights();

    passengersTableContainer.on("scroll", mobileTableScrollHandler);

    if (vm.service.active) {
        selectFirstAvailablePassengerFlight();
    }

    function switchService() {
        if (!vm.locked && !backend.checkServiceRemovalProhibited("seat")) {
            vm.service.active = !vm.service.active;
            if (vm.service.active) {
                selectFirstAvailablePassengerFlight();
            } else {
                vm.modifyError = false;
                backend
                    .removeExtraService({
                        code: "seat"
                    })
                    .then(clearFlightPassenger, function (resp) {
                        if (resp.error) {
                            vm.modifyError = resp.error;
                        }
                    });
            }
        }

        vm.closePopup();
    }

    function clearFlightPassenger() {
        vm.seatMap = false;
        vm.selectedFlight = -1;
        vm.selectedPassenger = -1;
    }

    function setSeatMapContainerTopPosition(reset) {
        if (reset) {
            seatMapContainerTopPosition = "0px";
        } else {
            seatMapContainerTopPosition = jQuery("#seatMapCont .mCSB_container").css(
                "top"
            );
        }
    }

    function selectFlightPassenger(flightNum, passengerNum) {
        // Нужно запомнить положение карты мест для переключения между пассажирами одного сегмента
        setSeatMapContainerTopPosition(vm.selectedFlight !== flightNum);
        vm.selectedFlight = flightNum;
        vm.selectedPassenger = passengerNum;
        updateSeatMap();
    }

    function selectFirstAvailablePassengerFlight() {
        vm.selectedFlight = getFirstAvailableFlightNum();
        vm.selectedPassenger = getFirstAvailablePassengerNum(vm.selectedFlight);
        updateSeatMap();
    }

    function updateSeatMap() {
        if (vm.selectedPassenger !== -1 && vm.selectedFlight !== -1) {
            vm.loadingSeatMap = true;
            vm.seatMapError = false;
            backend
                .seatMap(
                    vm.orderInfo.passengers[vm.selectedPassenger].id,
                    vm.orderInfo.plainFlights[vm.selectedFlight].id
                )
                .then(
                    function (resp) {
                        vm.seatMap = resp;
                        vm.loadingSeatMap = false;
                        $timeout(function () {
                            jQuery("#seatMapCont .mCSB_container").css(
                                "top",
                                seatMapContainerTopPosition
                            );
                        });
                    },
                    function (resp) {
                        vm.seatMapError = resp.error;
                        vm.loadingSeatMap = false;
                    }
                );
        }
    }

    function setPassengerFlightSeat(chair, cabinAllowed, rowNumber) {
        if (!vm.locked) {
            if (chair.available && cabinAllowed) {
                setSeatMapContainerTopPosition();
                vm.modifyError = false;
                backend
                    .modifyExtraService({
                        code: "seat",
                        passenger_id: vm.orderInfo.passengers[vm.selectedPassenger].id,
                        segment_id: vm.orderInfo.plainFlights[vm.selectedFlight].id,
                        value: rowNumber + chair.number,
                        subgroup: vm.service.commonSubgroup,
                        rfisc: chair.rfisc || ""
                    })
                    .then(updateSeatMap, function (resp) {
                        if (resp.error) {
                            vm.modifyError = resp.error;
                        }
                    });
            }
        }
    }

    function updateSunInfoByFlights() {
        vm.sunInfoByFlights = [];
        vm.orderInfo.plainFlights.forEach(function (flight, flightNum) {
            backend
                .sunInfo(
                    flight.origincity,
                    flight.departuredate,
                    flight.departuretime,
                    flight.destinationcity,
                    flight.arrivaldate,
                    flight.arrivaltime
                )
                .then(function (resp) {
                    vm.sunInfoByFlights[flightNum] = resp;
                });
        });
    }

    function getFirstAvailableFlightNum() {
        var i;
        for (i = 0; i < vm.orderInfo.plainFlights.length; i++) {
            // vm.service.availableBySegments[i]
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
        vm.canScrollRight = scrollRight !== 0;
        vm.canScrollLeft = scrollLeft !== 0;
        $scope.$apply();
    }

    function getAvailablePassengersCountWrap(availableByPassengerSegments) {
        var count = utils.getAvailablePassengersCount(availableByPassengerSegments);
        return (
            count +
            vm.orderInfo.passengers.filter(function (pax) {
                return !pax.hasSeats;
            }).length
        );
    }

    function removePassengerFlightSeat(passengerNum, flightNum) {
        if (
            !vm.locked &&
            !backend.checkServiceRemovalProhibited("seat", passengerNum, flightNum)
        ) {
            vm.modifyError = false;
            backend
                .removeExtraService({
                    code: "seat",
                    passenger_id: vm.orderInfo.passengers[passengerNum].id,
                    segment_id: vm.orderInfo.plainFlights[flightNum].id
                })
                .then(
                    function () {
                        if (vm.selectedFlight === flightNum) {
                            updateSeatMap();
                        }
                    },
                    function (resp) {
                        if (resp.error) {
                            vm.modifyError = resp.error;
                        }
                    }
                );
        }
    }
}