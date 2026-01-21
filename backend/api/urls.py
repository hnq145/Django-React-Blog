from django.urls import path, include, re_path
from rest_framework_simplejwt.views import TokenRefreshView
from api import views as api_views
from .views import ContentGenerateView 

urlpatterns = [
  path('user/token/', api_views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'), 
  path('user/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), 
  path('user/change-password/', api_views.ChangePasswordAPIView.as_view(), name='change_password'),
  path('user/register/', api_views.RegisterView.as_view(), name='register'),
  path('user/profile/', api_views.ProfileView.as_view(), name='user_profile'),
  path('user/search/', api_views.UserSearchAPIView.as_view(), name='user_search'),
  path('user/profile/<int:user_id>/', api_views.UserProfileView.as_view(), name='user_public_profile'),
  path('user/follow/', api_views.FollowUserAPIView.as_view(), name='user_follow'),

  # Post Endpoint
  path('post/category/list/', api_views.CategoryListAPIView.as_view(), name='category_list'),
  path('post/category/posts/<category_slug>/', api_views.PostCategoryListAPIView.as_view(), name='category_posts'),
  path('post/lists/', api_views.PostListAPIView.as_view(), name='home'),
  path('post/lists/author/<int:user_id>/', api_views.AuthorPostListAPIView.as_view(), name='author_post_list'),
  path('post/lists/following/', api_views.FollowingPostListAPIView.as_view(), name='home_following'), 
  path('post/detail/<slug>/', api_views.PostDetailAPIView.as_view(), name='post_detail'),
  path('post/like-post/', api_views.LikePostAPIView.as_view(), name='like_post'),
  path('post/comment-post/', api_views.PostCommentAPIView.as_view(), name='comment_post'),
  path('post/bookmark-post/', api_views.BookmarkPostAPIView.as_view(), name='bookmark_post'),
  path('content/generate/', ContentGenerateView.as_view(), name='ai_content_generate'),

  # Dashboard APIS
  path('author/dashboard/stats/', api_views.DashboardStats.as_view(), name='dashboard_stats'),
  path('author/dashboard/post-list/', api_views.DashboardPostLists.as_view(), name='dashboard_post_list'),
  path('author/dashboard/comment-list/', api_views.DashboardCommentLists.as_view(), name='dashboard_comment_list'),
  path('author/dashboard/noti-list/', api_views.DashboardNotificationList.as_view(), name='dashboard_noti_list'),
  path('author/dashboard/noti-mark-seen/', api_views.DashboardMarkNotificationAsSeen.as_view(), name='dashboard_noti_mark_seen'),
  path('author/dashboard/noti-mark-all-seen/', api_views.DashboardMarkAllNotificationsAsSeen.as_view(), name='dashboard_noti_mark_all_seen'),
  path('author/dashboard/reply-comment/', api_views.DashboardReplyCommentAPIView.as_view(), name='dashboard_reply_comment'), 
  path('author/dashboard/post-create/', api_views.DashboardPostCreateAPIView.as_view(), name='dashboard_post_create'),
  path('author/dashboard/post-detail/<post_id>/', api_views.DashboardPostEditAPIView.as_view(), name='dashboard_post_edit'),
  path('author/dashboard/comment-detail/<int:pk>/', api_views.DashboardCommentDetailAPIView.as_view(), name='dashboard_comment_detail'),
  path('author/dashboard/category-list/', api_views.DashboardCategoryListCreateAPIView.as_view(), name='dashboard_category_list'),
  path('author/dashboard/category-detail/<int:pk>/', api_views.DashboardCategoryUpdateDeleteAPIView.as_view(), name='dashboard_category_detail'),
]