import type { Operation } from '../../types/quantum';

export interface Complex {
  real: number;
  imag: number;
}

export interface QuantumState {
  amplitudes: Complex[];
  numQubits: number;
}

export interface CircuitHistory {
  id: string;
  timestamp: Date;
  description: string;
}

export interface CircuitValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CircuitMetrics {
  depth: number;
  totalGates: number;
  multiQubitGates: number;
  singleQubitGates: number;
  measurements: number;
}