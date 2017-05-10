'use strict';

var noble = require('noble');
var Q = require('q');
var _ = require('lodash');
const REMOTE_CONTROL_SERVICE_UUID = '4dc591b0857c41deb5f115abda665b0c';
const REMOTE_CONTROL_CHARACTERISTIC_UUID = '02b8cbcc0e254bda8790a15f53e6010f';
const NUM_CHANNEL = 5;

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
	var remoteControlCharacteristic = characteristics[0];
	var q = Q.defer();

	// Get channel status
	// const cmd = Buffer.from([0x22]);
	// drive, channel 0, direction, power
	// const cmd = Buffer.from([0x01, 0x00, 0x00, 0xFF]);
	const cmd = driveForward([0, 1], 0xFF);
	
	remoteControlCharacteristic.write(cmd, true, function(error) {
		if (error) {
			console.log('send command error', error);
			q.reject(error);
		}

		remoteControlCharacteristic.on('read', function(data, isNotification) {
			console.log('isNotification', isNotification);
			console.log('data: ', data);
			setTimeout(function() { q.resolve(); }, 2000);
		});
		remoteControlCharacteristic.read();
	});
	remoteControlCharacteristic.subscribe(function(error) {
		if (error) {
			console.log('subscribe error', error);
			q.reject(error);
		}
	})

	return q.promise;
}

// channels contains a list of channels 
// that will receive the drive command
function driveForward(channels, power) {
	var command = [0x01];

	for (var idx = 0; idx < NUM_CHANNEL; idx++) {
		var commandForThisChannel = [idx, 0x00, _.includes(channels, idx) ? power : 0x00];
		command = _.concat(command, commandForThisChannel);
	}
	console.log(command);
	return Buffer.from(command);
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

