'use strict';

const _ = require('lodash'),
    ApiAiResponseResultFulfillmentMessage = require('./ApiAiResponseResultFulfillmentMessage');

function ApiAiResponseResultFulfillment(speech, messages) {
    return {
        speech: speech,
        messages: messages
    };
}

ApiAiResponseResultFulfillment.fromApiAi = function (fulfillment) {
    return new ApiAiResponseResultFulfillment(
        fulfillment.speech,
        _.map(fulfillment.messages, function (message) {
            return ApiAiResponseResultFulfillmentMessage.fromApiAi(message)
        })
    );
};

module.exports = ApiAiResponseResultFulfillment;
