import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from matches.models import Matches, Tournaments, MatchHistory
from userprofiles.models import Profile
from django.contrib.auth.models import User
from . import web3
from core import settings

class GameLobbyConsumer(WebsocketConsumer):
	gameLobbyInfo = []
	def connect(self):
		self.room_group_name = self.scope["url_route"]["kwargs"]["room_name"]
		if not self.scope['user'].is_authenticated:
			self.close()
		else:
			self.accept()
			async_to_sync(self.channel_layer.group_add)(
				self.room_group_name, self.channel_name)
			async_to_sync(self.channel_layer.group_send)(
			self.room_group_name, {"type": "gamelobby_message"})

			
	
	def disconnect(self, close_code):
		GameLobbyConsumer.gameLobbyInfo = [game for game in GameLobbyConsumer.gameLobbyInfo if game.get('mainClient') != str(self.scope['user'])]
		for game in GameLobbyConsumer.gameLobbyInfo:
			if 'player' in game:
				game['player'] = [player for player in game['player'] if player != str(self.scope["user"])]
		# Leave room group
		
		async_to_sync(self.channel_layer.group_discard)(
			self.room_group_name, self.channel_name)
		async_to_sync(self.channel_layer.group_send)(
			self.room_group_name, {"type": "gamelobby_message"})
		

	# Receive message from WebSocket
	def receive(self, text_data):
		data_json = json.loads(text_data)
		if data_json["mode"] == 'create':
			GameLobbyConsumer.gameLobbyInfo.append({"mainClient":str(self.scope["user"]), "player":[str(self.scope["user"])], "gameMode":data_json["gameMode"], "gameStart":0})
		elif data_json["mode"] == 'leave':
			GameLobbyConsumer.gameLobbyInfo = [
				game for game in GameLobbyConsumer.gameLobbyInfo if game.get('mainClient') != str(self.scope['user'])
			]
			for game in GameLobbyConsumer.gameLobbyInfo:
					game['player'] = [player for player in game['player'] if player != str(self.scope["user"])]
			
		elif data_json["mode"] == 'join':
			for game in GameLobbyConsumer.gameLobbyInfo:
				if game['mainClient'] == data_json['mainClient']:
					game['player'].append(str(self.scope['user']))
		elif data_json["mode"] == 'gameStart':
			for game in GameLobbyConsumer.gameLobbyInfo:
				if game['mainClient'] == data_json['mainClient']:
					game['gameStart'] = 1
		# Send message to room group
		async_to_sync(self.channel_layer.group_send)(
			self.room_group_name, {"type": "gamelobby_message"}
		)

	# Receive message from room group
	def gamelobby_message(self, event):
		# Send message to WebSocket
		self.send(text_data=json.dumps({"gameLobbyInfo": GameLobbyConsumer.gameLobbyInfo}))

class GameConsumer(WebsocketConsumer):
	gameInfo = {}
	def connect(self):
		self.room_group_name = self.scope["url_route"]["kwargs"]["room_name"]
		if not self.scope['user'].is_authenticated:
			self.close()
		else:
			self.accept()
			async_to_sync(self.channel_layer.group_add)(
				self.room_group_name, self.channel_name)
			if self.room_group_name != str(self.scope['user']):
				async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"gameOption"})
		
	def disconnect(self, close_code):
		if GameConsumer.gameInfo.get(str(self.scope["user"])) is not None:
			del GameConsumer.gameInfo[str(self.scope["user"])]
		elif GameConsumer.gameInfo.get(self.room_group_name) is not None:
			if str(self.scope["user"]) in GameConsumer.gameInfo[self.room_group_name]['player']:
				del GameConsumer.gameInfo[self.room_group_name]['player'][str(self.scope["user"])]
			if GameConsumer.gameInfo[self.room_group_name]['gameMode'] == 'versus':
				GameConsumer.gameInfo[self.room_group_name]['playerGame'][0]['player'] = [player for player in GameConsumer.gameInfo[self.room_group_name]['playerGame'][0]['player'] if player != str(self.scope["user"])]
				GameConsumer.gameInfo[self.room_group_name]['playerGame'][1]['player'] = [player for player in GameConsumer.gameInfo[self.room_group_name]['playerGame'][1]['player'] if player != str(self.scope["user"])]
		async_to_sync(self.channel_layer.group_discard)(self.room_group_name, self.channel_name)
		async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"gameOption"})


	# Receive message from WebSocket
	def receive(self, text_data):
		data_json = json.loads(text_data)
		if data_json.get("mode") is not None and data_json.get("mode") == 'create':
			GameConsumer.gameInfo[self.room_group_name] = data_json["gameInfo"]
			GameConsumer.gameInfo[self.room_group_name]['player'][str(self.scope["user"])] = {
				"name":str(self.scope["user"]),
				"nick_name":Profile.objects.get(user=self.scope["user"]).nick_name,
				"ready":0
			}
			if GameConsumer.gameInfo[self.room_group_name]['gameMode'] == "versus":
				GameConsumer.gameInfo[self.room_group_name]['playerGame'][0]['player'].append(str(self.scope["user"]))
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"gameOption"})
		elif data_json.get("mode") is not None and data_json.get("mode") == 'join':
			GameConsumer.gameInfo[self.room_group_name]['player'][str(self.scope["user"])] = {
				"name":str(self.scope["user"]),
				"nick_name":Profile.objects.get(user=self.scope["user"]).nick_name,
				"ready":0
			}
			if GameConsumer.gameInfo[self.room_group_name]['gameMode'] == "versus":
				if len(GameConsumer.gameInfo[self.room_group_name]['playerGame'][0]['player']) > len(GameConsumer.gameInfo[self.room_group_name]['playerGame'][1]['player']):
					GameConsumer.gameInfo[self.room_group_name]['playerGame'][1]['player'].append(str(self.scope["user"]))
				else:
					GameConsumer.gameInfo[self.room_group_name]['playerGame'][0]['player'].append(str(self.scope["user"]))
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"gameOption"})
		elif data_json.get("mode") is not None and data_json["mode"] == 'spectate':
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"gameOption"})
		elif data_json.get("mode") is not None and data_json["mode"] == 'cheat':
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"cheat", "player":data_json["player"]})
		elif data_json.get("mode") is not None and data_json["mode"] == 'updateLudicrious':
			GameConsumer.gameInfo[self.room_group_name]['ludicrious'] = data_json['ludicrious']
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"gameOption"})
		elif data_json.get("mode") is not None and data_json["mode"] == 'updateTeamName':
			GameConsumer.gameInfo[self.room_group_name]['playerGame'] = data_json['playerGame']
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"gameOption"})
		elif data_json.get("mode") is not None and data_json.get("mode") == 'updateDuration':
			GameConsumer.gameInfo[self.room_group_name]['duration'] = data_json['duration']
			GameConsumer.gameInfo[self.room_group_name]['durationCount'] = data_json['duration']
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"gameOption"})
		elif data_json.get("mode") is not None and data_json.get("mode") =='updatePowerUp':
			GameConsumer.gameInfo[self.room_group_name]['powerUp'] = data_json['powerUp']
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"gameOption"})
		elif data_json.get("mode") is not None and data_json.get("mode") =='updateReady':
			GameConsumer.gameInfo[self.room_group_name]['player'][str(self.scope["user"])]['ready'] = data_json['ready']
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"gameOption"})
		elif data_json.get("mode") is not None and data_json.get("mode") =='updatePlayer':
			GameConsumer.gameInfo[self.room_group_name]['playerGame'] = data_json['playerGame']
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"gameOption"})
		elif data_json.get("mode") is not None and data_json.get("mode") =='pause':
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"pause", "pause":data_json["pause"]})
		elif data_json.get("mode") is not None and data_json.get("mode") =='enableLargePaddle':
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"enableLargePaddle"})
		elif data_json.get("mode") is not None and data_json.get("mode") =='enableInvisibility':
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"enableInvisibility"})
		elif data_json.get("mode") is not None and data_json.get("mode") =='resetPaddle':
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"resetPaddle"})
		elif data_json.get("mode") is not None and data_json.get("mode") =='gameStart':
			GameConsumer.gameInfo[self.room_group_name] = data_json['gameInfo']
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"gameStart"})
		elif data_json.get("mode") is not None and data_json.get("mode") =='gameEnd':
			GameConsumer.gameInfo[self.room_group_name] = data_json['gameInfo']
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"gameEnd"})
		elif data_json.get("mode") is not None and data_json.get("mode") =='matchFix':
			GameConsumer.gameInfo[self.room_group_name] = data_json['gameInfo']
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"matchFix"})
		elif data_json.get("mode") is not None and data_json.get("mode") =='mainClient':
			GameConsumer.gameInfo[self.room_group_name] = data_json["gameInfo"]
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"mainClient", "liveGameData":data_json["liveGameData"]})
		elif data_json.get("mode") is not None and data_json.get("mode") =='player':
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game_message", "message":"player", "playerName":data_json["playerName"],"liveGameData":data_json["liveGameData"]})
		elif data_json.get("mode") is not None and data_json.get("mode") =='recordMatch':
			if data_json["gameInfo"]["gameMode"] == "versus":
				match = Matches.objects.create(t1_points=data_json["gameInfo"]['playerGame'][0]["score"],t2_points=data_json["gameInfo"]['playerGame'][1]["score"])
				teamOne = []
				teamTwo = []
				for player in data_json["gameInfo"]['playerGame'][0]['player']:
					match.t1.add(User.objects.get(username=player))
				for player in data_json["gameInfo"]['playerGame'][1]['player']:
					match.t2.add(User.objects.get(username=player))
				for key in data_json["gameInfo"]['player']:
					match_history = MatchHistory.objects.get(user=User.objects.get(username=key))
					match_history.matches.add(match)
			elif data_json["gameInfo"]["gameMode"] == "tournament":
				bc_match_id_list = []
				bc_t1_score_list = []
				bc_t2_score_list = []
				last_game = len(data_json["gameInfo"]["playerGame"]) - 1
				winner = data_json["gameInfo"]["playerGame"][last_game][0]["alias"] if data_json["gameInfo"]["playerGame"][last_game][0]["winner"] else data_json["gameInfo"]["playerGame"][last_game][1]["alias"]
				tournament = Tournaments.objects.create(winner=User.objects.get(username=winner))
				match_list = []
				for match in data_json["gameInfo"]['playerGame']:
					matches = Matches.objects.create(t1_points=match[0]["score"],t2_points=match[1]["score"])
					matches.t1.add(User.objects.get(username=match[0]["alias"]))
					matches.t2.add(User.objects.get(username=match[1]["alias"]))
					tournament.matches.add(matches)
					match_list.append(matches)
					bc_match_id_list.append(matches.id)
					bc_t1_score_list.append(match[0]["score"])
					bc_t2_score_list.append(match[1]["score"])
				
				# Update blockchain
				if settings.USE_WEB3:
					print(tournament.id)
					print(bc_match_id_list)
					print(bc_t1_score_list)
					print(bc_t2_score_list)
					blockchain_tx = web3.createTournament(tournament.id, bc_match_id_list, bc_t1_score_list, bc_t2_score_list)
					if len(blockchain_tx) == 0:
						print("WARNING: Failed to create tournament")
					tournament.blockchain_tx = blockchain_tx
					tournament.save()

				for key in data_json["gameInfo"]['player']:
					match_history = MatchHistory.objects.get(user=User.objects.get(username=key))
					match_history.tournaments.add(tournament)


	# Receive message from room group
	def game_message(self, event):
		# Send message to WebSocket
		if event["message"] == "gameOption":
			if GameConsumer.gameInfo.get(self.room_group_name) is not None:
				self.send(text_data=json.dumps({
					"mode":"gameOption",
					"gameInfo": GameConsumer.gameInfo[self.room_group_name]
					}))
			else:
				self.send(text_data=json.dumps({
					"mode":"gameOption",
					"gameInfo": {}
					}))
		elif event["message"] == "gameStart":
			self.send(text_data=json.dumps({
				"mode": "gameStart",
				"gameInfo":GameConsumer.gameInfo[self.room_group_name]
				}))
		elif event["message"] == "gameEnd":
			self.send(text_data=json.dumps({
				"mode": "gameEnd",
				"gameInfo":GameConsumer.gameInfo[self.room_group_name]
				}))
		elif event["message"] == "pause":
			self.send(text_data=json.dumps({
				"mode": "pause",
				"pause":event["pause"]
				}))
		elif event["message"] == "cheat":
			self.send(text_data=json.dumps({
				"mode": "cheat",
				"player": event["player"]
				}))
		elif event["message"] == "enableLargePaddle":
			self.send(text_data=json.dumps({
				"mode": "enableLargePaddle"
				}))
		elif event["message"] == "enableInvisibility":
			self.send(text_data=json.dumps({
				"mode": "enableInvisibility"
				}))
		elif event["message"] == "resetPaddle":
			self.send(text_data=json.dumps({
				"mode": "resetPaddle"
				}))
		elif event["message"] == "matchFix":
			self.send(text_data=json.dumps({
				"mode": "matchFix",
				"gameInfo":GameConsumer.gameInfo[self.room_group_name]
				}))
		elif event["message"] == "mainClient":
			self.send(text_data=json.dumps({
				"mode": "mainClient",
				"gameInfo": GameConsumer.gameInfo[self.room_group_name],
				"liveGameData":event["liveGameData"]
				}))
		elif event["message"] == "player":
			self.send(text_data=json.dumps({
				"mode": "player",
				"playerName":event["playerName"],
				"liveGameData":event["liveGameData"]
				}))
	