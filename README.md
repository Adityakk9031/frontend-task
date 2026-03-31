# JcurveIQ Agent Run Panel

A React-based UI component for monitoring live agent pipelines in real time.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

## 🛠 Features

- **Live Event Replay**: Replays agent events with realistic timing to simulate a live run.
- **Task Lifecycle**: Handles `running`, `complete`, `failed`, and `cancelled` (with `sufficient_data` optimization) states.
- **Parallel Grouping**: Visually groups tasks spawned as part of the same `parallel_group`.
- **Dependency Tracking**: Shows task dependencies and ensures the execution order reflects them.
- **Streaming Outputs**: Displays intermediate (`is_final: false`) outputs as they arrive.
- **Agent Thoughts**: Surfaces the internal reasoning of the coordinator and specialized agents.
- **Failure Recovery**: Clearly distinguishes between permanent failures and recovered retries.

## 🧪 Switching Fixtures
You can switch between the success and error scenarios using the buttons in the header:
- **Run Success Fixture**: A complete run covering parallel fetching, retries, and final synthesis.
- **Run Error Fixture**: A run that encounters an unrecoverable coordinator error.

## 🔮 Future Improvements
If I had more time, I would address:
1. **Interactive Dependencies**: Allow clicking a dependency ID to scroll to/highlight the referenced task.
2. **WebSocket Integration**: Replace the mock emitter with a real `EventSource` or WebSocket client.
3. **Advanced Filtering**: Allow users to filter tasks by agent type or status (e.g., "Show only failures").
4. **Export Results**: Add a button to download the final research synthesis as a PDF or Markdown file.
5. **A11y Enhancements**: Ensure all status transitions and streaming updates are properly announced to screen readers.

## 📝 Design Decisions
For a detailed breakdown of implementation choices for under-specified requirements, see [DECISIONS.md](./DECISIONS.md).
