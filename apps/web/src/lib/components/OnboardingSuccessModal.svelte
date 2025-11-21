<script lang="ts">
  import { OnboardingSuccessModal as BaseOnboardingSuccessModal } from '@repo/ui';

  interface Props {
    show?: boolean;
    onClose?: () => void;
    accountType?: 'personal' | 'brand';
    translations?: {
      welcomeBrand?: string;
      welcomePersonal?: string;
      brandProfileSetup?: string;
      profileComplete?: string;
      profileCreated?: string;
      profileVerified?: string;
      brandPending?: string;
      paymentReady?: string;
      goToDashboard?: string;
      startExploring?: string;
    };
  }

  let {
    show = false,
    onClose,
    accountType = 'personal',
    translations
  }: Props = $props();
</script>

<BaseOnboardingSuccessModal
  {show}
  {onClose}
  {accountType}
  {translations}
/>
