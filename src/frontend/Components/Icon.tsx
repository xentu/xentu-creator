type IconProps = {
	type: string,
	size?: number
}

export default function Icon({ type, size = 16 }: IconProps) {
	let src = '../images/icons/file-gray.png';
	const imgs = ['jpg', 'png', 'svg'];

	if (type == 'folder') src = '../images/icons/folder-icon.png';
	if (imgs.includes(type)) src = '../images/icons/file-image.png';
	
	return (
		<img src={src}
				width={size}
				height={size}
				className="icon" />
	);
}