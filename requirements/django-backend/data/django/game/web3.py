from web3 import Web3
from web3.exceptions import ContractLogicError
from core import settings

abi = [
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": False,
          "internalType": "string",
          "name": "tournamentId",
          "type": "string"
        },
        {
          "indexed": False,
          "internalType": "string",
          "name": "matchId",
          "type": "string"
        },
        {
          "indexed": False,
          "internalType": "string",
          "name": "team1Score",
          "type": "string"
        },
        {
          "indexed": False,
          "internalType": "string",
          "name": "team2Score",
          "type": "string"
        }
      ],
      "name": "MatchScoreCreated",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": False,
          "internalType": "string",
          "name": "tournamentId",
          "type": "string"
        },
        {
          "indexed": False,
          "internalType": "string",
          "name": "_matchIds",
          "type": "string"
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

if settings.USE_WEB3:
    web3 = Web3(Web3.HTTPProvider(settings.ETH_HOST))

    if web3.is_connected():
        print("Connected to Ethereum node")
    else:
        print("Failed to connect to Ethereum node")

    contract_address = settings.CONTRACT_ADDR # should be in .env (after ganache spin up)
    sender_address = settings.SENDER_ADDR
    private_key = settings.PRIVATE_KEY

    # Tournament address
    print("With contract address:")
    print(contract_address);
    contract = web3.eth.contract(address=contract_address, abi=abi)
            
    def createTournament(tournamentId, matchIds, team1Scores, team2Scores):
        try:
            transaction = contract.functions.createTournament(tournamentId, matchIds, team1Scores, team2Scores).build_transaction({ "nonce": web3.eth.get_transaction_count(sender_address), "gas": 1000000 })
            signed_txn = web3.eth.account.sign_transaction(transaction, private_key)
            tx_hash = web3.eth.send_raw_transaction(signed_txn.rawTransaction)
            return tx_hash.hex()
        except ContractLogicError as _:
            return ""

    # def updateMatchScore(tournamentId, matchId, team1, team2):
    #     transaction = contract.functions.updateMatchScore(tournamentId, matchId, team1, team2).build_transaction({ "nonce": web3.eth.get_transaction_count(sender_address), "gas": 1000000 })
    #     signed_txn = web3.eth.account.sign_transaction(transaction, private_key)
    #     web3.eth.send_raw_transaction(signed_txn.rawTransaction)
    
    def getTournamentInfo(tournamentId):
        try:
            result = contract.functions.getTournamentInfo(tournamentId).call()
            return result
        except ContractLogicError as _:
            return ""
    