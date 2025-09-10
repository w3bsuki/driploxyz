// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_seller_soldthisweek2 = /** @type {(inputs: {}) => string} */ () => {
	return `Продадени артикули тази седмица`
};

const en_seller_soldthisweek2 = /** @type {(inputs: {}) => string} */ () => {
	return `Sold items this week`
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
const seller_soldthisweek2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.seller_soldthisweek2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("seller_soldthisweek2", locale)
	if (locale === "bg") return bg_seller_soldthisweek2(inputs)
	return en_seller_soldthisweek2(inputs)
};
export { seller_soldthisweek2 as "seller_soldThisWeek" }