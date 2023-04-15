interface IResponse {
	status: number;
	data: any;
}

class ResOk implements IResponse {
	status: number;
	data: string;

	constructor(data: any) {
		this.status = 200;
		this.data = JSON.stringify(data);
	}
}

class ResNotFound implements IResponse {
	status: number;
	data: string;

	constructor(data: any) {
		this.status = 404;
		this.data = JSON.stringify(data);
	}
}

export default IResponse;
export { ResOk, ResNotFound };
