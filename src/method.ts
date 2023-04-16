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

const Get = NewMethodDecorator('GET');
const Post = NewMethodDecorator('POST');
const Put = NewMethodDecorator('PUT');
const Patch = NewMethodDecorator('PATCH');
const Delete = NewMethodDecorator('DELETE');

export { Get, Post, Put, Patch, Delete };
