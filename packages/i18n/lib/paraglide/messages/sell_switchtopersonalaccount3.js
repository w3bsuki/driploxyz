// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_sell_switchtopersonalaccount3 = /** @type {(inputs: {}) => string} */ () => {
	return `Превключи към личен акаунт`
};

const en_sell_switchtopersonalaccount3 = /** @type {(inputs: {}) => string} */ () => {
	return `Switch to Personal Account`
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
const sell_switchtopersonalaccount3 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.sell_switchtopersonalaccount3(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("sell_switchtopersonalaccount3", locale)
	if (locale === "bg") return bg_sell_switchtopersonalaccount3(inputs)
	return en_sell_switchtopersonalaccount3(inputs)
};
export { sell_switchtopersonalaccount3 as "sell_switchToPersonalAccount" }