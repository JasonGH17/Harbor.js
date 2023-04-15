import { IncomingMessage, ServerResponse } from 'http';
import IResponse from './response';

let controllers: Map<string, Controller> = new Map();

interface IController {
	HandleRequest: (req: IncomingMessage, res: ServerResponse) => void;
	[handler: string]: any;
}

abstract class Controller implements IController {
	constructor() {}
	[handler: string]: any;

	HandleRequest(req: IncomingMessage, res: ServerResponse) {
		const handlers: Map<string, string> =
			this.constructor.prototype[req.method ?? 'GET'];
		const handler = this[handlers.get(req.url as string) as string] as
			| ((req: IncomingMessage) => IResponse)
			| undefined;
		if (!handler) {
			res.statusCode = 404;
			res.end();
			return;
		} else {
			const response: IResponse = handler(req);
			res.statusCode = response.status;
			response.headers.forEach((value, key) => {
				res.setHeader(key, value);
			});
			res.write(response.data);
			res.end();
		}
	}
}

function Route(route: string) {
	return (ctor: Function) => {
		controllers.set(route, new (ctor as any)() as Controller);
	};
}

export { Controller, Route, controllers };
