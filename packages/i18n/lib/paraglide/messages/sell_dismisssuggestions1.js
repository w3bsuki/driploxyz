// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_sell_dismisssuggestions1 = /** @type {(inputs: {}) => string} */ () => {
	return `Dismiss suggestions`
};

const bg_sell_dismisssuggestions1 = /** @type {(inputs: {}) => string} */ () => {
	return `Отхвърли предложенията`
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
const sell_dismisssuggestions1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.sell_dismisssuggestions1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("sell_dismisssuggestions1", locale)
	if (locale === "en") return en_sell_dismisssuggestions1(inputs)
	return bg_sell_dismisssuggestions1(inputs)
};
export { sell_dismisssuggestions1 as "sell_dismissSuggestions" }