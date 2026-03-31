import { useCallback } from 'react';
// import './App.css';
import { useAgentRun } from './hooks/useAgentRun';
import { useMockEmitter } from '../mock/emitter';
import { AgentRunPanel } from './components/AgentRunPanel';
import type { RunEvent } from './types/events';

import runSuccessData from '../mock/fixtures/run_success.json';
import runErrorData from '../mock/fixtures/run_error.json';

const SUCCESS_FIXTURE = runSuccessData as RunEvent[];
const ERROR_FIXTURE = runErrorData as RunEvent[];

function App() {
  const { state, processEvent, reset } = useAgentRun();
  const { play, stop } = useMockEmitter(processEvent);

  const handleStartSuccess = useCallback(() => {
    reset();
    play(SUCCESS_FIXTURE);
  }, [play, reset]);

  const handleStartError = useCallback(() => {
    reset();
    play(ERROR_FIXTURE);
  }, [play, reset]);

  const handleReset = useCallback(() => {
    stop();
    reset();
  }, [stop, reset]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-200">
              J
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">JcurveIQ</h1>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Agent Monitor v1.0</p>
            </div>
          </div>
          
          <div className="flex gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            <button 
              onClick={handleStartSuccess}
              disabled={state.status === 'running'}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                state.status === 'running' 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'
              }`}
            >
              Run Success Fixture
            </button>
            <button 
              onClick={handleStartError}
              disabled={state.status === 'running'}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                state.status === 'running' 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-100'
              }`}
            >
              Run Error Fixture
            </button>
            {state.status !== 'idle' && (
              <button 
                onClick={handleReset}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-all border border-slate-200"
              >
                Stop & Reset
              </button>
            )}
          </div>
        </header>

        <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <AgentRunPanel state={state} onReset={handleReset} />
        </main>
        
        <footer className="mt-20 py-8 border-t border-slate-200 text-center text-slate-400 text-xs">
          <p>© 2026 JcurveIQ Research Pipeline Monitor. For internal use only.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
