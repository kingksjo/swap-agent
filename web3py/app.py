import json
from web3 import Web3
from decouple import config

web3 = Web3(Web3.HTTPProvider(config('infra_url')))

abi = json.loads(config('abi'))

address = config('address')

# Creating an instance of the contract
contract =  web3.eth.contract(address=address, abi=abi)

# Contract Total Supply
total_supply = contract.functions.totalSupply().call()

# Convert Total Supply to Ether
converted_totalSupply = web3.from_wei(total_supply, 'ether')

# Token Name
contract_name = contract.functions.name().call()

# Token Symbol
contract_symbol = contract.functions.symbol.call()

# Balance of An Address
balance_of = contract.functions.balanceOf().call()



# ---------------------------------------------------------------------------------------------------------------------------------
# Creating Transactions
"""
Steps For Creating a Transaction
(Prelimnary step, get the nonce)
1. Build a transaction
2. Sign transaction
3. Send transaction
4. Get transaction hash

"""

web3 = Web3(Web3.HTTPProvider(config('ganache_url')))

account1 = config('account1')
account2 = config('account2')
private_key = config('private_key')

nonce = web3.eth.get_transaction_count(account1)

tx = {
    'nonce': nonce,
    'to': account2,
    'value': web3.to_wei(1, 'ether'),
    'gas': 2000000,
    'gasPrice': web3.to_wei('50', 'gwei')
}

signedTx = web3.eth.account.sign_transaction(tx, private_key)
tx_hash = web3.eth.send_raw_transaction(signedTx.rawTransaction)
print(web3.to_hex(tx_hash))

# ---------------------------------------------------------------------------------------------------------------------------------
# Calling Contract functions
abi = json.loads(config('abi'))
contract_address = web3.to_checksum_address("")

contract = web3.eth.contract(address=contract_address, abi=abi)

web3.eth.default_account = web3.eth.accounts[0]
# Reading from the contract
print(contract.functions.greet().call())

# Writing to the contract
tx_hash =contract.functions.setGreeting("Hello, Web3!").transact()
tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

# ---------------------------------------------------------------------------------------------------------------------------------
# Deploying a Contract
abi = json.loads(config('abi'))


web3.eth.default_account = web3.eth.accounts[0]

Greeter = web3.eth.contract(abi=abi, bytecode=config('bytecode'))

tx_hash = Greeter.constructor().transact()
tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

contract = web3.eth.contract(address=tx_receipt.contractAddress, abi=abi)

tx_hash =contract.functions.setGreeting("Hello, Web3!").transact()
