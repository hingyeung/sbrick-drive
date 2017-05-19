'use strict';

const readline = require('linebyline'),
	  logger = require('./lib/utils/Logger'),
	  SimpleDriveController = require('./lib/controllers/SimpleDriveController');

const DRIVE_CHANNELS = [0, 1],
	  STEERING_CHANNELS = [2];

var simpleDriveController = new SimpleDriveController(DRIVE_CHANNELS, STEERING_CHANNELS);
simpleDriveController.connect(executeStepsInFile);

function executeStepsInFile() {
	const filename = './data/instructions.txt';
	var rl = readline(filename);
	rl.on('line', function(line, lineCount, byteCount) {
		if (!line.trim().startsWith('#')) {
			sendCommandToSBrick(line);
		}
	}).on('error', function(e) {
    	throw new Error(e);
  	});
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