<script lang="ts">
  import {fade, fly} from 'svelte/transition';
  import {Sparkles, Download, X, Loader2, AlertTriangle} from 'lucide-svelte';

  export let showUpdateModal: boolean = false;
  export let updateData: {version: string; body: string; date?: string} | null = null;

  export let onUpdate: () => Promise<void>;
  export let onCancel: () => void;

  let isUpdating = false;
  let errorMessage: string | null = null;

  const handleUpdateClick = async () => {
    if (isUpdating) return;

    isUpdating = true;
    errorMessage = null;

    try {
      await onUpdate();
    } catch (e: any) {
      console.error('Update detailed error:', e);

      errorMessage = `Error: ${e.message || JSON.stringify(e)}`;
      isUpdating = false;
    }
  };

  const handleClose = () => {
    if (isUpdating) return;
    errorMessage = null;
    onCancel();
  };
</script>

{#if showUpdateModal && updateData}
  <div
    class="modal-backdrop z-[60]"
    transition:fade={{duration: 150}}
    on:click|self={handleClose}
  >
    <div
      class="modal-panel relative flex max-h-[85vh] max-w-lg flex-col overflow-hidden p-0"
      transition:fly={{y: 12, duration: 180}}
      on:click|stopPropagation
    >
      <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 class="text-base font-semibold text-slate-900">New Version</h2>
            <p class="text-xs text-slate-500">v{updateData.version} is available</p>
          </div>
        </div>

        {#if !isUpdating}
          <button
            on:click={handleClose}
            class="btn-icon"
          >
            <X size={18} />
          </button>
        {/if}
      </div>

      <div class="flex-1 overflow-y-auto p-5">
        {#if errorMessage}
          <div
            class="error-banner mb-4 flex items-start gap-2.5"
            transition:fade
          >
            <AlertTriangle
              class="mt-0.5 shrink-0"
              size={16}
            />
            <div class="text-sm">
              <p class="font-medium">Update Failed</p>
              <p class="font-normal">{errorMessage}</p>
            </div>
          </div>
        {/if}

        <div class="prose prose-sm max-w-none prose-slate">
          <p class="mb-2 text-sm font-medium text-slate-800">What's New</p>
          <div
            class="rounded-md bg-slate-50 p-3.5 text-sm leading-relaxed whitespace-pre-wrap text-slate-700"
          >
            {updateData.body || 'Bug fixes and performance improvements.'}
          </div>
        </div>
      </div>

      <div class="mt-auto grid grid-cols-2 gap-2.5 border-t border-slate-100 p-5">
        <button
          on:click={handleClose}
          disabled={isUpdating}
          class="btn-secondary"
        >
          Later
        </button>

        <button
          on:click={handleUpdateClick}
          disabled={isUpdating}
          class="btn-success"
        >
          {#if isUpdating}
            <Loader2
              size={16}
              class="animate-spin"
            />
            <span>Installing...</span>
          {:else}
            <Download size={16} />
            <span>Update Now</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
