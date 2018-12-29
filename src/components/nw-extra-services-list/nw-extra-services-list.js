var app = angular.module('app');

app.component('nwExtraServicesList', {
    templateUrl: 'components/nw-extra-services-list/nw-extra-services-list.html',
    controller: 'extraServicesListController',
    controllerAs: 'vm',
    bindings: {
        es: '=es',
        list: '=list',
        availableBundlesByPassengerSegments: '<',
        locked: '=locked'
    }
});


app.controller('extraServicesListController', ['utils', extraServicesListController]);

function extraServicesListController(utils) {

    const vm = this;
    vm.isCommonService = utils.isCommonServiceCode;

}
