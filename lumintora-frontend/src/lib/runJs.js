// ════════════════════════════════════════════════════════════
//  Real, sandboxed JavaScript execution.
//  The learner's code runs in a Web Worker (no DOM, no window, no network
//  in practice), with console output captured and a hard timeout that
//  terminates runaway / infinite-loop code. This is genuine "run & iterate".
// ════════════════════════════════════════════════════════════

// Worker source, kept as a string so we can spin it up from a Blob URL with no
// extra build configuration. It wraps the user's code in an async IIFE so
// top-level await and `return` both work, and forwards console output back.
const WORKER_SRC = `
self.onmessage = async (e) => {
  const logs = [];

  const safeStringify = (v) => {
    const seen = new WeakSet();
    try {
      return JSON.stringify(v, (k, val) => {
        if (typeof val === 'bigint') return val.toString() + 'n';
        if (typeof val === 'function') return '[Function: ' + (val.name || 'anonymous') + ']';
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) return '[Circular]';
          seen.add(val);
        }
        return val;
      }, 2);
    } catch (_) { return String(v); }
  };

  const fmt = (v) => {
    if (typeof v === 'string') return v;
    if (typeof v === 'undefined') return 'undefined';
    if (v === null) return 'null';
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (typeof v === 'function') return v.toString();
    if (v instanceof Error) return v.name + ': ' + v.message;
    return safeStringify(v);
  };

  const push = (level) => (...args) => logs.push({ level, text: args.map(fmt).join(' ') });
  const sandboxConsole = { log: push('log'), info: push('log'), warn: push('warn'), error: push('error'), debug: push('log') };

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('console', '"use strict";\\nreturn (async () => {\\n' + e.data.code + '\\n})();');
    const ret = await fn(sandboxConsole);
    self.postMessage({ ok: true, logs, ret: ret === undefined ? undefined : fmt(ret) });
  } catch (err) {
    self.postMessage({ ok: false, logs, error: (err && err.message) ? (err.name + ': ' + err.message) : String(err) });
  }
};
`

export function runJs(code, { timeout = 3000 } = {}) {
  return new Promise((resolve) => {
    let url, worker, done = false
    const finish = (res) => {
      if (done) return
      done = true
      clearTimeout(timer)
      try { worker && worker.terminate() } catch {}
      try { url && URL.revokeObjectURL(url) } catch {}
      resolve(res)
    }
    const timer = setTimeout(
      () => finish({ ok: false, logs: [], error: `Execution timed out after ${timeout / 1000}s — likely an infinite loop.` }),
      timeout
    )
    try {
      url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'application/javascript' }))
      worker = new Worker(url)
      worker.onmessage = (e) => finish(e.data)
      worker.onerror = (e) => finish({ ok: false, logs: [], error: e.message || 'Worker error' })
      worker.postMessage({ code })
    } catch (err) {
      finish({ ok: false, logs: [], error: err.message || 'Could not start the runner' })
    }
  })
}
