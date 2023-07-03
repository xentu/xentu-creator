type LogoProps = {
	src: string,
	size?: number,
	alt?: string
}


export default function Logo(props: LogoProps) {
	return (
		<a>
			<img src={props.src}
				width={props.size ?? 32}
				height={props.size ?? 32}
				alt={props.alt} />
		</a>
	);
}