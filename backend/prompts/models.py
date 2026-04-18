import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Prompt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    content = models.TextField()
    complexity = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    # The new ManyToMany relationship
    tags = models.ManyToManyField(Tag, related_name='prompts', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
    def clean(self):        
        if len(self.title) < 3:
            raise ValidationError('Title must have at least 3 characters')
        
        if len(self.content) < 20:
            raise ValidationError('Content must be at least 20 characters long')