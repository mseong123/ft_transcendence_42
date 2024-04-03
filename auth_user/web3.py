from web3 import Web3

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

contract_address = "0x02c70D25D48DAe6D657F11e5F7f875d513CE5d84" # should be in .env (after ganache spin up)
sender_address = web3.eth.accounts[1] # using 2nd account in ganache

# Tournament address
contract = web3.eth.contract(address=contract_address, abi=abi)

def updateMatchScore(tournamentId, matchId, score1, score2):
    contract.functions.updateMatchScore(tournamentId, matchId, score1, score2).transact({ "from": sender_address, "gas": 1000000 })

def getTournamentInfo(tournamentId):
    print("Tournament function called")
    result = contract.functions.getTournamentInfo(tournamentId).call()
    print(result)
    return result
