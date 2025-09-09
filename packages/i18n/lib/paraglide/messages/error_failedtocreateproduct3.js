// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_error_failedtocreateproduct3 = /** @type {(inputs: {}) => string} */ () => {
	return `Failed to create product`
};

const bg_error_failedtocreateproduct3 = /** @type {(inputs: {}) => string} */ () => {
	return `Неуспешно създаване на продукт`
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
const error_failedtocreateproduct3 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.error_failedtocreateproduct3(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("error_failedtocreateproduct3", locale)
	if (locale === "en") return en_error_failedtocreateproduct3(inputs)
	return bg_error_failedtocreateproduct3(inputs)
};
export { error_failedtocreateproduct3 as "error_failedToCreateProduct" }