type LogoProps = {
	src: string,
	size?: number,
	alt?: string
}


export default function Logo({ src, size = 32, alt }: LogoProps) {
	return (
		<a>
			<img src={src}
				width={size}
				height={size}
				alt={alt} />
		</a>
	);
}