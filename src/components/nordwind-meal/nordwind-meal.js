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


    backend.ready.then(function () {

        backend.getExtraServices().then(function (extraServices) {
            vm.extraServicesList = extraServices.slice();
        });

    });


}
