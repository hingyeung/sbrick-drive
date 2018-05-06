'use strict';

const SimpleDriveController = require('../../lib/controllers/SimpleDriveController'),
	  logger = require('../../lib/utils/Logger'),
	  readline = require('readline');

const DRIVE_CHANNELS = [0, 1],
	  STEERING_CHANNELS = [2];

let simpleDriveController = new SimpleDriveController(DRIVE_CHANNELS, STEERING_CHANNELS);
simpleDriveController.connect(enableKeyboardControl);

function enableKeyboardControl() {
	readline.emitKeypressEvents(process.stdin);
	process.stdin.setRawMode(true);

	process.stdin.on('keypress', (str, key) => {
	  if (key.ctrl && key.name === 'c') {
	  	logger.info('Exiting...');
	    process.exit();
	  } else {
	    logger.debug('You pressed the %s key: %j', str, key);
	    if (key.name === 'up') {
	    	simpleDriveController.simpleForward();
	    } else if (key.name === 'left') {
	    	simpleDriveController.simpleLeft();
	    } else if (key.name === 'right') {
	    	simpleDriveController.simpleRight();
	    } else if (key.name === 'down') {
	    	simpleDriveController.simpleBackward();
	    }
	  }
	});
	console.log('Press UP, DOWN, LEFT or RIGHT...');
}