angular.module('app').component('nordwindEs', {
    templateUrl: 'components/nordwind-es/nordwind-es.html',
    bindings: {
        orderInfo: '='
    },
    controller: ['backend', 'utils', nordwindEsController],
    controllerAs: 'vm'
});


function nordwindEsController(backend, utils) {
    var vm = this;

    vm.selected = null;
    vm.handleEsSelect = handleEsSelect;

    backend.ready.then(function () {

        backend.getExtraServices().then(function (extraServices) {
            vm.extraServicesList = extraServices.slice();
            // console.log(vm.extraServicesList);
            // ??? isnt working!
            console.log(utils.getAvailableExtraServicesList(extraServices, vm.orderInfo, vm.extraServicesList));
        });
    });

    function handleEsSelect(esCode) {
        vm.selected = esCode;
        console.log(vm.selected);
    }

}
