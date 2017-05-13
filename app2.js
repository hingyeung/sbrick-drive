
const SBrick = require('./SBrick.js'),
	Q = require('q'),
	queue = require('async/queue'),
	Command = require('./Command'),
	logger = require('./Logger');
	

var sbrick = new SBrick();
var cmdQueue = createCommandQueue();
// drive forward on channel 0 and 1
cmdQueue.push(new Command(Command.FORWARD, [0, 1]));
// stop all channel
cmdQueue.push(new Command(Command.STOP));

sbrick.discoverAndConnect().then(function() {
	console.log('SBrick ready');
	// sbrick.driveForward([0, 1], 0xFF);
	// Q.delay(1000).done(function() {
	// 	sbrick.stop([0, 1]);
	// });
}).done();

function createCommandQueue() {
	return queue(sendCmdToSBrick, 1);
}

function sendCmdToSBrick(command, cb) {
	if (!sbrick.ready) {
		throw new Error('SBrick not yet ready for command', command);
	}
	switch (command) {
		case Command.STOP:
			logger.debug('Sending STOP (%d) to SBrick', command);
			sbrick.stop();
			break;
		case Command.FORWARD:
			logger.debug('Sending FORWARD (%d) to SBrick', command);
			sbrick.driveForward();
			break;
		default:
			logger.error('Unknown command', command);
	}
	cb();
}