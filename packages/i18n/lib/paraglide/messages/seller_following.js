// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_seller_following = /** @type {(inputs: {}) => string} */ () => {
	return `Following`
};

const bg_seller_following = /** @type {(inputs: {}) => string} */ () => {
	return `Следвате`
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
export const seller_following = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.seller_following(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("seller_following", locale)
	if (locale === "en") return en_seller_following(inputs)
	return bg_seller_following(inputs)
};