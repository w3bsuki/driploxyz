// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_upgrade_faqchangeplansanswer3 = /** @type {(inputs: {}) => string} */ () => {
	return `Абсолютно! Надграждайте, понижавайте или отказвайте абонамента си по всяко време. Промените влизат в сила при следващия ви цикъл на фактуриране.`
};

const en_upgrade_faqchangeplansanswer3 = /** @type {(inputs: {}) => string} */ () => {
	return `Absolutely! Upgrade, downgrade, or cancel your subscription anytime. Changes take effect at your next billing cycle.`
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
const upgrade_faqchangeplansanswer3 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.upgrade_faqchangeplansanswer3(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("upgrade_faqchangeplansanswer3", locale)
	if (locale === "bg") return bg_upgrade_faqchangeplansanswer3(inputs)
	return en_upgrade_faqchangeplansanswer3(inputs)
};
export { upgrade_faqchangeplansanswer3 as "upgrade_faqChangePlansAnswer" }