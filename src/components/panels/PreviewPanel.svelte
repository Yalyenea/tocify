<script lang="ts">
  import {fade} from 'svelte/transition';
  import {t} from 'svelte-i18n';
  import {createEventDispatcher} from 'svelte';
  import Dropzone from 'svelte-file-dropzone';

  import DropzoneView from '../DropzoneView.svelte';
  import PDFViewer from '../PDFViewer.svelte';
  import PDFControls from '../PDFControls.svelte';

  export let isFileLoading = false;
  export let isDragging = false;
  export let pdfState: any;
  export let originalPdfInstance: any;
  export let tocPdfInstance: any;

  export let isPreviewMode = false;
  export let isPreviewLoading = false;

  export let tocRanges: {start: number; end: number; id: string}[];
  export let activeRangeIndex: number;
  export let addPhysicalTocPage: boolean;
  export let tocPageCount: number;
  export let currentTocPath: any[] = []; // TocItem[]
  export let prefetchPageNum: number = 0;
  export let highlightPageNum = 0;

  export let jumpToTocPage: () => Promise<void>;

  const dispatch = createEventDispatcher();
  let fileInputRef: HTMLInputElement;

  type FileSystemFileHandleLike = {
    getFile: () => Promise<File>;
  };

  const pdfPickerTypes = [
    {
      description: 'PDF Document',
      accept: {'application/pdf': ['.pdf']},
    },
  ];

  function dispatchFileSelection(file: File, handle: FileSystemFileHandleLike | null = null) {
    dispatch('fileselect', {file, handle});
  }

  async function openPdfFilePicker() {
    if ('showOpenFilePicker' in window) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          multiple: false,
          excludeAcceptAllOption: true,
          types: pdfPickerTypes,
        });
        const file = await handle.getFile();
        dispatchFileSelection(file, handle);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.warn('showOpenFilePicker failed:', err);
      }
    }

    fileInputRef?.click();
  }

  function handleFileInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      dispatchFileSelection(target.files[0]);
      target.value = '';
    }
  }

  function handleDrop(e: CustomEvent) {
    isDragging = false;
    const {acceptedFiles} = e.detail;
    if (acceptedFiles.length) {
      dispatchFileSelection(acceptedFiles[0]);
    }
  }

  function forwardFileLoadedEvent(e: CustomEvent) {
    dispatch('viewerMessage', e.detail);
  }
</script>

<div class="relative flex min-h-[50vh] min-w-0 flex-1 flex-col lg:h-full lg:min-h-0">
  <div class="relative flex min-h-0 flex-1 flex-col">
    {#if isFileLoading}
      <div
        class="absolute inset-0 z-50 flex items-center justify-center bg-white/80"
        transition:fade={{duration: 100}}
      >
        <div class="flex flex-col items-center gap-3">
          <div class="spinner h-10 w-10"></div>
          <span class="text-sm font-medium text-slate-600">{$t('status.loading_rendering')}</span>
        </div>
      </div>
    {:else}
      <Dropzone
        containerClasses="absolute inset-0 w-full h-full"
        accept=".pdf"
        multiple={false}
        noClick
        disableDefaultStyles
        on:drop={handleDrop}
        on:dragenter={() => (isDragging = true)}
        on:dragleave={() => (isDragging = false)}
      >
        <DropzoneView
          {isDragging}
          hasInstance={!!pdfState.instance}
          on:openfile={openPdfFilePicker}
        />
      </Dropzone>
    {/if}

    {#if pdfState.instance}
      <div class="relative z-10 flex min-h-0 flex-1 flex-col">
        <div class="min-h-0 flex-1">
          <PDFViewer
            bind:pdfState
            mode={isPreviewMode ? 'single' : 'grid'}
            {originalPdfInstance}
            {tocPdfInstance}
            {tocPageCount}
            {tocRanges}
            {activeRangeIndex}
            on:updateActiveRange
            on:fileloaded={forwardFileLoadedEvent}
            {jumpToTocPage}
            {addPhysicalTocPage}
            {currentTocPath}
            {prefetchPageNum}
            bind:highlightPageNum
          />
        </div>

        <input
          type="file"
          class="hidden"
          accept=".pdf"
          bind:this={fileInputRef}
          on:change={handleFileInputChange}
        />

        <PDFControls
          {isPreviewLoading}
          {isPreviewMode}
          {originalPdfInstance}
          doc={pdfState.doc}
          on:triggerUpload={openPdfFilePicker}
          on:togglePreview={() => dispatch('togglePreview')}
          on:export={() => dispatch('export')}
          on:openChapterExport={() => dispatch('openChapterExport')}
        />
      </div>
    {/if}
  </div>
</div>
