from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

import json
from google import genai
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
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def chat_endpoint(request):
    # DRF Request provides `request.data` and authentication is handled by JWTAuthentication
    try:
        payload = request.data if hasattr(request, 'data') else json.loads(request.body.decode('utf-8'))
    except Exception:
        return Response({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)

    message = payload.get('message') or payload.get('prompt')
    if not message:
        return Response({'error': 'Missing "message" field'}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    # Check subscription usage: user must have active subscription with usage_left
    subs = UserSubscription.objects.filter(user=user, is_active=True).order_by('-subscribed_at').first()
    if not subs or subs.usage_left <= 0:
        return Response({'error': 'No active subscription or usage exhausted'}, status=402)

    # decrement usage
    subs.usage_left = subs.usage_left - 1
    subs.save()

    client = genai.Client(api_key="")

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
