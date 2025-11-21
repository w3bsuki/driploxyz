<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Accordion from './Accordion.svelte';

  const { Story } = defineMeta({
    title: 'Primitives/Accordion',
    component: Accordion,
    tags: ['autodocs']
  });

  const faqItems = [
    {
      id: 'shipping',
      title: 'What are the shipping options?',
      content: 'We offer standard shipping (5-7 business days) and express shipping (2-3 business days). Free standard shipping on orders over $50.'
    },
    {
      id: 'returns',
      title: 'What is your return policy?',
      content: 'Items can be returned within 30 days of delivery. Products must be unworn, unwashed, and in original condition with tags attached. Refunds are processed within 5-10 business days.'
    },
    {
      id: 'sizing',
      title: 'How do I find my size?',
      content: 'Check our size guide for detailed measurements. If you\'re between sizes, we recommend sizing up. All measurements are in inches and taken while garment is laid flat.'
    },
    {
      id: 'payment',
      title: 'What payment methods do you accept?',
      content: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, and Google Pay. All transactions are securely processed.'
    }
  ];

  const productDetails = [
    {
      id: 'materials',
      title: 'Materials & Care',
      content: '100% organic cotton. Machine wash cold with like colors. Tumble dry low. Do not bleach. Iron on low heat if needed.'
    },
    {
      id: 'fit',
      title: 'Fit & Style',
      content: 'Relaxed fit with a modern silhouette. True to size. Model is 5\'10" and wearing size Medium.'
    },
    {
      id: 'sustainability',
      title: 'Sustainability',
      content: 'Made with certified organic cotton. Produced in fair trade facilities. Carbon-neutral shipping available.'
    }
  ];

  const helpTopics = [
    {
      id: 'account',
      title: 'Account & Profile',
      content: 'Manage your account settings, update your profile information, and control your privacy preferences.'
    },
    {
      id: 'orders',
      title: 'Orders & Tracking',
      content: 'Track your orders, view order history, and manage your shipping addresses.'
    }
  ];
</script>

<Story name="Default Single">
  <div style="padding: 2rem; max-width: 600px;">
    <Accordion items={faqItems} />
  </div>
</Story>

<Story name="Multiple Expanded">
  <div style="padding: 2rem; max-width: 600px;">
    <Accordion items={faqItems} multiple />
  </div>
</Story>

<Story name="Product Details">
  <div style="padding: 2rem; max-width: 600px;">
    <h2 style="margin: 0 0 1rem 0; font-size: 1.5rem; font-weight: 600;">Product Information</h2>
    <Accordion items={productDetails} />
  </div>
</Story>

<Story name="Help Topics">
  <div style="padding: 2rem; max-width: 600px;">
    <Accordion items={helpTopics} multiple />
  </div>
</Story>

<Story name="Disabled">
  <div style="padding: 2rem; max-width: 600px;">
    <Accordion items={faqItems} disabled />
  </div>
</Story>

<Story name="Two Columns">
  <div style="padding: 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; max-width: 1200px;">
    <div>
      <h3 style="margin: 0 0 1rem 0;">FAQ</h3>
      <Accordion items={faqItems} />
    </div>
    <div>
      <h3 style="margin: 0 0 1rem 0;">Details</h3>
      <Accordion items={productDetails} />
    </div>
  </div>
</Story>
