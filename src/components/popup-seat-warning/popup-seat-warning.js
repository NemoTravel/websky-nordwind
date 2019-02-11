angular.module("app").component("popupSeatWarning", {
  templateUrl: "components/popup-seat-warning/popup-seat-warning.html",
  controller: [popupSeatWarningController],
  controllerAs: "vm",
  bindings: {
    agreeWithAirplaneChange: "=",
    service: "="
  }
});

function popupSeatWarningController() {
  var vm = this;
  console.log("here");
  vm.isUserAgree = isUserAgree;

  vm.close = jQuery.fancybox.close;

  function isUserAgree(isAgree) {
    vm.agreeWithAirplaneChange = isAgree;
    if (isAgree) {
      vm.service.active = isAgree;
      vm.service.userAgree = true;
      vm.close();
    } else {
      vm.service.active = false;
      vm.close();
    }
  }
}
