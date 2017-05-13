
const SBrick = require('./lib/SBrick.js'),
	Q = require('q'),
	queue = require('async/queue'),
	SBCommand = require('./lib/SBCommand'),
	logger = require('./lib/Logger');
	

var sbrick = new SBrick();
var cmdQueue = createCommandQueue();
// drive forward on channel 0 and 1
cmdQueue.push(new SBCommand(SBCommand.TYPE.FORWARD, [0, 1]));
// stop all channel
cmdQueue.push(new SBCommand(SBCommand.TYPE.STOP, [0, 1]));

sbrick.discoverAndConnect().then(function() {
	console.log('SBrick ready');
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
			logger.debug('Sending STOP (%d) to SBrick', sbCommand);
			sbrick.stop();
			break;
		case SBCommand.TYPE.FORWARD:
			logger.debug('Sending FORWARD (%d) to SBrick', sbCommand);
			sbrick.driveForward(sbCommand.channel, SBCommand.POWER_SETTING.FULL_POWER);
			break;
		default:
			logger.error('Unknown command', sbCommand);
	}
	cb();
}