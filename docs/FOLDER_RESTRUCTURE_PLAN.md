# EnergySwarm Application - Folder Restructure Plan

## 🎯 Objectives

1. **Unify Landing Pages**: Merge `/` and `/demo` into single awesome landing
2. **Fix Agent Page**: Resolve map errors and improve UI
3. **Add PSO Graphs**: Visualization for optimization results
4. **Consistent UI/UX**: Unified design language across all pages
5. **Clean Structure**: Remove duplicates, organize logically

## 📁 Current Structure Issues

### Problems Identified:
- ❌ Two separate landing pages (`/` and `/demo`)
- ❌ Duplicate map components (`MapComponent.tsx` and `EnhancedMapComponent.tsx`)
- ❌ Map errors in `/agents` page
- ❌ No PSO graph visualization
- ❌ Inconsistent UI/UX across pages
- ❌ Unused components (`MapSwarmVisualization.tsx`)

## 🏗️ New Structure

```
src/
├── app/
│   ├── page.tsx                    # Main unified landing (merge demo + root)
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   │
│   ├── optimize/
│   │   └── page.tsx               # PSO optimization with graphs
│   │
│   ├── maps/
│   │   └── page.tsx               # Enhanced maps with swarm viz
│   │
│   ├── dashboard/
│   │   └── page.tsx               # Real-time dashboard
│   │
│   └── api/                       # All API routes (keep as is)
│       ├── optimize/
│       ├── solar/
│       ├── weather/
│       └── ...
│
├── components/
│   ├── core/                      # Core reusable components
│   │   ├── NavHeader.tsx
│   │   ├── LoadingScreen.tsx
│   │   └── ErrorBoundary.tsx
│   │
│   ├── landing/                   # Landing page components
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── PSOSection.tsx
│   │   └── CTASection.tsx
│   │
│   ├── maps/                      # Map-related components
│   │   ├── EnhancedMap.tsx       # Main map component
│   │   ├── MapLayers.tsx         # Layer management
│   │   ├── MapControls.tsx       # UI controls
│   │   └── SwarmOverlay.tsx      # PSO swarm on map
│   │
│   ├── optimization/              # PSO-related components
│   │   ├── PSOControls.tsx       # Start/stop/reset
│   │   ├── PSOGraphs.tsx         # Convergence graphs
│   │   ├── ParetoChart.tsx       # Pareto front viz
│   │   └── ResultsPanel.tsx      # Results display
│   │
│   ├── dashboard/                 # Dashboard components
│   │   ├── MetricsGrid.tsx
│   │   ├── ForecastChart.tsx
│   │   └── GridStatus.tsx
│   │
│   └── ui/                        # UI primitives
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       └── ...
│
├── lib/
│   ├── pso/                       # PSO algorithms
│   │   ├── optimizer.ts
│   │   ├── mopso.ts
│   │   └── helpers.ts
│   │
│   ├── api/                       # API utilities
│   │   ├── client.ts
│   │   └── cache.ts
│   │
│   └── utils/                     # General utilities
│       ├── formatting.ts
│       └── validation.ts
│
├── hooks/                         # Custom React hooks
│   ├── useOptimization.ts
│   ├── useMapData.ts
│   └── useScreenSize.ts
│
└── types/                         # TypeScript types
    ├── pso.ts
    ├── map.ts
    └── api.ts
```

## 🔄 Migration Steps

### Phase 1: Unify Landing Page
1. ✅ Merge best features from `/` and `/demo`
2. ✅ Create new unified `app/page.tsx`
3. ✅ Remove `app/demo/` directory
4. ✅ Update navigation links

### Phase 2: Reorganize Components
1. ✅ Move map components to `components/maps/`
2. ✅ Create `components/optimization/` for PSO
3. ✅ Consolidate UI components
4. ✅ Remove duplicates

### Phase 3: Add PSO Graphs
1. ✅ Create `PSOGraphs.tsx` component
2. ✅ Add convergence visualization
3. ✅ Add Pareto front chart
4. ✅ Integrate into optimize page

### Phase 4: Fix Agent Page
1. ✅ Fix map initialization
2. ✅ Use EnhancedMap component
3. ✅ Improve UI consistency
4. ✅ Add proper error handling

### Phase 5: Polish & Cleanup
1. ✅ Remove unused files
2. ✅ Update imports
3. ✅ Test all routes
4. ✅ Update documentation

## 📋 Component Consolidation

### To Keep:
- ✅ `EnhancedMapComponent.tsx` → `components/maps/EnhancedMap.tsx`
- ✅ `nav-header.tsx` → `components/core/NavHeader.tsx`
- ✅ `LoadingScreen.tsx` → `components/core/LoadingScreen.tsx`
- ✅ `ResearchGradeDashboard.tsx` → `components/dashboard/Dashboard.tsx`
- ✅ All UI components in `components/ui/`

### To Remove:
- ❌ `MapComponent.tsx` (replaced by EnhancedMap)
- ❌ `MapSwarmVisualization.tsx` (integrated into EnhancedMap)
- ❌ `home-demo.tsx` (merged into landing)
- ❌ `landing-experience.tsx` (merged into landing)
- ❌ `swarm-agents.tsx` (refactored)

### To Create:
- 🆕 `components/optimization/PSOGraphs.tsx`
- 🆕 `components/optimization/PSOControls.tsx`
- 🆕 `components/optimization/ParetoChart.tsx`
- 🆕 `components/landing/UnifiedLanding.tsx`
- 🆕 `hooks/useOptimization.ts`

## 🎨 UI/UX Unification

### Design System:
```typescript
// Color Palette
const colors = {
  primary: {
    cyan: '#06b6d4',
    violet: '#8b5cf6',
    blue: '#3b82f6'
  },
  accent: {
    amber: '#f59e0b',
    emerald: '#10b981',
    pink: '#ec4899'
  },
  neutral: {
    slate900: '#0f172a',
    slate800: '#1e293b',
    slate700: '#334155'
  }
};

// Typography
const typography = {
  hero: 'text-5xl md:text-7xl font-bold',
  heading: 'text-3xl md:text-4xl font-bold',
  subheading: 'text-xl md:text-2xl font-semibold',
  body: 'text-base md:text-lg',
  caption: 'text-sm text-white/70'
};

// Components
const components = {
  card: 'rounded-2xl border border-white/10 bg-slate-800/50 backdrop-blur-xl',
  button: 'rounded-xl px-6 py-3 font-semibold transition-all',
  badge: 'rounded-full px-4 py-1.5 text-xs uppercase tracking-wider'
};
```

### Consistent Patterns:
1. **Navigation**: Same NavHeader across all pages
2. **Cards**: Unified glass-morphism style
3. **Buttons**: Consistent gradient styles
4. **Animations**: Framer Motion with same timing
5. **Loading States**: Unified loading component
6. **Error Handling**: Consistent error displays

## 📊 PSO Graph Specifications

### Convergence Graph:
- X-axis: Iteration (0-100)
- Y-axis: Fitness Score
- Lines: Best, Average, Worst fitness
- Real-time updates during optimization

### Pareto Front Chart:
- X-axis: Cost
- Y-axis: Sustainability
- Points: All Pareto-optimal solutions
- Highlight: Current best solution

### Objective Breakdown:
- Radar chart showing 5 objectives
- Color-coded by performance
- Interactive tooltips

## 🔧 Implementation Priority

### High Priority (Do First):
1. ✅ Create unified landing page
2. ✅ Add PSO graphs to optimize page
3. ✅ Fix agent page map
4. ✅ Remove duplicate components

### Medium Priority:
5. ✅ Reorganize folder structure
6. ✅ Update all imports
7. ✅ Polish UI/UX consistency
8. ✅ Add error boundaries

### Low Priority (Polish):
9. ✅ Update documentation
10. ✅ Add more animations
11. ✅ Performance optimization
12. ✅ Mobile responsiveness

## ✅ Success Criteria

- [ ] Single awesome landing page at `/`
- [ ] PSO graphs visible when optimization runs
- [ ] Agent page map works without errors
- [ ] Consistent UI/UX across all pages
- [ ] No duplicate components
- [ ] Clean, organized folder structure
- [ ] All routes working
- [ ] Mobile responsive
- [ ] Fast load times (<2s)
- [ ] No console errors

## 📝 Notes

- Keep all API routes unchanged
- Maintain backward compatibility where possible
- Test each change before moving to next
- Update README with new structure
- Create migration guide for developers

---

**Status**: Ready to implement  
**Estimated Time**: 2-3 hours  
**Risk Level**: Medium (many file moves)  
**Testing Required**: Full regression test