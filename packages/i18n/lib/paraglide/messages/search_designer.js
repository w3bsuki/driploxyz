// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_search_designer = /** @type {(inputs: {}) => string} */ () => {
	return `Designer`
};

const bg_search_designer = /** @type {(inputs: {}) => string} */ () => {
	return `Дизайнерски`
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{}} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
export const search_designer = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.search_designer(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("search_designer", locale)
	if (locale === "en") return en_search_designer(inputs)
	return bg_search_designer(inputs)
};