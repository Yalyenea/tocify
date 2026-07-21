<script lang="ts">
  import {createEventDispatcher} from 'svelte';
  import {get} from 'svelte/store';
  import {fade, fly} from 'svelte/transition';
  import {t} from 'svelte-i18n';
  import {
    Bot,
    Eye,
    EyeOff,
    ExternalLink,
    KeyRound,
    Loader2,
    Plus,
    RefreshCw,
    ScanText,
    Trash2,
    X,
  } from 'lucide-svelte';
  import {listProviderModelsDirect, type ProviderModel} from '$lib/llm/client';
  import {
    apiState,
    persistApiState,
    profileToRequestConfig,
    providerLinks,
    setActiveProfile,
    type ProviderProfile,
  } from '$lib/api-config';

  export let show = false;

  const dispatch = createEventDispatcher<{save: void}>();

  let draftProfiles: ProviderProfile[] = [];
  let selectedId = '';
  let showApiKey = false;
  let isSaved = false;
  let isLoadingModels = false;
  let modelListError = '';
  let modelOptions: ProviderModel[] = [];

  $: if (show) {
    draftProfiles = $apiState.profiles.map((p) => ({...p}));
    selectedId = $apiState.activeId;
    showApiKey = false;
    isSaved = false;
    modelOptions = [];
    modelListError = '';
  }

  $: selected = draftProfiles.find((p) => p.id === selectedId) || draftProfiles[0];
  $: link =
    selected && selected.kind in providerLinks ? providerLinks[selected.kind] : null;

  function close() {
    show = false;
  }

  function closeOnBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) close();
  }

  function closeOnKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  }

  function selectProfile(id: string) {
    selectedId = id;
    showApiKey = false;
    modelOptions = [];
    modelListError = '';
  }

  function patchSelected(patch: Partial<ProviderProfile>) {
    if (!selected) return;
    draftProfiles = draftProfiles.map((p) =>
      p.id === selected.id
        ? {
            ...p,
            ...patch,
            id: p.id,
            kind: p.kind,
            builtin: p.builtin,
          }
        : p,
    );
  }

  function handleAdd() {
    const profile = {
      id: `custom_${Math.random().toString(36).slice(2, 10)}`,
      kind: 'custom' as const,
      name: get(t)('settings.new_provider_name'),
      apiKey: '',
      baseUrl: '',
      textModel: '',
      visionModel: '',
      builtin: false,
    };
    draftProfiles = [...draftProfiles, profile];
    selectedId = profile.id;
    modelOptions = [];
    modelListError = '';
  }

  function handleRemove() {
    if (!selected || selected.builtin) return;
    const id = selected.id;
    draftProfiles = draftProfiles.filter((p) => p.id !== id);
    selectedId = draftProfiles[0]?.id || 'auto';
  }

  function save() {
    const activeId = draftProfiles.some((p) => p.id === selectedId)
      ? selectedId
      : draftProfiles[0]?.id || 'auto';

    const next = {activeId, profiles: draftProfiles.map((p) => ({...p}))};
    apiState.set(next);
    persistApiState(next);
    setActiveProfile(activeId);

    dispatch('save');
    isSaved = true;
    setTimeout(() => {
      isSaved = false;
      close();
    }, 400);
  }

  async function loadModels() {
    if (!selected || selected.kind === 'auto') return;

    const translate = get(t);
    if (selected.kind === 'custom' && !selected.baseUrl.trim()) {
      modelListError = translate('settings.model_base_url_required');
      return;
    }

    isLoadingModels = true;
    modelListError = '';

    try {
      const requestConfig = profileToRequestConfig(selected);

      const models = selected.apiKey
        ? await listProviderModelsDirect(requestConfig)
        : await (async () => {
          const response = await fetch('/api/models', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(requestConfig),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data.error || translate('settings.model_fetch_failed'));
          }
          return data.models || [];
        })();

      modelOptions = models;
      if (modelOptions.length === 0) {
        modelListError = translate('settings.no_models_found');
      }
    } catch (error: any) {
      modelOptions = [];
      modelListError = error?.message || translate('settings.model_fetch_failed');
    } finally {
      isLoadingModels = false;
    }
  }
</script>

{#if show}
  <div
    class="modal-backdrop"
    transition:fade={{duration: 150}}
    role="button"
    tabindex="0"
    aria-label={$t('settings.close_settings')}
    on:click={closeOnBackdrop}
    on:keydown={closeOnKeydown}
  >
    <div
      class="modal-panel flex max-h-[88vh] max-w-3xl flex-col overflow-hidden p-0"
      transition:fly={{y: 12, duration: 180}}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div class="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 id="settings-modal-title" class="text-lg font-semibold text-slate-900">
            {$t('settings.api_settings_title')}
          </h2>
          <p class="mt-0.5 text-xs text-slate-500">{$t('settings.api_key_hint')}</p>
        </div>
        <button type="button" class="btn-icon" on:click={close} aria-label={$t('settings.close_settings')}>
          <X size={18} />
        </button>
      </div>

      <div class="flex min-h-0 flex-1 flex-col md:flex-row">
        <!-- Left: provider list -->
        <aside class="flex w-full shrink-0 flex-col border-b border-slate-100 md:w-52 md:border-b-0 md:border-r">
          <div class="max-h-40 overflow-y-auto md:max-h-none md:flex-1">
            {#each draftProfiles as p (p.id)}
              <button
                type="button"
                class="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors
                  {p.id === selectedId ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}"
                on:click={() => selectProfile(p.id)}
              >
                <span class="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                {#if p.apiKey}
                  <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" title="Key set"></span>
                {/if}
                {#if p.id === $apiState.activeId}
                  <span class="shrink-0 text-[10px] text-slate-400">{$t('settings.active')}</span>
                {/if}
              </button>
            {/each}
          </div>
          <div class="border-t border-slate-100 p-2">
            <button type="button" class="btn-secondary btn-sm w-full" on:click={handleAdd}>
              <Plus size={14} />
              {$t('settings.add_provider')}
            </button>
          </div>
        </aside>

        <!-- Right: detail editor -->
        <div class="min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
          {#if selected}
            <div class="flex flex-col gap-4">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0 flex-1">
                  {#if selected.kind === 'custom'}
                    <label class="mb-1 block text-xs font-medium text-slate-600" for="profile_name">
                      {$t('settings.provider_name')}
                    </label>
                    <input
                      id="profile_name"
                      type="text"
                      class="input w-full"
                      value={selected.name}
                      on:input={(e) => patchSelected({name: e.currentTarget.value})}
                    />
                  {:else}
                    <h3 class="text-base font-semibold text-slate-900">{selected.name}</h3>
                    <p class="mt-0.5 text-[11px] text-slate-400">
                      {selected.kind === 'auto' ? $t('settings.auto_provider_hint') : $t('settings.default_models_hint')}
                    </p>
                  {/if}
                </div>
                {#if !selected.builtin}
                  <button
                    type="button"
                    class="btn-ghost btn-sm text-red-600 hover:bg-red-50"
                    on:click={handleRemove}
                    title={$t('settings.remove_provider')}
                  >
                    <Trash2 size={14} />
                  </button>
                {/if}
              </div>

              {#if selected.kind === 'custom'}
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-600" for="profile_base_url">
                    Base URL
                  </label>
                  <input
                    id="profile_base_url"
                    type="url"
                    class="input w-full"
                    placeholder="https://api.example.com/v1"
                    value={selected.baseUrl}
                    on:input={(e) => patchSelected({baseUrl: e.currentTarget.value})}
                  />
                </div>
              {/if}

              {#if selected.kind !== 'auto'}
                <div>
                  <div class="mb-1.5 flex items-center justify-between gap-2">
                    <label class="flex items-center gap-1 text-xs font-medium text-slate-600" for="profile_api_key">
                      <KeyRound size={13} />
                      API Key
                    </label>
                    {#if link}
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        class="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                      >
                        {$t('settings.get_api_key')}
                        <ExternalLink size={12} />
                      </a>
                    {/if}
                  </div>
                  <div class="flex items-center gap-2">
                    <input
                      id="profile_api_key"
                      type={showApiKey ? 'text' : 'password'}
                      class="input min-w-0 flex-1"
                      placeholder={$t('settings.api_key_placeholder')}
                      value={selected.apiKey}
                      on:input={(e) => patchSelected({apiKey: e.currentTarget.value})}
                    />
                    <button
                      type="button"
                      class="btn-icon"
                      aria-label={showApiKey ? 'Hide' : 'Show'}
                      on:click={() => (showApiKey = !showApiKey)}
                    >
                      {#if showApiKey}
                        <EyeOff size={16} />
                      {:else}
                        <Eye size={16} />
                      {/if}
                    </button>
                  </div>
                </div>

                <div>
                  <div class="mb-1.5 flex items-center justify-between gap-2">
                    <span class="text-xs font-medium text-slate-600">{$t('settings.model_picker_title')}</span>
                    <button
                      type="button"
                      class="btn-ghost btn-sm"
                      disabled={isLoadingModels}
                      on:click={loadModels}
                    >
                      {#if isLoadingModels}
                        <Loader2 size={13} class="animate-spin" />
                        {$t('settings.fetching_models')}
                      {:else}
                        <RefreshCw size={13} />
                        {$t('settings.fetch_models')}
                      {/if}
                    </button>
                  </div>
                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label class="mb-1 flex items-center gap-1 text-[11px] font-medium text-slate-500" for="profile_text_model">
                        <Bot size={12} />
                        {$t('settings.text_model')}
                      </label>
                      <input
                        id="profile_text_model"
                        type="text"
                        list="settings-provider-model-options"
                        class="input w-full"
                        placeholder={selected.kind === 'doubao' ? 'ep-...' : 'model name'}
                        value={selected.textModel}
                        on:input={(e) => patchSelected({textModel: e.currentTarget.value})}
                      />
                    </div>
                    <div>
                      <label class="mb-1 flex items-center gap-1 text-[11px] font-medium text-slate-500" for="profile_vision_model">
                        <ScanText size={12} />
                        {$t('settings.vision_model')}
                      </label>
                      <input
                        id="profile_vision_model"
                        type="text"
                        list="settings-provider-model-options"
                        class="input w-full"
                        placeholder={selected.kind === 'doubao' ? 'ep-...' : 'model name'}
                        value={selected.visionModel}
                        on:input={(e) => patchSelected({visionModel: e.currentTarget.value})}
                      />
                    </div>
                  </div>
                  {#if modelOptions.length > 0}
                    <datalist id="settings-provider-model-options">
                      {#each modelOptions as model (model.id)}
                        <option value={model.id}>{model.label}</option>
                      {/each}
                    </datalist>
                    <p class="mt-1.5 text-[11px] text-slate-400">
                      {$t('settings.models_loaded', {values: {count: modelOptions.length}})}
                    </p>
                  {:else if modelListError}
                    <p class="mt-1.5 text-[11px] text-red-600">{modelListError}</p>
                  {/if}
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>

      <div class="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
        <button type="button" class="btn-secondary" on:click={close}>
          {$t('chapter_export.cancel')}
        </button>
        <button
          type="button"
          class="btn-primary {isSaved ? '!bg-emerald-600' : ''}"
          on:click={save}
        >
          {isSaved ? $t('btn.saved') : $t('btn.save')}
        </button>
      </div>
    </div>
  </div>
{/if}
