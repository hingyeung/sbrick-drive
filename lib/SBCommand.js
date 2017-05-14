'use strict';

function SBCommand(command, channels, duration) {
	this.command = command;
	this.channels = channels;
	this.duration = duration;
}

SBCommand.TYPE = { NOOP: 0, STOP: 1, FORWARD: 2 };
SBCommand.POWER_SETTING = { FULL_POWER: 0xFF };

module.exports = SBCommand;