import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {type HTTPMethod, type Instructions, type Scheme, SchemeType} from "$lib/interfaces"
import {METHOD_STYLES} from "$lib/constants"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export const getMethodStyle = (method: string) =>
	METHOD_STYLES[method as HTTPMethod] || "bg-gray-300 text-black";

export function cleanJsonString(str: string): string {
	return str.replace(/,(\s*[}\]])/g, '$1');
}

/**
 * Create empty instructions structure
 */
export function createEmptyInstructions(): { url: string; scheme: { type: SchemeType; fields: any[] } } {
	return {
		url: '',
		scheme: {
			type: 'OBJECT' as SchemeType,
			fields: []
		}
	};
}

/**
 * Deep clone an object to avoid reference issues
 */
export function deepClone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}

/**
 * Format time elapsed since a given date
 */
export function formatTimeSince(date: Date | null): string {
	if (!date) return "Never saved";

	const now = new Date();
	const diffMs = now.getTime() - date.getTime();

	// Less than a minute
	if (diffMs < 60000) {
		return "Just now";
	}

	// Less than an hour
	if (diffMs < 3600000) {
		const minutes = Math.floor(diffMs / 60000);
		return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
	}

	// Format as time
	return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Safely update a nested field within instructions without
 * causing unexpected state updates in other parts
 */
export function updateSchemeField(
	schema: Scheme,
	path: string[],
	value: any
): Scheme {
	// Clone to avoid reference issues
	const newSchema = deepClone(schema);

	// Base case: direct update
	if (path.length === 0) {
		return value;
	}

	let current: any = newSchema;
	const lastKey = path[path.length - 1];

	// Navigate to the parent of the field to update
	for (let i = 0; i < path.length - 1; i++) {
		const key = path[i];

		// Special case for array indices
		if (!isNaN(Number(key))) {
			const index = Number(key);
			if (!Array.isArray(current)) {
				throw new Error(`Expected array at path segment ${key}`);
			}
			if (index >= current.length) {
				throw new Error(`Array index out of bounds: ${index}`);
			}
			current = current[index];
		} else {
			// Object property navigation
			if (current[key] === undefined) {
				current[key] = {};
			}
			current = current[key];
		}
	}

	// Update the target field
	current[lastKey] = value;

	return newSchema;
}
