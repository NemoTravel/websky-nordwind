var app = angular.module('app');

app.directive('replaceWith', function () {
    return {
        scope: false,
        controllerAs: 'replaceWith',
        bindToController: true,
        scopeAs: 'vm',
        controller: 'isRouteController'
    }
});

app.controller('isRouteController', ['$scope', 'backend', isRouteController]);

function isRouteController($scope, backend) {
    var vm = $scope.$parent.vm;
    var searchResult = null;


    backend.ready.then(function () {
        try {
            var redefineRules = JSON.parse(backend.getAlias('web.brandConfig.redefine'));
        } catch (e) {
            console.error('redefine rules parse error', e);
        }
        vm.redefineRules = redefineRules;

    });

    $scope.$watch(angular.bind(this, function () {
        return vm.searchResult
    }), function (newSearchResult) {
        searchResult = newSearchResult;

        var replaceInfo = false;

        _.forEach(vm.redefineRules, function (redefineRule) {
            _.forEach(redefineRule.routes, function (flight) {
                _.forEach(newSearchResult.segmentRows, function (segment) {
                    _.forEach(segment, function (segmentFlight) {
                        console.log(segment);
                        if (segmentFlight.flightsInfo.origincity === flight.from && segmentFlight.flightsInfo.destinationcity === flight.to) {
                            console.log('we redefine some rules here, head to web.brandConfig.redefine');
                            replaceInfo = true;
                        }
                    })
                })
            });
        });

        if (replaceInfo) {
            replaceInfoInBrandList(newSearchResult.brandsList);
        }

    });


    function replaceInfoInBrandList(brandsList) {

        _.forEach(vm.redefineRules, function (rules) {
            _.forEach(rules.brands, function (replaceWithBrand) {
                _.forEach(brandsList, function (brand) {
                    if (brand.code === replaceWithBrand.brand) {
                        replaceBrandInfo(brand, replaceWithBrand)
                    }
                })
            });
        })
    }


    function replaceBrandInfo(brand, replaceWithBrand) {
        console.log(brand, replaceWithBrand);
        _.forEach(brand.props, function (brandProp) {
            if (replaceWithBrand.props[brandProp.code]) {
                _.extend(brandProp, replaceWithBrand.props[brandProp.code]);
            }
        })
    }
}