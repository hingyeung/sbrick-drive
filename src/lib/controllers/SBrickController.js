'use strict';

const SBrick = require('../sbrick/SBrick'),
	Q = require('q'),
	queue = require('async/queue'),
	SBCommand = require('../models/SBCommand'),
	SBEvent = require('../models/SBEvent'),
	inherits = require('util').inherits,
	EventEmitter = require('events').EventEmitter,
	_ = require('lodash'),
	logger = require('../utils/Logger');

const ALL_CHANNELS = SBCommand.CHANNELS;
	
function SBrickController() {
	let self = this;

	this.sbrick = new SBrick();
	this.cmdQueues = createCommandQueues();
	EventEmitter.call(this);

	function createCommandQueues() {
		logger.debug('Creating command queues for channels');
		let cmdQs = [];
		_.times(ALL_CHANNELS.length, function(idx) {
			let qForThisChannel = queue(sendCmdToSBrick, 1);
			qForThisChannel.pause();
			qForThisChannel.drain = function() {
				self.emit(SBEvent.COMMAND_QUEUE_DRAINED);
			};
			cmdQs.push(qForThisChannel);
		});

		return cmdQs;
	}

	function sendCmdToSBrick(sbCommand, cb) {
		switch (sbCommand.commandType) {
			case SBCommand.TYPE.STOP:
				logger.debug('Sending STOP (%j) to SBrick', sbCommand);
				self.sbrick.stop(sbCommand.channel);
				break;
			case SBCommand.TYPE.DRIVE:
				logger.debug('Sending DRIVE (%j) to SBrick', sbCommand);
				self.sbrick.drive(sbCommand.channel, sbCommand.direction, sbCommand.power);
				break;
			case SBCommand.TYPE.NOOP:
				logger.debug(
					'NOOP received, pausing command queue for channel %d for %dms: %j',
					sbCommand.channel, sbCommand.duration, sbCommand);
				// pause the queue for the specified duration
				self.pauseQueues([sbCommand.channel]);
				setTimeout(function() {
					logger.debug('resuming command queue after pausing for %dms for NOOP',
						sbCommand.duration);
					// self.cmdQueue.resume();
					self.resumeQueues([sbCommand.channel]);
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
	// this.cmdQueues.push(sbCommand);
	logger.debug('Queuing command for %d', sbCommand.channel);
	this.cmdQueues[sbCommand.channel].push(sbCommand);
}

SBrickController.prototype.pauseQueues = function(channels) {
	var self = this;
	_.forEach(channels, function(channel) {
		self.cmdQueues[channel].pause();
	});
}

SBrickController.prototype.resumeQueues = function(channels) {
	var self = this;
	_.forEach(channels, function(channel) {
		logger.debug('Resuming channel %d', channel);
		self.cmdQueues[channel].resume();
	});
}

function onSBrickDiscovered() {
	logger.info('SBrick connected and ready');
	this.resumeQueues(ALL_CHANNELS);
	this.emit(SBEvent.CONNECTED);
}

function onSBrickDiscoveryError(error) {
	logger.error('Exit with error:', error);
	process.exit(1);
}

module.exports = SBrickController;