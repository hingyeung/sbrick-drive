$(document).ready(function() {
	const recognition = new webkitSpeechRecognition();

    const recordButtonId = '#recognition-btn';

    let	recording = false;


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
		let command = event.results[0][0].transcript;
		console.log('Result:', command);
		sendCommandToServer(command);
		recognition.stop();
	};

	recognition.onend = function() {
		recording = false;
		updateButtonLabel('Start');
	};

	function updateButtonLabel(label) {
		$(recordButtonId).html(label);
	}

	function sendCommandToServer(command) {
		$.ajax('http://localhost:3000/resolveActionFromText/' + command)
			.done(function(data) {
				console.log(command, 'command sent!');
			});
	}
});

