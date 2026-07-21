<script lang="ts">
  import {createEventDispatcher} from 'svelte';
  import {t} from 'svelte-i18n';
  import {Github, HelpCircle, Settings2} from 'lucide-svelte';
  import Logo from '../assets/logo.svelte';
  import LanguageSwitch from '../components/LanguageSwitch.svelte';

  const dispatch = createEventDispatcher();
</script>

<div class="mb-1 flex items-start justify-between gap-3">
  <div class="min-w-0">
    <div class="flex items-center gap-2">
      <Logo />
      <h1 class="text-xl font-semibold tracking-tight text-slate-900">Tocify</h1>
    </div>
    <p class="mt-0.5 text-xs text-slate-500">PDF ToC Editor powered by AI</p>
  </div>

  <div class="flex items-center gap-0.5 pt-0.5">
    <button
      on:click={() => dispatch('opensettings')}
      class="btn-icon"
      title={$t('settings.api_settings_title')}
      aria-label={$t('settings.api_settings_title')}
    >
      <Settings2 size={18} />
    </button>
    <a
      href="https://github.com/Yalyenea/tocify"
      target="_blank"
      rel="noopener noreferrer"
      class="btn-icon"
      title="View on GitHub"
      aria-label="View project on GitHub"
    >
      <Github size={18} />
    </a>
    <button
      on:click={() => dispatch('openhelp')}
      class="btn-icon"
      title="How to Use"
      aria-label="How to Use ?"
    >
      <HelpCircle size={18} />
    </button>
    <LanguageSwitch />
  </div>
</div>
