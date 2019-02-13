const app = angular.module("app");

app.component("nwExtraServicesList", {
	templateUrl: "components/nw-extra-services-list/nw-extra-services-list.html",
	controller: "extraServicesListController",
	controllerAs: "vm",
	bindings: {
		es: "=es",
		list: "=list",
		availableBundlesByPassengerSegments: "<",
		locked: "=locked"
	}
});

app.controller("extraServicesListController", [
	"$scope",
	"utils",
	"backend",
	extraServicesListController
]);

function extraServicesListController($scope, utils, backend) {
	const vm = this;
	vm.isCommonService = utils.isCommonServiceCode;
	vm.switchInsurance = switchInsurance;
	vm.commonLuggage = false;

	vm.orderInfo = backend.getOrderInfo();

	// не нужно показывать попап, по клику на страховку, если
	// в заказе только один пассажир, просто вызываем modifyExtraServices
	const insuranceES = _.findWhere(vm.es, { code: "insurance" });
	vm.isSingleItemInInsurance = insuranceES && insuranceES.items.length === 1;

	$scope.$watch("vm.es", function() {
		// нужно собрать все типы доп. багажа чтобы передавать в компонент es-baggage вместе с es.baggage
		vm.commonLuggage = _.filter(
			vm.es,
			es => (es.code === "specialLuggageA") | (es.code === "specialLuggageC")
		)[0];

		// vm.commonLuggage.forEach(
		// 	commonLuggageItem => removeCodeFromEsList(commonLuggageItem.code, vm.list),
		// );
		removeCodeFromEsList(vm.commonLuggage.code, vm.list);
		const baggage = _.filter(vm.es, es => es.code === "baggage")[0];
		// Багажа нету, передаем туда specialLuggageA и specialLuggageC
		if (!baggage && vm.es) {
			vm.list.push("baggage");
			vm.es["baggage"] = { ...vm.commonLuggage };
			vm.es["baggage"].code = "baggage";
		}
	});

	function switchInsurance() {
		if (!vm.locked) {
			insuranceES.active = !insuranceES.active;
			if (insuranceES.active) {
				if (insuranceES.items.length === 1) {
					backend.modifyExtraService(
						getInsuranceSubmitParams(insuranceES.items[0])
					);
				}
			} else {
				backend.removeExtraService({
					code: insuranceES.onlineMode ? "insuranceOnline" : "insurance"
				});
			}
		}
	}

	function getInsuranceSubmitParams(item, passenger_id) {
		const params = {
			code: "insurance",
			ins: item.ins,
			tins: item.tins
		};
		if (passenger_id) {
			params.passenger_id = passenger_id;
		}
		if (insuranceES.onlineMode) {
			params.code = "insuranceOnline";
			params.productCode = item.productCode;
		}
		return params;
	}

	function removeCodeFromEsList(code, list) {
		if (!(list && list.length)) {
			return;
		}
		const index = list.indexOf(code);
		if (index !== -1) {
			list.splice(index, 1);
		}
	}
}
