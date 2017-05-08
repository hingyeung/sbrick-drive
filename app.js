'use strict';

var noble = require('noble');
var Q = require('q');
let REMOTE_CONTROL_SERVICE_UUID = '4dc591b0857c41deb5f115abda665b0c';
let REMOTE_CONTROL_CHARACTERISTIC_UUID = '02b8cbcc0e254bda8790a15f53e6010f';

noble.on('stateChange', function(state) {
	console.log('stateChange event: ' + state);
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', discoverCallback);

function discoverCallback(peripheral) {
	if (peripheral.advertisement.localName && peripheral.advertisement.localName.startsWith('SBrick')) {
		peripheral.on('disconnect', function() {
	    	process.exit(0);
	  	});
		// discoverServicesAndCharacteristicsOnPeripheral(peripheral);

		// send command to remote control command characteristic (02b8cbcc0e254bda8790a15f53e6010f) of
		// remote control service of sbrick (4dc591b0857c41deb5f115abda665b0c)
		connectPeripheral(peripheral)
		.then(getRemoteControlServiceInPeripheral)
		.then(getRemoteControlCharacteristicInRemoteControlService)
		.then(sendRemoteControlCommand)
		.then(function() {
			return Q.ninvoke(peripheral, 'disconnect');
		})
		.done();

		// connectPeripheral(peripheral);
	}
};

function getRemoteControlServiceInPeripheral(peripheral) {
	return Q.ninvoke(peripheral, 'discoverServices', [REMOTE_CONTROL_SERVICE_UUID]);
}

function getRemoteControlCharacteristicInRemoteControlService(services) {
	if (services.length != 1) {
		throw new Error('Did not discover exactly one remote control service (found ' + services.length + ').');
	}

	var remoteControlService = services[0];
	var deferred = Q.defer();
	console.log('Discovered service', remoteControlService.uuid);
	
	Q.ninvoke(remoteControlService, 'discoverCharacteristics', [REMOTE_CONTROL_CHARACTERISTIC_UUID])
		.then(function(characteristics) {
			deferred.resolve(characteristics);
		})
		.done();

	return deferred.promise;
}

function sendRemoteControlCommand(characteristics) {
	if (characteristics.length != 1) {
		throw new Error('Did not discover exactly one remote control characteristic (found ' + characteristics.length + ').');
	}

	console.log('Sending remote control command');
	return Q().thenResolve();
}

function discoverServicesAndCharacteristicsOnPeripheral(peripheral) {
	connectPeripheral(peripheral).then(function(peripheral) {
		return discoverServices(peripheral);
	}).then(function(services) {
		services.forEach(function(service) {
			discoverCharacteristics(service).then(showCharacteristics).done();
		});
	})
	.then(stopScanning)
	.done();
}

function showCharacteristics(characteristics) {
	characteristics.forEach(function(characteristic) {
		console.log(
			'service=' + characteristic._serviceUuid,
			'characteristic=' + characteristic.uuid,
			characteristic.properties);
	});
}

function stopScanning() {
	console.log('stop scanning');
	noble.stopScanning()
}

function discoverServices(peripheral) {
	return Q.ninvoke(peripheral, 'discoverServices', []);
}

function discoverCharacteristics(service) {
	return Q.ninvoke(service, 'discoverCharacteristics', []);
}
function connectPeripheral(peripheral) {
	console.log('connecting to peripheral');
	var deferred = Q.defer();
	peripheral.connect(function(error) {
		if (error) {
			deferred.reject(new Error(error));
		} else {
			console.log('connectPeripheral: resolved');
			deferred.resolve(peripheral);
		}
	});
	return deferred.promise;
}

// function getConnectCallback(peripheral) {
// 	return function(error) {
// 		console.log('connect CB');
// 		if (error) {
// 			console.log(error);
// 			return;
// 		}

// 		peripheral.discoverServices([], discoverServicesCharacteristicsCB);
// 	}
// }

// function discoverServicesCharacteristicsCB(error, services) {
// 	console.log('discoverServicesCharacteristicsCB');
// 	if (error) {
// 		console.log(error);
// 		return;
// 	}

// 	services.forEach(function(service) {
// 		console.log('service', service.uuid);

// 		service.discoverCharacteristics([], function(error, characteristics) {
// 			if (error) {
// 				console.log(error);
// 			}

// 			characteristics.forEach(function(characteristic) {
// 				console.log('characteristic', characteristic.uuid, characteristic.properties);
// 			});
// 		})
// 	});
// }

