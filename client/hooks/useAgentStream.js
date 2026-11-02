import { useState, useCallback } from 'react';
import { agentConfig } from '@/config/agentConfig';

export function useAgentStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');

  const streamResponse = useCallback(async (prompt) => {
    setIsStreaming(true);
    setStreamedResponse('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), agentConfig.timeout);

    try {
      const res = await fetch('/api/agent/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, config: agentConfig }),
        signal: controller.signal,
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream reader');

      const decoder = new TextDecoder();
      // Read streaming chunks
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        setStreamedResponse(prev => prev + text);
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error('Stream error:', err);
      }
    } finally {
      clearTimeout(timeoutId);
      setIsStreaming(false);
    }
  }, []);

  return { streamResponse, isStreaming, streamedResponse };
}
