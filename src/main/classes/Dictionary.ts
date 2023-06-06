interface IDictionary {
	[key: string]: any;
}

class Dictionary<Type> {
	dictionary: IDictionary = {};

	constructor() { }

	add(key: string, value: Type) {
		this.dictionary[key] = value;
	}

	remove(key: string) {
		delete this.dictionary[key];
	}

	get(key: string) : Type {
		return this.dictionary[key];
	}

	contains_key(key: string) {
		this.dictionary.has(key);
	}

	keys(): string[] {
		 return Object.keys(this.dictionary);
	}

	values(): Type[] {
		 return Object.values(this.dictionary);
	}

	toLookup() : IDictionary {
		return this.dictionary;
	}
}

export default Dictionary;