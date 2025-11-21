<script lang="ts">
  import { BrandPaymentModal as BaseBrandPaymentModal } from '@repo/ui';

  interface Props {
    show: boolean;
    stripePublishableKey?: string;
    accountType?: 'pro' | 'brand';
    initialDiscountCode?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    onClose?: () => void;
  }

  let {
    show,
    stripePublishableKey,
    accountType = 'brand',
    initialDiscountCode = '',
    onSuccess,
    onCancel,
    onClose
  }: Props = $props();
</script>

<BaseBrandPaymentModal
  {show}
  {stripePublishableKey}
  {accountType}
  {initialDiscountCode}
  {onSuccess}
  {onCancel}
  {onClose}
/>
