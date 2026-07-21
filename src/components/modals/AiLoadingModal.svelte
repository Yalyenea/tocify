<script lang="ts">
  import {fade} from 'svelte/transition';
  import {t} from 'svelte-i18n';

  export let isAiLoading: boolean;
  export let tocRanges: {start: number; end: number}[];
  export let aiProgress: {current: number; total: number} | null = null;
</script>

{#if isAiLoading}
  <div
    class="modal-backdrop"
    transition:fade={{duration: 180}}
  >
    <div class="modal-panel flex max-w-sm flex-col items-center gap-5 p-8">
      <div class="text-center text-sm leading-6 text-slate-700">
        <p class="font-medium text-slate-900">
          {$t('loading.extracting_pages', {
            values: {
              ranges: tocRanges
                .map((r) => (r.start === r.end ? `${r.start}` : `${r.start}-${r.end}`))
                .join(', '),
            }
          })}
        </p>
        <p class="mt-2 text-slate-500">{$t('loading.take_minutes')}</p>
      </div>
      <div class="spinner h-9 w-9"></div>

      {#if aiProgress && aiProgress.total > 1}
        <div class="flex w-full flex-col items-center gap-1.5">
          <div class="text-xs font-medium text-slate-500">
            {$t('loading.progress', { values: { current: aiProgress.current, total: aiProgress.total } })}
          </div>
          <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-blue-600 transition-all duration-300"
              style="width: {Math.round((aiProgress.current / aiProgress.total) * 100)}%"
            ></div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
