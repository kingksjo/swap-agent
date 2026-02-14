import os
from dotenv import load_dotenv

load_dotenv()

# LLM Configuration
GEMINI_MODEL = "gemini-2.5-flash-lite"
TEMPERATURE = 0.74
MAX_OUTPUT_TOKENS = 1008
MAX_CONTEXT = 16

# API Keys
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Blockchain Config
# Uniswap V3 SwapRouter on Base Sepolia (switch to mainnet address for production)
UNISWAP_ROUTER_ADDRESS = os.getenv("UNISWAP_ROUTER_ADDRESS", "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4")
# Chain ID (defaults to base_sepolia for development)
BASE_CHAIN_ID = os.getenv("BASE_CHAIN_ID", "base_sepolia")

