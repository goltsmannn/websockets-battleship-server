import Request from "../../models/Request.interface";
import {RawData} from "ws";

const messageHandler = (msg: RawData ) => {
    const jsonData = JSON.parse(msg.toString("utf-8"));

    if(!jsonData || !(Object.keys(jsonData).every(
        (key) => ["id", "data", "type"].includes(key)))) {
        throw new Error("JSON data doesn't have the required keys");
    }

    const request: Request = {
        id: jsonData['id'],
        type: jsonData['type'],
        data: jsonData['data'],
    };

    console.log(request);
};

export  default messageHandler;