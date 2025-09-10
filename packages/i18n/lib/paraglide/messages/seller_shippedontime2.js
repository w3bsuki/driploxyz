// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_seller_shippedontime2 = /** @type {(inputs: {}) => string} */ () => {
	return `от поръчките изпратени навреме`
};

const en_seller_shippedontime2 = /** @type {(inputs: {}) => string} */ () => {
	return `of orders shipped on time`
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
const seller_shippedontime2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.seller_shippedontime2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("seller_shippedontime2", locale)
	if (locale === "bg") return bg_seller_shippedontime2(inputs)
	return en_seller_shippedontime2(inputs)
};
export { seller_shippedontime2 as "seller_shippedOnTime" }