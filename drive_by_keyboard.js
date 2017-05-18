'use strict';

const SimpleDriveController = require('./lib/SimpleDriveController'),
	  logger = require('./lib/Logger'),
	  readline = require('readline');

const DRIVE_CHANNELS = [0, 1],
	  STEERING_CHANNELS = [2];

var simpleDriveController = new SimpleDriveController(DRIVE_CHANNELS, STEERING_CHANNELS);
simpleDriveController.connect(enableKeyboardControl);

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
	    	forward();
	    } else if (key.name === 'left') {
	    	left();
	    } else if (key.name === 'right') {
	    	right();
	    } else if (key.name === 'down') {
	    	backward();
	    }
	  }
	});
	console.log('Press UP, DOWN, LEFT or RIGHT...');
}

function backward() {
	simpleDriveController.simpleBackward();
}

function left() {
	simpleDriveController.simpleLeft();
}

function right() {
	simpleDriveController.simpleRight();
}

function forward() {
	simpleDriveController.simpleForward();
}