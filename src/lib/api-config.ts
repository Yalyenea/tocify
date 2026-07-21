import {browser} from '$app/environment';
import {derived, get, writable} from 'svelte/store';

/** Request shape used by LLM client / server calls */
export type ApiConfig = {
  provider: string;
  apiKey: string;
  baseUrl: string;
  textModel: string;
  visionModel: string;
  customProviderName: string;
};

export type ProviderKind = 'auto' | 'gemini' | 'qwen' | 'doubao' | 'zhipu' | 'custom';

export type ProviderProfile = {
  id: string;
  kind: ProviderKind;
  name: string;
  apiKey: string;
  baseUrl: string;
  textModel: string;
  visionModel: string;
  /** Built-in presets cannot be deleted */
  builtin: boolean;
};

export type ApiConfigState = {
  activeId: string;
  profiles: ProviderProfile[];
};

export const API_CONFIG_STORAGE_KEY = 'tocify_api_config';

export const providerLinks: Record<string, {label: string; href: string}> = {
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

const kindDefaults: Record<
  Exclude<ProviderKind, 'auto'>,
  Pick<ProviderProfile, 'textModel' | 'visionModel' | 'baseUrl'>
> = {
  gemini: {
    textModel: 'gemini-2.5-flash',
    visionModel: 'gemini-2.5-flash',
    baseUrl: '',
  },
  qwen: {
    textModel: 'qwen-plus',
    visionModel: 'qwen-vl-plus',
    baseUrl: '',
  },
  doubao: {
    textModel: '',
    visionModel: '',
    baseUrl: '',
  },
  zhipu: {
    textModel: 'glm-4-flash',
    visionModel: 'glm-4v-flash',
    baseUrl: '',
  },
  custom: {
    textModel: '',
    visionModel: '',
    baseUrl: '',
  },
};

function uid(prefix = 'p') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createBuiltinProfiles(): ProviderProfile[] {
  return [
    {
      id: 'auto',
      kind: 'auto',
      name: 'Auto',
      apiKey: '',
      baseUrl: '',
      textModel: '',
      visionModel: '',
      builtin: true,
    },
    {
      id: 'gemini',
      kind: 'gemini',
      name: 'Gemini',
      apiKey: '',
      baseUrl: '',
      ...kindDefaults.gemini,
      builtin: true,
    },
    {
      id: 'qwen',
      kind: 'qwen',
      name: 'Qwen',
      apiKey: '',
      baseUrl: '',
      ...kindDefaults.qwen,
      builtin: true,
    },
    {
      id: 'doubao',
      kind: 'doubao',
      name: 'Doubao',
      apiKey: '',
      baseUrl: '',
      ...kindDefaults.doubao,
      builtin: true,
    },
    {
      id: 'zhipu',
      kind: 'zhipu',
      name: 'Zhipu',
      apiKey: '',
      baseUrl: '',
      ...kindDefaults.zhipu,
      builtin: true,
    },
  ];
}

export function createCustomProfile(name = 'Custom Provider'): ProviderProfile {
  return {
    id: uid('custom'),
    kind: 'custom',
    name,
    apiKey: '',
    baseUrl: '',
    ...kindDefaults.custom,
    builtin: false,
  };
}

export function emptyApiConfig(): ApiConfig {
  return {
    provider: '',
    apiKey: '',
    baseUrl: '',
    textModel: '',
    visionModel: '',
    customProviderName: '',
  };
}

export function getActiveProfile(state: ApiConfigState): ProviderProfile {
  return state.profiles.find((p) => p.id === state.activeId) || state.profiles[0];
}

export function profileToRequestConfig(profile: ProviderProfile): ApiConfig {
  if (profile.kind === 'auto') {
    return {
      provider: '',
      apiKey: profile.apiKey,
      baseUrl: '',
      textModel: '',
      visionModel: '',
      customProviderName: '',
    };
  }

  if (profile.kind === 'custom') {
    return {
      provider: 'custom',
      apiKey: profile.apiKey,
      baseUrl: profile.baseUrl,
      textModel: profile.textModel,
      visionModel: profile.visionModel,
      customProviderName: profile.name,
    };
  }

  return {
    provider: profile.kind,
    apiKey: profile.apiKey,
    baseUrl: profile.baseUrl,
    textModel: profile.textModel,
    visionModel: profile.visionModel,
    customProviderName: '',
  };
}

export function toRequestConfig(state: ApiConfigState): ApiConfig {
  return profileToRequestConfig(getActiveProfile(state));
}

export function providerLabel(configOrProfile: ApiConfig | ProviderProfile): string {
  if ('kind' in configOrProfile) {
    if (configOrProfile.kind === 'auto') return 'Auto';
    return configOrProfile.name || configOrProfile.kind;
  }

  if (!configOrProfile.provider) return 'Auto';
  if (configOrProfile.provider === 'custom') {
    return configOrProfile.customProviderName.trim() || 'Custom';
  }
  return configOrProfile.provider.charAt(0).toUpperCase() + configOrProfile.provider.slice(1);
}

function defaultState(): ApiConfigState {
  const profiles = createBuiltinProfiles();
  return {activeId: profiles[0].id, profiles};
}

/** Migrate legacy single-config + new multi-profile formats */
export function loadApiState(): ApiConfigState {
  if (!browser) return defaultState();

  const raw = localStorage.getItem(API_CONFIG_STORAGE_KEY);
  if (!raw) return defaultState();

  try {
    const parsed = JSON.parse(raw);

    // New multi-profile format
    if (Array.isArray(parsed?.profiles) && parsed.profiles.length > 0) {
      const builtins = createBuiltinProfiles();
      const byId = new Map(builtins.map((p) => [p.id, p]));

      for (const p of parsed.profiles as ProviderProfile[]) {
        if (!p?.id) continue;
        if (byId.has(p.id) && byId.get(p.id)!.builtin) {
          // merge user data onto builtin shell
          const base = byId.get(p.id)!;
          byId.set(p.id, {
            ...base,
            apiKey: p.apiKey ?? '',
            baseUrl: p.baseUrl ?? base.baseUrl,
            textModel: p.textModel ?? base.textModel,
            visionModel: p.visionModel ?? base.visionModel,
            name: p.name || base.name,
          });
        } else if (p.kind === 'custom' || !p.builtin) {
          byId.set(p.id, {
            id: p.id,
            kind: 'custom',
            name: p.name || 'Custom Provider',
            apiKey: p.apiKey || '',
            baseUrl: p.baseUrl || '',
            textModel: p.textModel || '',
            visionModel: p.visionModel || '',
            builtin: false,
          });
        }
      }

      const profiles = [
        ...builtins.map((b) => byId.get(b.id)!),
        ...[...byId.values()].filter((p) => !p.builtin),
      ];

      const activeId =
        profiles.some((p) => p.id === parsed.activeId)
          ? parsed.activeId
          : profiles[0].id;

      return {activeId, profiles};
    }

    // Legacy single ApiConfig
    if (typeof parsed?.provider === 'string' || parsed?.apiKey !== undefined) {
      const state = defaultState();
      const kind = (parsed.provider || 'auto') as ProviderKind | '';
      const targetId = kind === '' || kind === 'auto' ? 'auto' : kind === 'custom' ? null : kind;

      if (targetId && state.profiles.some((p) => p.id === targetId)) {
        state.activeId = targetId;
        state.profiles = state.profiles.map((p) =>
          p.id === targetId
            ? {
                ...p,
                apiKey: parsed.apiKey || '',
                baseUrl: parsed.baseUrl || p.baseUrl,
                textModel: parsed.textModel || p.textModel,
                visionModel: parsed.visionModel || p.visionModel,
              }
            : p,
        );
      } else if (kind === 'custom') {
        const custom = createCustomProfile(parsed.customProviderName || 'Custom Provider');
        custom.apiKey = parsed.apiKey || '';
        custom.baseUrl = parsed.baseUrl || '';
        custom.textModel = parsed.textModel || '';
        custom.visionModel = parsed.visionModel || '';
        state.profiles = [...state.profiles, custom];
        state.activeId = custom.id;
      }

      return state;
    }

    return defaultState();
  } catch {
    return defaultState();
  }
}

export function persistApiState(state: ApiConfigState) {
  if (!browser) return;
  localStorage.setItem(API_CONFIG_STORAGE_KEY, JSON.stringify(state));
}

export const apiState = writable<ApiConfigState>(loadApiState());

/** Active provider as request config (backward-compatible) */
export const apiConfig = derived(apiState, toRequestConfig);

export function setActiveProfile(id: string) {
  apiState.update((s) => {
    if (!s.profiles.some((p) => p.id === id)) return s;
    const next = {...s, activeId: id};
    persistApiState(next);
    return next;
  });
}

export function updateProfile(id: string, patch: Partial<ProviderProfile>) {
  apiState.update((s) => {
    const next = {
      ...s,
      profiles: s.profiles.map((p) => {
        if (p.id !== id) return p;
        if (p.builtin) {
          return {
            ...p,
            apiKey: patch.apiKey ?? p.apiKey,
            baseUrl: patch.baseUrl ?? p.baseUrl,
            textModel: patch.textModel ?? p.textModel,
            visionModel: patch.visionModel ?? p.visionModel,
            name: p.kind === 'auto' ? 'Auto' : (patch.name ?? p.name),
          };
        }
        return {
          ...p,
          ...patch,
          id: p.id,
          kind: 'custom' as const,
          builtin: false,
        };
      }),
    };
    persistApiState(next);
    return next;
  });
}

export function updateActiveProfile(patch: Partial<ProviderProfile>) {
  const s = get(apiState);
  updateProfile(s.activeId, patch);
}

export function addCustomProvider(name?: string): string {
  const profile = createCustomProfile(name);
  apiState.update((s) => {
    const next = {
      activeId: profile.id,
      profiles: [...s.profiles, profile],
    };
    persistApiState(next);
    return next;
  });
  return profile.id;
}

export function removeProfile(id: string) {
  apiState.update((s) => {
    const target = s.profiles.find((p) => p.id === id);
    if (!target || target.builtin) return s;

    const profiles = s.profiles.filter((p) => p.id !== id);
    const activeId = s.activeId === id ? profiles[0]?.id || 'auto' : s.activeId;
    const next = {activeId, profiles};
    persistApiState(next);
    return next;
  });
}

/** @deprecated use updateActiveProfile / apiState */
export function persistApiConfig(config: ApiConfig) {
  const s = get(apiState);
  const profile = getActiveProfile(s);
  if (profile.kind === 'auto') {
    updateProfile(profile.id, {apiKey: config.apiKey});
    return;
  }
  updateProfile(profile.id, {
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    textModel: config.textModel,
    visionModel: config.visionModel,
    name: config.provider === 'custom' ? config.customProviderName || profile.name : profile.name,
  });
}
