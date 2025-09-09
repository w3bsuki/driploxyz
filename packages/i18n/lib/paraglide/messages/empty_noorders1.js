// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_empty_noorders1 = /** @type {(inputs: {}) => string} */ () => {
	return `No orders yet`
};

const bg_empty_noorders1 = /** @type {(inputs: {}) => string} */ () => {
	return `Няма поръчки още`
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
const empty_noorders1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.empty_noorders1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("empty_noorders1", locale)
	if (locale === "en") return en_empty_noorders1(inputs)
	return bg_empty_noorders1(inputs)
};
export { empty_noorders1 as "empty_noOrders" }