# Monte Carlo Simulations

This project is a collection of interactive simulations that use the Monte Carlo method to solve mathematical and physical problems in a visual and intuitive way.

## Project Overview

The project features two main simulations:

1. **Pi Calculation** - Uses the Monte Carlo method to approximate the value of Pi through random points in a square and circle.
2. **Shadow Simulation** - Demonstrates how the Monte Carlo method can be used to simulate realistic shadow projection with penumbra effects.

Each simulation includes an explanatory section that describes the theory and mathematical principles behind the application of the Monte Carlo method.

## Features

- Interactive React-based user interface
- Real-time visualization of simulation results
- Ability to modify parameters such as number of points/rays
- Drag and drop for elements in the simulations
- Responsive design with TailwindCSS

## How It Works

### Monte Carlo Method for Pi
The simulation generates random points within a square. By counting how many points fall inside an inscribed circle, we can approximate Pi using the formula: π ≈ 4 × (points in circle / total points).

### Monte Carlo Method for Shadows
The simulation generates random rays from a light source and traces their path through the scene. Shadow intensity is calculated based on the density of rays blocked by the obstacle.

## Getting Started

1. Clone this repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:3000`

## How to Modify the Project

### Adding a New Simulation

1. Create a new React component in the components/ directory
2. Create an associated explanation component
3. Add a new page in app/ that imports both components
3. Update navigation to include the new page

## Technologies Used

- Next.js (App Router)
- React
- TypeScript
- TailwindCSS
- HTML Canvas for renderings

## Contributing

Contributions are welcome! Feel free to open issues or pull requests to improve existing simulations or propose new Monte Carlo method implementations.