// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_breadcrumb_sales = /** @type {(inputs: {}) => string} */ () => {
	return `Продажби`
};

const en_breadcrumb_sales = /** @type {(inputs: {}) => string} */ () => {
	return `Sales`
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
export const breadcrumb_sales = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.breadcrumb_sales(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("breadcrumb_sales", locale)
	if (locale === "bg") return bg_breadcrumb_sales(inputs)
	return en_breadcrumb_sales(inputs)
};