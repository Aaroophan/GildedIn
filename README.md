# GildedIn

GildedIn is a cutting-edge, no-code portfolio platform designed to empower professionals, creatives, and developers with an instantly generated, highly customizable, and visually stunning web presence.

Leveraging the power of **Next.js 16**, **React 19**, and **Three.js**, GildedIn transforms static profiles into dynamic, interactive experiences. It eliminates the technical barrier to entry for building personal websites, offering users a dedicated URL structure (e.g., `domain.com/Username`) populated with rich, modular content sections.

## 🚀 Overview

The core philosophy of GildedIn is **"Instant Presence, Infinite Style."**

Upon registration, the system automatically provisions a comprehensive portfolio suite for the user. This includes nested routing for distinct professional facets—such as Projects, Experience, and Education—all wrapped in a responsive, high-performance interface. The platform supports real-time editing, allowing users to tweak their details and visual settings via an intuitive dashboard, with changes reflected instantly across their public profile.

Distinctive from standard portfolio builders, GildedIn deeply integrates 3D graphics and sophisticated animations, making every profile feel premium ("Gilded") and unique.

## ✨ Key Features

### 1. Dynamic Routing Architecture

- **Personalized URLs**: Every user receives a unique namespace `/[username]`.
- **Nested Sections**: dedicated sub-routes for content depth:
  - `/[username]/About`
  - `/[username]/Projects`
  - `/[username]/Experience`
  - `/[username]/Education`
  - `/[username]/Contact`
  - `/[username]/Blog`
  - `/[username]/Skills`
  - `/[username]/Reference`

### 2. Immersive Visual Experience

- **3D Integration**: Built-in support for 3D scenes and objects using `@react-three/fiber` and `@react-three/drei`.
- **Advanced Animations**: Smooth page transitions and element interactions powered by `framer-motion`.
- **Interactive UI**: Elements react to user input with effects like parallax tilt (`react-parallax-tilt`) and glow effects (`@codaworks/react-glow`).

### 3. Modular Content System

- **Component-Based Sections**: Each part of the portfolio is a self-contained module, ensuring consistency and maintainability.
- **Detailed Project Views**: Interactive project cards that expand into detailed modals or dedicated views.

### 4. Application Architecture

- **State Management**: Centralized state management using **Redux Toolkit** for predictable data flow.
- **Authentication**: Secure client-side authentication handling via `useAuth` hook and `AuthService`.
- **Mock Login Capability**: Includes a robust mock login flow for development and testing purposes (Test Credentials: `arophn@gmail.com` / `TEST1234`).

## 🛠 Technology Stack

GildedIn is built on a modern, robust, and scalable stack:

### Core Framework

- **[Next.js 16](https://nextjs.org/)**: React Framework for production, utilizing the App Router.
- **[React 19](https://react.dev/)**: The library for web and native user interfaces.
- **[TypeScript](https://www.typescriptlang.org/)**: Typed superset of JavaScript for type safety.

### Styling & Design

- **[Tailwind CSS 4](https://tailwindcss.com/)**: A utility-first CSS framework for rapid UI development.
- **[Lucide React](https://lucide.dev/)**: Beautiful & consistent icon toolkit.

### State Management

- **[Redux Toolkit](https://redux-toolkit.js.org/)**: The official, opinionated, batteries-included toolset for efficient Redux development.
- **[React Redux](https://react-redux.js.org/)**: Official React bindings for Redux.

### 3D & Animation

- **[Three.js](https://threejs.org/)**: JavaScript 3D library.
- **[@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)**: React renderer for Three.js.
- **[@react-three/drei](https://github.com/pmndrs/drei)**: Useful helpers for react-three-fiber.
- **[Framer Motion](https://www.framer.com/motion/)**: Production-ready animation library for React.
- **[React Parallax Tilt](https://github.com/mkosir/react-parallax-tilt)**: Parallax tilt effect.
- **[@codaworks/react-glow](https://github.com/codaworks/react-glow)**: Glow effects component.

### Utilities

- **[LogRocket](https://logrocket.com/)**: Session replay and monitoring.
- **Crypto-JS**: Cryptographic standards library.

## 📂 Project Structure

Verified layout of the source code:

```
src/
├── app/                 # Next.js App Router directory
│   ├── [username]/      # Dynamic user profile routes
│   │   ├── About/       # About section page
│   │   ├── Projects/    # Projects section page
│   │   ├── ...          # Other section pages
│   │   └── page.tsx     # Main profile landing page
│   ├── login/           # Login route
│   └── layout.tsx       # Root layout
├── components/          # Reusable React components
│   ├── 3d/              # Three.js experiences
│   ├── providers/       # Context providers (Theme, etc.)
│   ├── sections/        # Portfolio section components
│   ├── shell/           # App shell (Header, Sidebar)
│   └── ui/              # Atomic UI elements (Buttons, Inputs)
├── hooks/               # Custom React hooks (useAuth, useMessage)
├── models/              # TypeScript definitions and Business Logic
│   ├── Services/        # Service classes (Auth, Data fetching)
│   └── store/           # Redux slice definitions
├── stores/              # Redux store configuration
└── lib/                 # Shared utilities
```

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js**: Version 20 or higher recommended.
- **npm**: (comes with Node.js) or `yarn`/`pnpm`.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Aaroophan/GildedIn.git
   cd GildedIn
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the Development Server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

To create an optimized production build:

```bash
npm run build
npm start
```

## 🧪 Development Workflow

### Authentication

For development, use the mock credentials to simulate a logged-in state:

- **Email**: `arophn@gmail.com`
- **Password**: `TEST1234`

### Adding New Sections

1. Create a data model in `src/models/Services`.
2. Create a new directory in `src/app/[username]/`.
3. Build the UI component in `src/components/sections/`.
4. Register the route in the navigation.

# 👨‍💻 About the Creator

**Aaroophan Varatharajan**
**Full Stack Software Engineer | MSc in Computer Science (In Progress) | Metadata-Driven Systems | Next.js, React, JavaScript/TypeScript | C# (.NET) | Node.js | Python (FastAPI) | T-SQL | PostgreSQL | MongoDB | Agile Team Player | Blog Writer**

I am **Aaroophan Varatharajan** and I am the developer of GildedIn.

I am a **Software Engineer** with expertise in **Next.js**, **React**, **TypeScript**, and **ASP.NET Core**, I specialize in designing robust, scalable systems and metadata-driven UIs. I work on GildedIn to reflect my passion for combining clean architecture with immersive user experiences.

I thrive in building data-driven web applications and distributed multi-service pipelines. I am currently focused on advancing my expertise in **Computer Science** and **AI/ML integration** at the **University of Moratuwa**.

### 🌐 Connect

- **Portfolio**: [aaroophan.dev](https://aaroophan.dev)
- **GitHub**: [github.com/Aaroophan](https://github.com/Aaroophan)
- **Instagram**: [@Aaroophan](https://instagram.com/Aaroophan)
- **LinkedIn**: [linkedin.com/in/aaroophan](https://linkedin.com/in/aaroophan)
- **Medium**: [aaroophan.medium.com](https://aaroophan.medium.com)
- **Email**: arophn@gmail.com

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
