// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_product_onesize1 = /** @type {(inputs: {}) => string} */ () => {
	return `One size`
};

const bg_product_onesize1 = /** @type {(inputs: {}) => string} */ () => {
	return `Един размер`
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
const product_onesize1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.product_onesize1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("product_onesize1", locale)
	if (locale === "en") return en_product_onesize1(inputs)
	return bg_product_onesize1(inputs)
};
export { product_onesize1 as "product_oneSize" }