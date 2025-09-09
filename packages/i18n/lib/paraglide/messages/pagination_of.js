// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_pagination_of = /** @type {(inputs: {}) => string} */ () => {
	return `of`
};

const bg_pagination_of = /** @type {(inputs: {}) => string} */ () => {
	return `от`
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
export const pagination_of = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.pagination_of(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("pagination_of", locale)
	if (locale === "en") return en_pagination_of(inputs)
	return bg_pagination_of(inputs)
};