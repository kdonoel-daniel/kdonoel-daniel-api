import * as deepDiff from 'deep-diff';
import * as _ from 'lodash';
import { ObjectID } from 'mongodb';
import { Service } from 'typedi';
import { oid } from '../../mongo';

@Service()
export class ObjectUtilsService {
	public getRightDiffs(o1: object, o2: object): object {
		// Convert mongo object ids to string before comparaison
		o1 = this.convertIdsToStrings(o1);

		const compareResult = deepDiff.diff(this.convertIdsToStrings(o1), this.convertIdsToStrings(o2));
		const diff = {};

		if (compareResult) {
			compareResult
				.filter((change) => change.kind !== 'D')
				.forEach((change) => {
					const path = this.pathTostring(change.path);

					if (change.lhs && change.lhs.toString().match(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/)) {
						if (_.get(o1, path) && _.get(o2, path) && new Date(_.get(o1, path).toString()).getTime() !== new Date(_.get(o2, path).toString()).getTime()) {
							_.set(diff, path, {
								_old: new Date(change.lhs),
								_new: new Date(change.rhs)
							});
						}
					} else if (change.item && change.item.rhs) {
						_.set(diff, path, [change.item.rhs]);
					} else {
						_.set(diff, path, {
							_old: change.lhs,
							_new: change.rhs
						});
					}
				});
		}

		// Convert string to mongo object ids before returning answer
		return this.convertStringsToIds(diff);
	}

	public removeEmpty(obj: object): object {
		Object.keys(obj).forEach((key) => {
			if (obj[key] && typeof obj[key] === 'object') this.removeEmpty(obj[key]);
			else if (obj[key] == null || obj[key] == undefined) delete obj[key];
		});
		return obj;
	}

	private pathTostring(pathArray: string[]): string {
		let path = '';
		pathArray.forEach((value, index) => {
			if (typeof value === 'string') {
				if (index !== 0) path += '.';
				path += value;
			} else if (typeof value === 'number') {
				path += `[${value}]`;
			}
		});
		return path;
	}

	private convertIdsToStrings(o: object): object {
		return _.mapValues(o, (value, key) => {
			if (!value) return value;
			// convert object id to string
			if (typeof value === 'object' && ObjectID.isValid(value)) return value.toString();
			// If array, convertr every values and convert returned obj to array with _.values
			else if (value instanceof Array) return _.values(this.convertIdsToStrings(value));
			// If neither array nor date, convert every values
			else if (!(value instanceof Date || value instanceof Array) && typeof value === 'object') return this.convertIdsToStrings(value);
			else return value;
		});
	}

	private convertStringsToIds(o: object): object {
		return _.mapValues(o, (value, key) => {
			if (!value) return value;
			// convert string to objectId
			else if (typeof value === 'string' && ObjectID.isValid(value)) return oid(value);
			// If array, convert every values and convert returned obj to array with _.values
			else if (value instanceof Array) return _.values(this.convertStringsToIds(value));
			// If neither array nor date, convert every values
			else if (!(value instanceof Date || value instanceof Array) && typeof value === 'object') return this.convertStringsToIds(value);
			else return value;
		});
	}
}
