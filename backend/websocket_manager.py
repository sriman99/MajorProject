from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set, Optional
import asyncio
import json
import logging
from datetime import datetime
import jwt
from cryptography.fernet import Fernet
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import PyMongoError

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self, encryption_key: bytes, mongodb_url: str):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_rooms: Dict[str, Set[str]] = {}
        self.encryption = Fernet(encryption_key)
        self.message_queue = asyncio.Queue()
        self.rate_limits: Dict[str, list] = {}
        self.mongo_client = AsyncIOMotorClient(mongodb_url)
        self.db = self.mongo_client.healthcare_db
        self.messages_collection = self.db.chat_messages

    async def connect(self, websocket: WebSocket, user_id: str):
        """Establish WebSocket connection with authentication and logging"""
        try:
            await websocket.accept()
            self.active_connections[user_id] = websocket
            if user_id not in self.rate_limits:
                self.rate_limits[user_id] = []
            
            # Start heartbeat for this connection
            asyncio.create_task(self._heartbeat(websocket, user_id))
            
            logger.info(f"WebSocket connected - User: {user_id}")
            return True
        except Exception as e:
            logger.error(f"Connection failed for user {user_id}: {str(e)}")
            return False

    def disconnect(self, user_id: str):
        """Handle WebSocket disconnection with cleanup"""
        try:
            self.active_connections.pop(user_id, None)
            self.rate_limits.pop(user_id, None)
            logger.info(f"WebSocket disconnected - User: {user_id}")
        except Exception as e:
            logger.error(f"Disconnect error for user {user_id}: {str(e)}")

    async def _heartbeat(self, websocket: WebSocket, user_id: str):
        """Maintain connection heartbeat"""
        try:
            while True:
                await asyncio.sleep(30)
                if user_id in self.active_connections:
                    await websocket.send_json({"type": "ping"})
                else:
                    break
        except WebSocketDisconnect:
            self.disconnect(user_id)
        except Exception as e:
            logger.error(f"Heartbeat error for user {user_id}: {str(e)}")
            self.disconnect(user_id)

    async def _check_rate_limit(self, user_id: str) -> bool:
        """Implement rate limiting"""
        current_time = datetime.utcnow().timestamp()
        self.rate_limits[user_id] = [t for t in self.rate_limits[user_id] 
                                   if current_time - t < 60]
        
        if len(self.rate_limits[user_id]) >= 20:  # 20 messages per minute
            return False
        
        self.rate_limits[user_id].append(current_time)
        return True

    def _encrypt_message(self, message: str) -> str:
        """Encrypt message content"""
        try:
            return self.encryption.encrypt(message.encode()).decode()
        except Exception as e:
            logger.error(f"Encryption error: {str(e)}")
            return message

    def _decrypt_message(self, encrypted_message: str) -> str:
        """Decrypt message content"""
        try:
            return self.encryption.decrypt(encrypted_message.encode()).decode()
        except Exception as e:
            logger.error(f"Decryption error: {str(e)}")
            return encrypted_message

    async def store_message(self, message_dict: dict):
        """Store message in MongoDB with retry logic"""
        try:
            # Encrypt message content before storing
            message_dict["text"] = self._encrypt_message(message_dict["text"])
            
            # Add retry logic for database operations
            retries = 3
            while retries > 0:
                try:
                    await self.messages_collection.insert_one(message_dict)
                    break
                except PyMongoError as e:
                    retries -= 1
                    if retries == 0:
                        raise e
                    await asyncio.sleep(1)
            
            logger.info(f"Message stored - ID: {message_dict['id']}")
        except Exception as e:
            logger.error(f"Failed to store message: {str(e)}")
            raise

    async def send_personal_message(self, message: dict, user_id: str):
        """Send message to specific user with rate limiting and encryption"""
        try:
            if not await self._check_rate_limit(user_id):
                logger.warning(f"Rate limit exceeded for user {user_id}")
                return False

            websocket = self.active_connections.get(user_id)
            if websocket:
                # Decrypt message before sending
                if "text" in message:
                    message["text"] = self._decrypt_message(message["text"])
                
                await websocket.send_json(message)
                logger.info(f"Message sent to user {user_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to send message to user {user_id}: {str(e)}")
            return False

    async def broadcast_to_room(self, room_id: str, message: dict):
        """Broadcast message to all users in a room"""
        if room_id in self.user_rooms:
            failed_sends = []
            for user_id in self.user_rooms[room_id]:
                success = await self.send_personal_message(message, user_id)
                if not success:
                    failed_sends.append(user_id)
            
            # Remove failed connections
            for user_id in failed_sends:
                self.user_rooms[room_id].remove(user_id)

    async def load_chat_history(self, conversation_id: str, limit: int = 50):
        """Load chat history with decryption"""
        try:
            messages = await self.messages_collection.find(
                {"conversation_id": conversation_id}
            ).sort("timestamp", -1).limit(limit).to_list(length=limit)
            
            # Decrypt messages
            for message in messages:
                message["text"] = self._decrypt_message(message["text"])
            
            return messages
        except Exception as e:
            logger.error(f"Failed to load chat history: {str(e)}")
            return []
