// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_sell_listitem1 = /** @type {(inputs: {}) => string} */ () => {
	return `Публикувай артикул`
};

const en_sell_listitem1 = /** @type {(inputs: {}) => string} */ () => {
	return `List an Item`
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
const sell_listitem1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.sell_listitem1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("sell_listitem1", locale)
	if (locale === "bg") return bg_sell_listitem1(inputs)
	return en_sell_listitem1(inputs)
};
export { sell_listitem1 as "sell_listItem" }