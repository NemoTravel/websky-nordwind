angular.module("app").component("popupExtraServicesRules", {
    templateUrl: "components/popup-extra-services-rules/popup-extra-services-rules.html",
    controllerAs: "vm",
    controller: function(){
        var vm = this;
        vm.close = jQuery.fancybox.close;
    }
});
