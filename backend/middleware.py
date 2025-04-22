from fastapi import Request, WebSocket, HTTPException
from typing import Optional
from jose import JWTError, jwt
import os
import logging

logger = logging.getLogger(__name__)

class AuthMiddleware:
    def __init__(self, secret_key: str):
        self.secret_key = secret_key

    async def verify_token(self, token: str) -> Optional[dict]:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"])
            return payload
        except JWTError as e:
            logger.error(f"Token verification failed: {str(e)}")
            return None

    async def __call__(self, request: Request):
        if "Authorization" not in request.headers:
            raise HTTPException(status_code=401, detail="No authorization header")

        auth = request.headers["Authorization"]
        scheme, token = auth.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")

        payload = await self.verify_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")

        request.state.user = payload
        return payload

class WebSocketAuthMiddleware:
    def __init__(self, secret_key: str):
        self.secret_key = secret_key

    async def verify_connection(self, websocket: WebSocket) -> bool:
        try:
            token = websocket.query_params.get("token")
            if not token:
                await websocket.close(code=4003, reason="Missing authentication token")
                return False

            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"])
            websocket.state.user = payload
            return True
        except JWTError as e:
            logger.error(f"WebSocket authentication failed: {str(e)}")
            await websocket.close(code=4003, reason="Invalid authentication token")
            return False
        except Exception as e:
            logger.error(f"WebSocket middleware error: {str(e)}")
            await websocket.close(code=4000, reason="Internal server error")
            return False
