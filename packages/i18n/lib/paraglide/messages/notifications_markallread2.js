// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_notifications_markallread2 = /** @type {(inputs: {}) => string} */ () => {
	return `Mark all read`
};

const bg_notifications_markallread2 = /** @type {(inputs: {}) => string} */ () => {
	return `Прочети всички`
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
const notifications_markallread2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.notifications_markallread2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("notifications_markallread2", locale)
	if (locale === "en") return en_notifications_markallread2(inputs)
	return bg_notifications_markallread2(inputs)
};
export { notifications_markallread2 as "notifications_markAllRead" }