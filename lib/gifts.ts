import { GiftRow, GiftContext } from '@/types/gifts';
import fs from 'fs';
import path from 'path';

let cachedGifts: GiftRow[] | null = null;

export function loadGifts(): GiftRow[] {
  if (cachedGifts) return cachedGifts;

  const filePath = path.join(process.cwd(), 'gift_recommendation_dataset_india.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  const lines = fileContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const records: GiftRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = lines[i].split(',').map(v => v.trim());
    const record: any = {};
    headers.forEach((header, idx) => {
      record[header] = values[idx] || '';
    });
    records.push(record as GiftRow);
  }

  cachedGifts = records;
  return cachedGifts;
}

export function filterGifts(ctx: GiftContext): GiftRow[] {
  const gifts = loadGifts();
  let candidates = gifts;

  // Step 1: Match recipient group (or allow "anyone")
  if (ctx.recipientGroup) {
    candidates = candidates.filter(g => 
      g.recipient_group.includes(ctx.recipientGroup!) || g.recipient_group.includes('Anyone')
    );
  }

  // Step 2: If recipientType is present, prioritize
  if (ctx.recipientType) {
    const typeMatches = candidates.filter(g => 
      g.recipient_type.includes(ctx.recipientType!)
    );
    if (typeMatches.length > 0) {
      candidates = typeMatches;
    }
  }

  // Step 3: Match occasion, or allow "just because" as fallback
  if (ctx.occasion) {
    const occasionMatches = candidates.filter(g => 
      g.occasion.includes(ctx.occasion!) || g.occasion.includes('just because')
    );
    if (occasionMatches.length > 0) {
      candidates = occasionMatches;
    }
  }

  // Step 4: Match price band exactly if provided
  if (ctx.priceBand) {
    const priceMatches = candidates.filter(g => g.price_band === ctx.priceBand);
    if (priceMatches.length > 0) {
      candidates = priceMatches;
    }
  }

  // Step 5: Match personality exactly if provided
  if (ctx.personality) {
    const personalityMatches = candidates.filter(g => 
      g.personality.includes(ctx.personality!)
    );
    if (personalityMatches.length > 0) {
      candidates = personalityMatches;
    }
  }

  // Step 6: For interests - any token match in interest_tags
  let results = candidates;
  if (ctx.interests && ctx.interests.length > 0) {
    const interestMatches = candidates.filter(g => {
      const tags = g.interest_tags.toLowerCase().split(' ');
      return ctx.interests!.some(interest => 
        tags.some(tag => tag.includes(interest.toLowerCase()) || interest.toLowerCase().includes(tag))
      );
    });
    if (interestMatches.length >= 3) {
      results = interestMatches;
    } else {
      // Relax interest matching if fewer than 3 results
      results = candidates;
    }
  }

  // If fewer than 3 results, progressively relax constraints
  if (results.length < 3) {
    // Relax occasion matching
    results = candidates.filter(g => !ctx.occasion || g.occasion.includes('just because'));
  }

  if (results.length < 3) {
    // Relax price band matching
    results = candidates.filter(g => !ctx.priceBand || true);
  }

  return results.slice(0, 10);
}

export async function generateGiftRecommendation(
  ctx: GiftContext,
  filteredGifts: GiftRow[]
): Promise<string> {
  const { openai } = await import('@ai-sdk/openai');
  const { generateText } = await import('ai');

  const MODEL = openai('gpt-4o-mini');

  const contextSummary = `
    - Recipient: ${ctx.recipientGroup || ctx.recipientType || 'Anyone'}
    - Occasion: ${ctx.occasion || 'Just because'}
    - Budget: ${ctx.priceBand || 'Any'}
    - Personality: ${ctx.personality || 'Any'}
    - Interests: ${ctx.interests?.join(', ') || 'Any'}
  `;

  const giftsJson = JSON.stringify(filteredGifts.slice(0, 10), null, 2);

  const prompt = `Based on the user context and available gifts, recommend the best 3-5 gifts with explanations.

User Context:
${contextSummary}

Available Gifts:
${giftsJson}

Please:
1. Select the best 3-5 gifts that match the context
2. Explain why each fits the recipient
3. Mention the price band
4. Keep tone warm and concise
5. Do not invent brands or store links

Format your response naturally as recommendations.`;

  const result = await generateText({
    model: MODEL,
    prompt: prompt,
    system: `You are GiftSense AI, a gifting recommendation assistant for users in India. Your job is to suggest thoughtful, specific gift ideas using a structured gift database. You must base your suggestions only on the gifts you are given from the database. Do not invent real brands, store links, or very specific products. Keep recommendations practical, warm, and focused on meaningful gifting.`,
    temperature: 0.7,
  });

  return result.text;
}

export function extractGiftContext(userMessage: string, currentContext: GiftContext): GiftContext {
  const lower = userMessage.toLowerCase();
  const updated = { ...currentContext };

  // Try to extract recipient
  const recipientKeywords: { [key: string]: string } = {
    'mom': 'Mother', 'mother': 'Mother', 'mum': 'Mother',
    'dad': 'Father', 'father': 'Father',
    'sister': 'Sister', 'brother': 'Brother',
    'wife': 'Wife', 'husband': 'Husband',
    'girlfriend': 'Girlfriend', 'boyfriend': 'Boyfriend',
    'friend': 'Friend', 'colleague': 'Colleague', 'boss': 'Boss',
    'child': 'Kids', 'kid': 'Kids', 'baby': 'Kids',
  };

  for (const [keyword, group] of Object.entries(recipientKeywords)) {
    if (lower.includes(keyword)) {
      updated.recipientGroup = group;
      break;
    }
  }

  // Try to extract occasion
  const occasionKeywords = ['birthday', 'anniversary', 'diwali', 'festival', 'promotion', 'housewarming', 'new year'];
  for (const occasion of occasionKeywords) {
    if (lower.includes(occasion)) {
      updated.occasion = occasion.charAt(0).toUpperCase() + occasion.slice(1);
      break;
    }
  }

  // Try to extract budget/price band
  if (lower.includes('low') || lower.includes('cheap') || lower.includes('under') || lower.includes('budget')) {
    updated.priceBand = 'Low';
  } else if (lower.includes('high') || lower.includes('premium') || lower.includes('luxury') || lower.includes('expensive')) {
    updated.priceBand = 'High';
  } else if (lower.includes('medium') || lower.includes('moderate') || lower.includes('mid')) {
    updated.priceBand = 'Medium';
  }

  // Try to extract personality/interests
  const interestKeywords = ['art', 'creative', 'tech', 'technology', 'sports', 'fitness', 'travel', 'music', 'cooking', 'reading', 'wellness', 'meditation', 'nature', 'gardening', 'fashion'];
  const foundInterests: string[] = [];
  for (const interest of interestKeywords) {
    if (lower.includes(interest)) {
      foundInterests.push(interest.charAt(0).toUpperCase() + interest.slice(1));
    }
  }
  if (foundInterests.length > 0) {
    updated.interests = foundInterests;
  }

  return updated;
}

export function shouldRecommend(ctx: GiftContext): boolean {
  return !!(ctx.recipientGroup && ctx.occasion && ctx.priceBand);
}

export function getNextQuestion(ctx: GiftContext): string {
  if (!ctx.recipientGroup) {
    return "Who are we shopping for? (e.g., mom, friend, sister, boss)";
  }
  if (!ctx.occasion) {
    return "What's the occasion? (e.g., birthday, anniversary, diwali, promotion)";
  }
  if (!ctx.priceBand) {
    return "What's your budget range? (Low: under ₹500, Medium: ₹500-2000, High: ₹2000+)";
  }
  if (!ctx.personality && !ctx.interests) {
    return `Any specific interests or personality traits for ${ctx.recipientGroup.toLowerCase()}? (e.g., creative, tech-savvy, nature-lover, foodie)`;
  }
  return "";
}
