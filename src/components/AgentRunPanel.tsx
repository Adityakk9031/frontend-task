import React, { useMemo } from 'react';
import type { RunState, TaskState } from '../types/events';

interface AgentRunPanelProps {
  state: RunState;
  onReset: () => void;
}

export const AgentRunPanel: React.FC<AgentRunPanelProps> = ({ state, onReset }) => {
  const { status, query, elapsed_ms, tasks, task_order, final_result, error_message, system_thoughts } = state;

  const formatTime = (ms: number) => {
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  };

  if (status === 'idle') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Ready to Start</h2>
        <p className="text-slate-500 mb-6">Select a fixture to see the agent pipeline in action.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 block">Original Query</span>
            <h2 className="text-xl font-medium text-slate-900 leading-tight">{query}</h2>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mb-2 ${
              status === 'running' ? 'bg-blue-100 text-blue-800' :
              status === 'complete' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-1.5 ${
                status === 'running' ? 'bg-blue-500 animate-pulse' :
                status === 'complete' ? 'bg-green-500' :
                'bg-red-500'
              }`}></span>
              {status}
            </div>
            <div className="text-sm font-mono text-slate-500">{formatTime(elapsed_ms)} elapsed</div>
          </div>
        </div>
        
        {/* System Thoughts */}
        {system_thoughts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">Coordinator Strategy</span>
            <div className="space-y-2">
              {system_thoughts.map((thought, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 mt-0.5">💭</span>
                  <p>{thought}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {task_order.map((taskId, index) => {
          const task = tasks[taskId];
          const isLast = index === task_order.length - 1;
          
          // Group parallel tasks
          const isParallel = !!task.parallel_group;
          const nextTask = task_order[index + 1] ? tasks[task_order[index + 1]] : null;
          const prevTask = task_order[index - 1] ? tasks[task_order[index - 1]] : null;
          
          const isFirstInGroup = isParallel && (!prevTask || prevTask.parallel_group !== task.parallel_group);
          const isLastInGroup = isParallel && (!nextTask || nextTask.parallel_group !== task.parallel_group);

          return (
            <div key={taskId} className={`relative ${isParallel ? 'ml-8' : ''}`}>
              {/* Parallel group indicator line */}
              {isParallel && (
                <div className={`absolute -left-4 top-0 bottom-0 w-0.5 bg-slate-200 ${isFirstInGroup ? 'rounded-t-full' : ''} ${isLastInGroup ? 'rounded-b-full' : ''}`}>
                  {isFirstInGroup && <div className="absolute -left-1 top-0 w-3 h-0.5 bg-slate-200"></div>}
                  {isLastInGroup && <div className="absolute -left-1 bottom-0 w-3 h-0.5 bg-slate-200"></div>}
                </div>
              )}

              <TaskItem task={task} />
            </div>
          );
        })}
      </div>

      {/* Final Output */}
      {status === 'complete' && final_result && (
        <div className="bg-slate-900 rounded-xl shadow-xl p-8 text-white mt-12 border-4 border-indigo-500/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-xl">✨</div>
            <div>
              <h2 className="text-2xl font-bold">Research Synthesis</h2>
              <p className="text-indigo-300 text-sm">Final output generated from {task_order.length} tasks</p>
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-lg leading-relaxed text-slate-200 mb-8">{final_result.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-700">
            {final_result.citations.map((cite) => (
              <div key={cite.ref_id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex items-start gap-3">
                <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded uppercase font-bold">{cite.ref_id}</span>
                <div>
                  <h4 className="font-medium text-slate-100">{cite.title}</h4>
                  <p className="text-xs text-slate-400">{cite.source} • Page {cite.page}</p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={onReset}
            className="mt-8 w-full py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-lg font-medium text-white border border-white/20"
          >
            Start New Research
          </button>
        </div>
      )}

      {/* Error Message */}
      {status === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-lg font-bold">Pipeline Error</h3>
          </div>
          <p className="text-red-700 mb-4">{error_message}</p>
          <button 
            onClick={onReset}
            className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
          >
            Reset and Retry
          </button>
        </div>
      )}
    </div>
  );
};

const TaskItem: React.FC<{ task: TaskState }> = ({ task }) => {
  const isCancelled = task.status === 'cancelled';
  const isFailed = task.status === 'failed';
  const isComplete = task.status === 'complete';

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all ${
      isCancelled ? 'opacity-75' : ''
    }`}>
      <div className={`h-1 w-full ${
        isComplete ? 'bg-green-500' :
        isFailed ? 'bg-red-500' :
        isCancelled ? 'bg-slate-300' :
        'bg-blue-500 animate-pulse'
      }`}></div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
              isComplete ? 'bg-green-100 text-green-700' :
              isFailed ? 'bg-red-100 text-red-700' :
              isCancelled ? 'bg-slate-100 text-slate-500' :
              'bg-blue-100 text-blue-700'
            }`}>
              {isComplete ? '✓' : isFailed ? '!' : isCancelled ? '⊘' : '●'}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{task.label}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  agent: {task.agent}
                </span>
                {task.retry_count > 0 && (
                  <span className="text-xs text-orange-600 font-medium">
                    (Retry #{task.retry_count})
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className={`text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wider ${
            isComplete ? 'text-green-600' :
            isFailed ? 'text-red-600' :
            isCancelled ? 'text-slate-500' :
            'text-blue-600'
          }`}>
            {task.status}
          </div>
        </div>

        {/* Thoughts */}
        {task.thoughts.length > 0 && (
          <div className="mb-3 pl-11">
            {task.thoughts.map((thought, i) => (
              <div key={i} className="text-xs italic text-slate-500 flex items-start gap-1.5">
                <span className="text-slate-300 shrink-0 mt-0.5">💭</span>
                <p>{thought}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tool Calls */}
        {task.tool_calls.length > 0 && (
          <div className="space-y-2 mb-3 pl-11">
            {task.tool_calls.map((call, i) => (
              <div key={i} className="bg-slate-50 rounded-lg border border-slate-100 p-3 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tool Call</span>
                  <span className="font-mono text-indigo-600 font-bold">{call.tool}</span>
                </div>
                <p className="text-slate-600 text-xs font-mono bg-white p-2 rounded border border-slate-100 mb-2">
                  {call.input}
                </p>
                {call.output && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Result</span>
                    <p className="text-slate-700 text-xs">{call.output}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Partial Outputs */}
        {task.partial_outputs.length > 0 && !task.final_output && (
          <div className="pl-11 mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Streaming Output</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-blue-400 animate-bounce"></div>
                <div className="w-1 h-1 rounded-full bg-blue-400 animate-bounce delay-75"></div>
                <div className="w-1 h-1 rounded-full bg-blue-400 animate-bounce delay-150"></div>
              </div>
            </div>
            <div className="bg-blue-50/50 border border-blue-100/50 rounded-lg p-3">
              {task.partial_outputs.map((out, i) => (
                <p key={i} className="text-xs text-blue-800 mb-1 last:mb-0 leading-relaxed">{out}</p>
              ))}
            </div>
          </div>
        )}

        {/* Final Output */}
        {task.final_output && (
          <div className="pl-11">
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">Task Result</span>
                {task.quality_score !== undefined && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-green-700 font-bold">Quality Score:</span>
                    <span className="text-xs font-bold text-green-800">{(task.quality_score * 100).toFixed(0)}%</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-green-900 leading-relaxed">{task.final_output}</p>
            </div>
          </div>
        )}

        {/* Cancelled Info */}
        {isCancelled && task.cancelled_reason === 'sufficient_data' && (
          <div className="pl-11 mt-2">
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 text-slate-600 text-xs flex items-start gap-2">
              <span className="text-lg leading-none mt-0.5">ℹ️</span>
              <div>
                <p className="font-semibold text-slate-700 mb-0.5">Auto-completed</p>
                <p>{task.cancelled_message || 'Sufficient data already collected from other sources.'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Info */}
        {isFailed && task.error && (
          <div className="pl-11 mt-2">
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-red-700 text-xs">
              <p className="font-bold mb-1">Error encountered:</p>
              <p className="font-mono">{task.error}</p>
            </div>
          </div>
        )}

        {/* Dependencies */}
        {task.depends_on.length > 0 && (
          <div className="pl-11 mt-4 pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Depends on</span>
              <div className="flex flex-wrap gap-1.5">
                {task.depends_on.map(depId => (
                  <span key={depId} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                    {depId}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
