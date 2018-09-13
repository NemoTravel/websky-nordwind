angular.module('app').component('nordwindEs', {
    templateUrl: 'components/nordwind-es/nordwind-es.html',
    bindings: {
        orderInfo: '='
    },
    controller: ['$scope', 'backend', 'utils', nordwindEsController],
    controllerAs: 'vm'
});


function nordwindEsController($scope, backend, utils) {
    var vm = this;


    vm.selected = null;
    vm.handleEsSelect = handleEsSelect;
    vm.closePopup = closePopup;

    backend.ready.then(function () {

        backend.getExtraServices().then(function (extraServices) {
            vm.extraServicesList = extraServices.slice();

            // hooray, now it works
            vm.es = utils.reformatAvailableExtraServices(extraServices.slice(), vm.orderInfo, undefined);
        });
    });


    function handleEsSelect(esCode) {
        vm.selected = esCode;
    }

    function closePopup() {
        vm.selected = null;
    }

}
