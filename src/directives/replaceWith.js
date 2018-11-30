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
    vm.originalBrands = false;


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

        if (newSearchResult && typeof vm.originalBrands === 'boolean') {
            // Нужно закэшировать оригинальные бренды
            // т.к. потом они заменятся а поскольку в js не примитивы передаются по ссылке
            // нужно будет восстанавливать из этого массива значения если
            // выбраны направления которые не переопределяются
            vm.originalBrands = angular.copy(backend.getBrandConfig());
        }

        var replaceInfo = false;
        _.forEach(vm.redefineRules, function (redefineRule) {
            _.forEach(redefineRule.routes, function (flight) {
                _.forEach(newSearchResult.segmentRows, function (segment) {
                    _.forEach(segment, function (segmentFlight) {
                        if (segmentFlight.flightsInfo.origincity === flight.from && segmentFlight.flightsInfo.destinationcity === flight.to) {
                            replaceInfo = true;
                        }
                    })
                })
            });
        });

        if (replaceInfo) {
            replaceInfoInBrandList(newSearchResult.brandsList);
        } else {
            if (typeof vm.originalBrands !== 'boolean' && newSearchResult.brandsList) {
                // Восстанавливаем кэшированное значение
                newSearchResult.brandsList = newSearchResult.brandsList.map(function (e, i) {
                    return vm.originalBrands.filter(function (item) {
                        return item.code === e.code;
                    })[0];
                });
                console.log(newSearchResult.brandsList);
            }
        }

    }, true);


    function replaceInfoInBrandList(brandsList) {

        _.forEach(vm.redefineRules, function (rules) {
            _.forEach(rules.brands, function (replaceWithBrand) {
                _.forEach(brandsList.slice(), function (brand) {
                    if (brand.code === replaceWithBrand.brand) {
                        replaceBrandInfo(brand, replaceWithBrand)
                    }
                })
            });
        })
    }


    function replaceBrandInfo(brand, replaceWithBrand) {
        console.log('we redefine some rules here, head to web.brandConfig.redefine');
        console.log(brand, replaceWithBrand);
        _.forEach(brand.props, function (brandProp) {
            if (replaceWithBrand.props[brandProp.code]) {
                _.extend(brandProp, replaceWithBrand.props[brandProp.code]);
            }
        })
    }
}