
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

    
    async def receive(self, text_data):
        
        pass

    
    async def send_notification(self, event):
        message = event['message']

        
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'message': message
        }))

class CommentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        
        self.post_id = self.scope['url_route']['kwargs']['post_id']
        self.room_group_name = f'comments_{self.post_id}'

       
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

   
    async def send_comment(self, event):
        comment = event['comment']

        
        await self.send(text_data=json.dumps({
            'type': 'new_comment',
            'comment': comment
        }))
