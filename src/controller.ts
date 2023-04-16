import { IncomingMessage, ServerResponse } from 'http';
import IResponse from './response';

let controllers: Map<string, Controller> = new Map();

interface IController {
	HandleRequest: (req: IncomingMessage, res: ServerResponse) => void;
	[handler: string]: any;
}

type UrlSegmentKind = 'string' | 'number' | 'bool';
type ParsedUrl = Array<[UrlSegmentKind, string | number | boolean]>;

abstract class Controller implements IController {
	constructor() {}
	[handler: string]: any;

	ParseUrl(url: string): ParsedUrl {
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

	ParseHandlerUrl(url: string, handler: string): ParsedUrl {
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

	HandleRequest(req: IncomingMessage, res: ServerResponse) {
		const handleRequest = (
			handler: (params: any) => IResponse,
			params: any
		) => {
			const response: IResponse = handler(params);
			res.statusCode = response.status;
			response.headers.forEach((value, key) => {
				res.setHeader(key, value);
			});
			res.write(response.data);
			res.end();
		};

		const handlers: Map<string, string> =
			this.constructor.prototype[req.method ?? 'GET'];
		const handler = this[handlers.get(req.url as string) as string] as
			| ((req: IncomingMessage) => IResponse)
			| undefined;

		if (!handler) {
			const parsedUrl = this.ParseUrl(req.url ?? '');
			let handled: boolean = false;
			handlers.forEach((handlerName, url) => {
				if (handled) return;
				const hndlSegments = this.ParseHandlerUrl(url, handlerName);
				if (hndlSegments.length === parsedUrl.length) {
					let params: Record<string, string | number | boolean> = {};
					for (
						let i = 0;
						i < parsedUrl.length && i < hndlSegments.length;
						i++
					) {
						const [hKind, hName] = (hndlSegments as ParsedUrl)[
							i
						] as [UrlSegmentKind, string];
						const [uKind, uValue] = (parsedUrl as ParsedUrl)[i] as [
							UrlSegmentKind,
							string | number | boolean
						];
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

		handleRequest(handler, req);
	}
}

function Route(route: string) {
	return (ctor: Function) => {
		controllers.set(route, new (ctor as any)() as Controller);
	};
}

export { Controller, Route, controllers };
