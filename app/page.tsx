"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { ArrowUp, Loader2, Plus } from "lucide-react";
import { MessageWall } from "@/components/messages/message-wall";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UIMessage } from "ai";
import { useEffect, useState, useRef } from "react";
import { AI_NAME, WELCOME_MESSAGE } from "@/config";
import Image from "next/image";

const formSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message must be at most 2000 characters."),
});

const STORAGE_KEY = 'chat-messages';

type StorageData = {
  messages: UIMessage[];
  durations: Record<string, number>;
};

const loadMessagesFromStorage = (): { messages: UIMessage[]; durations: Record<string, number> } => {
  if (typeof window === 'undefined') return { messages: [], durations: {} };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { messages: [], durations: {} };

    const parsed = JSON.parse(stored);
    return {
      messages: parsed.messages || [],
      durations: parsed.durations || {},
    };
  } catch (error) {
    console.error('Failed to load messages from localStorage:', error);
    return { messages: [], durations: {} };
  }
};

const saveMessagesToStorage = (messages: UIMessage[], durations: Record<string, number>) => {
  if (typeof window === 'undefined') return;
  try {
    const data: StorageData = { messages, durations };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save messages to localStorage:', error);
  }
};

export default function Chat() {
  const [isClient, setIsClient] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const welcomeMessageShownRef = useRef<boolean>(false);

  const stored = typeof window !== 'undefined' ? loadMessagesFromStorage() : { messages: [], durations: {} };
  const [initialMessages] = useState<UIMessage[]>(stored.messages);

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    messages: initialMessages,
  });

  useEffect(() => {
    setIsClient(true);
    setDurations(stored.durations);
    setMessages(stored.messages);
  }, []);

  useEffect(() => {
    if (isClient) {
      saveMessagesToStorage(messages, durations);
    }
  }, [durations, messages, isClient]);

  const handleDurationChange = (key: string, duration: number) => {
    setDurations((prevDurations) => {
      const newDurations = { ...prevDurations };
      newDurations[key] = duration;
      return newDurations;
    });
  };

  useEffect(() => {
    if (isClient && initialMessages.length === 0 && !welcomeMessageShownRef.current) {
      const welcomeMessage: UIMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        parts: [
          {
            type: "text",
            text: WELCOME_MESSAGE,
          },
        ],
      };
      setMessages([welcomeMessage]);
      saveMessagesToStorage([welcomeMessage], {});
      welcomeMessageShownRef.current = true;
    }
  }, [isClient, initialMessages.length, setMessages]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    sendMessage({ text: data.message });
    form.reset();
  }

  function clearChat() {
    const newMessages: UIMessage[] = [];
    const newDurations = {};
    setMessages(newMessages);
    setDurations(newDurations);
    saveMessagesToStorage(newMessages, newDurations);
    toast.success("Chat cleared");
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">✨</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{AI_NAME}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Personality-based gift recommendations for any occasion.</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={clearChat}
            >
              <Plus className="size-4 mr-1" />
              New Chat
            </Button>
          </div>
        </div>

        {/* Chat area with sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat messages */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              <div className="max-w-3xl">
                {isClient ? (
                  <>
                    <MessageWall messages={messages} status={status} durations={durations} onDurationChange={handleDurationChange} />
                    {status === "submitted" && (
                      <div className="flex justify-start">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <Loader2 className="size-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex justify-center">
                    <Loader2 className="size-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Input area */}
            <div className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              <div className="max-w-3xl">
                <form id="chat-form" onSubmit={form.handleSubmit(onSubmit)}>
                  <FieldGroup>
                    <Controller
                      name="message"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="chat-form-message" className="sr-only">
                            Message
                          </FieldLabel>
                          <div className="relative">
                            <Input
                              {...field}
                              id="chat-form-message"
                              className="h-12 pr-12 pl-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Tell me about the gift recipient..."
                              disabled={status === "streaming"}
                              aria-invalid={fieldState.invalid}
                              autoComplete="off"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  form.handleSubmit(onSubmit)();
                                }
                              }}
                            />
                            {(status == "ready" || status == "error") && (
                              <Button
                                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full"
                                type="submit"
                                disabled={!field.value.trim()}
                                size="icon"
                                variant="ghost"
                              >
                                <ArrowUp className="size-4" />
                              </Button>
                            )}
                          </div>
                        </Field>
                      )}
                    />
                  </FieldGroup>
                </form>
              </div>
            </div>
          </div>

          {/* Info panel */}
          <div className="w-72 border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How it works</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Tell me about the person you're shopping for, and I'll suggest thoughtful gift ideas from our curated database.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">1.</span>
                    <span>Tell me who you're buying for (e.g., girlfriend, brother, coworker)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">2.</span>
                    <span>Share their personality and interests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">3.</span>
                    <span>Set your budget range</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">4.</span>
                    <span>I'll suggest 3–5 thoughtful ideas</span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-gray-200 dark:border-slate-800 pt-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Example prompts</h3>
                <div className="space-y-2">
                  {[
                    "Birthday gift for my introvert sister who loves reading, under ₹3,000",
                    "Farewell gift for a fitness-loving coworker, ₹1,500–₹4,000",
                    "Anniversary gift for my foodie partner, mid-range budget"
                  ].map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        form.setValue('message', example);
                      }}
                      className="w-full text-left text-xs p-2 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-slate-800 pt-6">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  🎁 All recommendations come from our curated gift database for India.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
