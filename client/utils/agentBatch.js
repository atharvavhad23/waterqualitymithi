// Batch short-lived agent requests to reduce network overhead
class AgentBatcher {
  constructor() {
    this.queue = [];
    this.timeout = null;
    this.batchSize = 5;
    this.delay = 100; // ms
  }

  add(prompt) {
    return new Promise((resolve, reject) => {
      this.queue.push({ prompt, resolve, reject });
      this._schedule();
    });
  }

  _schedule() {
    if (this.timeout) return;
    this.timeout = setTimeout(() => this._flush(), this.delay);
  }

  async _flush() {
    const batch = this.queue.splice(0, this.batchSize);
    this.timeout = null;
    try {
      const results = await Promise.all(
        batch.map(item => this._process(item.prompt))
      );
      results.forEach((res, i) => batch[i].resolve(res));
    } catch (err) {
      batch.forEach(item => item.reject(err));
    }
    if (this.queue.length) this._schedule();
  }

  async _process(prompt) {
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error('Agent request failed');
    return res.json();
  }
}

export const agentBatcher = new AgentBatcher();
