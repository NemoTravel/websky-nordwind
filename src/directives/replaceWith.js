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

app.controller('isRouteController', ['$scope', 'backend', '$location', isRouteController]);

function isRouteController($scope, backend, $location) {
    var vm = $scope.$parent.vm;
    vm.originalBrands = false;
    vm.needToRestoreBrandsInfo = false;


    backend.ready.then(function () {
        try {
            var redefineRules = JSON.parse(backend.getAlias('web.brandConfig.redefine'));
        } catch (e) {
            console.error('redefine rules parse error', e);
        }
        vm.redefineRules = redefineRules;

        $scope.$watch(angular.bind(this, function () {
            return vm.selectedVariantsInfo;
        }), restoreBrandsInfo);

        $scope.$watch(angular.bind(this, function () {
            return vm.searchResult
        }), function (newSearchResult) {

            if ($location.path() === '/search-order') {
                return;
            }

            onNewSearchResult(newSearchResult);
        });

        $scope.$watch(angular.bind(this, function () {
            if (vm.orderInfo) {
                return vm.orderInfo.flights
            }
        }), function (newFlights) {
            onNewSearchOrderFlights(newFlights);
        });

    });


    function onNewSearchOrderFlights(flights) {
        if (!flights) {
            return;
        }

        _.forEach(flights, function (flightSegment) {

            _.forEach(flightSegment.flights, function (userFlight) {
                var origin = userFlight.originport ? userFlight.originport : userFlight.origincity;
                var destination = userFlight.destinationport ? userFlight.destinationport : userFlight.destinationcity;

                var redefineBrands = false;


                _.forEach(vm.redefineRules, function (redefineRule) {
                    _.forEach(redefineRule.routes, function (flight) {

                        if (origin === flight.from && destination === flight.to ||
                            flight.from === destination && flight.to === origin) {
                            console.log('we redefine some rules here, check the replacWith directive');

                            redefineBrands = true;

                            var flightBrand = {
                                brand: userFlight.brand,
                                brandAvailableProps: userFlight.brandAvailableProps,
                                brandUnavailableProps: userFlight.brandUnavailableProps,
                                brandPaidProps: userFlight.brandPaidProps
                            };

                            var originalBrands = backend.getBrandConfig();

                            var originalBrand = originalBrands.filter(function (brand) {
                                return brand.code === flightBrand.brand;
                            })[0];


                            _.forEach(redefineRule.brands, function (brand) {
                                if (flightBrand.brand === brand.brand) {
                                    var available = [];
                                    var unavailable = [];
                                    var paid = [];

                                    _.forEach(brand.props, function (prop) {
                                        switch (prop.available) {
                                            case 'yes':
                                                userFlight.brandAvailableProps.push(prop.name);
                                                break;
                                            case 'no':
                                                userFlight.brandUnavailableProps.push(prop.name);
                                                break;
                                            case 'paid':
                                                userFlight.brandPaidProps.push(prop.name);
                                                break;
                                            default:
                                                break;
                                        }
                                    });
                                }
                            })
                        }
                    });
                });
            })
        })


    }

    function onNewSearchResult(newSearchResult) {
        vm.needToRestoreBrandsInfo = false;

        if (newSearchResult && typeof vm.originalBrands === 'boolean') {
            // Нужно закэшировать оригинальные бренды
            // т.к. потом они заменятся а поскольку в js не примитивы передаются по ссылке
            // нужно будет восстанавливать из этого массива значения если
            // выбраны направления которые не переопределяются
            vm.originalBrands = angular.copy(backend.getBrandConfig());
        }
        var replaceInfo = false;

        if (needToRedefine(newSearchResult)) {
            replaceInfo = true;
        }

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

                vm.needToRestoreBrandsInfo = true;
            }
        }
    }

    function needToRedefine(newSearchResult) {
        var needRedefine = false;
        _.forEach(vm.redefineRules, function (redefineRule) {
            _.forEach(redefineRule.routes, function (flight) {
                _.forEach(newSearchResult.segmentRows, function (segment) {
                    _.forEach(segment, function (segmentFlight) {
                        // если есть конкретный аэропорт вылета, искать по нему
                        var origin = segmentFlight.flightsInfo.originport ? segmentFlight.flightsInfo.originport : segmentFlight.flightsInfo.origincity;
                        var destination = segmentFlight.flightsInfo.destinationport ? segmentFlight.flightsInfo.destinationport : segmentFlight.flightsInfo.destinationcity;

                        if (origin === flight.from && destination === flight.to || origin === flight.to && destination === flight.from) {
                            needRedefine = true;
                        }
                    });
                });
            });
        });
        return needRedefine;
    }


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

    function restoreBrandsInfo() {
        if (!vm.selectedVariantsInfo) {
            return;
        }

        if (!vm.needToRestoreBrandsInfo) {
            return;
        }

        console.log('restoreBrandsInfo');
        // console.log(vm.selectedVariantsInfo);
        // console.log(vm.originalBrands);


        _.forEach(vm.selectedVariantsInfo, rearrangeBrandProps);
    }

    function rearrangeBrandProps(selectedVariant) {
        var originalBrand = getOriginalBrand(selectedVariant.brand);
        var availableProps = [];
        var paidProps = [];
        var unavailableProps = [];

        _.forEach(originalBrand.props, function (prop) {
            switch (prop.available) {
                case 'yes':
                    if(prop.shortDesc) {
                        availableProps.push(prop.shortDesc);
                    } else {
                        availableProps.push(prop.name);
                    }
                    break;
                case 'paid':
                    paidProps.push(prop.name);
                    break;
                case 'no':
                    unavailableProps.push(prop.name);
                    break;
                default:
                    return;
            }
        });

        selectedVariant.brandAvailableProps = availableProps.slice();
        selectedVariant.brandPaidProps = paidProps.slice();
        selectedVariant.brandUnavailableProps = unavailableProps.slice();
    }

    function getOriginalBrand(brandCode) {
        return vm.originalBrands.filter(function (brand) {
            return brand.code === brandCode;
        })[0]
    }
}