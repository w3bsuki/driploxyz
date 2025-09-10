// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_dashboard_pleaselogin1 = /** @type {(inputs: {}) => string} */ () => {
	return `Моля, влезте, за да получите достъп до вашата табло`
};

const en_dashboard_pleaselogin1 = /** @type {(inputs: {}) => string} */ () => {
	return `Please log in to access your dashboard`
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
const dashboard_pleaselogin1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.dashboard_pleaselogin1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("dashboard_pleaselogin1", locale)
	if (locale === "bg") return bg_dashboard_pleaselogin1(inputs)
	return en_dashboard_pleaselogin1(inputs)
};
export { dashboard_pleaselogin1 as "dashboard_pleaseLogin" }