import React, { useState, useRef, useEffect, useContext } from 'react';
import Icon from './Icon';


type FileCreatorProps = {
	label:string,
	path:string,
	visible?: boolean,
	doHide: Function,
	onSubmit: Function
}


export default function FileCreator(props: FileCreatorProps) {
	const [newName, setNewName] = useState(props.label);
	const inputRef = useRef(null);

	const changeName = (e:React.ChangeEventHandler<HTMLInputElement>) => {
		console.log(e);
		//setNewName(e);
	};

	useEffect(() => {
		setNewName('Untitled');
		if (props.visible == true) {
			setTimeout(() => {
				inputRef?.current.focus();
				inputRef?.current.select();
			}, 200);
		}
	}, [props.visible])

	const handleKeyUp = (e:React.KeyboardEvent, _p:string) => {
		if (e.key == 'Enter') {
			const p = _p + '//' + inputRef.current.value;
			//console.log('Create', p);
			props.onSubmit(p);
			props.doHide();
		}
	};

	return (
		<li className="file-entry file-creator" style={{display:props.visible?'inherit':'none'}}>
			<a>
				<i className="icon-right-open"></i>
				<i className="file-icon icon-file-code"></i>
				<input ref={inputRef} type="text" value={newName} 
						 onBlur={() => props.doHide()}
						 onKeyUp={(e:React.KeyboardEvent) => handleKeyUp(e, props.path)}
						 onChange={(e:any) => { setNewName(e.target.value) }} />
			</a>
		</li>
	);
}