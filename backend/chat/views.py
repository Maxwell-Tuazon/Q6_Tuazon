from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

import json
import os
import logging
import traceback

from subscriptions.models import UserSubscription

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = (
    "You are the Pest & Wildlife Control assistant: a helpful, concise expert about pest and wildlife control services. "
    "Answer user questions briefly and to the point, focused on services, pest control, wildlife removal, and related guidance. "
    "If a user asks for disallowed content, reply: \"Sorry, I can't assist with that.\""
)


@api_view(['POST'])
def chat_endpoint(request):
    # DRF Request provides `request.data` and authentication is handled by JWTAuthentication
    try:
        payload = request.data if hasattr(request, 'data') else json.loads(request.body.decode('utf-8'))
    except Exception:
        return Response({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)

    message = payload.get('message') or payload.get('prompt')
    if not message:
        return Response({'error': 'Missing "message" field'}, status=status.HTTP_400_BAD_REQUEST)

    user = getattr(request, 'user', None)
    # Try manual header or body-token fallback (do this before any subscription checks)
    if (not user or not getattr(user, 'is_authenticated', False)):
        # Log headers for debugging (helps when proxies or dev server strip Authorization)
        try:
            logger.debug('Request Authorization header (request.headers): %s', request.headers.get('Authorization'))
        except Exception:
            logger.debug('Request has no request.headers attribute')
        logger.debug('Request META HTTP_AUTHORIZATION: %s', request.META.get('HTTP_AUTHORIZATION'))

        jwt_auth = JWTAuthentication()
        # 1) Try manual Authorization header (sometimes proxies strip or lowercase headers)
        header_token = None
        auth_header = None
        try:
            auth_header = request.headers.get('Authorization') if hasattr(request, 'headers') else None
        except Exception:
            auth_header = None
        if not auth_header:
            auth_header = request.META.get('HTTP_AUTHORIZATION')

        if auth_header:
            # header value may be 'Bearer <token>' or just the token
            header_token = auth_header.split()[-1]
            try:
                logger.info('Attempting to validate token from Authorization header')
                validated = jwt_auth.get_validated_token(header_token)
                user_obj = jwt_auth.get_user(validated)
                request.user = user_obj
                user = user_obj
                logger.info('Authenticated user from header: %s', getattr(user, 'email', repr(user)))
            except Exception as ex:
                logger.warning('Header token validation failed: %s', str(ex))
                logger.debug('Header token traceback', exc_info=True)
                # If the token appears to be a refresh token, try to obtain an access token from it
                try:
                    from rest_framework_simplejwt.tokens import RefreshToken
                    if 'Given token not valid for any token type' in str(ex):
                        logger.info('Attempting to treat header token as refresh token')
                        refresh = RefreshToken(header_token)
                        access_from_refresh = str(refresh.access_token)
                        validated = jwt_auth.get_validated_token(access_from_refresh)
                        user_obj = jwt_auth.get_user(validated)
                        request.user = user_obj
                        user = user_obj
                        logger.info('Authenticated user from header refresh token: %s', getattr(user, 'email', repr(user)))
                except Exception as ex2:
                    logger.warning('Header refresh-to-access fallback failed: %s', str(ex2))
                    logger.debug('Header refresh fallback traceback', exc_info=True)
                # continue to body fallback
                pass

        # 2) Body token fallback
        if not user or not getattr(user, 'is_authenticated', False):
            token_from_body = None
            if isinstance(payload, dict):
                token_from_body = payload.get('access') or payload.get('token')
            if token_from_body:
                try:
                    logger.info('Attempting to validate token from request body')
                    validated = jwt_auth.get_validated_token(token_from_body)
                    user_obj = jwt_auth.get_user(validated)
                    request.user = user_obj
                    user = user_obj
                    logger.info('Authenticated user from body token: %s', getattr(user, 'email', repr(user)))
                except Exception as ex:
                    logger.warning('Body token validation failed: %s', str(ex))
                    logger.debug('Body token traceback', exc_info=True)
                    # Try refresh-to-access fallback if appropriate
                    try:
                        from rest_framework_simplejwt.tokens import RefreshToken
                        if 'Given token not valid for any token type' in str(ex):
                            logger.info('Attempting to treat body token as refresh token')
                            refresh = RefreshToken(token_from_body)
                            access_from_refresh = str(refresh.access_token)
                            validated = jwt_auth.get_validated_token(access_from_refresh)
                            user_obj = jwt_auth.get_user(validated)
                            request.user = user_obj
                            user = user_obj
                            logger.info('Authenticated user from body refresh token: %s', getattr(user, 'email', repr(user)))
                    except Exception as ex2:
                        logger.warning('Body refresh-to-access fallback failed: %s', str(ex2))
                        logger.debug('Body refresh fallback traceback', exc_info=True)
                    # fall through to auth required
                    pass
    # If still no authenticated user, return clear 401
    if not user or not getattr(user, 'is_authenticated', False):
        return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)

    # Check subscription usage: user must have active subscription with usage_left
    subs = UserSubscription.objects.filter(user=user, is_active=True).order_by('-subscribed_at').first()
    if not subs or subs.usage_left <= 0:
        return Response({'error': 'No active subscription or usage exhausted'}, status=402)

    # decrement usage atomically to avoid race conditions (use F expression)
    try:
        from django.db.models import F
        updated = UserSubscription.objects.filter(pk=subs.pk, usage_left__gt=0).update(usage_left=F('usage_left') - 1)
        if not updated:
            return Response({'error': 'No active subscription or usage exhausted'}, status=402)
        # refresh from db so subsequent code / responses read the new value
        subs.refresh_from_db()
    except Exception:
        # fallback to simple decrement on unexpected errors
        subs.usage_left = subs.usage_left - 1
        subs.save()

    api_key = os.getenv('GENAI_API_KEY')
    if not api_key:
        # Try to find a .env file in parent directories and read GENAI_API_KEY manually as a fallback
        try:
            from pathlib import Path
            env_key = None
            p = Path(__file__).resolve().parent
            # walk up until filesystem root
            while True:
                candidate = p / '.env'
                if candidate.exists():
                    for line in candidate.read_text(encoding='utf-8').splitlines():
                        line = line.strip()
                        if not line or line.startswith('#'):
                            continue
                        if line.startswith('GENAI_API_KEY'):
                            # split on = and strip quotes
                            parts = line.split('=', 1)
                            if len(parts) == 2:
                                val = parts[1].strip()
                                if (val.startswith("'") and val.endswith("'")) or (val.startswith('"') and val.endswith('"')):
                                    val = val[1:-1]
                                env_key = val
                                break
                    if env_key:
                        api_key = env_key
                        break
                if p == p.parent:
                    break
                p = p.parent
        except Exception:
            api_key = None

    if not api_key:
        logger.error('GENAI_API_KEY not set in environment or .env; cannot call AI service')
        return Response({'error': 'AI service not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    try:
        from google import genai
    except Exception:
        logger.exception('google.genai package not available')
        return Response({'error': 'AI client library not installed on server'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    client = genai.Client(api_key=api_key)

    try:
        logger.debug('chat_endpoint called with payload: %s', payload)
        # Prepend system prompt to the user message so the model receives role instructions
        combined = f"System: {SYSTEM_PROMPT}\n\nUser: {message}"
        # Use the models.generate_content API to produce text output
        completion = client.models.generate_content(model="gemini-2.5-flash", contents=combined)

        # Extract reply text from the response object (has .text on successful generate_content)
        reply = None
        if hasattr(completion, 'text'):
            reply = completion.text
        elif isinstance(completion, dict):
            out = completion.get('output')
            if out and isinstance(out, list):
                c0 = out[0].get('content') if isinstance(out[0], dict) else None
                if c0 and isinstance(c0, list):
                    reply = c0[0].get('text') if isinstance(c0[0], dict) else None
        if not reply:
            reply = str(completion)

        return Response({'reply': reply})
    except Exception as e:
        # Log full traceback to make debugging easier in server output
        logger.exception('AI call failed')
        tb = traceback.format_exc()
        # Still return a concise error to the client
        return Response({'error': 'AI call failed', 'details': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
