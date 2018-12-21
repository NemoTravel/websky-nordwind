angular.module('app').component('nwEsPopup', {
    templateUrl: 'components/nw-meal-popup/nw-meal-popup.html',
    controller: 'nwMealPopupController',
    bindToController: true,
    controllerAs: 'vm',
    bindings: {
        locked: '=',
        esCode: '<',
        es: '='
    },
    transclude: {
        'extra-service': 'wrap',
    },
});

angular.module('app').controller('nwMealPopupController', ['$scope', 'backend', 'fancyboxTools', nwMealPopupController]);

function nwMealPopupController($scope, backend, fancyboxTools) {

    var vm = this;
    var submitCallback = false;

    vm.close = close;
    vm.submit = submit;
    // vm.getCountryLocalNameByCode = backend.getCountryLocalNameByCode;
    // vm.emptyPatronymicPassengers = [];
    // vm.confirmPassengers = false;

    fancyboxTools.setOpenListener('nw-es-popup', function (link, params) {
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
