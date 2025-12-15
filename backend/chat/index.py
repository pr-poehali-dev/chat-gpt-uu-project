import json
import os
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Обрабатывает запросы к OpenAI GPT для чата с ИИ помощником
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Метод не разрешен'}),
            'isBase64Encoded': False
        }
    
    try:
        body_str = event.get('body', '')
        if not body_str or body_str.strip() == '':
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Сообщения не переданы'}),
                'isBase64Encoded': False
            }
        
        body_data = json.loads(body_str)
        messages: List[Dict[str, str]] = body_data.get('messages', [])
        
        if not messages:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Сообщения не переданы'}),
                'isBase64Encoded': False
            }
        
        from openai import OpenAI
        import httpx
        
        api_key = os.environ.get('OPENAI_API_KEY')
        
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'API ключ не настроен'}),
                'isBase64Encoded': False
            }
        
        http_client = httpx.Client()
        client = OpenAI(api_key=api_key, http_client=http_client)
        
        response = client.chat.completions.create(
            model='gpt-3.5-turbo',
            messages=[
                {'role': 'system', 'content': 'Ты дружелюбный помощник.'}
            ] + messages,
            max_tokens=150
        )
        
        reply = response.choices[0].message.content
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'reply': reply}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }