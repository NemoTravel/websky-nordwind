require('./screens/add-services/AddServicesScreenController');
require('./screens/search-order/search-order');
require('./directives/replaceWith');
require('./directives/showAirplanePopupInfo');
require('./directives/hideCountriesOnSpecificRoute');
require('./components/popup-seat-warning/popup-seat-warning');
require('./components/popup-extra-services-rules/popup-extra-services-rules');

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
