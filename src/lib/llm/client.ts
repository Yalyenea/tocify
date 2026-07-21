import {
  listProviderModels,
  processToc,
  type DirectApiConfig,
  type TocInputConfig,
} from '$lib/llm/core';

export type {
  DirectApiConfig,
  Provider,
  ProviderModel,
  TocInputConfig,
} from '$lib/llm/core';

export async function processTocDirect(config: TocInputConfig) {
  return processToc(config);
}

export async function listProviderModelsDirect(config: DirectApiConfig) {
  return listProviderModels(config);
}
