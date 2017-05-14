'use strict';

const SBController = require('./lib/SBrickController'),
		logger = require('./lib/Logger'),
		SBEvent = require('./lib/SBEvent'),
		SBCommand = require('./lib/SBCommand');

var sbController = new SBController();
sbController.init();
sbController.on(SBEvent.CONNECTED, function() {
	// drive forward on channel 0 and 1
	logger.info('SBController reported CONNECTED event');
		sbController.queueCommand(
		new SBCommand(
			SBCommand.TYPE.FORWARD, [0, 1]));

	// no-op, continue with the previous command
	sbController.queueCommand(
		new SBCommand(
			SBCommand.TYPE.NOOP, [0,1], 2000));

	// stop all channel
	sbController.queueCommand(
		new SBCommand(
			SBCommand.TYPE.STOP, [0,1]));
});
