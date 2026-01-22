
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_group_name = None

    async def connect(self):
        self.user = self.scope.get("user")
        print(f"NotificationConsumer: Connection attempt from user: {self.user}")

        if not self.user or not self.user.is_authenticated:
            print("NotificationConsumer: User is not authenticated. Closing connection.")
            await self.close()
            return

        print(f"NotificationConsumer: User {self.user} is authenticated.")
        self.room_group_name = f'notifications_{self.user.id}'

        try:
            print(f"NotificationConsumer: Adding channel to group '{self.room_group_name}'.")
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            print("NotificationConsumer: Successfully added to group.")
        except Exception as e:
            print(f"NotificationConsumer: FAILED to add to channel group. Error: {e}")
            await self.close()
            return

        await self.accept()
        print("NotificationConsumer: WebSocket connection accepted.")

    async def disconnect(self, close_code):
        print(f"NotificationConsumer: Disconnected with code {close_code}.")
        if self.room_group_name:
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
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_group_name = None
        
    async def connect(self):
        self.post_id = self.scope['url_route']['kwargs']['post_id']
        self.room_group_name = f'comments_{self.post_id}'

       
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        if self.room_group_name:
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

class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_group_name = None

    async def connect(self):
        self.user = self.scope.get("user")
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.user_room_group = f'chat_{self.user.id}'
        self.status_room_group = 'online_status'

        # Join user specific group
        await self.channel_layer.group_add(
            self.user_room_group,
            self.channel_name
        )

        # Join global status group
        await self.channel_layer.group_add(
            self.status_room_group,
            self.channel_name
        )

        await self.accept()
        
        # Broadcast online status
        await self.channel_layer.group_send(
            self.status_room_group,
            {
                'type': 'user_status',
                'user_id': self.user.id,
                'status': 'online'
            }
        )

    async def disconnect(self, close_code):
        if hasattr(self, 'user_room_group'):
            await self.channel_layer.group_discard(
                self.user_room_group,
                self.channel_name
            )
        
        if hasattr(self, 'status_room_group'):
            # Broadcast offline status
            await self.channel_layer.group_send(
                self.status_room_group,
                {
                    'type': 'user_status',
                    'user_id': self.user.id,
                    'status': 'offline'
                }
            )
            
            await self.channel_layer.group_discard(
                self.status_room_group,
                self.channel_name
            )

    async def receive(self, text_data):
        pass

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message
        }))

    async def user_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'user_id': event['user_id'],
            'status': event['status']
        }))
