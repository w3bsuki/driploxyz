// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_listings_manageproducts1 = /** @type {(inputs: {}) => string} */ () => {
	return `Manage your products`
};

const bg_listings_manageproducts1 = /** @type {(inputs: {}) => string} */ () => {
	return `Управлявайте продуктите си`
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
const listings_manageproducts1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.listings_manageproducts1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("listings_manageproducts1", locale)
	if (locale === "en") return en_listings_manageproducts1(inputs)
	return bg_listings_manageproducts1(inputs)
};
export { listings_manageproducts1 as "listings_manageProducts" }