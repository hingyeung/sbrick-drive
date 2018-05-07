# SBrick Drive

## What is it?
This project provides an abstract layer for SBrick Bluetooth controller for Lego in NodeJS. It focuses on controlling 
vehicle that can move in four directions: forward, backward, left and right.

## How to play?
##### Installation
`npm install sbrick-drive`

##### Controlling SBrick
SBrick Drive is designed to handle instruction for four directional movements: forward, backward, left and right using 
the four control channels on a SBrick: 0, 1, 2 and 3. SBrickDrive needs to know which channels are used for forward and 
backward instruction (`DRIVE_CHANNELS`) and which channels are used for left and right steering (`STEERING_CHANNEL`). 
E.g. My [4X4 Crawler](https://shop.lego.com/en-AU/4X4-Crawler-9398) uses channel 0 and 1 for driving forward and 
backward, and channel 2 for steering.
```js
const DRIVE_CHANNELS = [0, 1],
  STEERING_CHANNELS = [2],
  SBrickDrive = require('../../lib/SBrickDrive');

const sbDrive = new SBrickDrive(DRIVE_CHANNELS, STEERING_CHANNELS);

sbDrive.simpleForward();
sbDrive.simpleBackward();
sbDrive.simpleLeft();
sbDrive.simpleRight();
```

### Clients
Three simple UIs have been created to control a SBrick-equipped vehicle using this project.

1. Drive by Keyboard
`npm run drive-by-keyboard` Drives a SBrick-equipped vehicle with arrow keys on keyboard of a computer.
2. Drive by Script
`npm run drive-by-script` Drives a SBrick-equipped vehicle with instructions written in a text file, one instruction 
per line (my daughter loved practicing typing with this). A sample instruction file can be found at 
`src/clients/script/instructions.txt`.
3. Drive by REST
`npm run drive-by-rest` Drives a SBrick-equipped vehicle with RESTful client. This task starts a Express server that 
provides the following RESTful API:
    * `GET /drive/forward`
    * `GET /drive/backward`
    * `GET /drive/left`
    * `GET /drive/right`
    * `GET /resolveActionFromText/:command` Use DialogFlow to convert free text/speech command into one of the 
    directional command for SBrick.
    
    A simple web interface was created in `src/web/index.html`, which uses HTML5 speech recognition for the four 
    directional commands (my daughter loved this too).

## License
ISC

## Feedback
Drop me a line at samli@samuelli.net
