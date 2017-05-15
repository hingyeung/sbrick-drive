'use strict';

const SBController = require('./lib/SBrickController'),
		logger = require('./lib/Logger'),
		SBEvent = require('./lib/SBEvent'),
		_ = require('lodash'),
		SBCommand = require('./lib/SBCommand');

const DRIVE_CHANNELS = [0, 1],
	  STEERING_CHANNELS = [2];

var sbController = new SBController();
sbController.init();
sbController.on(SBEvent.CONNECTED, function() {
	logger.info('SBController reported CONNECTED event');

	forward();
	maintainSpeed(2000);
	left();
	maintainDirection(2000);
	straight();
	maintainSpeed(2000);
	right();
	maintainDirection(2000);
	straight();
	maintainSpeed(2000);
	stop();
});

// TODO change to 1 chanenl
function left() {
	_.forEach(STEERING_CHANNELS, function(channel) {
		sbController.queueCommand(
			new SBCommand({
				commandType: SBCommand.TYPE.DRIVE,
				channel: channel,
				direction: SBCommand.DIRECTION.FORWARD,
				power: SBCommand.POWER_SETTING.FULL_POWER
			}));
	});
}

function right() {
	_.forEach(STEERING_CHANNELS, function(channel) {
		sbController.queueCommand(
			new SBCommand({
				commandType: SBCommand.TYPE.DRIVE,
				channel: channel,
				direction: SBCommand.DIRECTION.BACKWARD,
				power: SBCommand.POWER_SETTING.FULL_POWER
			}));
	});
}

function straight() {
	_.forEach(STEERING_CHANNELS, function(channel) {
		sbController.queueCommand(
			new SBCommand({
				commandType: SBCommand.TYPE.DRIVE,
				channel: channel,
				direction: SBCommand.DIRECTION.FORWARD,
				power: SBCommand.POWER_SETTING.NO_POWER
			}));
	});
}

function forward() {
	_.forEach(DRIVE_CHANNELS, function(channel) {
		sbController.queueCommand(
			new SBCommand({
				commandType: SBCommand.TYPE.DRIVE,
				channel: channel,
				direction: SBCommand.DIRECTION.FORWARD,
				power: SBCommand.POWER_SETTING.FULL_POWER
			})
		)
	});
}

function backward() {
	// drive backward on channel 0 and 1
	_.forEach(DRIVE_CHANNELS, function(channel) {
		sbController.queueCommand(
			new SBCommand({
				commandType: SBCommand.TYPE.DRIVE,
				channel: channel,
				direction: SBCommand.DIRECTION.BACKWARD,
				power: SBCommand.POWER_SETTING.FULL_POWER
		}));
	});
}

function maintainSpeed(duration) {
	_.forEach(DRIVE_CHANNELS, function(channel) {
		sbController.queueCommand(
			new SBCommand({
				commandType: SBCommand.TYPE.NOOP,
				channel: channel,
				duration: duration
			}));
	});
}

function maintainDirection(duration) {
	_.forEach(STEERING_CHANNELS, function(channel) {
		sbController.queueCommand(
			new SBCommand({
				commandType: SBCommand.TYPE.NOOP,
				channel: channel,
				duration: duration
			}));
	});
}

function stop() {
	_.forEach(DRIVE_CHANNELS, function(channel) {
		sbController.queueCommand(
			new SBCommand({
				commandType: SBCommand.TYPE.STOP,
				channel: channel
			}));
	});
}