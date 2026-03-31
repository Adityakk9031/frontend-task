import { useState, useEffect, useCallback, useRef } from 'react';
import type { RunState, RunEvent, TaskState, TaskStatus } from '../types/events';

const INITIAL_STATE: RunState = {
  run_id: null,
  query: null,
  status: 'idle',
  tasks: {},
  task_order: [],
  system_thoughts: [],
  final_result: null,
  error_message: null,
  start_time: null,
  elapsed_ms: 0,
};

export function useAgentRun() {
  const [state, setState] = useState<RunState>(INITIAL_STATE);
  const timerRef = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = window.setInterval(() => {
      setState(s => {
        if (s.status !== 'running' || !s.start_time) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          return s;
        }
        return { ...s, elapsed_ms: Date.now() - s.start_time };
      });
    }, 100);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const processEvent = useCallback((event: RunEvent) => {
    setState(s => {
      switch (event.type) {
        case 'run_started':
          startTimer();
          return {
            ...INITIAL_STATE,
            run_id: event.run_id,
            query: event.query,
            status: 'running',
            start_time: Date.now(),
          };

        case 'agent_thought':
          if (event.task_id === 'coordinator' || !event.task_id) {
            return {
              ...s,
              system_thoughts: [...s.system_thoughts, event.thought],
            };
          }
          const thoughtTask = s.tasks[event.task_id];
          if (!thoughtTask) return s;
          return {
            ...s,
            tasks: {
              ...s.tasks,
              [event.task_id]: {
                ...thoughtTask,
                thoughts: [...thoughtTask.thoughts, event.thought],
              },
            },
          };

        case 'task_spawned':
          const newTask: TaskState = {
            id: event.task_id,
            label: event.label,
            agent: event.agent,
            status: 'running',
            spawned_by: event.spawned_by,
            parallel_group: event.parallel_group,
            depends_on: event.depends_on,
            thoughts: [],
            tool_calls: [],
            partial_outputs: [],
            retry_count: 0,
          };
          return {
            ...s,
            tasks: { ...s.tasks, [event.task_id]: newTask },
            task_order: [...s.task_order, event.task_id],
          };

        case 'tool_call':
          const callTask = s.tasks[event.task_id];
          if (!callTask) return s;
          return {
            ...s,
            tasks: {
              ...s.tasks,
              [event.task_id]: {
                ...callTask,
                tool_calls: [
                  ...callTask.tool_calls,
                  { tool: event.tool, input: event.input_summary },
                ],
              },
            },
          };

        case 'tool_result':
          const resultTask = s.tasks[event.task_id];
          if (!resultTask) return s;
          const updatedToolCalls = resultTask.tool_calls.map(tc =>
            tc.tool === event.tool && tc.output === undefined
              ? { ...tc, output: event.output_summary }
              : tc
          );
          return {
            ...s,
            tasks: {
              ...s.tasks,
              [event.task_id]: {
                ...resultTask,
                tool_calls: updatedToolCalls,
              },
            },
          };

        case 'partial_output':
          const partialTask = s.tasks[event.task_id];
          if (!partialTask) return s;
          if (event.is_final) {
            return {
              ...s,
              tasks: {
                ...s.tasks,
                [event.task_id]: {
                  ...partialTask,
                  final_output: event.content,
                  quality_score: event.quality_score ?? undefined,
                },
              },
            };
          }
          return {
            ...s,
            tasks: {
              ...s.tasks,
              [event.task_id]: {
                ...partialTask,
                partial_outputs: [...partialTask.partial_outputs, event.content],
              },
            },
          };

        case 'task_update':
          const updateTask = s.tasks[event.task_id];
          if (!updateTask) return s;
          
          let retryCount = updateTask.retry_count;
          // If transitioning from failed back to running, increment retry count
          if (updateTask.status === 'failed' && event.status === 'running') {
            retryCount += 1;
          }

          return {
            ...s,
            tasks: {
              ...s.tasks,
              [event.task_id]: {
                ...updateTask,
                status: event.status,
                error: event.error ?? undefined,
                cancelled_reason: event.reason ?? undefined,
                cancelled_message: event.message ?? undefined,
                retry_count: retryCount,
              },
            },
          };

        case 'run_complete':
          stopTimer();
          return {
            ...s,
            status: 'complete',
            final_result: event.output,
          };

        case 'run_error':
          stopTimer();
          return {
            ...s,
            status: 'failed',
            error_message: event.message,
          };

        default:
          return s;
      }
    });
  }, [startTimer, stopTimer]);

  const reset = useCallback(() => {
    stopTimer();
    setState(INITIAL_STATE);
  }, [stopTimer]);

  return { state, processEvent, reset };
}
