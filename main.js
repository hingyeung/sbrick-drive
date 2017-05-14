'use strict';

const SBController = require('./lib/SBrickController'),
		logger = require('./lib/Logger'),
		SBEvent = require('./lib/SBEvent'),
		SBCommand = require('./lib/SBCommand');

var sbController = new SBController();
sbController.init();
sbController.on(SBEvent.CONNECTED, function() {
	logger.info('SBController reported CONNECTED event');

	forward();
	noop();
	backward();
	noop();
	stop();

	// forward();
	// left();
	// noop();
	// right();
	// noop();
	// straight();
	// stop();
});

function left() {
	sbController.queueCommand(
		new SBCommand({
			commandType: SBCommand.TYPE.DRIVE,
			channels: [2],
			direction: SBCommand.DIRECTION.FORWARD,
			power: SBCommand.POWER_SETTING.FULL_POWER
		}));
}

function right() {
	sbController.queueCommand(
		new SBCommand({
			commandType: SBCommand.TYPE.DRIVE,
			channels: [2],
			direction: SBCommand.DIRECTION.BACKWARD,
			power: SBCommand.POWER_SETTING.FULL_POWER
		}));
}

function straight() {
	sbController.queueCommand(
		new SBCommand({
			commandType: SBCommand.TYPE.DRIVE,
			channels: [2],
			direction: SBCommand.DIRECTION.FORWARD,
			power: SBCommand.POWER_SETTING.NO_POWER
		}));
}

function forward() {
	// drive forward on channel 0 and 1
	sbController.queueCommand(
		new SBCommand({
			commandType: SBCommand.TYPE.DRIVE,
			channels: [0, 1],
			direction: SBCommand.DIRECTION.FORWARD,
			power: SBCommand.POWER_SETTING.FULL_POWER
		}));
}

function backward() {
	// drive backward on channel 0 and 1
	sbController.queueCommand(
		new SBCommand({
			commandType: SBCommand.TYPE.DRIVE,
			channels: [0, 1],
			direction: SBCommand.DIRECTION.BACKWARD,
			power: SBCommand.POWER_SETTING.FULL_POWER
		}));
}

function noop() {
	// no-op, continue with the previous command
	sbController.queueCommand(
		new SBCommand({
			commandType: SBCommand.TYPE.NOOP,
			channels: [0,1],
			duration: 2000
		}));
}

function stop() {
	// stop all channel
	sbController.queueCommand(
		new SBCommand({
			commandType: SBCommand.TYPE.STOP,
			channels: [0,1]
		}));
}