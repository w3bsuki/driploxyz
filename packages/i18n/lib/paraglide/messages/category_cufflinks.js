// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_category_cufflinks = /** @type {(inputs: {}) => string} */ () => {
	return `Ръкавели`
};

const en_category_cufflinks = /** @type {(inputs: {}) => string} */ () => {
	return `Cufflinks`
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
export const category_cufflinks = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.category_cufflinks(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("category_cufflinks", locale)
	if (locale === "bg") return bg_category_cufflinks(inputs)
	return en_category_cufflinks(inputs)
};