
class ChatMessageSerializer(serializers.ModelSerializer):
    receiver_profile = ProfileSerializer(read_only=True)
    sender_profile = ProfileSerializer(read_only=True)

    class Meta:
        model = api_models.ChatMessage
        fields = ['id', 'sender', 'sender_profile', 'receiver', 'receiver_profile', 'message', 'is_read', 'date']
