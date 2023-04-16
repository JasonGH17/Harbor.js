import { IncomingMessage } from 'http';
import { Controller, Route, Get, Post, ResOk } from '../index';

@Route('/test1')
class test1Controller extends Controller {
	constructor() {
		super();
	}

	@Get('/{numbertest: number}/{bool1: bool}/{str: string}/{bool2: bool}')
	hello(req: {
		numbertest: number;
		bool1: boolean;
		str: string;
		bool2: boolean;
	}) {
		console.log(req);
		return new ResOk('Hello world /test1/hello');
	}

	@Get('/')
	index(req: IncomingMessage) {
		console.log('HANDLING /\t(index)');
		return new ResOk('test1 index page');
	}

	@Post('/')
	postIndex(req: IncomingMessage) {
		return new ResOk('test1 post index result');
	}
}
