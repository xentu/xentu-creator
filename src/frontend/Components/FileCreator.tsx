import React, { useState, useRef, useEffect, useContext } from 'react';
import Icon from './Icon';


type FileCreatorProps = {
	label:string,
	path:string,
	visible?: boolean,
	doHide: Function,
	onSubmit: Function
}


export default function FileCreator({ label, path, visible, doHide, onSubmit }: FileCreatorProps) {
	const [newName, setNewName] = useState(label);
	const inputRef = useRef(null);

	const changeName = (e:React.ChangeEventHandler<HTMLInputElement>) => {
		console.log(e);
		//setNewName(e);
	};

	useEffect(() => {
		setNewName('Untitled');
		if (visible == true) {
			setTimeout(() => {
				inputRef?.current.focus();
				inputRef?.current.select();
			}, 200);
		}
	}, [visible])

	const handleKeyUp = (e:React.KeyboardEvent, _p:string) => {
		if (e.key == 'Enter') {
			const p = _p + '//' + inputRef.current.value;
			//console.log('Create', p);
			onSubmit(p);
			doHide();
		}
	};

	return (
		<li className="file-entry file-creator" style={{display:visible?'inherit':'none'}}>
			<a>
				<i className="icon-right-open"></i>
				<i className="file-icon icon-file-code"></i>
				<input ref={inputRef} type="text" value={newName} 
						 onBlur={() => doHide()}
						 onKeyUp={(e:React.KeyboardEvent) => handleKeyUp(e, path)}
						 onChange={(e:any) => { setNewName(e.target.value) }} />
			</a>
		</li>
	);
}