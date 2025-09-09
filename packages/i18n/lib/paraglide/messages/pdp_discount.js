// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_pdp_discount = /** @type {(inputs: { percent: NonNullable<unknown> }) => string} */ (i) => {
	return `${i.percent}% off`
};

const bg_pdp_discount = /** @type {(inputs: { percent: NonNullable<unknown> }) => string} */ (i) => {
	return `${i.percent}% отстъпка`
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{ percent: NonNullable<unknown> }} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
export const pdp_discount = (inputs, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.pdp_discount(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("pdp_discount", locale)
	if (locale === "en") return en_pdp_discount(inputs)
	return bg_pdp_discount(inputs)
};