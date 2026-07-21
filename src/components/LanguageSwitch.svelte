<script lang="ts">
  import {locale} from 'svelte-i18n';

  const toggle = () => {
    $locale = $locale && $locale.startsWith('zh') ? 'en' : 'zh';
  };
</script>

<button
  on:click={toggle}
  class="btn-icon text-xs font-semibold tracking-wide"
  title="Switch language"
  aria-label="Switch language"
>
  {#if $locale && $locale.startsWith('zh')}
    EN
  {:else}
    中
  {/if}
</button>
