// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_dashboard_completesetup1 = /** @type {(inputs: {}) => string} */ () => {
	return `Complete Setup`
};

const bg_dashboard_completesetup1 = /** @type {(inputs: {}) => string} */ () => {
	return `Завърши настройката`
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
const dashboard_completesetup1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.dashboard_completesetup1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("dashboard_completesetup1", locale)
	if (locale === "en") return en_dashboard_completesetup1(inputs)
	return bg_dashboard_completesetup1(inputs)
};
export { dashboard_completesetup1 as "dashboard_completeSetup" }