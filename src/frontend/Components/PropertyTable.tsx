import { ChangeEvent, PropsWithChildren, SetStateAction, useState } from 'react';
import { classList, newGuid } from '../helpers';


export type KeyValuePair = {
	key: string,
	value: string
}


type ComponentProps = {
	className?: string,
	disabled?: boolean,
	size?: number,
	table: Array<KeyValuePair>,
	setTable: Function
};


export default function PropertyTable(props: ComponentProps) {
	//const [data, setData] = useState([...props.table]);
	const guid = newGuid();

	const setItemKey = (e:React.ChangeEvent<HTMLElement>) => {
		const input = e.target as HTMLInputElement;
		const index = parseInt(input.dataset['index']);
		const newData = [...props.table];
		newData[index].key = input.value;
		props.setTable(newData);
	}

	const setItemValue = (e:React.ChangeEvent<HTMLElement>) => {
		const input = e.target as HTMLInputElement;
		const index = parseInt(input.dataset['index']);
		const newData = [...props.table];
		newData[index].value = input.value;
		props.setTable(newData);
	}

	const removeItem = (e:React.MouseEvent<HTMLElement>) => {
		const element = e.target as HTMLElement;
		if (element.tagName.toLowerCase() === 'span') {
			const a = element.parentElement as HTMLAnchorElement;
			const index = parseInt(a.dataset['index']);
			const newData = [...props.table];
			newData.splice(index, 1);
			props.setTable(newData);
		}
	}

	const renderTable = () => {
		const result = [];
		for (var i=0; i<props.table.length; i++) {
			result.push(
				<div className="property-table-item" key={`pti-${i}`}>
					<div><input type="text" className="input" value={props.table[i].key} data-index={i} onChange={setItemKey} /></div>
					<div><input type="text" className="input" value={props.table[i].value} data-index={i} onChange={setItemValue} /></div>
					<div style={{maxWidth:'20px'}}>
						<a data-index={i} onClick={removeItem}>
							<span className="icon-cancel" style={{userSelect:'none'}} />
						</a>
					</div>
				</div>
			);
		}
		return result;
	};

	return (
		<div className={classList(['property-table', props.className, props.disabled ? 'is-disabled':''])}>
			<div className="property-table-head" style={{opacity: '0.6'}}>
				<div>Name</div>
				<div>Value</div>
				<div style={{maxWidth:'20px'}}>&nbsp;</div>
			</div>
			<div className="property-table-body">
				{renderTable()}
			</div>
		</div>
	);
}