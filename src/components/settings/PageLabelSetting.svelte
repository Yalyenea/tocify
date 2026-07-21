<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { t } from 'svelte-i18n';
  import type { PageLabelSettings, PageLabelStyle } from '$lib/pdf/page-labels';
  import {Trash2} from 'lucide-svelte';

  export let settings: PageLabelSettings;

  const dispatch = createEventDispatcher();

  const styles: { value: PageLabelStyle; label: string }[] = [
    { value: 'decimal', label: '1, 2, 3' },
    { value: 'roman_lower', label: 'i, ii, iii' },
    { value: 'roman_upper', label: 'I, II, III' },
    { value: 'alpha_lower', label: 'a, b, c' },
    { value: 'alpha_upper', label: 'A, B, C' },
    { value: 'none', label: '(prefix only)' },
  ];

  function emitSegments(segments: PageLabelSettings['segments']) {
    dispatch('change', { ...settings, segments });
  }

  function addSegment() {
    const lastSegment = settings.segments && settings.segments.length > 0 ?
        settings.segments[settings.segments.length - 1] :
        null;

    const nextStartPage = lastSegment ? lastSegment.startPage + 1 : 1;

    const next = [
      ...(settings.segments || []),
      {
        startPage: nextStartPage,
        style: 'decimal' as PageLabelStyle,
        prefix: '',
        startAt: 1
      },
    ];
    emitSegments(next);
  }

  function removeSegment(index: number) {
    const segments = (settings.segments || []).filter((_, i) => i !== index);
    const enabled = segments.length > 0;
    dispatch('change', { ...settings, enabled, segments });
  }

  function updateSegment(index: number, patch: Partial<PageLabelSettings['segments'][number]>) {
    const next = (settings.segments || []).map((seg, i) => (i === index ? { ...seg, ...patch } : seg));
    emitSegments(next);
  }
</script>

<div class="space-y-3">
  <div class="text-xs text-gray-700">
    {$t('settings.page_labels_hint')}
  </div>

  {#each settings.segments || [] as seg, i (i)}
    {#if i > 0}
      <div class="border-t-2 border-dotted border-gray-300 mx-auto"></div>
    {/if}
    <div 
      class="relative group cursor-pointer hover:bg-gray-50 rounded-md p-1 -m-1 transition-colors" 
      role="button"
      tabindex="0"
      on:keydown={(e) => e.key === 'Enter' && dispatch('jumpToPage', { page: seg.startPage })}
      on:click={() => dispatch('jumpToPage', { page: seg.startPage })}
    >
      <div class="flex justify-between items-center mb-1">
        <span class="text-[11px] font-medium uppercase tracking-wide text-slate-400">{$t('label.segment_range_n', {values: {n: i + 1}})}</span>
        <button class="text-gray-400 hover:text-black p-1 hover:bg-gray-100 rounded transition-colors"
          on:click={() => removeSegment(i)}
          title={$t('settings.remove')}
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-20">
          <label for={`page-label-start-${i}`} class="text-xs text-gray-500 block mb-1">{$t('settings.start_page')}</label>
          <input
            id={`page-label-start-${i}`}
            type="number"
            min="1"
            class="input h-8"
            value={seg.startPage}
            on:input={(e) =>
              updateSegment(i, { startPage: parseInt((e.target as HTMLInputElement).value, 10) || 1 })}
          />
        </div>

        <div class="flex-1 min-w-[120px]">
          <label for={`page-label-style-${i}`} class="text-xs text-gray-500 block mb-1">{$t('settings.style')}</label>
          <select
            id={`page-label-style-${i}`}
            class="input h-8"
            value={seg.style}
            on:change={(e) =>
              updateSegment(i, { style: (e.target as HTMLSelectElement).value as PageLabelStyle })}
          >
            {#each styles as s}
              <option value={s.value}>{s.label}</option>
            {/each}
          </select>
        </div>
      </div>

      <div class="flex items-center gap-2 mt-2">
        <div class="flex-1 min-w-[120px]">
          <label for={`page-label-prefix-${i}`} class="text-xs text-gray-500 block mb-1">{$t('settings.prefix')}</label>
          <input
            id={`page-label-prefix-${i}`}
            type="text"
            class="input h-8"
            placeholder="e.g. A-"
            value={seg.prefix}
            on:input={(e) => updateSegment(i, { prefix: (e.target as HTMLInputElement).value })}
          />
        </div>

        <div class="w-20">
          <label for={`page-label-start-at-${i}`} class="text-xs text-gray-500 block mb-1">{$t('settings.start_at')}</label>
          <input
            id={`page-label-start-at-${i}`}
            type="number"
            min="1"
            class="input h-8"
            value={seg.startAt}
            on:input={(e) =>
              updateSegment(i, { startAt: parseInt((e.target as HTMLInputElement).value, 10) || 1 })}
            disabled={seg.style === 'none'}
          />
        </div>
      </div>

    </div>
  {/each}

  <button
    class="btn-secondary w-full h-9"
    on:click={addSegment}
    title={$t('settings.add_segment')}
    aria-label={$t('settings.add_segment')}
  >
    +
  </button>
</div>
