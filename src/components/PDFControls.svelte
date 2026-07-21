<script lang="ts">
  import {createEventDispatcher} from 'svelte';
  import {Upload, PencilIcon, EyeIcon, Download, Menu} from 'lucide-svelte';
  import {fly, fade} from 'svelte/transition';
  import { t } from 'svelte-i18n';

  export let isPreviewLoading: boolean;
  export let isPreviewMode: boolean;
  export let originalPdfInstance: any;
  export let doc: any;

  const dispatch = createEventDispatcher();
</script>

<div class="relative z-10 flex flex-col gap-2 px-3 py-2 md:flex-row md:justify-end">
  <button
    class="btn-secondary w-full md:w-auto"
    on:click={() => dispatch('triggerUpload')}
    title={$t('tooltip.upload_new')}
    in:fly={{y: 8, duration: 200, delay: 0}}
  >
    <Upload size={15} />
    {$t('btn.upload_new')}
  </button>
  <button
    class="btn-secondary w-full md:w-auto"
    on:click={() => dispatch('togglePreview')}
    disabled={!originalPdfInstance || isPreviewLoading}
    title={isPreviewMode
      ? $t('tooltip.switch_edit')
      : $t('tooltip.switch_preview')}
    in:fly={{y: 8, duration: 200, delay: 60}}
  >
    {#key isPreviewLoading.toString() + isPreviewMode.toString()}
      <div
        class="flex items-center justify-center gap-1.5"
        in:fade={{duration: 120}}
      >
        {#if isPreviewLoading}
          <div class="spinner h-3.5 w-3.5"></div>
          {$t('btn.loading')}
        {:else if isPreviewMode}
          <PencilIcon size={15} />
          {$t('btn.select_grid')}
        {:else}
          <EyeIcon size={15} />
          {$t('btn.preview')}
        {/if}
      </div>
    {/key}
  </button>
  <div
    class="flex w-full md:w-auto"
    in:fly={{y: 8, duration: 200, delay: 120}}
  >
    <button
      class="btn-success flex-1 rounded-r-none md:flex-none"
      on:click={() => dispatch('export')}
      disabled={!doc}
      title={$t('tooltip.export_pdf')}
    >
      <Download size={15} />
      {$t('btn.generate_pdf')}
    </button>
    <button
      class="btn-success rounded-l-none border-l border-emerald-500/40 px-2.5"
      on:click={() => dispatch('openChapterExport')}
      disabled={!doc}
      title={$t('tooltip.export_chapters')}
      aria-label={$t('tooltip.export_chapters')}
    >
      <Menu size={15} />
    </button>
  </div>
</div>
