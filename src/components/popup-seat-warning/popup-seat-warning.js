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
  vm.isDropdownOpen = false;

  vm.isUserAgree = isUserAgree;
  vm.switchDropdown = switchDropdown;

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

  function switchDropdown() {
    vm.isDropdownOpen = !vm.isDropdownOpen;
  }
}
