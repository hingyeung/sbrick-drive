'use strict';

const ApiAiResponseStatus = require('./ApiAiResponseStatus'),
    ApiAiResponseResult = require('./ApiAiResponseResult');

function ApiAiResponse(id, timestamp, lang, responseResult, resultStatus, sessionId) {
    return {
        id: id,
        timestamp: timestamp,
        lang: lang,
        result: responseResult,
        status: resultStatus,
        sessionId: sessionId
    }
}

ApiAiResponse.fromApiAi = function (apiAiResponse) {
    return new ApiAiResponse(
        apiAiResponse.id,
        apiAiResponse.timestamp,
        apiAiResponse.lang,
        ApiAiResponseResult.fromApiAi(apiAiResponse.result),
        ApiAiResponseStatus.fromApiAi(apiAiResponse.status),
        apiAiResponse.sessionId
    );
};

module.exports = ApiAiResponse;
