// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_onboarding_profilecomplete1 = /** @type {(inputs: {}) => string} */ () => {
	return `Your profile is now complete and verified. You're ready to start buying and selling amazing fashion items!`
};

const bg_onboarding_profilecomplete1 = /** @type {(inputs: {}) => string} */ () => {
	return `Вашият профил е завършен и потвърден. Готови сте да започнете да купувате и продавате невероятни модни артикули!`
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
const onboarding_profilecomplete1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.onboarding_profilecomplete1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("onboarding_profilecomplete1", locale)
	if (locale === "en") return en_onboarding_profilecomplete1(inputs)
	return bg_onboarding_profilecomplete1(inputs)
};
export { onboarding_profilecomplete1 as "onboarding_profileComplete" }