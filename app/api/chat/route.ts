import { streamText, UIMessage, convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { MODEL } from '@/config';
import { SYSTEM_PROMPT } from '@/prompts';
import { isContentFlagged } from '@/lib/moderation';
import { filterGifts, generateGiftRecommendation, extractGiftContext, shouldRecommend, getNextQuestion, loadGifts } from '@/lib/gifts';
import type { GiftContext } from '@/types/gifts';

export const maxDuration = 30;

// Initialize gifts on startup
let giftsCache: any[] = [];
try {
  giftsCache = loadGifts();
  console.log(`Loaded ${giftsCache.length} gifts from CSV`);
} catch (error) {
  console.error('Failed to load gifts:', error);
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const latestUserMessage = messages
    .filter(msg => msg.role === 'user')
    .pop();

  if (latestUserMessage) {
    const textParts = latestUserMessage.parts
      .filter(part => part.type === 'text')
      .map(part => 'text' in part ? part.text : '')
      .join('');

    if (textParts) {
      const moderationResult = await isContentFlagged(textParts);

      if (moderationResult.flagged) {
        const stream = createUIMessageStream({
          execute({ writer }) {
            const textId = 'moderation-denial-text';

            writer.write({
              type: 'start',
            });

            writer.write({
              type: 'text-start',
              id: textId,
            });

            writer.write({
              type: 'text-delta',
              id: textId,
              delta: moderationResult.denialMessage || "Your message violates our guidelines. I can't answer that.",
            });

            writer.write({
              type: 'text-end',
              id: textId,
            });

            writer.write({
              type: 'finish',
            });
          },
        });

        return createUIMessageStreamResponse({ stream });
      }
    }
  }

  // Extract gift context from conversation history
  let giftContext: GiftContext = {};
  for (const msg of messages) {
    if (msg.role === 'user') {
      const userText = msg.parts
        .filter(part => part.type === 'text')
        .map(part => 'text' in part ? part.text : '')
        .join('');
      giftContext = extractGiftContext(userText, giftContext);
    }
  }

  // Determine if we have enough context to make recommendations
  const hasEnoughContext = shouldRecommend(giftContext);
  
  let enhancedSystemPrompt = SYSTEM_PROMPT;
  let enhancedMessages = convertToModelMessages(messages);

  if (hasEnoughContext) {
    // Filter gifts based on context
    const filteredGifts = filterGifts(giftContext);
    
    if (filteredGifts.length > 0) {
      // Get AI recommendations
      const recommendations = await generateGiftRecommendation(giftContext, filteredGifts);
      
      // Add context to system prompt
      enhancedSystemPrompt += `\n\nBased on the user's context, here are filtered gift recommendations:\n${recommendations}`;
    }
  } else {
    // Ask for missing information
    const nextQuestion = getNextQuestion(giftContext);
    if (nextQuestion) {
      enhancedSystemPrompt += `\n\nThe user is missing some information. Politely ask: "${nextQuestion}"`;
    }
  }

  const result = streamText({
    model: MODEL,
    system: enhancedSystemPrompt,
    messages: enhancedMessages,
    temperature: 0.7,
  });

  return result.toUIMessageStreamResponse();
}
