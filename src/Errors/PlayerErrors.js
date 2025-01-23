"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiTabConnectionError = exports.AuthorizationError = void 0;
class AuthorizationError extends Error {
    constructor() {
        super('Authorization Error');
    }
}
exports.AuthorizationError = AuthorizationError;
class MultiTabConnectionError extends Error {
    constructor() {
        super('Multi-tab is not supported');
    }
}
exports.MultiTabConnectionError = MultiTabConnectionError;
