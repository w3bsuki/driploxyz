// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_sell_includes = /** @type {(inputs: {}) => string} */ () => {
	return `включва`
};

const en_sell_includes = /** @type {(inputs: {}) => string} */ () => {
	return `includes`
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
export const sell_includes = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.sell_includes(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("sell_includes", locale)
	if (locale === "bg") return bg_sell_includes(inputs)
	return en_sell_includes(inputs)
};