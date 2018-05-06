'use strict';

// http://stackoverflow.com/questions/41338620/can-i-use-es6-style-module-import-in-nodejs-application
// Don't ask Babel to process directory that contains node_modules:
// http://stackissue.com/fable-compiler/Fable/fixes-596-597.html
// > Anyway, the problems seemed to be Babel was trying to compile some files in `node_modules` folder.
// > Not sure why, because I had that directory ignored in `.babelrc`. So I had to fix by removing
// > `node_modules` entirely from that location.
// import {ApiAiClient} from "api-ai-javascript/ApiAiClient";

const apiai = require('apiai'),
    express = require('express'),
    Q = require('q'),
    uuidV4 = require('uuid/v4'),
    logger = require('../../lib/utils/Logger'),
    _ = require('lodash'),
    ApiAiResponse = require('../../lib/models/ApiAiResponse'),
    SimpleDriveController = require('../../lib/controllers/SimpleDriveController'),
    getConfig = require('../../lib/services/ConfigService');

const config = getConfig();
const apiAiclient = apiai(config.restServer.apiAiKey);

const app = express(),
    COMMANDS = ['forward', 'backward', 'left', 'right'],
    SESSION_ID = uuidV4(),
    ACTION_TO_COMMAND_MAP = {
        'move.left': 'left',
        'move.right': 'right',
        'move.forward': 'forward',
        'move.backward': 'backward'
    },
    DRIVE_CHANNELS = [0, 1],
    STEERING_CHANNELS = [2];

let isSBrickReady = false,
    simpleDriveController = new SimpleDriveController(DRIVE_CHANNELS, STEERING_CHANNELS);

simpleDriveController.connect(function () {
    isSBrickReady = true;
    logger.info('SBrick ready for action!');
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/drive/:command', function (req, res) {
    let command = req.params.command;
    if (!isValidCommand(command)) {
        res.status(404).send();
    }
    sendCommandToSBrick(command);
    res.status(200).send(command + ' received!');
});

app.get('/resolveActionFromText/:text', function (req, res) {
    logger.debug('got text for api.ai');
    let text = req.params.text;

    sendTextRequestToApiAi(text)
        .then(handleResponseFromApiAi)
        .fail(heandleErrorFromApiAi)
        .done();

    res.status(200).send();
});

function sendTextRequestToApiAi(text) {
    let deferred = Q.defer();
    let request = apiAiclient.textRequest(text, { sessionId: SESSION_ID });
    request.on('response', function(responseFromApiAi) {
        deferred.resolve(ApiAiResponse.fromApiAi(responseFromApiAi));
    });
    request.on('error', function (error) {
        deferred.reject(error);
    });
    request.end();

    return deferred.promise;
}

function handleResponseFromApiAi(apiAiResponse) {
    logger.debug('Response from ApiAi: %j', apiAiResponse.result.action);
    let command = mapApiAiActionToCommand(apiAiResponse.result.action);
    if (command) {
        sendCommandToSBrick(command);
    } else {
        logger.error("No command mapped for action %s", apiAiResponse.result.action);
    }
}

function mapApiAiActionToCommand(apiAiAction) {
    return ACTION_TO_COMMAND_MAP[apiAiAction];
}

function heandleErrorFromApiAi(error) {
    logger.error(error);
    throw error;
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

app.listen(config.port, function () {
    logger.info(`Listening on port ${config.restServer.port}!`)
});