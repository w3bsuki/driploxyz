// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_subcategory_tops = /** @type {(inputs: {}) => string} */ () => {
	return `Топове`
};

const en_subcategory_tops = /** @type {(inputs: {}) => string} */ () => {
	return `Tops`
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
export const subcategory_tops = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.subcategory_tops(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("subcategory_tops", locale)
	if (locale === "bg") return bg_subcategory_tops(inputs)
	return en_subcategory_tops(inputs)
};