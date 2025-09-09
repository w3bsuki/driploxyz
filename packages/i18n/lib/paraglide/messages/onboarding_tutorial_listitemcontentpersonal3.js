// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_onboarding_tutorial_listitemcontentpersonal3 = /** @type {(inputs: {}) => string} */ () => {
	return `Ready to sell? Click the '+' button to upload your first item. Add quality photos and honest descriptions.`
};

const bg_onboarding_tutorial_listitemcontentpersonal3 = /** @type {(inputs: {}) => string} */ () => {
	return `Готови за продажба? Кликнете бутона '+' за да качите първия си артикул. Добавете качествени снимки и честни описания.`
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
const onboarding_tutorial_listitemcontentpersonal3 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.onboarding_tutorial_listitemcontentpersonal3(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("onboarding_tutorial_listitemcontentpersonal3", locale)
	if (locale === "en") return en_onboarding_tutorial_listitemcontentpersonal3(inputs)
	return bg_onboarding_tutorial_listitemcontentpersonal3(inputs)
};
export { onboarding_tutorial_listitemcontentpersonal3 as "onboarding_tutorial_listItemContentPersonal" }