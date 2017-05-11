'use strict';

const REMOTE_CONTROL_SERVICE_UUID = '4dc591b0857c41deb5f115abda665b0c';
const REMOTE_CONTROL_CHARACTERISTIC_UUID = '02b8cbcc0e254bda8790a15f53e6010f';
const NUM_CHANNEL = 4;

var noble = require('noble'),
	Q = require('q'),
	_ = require('lodash'),
	winston = require('winston');

winston.level = 'debug';

var SBrick = function() {
	this.id = null;
	this.peripheral = null;
	this.service = null;
	this.characteristic = null;
}

SBrick.prototype.discoverAndConnect = function() {
	var self = this,
		deferred = Q.defer();

	winston.debug('discoverAndConnect');
	noble.on('stateChange', function(state) {
		winston.debug('stateChange event: ' + state);

		if (state === 'poweredOn') {
			self.connect().then(function() {
				deferred.resolve(this);
			});
		} else {
			noble.stopScanning();
			deferred.reject(new Error('Not poweredOn'));
		}
	});
	return deferred.promise;
}

SBrick.prototype.connect = function() {
	var self = this;
	// 1. go into scannign mode
	// 2. connect to a SBrick
	return self.discoverSBrick()
		.then(connectToPeripheralWrapper(self))
		.then(findRemoteControlServiceWrapper(self))
		.then(findRemoteControlCharacteristicWrapper(self));
};

SBrick.prototype.discoverSBrick = function() {
	var deferred = Q.defer();

	winston.info('Discovering SBrick nearby');
	noble.startScanning([], false);
	noble.on('discover', function(peripheral) {
		winston.info('Peripheral discovered', peripheral.id);
		winston.debug('Peripheral advertisement', peripheral.advertisement);
		if (peripheral.advertisement.localName &&
			peripheral.advertisement.localName.startsWith('SBrick ')) {
			// this promise will be resolved everytime a SBrick is discovered
			noble.removeAllListeners('discover');
			deferred.resolve(peripheral);
		} else {
			deferred.reject(new Error('Not a SBrick'));
		}
	});
	return deferred.promise;
}

function connectToPeripheralWrapper(self) {
	return function(peripheral) {
		return self.connectToPeripheral(peripheral);
	}
}

SBrick.prototype.connectToPeripheral = function(peripheral) {
	var deferred = Q.defer(),
		self = this;

	winston.info('connecting to peripheral', peripheral.id);
	peripheral.connect(function(error) {
		if (error) {
			deferred.reject(new Error(error));
		} else {
			console.log('connectPeripheral: resolved');
			self.id = peripheral.id;
			self.peripheral = peripheral;
			deferred.resolve(peripheral);
		}
	});
	return deferred.promise;
}

function findRemoteControlServiceWrapper(self) {
	return function(peripheral) {
		return self.findRemoteControlService(peripheral);
	}
}

SBrick.prototype.findRemoteControlService = function(peripheral) {
	var deferred = Q.defer(),
		self = this;

	winston.info('finding remote control service');
	peripheral.discoverServices([REMOTE_CONTROL_SERVICE_UUID], function(error, services) {
		if (error) {
			winston.error(error);
			deferred.reject(error);
		}

		if (services.length != 1) {
			var msg = 'Not exactly one remote control service discovered';
			winston.error(msg);
			deferred.reject(new Error(msg));
		}

		winston.info('Remote control service discovered:', services[0].uuid);
		self.service = services[0];
		deferred.resolve(services[0]);
	});
	return deferred.promise;
}

function findRemoteControlCharacteristicWrapper(self) {
	return function(service) {
		return self.findRemoteControlCharacteristic(service);
	}
}

SBrick.prototype.findRemoteControlCharacteristic = function(service) {
	var deferred = Q.defer(),
		self = this;

	winston.info('finding remote control characteristic');
	service.discoverCharacteristics([REMOTE_CONTROL_CHARACTERISTIC_UUID], function(error, characteristics) {
		if (error) {
			winston.error(error);
			deferred.reject(error);
		}

		if (characteristics.length != 1) {
			var msg = 'Not exactly one remote control characteristic discovered';
			winston.error(msg);
			deferred.reject(new Error(msg));
		}

		winston.info('Remote control characteristic discovered:', characteristics[0].uuid);
		self.characteristic = characteristics[0];
		deferred.resolve(characteristics[0]);
	});
	return deferred.promise;
}

// channels contains a list of channels 
// that will receive the drive command
SBrick.prototype.driveForward = function(channels, power) {
	winston.debug('Driving forward');

	var command = [0x01];
	for (var idx = 0; idx < NUM_CHANNEL; idx++) {
		var commandForThisChannel = [idx, 0x00, _.includes(channels, idx) ? power : 0x00];
		command = _.concat(command, commandForThisChannel);
	}
	winston.debug('command', command);
	this.write(Buffer.from(command));
}

SBrick.prototype.write = function(cmd) {
	var self = this;
	winston.debug('writing command', cmd);
	var deferred = Q.defer();
	self.characteristic.write(cmd, true, function(error) {
		if (error) {
			console.log('send command error', error);
			deferred.reject(error);
		}

		self.characteristic.on('read', function(data, isNotification) {
			winston.debug('isNotification', isNotification);
			winston.debug('data: ', data);
			setTimeout(function() { deferred.resolve(); }, 1000);
		});
		self.characteristic.read();
	});
	return deferred.promise;
}

module.exports = SBrick;
