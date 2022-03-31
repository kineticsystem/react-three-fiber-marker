import PulsatingBox from "./components/PulsatingBox";
import Marker from "./components/Marker";

import React, { useState } from "react";

// React-Three fiber.
import { Canvas } from "@react-three/fiber";

// React-Three fiber components.
import { OrbitControls } from "@react-three/drei";

function App() {
  const [orbitEnabled, setOrbitEnabled] = useState(true);

  return (
    <Canvas camera={{ fov: 45, position: [-4, 4, -7] }} shadows>
      <ambientLight intensity={0.2} />
      <directionalLight
        color={0xffffff}
        intensity={0.2}
        position={[-2, 0.6, -2]}
      />
      <gridHelper args={[4, 10, 0x3a3a3a, 0x3a3a3a]} />
      <OrbitControls enabled={orbitEnabled} dampingFactor={1} />
      <Marker
        minRingRadius={1.0}
        ringSize={0.5}
        arrowRadius={0.15}
        arrowLength={1}
        onDragStart={() => setOrbitEnabled(false)}
        onDragStop={() => setOrbitEnabled(true)}
      >
        <PulsatingBox position={[0, 1.2, 0]} />
      </Marker>
    </Canvas>
  );
}

export default App;
