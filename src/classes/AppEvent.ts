class AppEvent {
	Name:string;
	Data?:string;

	constructor(name:string, data?:string) {
		this.Name = name;
		this.Data = data;
	}
}

//export { AppEventContext };
export default AppEvent;