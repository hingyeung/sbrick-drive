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
	    	simpleDriveController.driveFor(SimpleDriveController.DRIVE_DIRECTION.FORWARD, 1000);
	    	simpleDriveController.stop();
	    } else if (key.name === 'left') {
	    	simpleDriveController.driveFor(SimpleDriveController.DRIVE_DIRECTION.LEFT, 1000);
	    	simpleDriveController.stop();
	    } else if (key.name === 'right') {
	    	simpleDriveController.driveFor(SimpleDriveController.DRIVE_DIRECTION.RIGHT, 1000);
	    	simpleDriveController.stop();
	    } else if (key.name === 'down') {
	    	simpleDriveController.driveFor(SimpleDriveController.DRIVE_DIRECTION.BACKWARD, 1000);
	    	simpleDriveController.stop();
	    }
	  }
	});
	console.log('Press UP, DOWN, LEFT or RIGHT...');
}