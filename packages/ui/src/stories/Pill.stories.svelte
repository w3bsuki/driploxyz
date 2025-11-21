<script lang="ts">
  import { Pill, PillGroup } from '../lib';

  let selected = $state(false);
  const toggle = () => (selected = !selected);
</script>

<h3>Basic Pills</h3>
<PillGroup>
  <Pill label="All" onClick={toggle} selected={selected} />
  <Pill label="New" tone="brand" variant="solid" />
  <Pill label="Popular" variant="outline" />
  <Pill label="Sale" emoji="🔥" showCount count={12} />
</PillGroup>

<h3>Link Pills</h3>
<PillGroup>
  <Pill href="#" label="Dresses" tone="brand" />
  <Pill href="#" label="Sneakers" />
  <Pill href="#" label="Accessories" variant="ghost" />
</PillGroup>

<h3>Dismissible Pills</h3>
<PillGroup>
  <Pill label="Cotton" dismissible onDismiss={() => alert('remove Cotton')} />
  <Pill label="Vintage" dismissible onDismiss={() => alert('remove Vintage')} />
</PillGroup>
