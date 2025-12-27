import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.session import engine
from sqlalchemy import text

async def test_connection():
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            print(f"Connection successful: {result.scalar()}")
            
            # Verify pool settings
            print(f"Pool Size: {engine.pool.size()}")
            print(f"Pool Pre-Ping: {engine.pool._pre_ping}")
            print(f"Pool Recycle: {engine.pool._recycle}")
            
    except Exception as e:
        print(f"Connection failed: {e}")
        sys.exit(1)
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_connection())
