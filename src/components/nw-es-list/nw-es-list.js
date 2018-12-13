var app = angular.module('app');


app.component('nwEsList', {
    bindings: {
        orderInfo: '=',

    },
    controllerAs: 'vm',
    controller: ['$scope', nwEsListController]
});

function nwEsListController($scope) {
    var vm = this;
}