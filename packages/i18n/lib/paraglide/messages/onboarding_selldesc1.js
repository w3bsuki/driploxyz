// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_onboarding_selldesc1 = /** @type {(inputs: {}) => string} */ () => {
	return `List your items quickly with our simple tools. Secure payments, buyer protection, and transparent fees.`
};

const bg_onboarding_selldesc1 = /** @type {(inputs: {}) => string} */ () => {
	return `Листвайте вашите артикули бързо с нашите прости инструменти. Сигурни плащания, защита на купувача и прозрачни такси.`
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
const onboarding_selldesc1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.onboarding_selldesc1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("onboarding_selldesc1", locale)
	if (locale === "en") return en_onboarding_selldesc1(inputs)
	return bg_onboarding_selldesc1(inputs)
};
export { onboarding_selldesc1 as "onboarding_sellDesc" }