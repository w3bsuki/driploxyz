// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_upgrade_faqremainingboostsanswer3 = /** @type {(inputs: {}) => string} */ () => {
	return `Your active boosted ads continue until they expire, but you can't create new ones after canceling Premium.`
};

const bg_upgrade_faqremainingboostsanswer3 = /** @type {(inputs: {}) => string} */ () => {
	return `Активните ви повишени обяви продължават до изтичането им, но не можете да създавате нови след отказване на Премиум.`
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
const upgrade_faqremainingboostsanswer3 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.upgrade_faqremainingboostsanswer3(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("upgrade_faqremainingboostsanswer3", locale)
	if (locale === "en") return en_upgrade_faqremainingboostsanswer3(inputs)
	return bg_upgrade_faqremainingboostsanswer3(inputs)
};
export { upgrade_faqremainingboostsanswer3 as "upgrade_faqRemainingBoostsAnswer" }