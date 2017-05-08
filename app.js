'use strict';

var noble = require('noble');
var Q = require('q');

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
		discoverServicesAndCharacteristicsOnPeripheral(peripheral);
		Q(peripheral).delay(2000).then(function(peripheral) {
			// send command to remote control command characteristic (02b8cbcc0e254bda8790a15f53e6010f) of
			// remote control service of sbrick (4dc591b0857c41deb5f115abda665b0c)
		});
	}
};

function sendRemoteControlCommand(peripheral) {

}

function discoverServicesAndCharacteristicsOnPeripheral(peripheral) {
	connectPeripheral(peripheral).then(function(peripheral) {
		return discoverServices(peripheral);
	}).then(function(services) {
		services.forEach(function(service) {
			discoverCharacteristics(service).then(function(characteristics) {
				characteristics.forEach(function(characteristic) {
					console.log(
						'service=' + characteristic._serviceUuid,
						'characteristic=' + characteristic.uuid,
						characteristic.properties);
				})
			}).done();
		});
	})
	//.then(stopScanning())
	.done();
}

function discoverServices(peripheral) {
	return Q.ninvoke(peripheral, 'discoverServices', []);
}

function discoverCharacteristics(service) {
	return Q.ninvoke(service, 'discoverCharacteristics', []);
}
function connectPeripheral(peripheral) {
	var deferred = Q.defer();
	peripheral.connect(function(error) {
		if (error) {
			deferred.reject(new Error(error));
		} else {
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

