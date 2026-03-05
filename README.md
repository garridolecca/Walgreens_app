# Walgreens Strategic Intelligence Platform

**Live Demo:** [garridolecca.github.io/Walgreens_app](https://garridolecca.github.io/Walgreens_app/)

A geospatial data science platform built with **ArcGIS Maps SDK for JavaScript 5.0** that addresses Walgreens' 6 critical business challenges using 8,326 real store locations.

## Overview

The platform provides interactive mapping and spatial analytics across six strategic modules:

| Module | Description |
|--------|-------------|
| **Overview** | Dashboard summarizing Walgreens' 6 critical challenges — store closures, market decline, retail erosion, Rx margin compression, healthcare write-downs, and PE buyout context |
| **Store Network** | Data-driven closure sequencing using gravity models, accessibility analysis, and Huff model customer redistribution with risk-tiered store visualization |
| **Pharmacy & SDOH** | Pharmacy desert mapping with social determinants of health overlays, GeoEnrichment integration, Living Atlas SDOH layers, and medication adherence modeling |
| **Retail & Competition** | Geodemographic clustering, competitive proximity analysis (CVS, Walmart, Amazon, Rite Aid), and drive-time catchment generation via ArcGIS Route Service |
| **Healthcare Footprint** | Viability assessment of VillageMD, Summit Health, and CityMD clinics with service area gap analysis and patient flow modeling |
| **PE Strategy** | Micro-fulfillment network optimization, real estate monetization scoring, and 5-year demographic forecasting for Sycamore Partners restructuring |
| **ArcGIS 5.0 Lab** | Interactive showcase of ArcGIS 5.0 features — weather effects, daylight simulation, bloom/glow rendering, emissive materials, and SelectionManager (beta) |

## Getting Started

1. Open the [live site](https://garridolecca.github.io/Walgreens_app/)
2. Enter your **ArcGIS API Key** to enable live location services (GeoEnrichment, Places API, Geocoding, Routing, Weather), or click **Use Mock Data** to explore with sample data
3. Navigate between modules using the tab bar

## Tech Stack

- **ArcGIS Maps SDK for JavaScript 5.0** — Maps, 2D/3D views, spatial analysis
- **ArcGIS Location Services** — GeoEnrichment, Places API, Geocoding, Routing
- **Living Atlas of the World** — SDOH and demographic layers
- **Vanilla JavaScript** — No framework dependencies
- **CSS** — Custom dark theme UI

## Project Structure

```
Walgreens_app/
  index.html       # Single-page application shell with all module panels
  css/main.css     # Dark theme styles
  js/
    app.js         # Core application logic, map initialization, all module controllers
    stores.js      # 8,326 real Walgreens store coordinates
    data.js        # Mock data for clinics, competitors, fulfillment candidates
```

## ArcGIS 5.0 Features Demonstrated

- Weather effects (sunny, cloudy, rainy, snowy, foggy)
- Daylight and time-of-day simulation
- Bloom / glow visual effects
- Emissive materials for 3D symbology
- SelectionManager (beta) for cross-layer selection sync
- HeatmapRenderer for density visualization
- FeatureLayer with ClassBreaks rendering

## License

This project is for educational and demonstration purposes.
