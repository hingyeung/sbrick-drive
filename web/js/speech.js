$(document).ready(function() {
	var recognition = new webkitSpeechRecognition(),
		recording = false,
		recordButtonId = '#recognition-btn';

	$(recordButtonId).click(function() {
		if (recording) {
			recognition.stop();
		} else {
			recognition.start();
		}
	});

	recognition.onstart = function(event) {
		updateButtonLabel('Stop');
		recording = true;
	};

	recognition.onresult = function(event) { 
		var command = event.results[0][0].transcript;
		console.log('Result:', command);
		sendCommandToServer(command);
		recognition.stop();
	};

	recognition.onend = function() {
		recording = false;
		updateButtonLabel('Start');
	}

	function updateButtonLabel(label) {
		$(recordButtonId).html(label);
	}

	function sendCommandToServer(command) {
		$.ajax('http://localhost:3000/drive/' + command)
			.done(function(data) {
				console.log(command, 'command sent!');
			});
	}
});

