import React, { PropsWithChildren, useState, useCallback } from 'react'
import { classList } from '../helpers';


type ConversationMomentProps = {
	index: number,
	label: string,
	content: string,
	selected: boolean,
	setContent: Function,
	setFocus: Function
}


export default function ConversationMoment(props:PropsWithChildren<ConversationMomentProps>) {
	//const [content, setContent] = useState("test best rest");
  	const onContentBlur = useCallback((evt:any) => {
		//setContent(evt.currentTarget.innerHTML);
		props.setContent(props.index, evt.currentTarget.innerHTML);
	}, [props.content]);

	const onFocus = (evt:any) => {
		props.setFocus(props.index);
	};

	return (
		<div className={classList(['conversation-entry', props.selected  ? 'selected' : ''])} 
			  data-label={props.label} tabIndex={0} contentEditable={true}
			  onBlur={onContentBlur} onFocus={onFocus} dangerouslySetInnerHTML={{__html: props.content}} />
	);
}