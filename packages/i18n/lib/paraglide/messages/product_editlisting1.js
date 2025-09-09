// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_product_editlisting1 = /** @type {(inputs: {}) => string} */ () => {
	return `Edit Listing`
};

const bg_product_editlisting1 = /** @type {(inputs: {}) => string} */ () => {
	return `Редактирай обява`
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
const product_editlisting1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.product_editlisting1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("product_editlisting1", locale)
	if (locale === "en") return en_product_editlisting1(inputs)
	return bg_product_editlisting1(inputs)
};
export { product_editlisting1 as "product_editListing" }