angular.module("wes").component("nwInsurance", {
	templateUrl: "components/nw-insurance/nw-insurance.html",
	controller: ["backend", InsuranceController],
	controllerAs: "vm",
	bindings: {
		service: "=service",
		locked: "=locked"
	}
});

function InsuranceController(backend) {
	var vm = this;

	vm.switchService = switchService;
	vm.switchServiceItem = switchServiceItem;
	vm.selectFirstAvailablePassengerFlight = selectFirstAvailablePassengerFlight;

	vm.selectedFlight = null;
	vm.orderInfo = backend.getOrderInfo();

	function switchService() {
		if (!vm.locked) {
			vm.service.active = !vm.service.active;
			if (vm.service.active) {
				if (vm.service.items.length === 1) {
					backend.modifyExtraService(
						getInsuranceSubmitParams(vm.service.items[0])
					);
				}
			} else {
				backend.removeExtraService({
					code: vm.service.onlineMode ? "insuranceOnline" : "insurance"
				});
			}
		}
	}

	function switchServiceItem(itemNum, paxKey) {
		if (!vm.locked) {
			if (paxKey === "common") {
				backend[
					vm.service.items[itemNum].selected
						? "modifyExtraService"
						: "removeExtraService"
				](getInsuranceSubmitParams(vm.service.items[itemNum]));
			} else {
				backend[
					vm.service.itemsByPassengers[paxKey][itemNum].selected
						? "modifyExtraService"
						: "removeExtraService"
				](
					getInsuranceSubmitParams(
						vm.service.itemsByPassengers[paxKey][itemNum],
						vm.orderInfo.passengers[paxKey].id
					)
				);
			}
		}
	}

	function getInsuranceSubmitParams(item, passenger_id) {
		var params = {
			code: "insurance",
			ins: item.ins,
			tins: item.tins
		};
		if (passenger_id) {
			params.passenger_id = passenger_id;
		}
		if (vm.service.onlineMode) {
			params.code = "insuranceOnline";
			params.productCode = item.productCode;
		}
		return params;
	}

	//	select first available flight functionality
	function selectFirstAvailablePassengerFlight() {
		vm.selectedFlight = getFirstAvailableFlightNum();
		console.log(vm.selectedFlight);
	}

	function getFirstAvailableFlightNum() {
		var i;
		for (i = 0; i < vm.orderInfo.plainFlights.length; i++) {
			// vm.service.availableBySegments[i]
			console.log(vm.service);
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