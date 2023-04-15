import { IncomingMessage, ServerResponse } from 'http';

let controllers: Map<string, Controller> = new Map();

interface IController {
    HandleRequest: (req: IncomingMessage, res: ServerResponse) => void,
    [handler: string]: (req: IncomingMessage, res: ServerResponse) => any;
}

class Controller implements IController {
    constructor() { }
    [handler: string]: (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => any;

    HandleRequest(req: IncomingMessage, res: ServerResponse) {
        const handlers: Map<string, string> = this.constructor.prototype[req.method ?? 'GET'];
        const handler = this[handlers.get(req.url as string) as string];
        if (!handler) {
            res.statusCode = 404;
            res.end();
            return;
        } else
            handler(req, res);
    };
}

function Route(route: string) {
    return (ctor: Function) => {
        controllers.set(route, new (ctor as any)() as Controller);
    };
}

export { Controller, Route, controllers };