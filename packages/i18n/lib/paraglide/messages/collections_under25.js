// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_collections_under25 = /** @type {(inputs: {}) => string} */ () => {
	return `До 25 лв`
};

const en_collections_under25 = /** @type {(inputs: {}) => string} */ () => {
	return `Under 25`
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
* @param {{ locale?: "bg" | "en" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
export const collections_under25 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.collections_under25(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("collections_under25", locale)
	if (locale === "bg") return bg_collections_under25(inputs)
	return en_collections_under25(inputs)
};