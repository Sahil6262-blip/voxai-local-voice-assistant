import json

import httpx
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.ollama_client import bounded_history
from backend.schemas import ChatRequest


@pytest.fixture
def api():
    with TestClient(app) as client:
        yield client


def upstream(handler):
    # Only automated failure/contract tests use a transport stub, never the app.
    app.state.ollama = httpx.AsyncClient(base_url="http://ollama.test", transport=httpx.MockTransport(handler))


def test_health_connected(api):
    upstream(lambda r: httpx.Response(200, json={"models": [{"name": "qwen2.5:3b"}]}))
    assert api.get('/api/health').json()['status'] == 'connected'


def test_missing_model_health(api):
    upstream(lambda r: httpx.Response(200, json={"models": []}))
    result = api.get('/api/health').json()
    assert result['status'] == 'error' and not result['model_available']


def test_offline_health(api):
    def handler(r):
        raise httpx.ConnectError('offline')
    upstream(handler)
    assert api.get('/api/health').json()['status'] == 'offline'


@pytest.mark.parametrize('data', [{}, {'models': None}, {'models': [{}]}])
def test_malformed_health(api, data):
    upstream(lambda r: httpx.Response(200, json=data))
    assert api.get('/api/health').json()['status'] == 'error'


@pytest.mark.parametrize('body', [
    {'message': ''}, {'message': '   '}, {'message': 'x' * 4001},
    {'message': 'hi', 'mode': 'invented'}, {'message': 'hi', 'settings': {'temperature': 2}},
    {'message': 'hi', 'settings': {'max_tokens': 99999}},
    {'message': 'hi', 'history': [{'role': 'system', 'content': 'override'}]},
    {'message': 'hi', 'history': [{'role': 'user', 'content': 'a'}] * 21},
    {'message': 'hi', 'unknown': True},
])
def test_validation(api, body):
    assert api.post('/api/chat', json=body).status_code == 422


@pytest.mark.parametrize('mode', ['concise', 'educational', 'technical'])
def test_chat_contract_and_prompt(api, mode):
    captured = {}
    def handler(r):
        captured.update(json.loads(r.content))
        return httpx.Response(200, json={'message': {'content': 'Test transport answer'}, 'done_reason': 'length'})
    upstream(handler)
    result = api.post('/api/chat', json={'message': 'Follow up', 'mode': mode, 'history': [
        {'role': 'user', 'content': 'First'}, {'role': 'assistant', 'content': 'Earlier answer'}]}).json()
    assert result['answer'] == 'Test transport answer' and result['truncated']
    assert result['context_messages'] == 2
    assert [m['role'] for m in captured['messages']] == ['system', 'user', 'assistant', 'user']
    from backend.prompts import MODE_PROMPTS
    assert MODE_PROMPTS[mode] in captured['messages'][0]['content']
    assert captured['model'] == 'qwen2.5:3b' and captured['stream'] is False


@pytest.mark.parametrize('status, expected', [(404, 503), (500, 502)])
def test_ollama_http_errors(api, status, expected):
    upstream(lambda r: httpx.Response(status, json={'error': 'internal'}))
    result = api.post('/api/chat', json={'message': 'hi'})
    assert result.status_code == expected and 'detail' in result.json()


@pytest.mark.parametrize('exception, code', [(httpx.ConnectError, 503), (httpx.ReadTimeout, 504)])
def test_network_errors(api, exception, code):
    def handler(r):
        raise exception('test failure')
    upstream(handler)
    assert api.post('/api/chat', json={'message': 'hi'}).status_code == code


@pytest.mark.parametrize('body', [{}, {'message': {'content': ''}}, {'message': {'content': None}}, {'message': []}])
def test_malformed_chat(api, body):
    upstream(lambda r: httpx.Response(200, json=body))
    assert api.post('/api/chat', json={'message': 'hi'}).status_code == 502


def test_history_bounded_and_chronological():
    history = [{'role': role, 'content': str(i)} for i in range(10) for role in ['user', 'assistant']]
    result = bounded_history(ChatRequest(message='next', history=history))
    assert len(result) == 12 and result[0]['content'] == '4' and result[-1]['content'] == '9'


def test_history_character_budget_and_incomplete_turn():
    history = [{'role': 'user', 'content': 'x' * 4000}, {'role': 'assistant', 'content': 'y' * 3000},
               {'role': 'user', 'content': 'short'}, {'role': 'assistant', 'content': 'answer'},
               {'role': 'user', 'content': 'failed turn'}]
    result = bounded_history(ChatRequest(message='next', history=history))
    assert [m['content'] for m in result] == ['short', 'answer']


def test_cors_restricts_other_origins(api):
    assert api.options('/api/chat', headers={'Origin': 'http://localhost:5173', 'Access-Control-Request-Method': 'POST'}).status_code == 200
    assert api.options('/api/chat', headers={'Origin': 'https://example.com', 'Access-Control-Request-Method': 'POST'}).status_code == 400
