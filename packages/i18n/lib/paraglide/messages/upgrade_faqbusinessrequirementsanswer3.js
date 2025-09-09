// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_upgrade_faqbusinessrequirementsanswer3 = /** @type {(inputs: {}) => string} */ () => {
	return `Yes, business accounts require an active Brand subscription to comply with marketplace policies and verification.`
};

const bg_upgrade_faqbusinessrequirementsanswer3 = /** @type {(inputs: {}) => string} */ () => {
	return `Да, бизнес профилите изискват активен Бранд абонамент за съответствие с правилата на пазара и верификацията.`
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
const upgrade_faqbusinessrequirementsanswer3 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.upgrade_faqbusinessrequirementsanswer3(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("upgrade_faqbusinessrequirementsanswer3", locale)
	if (locale === "en") return en_upgrade_faqbusinessrequirementsanswer3(inputs)
	return bg_upgrade_faqbusinessrequirementsanswer3(inputs)
};
export { upgrade_faqbusinessrequirementsanswer3 as "upgrade_faqBusinessRequirementsAnswer" }