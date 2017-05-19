'use strict';

const express = require('express'),
	  logger = require('./lib/utils/Logger'),
	  _ = require('lodash'),
	  SimpleDriveController = require('./lib/controllers/SimpleDriveController');

const app = express(),
	  COMMANDS = ['forward', 'backward', 'left', 'right'],
	  DRIVE_CHANNELS = [0, 1],
	  STEERING_CHANNELS = [2];

var isSBrickReady = false;

var simpleDriveController = new SimpleDriveController(DRIVE_CHANNELS, STEERING_CHANNELS);
simpleDriveController.connect(function() {
	isSBrickReady = true;
	logger.info('SBrick ready for action!');
});

app.get('/drive/:command', function (req, res) {
	var command = req.params.command;
	if (!isValidCommand(command)) {
		res.status(404).send();
	}
	sendCommandToSBrick(command);
	res.status(200).send(command + ' received!');
});

function isValidCommand(command) {
	return _.includes(COMMANDS, command);
}

function sendCommandToSBrick(commandStr) {
	logger.debug('Sending %s command to SBrick', commandStr);
    if (commandStr === 'forward') {
    	simpleDriveController.simpleForward();
    } else if (commandStr === 'left') {
    	simpleDriveController.simpleLeft();
    } else if (commandStr === 'right') {
    	simpleDriveController.simpleRight();
    } else if (commandStr === 'backward') {
    	simpleDriveController.simpleBackward();
    }
}

app.listen(3000, function () {
  logger.info('Listening on port 3000!')
});