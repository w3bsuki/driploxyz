// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_messages_choosemessage1 = /** @type {(inputs: {}) => string} */ () => {
	return `Choose a message from the list to start chatting`
};

const bg_messages_choosemessage1 = /** @type {(inputs: {}) => string} */ () => {
	return `Избери съобщение от списъка за да започнеш чат`
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
const messages_choosemessage1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.messages_choosemessage1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("messages_choosemessage1", locale)
	if (locale === "en") return en_messages_choosemessage1(inputs)
	return bg_messages_choosemessage1(inputs)
};
export { messages_choosemessage1 as "messages_chooseMessage" }