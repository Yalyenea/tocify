<script lang="ts">
  import {fade, fly} from 'svelte/transition';
  import {X} from 'lucide-svelte';
  import {t} from 'svelte-i18n';

  export let showHelpModal: boolean;

  function closeModal() {
    showHelpModal = false;
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

{#if showHelpModal}
  <div
    class="modal-backdrop"
    transition:fade={{duration: 150}}
    role="button"
    tabindex="0"
    aria-label="Close help"
    on:click={closeOnBackdropClick}
    on:keydown={closeOnKeydown}
  >
    <div
      class="modal-panel relative max-w-3xl p-5 md:p-6"
      transition:fly={{y: 12, duration: 180}}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="mb-5 flex items-start justify-between gap-3">
        <h2 class="text-lg font-semibold text-slate-900">{$t('help.title')}</h2>
        <button
          on:click={closeModal}
          class="btn-icon"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>
      </div>

      <ol class="grid gap-3 md:grid-cols-2">
        <li class="rounded-md bg-slate-50 p-3.5">
          <h3 class="mb-1.5 text-sm font-medium text-slate-900">1. {$t('help.step_upload_title')}</h3>
          <p class="text-sm leading-6 text-slate-600">{$t('help.step_upload_desc')}</p>
        </li>
        <li class="rounded-md bg-slate-50 p-3.5">
          <h3 class="mb-1.5 text-sm font-medium text-slate-900">2. {$t('help.step_select_title')}</h3>
          <p class="text-sm leading-6 text-slate-600">{$t('help.step_select_desc')}</p>
        </li>
        <li class="rounded-md bg-slate-50 p-3.5">
          <h3 class="mb-1.5 text-sm font-medium text-slate-900">3. {$t('help.step_edit_title')}</h3>
          <p class="text-sm leading-6 text-slate-600">{$t('help.step_edit_desc')}</p>
        </li>
        <li class="rounded-md bg-slate-50 p-3.5">
          <h3 class="mb-1.5 text-sm font-medium text-slate-900">4. {$t('help.step_export_title')}</h3>
          <p class="text-sm leading-6 text-slate-600">{$t('help.step_export_desc')}</p>
        </li>
      </ol>
    </div>
  </div>
{/if}
