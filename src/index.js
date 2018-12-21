require('./screens/add-services/AddServicesScreenController');
require('./screens/search-order/search-order');
require('./directives/replaceWith');
require('./components/nw-meal-popup/nw-meal-popup');
require('./components/order-with-es/order-with-es');

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
