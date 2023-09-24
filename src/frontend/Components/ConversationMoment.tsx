import React, { PropsWithChildren, useState, useCallback } from 'react'
import { classList } from '../helpers';
import ConversationMomentOption from './ConversationMomentOption';


type MomentEntryOption = {
	content: string,
	target: string
}


type ConversationMomentProps = {
	index: number,
	label: string,
	content: string,
	selected: boolean,
	options: Array<MomentEntryOption>,
	setContent: Function,
	setOptions: Function,
	setFocus: Function,
	setOptionFocus: Function,
	doRemoveOption: Function,
	doOptionDialog: Function
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
		opts[index].content = text;
		props.setOptions(props.index, opts);
	}, [props.options]);


	const onFocus = (evt:any) => {
		props.setFocus(props.index);
		props.setOptionFocus(-1);
	};

	const onOptionFocus = (evt:any, optionIndex:number) => {
		props.setFocus(props.index);
		props.setOptionFocus(optionIndex);
	};

	const doRemoveOption = (optionIndex:number) => {
		props.doRemoveOption(props.index, optionIndex);
	};

	const listOptions = () => {
		const result = [];
		var i=0;
		for (var option of props.options) {
			result.push(<>
				<ConversationMomentOption 
					key={`moment-${props.index}-${i}`} index={i} content={option.content}
					setContent={doSetOption}
					setFocus={onOptionFocus}
					doRemove={doRemoveOption}
					doOptionDialog={props.doOptionDialog}
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