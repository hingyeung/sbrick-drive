'use strict';

const ApiAiResponse = require('./ApiAiResponse'),
    expect = require('chai').expect;

describe('Api.ai Response model', function () {
    it('should deserialise from json response of Api.ai', function () {
        const expectedResponse = JSON.parse(API_AI_RESPONSE_JSON);
        const apiAiResponse = ApiAiResponse.fromApiAi(JSON.parse(API_AI_RESPONSE_JSON));
        expect(apiAiResponse.id).to.equal(expectedResponse.id);
        expect(apiAiResponse.timestamp).to.equal(expectedResponse.timestamp);
        expect(apiAiResponse.lang).to.equal(expectedResponse.lang);
        expect(apiAiResponse.result).to.deep.equal(expectedResponse.result);
    });
});

const API_AI_RESPONSE_JSON = '{ "id": "05c444c6-8154-4572-ae4b-7e74c27b02db", "timestamp": "2017-05-19T14:12:40.673Z", "lang": "en", "result": { "source": "agent", "resolvedQuery": "what the", "action": "input.unknown", "actionIncomplete": false, "parameters": {}, "contexts": [], "metadata": { "intentId": "48affa27-bb25-4bb9-a080-ed0b25f0d9d6", "webhookUsed": "false", "webhookForSlotFillingUsed": "false", "intentName": "Default Fallback Intent" }, "fulfillment": { "speech": "Say that again?", "messages": [ { "type": 0, "speech": "I missed what you said. Say it again?" } ] }, "score": 1 }, "status": { "code" : 200, "errorType": "success" } , "sessionId": "14a89cac-1af4-4b04-9d49-e0e2ecaf88d3" }';