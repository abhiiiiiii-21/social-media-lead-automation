import asyncio
import time
from typing import Dict, Any

from app.automation.common.automation_settings import AutomationConfig
from app.automation.common.randomization import wait_random


class RateController:
    def __init__(self, config: AutomationConfig):
        self.config = config
        self.actions_performed = 0
        self.start_time = time.time()
        self.is_suspended = False

    async def check_limits(self) -> None:
        """
        Checks if we've hit max runtime or max profiles per run.
        Raises an exception or safely flags to stop.
        """
        elapsed = time.time() - self.start_time
        if elapsed > self.config.max_runtime_sec:
            raise TimeoutError("Maximum runtime exceeded for this automation session.")
            
        if self.actions_performed >= self.config.max_profiles_per_run:
            raise StopAsyncIteration("Maximum profiles per run reached.")

    async def pause_if_needed(self) -> None:
        """
        Calculates and applies the configured random delay between standard actions.
        """
        if self.is_suspended:
            await asyncio.sleep(self.config.pause_duration_sec)
            self.is_suspended = False
        else:
            await wait_random(self.config.min_delay_ms, self.config.max_delay_ms)

    def record_action(self) -> None:
        self.actions_performed += 1

    def suspend(self) -> None:
        """
        Forces a long pause on the next check.
        """
        self.is_suspended = True

    def get_stats(self) -> Dict[str, Any]:
        return {
            "actions_performed": self.actions_performed,
            "elapsed_time_sec": round(time.time() - self.start_time, 2),
            "is_suspended": self.is_suspended
        }
