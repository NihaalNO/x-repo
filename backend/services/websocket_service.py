from typing import Dict, List, Set
from fastapi import WebSocket, WebSocketDisconnect
import json
import asyncio

class ConnectionManager:
    def __init__(self):
        # Store connections by type (post_reactions, post_comments, etc.)
        self.connections: Dict[str, Set[WebSocket]] = {}
        self.post_connections: Dict[str, Set[WebSocket]] = {}  # post_id -> connections
        self.user_connections: Dict[str, Set[WebSocket]] = {}  # user_id -> connections
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, connection_type: str = None, post_id: str = None, user_id: str = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        
        # Add to specific connection pools
        if connection_type:
            if connection_type not in self.connections:
                self.connections[connection_type] = set()
            self.connections[connection_type].add(websocket)
        
        if post_id:
            if post_id not in self.post_connections:
                self.post_connections[post_id] = set()
            self.post_connections[post_id].add(websocket)
        
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = set()
            self.user_connections[user_id].add(websocket)

    def disconnect(self, websocket: WebSocket, post_id: str = None, user_id: str = None):
        self.active_connections.remove(websocket)
        
        # Remove from specific connection pools
        for connection_type, connections in self.connections.items():
            connections.discard(websocket)
        
        if post_id and post_id in self.post_connections:
            self.post_connections[post_id].discard(websocket)
            if not self.post_connections[post_id]:  # Remove empty sets
                del self.post_connections[post_id]
        
        if user_id and user_id in self.user_connections:
            self.user_connections[user_id].discard(websocket)
            if not self.user_connections[user_id]:  # Remove empty sets
                del self.user_connections[user_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_post(self, post_id: str, message: str):
        """Send message to all connections watching a specific post"""
        if post_id in self.post_connections:
            disconnected = set()
            for connection in self.post_connections[post_id]:
                try:
                    await connection.send_text(message)
                except WebSocketDisconnect:
                    disconnected.add(connection)
            
            # Clean up disconnected connections
            for connection in disconnected:
                self.disconnect(connection, post_id=post_id)

    async def broadcast_to_user(self, user_id: str, message: str):
        """Send message to all connections for a specific user"""
        if user_id in self.user_connections:
            disconnected = set()
            for connection in self.user_connections[user_id]:
                try:
                    await connection.send_text(message)
                except WebSocketDisconnect:
                    disconnected.add(connection)
            
            # Clean up disconnected connections
            for connection in disconnected:
                self.disconnect(connection, user_id=user_id)

    async def broadcast_global(self, message: str):
        """Send message to all active connections"""
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except WebSocketDisconnect:
                disconnected.add(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)

manager = ConnectionManager()