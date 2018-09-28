angular.module('app').component('nordwindEs', {
    templateUrl: 'components/nordwind-es/nordwind-es.html',
    bindings: {
        orderInfo: '=',
        loading: '='
    },
    controller: ['$scope', 'backend', 'utils', nordwindEsController],
    controllerAs: 'vm'
});


function nordwindEsController($scope, backend, utils) {
    var vm = this;


    vm.selected = null;
    vm.handleEsSelect = handleEsSelect;
    vm.closePopup = closePopup;
    vm.addInsurance = addInsurance;


    backend.ready.then(function () {

        // show additional prices on the flight
        backend.addExtraServiceListener(function (val) {
            if (val) {
                backend.updateOrderInfo().then(function (resp) {
                    vm.orderInfo = resp;
                });
            }
        });

        backend.getExtraServices().then(function (response) {
            vm.extraServicesList = response.extraServices.slice();

            vm.es = utils.reformatAvailableExtraServices(response.extraServices.slice(), vm.orderInfo, undefined);
            activateAllServicesByDefault();

        });

    });


    function addInsurance() {
        var insuranceEs = _.find(vm.es, {code: 'insurance'});
        vm.service = vm.es.insurance;
        insuranceEs.active = !insuranceEs.active;

        console.log(insuranceEs);
        if (insuranceEs.active) {
            if (insuranceEs.items.length === 1) {
                backend.modifyExtraService(getInsuranceSubmitParams(insuranceEs.items[0]));
            }
        } else {
            backend.removeExtraService({
                code: insuranceEs.onlineMode ? 'insuranceOnline' : 'insurance'
            });
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

    // по умолчанию все сервисы должны быть открыты
    // если не вызвать эту функцию в попапе
    // доп. услуга будет скрыта
    function activateAllServicesByDefault() {
        _.forEach(vm.es, function (es) {
            es.active = true;
        })
    }


    function handleEsSelect(esCode, service) {
        vm.selected = esCode;
    }

    function closePopup() {
        vm.selected = null;
    }

}
