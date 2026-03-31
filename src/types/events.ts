export type RunStatus = 'running' | 'complete' | 'failed';
export type TaskStatus = 'running' | 'complete' | 'failed' | 'cancelled';

export interface BaseEvent {
  type: string;
  timestamp: number;
}

export interface RunStartedEvent extends BaseEvent {
  type: 'run_started';
  run_id: string;
  query: string;
}

export interface AgentThoughtEvent extends BaseEvent {
  type: 'agent_thought';
  task_id: string | null;
  thought: string;
}

export interface TaskSpawnedEvent extends BaseEvent {
  type: 'task_spawned';
  task_id: string;
  label: string;
  agent: string;
  spawned_by: string;
  parallel_group: string | null;
  depends_on: string[];
}

export interface ToolCallEvent extends BaseEvent {
  type: 'tool_call';
  task_id: string;
  tool: string;
  input_summary: string;
}

export interface ToolResultEvent extends BaseEvent {
  type: 'tool_result';
  task_id: string;
  tool: string;
  output_summary: string;
}

export interface PartialOutputEvent extends BaseEvent {
  type: 'partial_output';
  task_id: string;
  content: string;
  is_final: boolean;
  quality_score: number | null;
}

export interface TaskUpdateEvent extends BaseEvent {
  type: 'task_update';
  task_id: string;
  status: TaskStatus;
  error?: string | null;
  reason?: string | null;
  message?: string | null;
}

export interface RunCompleteEvent extends BaseEvent {
  type: 'run_complete';
  run_id: string;
  status: 'complete';
  duration_ms: number;
  task_count: number;
  output: {
    summary: string;
    citations: Array<{
      ref_id: string;
      title: string;
      source: string;
      page: number;
    }>;
  };
}

export interface RunErrorEvent extends BaseEvent {
  type: 'run_error';
  run_id: string;
  message: string;
}

export type RunEvent =
  | RunStartedEvent
  | AgentThoughtEvent
  | TaskSpawnedEvent
  | ToolCallEvent
  | ToolResultEvent
  | PartialOutputEvent
  | TaskUpdateEvent
  | RunCompleteEvent
  | RunErrorEvent;

export interface TaskState {
  id: string;
  label: string;
  agent: string;
  status: TaskStatus;
  spawned_by: string;
  parallel_group: string | null;
  depends_on: string[];
  thoughts: string[];
  tool_calls: Array<{
    tool: string;
    input: string;
    output?: string;
  }>;
  partial_outputs: string[];
  final_output?: string;
  quality_score?: number;
  error?: string;
  cancelled_reason?: string;
  cancelled_message?: string;
  retry_count: number;
}

export interface RunState {
  run_id: string | null;
  query: string | null;
  status: RunStatus | 'idle';
  tasks: Record<string, TaskState>;
  task_order: string[];
  system_thoughts: string[];
  final_result: RunCompleteEvent['output'] | null;
  error_message: string | null;
  start_time: number | null;
  elapsed_ms: number;
}
