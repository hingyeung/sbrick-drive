'use strict';

function ApiAiResponseResultMetadata(intentId, webhookUsed, webhookForSlotFillingUsed, intentName) {
    return {
        intentId: intentId,
        webhookUsed: webhookUsed,
        webhookForSlotFillingUsed: webhookForSlotFillingUsed,
        intentName: intentName
    };
}

ApiAiResponseResultMetadata.fromApiAi = function (metadata) {
    return new ApiAiResponseResultMetadata(
        metadata.intentId,
        metadata.webhookUsed,
        metadata.webhookForSlotFillingUsed,
        metadata.intentName
    );
};

module.exports = ApiAiResponseResultMetadata;