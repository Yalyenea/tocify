import {withRateLimit} from '$lib/server/ratelimit';
import {listProviderModelsOnServer} from '$lib/llm/server';
import {json} from '@sveltejs/kit';

export const POST = withRateLimit(async ({request}) => {
  try {
    const {
      apiKey,
      provider,
      baseUrl,
      customProviderName,
    } = await request.json();

    const models = await listProviderModelsOnServer({
      request,
      apiKey,
      provider,
      baseUrl,
      customProviderName,
    });

    return json({models});
  } catch (error: any) {
    console.error(error);
    return json({error: error.message}, {status: error.status || 500});
  }
});
