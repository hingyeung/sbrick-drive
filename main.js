'use strict';

const SBController = require('./lib/SBrickController'),
		logger = require('./lib/Logger'),
		SBEvent = require('./lib/SBEvent'),
		_ = require('lodash'),
		SBCommand = require('./lib/SBCommand'),
		readline = require('readline');

const DRIVE_CHANNELS = [0, 1],
	  STEERING_CHANNELS = [2],
	  DIRECTION = { FORWARD: 0, BACKWARD: 1, LEFT: 2, RIGHT: 3 };

var sbController = new SBController();
sbController.init();
sbController.on(SBEvent.CONNECTED, function() {
	logger.info('SBController reported CONNECTED event');

	// driveFor(DIRECTION.FORWARD, 2000);
	// driveFor(DIRECTION.LEFT, 2000);
	// driveFor(DIRECTION.RIGHT, 2000);
	// driveFor(DIRECTION.FORWARD, 2000);
	// driveFor(DIRECTION.BACKWARD, 5000);
	// driveFor(DIRECTION.BACKWARD, 3000);
	// stop();
	enableKeyboardControl();
});

function enableKeyboardControl() {
	readline.emitKeypressEvents(process.stdin);
	process.stdin.setRawMode(true);

	process.stdin.on('keypress', (str, key) => {
	  if (key.ctrl && key.name === 'c') {
	  	logger.info('Exiting...')
	    process.exit();
	  } else {
	    logger.debug('You pressed the %s key: %j', str, key);
	    if (key.name === 'up') {
	    	driveFor(DIRECTION.FORWARD, 1000);
	    	stop();
	    } else if (key.name === 'left') {
	    	driveFor(DIRECTION.LEFT, 1000);
	    	stop();
	    } else if (key.name === 'right') {
	    	driveFor(DIRECTION.RIGHT, 1000);
	    	stop();
	    } else if (key.name === 'down') {
	    	driveFor(DIRECTION.BACKWARD, 1000);
	    	stop();
	    }
	  }
	});
	console.log('Press UP, DOWN, LEFT or RIGHT...');
}

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