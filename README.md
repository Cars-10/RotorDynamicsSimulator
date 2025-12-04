# Hydrogen-Cooled Generator Rotor Dynamics Simulator

An interactive rotor dynamics simulator for power generation turbine trains, featuring real-time vibration analysis, critical speed detection, and AI-generated rotor configurations.

## Features

- **3D Rotor Visualization** - Real-time animation of rotor modes and vibrations
- **Interactive Shaft Editor** - Modify rotor geometry and see immediate physics updates
- **Critical Speed Analysis** - Automatic detection of resonance zones
- **Bearing Analysis** - Polar plots for bearing loads and vibration
- **Game Mode** - Challenge yourself to tune the rotor within safe operating parameters
- **AI-Powered** - Uses Gemini AI to generate realistic rotor dynamics data

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your API key:**

   Open `.env.local` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

- **Generate New Rotor** - Click "Generate" to create a new rotor configuration
- **View Modes** - Select different critical speed modes from the dropdown
- **Edit Geometry** - Toggle "Edit Mode" to modify shaft segments
- **Game Mode** - Enable to challenge yourself to avoid resonance zones
- **Analysis** - View detailed frequency analysis and bearing plots

## Technology Stack

- React 19 + TypeScript
- Vite
- Google Gemini AI
- Tailwind CSS
- Canvas API for visualization

## License

MIT
