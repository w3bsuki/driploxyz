// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_pdp_soldby1 = /** @type {(inputs: { sellerName: NonNullable<unknown> }) => string} */ (i) => {
	return `Продавано от ${i.sellerName}`
};

const en_pdp_soldby1 = /** @type {(inputs: { sellerName: NonNullable<unknown> }) => string} */ (i) => {
	return `Sold by ${i.sellerName}`
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{ sellerName: NonNullable<unknown> }} inputs
* @param {{ locale?: "bg" | "en" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
const pdp_soldby1 = (inputs, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.pdp_soldby1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("pdp_soldby1", locale)
	if (locale === "bg") return bg_pdp_soldby1(inputs)
	return en_pdp_soldby1(inputs)
};
export { pdp_soldby1 as "pdp_soldBy" }