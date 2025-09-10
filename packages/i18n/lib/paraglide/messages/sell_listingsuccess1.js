// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_sell_listingsuccess1 = /** @type {(inputs: {}) => string} */ () => {
	return `Вашият артикул е публикуван!`
};

const en_sell_listingsuccess1 = /** @type {(inputs: {}) => string} */ () => {
	return `Your item is now live!`
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
const sell_listingsuccess1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.sell_listingsuccess1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("sell_listingsuccess1", locale)
	if (locale === "bg") return bg_sell_listingsuccess1(inputs)
	return en_sell_listingsuccess1(inputs)
};
export { sell_listingsuccess1 as "sell_listingSuccess" }