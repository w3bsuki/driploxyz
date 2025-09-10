// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_onboarding_brandprofilecomplete2 = /** @type {(inputs: {}) => string} */ () => {
	return `Вашият брандов профил е настроен! За да активирате пълните брандови функции и значката за потвърждение, трябва да се абонирате за нашия Brand план от вашия dashboard.`
};

const en_onboarding_brandprofilecomplete2 = /** @type {(inputs: {}) => string} */ () => {
	return `Your brand profile is set up! To activate full brand features and verification badge, you'll need to subscribe to our Brand plan from your dashboard.`
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
const onboarding_brandprofilecomplete2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.onboarding_brandprofilecomplete2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("onboarding_brandprofilecomplete2", locale)
	if (locale === "bg") return bg_onboarding_brandprofilecomplete2(inputs)
	return en_onboarding_brandprofilecomplete2(inputs)
};
export { onboarding_brandprofilecomplete2 as "onboarding_brandProfileComplete" }