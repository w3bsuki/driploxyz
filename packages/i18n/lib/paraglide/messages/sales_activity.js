// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_sales_activity = /** @type {(inputs: {}) => string} */ () => {
	return `Продажна активност`
};

const en_sales_activity = /** @type {(inputs: {}) => string} */ () => {
	return `Sales Activity`
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
export const sales_activity = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.sales_activity(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("sales_activity", locale)
	if (locale === "bg") return bg_sales_activity(inputs)
	return en_sales_activity(inputs)
};