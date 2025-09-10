// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_dashboard_completeprofiledesc2 = /** @type {(inputs: {}) => string} */ () => {
	return `Трябва да завършите настройката на профила си, преди да получите достъп до таблото.`
};

const en_dashboard_completeprofiledesc2 = /** @type {(inputs: {}) => string} */ () => {
	return `You need to complete your profile setup before accessing the dashboard.`
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
const dashboard_completeprofiledesc2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.dashboard_completeprofiledesc2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("dashboard_completeprofiledesc2", locale)
	if (locale === "bg") return bg_dashboard_completeprofiledesc2(inputs)
	return en_dashboard_completeprofiledesc2(inputs)
};
export { dashboard_completeprofiledesc2 as "dashboard_completeProfileDesc" }