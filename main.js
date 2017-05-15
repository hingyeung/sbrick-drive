'use strict';

const SBController = require('./lib/SBrickController'),
		logger = require('./lib/Logger'),
		SBEvent = require('./lib/SBEvent'),
		_ = require('lodash'),
		SBCommand = require('./lib/SBCommand');

const DRIVE_CHANNELS = [0, 1],
	  STEERING_CHANNELS = [2],
	  DIRECTION = { FORWARD: 0, BACKWARD: 1, LEFT: 2, RIGHT: 3 };

var sbController = new SBController();
sbController.init();
sbController.on(SBEvent.CONNECTED, function() {
	logger.info('SBController reported CONNECTED event');

	driveFor(DIRECTION.FORWARD, 2000);
	driveFor(DIRECTION.LEFT, 2000);
	driveFor(DIRECTION.RIGHT, 2000);
	driveFor(DIRECTION.FORWARD, 2000);
	stop();
});

function driveFor(direction, duration) {
	switch (direction) {
		case DIRECTION.FORWARD:
			forward();
			straight();
			break;
		case DIRECTION.LEFT:
			forward();
			left();
			break;
		case DIRECTION.RIGHT:
			forward();
			right();
			break;
		case DIRECTION.BACKWARD:
			backward();
			straight();
			break;
		default:
			throw new Error('Unknown direction');
	}
	maintainSpeedAndDirection(duration);
}

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

function maintainSpeedAndDirection(duration) {
	_.forEach(_.concat(STEERING_CHANNELS, DRIVE_CHANNELS), function(channel) {
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