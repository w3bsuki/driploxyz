// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_onboarding_readydesc1 = /** @type {(inputs: {}) => string} */ () => {
	return `Complete your profile setup to start buying and selling. Your secure marketplace experience begins now.`
};

const bg_onboarding_readydesc1 = /** @type {(inputs: {}) => string} */ () => {
	return `Завършете настройката на вашия профил, за да започнете да купувате и продавате. Вашето сигурно пазарно изживяване започва сега.`
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
const onboarding_readydesc1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.onboarding_readydesc1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("onboarding_readydesc1", locale)
	if (locale === "en") return en_onboarding_readydesc1(inputs)
	return bg_onboarding_readydesc1(inputs)
};
export { onboarding_readydesc1 as "onboarding_readyDesc" }