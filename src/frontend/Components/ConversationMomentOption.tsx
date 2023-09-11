import React, { PropsWithChildren, useState, useCallback } from 'react'
import { classList } from '../helpers';


type ConversationMomentOptionProps = {
	index: number,
	content: string,
	setContent: Function,
	setFocus: Function
	doRemove: Function
}


export default function ConversationMomentOption(props:PropsWithChildren<ConversationMomentOptionProps>) {
	//const [content, setContent] = useState("test best rest");
  	const onContentBlur = useCallback((evt:any) => {
		//setContent(evt.currentTarget.innerHTML);
		props.setContent(props.index, evt.currentTarget.innerHTML);
	}, [props.content]);

	const onFocus = (evt:any) => {
		props.setFocus(props.index);
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
				  onBlur={onContentBlur} onFocus={onFocus} dangerouslySetInnerHTML={{__html: props.content}}
					/>
			<a onClick={deleteClick}>
				<span className="icon-cancel" style={{userSelect:'none'}} />
			</a>
		</div>
	);
}