import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  getConversations,
  getConversation,
  createConversation,
  deleteConversation,
} from "@/api/conversations";
import type { Conversation, ConversationSummary } from "@/types/conversation";

export const useConversations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const { toast } = useToast();

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getConversations();
      setConversations(response);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch conversations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchConversation = useCallback(
    async (conversationId: string) => {
      try {
        setIsLoading(true);
        const response = await getConversation(conversationId);
        setCurrentConversation(response);
        return response;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch conversation",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const startNewConversation = useCallback(
    async (title: string) => {
      try {
        setIsLoading(true);
        const response = await createConversation(title);
        setConversations((prev) => [response, ...prev]);
        setCurrentConversation(response);
        return response;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create conversation",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const removeConversation = useCallback(
    async (conversationId: string) => {
      try {
        setIsLoading(true);
        await deleteConversation(conversationId);
        setConversations((prev) =>
          prev.filter((conv) => conv._id !== conversationId)
        );
        if (currentConversation?._id === conversationId) {
          setCurrentConversation(null);
        }
        toast({
          title: "Success",
          description: "Conversation deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete conversation",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [currentConversation, toast]
  );

  const updateCurrentConversation = useCallback(
    (conversation: Conversation) => {
      setCurrentConversation(conversation);
      // Update the conversation in the list
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversation._id
            ? {
                ...conv,
                title: conversation.title,
                lastUpdated: conversation.lastUpdated,
              }
            : conv
        )
      );
    },
    []
  );

  const checkContextLimit = useCallback(
    (conversation: Conversation) => {
      const messageCount = conversation.messages.length;
      if (messageCount >= 8) {
        // Alert when approaching limit (10)
        toast({
          title: "Context Limit Warning",
          description:
            "This conversation is approaching its context limit. Consider starting a new conversation soon.",
          variant: "warning",
        });
      }
      return messageCount >= 10;
    },
    [toast]
  );

  return {
    isLoading,
    conversations,
    currentConversation,
    fetchConversations,
    fetchConversation,
    startNewConversation,
    removeConversation,
    updateCurrentConversation,
    checkContextLimit,
  };
};
