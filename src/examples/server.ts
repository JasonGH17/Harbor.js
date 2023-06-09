import { IncomingMessage } from 'http';
import Server, { Controller, Route, Get, ResOk } from '../index';

import './test1';

@Route('/test2')
class test2Controller extends Controller {
	constructor() {
		super();
	}

	@Get('/world')
	hello(req: IncomingMessage) {
		console.log('HANDLING /world');
		return new ResOk('Hello world /test2/world');
	}
}

const server = new Server({ host: '127.0.0.1', port: 8000 });

server.Run(() => console.log('Server is ready: http://127.0.0.1:8000/'));
