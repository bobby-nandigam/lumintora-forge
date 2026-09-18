// ════════════════════════════════════════════════════════════
//  In-browser local LLM (WebLLM)
//  The model weights download once, cache in the browser, and run fully on the
//  user's GPU via WebGPU — no server, private, works offline after first load.
//  Falls back to the cloud tutor (backend /ai/explain) when WebGPU is absent.
// ════════════════════════════════════════════════════════════

// Small, fast, broadly-compatible model (~0.9GB, q4f32 needs no shader-f16).
export const LOCAL_MODEL = 'Llama-3.2-1B-Instruct-q4f32_1-MLC'

export const hasWebGPU = () => typeof navigator !== 'undefined' && !!navigator.gpu

let enginePromise = null

// Lazily create (and cache) the engine. onProgress receives {progress, text}.
export async function getEngine(onProgress) {
  if (enginePromise) return enginePromise
  enginePromise = (async () => {
    const webllm = await import('@mlc-ai/web-llm')
    return webllm.CreateMLCEngine(LOCAL_MODEL, {
      initProgressCallback: (r) => onProgress?.(r),
    })
  })()
  return enginePromise
}

// Stream a chat completion from the local engine, calling onToken per delta.
export async function streamLocal(engine, messages, onToken, { signal } = {}) {
  const chunks = await engine.chat.completions.create({
    messages,
    stream: true,
    temperature: 0.6,
    max_tokens: 768,
  })
  let full = ''
  for await (const chunk of chunks) {
    if (signal?.aborted) break
    const delta = chunk.choices?.[0]?.delta?.content || ''
    if (delta) { full += delta; onToken(delta) }
  }
  return full
}
