import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { FiUser, FiLogOut, FiSettings, FiCreditCard, FiZap, FiRotateCcw, FiUsers, FiHome } from 'react-icons/fi';
import { QuantumSimulator } from '../lib/quantum/simulator';
import { QuantumGates, GateType, ControlledGates, ControlledGateType } from '../lib/quantum/gates';
import { QuantumCircuit, Operation } from '../components/QuantumCircuit';
import { circuitToQASM } from '../lib/quantum/qasm';
import Sidebar from '../components/Sidebar';
import { SocialFeed } from '../components/SocialFeed';
import { UserProfile } from '../components/UserProfile';
import { logoutUser } from '@/utils/firebase';
import Histogram from '@/components/Histogram';
import { KUser, MOCK_USERS } from '../data/mockDatabase';

// Mock current user for demo
const CURRENT_USER: KUser = {
  id: 'user_playground',
  username: 'quantum_dev',
  displayName: 'Quantum Developer',
  email: 'quantum@playground.dev',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  bio: 'Quantum computing enthusiast | Circuit designer | Love experimenting with qubits!',
  location: 'Quantum Realm',
  website: 'https://quantum-playground.dev',
  joinedDate: new Date('2023-03-15'),
  followers: 890,
  following: 456,
  verified: true,
  coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=200&fit=crop',
  karma: 34560,
  badges: ['Quantum Expert', 'Circuit Master', 'Algorithm Designer']
};

export default function Playground() {
  const router = useRouter();
  
  // Profile menu state
  const [fadeIn, setFadeIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<KUser | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'playground' | 'community' | 'profile'>('playground');
  const [targetUserId, setTargetUserId] = useState<string>('user_playground');
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  // State management for quantum playground
  const [numQubits, setNumQubits] = useState(3);
  const [simulator, setSimulator] = useState<QuantumSimulator>();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [selectedGate, setSelectedGate] = useState<GateType | ControlledGateType>('H');
  const [selectedQubit, setSelectedQubit] = useState(0);
  const [controlQubit, setControlQubit] = useState<number | undefined>(undefined);
  const [results, setResults] = useState<{ [key: number]: number }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [measurementResults, setMeasurementResults] = useState<{ [key: string]: number }>({});

  // AI Assistant state
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Operation[]>([]);

  // Add state for operation history
  const [operationHistory, setOperationHistory] = useState<Operation[][]>([]);
  const [simulatorHistory, setSimulatorHistory] = useState<QuantumSimulator[]>([]);
  const [resultsHistory, setResultsHistory] = useState<Record<string, any>[]>([]);

  // Simulate authentication check
  useEffect(() => {
    // For demo, we'll assume the user is logged in
    setIsLoggedIn(true);
    setCurrentUser(CURRENT_USER);
    setFadeIn(true);
  }, []);

  const handleUserClick = (userId: string) => {
    setTargetUserId(userId);
    setActiveTab('profile');
  };

  const handleFollow = (userId: string) => {
    toast.success('User followed!');
  };

  const handleUnfollow = (userId: string) => {
    toast.success('User unfollowed!');
  };

  const handleMessage = (userId: string) => {
    toast('Messaging feature coming soon!');
  };

  const handleEditProfile = () => {
    toast('Profile editing feature coming soon!');
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsLoggedIn(false);
      setShowProfileMenu(false);
      router.push('/');
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Failed to logout');
    }
  };

  // Initialize simulator with history tracking
  useEffect(() => {
    try {
      const newSimulator = new QuantumSimulator(numQubits);
      setSimulator(newSimulator);
      setOperations([]);
      setResults({});
      setError(null);
      
      // Reset history
      setOperationHistory([[]]);
      setSimulatorHistory([newSimulator]);
      setResultsHistory([{}]);
    } catch (err) {
      setError('Failed to initialize quantum simulator');
      toast.error('Failed to initialize quantum simulator');
    }
  }, [numQubits]);

  // Memoized gate application
  const applyGate = useCallback(async () => {
    if (!simulator) {
      toast.error('Simulator not initialized');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Validate operation
      if (selectedQubit >= numQubits) {
        throw new Error('Invalid target qubit');
      }
      
      if (controlQubit !== undefined) {
        if (controlQubit >= numQubits) {
          throw new Error('Invalid control qubit');
        }
        
        if (controlQubit === selectedQubit) {
          throw new Error('Control and target qubits cannot be the same');
        }
        
        if (!(selectedGate in ControlledGates)) {
          throw new Error(`Gate ${selectedGate} cannot be controlled`);
        }
      }
      
      // Find the maximum time for the current qubit
      const maxTimeForQubit = operations
        .filter(op => op.target === selectedQubit || op.control === selectedQubit)
        .reduce((max, op) => Math.max(max, op.time), -1);
      
      // Check for overlapping gates
      const conflictingOps = operations.filter(op => 
        (op.time === maxTimeForQubit + 1) && 
        (op.target === selectedQubit || op.control === selectedQubit)
      );
      
      if (conflictingOps.length > 0) {
        throw new Error('Gate conflicts with existing operation at this time step');
      }
      
      const newOperation = {
        gate: selectedGate,
        target: selectedQubit,
        control: controlQubit,
        time: maxTimeForQubit + 1
      };

      // Clone the current simulator for history
      const newSimulator = simulator.clone();

      // Apply gate to simulator
      if (controlQubit !== undefined) {
        newSimulator.applyControlledGate(
          JSON.parse(JSON.stringify(QuantumGates[ControlledGates[selectedGate as ControlledGateType] as GateType])),
          controlQubit,
          selectedQubit
        );
      } else {
        newSimulator.applyGate(
          JSON.parse(JSON.stringify(QuantumGates[selectedGate as GateType])),
          selectedQubit
        );
      }

      // Update operations
      const newOperations = [...operations, newOperation];
      
      // Update probabilities
      const probabilities = newSimulator.getProbabilities();
      const newResults = Object.fromEntries(
        probabilities.map((prob, i) => [i, prob])
      );

      // Update state
      setOperations(newOperations);
      setSimulator(newSimulator);
      setResults(newResults);
      
      // Update history
      setOperationHistory(prev => [...prev, newOperations]);
      setSimulatorHistory(prev => [...prev, newSimulator]);
      setResultsHistory(prev => [...prev, newResults]);

      toast.success('Gate applied successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to apply gate';
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  }, [simulator, selectedGate, selectedQubit, controlQubit, operations, numQubits]);

  // Memoized measurement function
  const measureQubit = useCallback(async (qubit: number) => {
    if (!simulator) {
      toast.error('Simulator not initialized');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { result, probability } = simulator.measure(qubit);
      setResults(prev => ({
        ...prev,
        [qubit]: result
      }));
      setMeasurementResults(prev => ({
        ...prev,
        [`q${qubit}`]: (prev[`q${qubit}`] || 0) + 1
      }));
      toast.success(`Measurement result: |${result}⟩ with probability ${(probability * 100).toFixed(2)}%`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to measure qubit';
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  }, [simulator]);

  // Handle qubit number change
  const handleQubitChange = useCallback((value: number) => {
    const numQubits = Math.min(Math.max(1, value), 8);
    setNumQubits(numQubits);
    setSelectedQubit(0);
    setControlQubit(undefined);
  }, []);

  // Reset circuit with history tracking
  const resetCircuit = useCallback(() => {
    const newSimulator = new QuantumSimulator(numQubits);
    setSimulator(newSimulator);
    setOperations([]);
    setResults({});
    setMeasurementResults({});
    setError(null);
    
    // Reset history
    setOperationHistory([[]]);
    setSimulatorHistory([newSimulator]);
    setResultsHistory([{}]);
    
    toast.success('Circuit reset');
  }, [numQubits]);

  // Export circuit to QASM
  const handleExport = useCallback(() => {
    try {
      const qasmCode = circuitToQASM(operations, numQubits);
      const blob = new Blob([qasmCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quantum_circuit.qasm';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Circuit exported successfully');
    } catch (err) {
      toast.error('Failed to export circuit');
      console.error(err);
    }
  }, [operations, numQubits]);

  // AI Assistant functions
  const handleAiPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAiPrompt(e.target.value);
  };
  
  const generateCircuit = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a description for the circuit');
      return;
    }
    
    setIsAiProcessing(true);
    
    try {
      // Call the OpenAI API through our backend endpoint
      const response = await fetch('/api/quantum-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          numQubits: numQubits
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate circuit');
      }
      
      const data = await response.json();
      
      // Set the AI response text
      setAiResponse(data.explanation || "I've generated a quantum circuit based on your description.");
      
      // Parse the operations from the response
      if (data.operations && Array.isArray(data.operations)) {
        setAiSuggestions(data.operations);
      } else {
        setAiSuggestions([]);
        // toast.warning('No valid circuit operations were generated');
      }
    } catch (error) {
      console.error('Error generating circuit:', error);
      setAiResponse('Sorry, there was an error generating the circuit. Please try again.');
      setAiSuggestions([]);
      toast.error('Failed to generate circuit');
    } finally {
      setIsAiProcessing(false);
    }
  };
  
  const applyAiSuggestions = () => {
    if (aiSuggestions.length === 0) {
      toast.error('No AI suggestions to apply');
      return;
    }
    
    try {
      // Reset the simulator
      const newSimulator = new QuantumSimulator(numQubits);
      
      // Apply each operation
      aiSuggestions.forEach(op => {
        // Ensure gate is a valid type
        const gate = op.gate as GateType | ControlledGateType;
        
        // Ensure target is a number
        const target = typeof op.target === 'number' ? op.target : parseInt(String(op.target), 10);
        
        // Ensure control is a number if present
        const control = op.control !== undefined 
          ? (typeof op.control === 'number' ? op.control : parseInt(String(op.control), 10))
          : undefined;
        
        if (control !== undefined && gate in ControlledGates) {
          newSimulator.applyControlledGate(
            JSON.parse(JSON.stringify(QuantumGates[ControlledGates[gate as ControlledGateType] as GateType])),
            control,
            target
          );
        } else {
          newSimulator.applyGate(
            JSON.parse(JSON.stringify(QuantumGates[gate as GateType])),
            target
          );
        }
      });
      
      // Update state
      setSimulator(newSimulator);
      setOperations(aiSuggestions);
      
      // Update probabilities
      const probabilities = newSimulator.getProbabilities();
      setResults(Object.fromEntries(
        probabilities.map((prob, i) => [i, prob])
      ));
      
      // Update history
      setOperationHistory(prev => [...prev, aiSuggestions]);
      setSimulatorHistory(prev => [...prev, newSimulator]);
      setResultsHistory(prev => [...prev, Object.fromEntries(
        probabilities.map((prob, i) => [i, prob])
      )]);
      
      toast.success('AI circuit applied successfully');
      setShowAIAssistant(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to apply AI circuit';
      setError(message);
      toast.error(message);
    }
  };

  // Undo function
  const undoOperation = useCallback(() => {
    // Check if we have history to undo
    if (operationHistory.length <= 1) {
      toast.error('Nothing to undo');
      return;
    }

    // Get previous state
    const prevIndex = operationHistory.length - 2;
    const prevOperations = operationHistory[prevIndex];
    const prevSimulator = simulatorHistory[prevIndex];
    const prevResults = resultsHistory[prevIndex];

    // Update state
    setOperations(prevOperations);
    setSimulator(prevSimulator);
    setResults(prevResults);
    
    // Update history by removing the last entry
    setOperationHistory(prev => prev.slice(0, -1));
    setSimulatorHistory(prev => prev.slice(0, -1));
    setResultsHistory(prev => prev.slice(0, -1));

    toast.success('Operation undone');
  }, [operationHistory, simulatorHistory, resultsHistory]);

  return (
    <div className={`min-h-screen bg-black text-white transition-opacity duration-500`}>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-gray-900 text-white p-4 z-40 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold ml-4">
              XREPO
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('playground')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'playground' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <FiZap className="w-4 h-4" />
                <span>Playground</span>
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'community' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <FiUsers className="w-4 h-4" />
                <span>Community</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <FiUser className="w-4 h-4" />
                <span>Profile</span>
              </button>
            </div>

            {/* Profile Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors flex items-center"
              >
                <FiUser className="mr-2" />
                Profile
              </button>
              
              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div 
                  ref={profileMenuRef}
                  className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-700"
                >
                  <Link 
                    href="/profile" 
                    className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                  >
                    <FiUser className="mr-2" />
                    Go to Profile
                  </Link>
                  <Link 
                    href="/subscription" 
                    className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                  >
                    <FiCreditCard className="mr-2" />
                    My Subscription
                  </Link>
                  <Link 
                    href="/settings" 
                    className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                  >
                    <FiSettings className="mr-2" />
                    Settings and Privacy
                  </Link>
                  <div className="border-t border-gray-700 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                  >
                    <FiLogOut className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar - always fixed and open */}
      <Sidebar isOpen={true} setIsOpen={() => {}} />

      {/* Main Content */}
      <main className="pt-24 px-8 transition-all duration-300 ml-72">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'community' && (
            <SocialFeed
              currentUser={currentUser || undefined}
              onUserClick={handleUserClick}
            />
          )}
          
          {activeTab === 'profile' && (
            <UserProfile
              userId={targetUserId}
              currentUserId={currentUser?.id}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
              onMessage={handleMessage}
              onEdit={handleEditProfile}
            />
          )}

          {activeTab === 'playground' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Quantum Circuit Playground</h1>
              </div>
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">Quantum Playground Coming Soon!</div>
                <div className="text-gray-500 text-sm">
                  The quantum circuit simulator is being integrated with the social platform.
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
