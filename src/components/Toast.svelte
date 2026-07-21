<script lang="ts">
  import {onMount} from 'svelte';
  import {createEventDispatcher} from 'svelte';
  import {X, CheckCircle, AlertTriangle, InfoIcon} from 'lucide-svelte';
  import {fly} from 'svelte/transition';

  export let message = 'Success!';
  export let duration = 3000;
  export let type: 'success' | 'error' | 'info' = 'info';

  const dispatch = createEventDispatcher();

  let timeout: ReturnType<typeof setTimeout>;
  onMount(() => {
    timeout = setTimeout(() => {
      dispatch('close');
    }, duration + (type === 'error' ? 3000 : 0));
    return () => clearTimeout(timeout);
  });

  const styles = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  };
</script>

<div
  class="fixed right-1/2 top-4 z-[999] flex w-[90vw] max-w-[90vw] translate-x-1/2 items-center rounded-lg border px-3 py-2.5 shadow-sm md:right-5 md:top-5 md:w-fit md:translate-x-0 {styles[type]}"
  transition:fly={{ y: -24, x: 0, duration: 220, opacity: 0.5 }}>
  {#if type === 'success'}
    <CheckCircle
      size={18}
      class="mr-2.5 flex-shrink-0"
    />
  {:else if type === 'error'}
    <AlertTriangle
      size={18}
      class="mr-2.5 flex-shrink-0"
    />
  {:else}
    <InfoIcon
      size={18}
      class="mr-2.5 flex-shrink-0"
    />
  {/if}

  <span class="pr-7 text-sm font-medium">{message}</span>

  <button
    on:click={() => dispatch('close')}
    class="absolute right-1.5 rounded-md p-1 opacity-60 transition-colors hover:bg-black/5 hover:opacity-100"
  >
    <X size={16} />
  </button>
</div>
