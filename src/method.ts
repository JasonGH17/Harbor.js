import { Controller } from './controller';

function NewMethodDecorator(httpMethod: string) {
	return (route: string) => {
		return (
			parent: Object extends Controller ? Controller : Object,
			method: string,
			descriptors: PropertyDescriptor
		) => {
			parent.constructor.prototype[httpMethod] =
				parent.constructor.prototype[httpMethod] ??
				new Map<string, string>();
			parent.constructor.prototype[httpMethod].set(route, method);
		};
	};
}

function GetMethodParams(func: Function) {
	var fnStr = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm, '');
	var result = fnStr
		.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
		.match(/([^\s,]+)/g) as Array<string>;
	return result ?? [];
}

const Get = NewMethodDecorator('GET');
const Post = NewMethodDecorator('POST');
const Put = NewMethodDecorator('PUT');
const Patch = NewMethodDecorator('PATCH');
const Delete = NewMethodDecorator('DELETE');

export { GetMethodParams, Get, Post, Put, Patch, Delete };
