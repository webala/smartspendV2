import { apiClient } from "../lib/api-client";
import type { Conversation, ConversationSummary } from "../types/conversation";

export const getConversations = async (): Promise<ConversationSummary[]> => {
  return await apiClient.get<ConversationSummary[]>("/conversations");
};

export const getConversation = async (
  conversationId: string
): Promise<Conversation> => {
  return await apiClient.get<Conversation>(`/conversations/${conversationId}`);
};

export const createConversation = async (
  title: string
): Promise<Conversation> => {
  return await apiClient.post<Conversation>("/conversations", { title });
};

export const deleteConversation = async (
  conversationId: string
): Promise<{ message: string }> => {
  return await apiClient.delete<{ message: string }>(
    `/conversations/${conversationId}`
  );
};
