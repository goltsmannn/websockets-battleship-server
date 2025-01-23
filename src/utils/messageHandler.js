"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messageHandler = (msg, app) => {
    const request = JSON.parse(msg.toString("utf-8"));
    request.data = JSON.parse(request.data);
    app.dispatchRequest(request);
};
exports.default = messageHandler;
