import React, { useRef, useState } from "react";
import { useFrame, RootState } from "@react-three/fiber";

const Sphere = (props: JSX.IntrinsicElements["mesh"]) => {
  const ref = useRef<THREE.Mesh>(null!);
  const [angle, setAngle] = useState(0.0);
  useFrame((state: RootState, delta: number) => {
    setAngle(angle + 0.1);
    const scale = 1 + 0.1 * Math.sin(angle);
    ref.current.scale.set(scale, scale, scale);
  });
  return (
    <mesh {...props} ref={ref}>
      <sphereBufferGeometry args={[0.3, 24, 24]} />
      <meshStandardMaterial color={"yellow"} />
    </mesh>
  );
};

export default Sphere;
