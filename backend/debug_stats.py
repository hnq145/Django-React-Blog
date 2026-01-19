
print("Debugging DashboardStats...")
from api.models import Post, User, Bookmark
from django.db.models import Sum, Count

# Assuming you can run this in a shell or management command, 
# but for now I'm just listing what I would check.

# Check if there are any posts for the user
# user_id = ...
# posts = Post.objects.filter(user_id=user_id)
# print(f"Posts count: {posts.count()}")
# print(f"Views sum: {posts.aggregate(view=Sum('view'))}")
