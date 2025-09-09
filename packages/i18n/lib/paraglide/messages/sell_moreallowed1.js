// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_sell_moreallowed1 = /** @type {(inputs: { count: NonNullable<unknown> }) => string} */ (i) => {
	return `${i.count} more allowed`
};

const bg_sell_moreallowed1 = /** @type {(inputs: { count: NonNullable<unknown> }) => string} */ (i) => {
	return `още ${i.count} позволени`
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{ count: NonNullable<unknown> }} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
const sell_moreallowed1 = (inputs, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.sell_moreallowed1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("sell_moreallowed1", locale)
	if (locale === "en") return en_sell_moreallowed1(inputs)
	return bg_sell_moreallowed1(inputs)
};
export { sell_moreallowed1 as "sell_moreAllowed" }