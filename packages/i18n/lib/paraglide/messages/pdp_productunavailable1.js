// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_pdp_productunavailable1 = /** @type {(inputs: {}) => string} */ () => {
	return `This product is no longer available`
};

const bg_pdp_productunavailable1 = /** @type {(inputs: {}) => string} */ () => {
	return `Този продукт вече не е наличен`
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
const pdp_productunavailable1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.pdp_productunavailable1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("pdp_productunavailable1", locale)
	if (locale === "en") return en_pdp_productunavailable1(inputs)
	return bg_pdp_productunavailable1(inputs)
};
export { pdp_productunavailable1 as "pdp_productUnavailable" }