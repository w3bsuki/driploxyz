// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_pdp_hoursago1 = /** @type {(inputs: { count: NonNullable<unknown> }) => string} */ (i) => {
	return `${i.count}ч назад`
};

const en_pdp_hoursago1 = /** @type {(inputs: { count: NonNullable<unknown> }) => string} */ (i) => {
	return `${i.count}h ago`
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{ count: NonNullable<unknown> }} inputs
* @param {{ locale?: "bg" | "en" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
const pdp_hoursago1 = (inputs, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.pdp_hoursago1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("pdp_hoursago1", locale)
	if (locale === "bg") return bg_pdp_hoursago1(inputs)
	return en_pdp_hoursago1(inputs)
};
export { pdp_hoursago1 as "pdp_hoursAgo" }