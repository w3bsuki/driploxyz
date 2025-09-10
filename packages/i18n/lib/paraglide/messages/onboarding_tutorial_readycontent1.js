// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_onboarding_tutorial_readycontent1 = /** @type {(inputs: {}) => string} */ () => {
	return `Проверете таблото си за вашите обяви, съобщения и настройки на акаунта. Приятна търговия!`
};

const en_onboarding_tutorial_readycontent1 = /** @type {(inputs: {}) => string} */ () => {
	return `Check your dashboard for your listings, messages, and account settings. Happy trading!`
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
const onboarding_tutorial_readycontent1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.onboarding_tutorial_readycontent1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("onboarding_tutorial_readycontent1", locale)
	if (locale === "bg") return bg_onboarding_tutorial_readycontent1(inputs)
	return en_onboarding_tutorial_readycontent1(inputs)
};
export { onboarding_tutorial_readycontent1 as "onboarding_tutorial_readyContent" }