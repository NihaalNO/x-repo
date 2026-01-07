import google.generativeai as genai
import os
from typing import Dict, Any, Optional

# Configure Gemini API
# Moved configuration to within functions to handle environment variable loading time

def get_ai_assistance(
    user_message: str,
    circuit_info: Optional[Dict[str, Any]] = None,
    context: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get AI assistance from Gemini for quantum circuit design, debugging, or education
    
    Args:
        user_message: User's question or request
        circuit_info: Current circuit state information
        context: Additional context about the conversation
    
    Returns:
        Dict containing response text or error
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {
            "error": "Gemini API key not configured",
            "detail": "Please set GEMINI_API_KEY environment variable."
        }
    
    try:
        genai.configure(api_key=api_key)
        
        # Build context-aware prompt
        prompt = build_prompt(user_message, circuit_info, context)
        
        # Use Gemini 2.0 Flash model (verified available)
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        
        return {"response": response.text}
    except Exception as e:
        return {
            "error": "AI Service Error",
            "detail": str(e)
        }

def build_prompt(user_message: str, circuit_info: Optional[Dict[str, Any]], context: Optional[str]) -> str:
    """Build context-aware prompt for Gemini"""
    
    prompt = """You are an expert quantum computing assistant helping users design, debug, optimize, and learn about quantum circuits.

Your capabilities include:
1. Circuit Design Assistance: Suggest gate sequences for common algorithms, recommend optimal qubit arrangements, provide circuit templates
2. Debugging Support: Identify circuit errors, explain unexpected results, detect common pitfalls
3. Optimization Suggestions: Reduce circuit depth, minimize gate count, suggest equivalent efficient circuits
4. Educational Guidance: Explain quantum gates, guide through algorithms (Deutsch-Jozsa, Grover's, Shor's, QFT), answer theory questions
5. Code Translation: Convert between QASM and Qiskit Python code, explain Qiskit syntax

"""
    
    if circuit_info:
        prompt += f"""
Current circuit state:
- Number of qubits: {circuit_info.get('num_qubits', 'N/A')}
- Circuit depth: {circuit_info.get('depth', 'N/A')}
- Gate count: {circuit_info.get('gate_count', 'N/A')}
- QASM code: {circuit_info.get('qasm', 'N/A')}
"""
    
    if context:
        prompt += f"\nConversation context: {context}\n"
    
    prompt += f"\nUser question/request: {user_message}\n\n"
    prompt += "Provide a helpful, accurate, and educational response:"
    
    return prompt

def stream_ai_response(user_message: str, circuit_info: Optional[Dict[str, Any]] = None) -> str:
    """
    Stream AI response (for real-time updates)
    Note: This is a simplified version. For true streaming, you'd need to use async generators
    """
    return get_ai_assistance(user_message, circuit_info)

