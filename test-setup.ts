import { JSDOM } from "jsdom";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
	url: "http://localhost:3000",
	pretendToBeVisual: true,
});

const domGlobals = [
	"window",
	"document",
	"navigator",
	"HTMLElement",
	"HTMLInputElement",
	"HTMLButtonElement",
	"HTMLDivElement",
	"HTMLFormElement",
	"HTMLAnchorElement",
	"HTMLSpanElement",
	"HTMLParagraphElement",
	"Element",
	"Node",
	"Text",
	"Event",
	"MouseEvent",
	"KeyboardEvent",
	"InputEvent",
	"FocusEvent",
	"CustomEvent",
	"MutationObserver",
	"getComputedStyle",
	"requestAnimationFrame",
	"cancelAnimationFrame",
	"SVGElement",
	"DocumentFragment",
	"DOMParser",
	"NodeList",
	"HTMLCollection",
	"NodeFilter",
	"TreeWalker",
	"Range",
] as const;

for (const key of domGlobals) {
	if (key in dom.window && !(key in globalThis)) {
		Object.defineProperty(globalThis, key, {
			value: (dom.window as unknown as Record<string, unknown>)[key],
			writable: true,
			configurable: true,
		});
	}
}
