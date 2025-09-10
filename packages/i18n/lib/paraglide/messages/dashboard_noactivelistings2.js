// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_dashboard_noactivelistings2 = /** @type {(inputs: {}) => string} */ () => {
	return `Няма активни обяви`
};

const en_dashboard_noactivelistings2 = /** @type {(inputs: {}) => string} */ () => {
	return `No active listings`
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
const dashboard_noactivelistings2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.dashboard_noactivelistings2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("dashboard_noactivelistings2", locale)
	if (locale === "bg") return bg_dashboard_noactivelistings2(inputs)
	return en_dashboard_noactivelistings2(inputs)
};
export { dashboard_noactivelistings2 as "dashboard_noActiveListings" }