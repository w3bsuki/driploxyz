// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_seller_viewfullprofile2 = /** @type {(inputs: {}) => string} */ () => {
	return `Виж профил`
};

const en_seller_viewfullprofile2 = /** @type {(inputs: {}) => string} */ () => {
	return `View full profile`
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
const seller_viewfullprofile2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.seller_viewfullprofile2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("seller_viewfullprofile2", locale)
	if (locale === "bg") return bg_seller_viewfullprofile2(inputs)
	return en_seller_viewfullprofile2(inputs)
};
export { seller_viewfullprofile2 as "seller_viewFullProfile" }