export function CoffeeCup({ isLoading = false }: { isLoading?: boolean }) {
	const cupAnimation = isLoading
		? "cup-jiggle 0.3s ease-in-out infinite"
		: "cup-wobble 3s ease-in-out infinite";

	const steamPathStyle = (delay: string): React.CSSProperties => ({
		animation: "steam-rise 2.4s ease-in-out infinite",
		animationDelay: delay,
	});

	return (
		<div className="w-16 h-16">
			<svg
				viewBox="0 0 64 64"
				xmlns="http://www.w3.org/2000/svg"
				style={{ animation: cupAnimation }}
				aria-hidden="true"
			>
				<g transform="translate(20, 4)">
					<path
						d="M4 14 C4 10, 0 9, 0 6 C0 3, 4 2, 4 0"
						stroke="#3D2B1F"
						strokeWidth={1.5}
						opacity={0.3}
						fill="none"
						strokeLinecap="round"
						style={steamPathStyle("0s")}
					/>
					<path
						d="M12 14 C12 10, 8 9, 8 6 C8 3, 12 2, 12 0"
						stroke="#3D2B1F"
						strokeWidth={1.5}
						opacity={0.3}
						fill="none"
						strokeLinecap="round"
						style={steamPathStyle("0.8s")}
					/>
					<path
						d="M20 14 C20 10, 16 9, 16 6 C16 3, 20 2, 20 0"
						stroke="#3D2B1F"
						strokeWidth={1.5}
						opacity={0.3}
						fill="none"
						strokeLinecap="round"
						style={steamPathStyle("1.6s")}
					/>
				</g>
				<ellipse cx="28" cy="56" rx="22" ry="4" fill="#3D2B1F" opacity={0.08} />
				<path
					d="M10 26 L12 50 C12 52 16 54 28 54 C40 54 44 52 44 50 L46 26 Z"
					fill="#5C4033"
					stroke="#3D2B1F"
					strokeWidth={1.5}
				/>
				<ellipse cx="28" cy="27" rx="17.5" ry="4" fill="#2C1810" />
				<ellipse cx="28" cy="26" rx="18" ry="4.5" fill="none" stroke="#3D2B1F" strokeWidth={1.5} />
				<path
					d="M16 30 L17 46"
					stroke="rgba(255,255,255,0.12)"
					strokeWidth={2}
					strokeLinecap="round"
				/>
				<path
					d="M46 30 C54 30, 56 36, 54 40 C52 44, 48 44, 46 42"
					fill="none"
					stroke="#3D2B1F"
					strokeWidth={1.5}
				/>
			</svg>
		</div>
	);
}
