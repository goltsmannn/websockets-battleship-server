"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messageHandler = (msg) => {
    const jsonData = JSON.parse(msg.toString("utf-8"));
    console.log(jsonData);
    if (!jsonData || !(Object.keys(jsonData).every((key) => ["id", "data", "type"].includes(key)))) {
        throw new Error("JSON data doesn't have the required keys");
    }
    const request = {
        id: jsonData['id'],
        type: jsonData['type'],
        data: jsonData['data'],
    };
    console.log(request);
};
exports.default = messageHandler;
