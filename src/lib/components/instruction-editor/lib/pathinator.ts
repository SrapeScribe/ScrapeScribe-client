export function getElementPath(element: HTMLElement): string {
	if (!element || element.nodeType !== Node.ELEMENT_NODE) {
		return '';
	}

	let path = [];
	let current: HTMLElement | null = element;

	while (current && current !== document.body && current !== document.documentElement) {
		let tag = current.tagName.toLowerCase();
		let parent = current.parentElement;

		if (parent) {
			let siblings = Array.from(parent.children).filter(child => child.tagName === current!.tagName);

			if (siblings.length > 1) {
				let index = siblings.indexOf(current) + 1;
				tag += `:nth-of-type(${index})`;
			}
		}

		path.unshift(tag);
		current = current.parentElement as HTMLElement;
	}

	if (path[0] === "html") {
		path.shift()
	}

	return path.join(' > ');
}