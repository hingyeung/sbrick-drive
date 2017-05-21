'use strict';

function ApiAiResponseStatus(code, errorType) {
    return {
        code: code,
        errorType: errorType
    }
}

ApiAiResponseStatus.fromApiAi = function (code, errorType) {
    return new ApiAiResponseStatus(code, errorType);
};

module.exports = ApiAiResponseStatus;