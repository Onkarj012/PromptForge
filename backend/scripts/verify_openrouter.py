#!/usr/bin/env python3
"""
OpenRouter API Key Verification Script
"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings
from langchain_openai import ChatOpenAI


async def verify_openrouter_key():
    print("=" * 70)
    print("OpenRouter API Key Verification")
    print("=" * 70)
    print()
    
    api_key = settings.OPENROUTER_API_KEY
    if not api_key:
        print("❌ ERROR: OPENROUTER_API_KEY is not set in .env file")
        return False
    
    masked_key = f"{api_key[:10]}...{api_key[-4:]}" if len(api_key) > 14 else "***"
    print(f"✓ API Key found: {masked_key}")
    print()
    print("Testing API key with OpenRouter...")
    print()
    
    try:
        llm = ChatOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
            model="openai/gpt-3.5-turbo",
            temperature=0.7,
            default_headers={
                "HTTP-Referer": "http://localhost",
                "X-Title": "PromptForge",
            },
        )
        
        response = await llm.ainvoke("Say 'Hello' if you can read this.")
        
        print("✅ SUCCESS: API key is valid!")
        print()
        print(f"Test response: {response.content[:100]}...")
        print()
        print("=" * 70)
        print("Your OpenRouter configuration is working correctly!")
        print("=" * 70)
        return True
        
    except Exception as e:
        error_msg = str(e)
        print("❌ ERROR: API key validation failed")
        print()
        print(f"Error: {error_msg}")
        print()
        
        if "401" in error_msg or "User not found" in error_msg:
            print("🔍 Your API key is invalid or revoked")
            print()
            print("Steps to fix:")
            print("1. Visit https://openrouter.ai/keys")
            print("2. Generate a new API key")
            print("3. Update OPENROUTER_API_KEY in .env file")
            print("4. Run this script again to verify")
        
        print()
        print("=" * 70)
        return False


if __name__ == "__main__":
    result = asyncio.run(verify_openrouter_key())
    sys.exit(0 if result else 1)
