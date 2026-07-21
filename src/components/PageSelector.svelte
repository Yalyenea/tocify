<script lang="ts">
  import {createEventDispatcher} from 'svelte';
  import {Trash2, Plus} from 'lucide-svelte';
  import {t} from 'svelte-i18n';

  export let tocRanges: {start: number; end: number; id: string}[] = [];
  export let activeRangeIndex: number = 0;
  export let totalPages: number;

  const dispatch = createEventDispatcher();

  function addRange() {
    dispatch('addRange');
  }

  function removeRange(index: number) {
    dispatch('removeRange', {index});
  }

  function setActiveRange(index: number) {
    dispatch('setActiveRange', {index});
  }

  function handleRangeKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActiveRange(index);
    }
  }

  function handleRangeChange() {
    dispatch('rangeChange');
  }
</script>

<div class="card-section">
  <div class="mb-2 flex items-center justify-between">
    <h3 class="text-sm font-medium text-slate-800">{$t('label.toc_pages_selection')}</h3>
    <button
      on:click={addRange}
      class="btn-icon h-7 w-7"
      title="Add another range"
    >
      <Plus size={16} />
    </button>
  </div>

  <div class="flex flex-col gap-2">
    {#each tocRanges as range, i (range.id)}
      <div
        class="flex cursor-pointer flex-col gap-1.5 rounded-md p-2 transition-colors {i ===
        activeRangeIndex
          ? 'bg-blue-50'
          : 'hover:bg-slate-50'}"
        role="button"
        tabindex="0"
        aria-label={$t('label.range_n', {values: {n: i + 1}})}
        on:click={() => setActiveRange(i)}
        on:keydown={(event) => handleRangeKeydown(event, i)}
      >
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-medium uppercase tracking-wide text-slate-400"
            >{$t('label.range_n', {values: {n: i + 1}})}</span
          >
          {#if tocRanges.length > 1}
            <button
              on:click|stopPropagation={() => removeRange(i)}
              class="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={13} />
            </button>
          {/if}
        </div>

        <div class="flex items-center gap-2">
          <div class="flex flex-1 flex-col gap-1">
            <label
              for={`start-${range.id}`}
              class="text-[11px] font-medium text-slate-500">{$t('label.start')}</label
            >
            <input
              type="number"
              id={`start-${range.id}`}
              bind:value={range.start}
              on:input={handleRangeChange}
              min={1}
              max={totalPages}
              class="input"
            />
          </div>
          <div class="flex flex-1 flex-col gap-1">
            <label
              for={`end-${range.id}`}
              class="text-[11px] font-medium text-slate-500">{$t('label.end')}</label
            >
            <input
              type="number"
              id={`end-${range.id}`}
              bind:value={range.end}
              on:input={handleRangeChange}
              min={range.start}
              max={totalPages}
              class="input"
            />
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
