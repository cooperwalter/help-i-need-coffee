import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-[#FFF6EC]">
			<h1 className="font-['Fraunces'] text-4xl italic text-[#2C1810]">help, i need coffee</h1>
		</div>
	);
}
