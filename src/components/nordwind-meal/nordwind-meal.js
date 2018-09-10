angular.module('app').component('nordwindMeal', {
    templateUrl: 'components/nordwind-meal/nordwind-meal.html',
    bindings: {
        service: '='
    },
    controller: ['backend', nordwindMealController],
    controllerAs: 'vm'
});


function nordwindMealController(backend) {
    var vm = this;
    console.log(vm.service);


    backend.ready.then(function(){

        backend.getExtraServices().then(function(extraServices){
            vm.extraServicesList = extraServices.slice();
            console.log(vm.extraServicesList);
        });

    });



}
