import { jsonrepair } from 'jsonrepair';

import {
  SYSTEM_PROMPT_GRAPH,
  SYSTEM_PROMPT_TEXT,
  SYSTEM_PROMPT_VISION,
  normalizeToc,
} from '$lib/utils/toc';

export type Provider = 'gemini' | 'qwen' | 'doubao' | 'zhipu' | 'custom';

export interface DirectApiConfig {
  provider?: string;
  apiKey: string;
  baseUrl?: string;
  textModel?: string;
  visionModel?: string;
  customProviderName?: string;
}

export interface ProviderModel {
  id: string;
  label: string;
}

export interface TocInputConfig extends DirectApiConfig {
  images?: string[];
  text?: string;
}

export interface GraphNodeInput {
  id: string | number;
  title: string;
  page?: number | null;
}

export interface GraphResponse {
  nodes: Array<{
    id: string;
    title: string;
    isInferred: boolean;
    page: number | null;
    cluster: string;
  }>;
  edges: Array<{
    source: string;
    target: string;
    type: string;
    label: string;
  }>;
}

const OPENAI_COMPAT_BASE_URL: Record<Exclude<Provider, 'gemini' | 'custom'>, string> = {
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  zhipu: 'https://open.bigmodel.cn/api/paas/v4',
  doubao: 'https://ark.cn-beijing.volces.com/api/v3',
};

function providerLabel(provider: Provider, config?: DirectApiConfig): string {
  if (provider === 'custom') {
    return config?.customProviderName?.trim() || 'Custom Provider';
  }

  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

export function normalizeProvider(provider?: string): Provider | undefined {
  const normalized = provider?.trim().toLowerCase();

  if (!normalized) {
    return undefined;
  }

  if (
    normalized === 'gemini' ||
    normalized === 'qwen' ||
    normalized === 'doubao' ||
    normalized === 'zhipu' ||
    normalized === 'custom'
  ) {
    return normalized;
  }

  throw new Error(`Unsupported provider: ${ provider }`);
}

export function requireProvider(provider?: string, missingMessage = 'Please select an LLM provider when using your own API key.'): Provider {
  const normalized = normalizeProvider(provider);

  if (!normalized) {
    throw new Error(missingMessage);
  }

  return normalized;
}

function stripCodeFences(text: string): string {
  return text.replace(/```json\n?|```/g, '').trim();
}

function extractJsonText(text: string, expectedRoot: 'array' | 'object'): string {
  let rawText = stripCodeFences(text);
  const rootChar = expectedRoot === 'array' ? '[' : '{';
  const startIndex = rawText.indexOf(rootChar);

  if (startIndex !== -1) {
    rawText = rawText.slice(startIndex);
  }

  return rawText;
}

export function parseJsonPayload<T>(text: string, expectedRoot: 'array' | 'object'): T {
  const rawText = extractJsonText(text, expectedRoot);

  try {
    return JSON.parse(rawText) as T;
  } catch {
    const repaired = jsonrepair(rawText);
    return JSON.parse(repaired) as T;
  }
}

async function parseErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json();
    return data?.error?.message || data?.error?.details || data?.message || data?.msg || fallback;
  } catch {
    return fallback;
  }
}

function normalizeImageUrl(image: string): string {
  if (image.startsWith('data:image/')) {
    return image;
  }

  return `data:image/png;base64,${ image }`;
}

function trimOptional(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function getGeminiTextModel(config: DirectApiConfig): string {
  return trimOptional(config.textModel) || 'gemini-2.5-flash';
}

function getGeminiVisionModel(config: DirectApiConfig): string {
  return trimOptional(config.visionModel) || getGeminiTextModel(config);
}

function getOpenAiCompatBaseUrl(provider: Exclude<Provider, 'gemini'>, config: DirectApiConfig): string {
  if (provider === 'custom') {
    const baseUrl = trimOptional(config.baseUrl);
    if (!baseUrl) {
      throw new Error('Custom provider Base URL is required.');
    }

    return baseUrl.replace(/\/+$/, '');
  }

  return OPENAI_COMPAT_BASE_URL[provider];
}

function getOpenAiCompatTextModel(provider: Exclude<Provider, 'gemini'>, config: DirectApiConfig): string {
  const model = trimOptional(config.textModel);
  if (model) return model;

  switch (provider) {
    case 'qwen':
      return 'qwen-plus';
    case 'zhipu':
      return 'glm-4-flash';
    case 'doubao':
      throw new Error('Doubao text model or Endpoint ID is required.');
    case 'custom':
      throw new Error('Custom provider text model is required.');
  }
}

function getOpenAiCompatVisionModel(provider: Exclude<Provider, 'gemini'>, config: DirectApiConfig): string {
  const model = trimOptional(config.visionModel);
  if (model) return model;

  switch (provider) {
    case 'qwen':
      return 'qwen-vl-plus';
    case 'zhipu':
      return 'glm-4v-flash';
    case 'doubao':
      throw new Error('Doubao vision model or Endpoint ID is required.');
    case 'custom':
      throw new Error('Custom provider vision model is required.');
  }
}

function getGeminiModelPath(model: string): string {
  return model.startsWith('models/') ? model : `models/${ model }`;
}

async function fetchGeminiJson(
  apiKey: string,
  model: string,
  body: Record<string, unknown>,
  fallbackMessage: string,
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${ getGeminiModelPath(model) }:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, fallbackMessage));
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function fetchOpenAiCompatJson(
  apiKey: string,
  baseUrl: string,
  body: Record<string, unknown>,
  fallbackMessage: string,
): Promise<string> {
  const response = await fetch(`${ baseUrl }/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ apiKey }`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, fallbackMessage));
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || '[]';
}

async function fetchGeminiModels(apiKey: string): Promise<ProviderModel[]> {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
    headers: {'x-goog-api-key': apiKey},
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, 'Gemini model list request failed.'));
  }

  const data = await response.json();
  return (data?.models || [])
    .filter((model: any) => model?.supportedGenerationMethods?.includes('generateContent'))
    .map((model: any) => {
      const id = String(model.name || '').replace(/^models\//, '');
      return {
        id,
        label: model.displayName ? `${model.displayName} (${id})` : id,
      };
    })
    .filter((model: ProviderModel) => model.id);
}

async function fetchOpenAiCompatModels(apiKey: string, baseUrl: string): Promise<ProviderModel[]> {
  const response = await fetch(`${baseUrl}/models`, {
    headers: {Authorization: `Bearer ${apiKey}`},
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, 'Model list request failed.'));
  }

  const data = await response.json();
  const rawModels = Array.isArray(data?.data) ? data.data : [];

  return rawModels
    .map((model: any) => {
      const id = typeof model === 'string' ? model : model?.id;
      return id ? {id: String(id), label: String(id)} : null;
    })
    .filter(Boolean)
    .sort((a: ProviderModel, b: ProviderModel) => a.id.localeCompare(b.id)) as ProviderModel[];
}

export async function listProviderModels(config: DirectApiConfig): Promise<ProviderModel[]> {
  const provider = requireProvider(config.provider);

  if (provider === 'gemini') {
    return fetchGeminiModels(config.apiKey);
  }

  return fetchOpenAiCompatModels(config.apiKey, getOpenAiCompatBaseUrl(provider, config));
}

async function requestTextJson(config: DirectApiConfig, systemPrompt: string, userText: string): Promise<string> {
  const provider = requireProvider(config.provider);

  if (provider === 'gemini') {
    return fetchGeminiJson(
      config.apiKey,
      getGeminiTextModel(config),
      {
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [{
          role: 'user',
          parts: [{ text: userText }],
        }],
      },
      `${ providerLabel(provider, config) } request failed.`,
    );
  }

  const textBody: Record<string, unknown> = {
    model: getOpenAiCompatTextModel(provider, config),
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userText },
    ],
  };

  if (provider !== 'zhipu') {
    textBody.max_completion_tokens = 4096;
  }

  return fetchOpenAiCompatJson(
    config.apiKey,
    getOpenAiCompatBaseUrl(provider, config),
    textBody,
    `${ providerLabel(provider, config) } request failed.`,
  );
}

async function requestVisionJson(config: DirectApiConfig, systemPrompt: string, promptText: string, images: string[]): Promise<string> {
  const provider = requireProvider(config.provider);

  if (provider === 'gemini') {
    const parts = images.map((image) => {
      const normalized = normalizeImageUrl(image);
      const [meta, data] = normalized.split(',');
      const mimeType = meta.match(/data:(.*?);base64/)?.[1] || 'image/png';

      return {
        inlineData: {
          mimeType,
          data,
        },
      };
    });

    return fetchGeminiJson(
      config.apiKey,
      getGeminiVisionModel(config),
      {
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [{
          role: 'user',
          parts: [
            { text: promptText },
            ...parts,
          ],
        }],
      },
      `${ providerLabel(provider, config) } request failed.`,
    );
  }

  const visionBody: Record<string, unknown> = {
    model: getOpenAiCompatVisionModel(provider, config),
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: promptText },
          ...images.map((image) => ({
            type: 'image_url',
            image_url: { url: normalizeImageUrl(image) },
          })),
        ],
      },
    ],
  };

  if (provider !== 'zhipu') {
    visionBody.max_completion_tokens = 4096;
  }

  return fetchOpenAiCompatJson(
    config.apiKey,
    getOpenAiCompatBaseUrl(provider, config),
    visionBody,
    `${ providerLabel(provider, config) } request failed.`,
  );
}

export async function processToc(config: TocInputConfig) {
  const provider = requireProvider(config.provider);

  if (config.text?.trim()) {
    const jsonText = await requestTextJson(config, SYSTEM_PROMPT_TEXT, config.text);
    return normalizeToc(parseJsonPayload<any[]>(jsonText, 'array'));
  }

  if (!config.images?.length) {
    throw new Error('No images provided.');
  }

  try {
    const jsonText = await requestVisionJson(
      config,
      SYSTEM_PROMPT_VISION,
      'Analyze these Table of Contents images and return the single structured JSON.',
      config.images,
    );
    return normalizeToc(parseJsonPayload<any[]>(jsonText, 'array'));
  } catch (err: any) {
    if (provider === 'zhipu' && typeof err?.message === 'string' && err.message.includes('context_length_exceeded')) {
      throw new Error('图片总大小超出了智谱 Flash 模型的限制，请尝试减少图片数量或切换到付费模型 glm-4v');
    }
    throw err;
  }
}

export async function generateBoard(tocItems: GraphNodeInput[], config: DirectApiConfig): Promise<GraphResponse> {
  const provider = requireProvider(config.provider);
  const tocText = tocItems
    .map((item) => `[ID:${ item.id }] ${ item.title } (Page: ${ item.page || 'N/A' })`)
    .join('\n');

  const jsonText = provider === 'gemini'
    ? await fetchGeminiJson(
      config.apiKey,
      getGeminiTextModel(config),
      {
        generationConfig: {
          responseMimeType: 'application/json',
        },
        contents: [{
          role: 'user',
          parts: [{ text: `${ SYSTEM_PROMPT_GRAPH }\n\nToC Data:\n${ tocText }` }],
        }],
      },
      `${ providerLabel(provider, config) } request failed.`,
    )
    : await fetchOpenAiCompatJson(
      config.apiKey,
      getOpenAiCompatBaseUrl(provider, config),
      {
        model: getOpenAiCompatTextModel(provider, config),
        ...(provider !== 'zhipu' && { max_completion_tokens: 4096 }),
        messages: [
          { role: 'system', content: SYSTEM_PROMPT_GRAPH },
          { role: 'user', content: `ToC Data:\n${ tocText }` },
        ],
      },
      `${ providerLabel(provider, config) } request failed.`,
    );

  const aiData = parseJsonPayload<{
    nodes?: Array<{ id: string; label?: string; cluster?: string; page?: number | null }>;
    edges?: Array<{ source: string; target: string; type: string; label: string }>;
  }>(jsonText, 'object');

  return {
    nodes: (aiData.nodes || []).map((aiNode) => {
      const match = tocItems.find((item) => String(item.id) === String(aiNode.id));
      const page = aiNode.page !== undefined ? aiNode.page : (match?.page ?? null);

      return {
        id: aiNode.id,
        title: aiNode.label || String(aiNode.id),
        isInferred: !page,
        page,
        cluster: aiNode.cluster || 'Unclassified',
      };
    }),
    edges: aiData.edges || [],
  };
}
