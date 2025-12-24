from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from api import views as api_views
from .views import ContentGenerateView

urlpatterns = [
    path('user/token/', api_views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'), 
    path('user/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), 
    path('user/register/', api_views.RegisterView.as_view(), name='register'),
    path('user/profile/<user_id>/', api_views.ProfileView.as_view(), name='user_profile'),

    # Post Endpoint
    path('post/category/list/', api_views.CategoryListAPIView.as_view(), name='category_list'),
    path('post/category/posts/<category_slug>/', api_views.PostCategoryListAPIView.as_view(), name='category_posts'),
    path('post/lists/', api_views.PostListAPIView.as_view(), name='home'), 
    path('post/detail/<slug>/', api_views.PostDetailAPIView.as_view(), name='post_detail'),
    path('post/like-post/', api_views.LikePostAPIView.as_view(), name='like_post'),
    path('post/comment-post/', api_views.PostCommentAPIView.as_view(), name='comment_post'),
    path('post/bookmark-post/', api_views.BookmarkPostAPIView.as_view(), name='bookmark_post'),
    path('v-content/generate/', ContentGenerateView.as_view(), name='ai_content_generate'),

    # Dashboard APIS
    path('author/dashboard/stats/<user_id>/', api_views.DashboardStats.as_view(), name='dashboard_stats'),
    path('author/dashboard/post-list/<user_id>/', api_views.DashboardPostLists.as_view(), name='dashboard_post_list'),
    path('author/dashboard/comment-list/<user_id>/', api_views.DashboardCommentLists.as_view(), name='dashboard_comment_list'),
    path('author/dashboard/noti-list/<user_id>/', api_views.DashboardNotificationList.as_view(), name='dashboard_noti_list'),
    path('author/dashboard/noti-mark-seen/', api_views.DashboardBookmarkNotificationAsSeen.as_view(), name='dashboard_noti_mark_seen'),
    path('author/dashboard/reply-comment/', api_views.DashboardReplyCommentAPIView.as_view(), name='dashboard_reply_comment'), 
    path('author/dashboard/post-create/', api_views.DashboardPostCreateAPIView.as_view(), name='dashboard_post_create'),
    path('author/dashboard/post-detail/<user_id>/<post_id>/', api_views.DashboardPostEditAPIView.as_view(), name='dashboard_post_edit'),
]
