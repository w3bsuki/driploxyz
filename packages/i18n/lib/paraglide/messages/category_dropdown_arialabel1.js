// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_category_dropdown_arialabel1 = /** @type {(inputs: { selectedText: NonNullable<unknown> }) => string} */ (i) => {
	return `Филтър за категории: ${i.selectedText}. Натиснете Enter или стрелка надолу за отваряне.`
};

const en_category_dropdown_arialabel1 = /** @type {(inputs: { selectedText: NonNullable<unknown> }) => string} */ (i) => {
	return `Category filter: ${i.selectedText}. Press Enter or Arrow Down to open.`
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{ selectedText: NonNullable<unknown> }} inputs
* @param {{ locale?: "bg" | "en" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
const category_dropdown_arialabel1 = (inputs, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.category_dropdown_arialabel1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("category_dropdown_arialabel1", locale)
	if (locale === "bg") return bg_category_dropdown_arialabel1(inputs)
	return en_category_dropdown_arialabel1(inputs)
};
export { category_dropdown_arialabel1 as "category_dropdown_ariaLabel" }