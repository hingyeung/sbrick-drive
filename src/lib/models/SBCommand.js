'use strict';

const _ = require('lodash');

function SBCommand(options) {
	this.commandType = options.commandType;
	this.channel = _.defaults(options.channel, 0);
	this.duration = _.defaults(options.duration, 0);
	this.direction = _.defaults(options.direction, SBCommand.CHANNEL_DIRECTION.FORWARD);
	this.power = _.defaults(options.power, SBCommand.POWER_SETTING.FULL_POWER);
}

SBCommand.CHANNELS = [0, 1, 2, 3];
SBCommand.TYPE = { UNKNOWN: -1, NOOP: 0, STOP: 1, DRIVE: 2 };
SBCommand.POWER_SETTING = { NO_POWER: 0x00, FULL_POWER: 0xFF };
SBCommand.CHANNEL_DIRECTION = { FORWARD: 0, BACKWARD: 1 };

module.exports = SBCommand;