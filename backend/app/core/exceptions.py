from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from loguru import logger


class BaseAppException(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code


def setup_exception_handlers(app: FastAPI):
    @app.exception_handler(BaseAppException)
    async def app_exception_handler(request: Request, exc: BaseAppException):
        logger.warning(f"Application error: {exc.message}")
        return JSONResponse(status_code=exc.status_code, content={"error": exc.message})

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {exc}")
        return JSONResponse(
            status_code=500, content={"error": "An unexpected error occurred."}
        )
