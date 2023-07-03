type IconProps = {
	type: string,
	size?: number
}


export default function Icon(props: IconProps) {
	let src = '../images/icons/file-gray.png';
	const imageTypes = ['jpg', 'png', 'svg'];

	if (props.type == 'folder') src = '../images/icons/folder-icon.png';
	if (imageTypes.includes(props.type)) src = '../images/icons/file-image.png';
	
	return (
		<img src={src}
				width={props.size ?? 16}
				height={props.size ?? 16}
				className="icon" />
	);
}