// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_notification_offerreceived1 = /** @type {(inputs: {}) => string} */ () => {
	return `Получихте оферта`
};

const en_notification_offerreceived1 = /** @type {(inputs: {}) => string} */ () => {
	return `You received an offer`
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
const notification_offerreceived1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.notification_offerreceived1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("notification_offerreceived1", locale)
	if (locale === "bg") return bg_notification_offerreceived1(inputs)
	return en_notification_offerreceived1(inputs)
};
export { notification_offerreceived1 as "notification_offerReceived" }