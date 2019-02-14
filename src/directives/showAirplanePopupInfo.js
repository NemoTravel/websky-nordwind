var app = angular.module("app");

app.directive("showAirplanePopup", function() {
  return {
    scope: {
      service: "=service",
      showWarningSeatPopup: "=showWarningSeatPopup",
      popupWasAccepted: "="
    },
    controllerAs: "vm",
    priority: 10000,
    bindToController: true,
    controller: "showAirplanePopupInfoController"
  };
});

app.controller("showAirplanePopupInfoController", [
  "$scope",
  "backend",
  "fancyboxTools",
  showAirplanePopupInfoController
]);

function showAirplanePopupInfoController($scope, backend, fancyboxTools) {
  var vm = this;
  vm.showPopup = null;

  backend.ready.then(function(){
      vm.showPopup = !!backend.getAlias('web.seatWarning.content').length;
  });

  $scope.$watch("vm.service.active", function(newServiceState) {
    if (newServiceState) {
      if (!vm.service.userAgree && newServiceState === true && vm.showPopup) {
        vm.service.active = false;
        fancyboxTools.openHandler("popupSeatWarning");
      }
    }
  });
}
