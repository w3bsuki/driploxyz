// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_notification_itemliked1 = /** @type {(inputs: {}) => string} */ () => {
	return `liked your item`
};

const bg_notification_itemliked1 = /** @type {(inputs: {}) => string} */ () => {
	return `хареса вашия артикул`
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
const notification_itemliked1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.notification_itemliked1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("notification_itemliked1", locale)
	if (locale === "en") return en_notification_itemliked1(inputs)
	return bg_notification_itemliked1(inputs)
};
export { notification_itemliked1 as "notification_itemLiked" }