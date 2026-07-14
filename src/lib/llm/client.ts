import {
  generateBoard,
  listProviderModels,
  processToc,
  type DirectApiConfig,
  type GraphNodeInput,
  type TocInputConfig,
} from '$lib/llm/core';

export type {
  DirectApiConfig,
  GraphNodeInput,
  GraphResponse,
  Provider,
  ProviderModel,
  TocInputConfig,
} from '$lib/llm/core';

export async function processTocDirect(config: TocInputConfig) {
  return processToc(config);
}

export async function generateBoardDirect(
  tocItems: GraphNodeInput[],
  config: DirectApiConfig,
) {
  return generateBoard(tocItems, config);
}

export async function listProviderModelsDirect(config: DirectApiConfig) {
  return listProviderModels(config);
}
