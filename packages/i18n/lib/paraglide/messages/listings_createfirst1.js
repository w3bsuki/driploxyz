// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_listings_createfirst1 = /** @type {(inputs: {}) => string} */ () => {
	return `Създай първата обява`
};

const en_listings_createfirst1 = /** @type {(inputs: {}) => string} */ () => {
	return `Create first listing`
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
const listings_createfirst1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.listings_createfirst1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("listings_createfirst1", locale)
	if (locale === "bg") return bg_listings_createfirst1(inputs)
	return en_listings_createfirst1(inputs)
};
export { listings_createfirst1 as "listings_createFirst" }