import {type HTTPMethod, METHOD_STYLES} from "$lib/constants"

/**
 * Capitalize the first letter of a string
 * @param str
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a string to a URL-friendly slug
 * @param text Input string to convert to slug
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
	return text.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")           // Replace spaces with hyphens
		.replace(/[^a-z0-9-]/g, "")     // Remove any non-alphanumeric chars except hyphens
		.replace(/-+/g, "-")            // Replace multiple hyphens with single hyphen
		.replace(/^-|-$/g, "");         // Remove leading and trailing hyphens
}

/**
 * Get the style for an HTTP method badge
 * @param method HTTP method
 * @returns Style for the badge
 */
export const getMethodStyle = (method: string) =>
	METHOD_STYLES[method as HTTPMethod] || "bg-gray-300 text-black";

/**
 * Clean JSON string by removing trailing commas
 * @param jsonString JSON string to clean
 * @returns Cleaned JSON string
 */
export function cleanJsonString(jsonString: string): string {
	// Remove trailing commas from objects and arrays
	return jsonString.replace(/,(\s*[}\]])/g, '$1');
}

/**
 * Merge CSS class names conditionally
 * @param inputs Class names or conditions
 * @returns Merged class names
 */
export function cn(...inputs: (string | boolean | undefined | null)[]): string {
	return inputs.filter(Boolean).join(' ');
}

/**
 * Format date to a readable string
 * @param date Date to format
 * @param options Format options
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
	const dateObj = typeof date === 'string' ? new Date(date) : date;

	const defaultOptions: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		...options
	};

	return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
}

/**
 * Truncate a string to a maximum length
 * @param str String to truncate
 * @param maxLength Maximum length
 * @param suffix Suffix to add when truncated (default: "...")
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength: number, suffix: string = '...'): string {
	if (str.length <= maxLength) return str;
	return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Delay execution for specified milliseconds
 * @param ms Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export function delay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}
