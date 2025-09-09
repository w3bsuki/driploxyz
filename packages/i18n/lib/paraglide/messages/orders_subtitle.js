// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_orders_subtitle = /** @type {(inputs: {}) => string} */ () => {
	return `Track your purchases and sales in one place`
};

const bg_orders_subtitle = /** @type {(inputs: {}) => string} */ () => {
	return `Следете своите покупки и продажби на едно място`
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
export const orders_subtitle = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.orders_subtitle(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("orders_subtitle", locale)
	if (locale === "en") return en_orders_subtitle(inputs)
	return bg_orders_subtitle(inputs)
};