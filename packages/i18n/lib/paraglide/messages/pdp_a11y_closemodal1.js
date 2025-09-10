// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_pdp_a11y_closemodal1 = /** @type {(inputs: {}) => string} */ () => {
	return `Затвори диалог`
};

const en_pdp_a11y_closemodal1 = /** @type {(inputs: {}) => string} */ () => {
	return `Close modal`
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
const pdp_a11y_closemodal1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.pdp_a11y_closemodal1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("pdp_a11y_closemodal1", locale)
	if (locale === "bg") return bg_pdp_a11y_closemodal1(inputs)
	return en_pdp_a11y_closemodal1(inputs)
};
export { pdp_a11y_closemodal1 as "pdp_a11y_closeModal" }