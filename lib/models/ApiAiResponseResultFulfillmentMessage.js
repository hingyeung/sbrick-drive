'use strict';

function ApiAiResponseResultFulfillmentMessage(type, speech) {
    return {
        type: type,
        speech: speech
    };
}

ApiAiResponseResultFulfillmentMessage.fromApiAi = function (message) {
    return new ApiAiResponseResultFulfillmentMessage(message.type, message.speech);
};

module.exports = ApiAiResponseResultFulfillmentMessage;
