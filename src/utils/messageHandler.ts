import Request from "../../models/Request.interface";
import {RawData} from "ws";
import App from "./App";

const messageHandler = (msg: RawData, app: App ) => {
    const request: Request = JSON.parse(msg.toString("utf-8"));
    request.data = request.data? JSON.parse(request.data as string): "";
    app.dispatchRequest(request);
};

export  default messageHandler;