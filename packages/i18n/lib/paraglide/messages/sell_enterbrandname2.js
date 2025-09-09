// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_sell_enterbrandname2 = /** @type {(inputs: {}) => string} */ () => {
	return `Enter brand name`
};

const bg_sell_enterbrandname2 = /** @type {(inputs: {}) => string} */ () => {
	return `Въведете име на марка`
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
const sell_enterbrandname2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.sell_enterbrandname2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("sell_enterbrandname2", locale)
	if (locale === "en") return en_sell_enterbrandname2(inputs)
	return bg_sell_enterbrandname2(inputs)
};
export { sell_enterbrandname2 as "sell_enterBrandName" }