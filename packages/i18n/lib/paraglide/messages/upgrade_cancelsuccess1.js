// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_upgrade_cancelsuccess1 = /** @type {(inputs: {}) => string} */ () => {
	return `Subscription canceled successfully. It will remain active until the end of your billing period.`
};

const bg_upgrade_cancelsuccess1 = /** @type {(inputs: {}) => string} */ () => {
	return `Абонаментът е отказан успешно. Ще остане активен до края на периода ви на фактуриране.`
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
const upgrade_cancelsuccess1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.upgrade_cancelsuccess1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("upgrade_cancelsuccess1", locale)
	if (locale === "en") return en_upgrade_cancelsuccess1(inputs)
	return bg_upgrade_cancelsuccess1(inputs)
};
export { upgrade_cancelsuccess1 as "upgrade_cancelSuccess" }