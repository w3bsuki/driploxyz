// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_admin_payoutsappearhere2 = /** @type {(inputs: {}) => string} */ () => {
	return `Payouts will appear here when ready for processing`
};

const bg_admin_payoutsappearhere2 = /** @type {(inputs: {}) => string} */ () => {
	return `Изплащанията ще се появят тук, когато са готови за обработка`
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
const admin_payoutsappearhere2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.admin_payoutsappearhere2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("admin_payoutsappearhere2", locale)
	if (locale === "en") return en_admin_payoutsappearhere2(inputs)
	return bg_admin_payoutsappearhere2(inputs)
};
export { admin_payoutsappearhere2 as "admin_payoutsAppearHere" }