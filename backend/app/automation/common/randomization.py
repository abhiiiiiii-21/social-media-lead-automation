import asyncio
import random

def get_random_delay(min_ms: int, max_ms: int) -> float:
    """
    Returns a random delay in seconds between min_ms and max_ms.
    """
    if min_ms >= max_ms:
        return min_ms / 1000.0
    return random.randint(min_ms, max_ms) / 1000.0


async def wait_random(min_ms: int, max_ms: int) -> None:
    """
    Asynchronously sleeps for a random duration between min_ms and max_ms.
    """
    delay = get_random_delay(min_ms, max_ms)
    await asyncio.sleep(delay)


async def wait_typing() -> None:
    """
    Simulates a short delay mimicking human typing speed between characters.
    """
    await wait_random(50, 250)


async def wait_scroll() -> None:
    """
    Simulates a human scroll pause.
    """
    await wait_random(800, 2000)

async def wait_action_spacing(min_ms: int = 1500, max_ms: int = 4000) -> None:
    """
    Simulates a delay between distinct human actions (e.g. clicking a link and then looking at the next element).
    """
    await wait_random(min_ms, max_ms)
