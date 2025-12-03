/**
 * Age Verification Store
 * 
 * Manages age verification state across the application
 * Uses localStorage to persist verification status
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const AGE_VERIFICATION_KEY = 'driplo_age_verified';
const VERIFICATION_EXPIRY_DAYS = 30;

interface AgeVerificationState {
	isVerified: boolean;
	verifiedAt: string | null;
	isChecking: boolean;
}

function createAgeVerificationStore() {
	const initialState: AgeVerificationState = {
		isVerified: false,
		verifiedAt: null,
		isChecking: true
	};

	const { subscribe, set, update } = writable<AgeVerificationState>(initialState);

	// Check localStorage for existing verification
	function checkExistingVerification(): boolean {
		if (!browser) return false;

		try {
			const stored = localStorage.getItem(AGE_VERIFICATION_KEY);
			if (!stored) return false;

			const data = JSON.parse(stored);
			const verifiedAt = new Date(data.verifiedAt);
			const now = new Date();
			const daysSinceVerification = (now.getTime() - verifiedAt.getTime()) / (1000 * 60 * 60 * 24);

			// Check if verification has expired
			if (daysSinceVerification > VERIFICATION_EXPIRY_DAYS) {
				localStorage.removeItem(AGE_VERIFICATION_KEY);
				return false;
			}

			return true;
		} catch {
			return false;
		}
	}

	// Initialize on browser
	if (browser) {
		const isVerified = checkExistingVerification();
		set({
			isVerified,
			verifiedAt: isVerified ? localStorage.getItem(AGE_VERIFICATION_KEY) : null,
			isChecking: false
		});
	}

	return {
		subscribe,
		
		verify: () => {
			if (!browser) return;

			const verifiedAt = new Date().toISOString();
			
			localStorage.setItem(AGE_VERIFICATION_KEY, JSON.stringify({
				verifiedAt,
				version: '1.0'
			}));

			set({
				isVerified: true,
				verifiedAt,
				isChecking: false
			});
		},

		decline: () => {
			update(state => ({
				...state,
				isVerified: false,
				isChecking: false
			}));
		},

		reset: () => {
			if (browser) {
				localStorage.removeItem(AGE_VERIFICATION_KEY);
			}
			set({
				isVerified: false,
				verifiedAt: null,
				isChecking: false
			});
		},

		checkStatus: () => {
			if (!browser) return;
			
			const isVerified = checkExistingVerification();
			update(state => ({
				...state,
				isVerified,
				isChecking: false
			}));
		}
	};
}

export const ageVerification = createAgeVerificationStore();
