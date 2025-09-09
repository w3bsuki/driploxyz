// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_pdp_estimateddelivery1 = /** @type {(inputs: { date: NonNullable<unknown> }) => string} */ (i) => {
	return `Estimated delivery: ${i.date}`
};

const bg_pdp_estimateddelivery1 = /** @type {(inputs: { date: NonNullable<unknown> }) => string} */ (i) => {
	return `Очаквана доставка: ${i.date}`
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{ date: NonNullable<unknown> }} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
const pdp_estimateddelivery1 = (inputs, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.pdp_estimateddelivery1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("pdp_estimateddelivery1", locale)
	if (locale === "en") return en_pdp_estimateddelivery1(inputs)
	return bg_pdp_estimateddelivery1(inputs)
};
export { pdp_estimateddelivery1 as "pdp_estimatedDelivery" }