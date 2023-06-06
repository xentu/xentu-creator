import Dictionary from './Dictionary';

const fs = require( 'fs-extra' );

enum CreatorSettingType {
	string,
	number,
	boolean
}

class CreatorSetting {
	value: any;
	type: CreatorSettingType
	constructor(value:any, type:CreatorSettingType) {
		this.value = value;
		this.type = type;
	}
}


class CreatorSettings {
	categories: Array<string>;
	settings: Dictionary<CreatorSetting>;

	constructor() {
		this.categories = new Array<string>();
		this.settings = new Dictionary<CreatorSetting>();
	}
}


export default CreatorSettings;