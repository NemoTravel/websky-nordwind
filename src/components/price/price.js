const app = angular.module("app");
app.component("price", {
	bindings: {
		es: "<"
	},
	controller: "priceController",
	controllerAs: "vm",
	templateUrl: "components/price/price"
});

app.controller("priceController", ["$scope", priceController]);

function priceController($scope) {
	const vm = this;
	console.log(vm, $scope);
}
