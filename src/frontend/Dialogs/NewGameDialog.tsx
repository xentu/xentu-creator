type NewGameDialogProps = {
	createGameCallback: Function
}


export default function NewGameDialog({ createGameCallback }: NewGameDialogProps) {
	return (
		<div className={`new-game-dialog`}>
			<h2>New Game</h2>
		</div>
	);
}