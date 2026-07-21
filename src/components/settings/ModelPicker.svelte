<script lang="ts">
  import {createEventDispatcher} from 'svelte';
  import {t} from 'svelte-i18n';
  import {Settings2} from 'lucide-svelte';
  import {
    apiState,
    getActiveProfile,
    setActiveProfile,
    updateActiveProfile,
  } from '$lib/api-config';

  const dispatch = createEventDispatcher<{openSettings: void}>();

  $: active = getActiveProfile($apiState);
  $: isDoubao = active.kind === 'doubao';
  $: showModels = active.kind !== 'auto';
</script>

<div class="card-section">
  <div class="flex flex-wrap items-center gap-1.5">
    <select
      class="input h-8 min-w-[7.5rem] max-w-[9rem] shrink-0 py-1 text-xs"
      value={$apiState.activeId}
      on:change={(e) => setActiveProfile(e.currentTarget.value)}
      title={$t('settings.provider')}
      aria-label={$t('settings.provider')}
    >
      {#each $apiState.profiles as p (p.id)}
        <option value={p.id}>{p.name}</option>
      {/each}
    </select>

    {#if showModels}
      <input
        type="text"
        class="input h-8 min-w-0 flex-1 py-1 text-xs"
        placeholder={isDoubao ? 'ep-... text' : $t('settings.text_model')}
        title={$t('settings.text_model')}
        value={active.textModel}
        on:input={(e) => updateActiveProfile({textModel: e.currentTarget.value})}
      />
      <input
        type="text"
        class="input h-8 min-w-0 flex-1 py-1 text-xs"
        placeholder={isDoubao ? 'ep-... vision' : $t('settings.vision_model')}
        title={$t('settings.vision_model')}
        value={active.visionModel}
        on:input={(e) => updateActiveProfile({visionModel: e.currentTarget.value})}
      />
    {:else}
      <span class="min-w-0 flex-1 truncate text-[11px] text-slate-400">
        {$t('settings.auto_provider_hint')}
      </span>
    {/if}

    <button
      type="button"
      class="btn-secondary btn-sm h-8 shrink-0 px-2"
      on:click={() => dispatch('openSettings')}
      title={$t('settings.api_settings_title')}
      aria-label={$t('settings.open_settings')}
    >
      <Settings2 size={14} />
    </button>
  </div>
</div>
