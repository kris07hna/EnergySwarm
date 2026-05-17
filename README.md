# SwarmGrid AI - Multi-Objective Swarm Optimization for Sustainable Energy

![SwarmGrid AI](https://img.shields.io/badge/SwarmGrid-AI-blue?style=flat-square)
![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 🌍 Project Overview

SwarmGrid AI is an **open-source, fully free** energy grid optimization platform using **multi-objective Particle Swarm Optimization (PSO)**. It simultaneously optimizes across 5 key dimensions:

- 💰 **Cost** - Minimize infrastructure and operational expenses
- 🌱 **Sustainability** - Maximize renewable energy integration (solar + wind)
- ⚡ **Energy Output** - Optimize power generation capacity
- 🛡️ **Disaster Resilience** - Build redundant, fault-tolerant systems
- 🔧 **Maintenance Feasibility** - Ensure operational practicality

Perfect for hackathons, smart city planning, climate research, and government energy policy.

## ✨ Key Features

### 🔬 Advanced Optimization
- **Custom PSO Implementation** - TypeScript-based particle swarm optimization
- **Multi-Objective Balance** - Weighted optimization across 5 key metrics
- **Real-time Visualization** - Live charts and progress tracking

### 🗺️ Interactive Maps
- **Leaflet.js + OpenStreetMap** - Free, open-source mapping
- **Solar Potential Zones** - Identify high-efficiency areas
- **Wind Resource Mapping** - Visualize wind patterns
- **Deployment Planning** - Strategic site selection

### 🌤️ Weather & Environmental Data
- **NASA POWER API** - Free solar radiation data (no API key needed!)
- **Open-Meteo** - Free weather forecasts and historical data
- **No API Costs** - All data sources are completely free

### 📊 Analytics Dashboard
- **Recharts Integration** - Professional charts and graphs
- **Real-time Metrics** - CPU, memory, energy distribution
- **Comparative Analysis** - Before/after optimization views

### 🤖 AI Suggestions
- **Gemini API Integration** - Smart recommendations for grid improvement
- **Context-Aware** - Based on specific optimization results
- **Wise Token Usage** - Efficient API calls

## 🚀 Tech Stack

| Category | Technology | Why? |
|----------|-----------|------|
| **Frontend** | Next.js 16 | Fast, production-ready, built-in API routes |
| **Styling** | Tailwind CSS 4.0 | Utility-first, fully customizable |
| **UI Components** | shadcn/ui + Lucide Icons | Accessible, beautiful components |
| **Animations** | Framer Motion | Smooth, performant animations |
| **Maps** | Leaflet.js + React Leaflet | Lightweight, feature-rich mapping |
| **Charts** | Recharts | React-friendly charting library |
| **Language** | TypeScript 5.6 | Type-safe, scalable development |
| **Deployment** | Vercel | Free, seamless Next.js hosting |
| **Database** | Supabase (optional) | PostgreSQL + Auth, free tier |
| **Weather** | Open-Meteo + NASA POWER | Free APIs, no authentication |
| **AI** | Gemini API | Free tier available |

## 📦 Installation

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org/))
- npm or pnpm

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/swarmgrid-ai.git
cd swarmgrid-ai

# Install dependencies
npm install
# or
pnpm install

# Create environment file
cp .env.example .env.local

# Add your Gemini API key (optional for AI suggestions)
# Get it from: https://ai.google.dev/

# Start development server
npm run dev
```

Visit http://localhost:3000 in your browser.

## 🎯 Usage

### 1. **Dashboard** (`/`)
Overview of current grid metrics and key statistics

### 2. **Optimization** (`/optimize`)
- Click "Run PSO Algorithm"
- Watch real-time PSO optimization
- View results with detailed breakdowns
- Get AI-powered recommendations

### 3. **Maps** (`/maps`)
- Explore solar and wind potential areas
- Interactive markers for deployment sites
- OpenStreetMap base layer

## 🔧 Configuration

### Adjust PSO Parameters
Edit [src/lib/pso/optimizer.ts](src/lib/pso/optimizer.ts):

```typescript
// Number of particles in the swarm
numParticles: 50

// Optimization iterations
numIterations: 150

// Inertia weight (0-1, controls velocity influence)
w: 0.7

// Cognitive parameter (self-attraction)
c1: 1.5

// Social parameter (group-attraction)
c2: 1.5
```

### Adjust Objective Weights
Edit [src/lib/pso/helpers.ts](src/lib/pso/helpers.ts):

```typescript
{
  cost: 0.2,              // 20% weight
  sustainability: 0.25,   // 25% weight
  energyOutput: 0.25,     // 25% weight
  disasterResilience: 0.15, // 15% weight
  maintenanceFeasibility: 0.15 // 15% weight
}
```

## � New Components & Features

### Loading Screen with Swarm Visualization
- Animated particle visualization during optimization
- Real-time progress tracking (0-100%)
- Objective status indicators
- Beautiful gradient backgrounds

### Enhanced PSO Optimizer
- Real-time iteration tracking
- Particle position history
- Global best fitness monitoring
- Progress reporting for UI updates

### Real-Time Data Dashboard
- Carbon intensity forecast
- Electricity price trends
- Grid demand prediction
- System reliability metrics
- 24-hour forecasts with charts

## �📐 How PSO Works

### Algorithm Flow
1. **Initialize** - Random particles with velocities
2. **Evaluate** - Calculate fitness for each particle (lower is better)
3. **Update Personal Best** - Track best position for each particle
4. **Update Global Best** - Track best position across all particles
5. **Update Velocity** - Adjust direction based on personal + social influence
6. **Repeat** - Until convergence or max iterations

### Fitness Function
Combines 5 objectives with configurable weights:
```
fitness = cost_score - (sustainability + energy + resilience + maintenance)
```

## 🌐 Free APIs Used

### Solar & Weather Data
- **NASA POWER API** - Monthly solar irradiance data
- **Open-Meteo API** - Weather forecasts, no API key needed

### Energy Grid Data
- **Carbon Intensity** - Real-time grid carbon emissions
- **Electricity Prices** - Hourly market rates (integrates with regional ISOs)
- **Grid Status** - Demand forecasts and system reliability

### Geospatial Data
- **OpenElevation** - Terrain elevation data
- **Natural Earth** - Geographic features
- **OpenStreetMap** - Infrastructure mapping

All APIs are **100% FREE** with no payment required!

## 🤖 Gemini API Integration

Get free AI suggestions for your optimization results:

1. Visit [ai.google.dev](https://ai.google.dev/)
2. Create API key
3. Add to `.env.local`:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
```

## 📊 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Railway or Render

```bash
# Push to GitHub
git push origin main

# Connect repo to Railway/Render dashboard
# Auto-deploys on push
```

## 📝 Project Structure

```
swarmgrid-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Dashboard
│   │   ├── optimize/          # Optimization page
│   │   ├── maps/              # Maps page
│   │   ├── api/               # API routes
│   │   │   ├── optimize/      # PSO endpoint
│   │   │   ├── weather/       # Weather data
│   │   │   ├── solar/         # Solar data
│   │   │   └── suggest/       # Gemini suggestions
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── MapComponent.tsx   # Leaflet map
│   │   └── ui.tsx             # UI primitives
│   └── lib/
│       └── pso/
│           ├── optimizer.ts   # PSO algorithm
│           └── helpers.ts     # Utilities
├── public/                    # Static assets
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind config
└── next.config.ts             # Next.js config
```

## 🎓 Learning Resources

- [PSO Algorithm Explained](https://en.wikipedia.org/wiki/Particle_swarm_optimization)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/en-US/api)
- [Leaflet.js](https://leafletjs.com/)

## 🏆 Why This Approach?

### For Hackathons:
✅ Complete, production-ready codebase
✅ No paid APIs or authentication headaches
✅ Unique technical differentiator (multi-objective PSO)
✅ Impressive visualizations
✅ Can be built in 2-4 days

### For Judges:
✅ Fully open-source (GitHub credibility)
✅ Original algorithm implementation (not just using libraries)
✅ Real-world applicability (energy grids matter)
✅ Scalable to smart city platforms
✅ Well-documented code

## � API Endpoints

### Optimization
```
POST /api/optimize
```
Runs multi-objective PSO algorithm with 5 objectives
- Response: `{ result, recommendations, iterations }`

### Energy Data
```
GET /api/weather?latitude=40&longitude=-95
```
Gets weather forecast from Open-Meteo (temperature, wind, precipitation)

```
GET /api/solar?latitude=40&longitude=-95
```
Gets solar irradiance data from NASA POWER API

### Grid Data
```
GET /api/carbon?latitude=40&longitude=-95
```
Gets carbon intensity forecast (g CO₂/kWh)

```
GET /api/prices?region=US
```
Gets hourly electricity price forecasts

```
GET /api/grid-status?region=us-east&hours=24
```
Gets grid demand forecast and reliability metrics

```
GET /api/geo?latitude=40&longitude=-95
```
Gets geospatial data: terrain, infrastructure, population density

### AI Suggestions
```
POST /api/suggest
```
Gets Gemini AI recommendations based on optimization results

## �🚧 Future Enhancements

- [ ] Genetic Algorithm option
- [ ] Multi-region optimization
- [ ] Real-time weather integration
- [ ] User authentication
- [ ] Database persistence
- [ ] Export optimization results as PDF
- [ ] Historical trend analysis
- [ ] Team collaboration features

## 📄 License

MIT - Feel free to use in commercial or personal projects

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

- 📧 Email: support@swarmgrid.ai
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/swarmgrid-ai/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/swarmgrid-ai/discussions)

## ⭐ Show Your Support

If this project helps you, please give it a star! ⭐

---

**Built with ❤️ for sustainable energy and open-source innovation**
