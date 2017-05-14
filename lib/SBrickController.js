'use strict';

const SBrick = require('./SBrick'),
	Q = require('q'),
	queue = require('async/queue'),
	SBCommand = require('./SBCommand'),
	SBEvent = require('./SBEvent'),
	inherits = require('util').inherits,
	EventEmitter = require('events').EventEmitter,
	logger = require('./Logger');
	
function SBrickController() {
	var self = this;
	this.sbrick = new SBrick();
	this.cmdQueue = createCommandQueue();
	EventEmitter.call(this);

	function createCommandQueue() {
		var cmdQ = queue(sendCmdToSBrick, 1);
		cmdQ.pause();
		return cmdQ;
	}

	function sendCmdToSBrick(sbCommand, cb) {
		switch (sbCommand.commandType) {
			case SBCommand.TYPE.STOP:
				logger.debug('Sending STOP (%j) to SBrick', sbCommand);
				self.sbrick.stop(sbCommand.channels);
				break;
			case SBCommand.TYPE.DRIVE:
				logger.debug('Sending DRIVE (%j) to SBrick', sbCommand);
				self.sbrick.drive(sbCommand.channels, sbCommand.direction, sbCommand.power);
				break;
			case SBCommand.TYPE.NOOP:
				logger.debug('NOOP received, pausing command queue for %dms: %j',
					sbCommand.duration, sbCommand);
				// pause the queue for the specified duration
				self.cmdQueue.pause();
				setTimeout(function() {
					logger.debug('resuming command queue after pausing for %dms for NOOP',
						sbCommand.duration);
					self.cmdQueue.resume();
				}, sbCommand.duration);
				break;
			default:
				logger.error('Unknown command', sbCommand);
		}
		cb();
	}
}

inherits(SBrickController, EventEmitter);

SBrickController.prototype.init = function() {
	this.sbrick.discoverAndConnect()
		.then(onSBrickDiscovered.bind(this))
		.fail(onSBrickDiscoveryError.bind(this))
		.done();
};

SBrickController.prototype.queueCommand = function(sbCommand) {
	this.cmdQueue.push(sbCommand);
}

function onSBrickDiscovered() {
	logger.info('SBrick connected and ready');
	this.cmdQueue.resume();
	this.emit(SBEvent.CONNECTED);
}

function onSBrickDiscoveryError(error) {
	logger.error('Exit with error:', error);
	process.exit(1);
}

module.exports = SBrickController;