type SettingBlankProps = {
	children?: string | JSX.Element | JSX.Element[],
	wrapClass?: string,
	title?: string,
	description?: string
}


export default function SettingBlank(props: SettingBlankProps) {
	return (
		<div className={["setting", props.wrapClass].join(' ')}>
			<div className="setting-left">
				<div>{props.title}&nbsp;</div>
				<small>{props.description}&nbsp;</small>
			</div>
			<div className="setting-right">
				{props.children}
			</div>
		</div>
	);
}