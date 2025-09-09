// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_dashboard_age18to24 = /** @type {(inputs: {}) => string} */ () => {
	return `Age 18-24`
};

const bg_dashboard_age18to24 = /** @type {(inputs: {}) => string} */ () => {
	return `Възраст 18-24`
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
export const dashboard_age18to24 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.dashboard_age18to24(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("dashboard_age18to24", locale)
	if (locale === "en") return en_dashboard_age18to24(inputs)
	return bg_dashboard_age18to24(inputs)
};