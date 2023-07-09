import { ChangeEvent, PropsWithChildren, SetStateAction } from 'react';
import { classList, newGuid } from '../helpers';


type ComponentProps = {
	className?: string,
	disabled?: boolean,
	items: Array<any>,
	size?: number,
	value: any,
	onSelect: Function
};


export default function ListBox(props: ComponentProps) {
	const guid = newGuid();

	const renderItems = () => {
		const result = [];
		for (var i=0; i<props.items.length; i++) {
			const item = props.items[i];
			result.push(<option key={`${guid}_${i}`}>{item}</option>);
		}
		return result;
	};

	const handleOnChange = (e:ChangeEvent<HTMLSelectElement>) => {
		props.onSelect(e.target.value);
	}

	return (
		<div className={classList(['list-box', props.className, props.disabled ? 'is-disabled':''])}>
			<select size={props.size ?? 5} value={props.value} onChange={handleOnChange} autoFocus={false}>
				<option key={'default-opt'} hidden disabled value=''> -- select an option -- </option>
				{renderItems()}
			</select>
		</div>
	);
}