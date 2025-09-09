// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_nav_wishlist = /** @type {(inputs: {}) => string} */ () => {
	return `Wishlist`
};

const bg_nav_wishlist = /** @type {(inputs: {}) => string} */ () => {
	return `Любими`
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
export const nav_wishlist = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.nav_wishlist(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("nav_wishlist", locale)
	if (locale === "en") return en_nav_wishlist(inputs)
	return bg_nav_wishlist(inputs)
};