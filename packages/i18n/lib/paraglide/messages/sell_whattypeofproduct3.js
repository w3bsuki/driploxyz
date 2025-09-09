// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_sell_whattypeofproduct3 = /** @type {(inputs: {}) => string} */ () => {
	return `What type of product?`
};

const bg_sell_whattypeofproduct3 = /** @type {(inputs: {}) => string} */ () => {
	return `Какъв тип продукт?`
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
const sell_whattypeofproduct3 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.sell_whattypeofproduct3(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("sell_whattypeofproduct3", locale)
	if (locale === "en") return en_sell_whattypeofproduct3(inputs)
	return bg_sell_whattypeofproduct3(inputs)
};
export { sell_whattypeofproduct3 as "sell_whatTypeOfProduct" }