import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import type { Circuit } from '../types'

interface Gate {
  type: string
  qubits: number[]
  params?: number[]
}

export default function CircuitPlayground() {
  const { userProfile } = useAuth()
  const [qubits, setQubits] = useState(2)
  const [gates, setGates] = useState<Gate[]>([])
  const [circuitName, setCircuitName] = useState('')
  const [simulationResult, setSimulationResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const addGate = (type: string, qubit: number, control?: number) => {
    if (type === 'CNOT' && control !== undefined) {
      setGates([...gates, { type: 'CNOT', qubits: [control, qubit] }])
    } else {
      setGates([...gates, { type, qubits: [qubit] }])
    }
  }

  const removeGate = (index: number) => {
    setGates(gates.filter((_, i) => i !== index))
  }

  const buildCircuitDict = () => {
    // This would need to be converted to Qiskit circuit format
    // For now, return a simplified structure
    return {
      qubits: qubits,
      gates: gates,
    }
  }

  const simulateCircuit = async () => {
    setLoading(true)
    try {
      const circuitDict = buildCircuitDict()
      const response = await api.post('/circuits/simulate', {
        circuit_data: circuitDict,
        shots: 1024,
      })
      setSimulationResult(response.data)
    } catch (error: any) {
      setSimulationResult({
        success: false,
        error: error.response?.data?.detail || 'Simulation failed',
      })
    } finally {
      setLoading(false)
    }
  }

  const exportQASM = async () => {
    try {
      const circuitDict = buildCircuitDict()
      const response = await api.post('/circuits/export-qasm', {
        circuit_data: circuitDict,
      })
      const blob = new Blob([response.data.qasm], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'circuit.qasm'
      a.click()
    } catch (error) {
      console.error('Failed to export QASM:', error)
    }
  }

  const askAI = async () => {
    if (!aiMessage.trim()) return
    setAiLoading(true)
    try {
      const circuitDict = buildCircuitDict()
      const response = await api.post('/circuits/ai-assist', {
        message: aiMessage,
        circuit_info: {
          num_qubits: qubits,
          gate_count: gates.length,
          gates: gates.map(g => g.type).join(', '),
        },
      })
      setAiResponse(response.data.response)
    } catch (error) {
      console.error('Failed to get AI assistance:', error)
      setAiResponse('Failed to get AI assistance. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Quantum Circuit Playground</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circuit Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Qubits
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={qubits}
                  onChange={(e) => {
                    const newQubits = parseInt(e.target.value)
                    setQubits(newQubits)
                    setGates([]) // Reset gates when qubits change
                  }}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={simulateCircuit}
                  disabled={loading || gates.length === 0}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Simulating...' : 'Simulate'}
                </button>
                <button
                  onClick={exportQASM}
                  disabled={gates.length === 0}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  Export QASM
                </button>
              </div>
            </div>

            {/* Gate Buttons */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Add Gates</h3>
              <div className="flex flex-wrap gap-2">
                {['H', 'X', 'Y', 'Z', 'S', 'T'].map((gate) => (
                  <button
                    key={gate}
                    onClick={() => {
                      const qubit = prompt(`Which qubit (0-${qubits - 1})?`)
                      if (qubit !== null) {
                        const q = parseInt(qubit)
                        if (q >= 0 && q < qubits) {
                          addGate(gate, q)
                        }
                      }
                    }}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded hover:bg-primary-200"
                  >
                    {gate}
                  </button>
                ))}
                <button
                  onClick={() => {
                    const control = prompt(`Control qubit (0-${qubits - 1})?`)
                    const target = prompt(`Target qubit (0-${qubits - 1})?`)
                    if (control !== null && target !== null) {
                      const c = parseInt(control)
                      const t = parseInt(target)
                      if (c >= 0 && c < qubits && t >= 0 && t < qubits && c !== t) {
                        addGate('CNOT', t, c)
                      }
                    }
                  }}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded hover:bg-primary-200"
                >
                  CNOT
                </button>
              </div>
            </div>

            {/* Circuit Visualization */}
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[200px]">
              {gates.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Add gates to build your circuit
                </div>
              ) : (
                <div className="space-y-2">
                  {gates.map((gate, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white p-2 rounded border"
                    >
                      <span className="font-mono text-sm">
                        {gate.type}({gate.qubits.join(', ')})
                      </span>
                      <button
                        onClick={() => removeGate(idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Simulation Results */}
          {simulationResult && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Simulation Results</h2>
              {simulationResult.success ? (
                <div>
                  {simulationResult.counts && (
                    <div>
                      <h3 className="font-medium mb-2">Measurement Counts:</h3>
                      <div className="bg-gray-50 p-4 rounded">
                        <pre className="text-sm overflow-x-auto">
                          {JSON.stringify(simulationResult.counts, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  {simulationResult.statevector && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">State Vector:</h3>
                      <div className="bg-gray-50 p-4 rounded">
                        <pre className="text-sm overflow-x-auto">
                          {JSON.stringify(simulationResult.statevector, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-600">{simulationResult.error}</div>
              )}
            </div>
          )}
        </div>

        {/* AI Assistant Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">AI Assistant</h2>
            <div className="space-y-4">
              <textarea
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                placeholder="Ask about circuit design, debugging, or optimization..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={4}
              />
              <button
                onClick={askAI}
                disabled={aiLoading || !aiMessage.trim()}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {aiLoading ? 'Asking AI...' : 'Ask AI'}
              </button>
              {aiResponse && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiResponse}</p>
                </div>
              )}
            </div>
          </div>

          {/* Save Circuit */}
          {userProfile && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Save Circuit</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={circuitName}
                  onChange={(e) => setCircuitName(e.target.value)}
                  placeholder="Circuit name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={async () => {
                    if (!circuitName.trim()) return
                    try {
                      const circuitDict = buildCircuitDict()
                      await api.post('/circuits/save', {
                        title: circuitName,
                        circuit_data: circuitDict,
                      })
                      alert('Circuit saved!')
                      setCircuitName('')
                    } catch (error) {
                      console.error('Failed to save circuit:', error)
                    }
                  }}
                  disabled={!circuitName.trim() || gates.length === 0}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
