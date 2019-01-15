angular.module("app").component("nwPopupAeroexpressSchedule", {
	templateUrl: "components/nw-popup-aeroexpress-schedule/nw-popup-aeroexpress-schedule.html",
	controller: ["backend", "fancyboxTools", PopupAeroexpressScheduleController],
	controllerAs: "vm"
});

function PopupAeroexpressScheduleController(backend, fancyboxTools) {
	const vm = this;
	console.log(vm);
	vm.close = close;

	// открываем попап аэроэкспресса
	function close(){
		console.log('close');
		fancyboxTools.openHandler('nw-aeroexpress-popup')
	}



	fancyboxTools.setOpenListener("popupAeroexpressSchedule", link => {
		const date = link.attr("data-date"),
			arrivalCode = link.attr("data-arrival-code"),
			departureCode = link.attr("data-departure-code");
		vm.loading = true;

		$('.fancybox-overlay').on('click', close);

		backend
			.aeroexpressSchedule({
				date,
				arrival: arrivalCode,
				departure: departureCode
			})
			.then(
				resp => {
					vm.loading = false;
					vm.arrival = link.attr("data-arrival");
					vm.departure = link.attr("data-departure");
					vm.schedule = resp.schedule;
				},
				() => {
					vm.loading = false;
				}
			);
	});
}
