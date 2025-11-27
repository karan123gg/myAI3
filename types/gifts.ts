export type GiftRow = {
  gift_name: string;
  category: string;
  personality: string;
  interest_tags: string;
  recipient_type: string;
  recipient_group: string;
  occasion: string;
  price_band: string;
  description: string;
};

export type GiftContext = {
  recipientType?: string;
  recipientGroup?: string;
  occasion?: string;
  priceBand?: string;
  personality?: string;
  interests?: string[];
  questionsAsked?: number;
};

export const PRICE_BANDS = ['Low', 'Medium', 'High'];
export const RECIPIENT_GROUPS = ['Anyone', 'Mother', 'Father', 'Sister', 'Brother', 'Wife', 'Husband', 'Boyfriend', 'Girlfriend', 'Friend', 'Colleague', 'Boss', 'Kids'];
export const OCCASIONS = ['Birthday', 'Anniversary', 'Festival', 'Promotion', 'Housewarming', 'Wellness Gift', 'Travel', 'Student', 'Family Time', 'Diwali', 'New Year', 'just because'];
