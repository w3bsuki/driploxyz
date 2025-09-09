// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_sell_shippingrequired1 = /** @type {(inputs: {}) => string} */ () => {
	return `Shipping cost is required`
};

const bg_sell_shippingrequired1 = /** @type {(inputs: {}) => string} */ () => {
	return `Цената за доставка е задължителна`
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
const sell_shippingrequired1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.sell_shippingrequired1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("sell_shippingrequired1", locale)
	if (locale === "en") return en_sell_shippingrequired1(inputs)
	return bg_sell_shippingrequired1(inputs)
};
export { sell_shippingrequired1 as "sell_shippingRequired" }