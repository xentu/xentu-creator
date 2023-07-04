export function classList(array:Array<string>) {
	const filtered = array.filter((e) => e);
	return filtered.join(' ');
}