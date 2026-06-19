import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.IntersectionObserver = MockIntersectionObserver;

// Mock window.Audio
class MockAudio {
  constructor(src) {
    this.src = src;
    this.volume = 1;
    this.loop = false;
  }
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
}
window.Audio = MockAudio;

// Mock Web Audio API
const mockAudioParam = {
  setValueAtTime: vi.fn().mockReturnThis(),
  exponentialRampToValueAtTime: vi.fn().mockReturnThis(),
  linearRampToValueAtTime: vi.fn().mockReturnThis(),
};

const mockNode = {
  connect: vi.fn(),
  gain: mockAudioParam,
  frequency: mockAudioParam,
  start: vi.fn(),
  stop: vi.fn(),
};

class MockAudioContext {
  constructor() {
    this.currentTime = 0;
    this.state = 'suspended';
  }
  createGain = vi.fn(() => ({
    ...mockNode,
    gain: { ...mockAudioParam }
  }));
  createOscillator = vi.fn(() => ({
    ...mockNode,
    frequency: { ...mockAudioParam }
  }));
  destination = {};
  resume = vi.fn().mockResolvedValue(undefined);
}

window.AudioContext = MockAudioContext;
window.webkitAudioContext = MockAudioContext;

// Mock localStorage
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  clear() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
}
const mockLocalStorageInstance = new MockLocalStorage();
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorageInstance,
  writable: true
});
global.localStorage = mockLocalStorageInstance;
