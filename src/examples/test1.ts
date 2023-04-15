import { IncomingMessage } from 'http';
import { Controller, Route, Get, ResOk } from '../index';

@Route('/test1')
class test1Controller extends Controller {
	constructor() {
		super();
	}

	@Get('/hello')
	hello(req: IncomingMessage) {
		console.log('HANDLING /hello');
		return new ResOk('Hello world /test1/hello');
	}

	@Get('/')
	index(req: IncomingMessage) {
		console.log('HANDLING /\t(index)');
		return new ResOk('test1 index page');
	}
}
