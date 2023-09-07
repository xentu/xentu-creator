import React, { PropsWithChildren, useState, useCallback } from 'react'
import { classList } from '../helpers';


type ConversationMomentOptionProps = {
	index: number,
	content: string,
	setContent: Function,
	setFocus: Function
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

	return (
		<div className={classList(['moment-option', ''])} 
			  tabIndex={0} contentEditable={true}
			  onBlur={onContentBlur} onFocus={onFocus} dangerouslySetInnerHTML={{__html: props.content}}
			   />
	);
}