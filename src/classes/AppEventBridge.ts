import Queue from './Queue';
import AppEvent from './AppEvent'

class AppEventBridge {
	private Events: Queue<AppEvent>;

	constructor() {
		this.Events = new Queue<AppEvent>();
	}

	/**
	 * Trigger the recording of an event.
	 * @param eventName The name of the event.
	 * @param data (optional) any accompanying data for the event.
	 */
	Record(eventName: string, data?: string) {
		this.Events.enqueue(new AppEvent(eventName, data));
	}

	/**
	 * Get the latest event that was fired (if any).
	 * Please note, this removes the event from the queue.
	 */
	FetchNext = () : AppEvent|null => this.Events.dequeue();
}

export { default as AppEvent } from './AppEvent';
export default AppEventBridge;