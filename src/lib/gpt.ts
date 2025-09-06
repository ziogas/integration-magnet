import 'server-only';
import { OpenAI } from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import type { z } from 'zod';

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function queryGpt<T extends z.ZodSchema>(
  systemPrompt: string,
  userPrompt: string,
  outputSchema: T,
  model: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming['model'] = 'gpt-4.1'
): Promise<z.infer<T>> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const temperature = model.startsWith('o') ? 1 : 0.7;

  try {
    const gptResponse = await openaiClient.chat.completions
      .parse(
        {
          model,
          temperature,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          response_format: zodResponseFormat(outputSchema, 'data'),
        },
        { timeout: 120000 }
      )
      .catch((error) => {
        if (error.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (error.status === 401) {
          throw new Error('Invalid API key or authentication error');
        }
        if (error.status === 500) {
          throw new Error('OpenAI service error');
        }
        throw error;
      });

    const parsedResult = gptResponse.choices[0].message.parsed;

    if (!parsedResult) {
      throw new Error('No valid response received from GPT');
    }

    return parsedResult;
  } catch (error) {
    throw error;
  }
}
