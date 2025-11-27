import { generateText } from 'ai';
import { MODEL } from '@/config';
import { SYSTEM_PROMPT } from '@/prompts';
import { filterGifts, loadGifts } from '@/lib/gifts';
import type { GiftContext, GiftRow } from '@/types/gifts';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const context: GiftContext = await req.json();

    // Validate required fields
    if (!context.recipientGroup || !context.occasion || !context.priceBand) {
      return new Response(
        JSON.stringify({ error: 'Missing required context fields' }),
        { status: 400 }
      );
    }

    // Filter gifts based on context
    const filteredGifts = filterGifts(context);

    if (filteredGifts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No gifts match your criteria. Please try different selections.' }),
        { status: 400 }
      );
    }

    // Build context summary for the prompt
    const contextSummary = `
Gift for: ${context.recipientGroup} · Occasion: ${context.occasion} · Budget: ${context.priceBand}${
      context.personality ? ` · Personality: ${context.personality}` : ''
    }${context.interests && context.interests.length > 0 ? ` · Interests: ${context.interests.join(', ')}` : ''}
    `;

    // Get AI recommendations
    const result = await generateText({
      model: MODEL,
      system: SYSTEM_PROMPT,
      prompt: `User Context:
${contextSummary}

Available Gift Options (from database):
${JSON.stringify(filteredGifts.slice(0, 10), null, 2)}

Please recommend the best 3-5 gifts from this list. For each gift, explain why it's a good fit based on the recipient's personality, interests, occasion and budget.`,
      temperature: 0.7,
    });

    return new Response(
      JSON.stringify({
        context: contextSummary,
        recommendations: result.text,
        matchedGifts: filteredGifts.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Recommendation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate recommendations' }),
      { status: 500 }
    );
  }
}
