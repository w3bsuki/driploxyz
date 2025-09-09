// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_pdp_a11y_productimage1 = /** @type {(inputs: { index: NonNullable<unknown>, total: NonNullable<unknown> }) => string} */ (i) => {
	return `Product image ${i.index} of ${i.total}`
};

const bg_pdp_a11y_productimage1 = /** @type {(inputs: { index: NonNullable<unknown>, total: NonNullable<unknown> }) => string} */ (i) => {
	return `Снимка на продукт ${i.index} от ${i.total}`
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{ index: NonNullable<unknown>, total: NonNullable<unknown> }} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
const pdp_a11y_productimage1 = (inputs, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.pdp_a11y_productimage1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("pdp_a11y_productimage1", locale)
	if (locale === "en") return en_pdp_a11y_productimage1(inputs)
	return bg_pdp_a11y_productimage1(inputs)
};
export { pdp_a11y_productimage1 as "pdp_a11y_productImage" }