// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_notification_newfollower1 = /** @type {(inputs: {}) => string} */ () => {
	return `started following you`
};

const bg_notification_newfollower1 = /** @type {(inputs: {}) => string} */ () => {
	return `започна да ви следва`
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
const notification_newfollower1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.notification_newfollower1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("notification_newfollower1", locale)
	if (locale === "en") return en_notification_newfollower1(inputs)
	return bg_notification_newfollower1(inputs)
};
export { notification_newfollower1 as "notification_newFollower" }