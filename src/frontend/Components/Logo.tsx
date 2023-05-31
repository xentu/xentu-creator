import React from 'react';

type LogoProps = {
	src: string,
	size?: number,
	alt?: string
}

export default function Logo({ src, size = 32, alt }: LogoProps) {
	return (
		<a href="/">
			<img src={src}
				width={size}
				height={size}
				alt={alt} />
		</a>
	);
}