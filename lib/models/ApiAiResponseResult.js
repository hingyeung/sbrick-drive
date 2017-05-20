'use strict';

const ApiAiResponseResultMetadata = require('./ApiAiResponseResultMetadata'),
    ApiAiResponseResultFulfillment = require('./ApiAiResponseResultFulfillment');

function ApiAiResponseResult(source,
                             resolvedQuery,
                             action,
                             actionIncomplete,
                             parameters,
                             contexts,
                             metadata,
                             fulfillment,
                             score) {
    return {
        source: source,
        resolvedQuery: resolvedQuery,
        action: action,
        actionIncomplete: actionIncomplete,
        parameters: parameters,
        contexts: contexts,
        metadata: metadata,
        fulfillment: fulfillment,
        score: score
    }
}

ApiAiResponseResult.fromApiAi = function (result) {
    return new ApiAiResponseResult(
        result.source,
        result.resolvedQuery,
        result.action,
        result.actionIncomplete,
        result.parameters,
        result.contexts,
        ApiAiResponseResultMetadata.fromApiAi(result.metadata),
        ApiAiResponseResultFulfillment.fromApiAi(result.fulfillment),
        result.score
    );
};

module.exports = ApiAiResponseResult;