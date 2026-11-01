"""Collect real local-model outputs. Human quality columns intentionally stay blank."""
import argparse
import csv
import json
from datetime import datetime, timezone
from pathlib import Path
from time import perf_counter

import httpx

ROOT = Path(__file__).resolve().parent


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--modes', default='concise')
    parser.add_argument('--ids', default='', help='Optional comma separated test IDs')
    parser.add_argument('--output', default='results.csv')
    parser.add_argument('--max-tokens', type=int, default=512)
    args = parser.parse_args()
    modes = args.modes.split(',')
    if not set(modes) <= {'concise', 'educational', 'technical'}:
        parser.error('Unknown response mode')
    with (ROOT / 'test_cases.csv').open(encoding='utf-8', newline='') as handle:
        cases = list(csv.DictReader(handle))
    if args.ids:
        cases = [c for c in cases if c['id'] in args.ids.split(',')]
    if not cases:
        parser.error('No test cases selected')
    output = ROOT / args.output
    fields = ['timestamp_utc', 'id', 'category', 'mode', 'model', 'temperature', 'max_tokens',
              'http_status', 'success', 'latency_ms', 'nonempty', 'truncated', 'context_messages',
              'prompt', 'setup_answer', 'answer', 'error', 'human_relevance_0_4',
              'human_correctness_0_4', 'human_clarity_0_4', 'human_mode_0_4', 'human_unsupported_claims', 'reviewer']
    with httpx.Client(base_url='http://127.0.0.1:8000', timeout=190, trust_env=False) as client:
        health = client.get('/api/health').json()
        if health.get('status') != 'connected':
            raise SystemExit(f'Health check failed: {health}')
        with output.open('w', newline='', encoding='utf-8') as handle:
            writer = csv.DictWriter(handle, fieldnames=fields); writer.writeheader()
            for case in cases:
                for mode in modes:
                    row = dict(timestamp_utc=datetime.now(timezone.utc).isoformat(), id=case['id'],
                               category=case['category'], mode=mode, model=health['model'], temperature=0.3,
                               max_tokens=args.max_tokens, prompt=case['prompt'], success=False, nonempty=False)
                    started = perf_counter()
                    try:
                        history = []
                        settings = {'temperature': 0.3, 'max_tokens': args.max_tokens}
                        if case['setup_prompt']:
                            setup = client.post('/api/chat', json={'message': case['setup_prompt'], 'mode': mode, 'settings': settings})
                            setup.raise_for_status()
                            row['setup_answer'] = setup.json()['answer']
                            history = [{'role': 'user', 'content': case['setup_prompt']}, {'role': 'assistant', 'content': row['setup_answer']}]
                        started = perf_counter()
                        response = client.post('/api/chat', json={'message': case['prompt'], 'mode': mode, 'history': history, 'settings': settings})
                        row['http_status'] = response.status_code
                        data = response.json()
                        row['answer'] = data.get('answer', '')
                        row['nonempty'] = bool(row['answer'].strip())
                        row['success'] = response.is_success and row['nonempty']
                        row['truncated'] = data.get('truncated', False)
                        row['context_messages'] = data.get('context_messages', 0)
                        row['error'] = '' if response.is_success else json.dumps(data)
                    except (httpx.HTTPError, ValueError, KeyError) as exc:
                        row['error'] = str(exc)
                    row['latency_ms'] = round((perf_counter() - started) * 1000)
                    writer.writerow(row); handle.flush()
                    print(f"{case['id']} {mode}: success={row['success']} latency={row['latency_ms']}ms", flush=True)
    print(f'Results written to {output}. Human scores are blank until reviewed.')


if __name__ == '__main__':
    main()
