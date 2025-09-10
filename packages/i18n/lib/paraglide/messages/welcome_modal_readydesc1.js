// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_welcome_modal_readydesc1 = /** @type {(inputs: {}) => string} */ () => {
	return `Довършете настройката на профила си, за да започнете да купувате и продавате. Сигурното ви пазарно изживяване започва сега.`
};

const en_welcome_modal_readydesc1 = /** @type {(inputs: {}) => string} */ () => {
	return `Complete your profile setup to start buying and selling. Your secure marketplace experience begins now.`
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
const welcome_modal_readydesc1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.welcome_modal_readydesc1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("welcome_modal_readydesc1", locale)
	if (locale === "bg") return bg_welcome_modal_readydesc1(inputs)
	return en_welcome_modal_readydesc1(inputs)
};
export { welcome_modal_readydesc1 as "welcome_modal_readyDesc" }