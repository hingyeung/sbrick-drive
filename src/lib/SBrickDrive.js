'use strict';

const SBCommand = require('./models/SBCommand'),
	  logger = require('./utils/Logger'),
	  SBEvent = require('./models/SBEvent'),
	  _ = require('lodash'),
	  SBController = require('./controllers/SBrickController');

const DRIVE_DIRECTION = { STOP: 0, FORWARD: 1, BACKWARD: 2, LEFT: 3, CENTRE: 4, RIGHT: 5 };

function SBrickDrive(driveChannels, steeringChannels) {
	this.sbController = new SBController();
	this.driveChannels = driveChannels;
	this.steeringChannels = steeringChannels;
}

SBrickDrive.DRIVE_DIRECTION = DRIVE_DIRECTION;

SBrickDrive.prototype.connect = function(onConnnectCallback) {
	this.sbController = new SBController();
	this.sbController.init();
	this.sbController.on(SBEvent.CONNECTED, function() {
		onConnnectCallback();
	});
};

SBrickDrive.prototype.driveFor = function(direction, duration) {
	switch (direction) {
		case DRIVE_DIRECTION.FORWARD:
			this.forward();
			this.straight();
			break;
		case DRIVE_DIRECTION.LEFT:
			this.forward();
			this.left();
			break;
		case DRIVE_DIRECTION.RIGHT:
			this.forward();
			this.right();
			break;
		case DRIVE_DIRECTION.BACKWARD:
			this.backward();
			this.straight();
			break;
		default:
			throw new Error('Unknown direction');
	}
	this.maintainSpeedAndDirection(duration);
};

SBrickDrive.prototype.left = function() {
	steering.call(this, DRIVE_DIRECTION.LEFT);
};

SBrickDrive.prototype.right = function() {
	steering.call(this, DRIVE_DIRECTION.RIGHT);
};

SBrickDrive.prototype.straight = function() {
	steering.call(this, DRIVE_DIRECTION.CENTRE);
};

function steering(direction) {
	let channelDir,
		commandType,
		self = this;
	switch (direction) {
		case DRIVE_DIRECTION.LEFT:
			channelDir = SBCommand.CHANNEL_DIRECTION.FORWARD;
			commandType = SBCommand.TYPE.DRIVE;
			break;
		case DRIVE_DIRECTION.RIGHT:
			channelDir = SBCommand.CHANNEL_DIRECTION.BACKWARD;
			commandType = SBCommand.TYPE.DRIVE;
			break;
		case DRIVE_DIRECTION.CENTRE:
			// channel direction can be anything when putting
			// steering to centre
			channelDir = SBCommand.CHANNEL_DIRECTION.FORWARD;
			commandType = SBCommand.TYPE.STOP;
			break;
		default:
			throw new Error('Invalid steering direction: ' + direction);
	}

	_.forEach(self.steeringChannels, function(channel) {
		self.sbController.queueCommand(
			new SBCommand({
				commandType: commandType,
				channel: channel,
				direction: channelDir,
				power: SBCommand.POWER_SETTING.FULL_POWER
			}));
	});
}

SBrickDrive.prototype.forward = function() {
	driveDirection.call(this, DRIVE_DIRECTION.FORWARD);
};

SBrickDrive.prototype.backward = function() {
	driveDirection.call(this, DRIVE_DIRECTION.BACKWARD);
};

SBrickDrive.prototype.stop = function() {
	driveDirection.call(this, DRIVE_DIRECTION.STOP);
};

function driveDirection(driveDirection) {
	let channelDir,
		commandType;

	switch (driveDirection) {
		case DRIVE_DIRECTION.BACKWARD:
			channelDir = SBCommand.CHANNEL_DIRECTION.BACKWARD;
			commandType = SBCommand.TYPE.DRIVE;
			break;
		case DRIVE_DIRECTION.FORWARD:
			channelDir = SBCommand.CHANNEL_DIRECTION.FORWARD;
			commandType = SBCommand.TYPE.DRIVE;
			break;
		case DRIVE_DIRECTION.STOP:
			// channel direction can be anything when putting
			// drive channel to stop
			channelDir = SBCommand.CHANNEL_DIRECTION.FORWARD;
			commandType = SBCommand.TYPE.STOP;
			break;
		default:
			throw new Error('Invalid drive direction: ' + driveDirection);
	}

	let self = this;
	_.forEach(self.driveChannels, function(channel) {
		self.sbController.queueCommand(
			new SBCommand({
				commandType: commandType,
				channel: channel,
				direction: channelDir,
				power: SBCommand.POWER_SETTING.FULL_POWER
		}));
	});
}

SBrickDrive.prototype.maintainSpeed = function(duration) {
	maintainCurrentState.call(this, true, false, duration);
};

SBrickDrive.prototype.maintainDirection = function(duration) {
	maintainCurrentState.call(this, false, true, duration);
};

SBrickDrive.prototype.maintainSpeedAndDirection = function(duration) {
	maintainCurrentState.call(this, true, true, duration);
};

function maintainCurrentState(speed, direction, duration) {
	let channelsToMaintain = [],
		self = this;

	if (speed) {
		channelsToMaintain = _.concat(channelsToMaintain, this.driveChannels);
	}

	if (direction) {
		channelsToMaintain = _.concat(channelsToMaintain, this.steeringChannels);
	}

	_.forEach(channelsToMaintain, function(channel) {
		self.sbController.queueCommand(
			new SBCommand({
				commandType: SBCommand.TYPE.NOOP,
				channel: channel,
				duration: duration
			}));
	});
}

SBrickDrive.prototype.simpleBackward = function() {
	this.driveFor(SBrickDrive.DRIVE_DIRECTION.BACKWARD, 2000);
	this.stop();
};

SBrickDrive.prototype.simpleLeft = function() {
	this.driveFor(SBrickDrive.DRIVE_DIRECTION.LEFT, 3500);
	this.straight();
	this.stop();
};

SBrickDrive.prototype.simpleRight = function() {
	this.driveFor(SBrickDrive.DRIVE_DIRECTION.RIGHT, 3500);
	this.straight();
	this.stop();
};

SBrickDrive.prototype.simpleForward = function() {
	this.driveFor(SBrickDrive.DRIVE_DIRECTION.FORWARD, 2000);
	this.stop();
};

module.exports = SBrickDrive;
