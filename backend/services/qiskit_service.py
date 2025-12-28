from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import json
import sys
from typing import Dict, Any, Optional

# Try to import Aer and execute, but handle if they're not available
USE_LEGACY_EXECUTE = False
execute = None
try:
    # Try new qiskit-aer (0.12+) - this is the modern way
    from qiskit_aer import Aer
    from qiskit_aer.primitives import Sampler
    AER_AVAILABLE = True
except ImportError:
    try:
        # Fallback: Try old qiskit import (for older versions)
        from qiskit import Aer
        AER_AVAILABLE = True
        USE_LEGACY_EXECUTE = True
        # Import execute from legacy module
        try:
            from qiskit.execute_function import execute
        except ImportError:
            try:
                from qiskit.compiler import execute
            except ImportError:
                # Last resort: try direct import (won't work in Qiskit 1.0+)
                from qiskit import execute
    except ImportError:
        AER_AVAILABLE = False
        print("Warning: qiskit-aer not installed. Circuit simulation will be limited.")

class TimeoutError(Exception):
    pass

# Signal-based timeout only works on Unix systems
if sys.platform != 'win32':
    import signal
    def timeout_handler(signum, frame):
        raise TimeoutError("Simulation exceeded time limit")
else:
    # Windows doesn't support SIGALRM, timeout will be handled differently
    signal = None

def simulate_circuit(circuit_dict: Dict[str, Any], shots: int = 1024, timeout: int = 30) -> Dict[str, Any]:
    """
    Simulate a quantum circuit from a dictionary representation
    
    Args:
        circuit_dict: Dictionary representation of Qiskit circuit
        shots: Number of measurement shots
        timeout: Maximum simulation time in seconds
    
    Returns:
        Dictionary with simulation results
    """
    try:
        # Deserialize circuit
        circuit = QuantumCircuit.from_dict(circuit_dict)
        
        # Set up timeout (Unix only)
        if signal and sys.platform != 'win32':
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(timeout)
        
        try:
            # Run simulation
            if not AER_AVAILABLE:
                return {
                    "success": False,
                    "error": "qiskit-aer is not installed. Please install it with: pip install qiskit-aer"
                }
            
            # Use new primitives API (Qiskit 1.0+)
            if not USE_LEGACY_EXECUTE:
                sampler = Sampler()
                job = sampler.run(circuit, shots=shots)
                result = job.result()
                # Convert to counts format
                counts = {}
                quasi_dist = result.quasi_dists[0]
                for bitstring, probability in quasi_dist.items():
                    # Convert probability to approximate count
                    bitstring_str = format(int(bitstring), f'0{circuit.num_qubits}b')
                    counts[bitstring_str] = int(probability * shots)
            else:
                # Legacy execute API
                backend = Aer.get_backend('qasm_simulator')
                job = execute(circuit, backend, shots=shots)
                result = job.result()
                counts = result.get_counts(circuit)
            
            # Get state vector (for small circuits)
            statevector = None
            if circuit.num_qubits <= 10 and AER_AVAILABLE:
                try:
                    if USE_LEGACY_EXECUTE:
                        state_backend = Aer.get_backend('statevector_simulator')
                        state_job = execute(circuit, state_backend)
                        state_result = state_job.result()
                        statevector = state_result.get_statevector().data.tolist()
                    # Note: New primitives API doesn't easily expose statevector
                    # We'll skip it for now when using new API
                except Exception as e:
                    # Statevector extraction failed, continue without it
                    pass
            
            # Cancel alarm (Unix only)
            if signal and sys.platform != 'win32':
                signal.alarm(0)
            
            return {
                "success": True,
                "counts": counts,
                "statevector": statevector,
                "num_qubits": circuit.num_qubits,
                "depth": circuit.depth(),
                "gate_count": len(circuit.data),
            }
        except TimeoutError:
            if signal and sys.platform != 'win32':
                signal.alarm(0)
            return {
                "success": False,
                "error": "Simulation timeout"
            }
        except Exception as e:
            if signal and sys.platform != 'win32':
                signal.alarm(0)
            return {
                "success": False,
                "error": str(e)
            }
    except Exception as e:
        return {
            "success": False,
            "error": f"Circuit deserialization error: {str(e)}"
        }

def export_to_qasm(circuit_dict: Dict[str, Any]) -> str:
    """Export circuit to OpenQASM 2.0 format"""
    try:
        circuit = QuantumCircuit.from_dict(circuit_dict)
        return circuit.qasm()
    except Exception as e:
        raise ValueError(f"Failed to export to QASM: {str(e)}")

def export_to_qiskit_code(circuit_dict: Dict[str, Any]) -> str:
    """Export circuit to Qiskit Python code"""
    try:
        circuit = QuantumCircuit.from_dict(circuit_dict)
        qasm_lines = circuit.qasm().split('\n')
        
        code = "from qiskit import QuantumCircuit\n\n"
        code += f"circuit = QuantumCircuit({circuit.num_qubits})\n"
        
        for line in qasm_lines:
            if line.strip() and not line.startswith('OPENQASM') and not line.startswith('include'):
                # Convert QASM to Qiskit method calls
                if 'h' in line.lower():
                    qubit = line.split('[')[1].split(']')[0]
                    code += f"circuit.h({qubit})\n"
                elif 'x' in line.lower() and 'cx' not in line.lower():
                    qubit = line.split('[')[1].split(']')[0]
                    code += f"circuit.x({qubit})\n"
                elif 'cx' in line.lower():
                    parts = line.split('[')
                    control = parts[1].split(']')[0]
                    target = parts[2].split(']')[0]
                    code += f"circuit.cx({control}, {target})\n"
                elif 'measure' in line.lower():
                    parts = line.split('[')
                    if len(parts) > 1:
                        qubit = parts[1].split(']')[0]
                        code += f"circuit.measure({qubit}, {qubit})\n"
        
        return code
    except Exception as e:
        raise ValueError(f"Failed to export to Qiskit code: {str(e)}")

def import_from_qasm(qasm_str: str) -> Dict[str, Any]:
    """Import circuit from OpenQASM 2.0 format"""
    try:
        circuit = QuantumCircuit.from_qasm_str(qasm_str)
        return circuit.to_dict()
    except Exception as e:
        raise ValueError(f"Failed to import from QASM: {str(e)}")

def validate_circuit(circuit_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Validate circuit structure"""
    try:
        circuit = QuantumCircuit.from_dict(circuit_dict)
        return {
            "valid": True,
            "num_qubits": circuit.num_qubits,
            "depth": circuit.depth(),
            "gate_count": len(circuit.data),
        }
    except Exception as e:
        return {
            "valid": False,
            "error": str(e)
        }

