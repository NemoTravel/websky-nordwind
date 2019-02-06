angular.module("wes").component("nwBaggage", {
	templateUrl: "components/nw-baggage/nw-baggage.html",
	controller: ["$element", "$scope", "backend", "utils", BaggageController],
	controllerAs: "vm",
	bindings: {
		service: "=service",
		commonLuggage: "=commonLuggage",
		locked: "=locked"
	}
});

function BaggageController($element, $scope, backend, utils) {
	var vm = this,
		passengersTableContainer = $element.find("div.passengersTableContainer");

	vm.switchService = switchService;
	vm.baggageCountChangeHandler = baggageCountChangeHandler;
	vm.selectRoutePartPassenger = selectRoutePartPassenger;
	vm.changeBaggageBySelect = changeBaggageBySelect;
	vm.removeByPassenger = removeByPassenger;
	vm.getSelectedPassengerRoutePartBaggage = getSelectedPassengerRoutePartBaggage;
	vm.scrollToStart = scrollToStart;
	vm.scrollToEnd = scrollToEnd;
	vm.removePassengerFlightBaggage = removePassengerFlightBaggage;
	vm.addServiceByFlightPassenger = addServiceByFlightPassenger;
	vm.removeServiceByFlightPassenger = removeServiceByFlightPassenger;
	vm.selectFlightPassenger = selectFlightPassenger;
	vm.selectFirstAvailablePassengerFlight = selectFirstAvailablePassengerFlight;
	vm.onCommonLuggageChange = onCommonLuggageChange;
	vm.selectRoutePartByNum = selectRoutePartByNum;

	vm.selectedFlight = 0;
	vm.selectedPassenger = 0;

	vm.checkServiceRemovalProhibited = backend.checkServiceRemovalProhibited;

	vm.canScrollRight = true;
	vm.canScrollLeft = false;

	vm.selectedRoutePartNum = 0;
	vm.selectedPassenger = 0;
	console.log("nw-baggage.js vm.commonLuggage: ", vm.commonLuggage);
	console.log("nw-baggage.js vm.service: ", vm.service);

	vm.optionsByRoutePartsAndPassengers = vm.service.routeParts.map(function(
		routePart
	) {
		return routePart.availableExtraServicesByPassengersAndSubgroups.map(
			function(subgroups) {
				return subgroups.map(function(items) {
					return utils.createOptionsForUiSelect(items, {
						title: backend.getAlias("web.extraServices.baggage.noneSelected")
					});
				});
			}
		);
	});

	$scope.$watch("vm.service.routeParts", function() {
		/* jshint maxlen: 200 */
		vm.selectedBaggageByRoutePartsAndPassengers = getSelectedBaggageByRoutePartsAndPassengers(
			vm.service.routeParts
		);
		vm.selectedBaggageByRoutePartsAndPassengersView = angular.copy(
			vm.selectedBaggageByRoutePartsAndPassengers
		);
	});

	$scope.$watch("vm.orderInfo.pricesEditable", () => {
		if (!vm.orderInfo.pricesEditable) {
			vm.totalPrice = 0;
			return;
		}

		const baggageTotalPrice = +vm.orderInfo.pricesEditable
			.totalExtraServiceByGroup[vm.service.code]
			? +vm.orderInfo.pricesEditable.totalExtraServiceByGroup[vm.service.code]
			: 0;

		const specialLuggageATotalPrice = +vm.orderInfo.pricesEditable
			.totalExtraServiceByGroup.specialLuggageA
			? +vm.orderInfo.pricesEditable.totalExtraServiceByGroup.specialLuggageA
			: 0;

		vm.totalPrice = baggageTotalPrice + specialLuggageATotalPrice;
	});

	backend.addOrderInfoListener(
		function(orderInfo) {
			vm.orderInfo = orderInfo;
			// vm.totalPrice =
			// 	+vm.orderInfo.pricesEditable.totalExtraServiceByGroup[vm.service.code] +
			// 	+vm.orderInfo.pricesEditable.totalExtraServiceByGroup.specialLuggageA;
		},
		false,
		true
	);

	passengersTableContainer.on("scroll", mobileTableScrollHandler);

	function switchService() {
		if (!vm.locked && !backend.checkServiceRemovalProhibited("baggage")) {
			vm.service.active = !vm.service.active;
			vm.selectFlightPassenger(vm.orderInfo.plainFlights[0], 0);
			if (!vm.service.active) {
				backend.removeExtraService({
					code: vm.service.code
				});
				backend.removeExtraService({
					code: "specialLuggageA"
				});
			}
			vm.selectFirstAvailablePassengerFlight();
		}
	}

	function removeByPassenger(passengerNum) {
		if (!vm.locked) {
			backend.removeExtraService({
				code: "baggage",
				passenger_id: vm.orderInfo.passengers[passengerNum].id
			});
		}
	}

	function baggageCountChangeHandler(
		subgroupNum,
		baggageItem,
		delta,
		passengerNum,
		routePartNum
	) {
		if (!vm.locked) {
			backend.modifyExtraService({
				code: vm.service.code,
				passenger_id: vm.orderInfo.passengers[passengerNum].id,
				segment_id:
					vm.orderInfo.plainFlights[
						vm.service.routeParts[routePartNum].mainFlightNum
					].id,
				subgroup: vm.service.subgroups[subgroupNum].code,
				amount: (baggageItem.alreadySelectedCount || 0) + delta,
				rfisc: baggageItem.rfisc
			});
		}
	}

	function getSelectedBaggageByRoutePartsAndPassengers(routeParts) {
		return routeParts.map(function(routePart) {
			return routePart.availableExtraServicesByPassengersAndSubgroups.map(
				function(subgroups) {
					return subgroups.map(function(items) {
						var selectedNum;
						items.forEach(function(item, itemNum) {
							if (item.amount) {
								selectedNum = itemNum;
							}
						});
						return selectedNum;
					});
				}
			);
		});
	}

	function selectRoutePartPassenger(routePartNum, passengerNum) {
		vm.selectedRoutePartNum = routePartNum;
		vm.selectedPassenger = passengerNum;
	}

	function changeBaggageBySelect(passengerNum, routePartNum, subgroupNum) {
		/* jshint maxlen: 200 */
		var selectedBaggageNum =
				vm.selectedBaggageByRoutePartsAndPassengers[routePartNum][passengerNum][
					subgroupNum
				],
			selectedBaggage =
				vm.service.routeParts[routePartNum]
					.availableExtraServicesByPassengersAndSubgroups[passengerNum][
					subgroupNum
				][selectedBaggageNum],
			newBaggageNum =
				vm.selectedBaggageByRoutePartsAndPassengersView[routePartNum][
					passengerNum
				][subgroupNum],
			newBaggage =
				vm.service.routeParts[routePartNum]
					.availableExtraServicesByPassengersAndSubgroups[passengerNum][
					subgroupNum
				][newBaggageNum],
			newParams = false;

		if (!vm.locked) {
			if (newBaggage) {
				newParams = {
					code: "baggage",
					passenger_id: newBaggage.passengerId,
					segment_id: newBaggage.mainSegmentId,
					subgroup: newBaggage.subgroupCode,
					amount: 1,
					rfisc: newBaggage.rfisc
				};
			}

			if (newParams) {
				backend.modifyExtraService(newParams);
			} else if (selectedBaggage) {
				backend.removeExtraService({
					code: "baggage",
					passenger_id: selectedBaggage.passengerId,
					segment_id: selectedBaggage.mainSegmentId,
					subgroup: selectedBaggage.subgroupCode,
					rfisc: selectedBaggage.rfisc
				});
			}
		}
	}

	function getSelectedPassengerRoutePartBaggage(passengerNum, routePartNum) {
		var count = 0,
			cost = 0,
			currency,
			routePart = vm.service.routeParts[routePartNum],
			subgroups =
				routePart.availableExtraServicesByPassengersAndSubgroups[passengerNum];

		if (subgroups && subgroups.length) {
			subgroups.forEach(function(items) {
				items.forEach(function(item) {
					if (item.amount) {
						count += item.amount;
					}
					if (item.totalPrice) {
						cost = Big(cost)
							.plus(item.totalPrice)
							.toFixed(2);
						currency = item.currency;
					}
				});
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
		vm.canScrollRight = scrollRight !== 0;
		vm.canScrollLeft = scrollLeft !== 0;
		$scope.$apply();
	}

	function removePassengerFlightBaggage(passengerNum, flightNum) {
		if (
			!vm.locked &&
			!backend.checkServiceRemovalProhibited("baggage", passengerNum, flightNum)
		) {
			backend.removeExtraService({
				code: "baggage",
				passenger_id: vm.orderInfo.passengers[passengerNum].id,
				segment_id: vm.orderInfo.plainFlights[flightNum].id
			});
		}
	}

	/*
	 *
	 * common service Special luggage code (from es-common.js)
	 *
	 */

	function onCommonLuggageChange(baggageItem) {
		if (baggageItem.alreadySelectedCount) {
			removeServiceByFlightPassenger(vm.selectedFlight, vm.selectedPassenger);
		} else {
			addServiceByFlightPassenger(vm.selectedFlight, vm.selectedPassenger);
		}
	}

	function addServiceByFlightPassenger(flightNum, passengerNum) {
		var item = utils.getFirstNotEmptySubListItem(
			vm.commonLuggage.itemsByPassengerSegments[passengerNum][flightNum]
		);

		if (
			!vm.locked &&
			!backend.checkServiceRemovalProhibited(
				vm.commonLuggage.code,
				passengerNum,
				flightNum
			)
		) {
			backend.modifyExtraService({
				code: vm.commonLuggage.code,
				passenger_id: vm.orderInfo.passengers[passengerNum].id,
				segment_id: vm.orderInfo.plainFlights[flightNum].id,
				subgroup: vm.commonLuggage.commonSubgroup,
				rfisc: item.rfisc
			});
		}
	}

	function removeServiceByFlightPassenger(flightNum, passengerNum) {
		var item = utils.getFirstNotEmptySubListItem(
			vm.commonLuggage.itemsByPassengerSegments[passengerNum][flightNum]
		);
		if (
			!vm.locked &&
			!backend.checkServiceRemovalProhibited(
				vm.commonLuggage.code,
				passengerNum,
				flightNum
			)
		) {
			backend.removeExtraService({
				code: vm.commonLuggage.code,
				passenger_id: vm.orderInfo.passengers[passengerNum].id,
				segment_id: vm.orderInfo.plainFlights[flightNum].id,
				subgroup: vm.commonLuggage.commonSubgroup,
				rfisc: item.rfisc
			});
		}
	}

	/*
	 *
	 * select first flight/passenger from nw-meal.js
	 *
	 */

	function selectFlightPassenger(flightNum, passengerNum) {
		vm.selectedFlight = flightNum;
		vm.selectedPassenger = passengerNum;
	}

	function selectFirstAvailablePassengerFlight() {
		vm.selectedFlight = getFirstAvailableFlightNum();
		vm.selectedPassenger = getFirstAvailablePassengerNum(vm.selectedFlight);
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

	function selectRoutePartByNum(num){
		vm.selectedRoutePartNum = num;
	}
}

