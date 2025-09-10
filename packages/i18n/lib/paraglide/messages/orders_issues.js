// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_orders_issues = /** @type {(inputs: {}) => string} */ () => {
	return `Проблеми`
};

const en_orders_issues = /** @type {(inputs: {}) => string} */ () => {
	return `Issues`
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
export const orders_issues = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.orders_issues(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("orders_issues", locale)
	if (locale === "bg") return bg_orders_issues(inputs)
	return en_orders_issues(inputs)
};