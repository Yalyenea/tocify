<script lang="ts">
  import {createEventDispatcher} from 'svelte';
  import {fade, fly} from 'svelte/transition';
  import {X} from 'lucide-svelte';
  import {t} from 'svelte-i18n';
  import type {TocItem} from '$lib/pdf/service';
  import Tooltip from '../Tooltip.svelte';

  export let showOffsetModal: boolean;
  export let firstTocItem: TocItem | null;
  export let offsetPreviewPageNum: number;
  export let totalPages: number;

  const dispatch = createEventDispatcher();

  function updatePage(newPage: number) {
    if (newPage > 0 && newPage <= totalPages) {
      offsetPreviewPageNum = newPage;
      dispatch('update:offsetPreviewPageNum', offsetPreviewPageNum);
    }
  }

  function closeModal() {
    showOffsetModal = false;
  }

  function closeOnBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  function closeOnKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      closeModal();
    }
  }
</script>

{#if showOffsetModal && firstTocItem}
  <div
    class="modal-backdrop"
    transition:fade={{duration: 150}}
    role="button"
    tabindex="0"
    aria-label="Close offset dialog"
    on:click={closeOnBackdropClick}
    on:keydown={closeOnKeydown}
  >
    <div
      class="modal-panel max-w-5xl p-5 md:p-6"
      transition:fly={{y: 12, duration: 180}}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="mb-4 flex items-start justify-between">
        <h2 class="text-lg font-semibold text-slate-900 md:text-xl">{$t('offset.title')}</h2>
        <button
          on:click={closeModal}
          class="btn-icon"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>
      </div>
      <div class="flex flex-col justify-between gap-4 md:flex-row md:gap-6">
        <div class="flex w-full flex-col text-sm md:w-[40%] md:text-base">
          <div class="my-2 text-slate-600">
            {$t('offset.found_prefix')}
            <strong class="my-2 block text-xl font-semibold text-slate-900 md:text-2xl">{firstTocItem?.title}</strong>
            {$t('offset.found_on_prefix')}
            <div class="my-2"></div>
            <div class="flex items-center gap-3">
              <strong class="text-xl font-semibold text-slate-900 md:text-2xl">
                {$t('offset.page_n', {
                  values: {n: firstTocItem?.to},
                })}
              </strong>
              <Tooltip
                text={$t('offset.skip_tooltip')}
                position="right"
                width="w-64"
              >
                <span
                  on:click={() => dispatch('skip')}
                  class="cursor-pointer rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                  role="button"
                  tabindex="0"
                  on:keydown={(e) => e.key === 'Enter' && dispatch('skip')}
                >
                  {$t('btn.skip_this_item')}
                </span>
              </Tooltip>
            </div>
          </div>
          <p class="mb-3 mt-3 text-sm text-slate-500">{$t('offset.instruction')}</p>

          <div class="mb-4 flex items-center gap-3">
            <label
              for="physical_page_select"
              class="text-sm font-medium text-slate-700">{$t('offset.physical_page_label')}</label
            >
            <div class="flex items-center gap-1.5">
              <button
                class="btn-secondary h-9 w-9 px-0"
                on:click={() => updatePage(offsetPreviewPageNum - 1)}
                disabled={offsetPreviewPageNum <= 1}
              >
                -
              </button>
              <input
                type="number"
                id="physical_page_select"
                bind:value={offsetPreviewPageNum}
                on:input={(e) => updatePage(parseInt(e.currentTarget.value, 10))}
                min={1}
                max={totalPages}
                class="input h-9 w-16 text-center text-lg font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                class="btn-secondary h-9 w-9 px-0"
                on:click={() => updatePage(offsetPreviewPageNum + 1)}
                disabled={offsetPreviewPageNum >= totalPages}
              >
                +
              </button>
            </div>
          </div>
          <div class="mb-1 mt-auto flex flex-col gap-2">
            <button
              on:click={() => dispatch('confirm')}
              class="btn-primary w-full"
            >
              {$t('btn.yes_this_page')}
            </button>
          </div>
        </div>
        <div class="w-full md:w-[50%]">
          <div class="h-[70vh] overflow-hidden rounded-md bg-slate-50">
            <canvas
              id="offset-preview-canvas"
              class="mx-auto h-full w-96"
            ></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
