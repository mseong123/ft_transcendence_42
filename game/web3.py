from web3 import Web3
from core import settings

abi = [
        {
            "anonymous": False,
            "inputs": [
                {
                    "indexed": False,
                    "internalType": "uint256",
                    "name": "tournamentId",
                    "type": "uint256"
                },
                {
                    "indexed": False,
                    "internalType": "uint256",
                    "name": "matchId",
                    "type": "uint256"
                },
                {
                    "indexed": False,
                    "internalType": "uint256",
                    "name": "team1Score",
                    "type": "uint256"
                },
                {
                    "indexed": False,
                    "internalType": "uint256",
                    "name": "team2Score",
                    "type": "uint256"
                }
            ],
            "name": "MatchScoreUpdated",
            "type": "event"
        },
        {
            "anonymous": False,
            "inputs": [
                {
                    "indexed": False,
                    "internalType": "uint256",
                    "name": "tournamentId",
                    "type": "uint256"
                },
                {
                    "indexed": False,
                    "internalType": "uint256[]",
                    "name": "matchIds",
                    "type": "uint256[]"
                }
            ],
            "name": "TournamentCreated",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_tournamentId",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256[]",
                    "name": "_matchIds",
                    "type": "uint256[]"
                },
                {
                    "internalType": "uint256[]",
                    "name": "_team1Scores",
                    "type": "uint256[]"
                },
                {
                    "internalType": "uint256[]",
                    "name": "_team2Scores",
                    "type": "uint256[]"
                }
            ],
            "name": "createTournament",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_tournamentId",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_matchId",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_team1Score",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_team2Score",
                    "type": "uint256"
                }
            ],
            "name": "updateMatchScore",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_tournamentId",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_matchId",
                    "type": "uint256"
                }
            ],
            "name": "getMatchScore",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_tournamentId",
                    "type": "uint256"
                }
            ],
            "name": "getTournamentInfo",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]

web3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))

if web3.is_connected():
    print("Connected to Ethereum node")
else:
    print("Failed to connect to Ethereum node")

contract_address = settings.CONTRACT_ADDR # should be in .env (after ganache spin up)
sender_address = web3.eth.accounts[1] # using 2nd account in ganache

# Tournament address
contract = web3.eth.contract(address=contract_address, abi=abi)

def createTournament(tournamentId, matchIds, team1Scores, team2Scores):
    contract.functions.createTournament(tournamentId, matchIds, team1Scores, team2Scores).transact({ "from": sender_address, "gas": 1000000 })

def updateMatchScore(tournamentId, matchId, team1, team2):
    contract.functions.updateMatchScore(tournamentId, matchId, team1, team2).transact({ "from": sender_address, "gas": 1000000 })

def getTournamentInfo(tournamentId):
    result = contract.functions.getTournamentInfo(tournamentId).call()
    print(result)
    return result
