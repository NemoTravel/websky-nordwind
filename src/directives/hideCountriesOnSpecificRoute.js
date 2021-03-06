var app = angular.module("app");

app.directive("hideCountriesOnSpecificRoute", function() {
  return {
    controller: "hideCountriesOnSpecificRouteController",
    controllerAs: "vm",
    bindToController: true,
    scope: {
      routes: "<",
      countries: "=",
      dontFlyToMexico: "=",
    }
  };
});

app.controller("hideCountriesOnSpecificRouteController", [
  "$scope",
  hideCountriesOnSpecificRouteController
]);

function hideCountriesOnSpecificRouteController($scope) {
  var vm = this;

  var COUNTRY_CODES_FOR_REMOVE = [
    "AM",
    "KZ",
    "GE",
    "TJ",
    "UZ",
    "ТМ",
    "AZ",
    "KG",
    "TM"
  ];

  var firstRoute = vm.routes[0].flights[0];

  $scope.$watch("vm.routes", function() {
    if (!vm.routes) {
      return;
    }

    if (
      firstRoute.origincity === "MOW" &&
      firstRoute.destinationcity === "CUN"
    ) {
      vm.dontFlyToMexico = true;
      vm.countries = vm.countries.filter(function(country) {
        return !_.contains(COUNTRY_CODES_FOR_REMOVE, country.code);
      });
    } else {
      vm.dontFlyToMexico = false;
    }
  });
}
