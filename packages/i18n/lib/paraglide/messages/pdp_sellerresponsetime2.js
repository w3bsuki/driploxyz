// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_pdp_sellerresponsetime2 = /** @type {(inputs: { time: NonNullable<unknown> }) => string} */ (i) => {
	return `Response time: ${i.time}`
};

const bg_pdp_sellerresponsetime2 = /** @type {(inputs: { time: NonNullable<unknown> }) => string} */ (i) => {
	return `Време за отговор: ${i.time}`
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{ time: NonNullable<unknown> }} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
const pdp_sellerresponsetime2 = (inputs, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.pdp_sellerresponsetime2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("pdp_sellerresponsetime2", locale)
	if (locale === "en") return en_pdp_sellerresponsetime2(inputs)
	return bg_pdp_sellerresponsetime2(inputs)
};
export { pdp_sellerresponsetime2 as "pdp_sellerResponseTime" }