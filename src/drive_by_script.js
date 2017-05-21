'use strict';

const readline = require('linebyline'),
    logger = require('./lib/utils/Logger'),
    SimpleDriveController = require('./lib/controllers/SimpleDriveController'),
    Q = require('q'),
    _ = require('lodash');

const COMMANDS = ['forward', 'backward', 'left', 'right'],
    DRIVE_CHANNELS = [0, 1],
    STEERING_CHANNELS = [2];


let simpleDriveController = new SimpleDriveController(DRIVE_CHANNELS, STEERING_CHANNELS);
simpleDriveController.connect(executeStepsInFile);

function getInstructionFilename() {
    logger.debug(process.argv);
    if (process.argv.length < 3) {
        logger.error('Instruction file not provided');
        logger.error('Usage: node %s <instruction_file>', process.argv[1]);
        process.exit(1);
    }
    return process.argv[2];
}

function executeStepsInFile() {
    readInstructionFile(getInstructionFilename())
        .then(function(commandList) {
            _.forEach(commandList, sendCommandToSBrick);
        })
        .fail(function(e) {
            throw new Error(e);
        })
        .done();
}

function readInstructionFile(filename) {
    let rl = readline(filename),
        deferred = Q.defer(),
        commandList = [];

    rl.on('line', function (line, lineCount, byteCount) {
        logger.debug('line: %s', line);
        let trimmedLine = line.trim();
        if (!trimmedLine.startsWith('#')) {
            if (isValidCommand(trimmedLine)) {
                logger.debug('Pushing valid command: ', trimmedLine);
                commandList.push(trimmedLine);
            } else {
                let errMsg = 'Invalid command at line ' + commandList + length + 1;
                logger.error(errMsg);
                throw new Error(errMsg);
            }
        }
    }).on('error', function (e) {
        deferred.reject(e);
    }).on('end', function() {
        deferred.resolve(commandList);
    });

    return deferred.promise;
}

function isValidCommand(command) {
    return _.includes(COMMANDS, command);
}

function sendCommandToSBrick(commandStr) {
    logger.debug('Sending %s command to SBrick', commandStr);
    if (commandStr === 'forward') {
        simpleDriveController.simpleForward();
    } else if (commandStr === 'left') {
        simpleDriveController.simpleLeft();
    } else if (commandStr === 'right') {
        simpleDriveController.simpleRight();
    } else if (commandStr === 'backward') {
        simpleDriveController.simpleBackward();
    }
}