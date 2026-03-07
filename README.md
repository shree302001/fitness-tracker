# FitTrack

A personal fitness tracking app built with React, TypeScript, and Capacitor. Track your nutrition, workouts, body weight, and goals — available as both a PWA and Android app.

## Features

- **Dashboard** — Daily overview of calories, water intake, workouts, and body weight
- **Food Tracking** — Log meals and snacks with barcode scanning support
- **Workout Tracking** — Record exercises, sets, reps, and weights
- **Body Weight** — Track weight over time with trend charts
- **Goals** — Set and monitor fitness goals

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) — build tool
- [Tailwind CSS v4](https://tailwindcss.com/) — styling
- [Zustand](https://zustand-demo.pmnd.rs/) — state management
- [Recharts](https://recharts.org/) — data visualization
- [React Router v7](https://reactrouter.com/) — routing
- [Lucide React](https://lucide.dev/) — icons
- [ZXing](https://github.com/zxing-js/browser) — barcode scanning
- [Capacitor](https://capacitorjs.com/) — Android native app
- PWA support via [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run in development

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Android

### Build and open in Android Studio

```bash
npm run android
```

This runs `vite build`, syncs the Capacitor project, and opens Android Studio.

### Requirements for Android build

- Android Studio installed
- Java 17+
- Android SDK

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── layout/        # App shell and navigation
│   ├── dashboard/     # Dashboard widgets
│   ├── food/          # Food logging components
│   ├── workout/       # Workout logging components
│   ├── bodyweight/    # Body weight components
│   ├── goals/         # Goals components
│   └── ui/            # Generic UI primitives
├── pages/             # Route-level page components
├── stores/            # Zustand state stores
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
├── data/              # Static data and constants
└── utils/             # Utility functions
```

## Data Storage

All data is stored locally in the browser/app using `localStorage` via Zustand's persist middleware. No account or backend required.

## License

MIT
