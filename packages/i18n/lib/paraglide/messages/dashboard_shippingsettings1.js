// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_dashboard_shippingsettings1 = /** @type {(inputs: {}) => string} */ () => {
	return `Shipping Settings`
};

const bg_dashboard_shippingsettings1 = /** @type {(inputs: {}) => string} */ () => {
	return `Настройки за доставка`
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
const dashboard_shippingsettings1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.dashboard_shippingsettings1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("dashboard_shippingsettings1", locale)
	if (locale === "en") return en_dashboard_shippingsettings1(inputs)
	return bg_dashboard_shippingsettings1(inputs)
};
export { dashboard_shippingsettings1 as "dashboard_shippingSettings" }