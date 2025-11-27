import { openai } from "@ai-sdk/openai";

export const MODEL = openai('gpt-4o-mini');

export const AI_NAME = "GiftMatch";
export const TAGLINE = "Match the perfect gift to the person you care about.";
export const OWNER_NAME = "GiftMatch";

// Price band mapping from CSV (Low/Medium/High) to display ranges
export const PRICE_BAND_MAP: Record<string, string> = {
  'Low': 'Under ₹1,500',
  'Medium': '₹1,500 – ₹4,000',
  'High': '₹4,000+',
};

export const PRICE_BANDS = [
  'Under ₹1,500',
  '₹1,500 – ₹4,000',
  '₹4,000+',
];

// Map display ranges back to CSV values
export const PRICE_BAND_REVERSE_MAP: Record<string, string> = {
  'Under ₹1,500': 'Low',
  '₹1,500 – ₹4,000': 'Medium',
  '₹4,000+': 'High',
};

export const RECIPIENTS = {
  'Partner': ['Girlfriend', 'Boyfriend', 'Wife', 'Husband'],
  'Family member': ['Mother', 'Father', 'Sister', 'Brother', 'Parent', 'Cousin', 'Grandparent'],
  'Friend': [],
  'Coworker': [],
  'Anyone': [],
};

export const OCCASIONS = ['Birthday', 'Anniversary', 'Farewell', 'Housewarming', 'Festival', 'Just because', 'Other'];

export const PERSONALITIES = [
  'Introvert',
  'Extrovert',
  'Traveller / Adventurous',
  'Tech-savvy',
  'Fitness / Active',
  'Foodie',
  'Book-lover / Academic',
  'Artistic / Creative',
  'Sentimental / Emotional',
  'Minimalist',
  'Workaholic / Productivity-driven',
  'Pet Lover',
];

export const INTERESTS_OPTIONS = [
  { label: 'Reading', value: 'reading' },
  { label: 'Sports & Fitness', value: 'sports' },
  { label: 'Travel & Outdoors', value: 'travel' },
  { label: 'Tech & Gadgets', value: 'tech' },
  { label: 'Art & Craft', value: 'art' },
  { label: 'Food & Cooking', value: 'cooking' },
  { label: 'Pets & Animals', value: 'pets' },
  { label: 'Music & Entertainment', value: 'music' },
  { label: 'Home Decor', value: 'home' },
  { label: 'Work & Productivity', value: 'productivity' },
];

export const CLEAR_CHAT_TEXT = "New";

export const MODERATION_DENIAL_MESSAGE_SEXUAL = "I can't discuss explicit sexual content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_SEXUAL_MINORS = "I can't discuss content involving minors in a sexual context. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_HARASSMENT = "I can't engage with harassing content. Please be respectful.";
export const MODERATION_DENIAL_MESSAGE_HARASSMENT_THREATENING = "I can't engage with threatening or harassing content. Please be respectful.";
export const MODERATION_DENIAL_MESSAGE_HATE = "I can't engage with hateful content. Please be respectful.";
export const MODERATION_DENIAL_MESSAGE_HATE_THREATENING = "I can't engage with threatening hate speech. Please be respectful.";
export const MODERATION_DENIAL_MESSAGE_ILLICIT = "I can't discuss illegal activities. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_ILLICIT_VIOLENT = "I can't discuss violent illegal activities. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_SELF_HARM = "I can't discuss self-harm. If you're struggling, please reach out to a mental health professional or crisis helpline.";
export const MODERATION_DENIAL_MESSAGE_SELF_HARM_INTENT = "I can't discuss self-harm intentions. If you're struggling, please reach out to a mental health professional or crisis helpline.";
export const MODERATION_DENIAL_MESSAGE_SELF_HARM_INSTRUCTIONS = "I can't provide instructions related to self-harm. If you're struggling, please reach out to a mental health professional or crisis helpline.";
export const MODERATION_DENIAL_MESSAGE_VIOLENCE = "I can't discuss violent content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_VIOLENCE_GRAPHIC = "I can't discuss graphic violent content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_DEFAULT = "Your message violates our guidelines. I can't answer that.";

export const PINECONE_TOP_K = 40;
export const PINECONE_INDEX_NAME = "my-ai";
