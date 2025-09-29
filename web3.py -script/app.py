import json
from web3 import Web3

infra_url = "https://mainnet.infura.io/v3/173408c6e6b34541b1c37c998ad7ccd7"
web3 = Web3(Web3.HTTPProvider(infra_url))

abi = json.loads('[{"constant":true,"inputs":[],"name":"mintingFinished","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"mint","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"finishMinting","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"},{"name":"_releaseTime","type":"uint256"}],"name":"mintTimelocked","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[],"name":"MintFinished","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]')

address = '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07'

# Creating an instance of the contract
contract =  web3.eth.contract(address=address, abi=abi)

# Contract Total Supply
totalSupply = contract.functions.totalSupply().call()

# Convert Total Supply to Ether
converted_totalSupply = web3.from_wei(totalSupply, 'ether')

# Token Name
contractName = contract.functions.name().call()

# Token Symbol
contractSymbol = contract.functions.symbol.call()

# Balance of An Address
balanceOf = contract.functions.balanceOf().call()



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
ganache_url = ""
web3 = Web3(Web3.HTTPProvider(ganache_url))

account1 = ""
account2 = ""
private_key = ""

nonce = web3.get_transaction_count(account1)

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
abi = json.loads("")
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
abi = json.loads("")
bytecode = ""

web3.eth.default_account = web3.eth.accounts[0]

Greeter = web3.eth,contract(abi=abi, bytecode=bytecode)

tx_hash = Greeter.constructor().transact()
tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

contract = web3.eth.contract(address=tx_receipt.contractAddress, abi=abi)

tx_hash =contract.functions.setGreeting("Hello, Web3!").transact()
