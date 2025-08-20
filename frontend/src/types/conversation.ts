export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Conversation {
  _id: string;
  title: string;
  messages: Message[];
  lastUpdated: string;
  isActive: boolean;
}

export interface ConversationSummary {
  _id: string;
  title: string;
  lastUpdated: string;
  isActive: boolean;
}
