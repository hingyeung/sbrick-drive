
var SBrick = require('./SBrick.js');
var sbrick = new SBrick();
var Q = require('q');

sbrick.discoverAndConnect().then(function() {
	console.log(sbrick.driveForward);
	sbrick.driveForward([0, 1], 0xFF);
	Q.delay(1000).done(function() {
		sbrick.stop([0, 1]);
	});
}).done();
