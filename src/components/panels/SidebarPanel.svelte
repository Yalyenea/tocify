<script lang="ts">
  import {fade} from 'svelte/transition';
  import {t} from 'svelte-i18n';
  import {createEventDispatcher} from 'svelte';

  import Header from '../Header.svelte';
  import TocSettings from '../settings/TocSetting.svelte';
  import ModelPicker from '../settings/ModelPicker.svelte';
  import AiPageSelector from '../PageSelector.svelte';
  import TocEditor from '../TocEditor.svelte';
  import SettingsModal from '../modals/SettingsModal.svelte';
  import {Sparkles, X} from 'lucide-svelte';
  import {curFileFingerprint} from '../../stores';
  import {apiConfig} from '$lib/api-config';

  export let pdfState: any;
  export let originalPdfInstance: any;
  export let tocPdfInstance: any;
  export let isAiLoading = false;
  export let aiError: string | null = null;
  export let showNextStepHint = false;

  export let tocRanges: {start: number; end: number; id: string}[];
  export let activeRangeIndex: number;
  export let addPhysicalTocPage: boolean;
  export let isTocConfigExpanded: boolean;

  export let config: any;
  export let tocPageCount: number;
  export let isPreviewMode: boolean;

  const dispatch = createEventDispatcher();
  export let tocEditor: any = undefined;

  let showSettingsModal = false;
</script>

<div class="flex h-auto min-h-0 w-full flex-shrink-0 flex-col overflow-y-auto px-3 py-3 lg:h-full lg:w-[380px] lg:border-l lg:border-slate-100 xl:w-[420px]">
  <Header
    on:openhelp={() => dispatch('openhelp')}
    on:opensettings={() => (showSettingsModal = true)}
  />

  <ModelPicker on:openSettings={() => (showSettingsModal = true)} />

  <TocSettings
    {config}
    {tocPdfInstance}
    {tocRanges}
    totalPages={pdfState.totalPages}
    bind:isTocConfigExpanded
    bind:addPhysicalTocPage
    on:toggleExpand={() => (isTocConfigExpanded = !isTocConfigExpanded)}
    on:updateField={(e) => dispatch('updateField', e.detail)}
    on:jumpToTocPage={() => dispatch('jumpToTocPage')}
    on:jumpToPage={(e) => dispatch('jumpToPage', e.detail)}
  />

  {#if showNextStepHint && originalPdfInstance}
    <div
      class="hint-banner"
      transition:fade={{duration: 200}}
    >
      <button
        class="absolute right-1.5 top-1.5 rounded-md p-1 text-amber-700/70 hover:bg-amber-100 hover:text-amber-900"
        on:click={() => dispatch('closeNextStepHint')}
        title={$t('btn.close_hint')}
      >
        <X size={14} />
      </button>
      <h3 class="mb-1.5 pr-6 text-sm font-medium">{$t('hint.next_step_title')}</h3>
      <p class="text-xs leading-5 text-amber-900/90">
        1. {$t('hint.step_1_text')} <strong>{$t('hint.step_1_bold')}</strong>
      </p>
      <p class="mt-1 text-xs leading-5 text-amber-900/90">
        2. {$t('hint.step_2_text')} <strong>{$t('hint.step_2_bold')}</strong>
      </p>
      <p class="mt-1.5 text-xs leading-5 text-amber-900/90">
        {$t('hint.or_text')} <strong>{$t('hint.manual_add_bold')}</strong>
        {$t('hint.manual_add_text')}
      </p>
      <p class="mt-1 text-xs leading-5 text-amber-900/90">
        {$t('hint.multi_select_tip')}
      </p>
    </div>
  {/if}

  {#if originalPdfInstance}
    <div transition:fade={{duration: 200}}>
      <AiPageSelector
        bind:tocRanges
        bind:activeRangeIndex
        totalPages={pdfState.totalPages}
        on:addRange
        on:removeRange
        on:setActiveRange
        on:rangeChange={() => dispatch('rangeChange')}
      />
    </div>
  {/if}

  <button
    class="btn-primary my-2 w-full"
    on:click={() => dispatch('generateAi')}
    title={isAiLoading
      ? $t('status.generating')
      : !originalPdfInstance
        ? $t('status.load_pdf_first')
        : $t('tooltip.generate_ai')}
    disabled={isAiLoading || !originalPdfInstance}
  >
    {#if isAiLoading}
      <span>{$t('btn.generating')}</span>
    {:else}
      <span class="inline-flex items-center gap-1.5">
        <Sparkles size={15} />
        {$t('btn.generate_toc_ai')}
      </span>
    {/if}
  </button>

  {#if aiError}
    <div class="error-banner">
      {aiError}
    </div>
  {/if}

  {#key $curFileFingerprint}
    <TocEditor
      on:hoveritem
      on:jumpToPage={(e) => dispatch('jumpToPage', e.detail)}
      on:aiFormatResponse
      bind:this={tocEditor}
      currentPage={pdfState.currentPage}
      isPreview={isPreviewMode}
      pageOffset={config.pageOffset}
      insertAtPage={config.insertAtPage}
      apiConfig={$apiConfig}
      {tocPageCount}
    />
  {/key}
</div>

<SettingsModal
  bind:show={showSettingsModal}
  on:save={() => dispatch('apiConfigSave')}
/>
