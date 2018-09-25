angular.module('app').component('nordwindEs', {
    templateUrl: 'components/nordwind-es/nordwind-es.html',
    bindings: {
        orderInfo: '='
    },
    controller: ['$scope', 'backend', 'utils', nordwindEsController],
    controllerAs: 'vm'
});


function nordwindEsController($scope, backend, utils) {
    var vm = this;


    vm.selected = null;
    vm.service = null;
    vm.handleEsSelect = handleEsSelect;
    vm.closePopup = closePopup;
    vm.addInsurance = addInsurance;


    backend.ready.then(function () {

        backend.getExtraServices().then(function (response) {
            vm.extraServicesList = response.extraServices.slice();
            console.log(vm.extraServicesList);

            vm.es = utils.reformatAvailableExtraServices(response.extraServices.slice(), vm.orderInfo, undefined);
            console.log(vm.es);

            // make every extra service active by default
            _.forEach(vm.es, function (es) {
                if (es.code !== 'insurance') {
                    es.active = true;
                } else {
                    var insurance = es;

                    var orderInfoInsurance =
                        _.find(vm.orderInfo.editable_extra_services, {code: 'insurance'})
                        ||
                        _.find(vm.orderInfo.editable_extra_services, {code: 'insuranceOnline'});

                    if(orderInfoInsurance){
                        es.active = false;
                    }
                }
            });

        });
    });


    function addInsurance() {
        var insuranceEs = _.find(vm.es, {code: 'insurance'});
        vm.service = vm.es.insurance;
        console.log(vm.es);

        if (insuranceEs.active) {
            if (insuranceEs.items.length === 1) {
                backend.modifyExtraService(getInsuranceSubmitParams(insuranceEs.items[0]));
            }
            vm.service.active = false;
        } else {

            backend.removeExtraService({
                code: insuranceEs.onlineMode ? 'insuranceOnline' : 'insurance'
            });
            vm.service.active = true;
        }
    }


    function switchService(service) {
        service.active = !service.active;
        if (service.active) {
            if (service.items.length === 1) {
                backend.modifyExtraService(getInsuranceSubmitParams(service.items[0]));
            }
        } else {
            backend.removeExtraService({
                code: service.onlineMode ? 'insuranceOnline' : 'insurance'
            });
        }
    }

    function switchServiceItem(itemNum, paxKey) {
        if (!vm.locked) {
            if (paxKey === 'common') {
                backend[
                    vm.service.items[itemNum].selected ?
                        'modifyExtraService' :
                        'removeExtraService'
                    ](getInsuranceSubmitParams(vm.service.items[itemNum]));
            } else {
                backend[
                    vm.service.itemsByPassengers[paxKey][itemNum].selected ?
                        'modifyExtraService' :
                        'removeExtraService'
                    ](
                    getInsuranceSubmitParams(
                        vm.service.itemsByPassengers[paxKey][itemNum],
                        vm.orderInfo.passengers[paxKey].id
                    )
                );
            }
        }
    }

    function getInsuranceSubmitParams(item, passenger_id) {
        var params = {
            code: 'insurance',
            ins: item.ins,
            tins: item.tins
        };
        if (passenger_id) {
            params.passenger_id = passenger_id;
        }
        if (vm.service.onlineMode) {
            params.code = 'insuranceOnline';
            params.productCode = item.productCode;
        }
        return params;
    }


    function handleEsSelect(esCode, service) {
        vm.selected = esCode;
        if (esCode === 'insurance' || 'insuranceOnline') {
            vm.switchInsurance(service)
        }

    }

    function closePopup() {
        vm.selected = null;
    }

}
