// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_dashboard_processingtime3to5days2 = /** @type {(inputs: {}) => string} */ () => {
	return `3-5 business days`
};

const bg_dashboard_processingtime3to5days2 = /** @type {(inputs: {}) => string} */ () => {
	return `3-5 работни дни`
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
const dashboard_processingtime3to5days2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.dashboard_processingtime3to5days2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("dashboard_processingtime3to5days2", locale)
	if (locale === "en") return en_dashboard_processingtime3to5days2(inputs)
	return bg_dashboard_processingtime3to5days2(inputs)
};
export { dashboard_processingtime3to5days2 as "dashboard_processingTime3to5Days" }