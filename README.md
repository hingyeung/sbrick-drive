# SBrick Drive

## What is it?
This project provides an abstract layer for SBrick Bluetooth controller for Lego in NodeJS. It focuses on controlling vehicle that can move in four directions: forward, backward, left and right.

## How to play?
Three simple UIs are created to control a SBrick-equipped vehicle using this project.

1. Drive by Keyboard
`npm run drive-by-keyboard` Drives a SBrick-equipped vehicle with arrow keys on keyboard of a computer.
2. Drive by Script
`npm run drive-by-script` Drives a SBrick-equipped vehicle with instructions written in a text file, one instruction per line (my daughter loved practicing typing with this). A sample instruction file can be found at `src/clients/script/instructions.txt`.
3. Drive by REST
`npm run drive-by-rest` Drives a SBrick-equipped vehicle with RESTful client. This task starts a Express server that provides the following RESTful API:
    * `GET /drive/forward`
    * `GET /drive/backward`
    * `GET /drive/left`
    * `GET /drive/right`
    * `GET /resolveActionFromText/:command` Use DialogFlow to convert free text/speech command into one of the directional command for SBrick.
    
    A simple web interface was created in `src/web/index.html`, which uses HTML5 speech recognition for the four directional commands (my daughter loved this too).

## License
ISC

## Feedback
Drop me a line at samli@samuelli.net
