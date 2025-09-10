// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_settings_emailnotifications1 = /** @type {(inputs: {}) => string} */ () => {
	return `Имейл известия`
};

const en_settings_emailnotifications1 = /** @type {(inputs: {}) => string} */ () => {
	return `Email notifications`
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
const settings_emailnotifications1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.settings_emailnotifications1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("settings_emailnotifications1", locale)
	if (locale === "bg") return bg_settings_emailnotifications1(inputs)
	return en_settings_emailnotifications1(inputs)
};
export { settings_emailnotifications1 as "settings_emailNotifications" }