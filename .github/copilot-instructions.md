# SwarmGrid AI - Development Instructions

## Project Overview

SwarmGrid AI is an open-source energy grid optimization platform using multi-objective Particle Swarm Optimization (PSO). It balances cost, sustainability, energy output, disaster resilience, and maintenance feasibility.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS 4.0, Leaflet.js, Recharts, Framer Motion, Gemini API

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- npm or pnpm available
- (Optional) Gemini API key from https://ai.google.dev/

### 2. Installation
```bash
# Install dependencies
npm install

# Create environment file with your keys
cp .env.example .env.local
# Add NEXT_PUBLIC_GEMINI_API_KEY if available
```

### 3. Development Server
```bash
npm run dev
```
Visit http://localhost:3000

### 4. Build for Production
```bash
npm run build
npm start
```

## Key Features Implemented

✅ **Multi-objective PSO Algorithm** - Custom TypeScript implementation optimizing 5 dimensions
✅ **Interactive Dashboard** - Real-time metrics with Framer Motion animations
✅ **Optimization Page** - Run PSO with live progress and detailed results
✅ **Interactive Maps** - Leaflet.js with OpenStreetMap markers
✅ **API Routes** - Endpoints for weather, solar, suggestions, and optimization
✅ **Gemini AI** - Smart recommendations based on optimization results
✅ **Free Data APIs** - NASA POWER (solar) and Open-Meteo (weather) 

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with navigation
│   ├── page.tsx                # Dashboard home
│   ├── optimize/page.tsx       # PSO optimization page
│   ├── maps/page.tsx           # Interactive maps
│   ├── api/
│   │   ├── optimize/route.ts   # PSO algorithm endpoint
│   │   ├── weather/route.ts    # Open-Meteo weather API
│   │   ├── solar/route.ts      # NASA POWER solar API
│   │   └── suggest/route.ts    # Gemini AI suggestions
│   └── globals.css             # Global styles
├── components/
│   ├── MapComponent.tsx        # Leaflet map component
│   └── ui.tsx                  # Reusable UI components
└── lib/
    └── pso/
        ├── optimizer.ts        # PSO algorithm implementation
        └── helpers.ts          # Result interpretation utilities
```

## Configuration

### PSO Parameters (src/lib/pso/optimizer.ts)
- `numParticles`: 50 (swarm size)
- `numIterations`: 150 (optimization cycles)
- `w`: 0.7 (inertia weight)
- `c1`: 1.5 (cognitive parameter)
- `c2`: 1.5 (social parameter)

### Objective Weights (src/lib/pso/helpers.ts)
- Cost: 20%
- Sustainability: 25%
- Energy Output: 25%
- Disaster Resilience: 15%
- Maintenance Feasibility: 15%

Adjust weights based on project priorities.

## Environment Variables

```env
# Required for AI suggestions
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here

# Optional - Pre-configured URLs
NEXT_PUBLIC_NASA_POWER_API_URL=https://power.larc.nasa.gov/api/v1
NEXT_PUBLIC_OPEN_METEO_API_URL=https://api.open-meteo.com/v1
```

## API Endpoints

### POST /api/optimize
Runs multi-objective PSO optimization.
Response: `{ result, recommendations, iterations }`

### GET /api/weather?latitude=40&longitude=-95
Gets weather data from Open-Meteo.

### GET /api/solar?latitude=40&longitude=-95
Gets solar radiation data from NASA POWER.

### POST /api/suggest
Gets Gemini AI suggestions based on optimization results.

## Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Railway/Render
Push to GitHub, connect repo, auto-deploys.

## Development Tips

1. **Running PSO**: Adjust iterations for speed vs accuracy
2. **Map Customization**: Edit MapComponent.tsx for markers/layers
3. **Styling**: Use Tailwind classes; CSS is in globals.css
4. **API Testing**: Use `/api/` endpoints directly or through UI

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Leaflet not defined" | Dynamic import in maps/page.tsx handles this |
| API timeouts | Increase timeout or check internet connection |
| No Gemini suggestions | Add API key to .env.local |
| Chart rendering issues | Check data format in optimize/page.tsx |

## Next Steps

1. **Add More Algorithms**: Implement GA, ACO options
2. **Database**: Integrate Supabase for result persistence
3. **Multi-region**: Add regional optimization comparison
4. **Real data**: Connect to actual energy grid APIs
5. **Mobile**: Optimize for mobile devices

## Testing

```bash
# Type checking
npm run type-check

# Lint
npm run lint
```

## Performance Optimization

- PSO completes in <1 second with current config
- Maps lazy-load with dynamic import
- API routes cache responses where possible
- Recharts optimized for <50 data points

## Support & Resources

- Next.js 16 Docs: https://nextjs.org/docs
- PSO Algorithm: https://en.wikipedia.org/wiki/Particle_swarm_optimization
- Tailwind CSS: https://tailwindcss.com/docs
- Leaflet.js: https://leafletjs.com/reference.html
- Recharts: https://recharts.org/en-US/api

---

**Last Updated:** May 2025
**License:** MIT
