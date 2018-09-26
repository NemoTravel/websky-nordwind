require('./screens/add-services/AddServicesScreenController');
require('./screens/search-order/search-order');

angular.module('app').run(['$rootScope', 'redirect', 'backend', function ($rootScope, redirect, backend) {
    $rootScope.$on('$locationChangeStart', function (e) {

        var href = location.href.split('#')[1];

        href = href.split('/');

        var route = href[1],
            pnr = href[2],
            lastName = href[3];


        if (route === 'add-services' && pnr && lastName) {
            lastName = decodeURIComponent(lastName);

            backend.searchOrder(pnr, lastName).then(function (resp) {
                if (resp.addingExtraServicesAllowed) {
                    redirect.goToAddServices();
                } else {
                    redirect.goToSearchOrder(pnr, lastName);
                }
            });

        }

    })
}]);
