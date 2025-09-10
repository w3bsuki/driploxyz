// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_dashboard_ordermanagement1 = /** @type {(inputs: {}) => string} */ () => {
	return `Управление на поръчки`
};

const en_dashboard_ordermanagement1 = /** @type {(inputs: {}) => string} */ () => {
	return `Manage Orders`
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
const dashboard_ordermanagement1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.dashboard_ordermanagement1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("dashboard_ordermanagement1", locale)
	if (locale === "bg") return bg_dashboard_ordermanagement1(inputs)
	return en_dashboard_ordermanagement1(inputs)
};
export { dashboard_ordermanagement1 as "dashboard_orderManagement" }