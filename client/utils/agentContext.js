// Build a compact context payload to reduce tokens and speed up processing
export function getOptimizedContext(data = {}) {
  const safe = (v, d) => (v === undefined || v === null ? d : v);
  return {
    currentWQI: safe(data.wqi, null),
    criticalParams: {
      ph: safe(data.ph, null),
      do: safe(data.do, null),
      temperature: safe(data.temp ?? data.temperature, null),
    },
    alerts: Array.isArray(data.alerts) ? data.alerts.slice(0, 3) : [],
    timestamp: data.timestamp || new Date().toISOString(),
  };
}

export function createWaterQualityPrompt(context, query) {
  const parts = [
    `WQI=${context.currentWQI}`,
    `pH=${context.criticalParams.ph}`,
    `DO=${context.criticalParams.do}`,
    `Temp=${context.criticalParams.temperature}`,
  ].join(", ");

  return `Task: Analyze water quality.
Context: ${parts}
Query: ${query}
Constraints: Be concise and actionable.`;
}
