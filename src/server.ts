import http, { IncomingMessage, ServerResponse } from 'http';
import { Controller, controllers } from './controller';

type ServerConstructorArguments = {
	host: string;
	port: number;
	backlog?: number;
};

class Server {
	public static handlers: Map<string, string> = new Map();

	private host: string;
	private port: number;
	private backlog: number;

	private server: http.Server;

	public constructor(args: ServerConstructorArguments) {
		this.host = args.host;
		this.port = args.port;
		this.backlog = args.backlog ?? 10;

		this.server = http.createServer(this.RequestHandler);
	}

	private RequestHandler(req: IncomingMessage, res: ServerResponse) {
		controllers.forEach((controller: Controller, route: string) => {
			if (req.url?.startsWith(route)) {
				const routeUrl = req.url.split(route)[1];
				req.url = routeUrl?.length ? routeUrl : '/';
				controller.HandleRequest(req, res);
			}
		});
	}

	public Run(listener: () => void) {
		this.server.on('error', (err: any) => {
			if (err.code === 'EADDRINUSE') {
				const callback = (x: number) => {
					console.log(
						'Address in use, retrying in',
						x.toFixed(0),
						'seconds'
					);
					this.server.close();
					this.server.listen(this.port, this.host, this.backlog);

					setTimeout(callback, x ** 1.5);
				};

				callback(1000);
			}
		});

		this.server.listen(this.port, this.host, this.backlog, listener);
	}
}

export default Server;
