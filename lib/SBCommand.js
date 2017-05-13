'use strict';

function SBCommand(command, channels) {
	this.command = command;
	this.channels = channels;
}

SBCommand.TYPE = { STOP: 0, FORWARD: 1 };
SBCommand.POWER_SETTING = { FULL_POWER: 0xFF };

module.exports = SBCommand;