
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'notifications'

        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        # This consumer is for broadcasting, not receiving data from clients (for now)
        pass

    # Receive message from room group
    async def send_notification(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'message': message
        }))

class CommentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Each post will have its own comment room.
        # The post_id is extracted from the URL route.
        self.post_id = self.scope['url_route']['kwargs']['post_id']
        self.room_group_name = f'comments_{self.post_id}'

        # Join the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # This method is called when a new comment is sent to the group.
    async def send_comment(self, event):
        comment = event['comment']

        # Send the new comment to the WebSocket client
        await self.send(text_data=json.dumps({
            'type': 'new_comment',
            'comment': comment
        }))
