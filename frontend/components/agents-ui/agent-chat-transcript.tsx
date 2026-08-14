'use client';

import { type ComponentProps } from 'react';
import { AnimatePresence } from 'motion/react';
import { type AgentState, type ReceivedMessage } from '@livekit/components-react';
import { AgentChatIndicator } from '@/components/agents-ui/agent-chat-indicator';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';

/**
 * Props for the AgentChatTranscript component.
 */
export interface AgentChatTranscriptProps extends ComponentProps<'div'> {
  /**
   * The current state of the agent. When 'thinking', displays a loading indicator.
   */
  agentState?: AgentState;
  /**
   * Array of messages to display in the transcript.
   * @defaultValue []
   */
  messages?: ReceivedMessage[];
  /**
   * Additional CSS class names to apply to the conversation container.
   */
  className?: string;
}

/**
 * A chat transcript component that displays a conversation between the user and agent.
 * Shows messages with timestamps and origin indicators, plus a thinking indicator
 * when the agent is processing.
 *
 * @extends ComponentProps<'div'>
 *
 * @example
 * ```tsx
 * <AgentChatTranscript
 *   agentState={agentState}
 *   messages={chatMessages}
 * />
 * ```
 */
export function AgentChatTranscript({
  agentState,
  messages = [],
  className,
  ...props
}: AgentChatTranscriptProps) {
  return (
    <Conversation className={className} {...props}>
      <ConversationContent>
        {messages.map((receivedMessage) => {
          const { id, timestamp, from, message } = receivedMessage;
          const locale = navigator?.language ?? 'en-US';
          const messageOrigin = from?.isLocal ? 'user' : 'assistant';
          const time = new Date(timestamp);
          const title = time.toLocaleTimeString(locale, { timeStyle: 'full' });

          // Strip raw tool calls that might leak from the LLM (e.g., Llama 3 <function=...>)
          const cleanMessage = message.replace(/<function=[\s\S]*?(?:<\/function>|$)/gi, '').trim();
          if (!cleanMessage) return null;

          // Intercept system messages for handoff transitions
          if (cleanMessage.startsWith('[SYSTEM:')) {
            const match = cleanMessage.match(/You are now the ([^.]+)/);
            const agentName = match ? match[1].replace(' again', '') : 'Specialist';
            const systemText = `Agent Connected: ${agentName}`;
            return (
              <div key={id} className="flex items-center justify-center my-6 gap-3 opacity-80">
                <div className="h-px w-full bg-gradient-to-r from-transparent to-sky-500/40" />
                <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-[0.2em] whitespace-nowrap px-2">
                  {systemText}
                </span>
                <div className="h-px w-full bg-gradient-to-l from-transparent to-sky-500/40" />
              </div>
            );
          }

          return (
            <Message key={id} title={title} from={messageOrigin}>
              <MessageContent>
                <MessageResponse>{cleanMessage}</MessageResponse>
              </MessageContent>
            </Message>
          );
        })}
        <AnimatePresence>
          {agentState === 'thinking' && <AgentChatIndicator size="sm" />}
        </AnimatePresence>
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
