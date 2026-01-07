from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from middleware.auth import get_current_user_uid
from services.supabase_service import get_supabase
from services.qiskit_service import (
    simulate_circuit,
    export_to_qasm,
    export_to_qiskit_code,
    import_from_qasm,
    validate_circuit
)
from services.gemini_service import get_ai_assistance
from datetime import datetime
import uuid

router = APIRouter()

class CircuitSimulateRequest(BaseModel):
    circuit_data: Dict[str, Any]
    shots: int = 1024

class CircuitSaveRequest(BaseModel):
    title: str
    circuit_data: Dict[str, Any]
    project_id: Optional[str] = None

class CircuitAIAssistRequest(BaseModel):
    message: str
    circuit_info: Optional[Dict[str, Any]] = None

@router.post("/simulate")
async def simulate(circuit_request: CircuitSimulateRequest):
    """Simulate a quantum circuit"""
    result = simulate_circuit(circuit_request.circuit_data, shots=circuit_request.shots)
    return result

@router.post("/export-qasm")
async def export_qasm(circuit_request: CircuitSimulateRequest):
    """Export circuit to OpenQASM format"""
    try:
        qasm = export_to_qasm(circuit_request.circuit_data)
        return {"qasm": qasm}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/export-qiskit")
async def export_qiskit(circuit_request: CircuitSimulateRequest):
    """Export circuit to Qiskit Python code"""
    try:
        code = export_to_qiskit_code(circuit_request.circuit_data)
        return {"code": code}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/import-qasm")
async def import_qasm(qasm_request: dict):
    """Import circuit from OpenQASM format"""
    try:
        qasm_str = qasm_request.get("qasm", "")
        circuit_dict = import_from_qasm(qasm_str)
        return {"circuit_data": circuit_dict}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/save")
async def save_circuit(
    circuit_request: CircuitSaveRequest,
    uid: str = Depends(get_current_user_uid)
):
    """Save circuit to user account"""
    supabase = get_supabase()
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Generate QASM and Qiskit code
    qasm = export_to_qasm(circuit_request.circuit_data)
    qiskit_code = export_to_qiskit_code(circuit_request.circuit_data)
    
    circuit_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "project_id": circuit_request.project_id,
        "title": circuit_request.title,
        "circuit_data": circuit_request.circuit_data,
        "qasm_code": qasm,
        "qiskit_code": qiskit_code,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    
    result = supabase.table("circuits").insert(circuit_data).execute()
    
    return result.data[0] if result.data else None

@router.get("/{circuit_id}")
async def get_circuit(circuit_id: str):
    """Get saved circuit"""
    supabase = get_supabase()
    
    result = supabase.table("circuits").select("*").eq("id", circuit_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Circuit not found")
    
    return result.data[0]

@router.post("/ai-assist")
async def ai_assist(
    request: CircuitAIAssistRequest,
    uid: str = Depends(get_current_user_uid)
):
    """Get AI assistance for circuit design, debugging, or optimization"""
    result = get_ai_assistance(
        request.message,
        request.circuit_info
    )
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["detail"])
        
    return {"response": result["response"]}

@router.post("/validate")
async def validate(circuit_request: CircuitSimulateRequest):
    """Validate circuit structure"""
    result = validate_circuit(circuit_request.circuit_data)
    return result

