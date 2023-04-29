import { Controller, Route, Get, Post, ResOk } from '../index';
import type { Request } from '../index';

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
	index(hi: string, req: Request, test: string) {
		console.log(test);
		console.log('HANDLING /\t(index)');
		return new ResOk('test1 index page ' + hi);
	}

	@Post('/')
	postIndex(req: Request) {
		console.log(req.body);
		return new ResOk('test1 post index result');
	}
}
