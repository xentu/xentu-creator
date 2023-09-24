import React, { PropsWithChildren, useState, useCallback } from 'react'
import { classList } from '../helpers';


type ConversationMomentOptionProps = {
	index: number,
	content: string,
	setContent: Function,
	setFocus: Function
	doRemove: Function,
	doOptionDialog: Function
}


export default function ConversationMomentOption(props:PropsWithChildren<ConversationMomentOptionProps>) {
	//const [content, setContent] = useState("test best rest");
  	const onContentBlur = useCallback((evt:any) => {
		//setContent(evt.currentTarget.innerHTML);
		evt.stopPropagation();
		const newContent = evt.currentTarget.innerHTML;
		if (newContent != props.content) {
			props.setContent(props.index, newContent);
		}
	}, [props.content]);

	const onFocus = (evt:any) => {
		props.setFocus(props.index);
	};

	const optsClick = (evt:any) => {
		props.setFocus(props.index);
		props.doOptionDialog(evt);
		console.log('Opts Clicked');
	};

	const deleteClick = (evt:any) => {
		const element = evt.target as HTMLElement;
		if (element.tagName.toLowerCase() === 'span') {
			props.doRemove(props.index);
		}
	};

	return (
		<div className="moment-option-wrap">
			<div className={classList(['moment-option', ''])} 
				  tabIndex={0} contentEditable={true}
				  onBlur={onContentBlur} onFocus={(evt:any) => props.setFocus(evt, props.index)} dangerouslySetInnerHTML={{__html: props.content}}
					/>
			<a onClick={optsClick}>
				<span className="icon-cog" style={{userSelect:'none'}} />
			</a>
			<a onClick={deleteClick}>
				<span className="icon-cancel" style={{userSelect:'none'}} />
			</a>
		</div>
	);
}