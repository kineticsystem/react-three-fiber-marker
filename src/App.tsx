import Box from "./components/Box";
import Sphere from "./components/Sphere";
import Marker from "./components/Marker";

import React, { useRef, useState } from "react";

// React-Three fiber.
import { Canvas } from "@react-three/fiber";

// React-Three fiber components.
import { OrbitControls } from "@react-three/drei";

// We need this library to correctly use refs with Typescript.
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

function App() {
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const orbit = useRef<OrbitControlsImpl>(null!);

  return (
    <Canvas camera={{ fov: 45, position: [-4, 4, -7] }} shadows>
      <ambientLight intensity={0.2} />
      <directionalLight
        color={0xffffff}
        intensity={0.2}
        position={[-2, 0.6, -2]}
      />
      <gridHelper args={[4, 10, 0x3a3a3a, 0x3a3a3a]} />
      <OrbitControls ref={orbit} enabled={orbitEnabled} dampingFactor={1} />
      <Box position={[1.2, 0, 0]} />
      <Sphere position={[0, 1.2, 0]} />
      <Marker
        minRingRadius={1.0}
        ringSize={0.3}
        arrowRadius={0.1}
        arrowLength={1}
        onDragStart={() => setOrbitEnabled(false)}
        onDragStop={() => setOrbitEnabled(true)}
      >
        <Box position={[-1.2, 0, 0]} />
      </Marker>
    </Canvas>
  );
}

export default App;
