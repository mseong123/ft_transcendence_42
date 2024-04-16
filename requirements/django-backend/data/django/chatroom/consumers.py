# import json

# from channels.generic.websocket import WebsocketConsumer


# class ChatConsumer(WebsocketConsumer):
#     def connect(self):
#         self.accept()

#     def disconnect(self, close_code):
#         pass

#     def receive(self, text_data):
#         text_data_json = json.loads(text_data)
#         username = text_data_json["username"]
#         message = text_data_json["message"]

#         self.send(text_data=json.dumps({"username": username, "message": message}))


import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer


class ChatConsumer(WebsocketConsumer):
    onlineUsers = []
    def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = "chat_%s" % self.room_name
        if not self.scope['user'].is_authenticated:
            self.close()
        else:
            # Join room group
            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name, self.channel_name
            )
            # Only add to list if not in list of current online players
            # Might just change on front end to not repeat as can have multiple browser login at same time
            user = str(self.scope['user'])
            if user not in ChatConsumer.onlineUsers:
                ChatConsumer.onlineUsers.append(user)
            # send an updated list of online users
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name, {"type": "online_users", "onlineUsers": ChatConsumer.onlineUsers}
            )
            self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

        # Get disconnected username, remove from onlineUsers list and update everyones list
        # username = self.user.username
        ChatConsumer.onlineUsers.remove(str(self.scope['user']))
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {"type": "online_users", "onlineUsers": ChatConsumer.onlineUsers}
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)

        if text_data_json['type'] == "msg":      
            # Send message to room group
            username = text_data_json["username"]
            message = text_data_json["message"]
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name, {"type": "chat_message", "username": username, "message": message}
            )
        elif text_data_json['type'] == "pm":
            # Send pm request to room group
            sender = text_data_json["sender"]
            receiver = text_data_json["receiver"]
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name, {"type": "private_message", "sender": sender, "receiver": receiver}
            ) 

    # Receive message from room group
    def chat_message(self, event):
        message = event["message"]
        username = event["username"]
        # Send message to WebSocket
        self.send(text_data=json.dumps({"type": "msg", "username": username, "message": message}))

    # Receive online user list from room group
    def online_users(self, event):
        onlineUsers = event["onlineUsers"]
        # Send message to WebSocket
        self.send(text_data=json.dumps({"type": "userlist", "onlineUsers": onlineUsers}))

    # Receive private message request from room group
    def private_message(self, event):
        sender = event["sender"]
        receiver = event["receiver"]
        # Send message to WebSocket
        self.send(text_data=json.dumps({"type": "pm", "sender": sender, "receiver": receiver}))

class PrivateChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = "chat_%s" % self.room_name
        userlist = self.room_name.split('_')
        user = self.scope['user']
        if not user.is_authenticated or str(user) not in userlist:
            self.close()
        else:
            # Join room group
            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name, self.channel_name
            )
            self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)

        if text_data_json['type'] == "msg":      
            # Send message to room group
            username = text_data_json["username"]
            message = text_data_json["message"]
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name, {"type": "chat_message", "username": username, "message": message}
            )

    # Receive message from room group
    def chat_message(self, event):
        message = event["message"]
        username = event["username"]
        # Send message to WebSocket
        self.send(text_data=json.dumps({"type": "msg", "username": username, "message": message}))