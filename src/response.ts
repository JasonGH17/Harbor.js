interface IResponse {
	status: number;
	data: any;
	headers: Map<string, string | number>;
}

class Response implements IResponse {
	status: number = 0;
	data: string;
	headers: Map<string, string | number> = new Map();

	constructor(data: any) {
		if (typeof data === 'string') {
			this.data = data;
			this.headers.set('Content-Type', 'text/plain');
		} else {
			this.data = JSON.stringify(data);
			this.headers.set('Content-Type', 'application/json');
		}
		this.headers.set('Content-Length', this.data.length);
	}
}

class ResOk extends Response {
	status: number = 200;

	constructor(data: any) {
		super(data);
	}
}

class ResNotFound extends Response {
	status: number = 404;

	constructor(data: any) {
		super(data);
	}
}

export default IResponse;
export { ResOk, ResNotFound };
