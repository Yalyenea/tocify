<script lang="ts">
  import {fade, fly} from 'svelte/transition';
  import {X} from 'lucide-svelte';
  import {t} from 'svelte-i18n';

  export let showHelpModal: boolean;
</script>

{#if showHelpModal}
  <div
    class="fixed inset-0 bg-lime-400 flex items-center justify-center z-50 p-4"
    transition:fade={{duration: 150}}
    on:click={() => (showHelpModal = false)}
  >
    <div
      class="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]"
      transition:fly={{y: 20, duration: 200}}
      on:click|stopPropagation
    >
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div class="flex flex-wrap items-center gap-4">
          <h2 class="text-2xl font-black italic">{$t('help.title')}</h2>
        </div>

        <button
          on:click={() => (showHelpModal = false)}
          class="absolute top-4 right-4 md:relative md:top-auto md:right-auto p-2 border-2 border-transparent hover:border-black rounded hover:bg-gray-100 transition-all"
          aria-label="Close modal"
        >
          <X
            size={24}
            strokeWidth={3}
          />
        </button>
      </div>

      <ol class="grid gap-4 md:grid-cols-2">
        <li class="border-2 border-black rounded-lg p-4 bg-yellow-50">
          <h3 class="font-black mb-2">1. {$t('help.step_upload_title')}</h3>
          <p class="text-sm leading-6 text-gray-700">{$t('help.step_upload_desc')}</p>
        </li>
        <li class="border-2 border-black rounded-lg p-4 bg-blue-50">
          <h3 class="font-black mb-2">2. {$t('help.step_select_title')}</h3>
          <p class="text-sm leading-6 text-gray-700">{$t('help.step_select_desc')}</p>
        </li>
        <li class="border-2 border-black rounded-lg p-4 bg-green-50">
          <h3 class="font-black mb-2">3. {$t('help.step_edit_title')}</h3>
          <p class="text-sm leading-6 text-gray-700">{$t('help.step_edit_desc')}</p>
        </li>
        <li class="border-2 border-black rounded-lg p-4 bg-pink-50">
          <h3 class="font-black mb-2">4. {$t('help.step_export_title')}</h3>
          <p class="text-sm leading-6 text-gray-700">{$t('help.step_export_desc')}</p>
        </li>
      </ol>
    </div>
  </div>
{/if}
