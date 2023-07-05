type ComponentProps = {
	onSubmit?: Function,
	onCancel?: Function
}


export default function SettingButtons(props: ComponentProps) {
	return (
		<div className="setting setting-buttons">
			<div className="setting-left">
				<div>&nbsp;</div>
				<small>&nbsp;</small>
			</div>
			<div className="setting-right">
				<div className="buttons">
					<a className="button primary" onClick={() => props.onSubmit()}>OK</a>
					<a className="button" onClick={() => props.onCancel()}>Cancel</a>
				</div>
			</div>
		</div>
	);
}