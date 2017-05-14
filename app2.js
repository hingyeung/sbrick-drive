
const SBrick = require('./lib/SBrick.js'),
	Q = require('q'),
	queue = require('async/queue'),
	SBCommand = require('./lib/SBCommand'),
	logger = require('./lib/Logger');
	

var sbrick = new SBrick();
var cmdQueue = createCommandQueue();
// drive forward on channel 0 and 1
cmdQueue.push(new SBCommand(SBCommand.TYPE.FORWARD, [0, 1]));
// no-op, continue with the previous command
cmdQueue.push(new SBCommand(SBCommand.TYPE.NOOP, [], 2000));
// stop all channel
setTimeout(function() {
	cmdQueue.push(new SBCommand(SBCommand.TYPE.STOP, [0, 1]));	
}, 2000);

sbrick.discoverAndConnect().then(function() {
	logger.info('SBrick ready');
	cmdQueue.resume();
	// sbrick.driveForward([0, 1], 0xFF);
	// Q.delay(1000).done(function() {
	// 	sbrick.stop([0, 1]);
	// });
}).fail(function(error) {
	logger.error('Exit with error:', error);
	process.exit(1);
}).done();

function createCommandQueue() {
	var cmdQ = queue(sendCmdToSBrick, 1);
	cmdQ.pause();
	return cmdQ;
}

function sendCmdToSBrick(sbCommand, cb) {
	switch (sbCommand.command) {
		case SBCommand.TYPE.STOP:
			logger.debug('Sending STOP (%j) to SBrick', sbCommand);
			sbrick.stop(sbCommand.channels);
			break;
		case SBCommand.TYPE.FORWARD:
			logger.debug('Sending FORWARD (%j) to SBrick', sbCommand);
			sbrick.driveForward(sbCommand.channels, SBCommand.POWER_SETTING.FULL_POWER);
			break;
		case SBCommand.TYPE.NOOP:
			logger.debug('NOOP received, pausing command queue for %dms',
				sbCommand.duration);
			// pause the queue for the specified duration
			cmdQueue.pause();
			setTimeout(function() {
				logger.debug('resuming command queue after pausing for %dms for NOOP',
					sbCommand.duration);
				cmdQueue.resume();
			}, sbCommand.duration);
			break;
		default:
			logger.error('Unknown command', sbCommand);
	}
	cb();
}