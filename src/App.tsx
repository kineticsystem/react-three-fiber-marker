import PulsatingBox from "./components/PulsatingBox";
import Marker from "./components/Marker";

import { useState } from "react";

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
      <gridHelper args={[6, 10, 0x3a3a3a, 0x3a3a3a]} />
      <OrbitControls enabled={orbitEnabled} dampingFactor={1} />
      <Marker
        position={[0, 1.2, 0]}
        minRingRadius={1.0}
        ringSize={0.3}
        arrowRadius={0.12}
        arrowLength={0.5}
        onDragStart={() => setOrbitEnabled(false)}
        onDragStop={() => setOrbitEnabled(true)}
      >
        <PulsatingBox />
      </Marker>
    </Canvas>
  );
}

export default App;
