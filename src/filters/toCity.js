var lvovich = require('lvovich/dist/lvovich.min');

angular.module('app').filter('toCity', function () {
    return function (city) {
        return 'в ' + lvovich.cityTo(city)
    };
});