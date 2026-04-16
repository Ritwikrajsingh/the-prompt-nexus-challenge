import json
import redis
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import Prompt

# Initialize Redis client
# decode_responses=True ensures we get strings back from Redis, not bytes
redis_client = redis.Redis(
    host=settings.REDIS_HOST, 
    port=settings.REDIS_PORT, 
    db=0, 
    decode_responses=True
)

@csrf_exempt
def prompt_list_create(request):
    # GET /prompts/ : List all prompts
    if request.method == 'GET':
        prompts = Prompt.objects.all().order_by('-created_at')
        # Manually serialize the queryset
        data = [
            {
                "id": str(p.id),
                "title": p.title,
                "complexity": p.complexity,
                "created_at": p.created_at.isoformat()
            } for p in prompts
        ]
        return JsonResponse(data, safe=False)

    # POST /prompts/ : Create a new prompt
    elif request.method == 'POST':
        try:
            body = json.loads(request.body)
            prompt = Prompt.objects.create(
                title=body['title'],
                content=body['content'],
                complexity=body['complexity']
            )
            return JsonResponse({
                "id": str(prompt.id),
                "title": prompt.title,
                "content": prompt.content,
                "complexity": prompt.complexity,
                "created_at": prompt.created_at.isoformat()
            }, status=201)
        except (KeyError, json.JSONDecodeError) as e:
            return JsonResponse({"error": "Invalid JSON or missing fields"}, status=400)

@csrf_exempt
def prompt_detail(request, pk):
    # GET /prompts/:id/ : Retrieve a single prompt
    if request.method == 'GET':
        prompt = get_object_or_404(Prompt, pk=pk)

        # Redis Integration: Increment the view counter
        redis_key = f"prompt_views:{pk}"
        # .incr() automatically creates the key starting at 0 if it doesn't exist, then adds 1
        view_count = redis_client.incr(redis_key)

        return JsonResponse({
            "id": str(prompt.id),
            "title": prompt.title,
            "content": prompt.content,
            "complexity": prompt.complexity,
            "created_at": prompt.created_at.isoformat(),
            "view_count": view_count
        })