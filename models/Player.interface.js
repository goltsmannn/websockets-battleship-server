"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createId = exports.isPlayerData = void 0;
const crypto_1 = require("crypto");
const isPlayerData = (data) => {
    return typeof data.name === 'string' && typeof data.password === 'string';
};
exports.isPlayerData = isPlayerData;
const createId = (name, password) => {
    return (0, crypto_1.createHash)('sha256').update(name + password).digest('hex');
};
exports.createId = createId;
