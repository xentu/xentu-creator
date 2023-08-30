import React, { PropsWithChildren, useState, useCallback } from 'react'


type ConversationMomentProps = {
	index: number,
	label: string,
	content: string,
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
		<div className={`conversation-entry`} data-label={props.label} tabIndex={0} contentEditable={true}
			  onBlur={onContentBlur} onFocus={onFocus} dangerouslySetInnerHTML={{__html: props.content}} />
	);
}