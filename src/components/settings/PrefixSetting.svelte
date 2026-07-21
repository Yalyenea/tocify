<script lang="ts">
  import {createEventDispatcher} from 'svelte';
  import {t} from 'svelte-i18n';
  import {slide} from 'svelte/transition';
  import {type LevelConfig, type CounterStyle, convertNum} from '$lib/utils/prefix';

  export let settings: {
    enabled: boolean;
    configs: LevelConfig[];
  };

  const dispatch = createEventDispatcher();

  let expandedStates: boolean[] = settings.configs.map((_, i) => i === 0);

  const styles: {value: CounterStyle; label: string}[] = [
    {value: 'decimal', label: '1, 2, 3'},
    {value: 'chinese_simple', label: '一, 二, 三'},
    {value: 'roman_upper', label: 'I, II, III'},
    {value: 'alpha_upper', label: 'A, B, C'},
    {value: 'none', label: $t('settings.none')},
  ];

  function handleChange() {
    dispatch('change', settings);
  }

  function toggleExpand(index: number) {
    expandedStates[index] = !expandedStates[index];
  }

  function getPreview(config: LevelConfig, index: number): string {
    const num = convertNum(1, config.style);
    if (index === 0) {
      return `${config.prefix}${num}${config.suffix}`;
    } else {
      let core = num;
      if (config.inheritParent) {
        const parentNum = convertNum(1, config.style);
        const sep = config.separator || '.';
        core = `${parentNum}${sep}${num}`;
      }
      return `${config.prefix}${core}${config.suffix}`;
    }
  }
</script>

<div class="space-y-3">
  <div class="flex justify-between items-center">
    <h3>{$t('settings.add_numbering')}</h3>

    <label class="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        class="sr-only peer"
        bind:checked={settings.enabled}
        on:change={handleChange}
      />
      <div
        class="toggle-track relative"
      ></div>
    </label>
  </div>

  {#if settings.enabled}
    <div
      transition:slide={{duration: 200}}
      class="space-y-3"
    >
      {#each settings.configs as config, i}
        <div
          class="overflow-hidden rounded-md bg-slate-50 transition-all duration-200"
        >
          <button
            class="flex w-full items-center justify-between border-b border-transparent px-3 py-2 text-left transition-colors hover:bg-slate-50"
            class:border-gray-100={expandedStates[i]}
            on:click={() => toggleExpand(i)}
          >
            <div class="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="transition-transform duration-200"
                class:rotate-180={expandedStates[i]}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>

              <span class="select-none text-sm font-medium text-slate-700">
                {i === 0 ? $t('settings.first_level') : $t('settings.other_levels')}
              </span>
            </div>

            <div
              class="max-w-[150px] truncate rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-900 sm:max-w-[240px]"
              title={$t('settings.preview')}
            >
              {getPreview(config, i)} Title
            </div>
          </button>

          {#if expandedStates[i]}
            <div
              transition:slide={{duration: 200}}
              class="p-3 pt-0"
            >
              <div class="space-y-3 pt-3">
                <div class="flex gap-2 items-end">
                  <div class="flex-grow">
                    <label for={`prefix-style-${i}`} class="text-sm text-gray-500 mb-1 block">{$t('settings.style')}</label>
                    <select
                      id={`prefix-style-${i}`}
                      class="input h-8 text-xs"
                      bind:value={config.style}
                      on:change={handleChange}
                    >
                      {#each styles as s}
                        <option value={s.value}>{s.label}</option>
                      {/each}
                    </select>
                  </div>

                  {#if i > 0}
                    <div class="flex flex-col items-center">
                      <label for={`prefix-inherit-${i}`} class="text-sm text-gray-500 mb-1 block">{$t('settings.inherit_parent')}</label>
                      <input
                        id={`prefix-inherit-${i}`}
                        type="checkbox"
                        class="checkbox h-8 w-8 checkbox-xs outline-2 outline-gray-300 rounded-sm checkbox-primary"
                        bind:checked={config.inheritParent}
                        on:change={handleChange}
                      />
                    </div>

                    {#if config.inheritParent}
                      <div
                        class="w-16"
                        transition:slide={{axis: 'x', duration: 200}}
                      >
                        <label for={`prefix-separator-${i}`} class="text-sm text-gray-500 mb-1 block max-h-5">{$t('settings.separator')}</label>
                        <input
                          id={`prefix-separator-${i}`}
                          type="text"
                          class="input h-8 text-center text-xs"
                          bind:value={config.separator}
                          on:input={handleChange}
                        />
                      </div>
                    {/if}
                  {/if}
                </div>

                <div class="flex gap-2 items-center">
                  <div class="flex-1">
                    <label for={`prefix-prefix-${i}`} class="text-sm text-gray-500 mb-1 block">{$t('settings.prefix')}</label>
                    <input
                      id={`prefix-prefix-${i}`}
                      type="text"
                      class="input h-8 text-xs"
                      placeholder="e.g. Chapter"
                      bind:value={config.prefix}
                      on:input={handleChange}
                    />
                  </div>

                  <div class="pt-5 text-gray-300">➜</div>

                  <div class="flex-1">
                    <label for={`prefix-suffix-${i}`} class="text-sm text-gray-500 mb-1 block">{$t('settings.suffix')}</label>
                    <input
                      id={`prefix-suffix-${i}`}
                      type="text"
                      class="input h-8 text-xs"
                      placeholder="e.g. ."
                      bind:value={config.suffix}
                      on:input={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
