import { IncomingMessage, ServerResponse } from 'http';
import Server, { Controller, Route, Get } from '../index';

@Route('/test1')
class test1Controller extends Controller {
	constructor() {
		super();
	}

	@Get('/hello')
	hello(req: IncomingMessage, res: ServerResponse) {
		console.log('HANDLING /hello');
		res.write('Hello world /test1/hello');
		res.end();
	}
}

@Route('/test2')
class test2Controller extends Controller {
	constructor() {
		super();
	}

	@Get('/world')
	hello(req: IncomingMessage, res: ServerResponse) {
		console.log('HANDLING /world');
		res.write('Hello world /test2/world');
		res.end();
	}
}

const server = new Server({ host: '127.0.0.1', port: 8000 });

server.Run();
