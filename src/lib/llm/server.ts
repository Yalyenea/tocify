import { env } from '$env/dynamic/private';

import {
  listProviderModels,
  normalizeProvider,
  processToc,
  type Provider,
} from '$lib/llm/core';

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function determineProvider(request: Request, userProvider?: string): Provider {
  const normalizedUserProvider = normalizeProvider(userProvider);
  if (normalizedUserProvider) {
    return normalizedUserProvider;
  }

  const envProvider = normalizeProvider(env.AI_PROVIDER);
  if (envProvider) {
    return envProvider;
  }

  return randomChoice(['gemini', 'qwen', 'doubao', 'zhipu']);
}

function resolveApiKey(provider: Provider, userKey?: string): string {
  if (userKey) {
    return userKey;
  }

  switch (provider) {
    case 'gemini':
      return env.GOOGLE_API_KEY || '';
    case 'qwen':
      return env.DASHSCOPE_API_KEY || '';
    case 'zhipu':
      return env.ZHIPU_API_KEY || '';
    case 'doubao':
      return env.DOUBAO_API_KEY || '';
    case 'custom':
      return env.CUSTOM_API_KEY || '';
  }
}

function providerLabel(provider: Provider): string {
  if (provider === 'custom') {
    return env.CUSTOM_PROVIDER_NAME || 'Custom Provider';
  }

  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

function resolveTextModel(provider: Provider, userModel?: string, doubaoEndpointIdText?: string): string | undefined {
  if (userModel) return userModel;

  switch (provider) {
    case 'gemini':
      return env.GEMINI_MODEL;
    case 'qwen':
      return env.QWEN_TEXT_MODEL;
    case 'zhipu':
      return env.ZHIPU_TEXT_MODEL;
    case 'doubao':
      return doubaoEndpointIdText || env.DOUBAO_TEXT_MODEL || env.DOUBAO_ENDPOINT_ID_TEXT;
    case 'custom':
      return env.CUSTOM_TEXT_MODEL;
  }
}

function resolveVisionModel(provider: Provider, userModel?: string, doubaoEndpointIdVision?: string): string | undefined {
  if (userModel) return userModel;

  switch (provider) {
    case 'gemini':
      return env.GEMINI_VISION_MODEL || env.GEMINI_MODEL;
    case 'qwen':
      return env.QWEN_VISION_MODEL || env.QWEN_VL_MODEL;
    case 'zhipu':
      return env.ZHIPU_VISION_MODEL;
    case 'doubao':
      return doubaoEndpointIdVision || env.DOUBAO_VISION_MODEL || env.DOUBAO_ENDPOINT_ID_VISION;
    case 'custom':
      return env.CUSTOM_VISION_MODEL;
  }
}

export async function processTocOnServer({
  request,
  images,
  text,
  apiKey,
  provider,
  baseUrl,
  textModel,
  visionModel,
  customProviderName,
  doubaoEndpointIdText,
  doubaoEndpointIdVision,
}: {
  request: Request;
  images?: string[];
  text?: string;
  apiKey?: string;
  provider?: string;
  baseUrl?: string;
  textModel?: string;
  visionModel?: string;
  customProviderName?: string;
  doubaoEndpointIdText?: string;
  doubaoEndpointIdVision?: string;
}) {
  const resolvedProvider = determineProvider(request, provider);
  const resolvedApiKey = resolveApiKey(resolvedProvider, apiKey);

  if (!resolvedApiKey) {
    throw new Error(`[${ providerLabel(resolvedProvider) }] API Key is missing.`);
  }

  return processToc({
    provider: resolvedProvider,
    apiKey: resolvedApiKey,
    baseUrl: baseUrl || env.CUSTOM_BASE_URL,
    images,
    text,
    textModel: resolveTextModel(resolvedProvider, textModel, doubaoEndpointIdText),
    visionModel: resolveVisionModel(resolvedProvider, visionModel, doubaoEndpointIdVision),
    customProviderName: customProviderName || env.CUSTOM_PROVIDER_NAME,
  });
}

export async function listProviderModelsOnServer({
  request,
  apiKey,
  provider,
  baseUrl,
  customProviderName,
}: {
  request: Request;
  apiKey?: string;
  provider?: string;
  baseUrl?: string;
  customProviderName?: string;
}) {
  const resolvedProvider = determineProvider(request, provider);
  const resolvedApiKey = resolveApiKey(resolvedProvider, apiKey);

  if (!resolvedApiKey) {
    throw new Error(`[${providerLabel(resolvedProvider)}] API Key is missing.`);
  }

  return listProviderModels({
    provider: resolvedProvider,
    apiKey: resolvedApiKey,
    baseUrl: baseUrl || env.CUSTOM_BASE_URL,
    customProviderName: customProviderName || env.CUSTOM_PROVIDER_NAME,
  });
}
