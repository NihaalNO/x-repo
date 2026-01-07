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

def circuit_from_dict(circuit_dict: Dict[str, Any]) -> QuantumCircuit:
    """
    Manually construct a QuantumCircuit from the custom dictionary format
    """
    try:
        num_qubits = circuit_dict.get("qubits", 1)
        gates = circuit_dict.get("gates", [])
        
        circuit = QuantumCircuit(num_qubits)
        
        for gate in gates:
            gate_type = gate.get("type", "").upper()
            qubits = gate.get("qubits", [])
            params = gate.get("params", [])
            
            if not gate_type:
                continue
                
            if gate_type == "H":
                circuit.h(qubits[0])
            elif gate_type == "X":
                circuit.x(qubits[0])
            elif gate_type == "Y":
                circuit.y(qubits[0])
            elif gate_type == "Z":
                circuit.z(qubits[0])
            elif gate_type == "S":
                circuit.s(qubits[0])
            elif gate_type == "T":
                circuit.t(qubits[0])
            elif gate_type == "CNOT":
                # Frontend sends [control, target]
                if len(qubits) >= 2:
                    circuit.cx(qubits[0], qubits[1])
            # Add more gates as needed
        
        # Add measurement to all qubits at the end since this is a playground
        circuit.measure_all()
        
        return circuit
    except Exception as e:
        raise ValueError(f"Invalid circuit data: {str(e)}")

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
        circuit = circuit_from_dict(circuit_dict)
        
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
                # Handle different return types from Sampler (QuasiDistribution vs dictionary)
                try:
                    # primitives.Sampler returns quasi-dists
                    quasi_dist = result.quasi_dists[0]
                    for bitstring, probability in quasi_dist.items():
                        # Convert probability to approximate count
                        bitstring_str = format(int(bitstring), f'0{circuit.num_qubits}b')
                        counts[bitstring_str] = int(probability * shots)
                except AttributeError:
                    # Fallback if structure is different
                     counts = str(result)
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
                    # For statevector, we need a circuit without measurements for the simulator to return the full state
                    # or use a specific statevector simulator 
                    
                    # Create a clean circuit for statevector (without measurements)
                    sv_circuit = QuantumCircuit(circuit.num_qubits)
                    for gate in circuit_dict.get("gates", []):
                        gate_type = gate.get("type", "").upper()
                        qubits = gate.get("qubits", [])
                        if gate_type == "H": sv_circuit.h(qubits[0])
                        elif gate_type == "X": sv_circuit.x(qubits[0])
                        elif gate_type == "Y": sv_circuit.y(qubits[0])
                        elif gate_type == "Z": sv_circuit.z(qubits[0])
                        elif gate_type == "S": sv_circuit.s(qubits[0])
                        elif gate_type == "T": sv_circuit.t(qubits[0])
                        elif gate_type == "CNOT": sv_circuit.cx(qubits[0], qubits[1])

                    if USE_LEGACY_EXECUTE:
                        state_backend = Aer.get_backend('statevector_simulator')
                        state_job = execute(sv_circuit, state_backend)
                        state_result = state_job.result()
                        # Complex to list
                        sv_data = state_result.get_statevector().data
                        statevector = [{"real": c.real, "imag": c.imag} for c in sv_data]
                    else:
                        # With new Aer, we can use the statevector_simulator backend directly if available
                        state_backend = Aer.get_backend('statevector_simulator')
                        state_job = state_backend.run(sv_circuit)
                        state_result = state_job.result()
                        sv_data = state_result.get_statevector(sv_circuit).data
                        statevector = [{"real": c.real, "imag": c.imag} for c in sv_data]

                except Exception as e:
                    # Statevector extraction failed, continue without it
                    print(f"Statevector error: {e}")
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
        circuit = circuit_from_dict(circuit_dict)
        # Check if we can use qasm2 (Qiskit 1.0+)
        try:
            import qiskit.qasm2
            return qiskit.qasm2.dumps(circuit)
        except ImportError:
            # Fallback for older Qiskit
            if hasattr(circuit, 'qasm'):
                 return circuit.qasm()
            raise ImportError("Could not find a way to export to QASM. Please check Qiskit version.")
    except Exception as e:
        raise ValueError(f"Failed to export to QASM: {str(e)}")

def export_to_qiskit_code(circuit_dict: Dict[str, Any]) -> str:
    """Export circuit to Qiskit Python code"""
    try:
        circuit = circuit_from_dict(circuit_dict)
        
        # Get QASM string (handling different Qiskit versions)
        qasm_str = ""
        try:
            import qiskit.qasm2
            qasm_str = qiskit.qasm2.dumps(circuit)
        except ImportError:
            if hasattr(circuit, 'qasm'):
                 qasm_str = circuit.qasm()
            else:
                 raise ImportError("Could not find a way to export to QASM for parsing.")

        qasm_lines = qasm_str.split('\n')
        
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
        # We need to convert back to our custom dict format
        # This is a bit complex as we need to parse the circuit instructions
        gates = []
        for instruction in circuit.data:
            inst = instruction[0]
            qubits = [circuit.find_bit(q).index for q in instruction[1]]
            
            gate_type = inst.name.upper()
            if gate_type == "CX": gate_type = "CNOT"
            
            gates.append({
                "type": gate_type,
                "qubits": qubits
            })
            
        return {
            "qubits": circuit.num_qubits,
            "gates": gates
        }
    except Exception as e:
        raise ValueError(f"Failed to import from QASM: {str(e)}")

def validate_circuit(circuit_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Validate circuit structure"""
    try:
        circuit = circuit_from_dict(circuit_dict)
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

