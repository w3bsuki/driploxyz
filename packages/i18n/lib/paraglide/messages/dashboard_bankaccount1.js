// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_dashboard_bankaccount1 = /** @type {(inputs: {}) => string} */ () => {
	return `Bank Account`
};

const bg_dashboard_bankaccount1 = /** @type {(inputs: {}) => string} */ () => {
	return `Банкова сметка`
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
const dashboard_bankaccount1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.dashboard_bankaccount1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("dashboard_bankaccount1", locale)
	if (locale === "en") return en_dashboard_bankaccount1(inputs)
	return bg_dashboard_bankaccount1(inputs)
};
export { dashboard_bankaccount1 as "dashboard_bankAccount" }