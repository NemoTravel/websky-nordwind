angular.module("app").component("nwEsPopup", {
	templateUrl: "components/nw-es-popup/nw-es-popup.html",
	controller: "nwMealPopupController",
	bindToController: true,
	controllerAs: "vm",
	bindings: {
		locked: "=",
		esCode: "<",
		es: "="
	},
	transclude: {
		"extra-service": "wrap"
	}
});

angular
	.module("app")
	.controller("nwMealPopupController", [
		"$scope",
		"backend",
		"fancyboxTools",
		nwMealPopupController
	]);

function nwMealPopupController($scope, backend, fancyboxTools) {
	var vm = this;
	var submitCallback = false;
	vm.isSingleItemInInsurance = false;

	vm.close = close;
	vm.submit = submit;

	vm.popupId = "#nw-" + vm.esCode + "-popup";

	fancyboxTools.setOpenListener("nw-" + vm.esCode + "-popup", function(
		link,
		params
	) {
		var popup = angular.element(vm.popupId);
		var popupWrapper = popup.parents(".fancybox-wrap");

		// нужно прописать класс, чтобы проставить ширину попапа
		if (!popupWrapper.hasClass("extra-service__popup")) {
			popupWrapper.addClass("extra-service__popup");
		}
	});

	function submit() {
		if (submitCallback) {
			submitCallback(true);
			close();
		}
	}

	function close() {
		jQuery.fancybox.close();
	}
}
