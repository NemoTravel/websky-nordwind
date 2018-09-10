angular.module('app').component('nordwindEs', {
    templateUrl: 'components/nordwind-es/nordwind-es.html',
    bindings: {
        orderInfo: '='
    },
    controller: ['backend', nordwindEsController],
    controllerAs: 'vm'
});


function nordwindEsController(backend) {
    var vm = this;
    vm.link = 'test';

    backend.ready.then(function(){

        backend.getExtraServices().then(function(extraServices){
            vm.extraServicesList = extraServices.slice();
            console.log(vm.extraServicesList);
        });

    });

}
