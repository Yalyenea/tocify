<script lang="ts">
  import {createEventDispatcher, onMount} from 'svelte';
  import {get} from 'svelte/store';
  import {slide} from 'svelte/transition';
  import {t} from 'svelte-i18n';
  import {Bot, ExternalLink, Eye, EyeOff, KeyRound, Link, Loader2, RefreshCw, ScanText, Sparkles} from 'lucide-svelte';
  import {listProviderModelsDirect, type ProviderModel} from '$lib/llm/client';

  export let isExpanded = false;

  const dispatch = createEventDispatcher();

  let config = {
    provider: '',
    apiKey: '',
    baseUrl: '',
    textModel: '',
    visionModel: '',
    customProviderName: '',
  };

  let isSaved = false;
  let showApiKey = false;
  let isLoadingModels = false;
  let modelListError = '';
  let modelOptions: ProviderModel[] = [];
  const providerLinks = {
    gemini: {
      label: 'Gemini',
      href: 'https://aistudio.google.com/app/apikey',
    },
    qwen: {
      label: 'Qwen',
      href: 'https://bailian.console.aliyun.com/?tab=model#/api-key',
    },
    doubao: {
      label: 'Doubao',
      href: 'https://www.volcengine.com/docs/82379/1541594?lang=zh',
    },
    zhipu: {
      label: 'Zhipu',
      href: 'https://open.bigmodel.cn/usercenter/apikeys',
    },
  };

  const providerDefaults = {
    gemini: {
      textModel: 'gemini-2.5-flash',
      visionModel: 'gemini-2.5-flash',
      baseUrl: '',
      customProviderName: '',
    },
    qwen: {
      textModel: 'qwen-plus',
      visionModel: 'qwen-vl-plus',
      baseUrl: '',
      customProviderName: '',
    },
    doubao: {
      textModel: '',
      visionModel: '',
      baseUrl: '',
      customProviderName: '',
    },
    zhipu: {
      textModel: 'glm-4-flash',
      visionModel: 'glm-4v-flash',
      baseUrl: '',
      customProviderName: '',
    },
    custom: {
      textModel: '',
      visionModel: '',
      baseUrl: '',
      customProviderName: '',
    },
  };

  function getEffectiveConfig() {
    if (!config.provider) {
      return {
        provider: '',
        apiKey: '',
        baseUrl: '',
        textModel: '',
        visionModel: '',
        customProviderName: '',
      };
    }

    return {...config};
  }

  function getVisibleProviderLinks() {
    if (config.provider && config.provider in providerLinks) {
      return [providerLinks[config.provider]];
    }

    return [];
  }

  function handleProviderChange() {
    const defaults = providerDefaults[config.provider as keyof typeof providerDefaults];

    config = {
      ...config,
      baseUrl: defaults?.baseUrl || '',
      textModel: defaults?.textModel || '',
      visionModel: defaults?.visionModel || '',
      customProviderName: defaults?.customProviderName || '',
    };
    modelOptions = [];
    modelListError = '';
    isSaved = false;
  }

  onMount(() => {
    const savedConfig = localStorage.getItem('tocify_api_config');
    if (savedConfig) {
      try {
        config = {...config, ...JSON.parse(savedConfig)};
        dispatch('change', getEffectiveConfig());
      } catch (e) {
        console.error('Failed to parse api config', e);
      }
    }
  });

  function save() {
    localStorage.setItem('tocify_api_config', JSON.stringify(config));
    isSaved = true;
    const effectiveConfig = getEffectiveConfig();
    dispatch('save', effectiveConfig);
    dispatch('change', effectiveConfig);

    setTimeout(() => {
      isSaved = false;
    }, 1000);

    setTimeout(() => {
      isExpanded = false;
    }, 400);
  }

  async function loadModels() {
    if (!config.provider) return;

    const translate = get(t);
    if (config.provider === 'custom' && !config.baseUrl.trim()) {
      modelListError = translate('settings.model_base_url_required');
      return;
    }

    isLoadingModels = true;
    modelListError = '';

    try {
      const requestConfig = {
        apiKey: config.apiKey,
        provider: config.provider,
        baseUrl: config.baseUrl,
        customProviderName: config.customProviderName,
      };

      const models = config.apiKey
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

<div class="border-black border-2 rounded-lg p-2 my-4 shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white">
  <div class="flex justify-between items-center">
    <div class="flex items-center gap-2">
      <h2>
        {$t('settings.api_settings_title') || 'API Settings'}
      </h2>
    </div>
    <button
      class="w-6 h-6 flex items-center justify-center transition-transform duration-200"
      class:rotate-180={isExpanded}
      on:click={() => (isExpanded = !isExpanded)}
      aria-label="Toggle API Settings"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg
      >
    </button>
  </div>

  {#if isExpanded}
    <div
      class="mt-3"
      transition:slide={{duration: 200}}
    >
      <div class="flex flex-col gap-3">
        <div class="border-black border-2 rounded-md p-2 w-full">
          <label
            class="font-bold mb-1 text-sm flex items-center"
            for="llm_provider">
            <Sparkles size={14} strokeWidth={3} class="inline-block mr-1"/>LLM Provider</label
          >
          <div class="flex items-center gap-3">
            <select
              id="llm_provider"
              class="w-full bg-white outline-none text-sm"
              bind:value={config.provider}
              on:change={handleProviderChange}
            >
              <option value="">Auto</option>
              <option value="gemini">Gemini</option>
              <option value="qwen">Qwen</option>
              <option value="doubao">Doubao</option>
              <option value="zhipu">Zhipu</option>
              <option value="custom">Custom OpenAI-compatible</option>
            </select>

            {#each getVisibleProviderLinks() as providerLink}
              <a
                href={providerLink.href}
                target="_blank"
                rel="noreferrer"
                class="shrink-0 inline-flex items-center gap-1 text-xs text-gray-600 hover:text-black"
              >
                <span>Get Key</span>
                <ExternalLink size={12} strokeWidth={2.5} />
              </a>
            {/each}

            {#if config.provider}
              <button
                type="button"
                class="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-black disabled:opacity-50"
                disabled={isLoadingModels}
                on:click={loadModels}
              >
                {#if isLoadingModels}
                  <Loader2 size={12} class="animate-spin" strokeWidth={2.5} />
                  <span>{$t('settings.fetching_models')}</span>
                {:else}
                  <RefreshCw size={12} strokeWidth={2.5} />
                  <span>{$t('settings.fetch_models')}</span>
                {/if}
              </button>
            {/if}
          </div>
        </div>

        {#if config.provider === 'custom'}
          <div
            class="border-black border-2 rounded-md p-2 w-full"
            transition:slide={{duration: 200}}
          >
            <label
              class="flex items-center gap-1.5 font-bold mb-1 text-sm"
              for="custom_provider_name">
              <Bot size={14} strokeWidth={3} />
              Provider Name</label
            >
            <input
              id="custom_provider_name"
              type="text"
              class="w-full outline-none text-sm placeholder-gray-400"
              placeholder="My Provider"
              bind:value={config.customProviderName}
              on:input={() => (isSaved = false)}
            />
          </div>

          <div
            class="border-black border-2 rounded-md p-2 w-full"
            transition:slide={{duration: 200}}
          >
            <label
              class="flex items-center gap-1.5 font-bold mb-1 text-sm"
              for="custom_base_url">
              <Link size={14} strokeWidth={3} />
              Base URL</label
            >
            <input
              id="custom_base_url"
              type="url"
              class="w-full outline-none text-sm placeholder-gray-400"
              placeholder="https://api.example.com/v1"
              bind:value={config.baseUrl}
              on:input={() => (isSaved = false)}
            />
          </div>
        {/if}

        {#if config.provider}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="border-black border-2 rounded-md p-2 w-full">
              <label
                class="flex items-center gap-1.5 font-bold mb-1 text-sm"
                for="text_model"
              >
                <Bot size={14} strokeWidth={3} />
                Text / Graph Model
              </label>
              <input
                id="text_model"
                type="text"
                list="provider-model-options"
                class="w-full outline-none text-sm placeholder-gray-400"
                placeholder={config.provider === 'doubao' ? 'ep-...' : 'model name'}
                bind:value={config.textModel}
                on:input={() => (isSaved = false)}
              />
            </div>

            <div class="border-black border-2 rounded-md p-2 w-full">
              <label
                class="flex items-center gap-1.5 font-bold mb-1 text-sm"
                for="vision_model"
              >
                <ScanText size={14} strokeWidth={3} />
                OCR / Vision Model
              </label>
              <input
                id="vision_model"
                type="text"
                list="provider-model-options"
                class="w-full outline-none text-sm placeholder-gray-400"
                placeholder={config.provider === 'doubao' ? 'ep-...' : 'model name'}
                bind:value={config.visionModel}
                on:input={() => (isSaved = false)}
              />
            </div>
          </div>

          {#if modelOptions.length > 0}
            <datalist id="provider-model-options">
              {#each modelOptions as model (model.id)}
                <option value={model.id}>{model.label}</option>
              {/each}
            </datalist>
            <p class="text-[11px] text-gray-500">
              {$t('settings.models_loaded', {values: {count: modelOptions.length}})}
            </p>
          {:else if modelListError}
            <p class="text-[11px] text-red-600">{modelListError}</p>
          {/if}

          <div class="border-black border-2 rounded-md p-2 w-full">
            <label
              class="flex items-center gap-1.5 font-bold mb-1 text-sm"
              for="api_key"
              title="Your LLM provider key (stored locally only)"
            >
              <KeyRound size={14} strokeWidth={3} />
             Key
              <span class="font-normal text-gray-400 text-[11px] ml-2">{$t('settings.api_key_hint')}</span>
            </label>
            <div class="flex items-center gap-2">
              <input
                id="api_key"
                type={showApiKey ? 'text' : 'password'}
                class="min-w-0 flex-1 outline-none placeholder:text-gray-400 placeholder:italic [&::placeholder]:text-xs "
                placeholder={$t('settings.api_key_placeholder')}
                bind:value={config.apiKey}
                on:input={() => (isSaved = false)}
              />
              <button
                type="button"
                class="shrink-0 text-gray-500 hover:text-black transition-colors"
                aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                title={showApiKey ? 'Hide API key' : 'Show API key'}
                on:click={() => (showApiKey = !showApiKey)}
              >
                {#if showApiKey}
                  <EyeOff size={16} strokeWidth={2.5} />
                {:else}
                  <Eye size={16} strokeWidth={2.5} />
                {/if}
              </button>
            </div>
          </div>
        {/if}

        <button
          class="w-full font-bold transition-all duration-200 text-black border-2 border-black rounded px-3 py-2
          {isSaved ? 'bg-lime-400' : 'bg-yellow-400 hover:bg-yellow-300'}"
          on:click={save}
        >
          {isSaved ? $t('btn.saved') : $t('btn.save')}
        </button>
      </div>
    </div>
  {/if}
</div>
