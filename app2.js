
var SBrick = require('./SBrick.js');
var sbrick = new SBrick();

sbrick.discoverAndConnect().then(function() {
	console.log(sbrick.driveForward);
	sbrick.driveForward([0, 1], 0xFF);
}).done();
