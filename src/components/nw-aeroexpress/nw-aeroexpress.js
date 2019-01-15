angular.module("wes").component("nwAeroexpress", {
	templateUrl: "components/nw-aeroexpress/nw-aeroexpress.html",
	controller: ["$q", "backend", AeroexpressController],
	controllerAs: "vm",
	bindings: {
		service: "=service",
		locked: "=locked"
	}
});

function AeroexpressController($q, backend) {
	var vm = this;

	vm.switchService = switchService;
	vm.addExtraPassenger = addExtraPassenger;
	vm.removeExtraPassenger = removeExtraPassenger;
	vm.documentTypeChangeHandler = documentTypeChangeHandler;
	vm.extraPassengerDateOfBirthChangeHandler = extraPassengerDateOfBirthChangeHandler;
	vm.isExtraPassengerFreeForAllDates = isExtraPassengerFreeForAllDates;
	vm.isIssued = isIssued;

	vm.availableDocumentsByExtraPassengers = [];

	backend.ready.then(function() {
		vm.todayDate = backend.sessionParams.todayDate;
	});

	backend.addOrderInfoListener(
		function(orderInfo) {
			vm.orderInfo = orderInfo;

			if (orderInfo) {
				if (orderInfo.passengers) {
					vm.orderInfo.passengers.forEach(function(passenger) {
						var orderAeroexpressService = _.findWhere(
								orderInfo.all_extra_services,
								{ code: "aeroexpress" }
							),
							orderAeroexpressItem;

						if (
							_.findWhere(vm.service.documents, {
								code: passenger.documentCode
							})
						) {
							passenger.aeroexpressDocumentType = passenger.documentCode;
							passenger.aeroexpressDocumentNumber = passenger.documentNumber;
						}
						if (
							orderAeroexpressService &&
							orderAeroexpressService.items &&
							orderAeroexpressService.items.length
						) {
							orderAeroexpressItem = _.findWhere(
								orderAeroexpressService.items,
								{
									firstName: passenger.firstName,
									lastName: passenger.lastName
								}
							);
							if (orderAeroexpressItem) {
								passenger.aeroexpressDocumentType =
									orderAeroexpressItem.documentType;
								passenger.aeroexpressDocumentNumber =
									orderAeroexpressItem.documentNumber;
							}
						}
					});

					vm.optionsByPassengers = vm.orderInfo.passengers.map(function(
						passenger,
						passengerNum
					) {
						return vm.service.items.map(function(item) {
							var passengerItem = angular.copy(item);
							passengerItem.firstName = passenger.firstName;
							passengerItem.lastName = passenger.lastName;
							passengerItem.dateOfBirth = passenger.dateOfBirth;
							passengerItem.documentType = passenger.documentCode;
							passengerItem.documentNumber = passenger.documentNumber;
							// Поменчаем полностью бесплатные элементы
							passengerItem.free = isAllPassengerItemDatesFree(
								vm.service.passengersFree[passengerNum],
								passengerItem.dates
							);
							// Оставляем только даты, на которых есть платные билеты
							passengerItem.dates = passengerItem.dates.filter(function(date) {
								return !vm.service.passengersFree[passengerNum][date];
							});
							passengerItem.selected = isPassengerItemSelected(
								passengerItem,
								orderInfo
							);
							passengerItem.issued = isPassengerItemIssued(
								passengerItem,
								orderInfo
							);
							if (passengerItem.selected) {
								passengerItem.selectedDate = getPassengerItemSelectedDate(
									passengerItem,
									orderInfo
								);
							} else {
								passengerItem.selectedDate = passengerItem.dates[0];
							}
							if (passengerItem.issued) {
								passengerItem.issuedDate = getPassengerItemIssuedDate(
									passengerItem,
									orderInfo
								);
							}
							return passengerItem;
						});
					});

					vm.documentPatternsListByPassengers = vm.orderInfo.passengers.map(
						function(passenger) {
							if (passenger.aeroexpressDocumentType) {
								return _.findWhere(vm.service.documents, {
									code: passenger.aeroexpressDocumentType
								}).regexps;
							} else {
								return [];
							}
						}
					);

					$q.all(
						orderInfo.passengers.map(function(passenger) {
							return backend.getAvailableDocumentsForAeroexpress({
								birthDate: passenger.dateOfBirth,
								departureDate: vm.service.items[0].dates[0]
							});
						})
					).then(function(resp) {
						vm.availableDocumentsByOrderPassengers = resp.map(function(
							respItem
						) {
							return respItem.documents;
						});
					});
				}

				if (orderInfo.extraPassengers) {
					vm.extraPassengers = angular.copy(orderInfo.extraPassengers);
					vm.optionsByExtraPassengers = vm.extraPassengers.map(
						getItemsForExtraPassenger
					);

					vm.documentPatternsListByExtraPassengers = vm.extraPassengers.map(
						function() {
							return [];
						}
					);
				}
			}
		},
		false,
		true
	);

	function switchService() {
		if (!vm.locked) {
			vm.service.active = !vm.service.active;
			if (!vm.service.active) {
				backend.removeExtraService({
					code: "aeroexpress"
				});
			}
		}
	}

	function addExtraPassenger() {
		vm.extraPassengers.push({});
		vm.optionsByExtraPassengers.push(getItemsForExtraPassenger());
		vm.availableDocumentsByExtraPassengers.push([]);
	}

	function removeExtraPassenger(num) {
		vm.extraPassengers.splice(num, 1);
		vm.optionsByExtraPassengers.splice(num, 1);
		vm.availableDocumentsByExtraPassengers.splice(num, 1);
	}

	function getItemsForExtraPassenger(passengerData) {
		return vm.service.items.map(function(item) {
			var passengerItem = angular.copy(item);
			if (passengerData) {
				passengerItem.firstName = passengerData.firstName;
				passengerItem.lastName = passengerData.lastName;
				passengerItem.dateOfBirth = passengerData.dateOfBirth;
				passengerItem.documentType = passengerData.documentType;
				passengerItem.documentNumber = passengerData.documentNumber;
			}
			passengerItem.selected = isPassengerItemSelected(
				passengerItem,
				vm.orderInfo
			);
			passengerItem.issued = isPassengerItemIssued(passengerItem, vm.orderInfo);
			if (passengerItem.selected) {
				passengerItem.selectedDate = getPassengerItemSelectedDate(
					passengerItem,
					vm.orderInfo
				);
			} else {
				passengerItem.selectedDate = passengerItem.dates[0];
			}
			if (passengerItem.issued) {
				passengerItem.issuedDate = getPassengerItemIssuedDate(
					passengerItem,
					vm.orderInfo
				);
			}
			return passengerItem;
		});
	}

	function documentTypeChangeHandler(passengerNum, isExtraPassenger) {
		var selectedDoc = _.findWhere(vm.service.documents, {
			code: isExtraPassenger
				? vm.extraPassengers[passengerNum].aeroexpressDocumentType
				: vm.orderInfo.passengers[passengerNum].aeroexpressDocumentType
		});
		vm[
			isExtraPassenger
				? "documentPatternsListByExtraPassengers"
				: "documentPatternsListByPassengers"
		][passengerNum] = selectedDoc.regexps;
	}

	function extraPassengerDateOfBirthChangeHandler(passengerNum) {
		var dateOfBirth = vm.extraPassengers[passengerNum].dateOfBirth;
		return backend
			.getAvailableDocumentsForAeroexpress({
				birthDate: dateOfBirth,
				departureDate: vm.service.items[0].dates[0]
			})
			.then(function(resp) {
				vm.availableDocumentsByExtraPassengers[passengerNum] = resp.documents;
			});
	}

	function isAllPassengerItemDatesFree(freeDatesObj, availableDatesList) {
		var isFree = true;
		if (freeDatesObj) {
			availableDatesList.forEach(function(date) {
				if (!freeDatesObj[date]) {
					isFree = false;
				}
			});
		}
		return isFree;
	}

	function isPassengerItemIssued(passengerItem, orderInfo) {
		var orderAeroexpressService = _.findWhere(orderInfo.all_extra_services, {
			code: "aeroexpress"
		});
		if (
			orderAeroexpressService &&
			orderAeroexpressService.items &&
			orderAeroexpressService.items.length
		) {
			return !!_.findWhere(orderAeroexpressService.items, {
				departure_code: passengerItem.departure_code,
				arrival_code: passengerItem.arrival_code,
				firstName: passengerItem.firstName,
				lastName: passengerItem.lastName,
				status: "ISSUED"
			});
		}
		return false;
	}

	function isIssued(passengerItem) {
		var orderAeroexpressService = _.findWhere(vm.orderInfo.all_extra_services, {
			code: "aeroexpress"
		});
		var passenger = _.findWhere(orderAeroexpressService.items, {
			firstName: passengerItem.firstName,
			lastName: passengerItem.lastName
		});
		return !!passenger;
	}

	function getPassengerItemIssuedDate(passengerItem, orderInfo) {
		var orderAeroexpressService = _.findWhere(orderInfo.all_extra_services, {
			code: "aeroexpress"
		});
		if (
			orderAeroexpressService &&
			orderAeroexpressService.items &&
			orderAeroexpressService.items.length
		) {
			return _.findWhere(orderAeroexpressService.items, {
				departure_code: passengerItem.departure_code,
				arrival_code: passengerItem.arrival_code,
				firstName: passengerItem.firstName,
				lastName: passengerItem.lastName,
				status: "ISSUED"
			}).departure_date;
		}
	}

	function isPassengerItemSelected(passengerItem, orderInfo) {
		var orderAeroexpressService = _.findWhere(
			orderInfo.editable_extra_services,
			{ code: "aeroexpress" }
		);
		if (
			orderAeroexpressService &&
			orderAeroexpressService.items &&
			orderAeroexpressService.items.length
		) {
			return !!_.findWhere(orderAeroexpressService.items, {
				departure_code: passengerItem.departure_code,
				arrival_code: passengerItem.arrival_code,
				firstName: passengerItem.firstName,
				lastName: passengerItem.lastName
			});
		}
		return false;
	}

	function getPassengerItemSelectedDate(passengerItem, orderInfo) {
		var orderAeroexpressService = _.findWhere(
			orderInfo.editable_extra_services,
			{ code: "aeroexpress" }
		);
		if (
			orderAeroexpressService &&
			orderAeroexpressService.items &&
			orderAeroexpressService.items.length
		) {
			return _.findWhere(orderAeroexpressService.items, {
				departure_code: passengerItem.departure_code,
				arrival_code: passengerItem.arrival_code,
				firstName: passengerItem.firstName,
				lastName: passengerItem.lastName
			}).departure_date;
		}
	}

	function isExtraPassengerFreeForAllDates(passengerNum) {
		var dateOfBirth = moment(
				vm.extraPassengers[passengerNum].dateOfBirth,
				"DD.MM.YYYY"
			),
			i,
			j;
		for (i = 0; i < vm.optionsByExtraPassengers[passengerNum].length; i++) {
			for (
				j = 0;
				j < vm.optionsByExtraPassengers[passengerNum][i].dates.length;
				j++
			) {
				// Если дата АЭ минус 5 лет позже даты рождения - билет платный
				if (
					moment(
						vm.optionsByExtraPassengers[passengerNum][i].dates[j],
						"DD.MM.YYYY"
					)
						.subtract(backend.getParam("extraServices.aeMinChildAge"), "years")
						.isAfter(dateOfBirth)
				) {
					return false;
				}
			}
		}
		return true;
	}
}
