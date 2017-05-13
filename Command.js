'use strict';

function Command(command, channels) {
	this.command = command;
	this.channels = channels;
}

Command.prototype.STOP = 0;
Command.prototype.FORWARD = 1;

module.exports = Command;