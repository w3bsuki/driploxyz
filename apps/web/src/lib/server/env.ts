import { building } from '$app/environment';
import { validatePublicEnv } from '$lib/env/validation';

let validated = false;

export function validateEnvironment(): void {
  if (validated || building) {
    return;
  }

  validatePublicEnv();
  validated = true;
}

export function setupEnvironment(): void {}

validateEnvironment();
