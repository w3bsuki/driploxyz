// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_subcategory_carriers = /** @type {(inputs: {}) => string} */ () => {
	return `Carriers`
};

const bg_subcategory_carriers = /** @type {(inputs: {}) => string} */ () => {
	return `Преносими`
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
export const subcategory_carriers = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.subcategory_carriers(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("subcategory_carriers", locale)
	if (locale === "en") return en_subcategory_carriers(inputs)
	return bg_subcategory_carriers(inputs)
};