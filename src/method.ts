import { Controller } from './controller';

function Get(route: string) {
	return (
		parent: Object extends Controller ? Controller : Object,
		method: string,
		descriptors: PropertyDescriptor
	) => {
		parent.constructor.prototype['GET'] =
			parent.constructor.prototype['GET'] ?? new Map<string, string>();
		parent.constructor.prototype['GET'].set(route, method);
	};
}

export default Get;
