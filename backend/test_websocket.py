import asyncio
import websockets
import json
import sys

async def test_websocket():
    # Replace these with actual values
    doctor_id = "your_doctor_id"
    user_id = "your_user_id"
    token = "your_jwt_token"
    
    uri = f"ws://localhost:8000/chat/{doctor_id}/{user_id}?token={token}"
    
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket server")
            
            # Test message
            message = {
                "text": "Hello, this is a test message",
                "sender_id": user_id,
                "receiver_id": doctor_id
            }
            
            # Send message
            await websocket.send(json.dumps(message))
            print(f"Sent message: {message}")
            
            # Receive response
            response = await websocket.recv()
            print(f"Received response: {response}")
            
            # Keep connection alive for a few seconds to receive any messages
            await asyncio.sleep(5)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(test_websocket())
