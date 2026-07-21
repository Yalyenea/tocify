<script lang="ts">
  import {createEventDispatcher} from 'svelte';
  import {Upload} from 'lucide-svelte';
  import {t} from 'svelte-i18n';

  export let isDragging: boolean;
  export let hasInstance: boolean;

  const dispatch = createEventDispatcher();
</script>

<div
  class="h-full w-full cursor-pointer select-none rounded-lg text-center transition-colors duration-200
  {hasInstance ? 'pointer-events-none' : ''}"
  class:pointer-events-auto={isDragging}
  class:bg-blue-50={isDragging}
>
  {#if !hasInstance || isDragging}
    <div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-slate-500">
      {#if isDragging}
        <p class="text-lg font-medium text-blue-600">{$t('dropzone.drop_here')}</p>
      {:else}
        <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Upload size={28} />
        </div>
        <h3 class="mb-1.5 text-lg font-semibold text-slate-800">{$t('dropzone.title')}</h3>
        <p class="text-sm text-slate-500">{$t('dropzone.subtitle')}</p>
        <button
          type="button"
          on:click|preventDefault|stopPropagation={() => dispatch('openfile')}
          class="btn-primary mt-5"
        >
          {$t('dropzone.btn_select')}
        </button>
      {/if}
    </div>
  {/if}
</div>
