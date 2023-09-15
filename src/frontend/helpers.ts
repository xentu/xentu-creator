export function classList(array:Array<string>) {
	const filtered = array.filter((e) => e);
	return filtered.join(' ');
}


export function newGuid() {
	return Math.floor(Date.now() / 1000).toString(36);
}


export const getFileNameInfo = function (fullPath:string) {
	const name = fullPath.split('\\').pop().split('/').pop();
	return {
		name: name,
		path: fullPath.substring(0, fullPath.length - name.length),
		full: fullPath
	};
}