// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_dashboard_daysago1 = /** @type {(inputs: { days: NonNullable<unknown> }) => string} */ (i) => {
	return `${i.days}d ago`
};

const bg_dashboard_daysago1 = /** @type {(inputs: { days: NonNullable<unknown> }) => string} */ (i) => {
	return `преди ${i.days} дн`
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{ days: NonNullable<unknown> }} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
const dashboard_daysago1 = (inputs, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.dashboard_daysago1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("dashboard_daysago1", locale)
	if (locale === "en") return en_dashboard_daysago1(inputs)
	return bg_dashboard_daysago1(inputs)
};
export { dashboard_daysago1 as "dashboard_daysAgo" }