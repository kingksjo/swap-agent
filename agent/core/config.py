# agent/core/config.py
"""
Centralized configuration management using Pydantic Settings.
All environment variables and app configuration should be defined here.
"""
from pathlib import Path
from typing import Dict, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Environment variables can be set in:
    - .env file in the agent/ directory
    - .env file in agent/core/
    - System environment variables
    - Docker/deployment configs
    """
    
    model_config = SettingsConfigDict(
        env_file=(BASE_DIR / ".env", BASE_DIR / "core/.env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # ========== API Configuration ==========
    port: int = Field(default=8000, description="Port for the FastAPI server")
    frontend_origin: str = Field(
        default="http://localhost:5173",
        description="CORS origin for frontend"
    )
    allowed_origins: Optional[str] = Field(
        default=None,
        description="Comma-separated list of additional allowed origins"
    )
    agent_api_key: Optional[str] = Field(
        default=None,
        description="Optional API key for securing agent endpoints"
    )
    
    # ========== LLM Configuration ==========
    google_api_key: str = Field(
        default=...,
        description="Google API key for Gemini LLM"
    )
    agent_system_prompt: Optional[str] = Field(
        default=None,
        description="Override for the default system prompt"
    )
    max_history_messages: int = Field(
        default=25,
        description="Maximum number of conversation messages to retain"
    )
    
    # ========== Blockchain Configuration ==========
    # Network RPC URLs
    base_mainnet_rpc_url: str = Field(
        default="https://mainnet.base.org",
        description="Base mainnet RPC URL"
    )
    base_sepolia_rpc_url: str = Field(
        default="https://sepolia.base.org",
        description="Base Sepolia testnet RPC URL"
    )
    ethereum_mainnet_rpc_url: str = Field(
        default="https://eth.llamarpc.com",
        description="Ethereum mainnet RPC URL"
    )
    ethereum_sepolia_rpc_url: str = Field(
        default="https://rpc.sepolia.org",
        description="Ethereum Sepolia testnet RPC URL"
    )
    optimism_mainnet_rpc_url: str = Field(
        default="https://mainnet.optimism.io",
        description="Optimism mainnet RPC URL"
    )
    optimism_sepolia_rpc_url: str = Field(
        default="https://sepolia.optimism.io",
        description="Optimism Sepolia testnet RPC URL"
    )
    polygon_mainnet_rpc_url: str = Field(
        default="https://polygon-rpc.com",
        description="Polygon mainnet RPC URL"
    )
    polygon_amoy_rpc_url: str = Field(
        default="https://rpc-amoy.polygon.technology",
        description="Polygon Amoy testnet RPC URL"
    )
    bnb_mainnet_rpc_url: str = Field(
        default="https://bsc-dataseed.binance.org",
        description="BNB Chain mainnet RPC URL"
    )
    bnb_testnet_rpc_url: str = Field(
        default="https://data-seed-prebsc-1-s1.binance.org:8545",
        description="BNB Chain testnet RPC URL"
    )
    
    # Default network for operations
    default_network: str = Field(
        default="base_sepolia",
        description="Default network for blockchain operations"
    )
    
    # ========== Derived Properties ==========
    @property
    def rpc_urls(self) -> Dict[str, str]:
        """
        Returns a dictionary mapping network names to their RPC URLs.
        This makes it easy to access RPC URLs by network name.
        """
        return {
            "base_mainnet": self.base_mainnet_rpc_url,
            "base_sepolia": self.base_sepolia_rpc_url,
            "ethereum_mainnet": self.ethereum_mainnet_rpc_url,
            "ethereum_sepolia": self.ethereum_sepolia_rpc_url,
            "optimism_mainnet": self.optimism_mainnet_rpc_url,
            "optimism_sepolia": self.optimism_sepolia_rpc_url,
            "polygon_mainnet": self.polygon_mainnet_rpc_url,
            "polygon_amoy": self.polygon_amoy_rpc_url,
            "bnb_mainnet": self.bnb_mainnet_rpc_url,
            "bnb_testnet": self.bnb_testnet_rpc_url,
        }
    
    @property
    def token_contracts(self) -> Dict[str, Dict[str, str]]:
        """
        Returns a dictionary of token contracts per network.
        Structure: {network_name: {token_symbol: contract_address}}
        
        NOTE: These are placeholder addresses. You should replace them with
        actual token contract addresses for each network.
        """
        return {
            "base_sepolia": {
                "USDC": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
                "USDT": "0x0000000000000000000000000000000000000000",  # Placeholder
                "DAI": "0x0000000000000000000000000000000000000000",   # Placeholder
            },
            "base_mainnet": {
                "USDC": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", 
                "DAI": "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
            },
            "ethereum_mainnet": {
                "USDC": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                "USDT": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
                "DAI": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            },
            "ethereum_sepolia": {
                "USDC": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
                "USDT": "0x0000000000000000000000000000000000000000",  # Placeholder
                "DAI": "0x0000000000000000000000000000000000000000",   # Placeholder
            },
            # Add other networks as needed
        }
    
    @property
    def erc20_abi(self) -> str:
        """
        Returns the minimal ERC20 ABI for common operations.
        This includes: transfer, balanceOf, decimals, approve, allowance.
        """
        return '''[
            {
                "constant": false,
                "inputs": [
                    {"name": "_to", "type": "address"},
                    {"name": "_value", "type": "uint256"}
                ],
                "name": "transfer",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "decimals",
                "outputs": [{"name": "", "type": "uint8"}],
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {"name": "_spender", "type": "address"},
                    {"name": "_value", "type": "uint256"}
                ],
                "name": "approve",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {"name": "_owner", "type": "address"},
                    {"name": "_spender", "type": "address"}
                ],
                "name": "allowance",
                "outputs": [{"name": "", "type": "uint256"}],
                "type": "function"
            }
        ]'''


# Singleton instance of settings
# This will be imported throughout the application
settings = Settings()

