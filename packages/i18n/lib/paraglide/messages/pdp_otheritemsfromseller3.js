// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_pdp_otheritemsfromseller3 = /** @type {(inputs: {}) => string} */ () => {
	return `Други артикули от този продавач`
};

const en_pdp_otheritemsfromseller3 = /** @type {(inputs: {}) => string} */ () => {
	return `Other items from this seller`
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
* @param {{ locale?: "bg" | "en" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
const pdp_otheritemsfromseller3 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.pdp_otheritemsfromseller3(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("pdp_otheritemsfromseller3", locale)
	if (locale === "bg") return bg_pdp_otheritemsfromseller3(inputs)
	return en_pdp_otheritemsfromseller3(inputs)
};
export { pdp_otheritemsfromseller3 as "pdp_otherItemsFromSeller" }