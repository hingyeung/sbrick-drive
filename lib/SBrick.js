'use strict';

const REMOTE_CONTROL_SERVICE_UUID = '4dc591b0857c41deb5f115abda665b0c';
const REMOTE_CONTROL_CHARACTERISTIC_UUID = '02b8cbcc0e254bda8790a15f53e6010f';
const DRIVE_CMD = 0x01;
const BREAK_CMD = 0x00;
const NUM_CHANNEL = 4;
const SCAN_TIMEOUT = 5000;

var noble = require('noble'),
	Q = require('q'),
	_ = require('lodash'),
	logger = require('./Logger');

logger.level = 'debug';

var SBrick = function() {
	this.ready = false;
	this.id = null;
	this.peripheral = null;
	this.service = null;
	this.characteristic = null;

	function writeWithoutResponse (cmd) {
		var self = this,
			deferred = Q.defer();
		logger.debug('writing command', cmd);
		self.characteristic.write(cmd, true, function(error) {
			if (error) {
				logger.error('send command error', error);
				deferred.reject(error);
			}

			// self.characteristic.on('read', function(data, isNotification) {
			// 	logger.debug('isNotification', isNotification);
			// 	logger.debug('data: ', data.toString('utf8'));
			// 	setTimeout(function() { deferred.resolve(); }, 1000);
			// });
			// self.characteristic.read();
		});
		return deferred.promise;
	}
};

SBrick.prototype.discoverAndConnect = function() {
	var self = this,
		deferred = Q.defer();

	logger.debug('discoverAndConnect');
	noble.on('stateChange', function(state) {
		logger.debug('stateChange event: ' + state);

		if (state === 'poweredOn') {
			self.connect().then(function() {
				deferred.resolve(this);
			}).fail(function(error) {
				deferred.reject(error);
			});
		} else {
			noble.stopScanning();
			deferred.reject(new Error('Not poweredOn'));
		}
	});
	return deferred.promise;
};

SBrick.prototype.connect = function() {
	var self = this;
	// 1. go into scannign mode
	// 2. connect to a SBrick
	return self.discoverSBrick()
		.then(self.connectToPeripheral.bind(self))
		.then(self.findRemoteControlService.bind(self))
		.then(self.findRemoteControlCharacteristic.bind(self));
};

SBrick.prototype.discoverSBrick = function() {
	var deferred = Q.defer();

	logger.info('Discovering SBrick nearby');
	noble.startScanning([], false);
	noble.on('discover', function(peripheral) {
		logger.info('Peripheral discovered', peripheral.id);
		logger.debug('Peripheral advertisement', peripheral.advertisement);
		if (isSBrick(peripheral)) {
			// this promise would be resolved everytime a SBrick is discovered
			// if we don't remove the 'discover' listener
			noble.removeAllListeners('discover');
			logger.debug('Discovered a SBrick');
			deferred.resolve(peripheral);
		} else {
			logger.warn('Not a SBrick. Ignoring.');
			// deferred.reject(new Error('Not a SBrick'));
		}
	});

	setTimeout(function() {
		logger.error('No SBrick discovered after %dms', SCAN_TIMEOUT);
		deferred.reject(new Error('Scanning timeout'));
	}, SCAN_TIMEOUT);

	return deferred.promise;
};

SBrick.prototype.connectToPeripheral = function(peripheral) {
	var deferred = Q.defer(),
		self = this;

	logger.info('connecting to peripheral', peripheral.id);
	peripheral.connect(function(error) {
		if (error) {
			deferred.reject(new Error(error));
		} else {
			self.id = peripheral.id;
			self.peripheral = peripheral;
			deferred.resolve(peripheral);
		}
	});
	return deferred.promise;
};

SBrick.prototype.findRemoteControlService = function(peripheral) {
	var deferred = Q.defer(),
		self = this;

	logger.info('finding remote control service');
	peripheral.discoverServices([REMOTE_CONTROL_SERVICE_UUID], function(error, services) {
		if (error) {
			logger.error(error);
			deferred.reject(error);
		}

		if (services.length != 1) {
			var msg = 'Not exactly one remote control service discovered';
			logger.error(msg);
			deferred.reject(new Error(msg));
		}

		logger.info('Remote control service discovered:', services[0].uuid);
		self.service = services[0];
		deferred.resolve(services[0]);
	});
	return deferred.promise;
};

SBrick.prototype.findRemoteControlCharacteristic = function(service) {
	var deferred = Q.defer(),
		self = this;

	logger.info('finding remote control characteristic');
	service.discoverCharacteristics([REMOTE_CONTROL_CHARACTERISTIC_UUID], function(error, characteristics) {
		if (error) {
			logger.error(error);
			deferred.reject(error);
		}

		if (characteristics.length != 1) {
			var msg = 'Not exactly one remote control characteristic discovered';
			logger.error(msg);
			deferred.reject(new Error(msg));
		}

		logger.info('Remote control characteristic discovered:', characteristics[0].uuid);
		self.characteristic = characteristics[0];
		self.ready = true;
		deferred.resolve(characteristics[0]);
	});
	return deferred.promise;
};

// channels contains a list of channels 
// that will receive the drive command
SBrick.prototype.driveForward = function(channels, power) {
	logger.debug('Driving forward');

	var command = [DRIVE_CMD];
	for (var idx = 0; idx < NUM_CHANNEL; idx++) {
		var commandForThisChannel = [idx, 0x00, _.includes(channels, idx) ? power : 0x00];
		command = _.concat(command, commandForThisChannel);
	}
	logger.debug('command', command);
	this.writeWithoutResponse(Buffer.from(command));
};

SBrick.prototype.break = function(channels) {
	// break all command
	var command = _.concat(BREAK_CMD, channels);
	this.writeWithoutResponse(Buffer.from(command));
};

SBrick.prototype.stop = function(channels) {
	this.driveForward(channels, 0x00);
};

function isSBrick(peripheral) {
	return peripheral.advertisement.localName &&
			peripheral.advertisement.localName.startsWith('SBrick ')
};

module.exports = SBrick;
