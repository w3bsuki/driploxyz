// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_sell_suggested = /** @type {(inputs: {}) => string} */ () => {
	return `Препоръчано`
};

const en_sell_suggested = /** @type {(inputs: {}) => string} */ () => {
	return `Suggested`
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
export const sell_suggested = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.sell_suggested(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("sell_suggested", locale)
	if (locale === "bg") return bg_sell_suggested(inputs)
	return en_sell_suggested(inputs)
};