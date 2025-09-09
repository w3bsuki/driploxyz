// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_pdp_shippingfrom1 = /** @type {(inputs: { location: NonNullable<unknown> }) => string} */ (i) => {
	return `Ships from ${i.location}`
};

const bg_pdp_shippingfrom1 = /** @type {(inputs: { location: NonNullable<unknown> }) => string} */ (i) => {
	return `Изпраща се от ${i.location}`
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{ location: NonNullable<unknown> }} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
const pdp_shippingfrom1 = (inputs, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.pdp_shippingfrom1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("pdp_shippingfrom1", locale)
	if (locale === "en") return en_pdp_shippingfrom1(inputs)
	return bg_pdp_shippingfrom1(inputs)
};
export { pdp_shippingfrom1 as "pdp_shippingFrom" }