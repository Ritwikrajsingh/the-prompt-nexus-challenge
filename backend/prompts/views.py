import json
import redis
import jwt
import datetime
from django.contrib.auth import authenticate
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import Prompt, Tag
from django.db import IntegrityError

# Initialize Redis client
# decode_responses=True ensures we get strings back from Redis, not bytes
redis_client = redis.Redis(
    host=settings.REDIS_HOST, 
    port=settings.REDIS_PORT, 
    db=0, 
    decode_responses=True
)


@csrf_exempt
def register_view(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            username = body.get('username')
            password = body.get('password')
            
            # 1. Basic Validation
            if not username or not password:
                return JsonResponse({'error': 'Username and password are required'}, status=400)
            
            if len(password) < 8:
                return JsonResponse({'error': 'Password must be at least 8 characters long'}, status=400)

            # 2. Check if user exists
            if User.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Username is already taken'}, status=400)
                
            # 3. Create the User (THIS HASHES THE PASSWORD)
            user = User.objects.create_user(username=username, password=password)
            
            return JsonResponse({
                'message': 'User registered successfully',
                'id': user.id,
                'username': user.username
            }, status=201)
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': 'An error occurred during registration'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            username = body.get('username')
            password = body.get('password')
            
            user = authenticate(username=username, password=password)
            
            if user is not None:
                # Create the JWT payload
                payload = {
                    'user_id': user.id,
                    'username': user.username,
                    'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24),
                    'iat': datetime.datetime.now(datetime.timezone.utc)
                }
                
                # Encode the token
                token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
                
                return JsonResponse({'token': token})
            else:
                return JsonResponse({'error': 'Invalid credentials'}, status=401)
        except Exception:
            return JsonResponse({'error': 'Bad request'}, status=400)

@csrf_exempt
def prompt_list_create(request):
    # GET /prompts/ : List all prompts (Public)
    if request.method == 'GET':
        prompts = Prompt.objects.all().order_by('-created_at')
        
        # Tag Filtering Logic
        tag_query = request.GET.get('tag')
        if tag_query:
            prompts = prompts.filter(tags__name__iexact=tag_query)

        # Generate the list of Redis keys for these specific prompts
        redis_keys = [f"prompt_views:{p.id}" for p in prompts]
        
        # Fetch all view counts in a SINGLE call to Redis using mget()
        view_counts = redis_client.mget(redis_keys)
            
        data = [
            {
                "id": str(p.id),
                "title": p.title,
                "content": p.content,
                "complexity": p.complexity,
                "tags": [t.name for t in p.tags.all()], # Serialize tags
                "view_count": int(count) if count else 0,
                "created_at": p.created_at.isoformat()
            } for p, count in zip(prompts, view_counts)
        ]
        return JsonResponse(data, safe=False)

    # POST /prompts/ : Create a new prompt (Protected)
    elif request.method == 'POST':
        # 1. JWT Authentication Check
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({"error": "Unauthorized. Bearer token required."}, status=401)
            
        token = auth_header.split(' ')[1]
        try:
            jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "Token expired! Please login again."}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({"error": "Invalid token! A valid barer token required."}, status=401)

        # 2. Create the Prompt
        try:
            body = json.loads(request.body)
            prompt = Prompt.objects.create(
                title=body['title'],
                content=body['content'],
                complexity=body['complexity']
            )
            
            # 3. Handle Tags
            input_tags = body.get('tags', [])
            for tag_name in input_tags:
                tag_obj, created = Tag.objects.get_or_create(name=tag_name.lower())
                prompt.tags.add(tag_obj)
                
            return JsonResponse({
                "id": str(prompt.id),
                "title": prompt.title,
                "tags": [t.name for t in prompt.tags.all()],
                "status": "Created successfully"
            }, status=201)
            
        except (KeyError, json.JSONDecodeError):
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
            "tags": [t.name for t in prompt.tags.all()], # Serialize tags
            "created_at": prompt.created_at.isoformat(),
            "view_count": view_count
        })