require('./screens/add-services/AddServicesScreenController');
require('./screens/search-order/search-order');
require('./directives/replaceWith');
require('./components/nw-es-popup/nw-es-popup');
require('./components/order-with-es/order-with-es');
require('./components/nw-extra-services-list/nw-extra-services-list');
require('./components/nw-meal/nw-meal');
require('./components/nw-seat/nw-seat');
require('./filters/toCity');

// TODO: remove it!!
angular.module('app').config(['$compileProvider', function ($compileProvider) {
    $compileProvider.debugInfoEnabled(true);
}]);

angular.module('app').run(['$rootScope', 'redirect', 'backend', function ($rootScope, redirect, backend) {
    $rootScope.$on('$locationChangeStart', function (e) {

        var href = location.href.split('#')[1];

        href = href.split('/');

        var route = href[1],
            pnr = href[2],
            lastName = href[3];


        if (route === 'add-services' && pnr && lastName) {
            lastName = decodeURIComponent(lastName);

            redirect.goToSearchOrder(pnr, lastName);
        }

    })
}]);
