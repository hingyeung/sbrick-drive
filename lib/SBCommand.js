'use strict';

function SBCommand(commandType, channels, duration) {
	this.commandType = commandType;
	this.channels = channels;
	this.duration = duration;
}

SBCommand.TYPE = { UNKNOWN: -1, NOOP: 0, STOP: 1, FORWARD: 2 };
SBCommand.POWER_SETTING = { FULL_POWER: 0xFF };

module.exports = SBCommand;