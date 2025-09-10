// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_notifications_unread = /** @type {(inputs: {}) => string} */ () => {
	return `непрочетени`
};

const en_notifications_unread = /** @type {(inputs: {}) => string} */ () => {
	return `unread`
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
export const notifications_unread = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.notifications_unread(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("notifications_unread", locale)
	if (locale === "bg") return bg_notifications_unread(inputs)
	return en_notifications_unread(inputs)
};