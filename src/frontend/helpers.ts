export function classList(array:Array<string>) {
	const filtered = array.filter((e) => e);
	return filtered.join(' ');
}


export function newGuid() {
	return Math.floor(Date.now() / 1000).toString(36);
}