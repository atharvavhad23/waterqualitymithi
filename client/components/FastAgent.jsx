import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useAgentStream } from '@/hooks/useAgentStream';
import { getCachedResponse, setCachedResponse } from '@/utils/agentCache';
import { getOptimizedContext, createWaterQualityPrompt } from '@/utils/agentContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export default function FastAgent({ waterQualityData }) {
  const [query, setQuery] = useState('');
  const [cachedResponse, setCachedResponseState] = useState('');
  const { streamResponse, isStreaming, streamedResponse } = useAgentStream();
  const requestInProgressRef = useRef(false);

  const optimizedContext = useMemo(
    () => getOptimizedContext(waterQualityData || {}),
    [waterQualityData]
  );

  const handleAsk = useCallback(async () => {
    const q = query.trim();
    if (!q || requestInProgressRef.current) return;

    const prompt = createWaterQualityPrompt(optimizedContext, q);

    // Check cache first - instant response!
    const cached = getCachedResponse(prompt);
    if (cached) {
      setCachedResponseState(cached);
      return;
    }

    // Clear previous cached response
    setCachedResponseState('');
    
    // Prevent duplicate requests
    requestInProgressRef.current = true;
    
    try {
      // Stream new response
      await streamResponse(prompt);
      
      // Cache the streamed response after completion
      if (streamedResponse) {
        setCachedResponse(prompt, streamedResponse);
      }
    } finally {
      requestInProgressRef.current = false;
    }
  }, [query, optimizedContext, streamResponse, streamedResponse]);

  // Combined response (use cached or streaming)
  const displayResponse = cachedResponse || streamedResponse;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">💬 Fast Agent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about water quality..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => e.key === 'Enter' && !isStreaming && handleAsk()}
            disabled={isStreaming}
          />
          <Button 
            onClick={handleAsk} 
            disabled={isStreaming || !query.trim()}
            className="px-6 py-2 whitespace-nowrap"
          >
            {isStreaming ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⚙️</span>
                Processing…
              </span>
            ) : (
              'Ask Agent'
            )}
          </Button>
        </div>

        <div className="relative p-4 bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-lg min-h-[150px] max-h-[400px] overflow-y-auto">
          {displayResponse || isStreaming ? (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {displayResponse}
              </div>
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1"></span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 italic">
              Ask a question about water quality to get AI-powered insights...
            </div>
          )}
        </div>

        {displayResponse && !isStreaming && (
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>✓ Response {cachedResponse ? '(cached)' : 'received'}</span>
            <button
              onClick={() => { setCachedResponseState(''); setQuery(''); }}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Clear
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
