import React, { PropsWithChildren, useState, useCallback } from 'react'
import { classList } from '../helpers';
import ConversationMomentOption from './ConversationMomentOption';


type ConversationMomentProps = {
	index: number,
	label: string,
	content: string,
	selected: boolean,
	options: Array<string>,
	setContent: Function,
	setOptions: Function,
	setFocus: Function,
	doRemoveOption: Function
}


export default function ConversationMoment(props:PropsWithChildren<ConversationMomentProps>) {
	//const [content, setContent] = useState("test best rest");
  	const onContentBlur = useCallback((evt:any) => {
		//setContent(evt.currentTarget.innerHTML);
		evt.stopPropagation();
		props.setContent(props.index, evt.currentTarget.innerHTML);
	}, [props.content]);

	const doSetOption = useCallback((index:number, text:string) => {
		const opts = [...props.options];
		opts[index] = text;
		props.setOptions(props.index, opts);
	}, [props.options]);


	const onFocus = (evt:any) => {
		props.setFocus(props.index);
	};

	const doRemoveOption = (optionIndex:any) => {
		props.doRemoveOption(props.index, optionIndex);
	};

	const listOptions = () => {
		const result = [];
		var i=0;
		for (var option of props.options) {
			result.push(<>
				<ConversationMomentOption 
					key={`moment-${props.index}-${i}`} index={i} content={option}
					setContent={doSetOption}
					setFocus={onFocus}
					doRemove={doRemoveOption}
				/>
			</>);
			i++;
		}
		return result;
	};

	return (
		<div className={classList(['conversation-entry', props.selected  ? 'selected' : ''])} 
			  data-label={props.label}>
			<div className="moment-text" tabIndex={0} contentEditable={true}
			  onBlur={onContentBlur} onFocus={onFocus} dangerouslySetInnerHTML={{__html: props.content}} />
			<div className="moment-options">
				{listOptions()}
			</div>
		</div>
	);
}