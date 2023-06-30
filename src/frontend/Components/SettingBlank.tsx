type SettingBlankProps = {
	children?: string | JSX.Element | JSX.Element[],
	wrapClass?: string,
	title?: string,
	description?: string
}


export default function SettingBlank({ title, description, children, wrapClass }: SettingBlankProps) {
	return (
		<div className={["setting", wrapClass].join(' ')}>
			<div className="setting-left">
				<div>{title}&nbsp;</div>
				<small>{description}&nbsp;</small>
			</div>
			<div className="setting-right">
				{children}
			</div>
		</div>
	);
}