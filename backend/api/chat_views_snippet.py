
class SendMessageAPIView(generics.CreateAPIView):
    permission_classes = [AllowAny] 
    serializer_class = api_serializer.ChatMessageSerializer

    def create(self, request, *args, **kwargs):
        # We assume sender is logged in, but for flexibility we might accept sender_id
        # Ideally, use request.user as sender
        
        sender_id = request.data.get('sender_id')
        receiver_id = request.data.get('receiver_id')
        message = request.data.get('message')

        sender = api_models.User.objects.get(id=sender_id)
        receiver = api_models.User.objects.get(id=receiver_id)

        chat_message = api_models.ChatMessage.objects.create(
            sender=sender,
            receiver=receiver,
            message=message,
            is_read=False
        )
        
        # Realtime notification for Chat is handled in Signals or Consumer 
        # But for now, we just save and return
        
        return Response(api_serializer.ChatMessageSerializer(chat_message).data, status=status.HTTP_201_CREATED)

class GetMessagesAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ChatMessageSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        sender_id = self.kwargs['sender_id']
        receiver_id = self.kwargs['receiver_id']
        
        messages = api_models.ChatMessage.objects.filter(
            sender__id=sender_id, receiver__id=receiver_id
        ) | api_models.ChatMessage.objects.filter(
            sender__id=receiver_id, receiver__id=sender_id
        )
        
        return messages.order_by('date')

class InboxAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ChatMessageSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        
        # Get all messages where user is sender or receiver
        messages = api_models.ChatMessage.objects.filter(
            models.Q(sender__id=user_id) | models.Q(receiver__id=user_id)
        )
        
        # distinct users is tricky with Django ORM on complex Q
        # easier to get latest message per conversation
        
        # Logic: 
        # 1. Get all unique users interacted with
        # 2. For each user, get latest message
        # This approach is better done in Python for simpler code, 
        # OR using Subquery for optimization. For now, let's do simple python processing or return all messages and frontend filters.
        # Returning all messages is heavy. 
        # Let's try to return list of *latest* message for each partner.
        
        return messages.order_by("-date")
        
    def list(self, request, *args, **kwargs):
        user_id = self.kwargs['user_id']
        messages = self.get_queryset()
        
        # Group by conversation partner
        partners = []
        conversation_map = {}
        
        for msg in messages:
            if msg.sender.id == int(user_id):
                partner = msg.receiver
            else:
                partner = msg.sender
                
            if partner.id not in conversation_map:
                conversation_map[partner.id] = {
                    'partner': partner,
                    'latest_message': msg
                }
        
        data = []
        for partner_id, item in conversation_map.items():
            # Construct a custom response
            partner_profile = api_serializer.ProfileSerializer(item['partner'].profile, context={'request': request}).data
            data.append({
                'partner': partner_profile,
                'latest_message': api_serializer.ChatMessageSerializer(item['latest_message']).data
            })
            
        return Response(data)
