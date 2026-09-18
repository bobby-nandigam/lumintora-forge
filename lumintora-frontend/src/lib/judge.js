// ════════════════════════════════════════════════════════════
//  LeetCode-style judge.
//  We append a hidden harness after the learner's function, run the combined
//  source (JavaScript in a Web Worker, Python on the backend exec gateway), and
//  parse one marker line per test case:
//
//      LUMI_CASE <index> OK  <json result>
//      LUMI_CASE <index> ERR <message>
//
//  Verdicts come from a deep, order-aware, key-insensitive comparison of the
//  returned value against the expected value.
// ════════════════════════════════════════════════════════════

import { runJs } from './runJs'
import { api } from './api'

const MARK = 'LUMI_CASE'

// Canonical string form: arrays keep order, object keys are sorted, scalars use
// JSON. Two values are equal iff their canonical forms match.
function canon(v) {
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']'
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}'
  }
  return JSON.stringify(v)
}

export const equal = (a, b) => canon(a) === canon(b)

// Pretty one-line value for the UI (got / expected columns).
export function show(v) {
  try { return JSON.stringify(v) } catch { return String(v) }
}

function jsHarness(funcName, inputs) {
  return `
;(function () {
  var __cases = ${JSON.stringify(inputs)};
  var __clone = function (x) {
    try { return typeof structuredClone === 'function' ? structuredClone(x) : JSON.parse(JSON.stringify(x)); }
    catch (e) { return x; }
  };
  for (var __i = 0; __i < __cases.length; __i++) {
    try {
      var __r = ${funcName}.apply(null, __cases[__i].map(__clone));
      console.log("${MARK} " + __i + " OK " + JSON.stringify(__r === undefined ? null : __r));
    } catch (__e) {
      console.log("${MARK} " + __i + " ERR " + ((__e && __e.message) ? __e.message : String(__e)));
    }
  }
})();
`
}

function pyHarness(funcName, inputs) {
  // Embed the inputs as a JSON string literal and json.loads it — JSON string
  // syntax is a valid Python string literal, so this round-trips safely.
  const literal = JSON.stringify(JSON.stringify(inputs))
  return `
import json as __lumi_json
__lumi_cases = __lumi_json.loads(${literal})
for __lumi_i, __lumi_args in enumerate(__lumi_cases):
    try:
        __lumi_r = ${funcName}(*__lumi_args)
        print("${MARK}", __lumi_i, "OK", __lumi_json.dumps(__lumi_r))
    except Exception as __lumi_e:
        print("${MARK}", __lumi_i, "ERR", str(__lumi_e))
`
}

function parseCases(text, total) {
  const results = new Array(total).fill(null)
  const stdout = []
  for (const line of (text || '').split('\n')) {
    if (line.startsWith(MARK + ' ')) {
      const rest = line.slice(MARK.length + 1)
      const s1 = rest.indexOf(' ')
      const idx = parseInt(rest.slice(0, s1), 10)
      const r2 = rest.slice(s1 + 1)
      const s2 = r2.indexOf(' ')
      const status = s2 === -1 ? r2 : r2.slice(0, s2)
      const payload = s2 === -1 ? '' : r2.slice(s2 + 1)
      if (idx >= 0 && idx < total) results[idx] = { status, payload }
    } else if (line.length) {
      stdout.push(line)
    }
  }
  return { results, stdout }
}

// Run the user's code against a list of test cases. Returns:
//   { verdicts: [{ status:'pass'|'fail'|'error', expected, got, error }], stdout, error }
// where `error` is a top-level compile/runtime failure (no cases ran).
export async function runTests(problem, lang, code, cases) {
  const inputs = cases.map((c) => c.input)
  let text = ''
  let topError = null

  if (lang === 'javascript') {
    const res = await runJs(code + jsHarness(problem.funcName, inputs), { timeout: 6000 })
    text = (res.logs || []).map((l) => l.text).join('\n')
    if (!res.ok && res.error) topError = res.error
  } else {
    let res
    try {
      res = await api.execute({ language: 'python3', source: code + pyHarness(problem.funcName, inputs), stdin: '' })
    } catch (e) {
      return { verdicts: [], stdout: [], error: e?.message || 'Code runner unavailable.' }
    }
    text = res.stdout || ''
    if (res.compiled === false) topError = res.stderr || 'Compilation error.'
    else if (res.stderr && !text.includes(MARK)) topError = res.stderr
  }

  const { results, stdout } = parseCases(text, cases.length)

  const verdicts = cases.map((c, i) => {
    const r = results[i]
    if (!r) {
      return { status: 'error', expected: c.expected, got: undefined, error: topError || 'No output for this case.' }
    }
    if (r.status === 'ERR') {
      return { status: 'error', expected: c.expected, got: undefined, error: r.payload || 'Runtime error.' }
    }
    let got
    try { got = JSON.parse(r.payload) } catch { got = r.payload }
    return { status: equal(got, c.expected) ? 'pass' : 'fail', expected: c.expected, got }
  })

  return { verdicts, stdout, error: results.every((r) => r === null) ? topError : null }
}
