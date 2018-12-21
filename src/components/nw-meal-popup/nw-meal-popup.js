angular.module('app').component('nwMealPopup', {
    templateUrl: 'components/nw-meal-popup/nw-meal-popup.html',
    controller: 'nwMealPopupController',
    controllerAs: 'vm',
    transclude: {
        'es-meal': 'div',
    },
});

angular.module('app').controller('nwMealPopupController', ['$scope', 'backend', nwMealPopupController]);

function nwMealPopupController(fancyboxTools, backend) {

    var vm = this;
    var submitCallback = false;

    vm.close = close;
    vm.submit = submit;
    // vm.getCountryLocalNameByCode = backend.getCountryLocalNameByCode;
    // vm.emptyPatronymicPassengers = [];
    // vm.confirmPassengers = false;

    fancyboxTools.setOpenListener('nw-meal-popup', function (link, params) {
        // if (params) {
        //     submitCallback = params.submitCallback;
        //     vm.emptyPatronymicPassengers = params.emptyPatronymicPassengers;
        //     vm.confirmPassengers = params.confirmPassengers;
        //     vm.getDocumentTypeNameByCode = params.getDocumentTypeNameByCode;
        // }
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
