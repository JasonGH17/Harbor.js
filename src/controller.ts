import { IncomingMessage, ServerResponse } from 'http';
import IResponse from './response';
import { GetMethodParams } from './method';
import query from 'node:querystring';

let controllers: Map<string, Controller> = new Map();

type UrlSegmentKind = 'string' | 'number' | 'bool';
type ParsedUrl = Array<[UrlSegmentKind, string | number | boolean]>;

type Request = {
	body: any;
	rawReq: IncomingMessage;
};

type Param = {
	[index: string]: any;
};

interface IController {
	HandleRequest: (req: Request, res: ServerResponse) => void;
	[handler: string]: any;
}

abstract class Controller implements IController {
	constructor() {}
	[handler: string]: any;

	private ParseUrl(url: string): ParsedUrl {
		let parsed: ParsedUrl = [];
		const parts = url.split('/');
		for (let i = 0; i < parts.length; i++) {
			const part: string = parts[i] ?? '';
			if (part.length === 0) continue;

			parsed.push(
				isNaN(+part)
					? part === 'false' || part === 'true'
						? ['bool', part === 'true']
						: ['string', part]
					: ['number', +part]
			);
		}
		return parsed;
	}

	private ParseHandlerUrl(url: string, handler: string): ParsedUrl {
		const isSegmentType = (kind: string): kind is UrlSegmentKind =>
			['string', 'number', 'bool'].includes(kind);

		const parsed: ParsedUrl = [];
		const parts = url.split('/');
		for (let i = 0; i < parts.length; i++) {
			let part = parts[i];
			if (part?.length === 0) continue;

			if (
				part?.startsWith('{') &&
				part.endsWith('}') &&
				part.includes(':')
			) {
				part = part.slice(1, part.length - 1);

				let [name, kind]: [string, UrlSegmentKind] = part.split(
					':'
				) as [string, UrlSegmentKind];
				name = name.trim();
				kind = kind.trim() as UrlSegmentKind;

				if (!isSegmentType(kind)) {
					console.error(
						'Invalid HTTP handler URL:\n\t- Class:',
						this.constructor.name,
						'\n\t- Handler:',
						handler,
						'\n\t- URL:',
						url,
						'\n\t- Invalid kind:',
						kind
					);
					return [];
				} else {
					parsed.push([kind, name]);
				}
			}
		}

		return parsed;
	}

	HandleRequest(req: Request, res: ServerResponse) {
		const handleRequest = (
			handler: (...params: any[]) => IResponse,
			...params: any[]
		) => {
			const response: IResponse = handler(...params);
			res.statusCode = response.status;
			response.headers.forEach((value, key) => {
				res.setHeader(key, value);
			});
			res.write(response.data);
			res.end();
		};

		const handle = () => {
			const handlers: Map<string, string> =
				this.constructor.prototype[req.rawReq.method ?? 'GET'];
			const [endpoint, params] = (
				req.rawReq.url?.slice() as string
			).split('?');

			const queryData = query.parse(params ?? '');

			const handler = this[
				handlers.get(endpoint || ('/' as string)) as string
			] as ((req: IncomingMessage) => IResponse) | undefined;

			if (!handler) {
				const parsedUrl = this.ParseUrl(req.rawReq.url ?? '');
				let handled: boolean = false;
				handlers.forEach((handlerName, url) => {
					if (handled) return;
					const hndlSegments = this.ParseHandlerUrl(url, handlerName);
					if (hndlSegments.length === parsedUrl.length) {
						let params: Record<string, string | number | boolean> =
							{};
						for (
							let i = 0;
							i < parsedUrl.length && i < hndlSegments.length;
							i++
						) {
							const [hKind, hName] = (hndlSegments as ParsedUrl)[
								i
							] as [UrlSegmentKind, string];
							const [uKind, uValue] = (parsedUrl as ParsedUrl)[
								i
							] as [UrlSegmentKind, string | number | boolean];
							if (hKind === uKind) params[hName] = uValue;
							else return;
						}

						handleRequest(
							this[handlerName] as (
								parameters: typeof params
							) => IResponse,
							params
						);
					}
				});
				if (handled) return;
				res.statusCode = 404;
				res.end();
				return;
			}

			const handlerParamNames = GetMethodParams(handler);
			const handlerParams: Array<any> = [];
			for (let param of handlerParamNames) {
				if (param === 'req') handlerParams.push(req);
				if (queryData[param]) handlerParams.push(queryData[param]);
			}

			handleRequest(handler, ...handlerParams);
		};

		if (req.rawReq.method !== 'GET' && req.rawReq.method !== 'HEAD') {
			let body = '';
			req.rawReq.on('data', (chunk: string) => {
				body += chunk;
			});
			req.rawReq.on('end', () => {
				req.body = JSON.parse(body);
				handle();
			});
		} else handle();
	}
}

function Route(route: string) {
	return (ctor: Function) => {
		controllers.set(route, new (ctor as any)() as Controller);
	};
}

export { Controller, Route, controllers };
export type { Request };
