/*
 *
 * Нет возможности переопределить routes.js и как следствие контроллер скрина private-order
 * придется использовать директиву private-order-state-updater без собственного скоупа
 * в которой реализован весь функционал нужный для privateOrder.js
 *
 * Задача директивы, дернуть с бэкенда список доп. услуг и передать их в order-with-es
 *
 */
const app = angular.module("app");

app.directive("privateOrderStateUpdater", () => ({
	scope: false,
	controller: "privateOrderStateUpdaterController"
}));

app.controller("privateOrderStateUpdaterController", [
	"$scope",
	"backend",
	"utils",
	privateOrderStateUpdaterController
]);

function privateOrderStateUpdaterController($scope, backend, utils) {
	const vm = $scope.vm;

	vm.searchOrderLoading = true;
	vm.orderServicesLoading = true;


	backend.ready.then(() => {
		backend.clearOrderInfoListeners();
		backend.clearUpdateOrderServicesListeners();

		backend.addOrderInfoListener(function(orderInfo) {
			vm.orderInfo = orderInfo;
		});

		backend.addUpdateOrderServicesListener(
			function(resp) {
				vm.orderInfo = resp[1];
				vm.priceVariant = resp[2];
				console.log(utils);
				vm.isFreePaymentVariants = utils.isFreePaymentVariants(resp[2]);

				if (vm.isFreePaymentVariants) {
					vm.showNeedSelectPaymentFormMesage = false;
				}

				console.log('private order');
				vm.es = utils.reformatAvailableExtraServices(
					resp[0],
					vm.orderInfo,
					vm.es
				);
				vm.esList = utils.getAvailableExtraServicesList(resp[0], vm.es);

				vm.searchOrderLoading = false;
				vm.orderServicesLoading = false;

				if (
					backend.getParam("ffp.enable") &&
					(vm.orderInfo.hasBonusCard || vm.orderInfo.ffpSumm)
				) {
					backend.ffpBonus().then(function(resp) {
						vm.ffpBonus = resp.total || 0;
					});
				}
			},

			function(resp) {
				vm.searchOrderLoading = false;
				vm.orderServicesLoading = false;
				vm.errorMessage = resp.error;
			}
		);

		backend.updateOrderServices().then(function() {
			vm.loading = true;

			backend
				.switchDefaultSelectedServices(vm.esList, vm.es, vm.orderInfo)
				.then(
					function() {
						vm.loading = false;
					},
					function(resp) {
						vm.errorMessage = resp.error;
						vm.loading = false;
					}
				);
		});
	});
}
