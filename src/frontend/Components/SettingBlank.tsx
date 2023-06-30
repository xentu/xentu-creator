type SettingBlankProps = {
	children?: string | JSX.Element | JSX.Element[],
	wrapClass?: string
}


export default function SettingBlank({ children, wrapClass }: SettingBlankProps) {
	return (
		<div className={["setting", wrapClass].join(' ')}>
			<div className="setting-left">
				<div>&nbsp;</div>
				<small>&nbsp;</small>
			</div>
			<div className="setting-right">
				{children}
			</div>
		</div>
	);
}