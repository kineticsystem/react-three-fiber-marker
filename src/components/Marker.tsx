import { ReactThreeFiber, useThree } from "@react-three/fiber";
import React from "react";
import * as THREE from "three";
import * as FreeformControls from "@kineticsystem/three-freeform-controls";

/**
 * This is a 3D marker to move and rotate an object in the scene.
 *
 * @example
 * import { Marker, MarkerEvents } from "./marker";
 * const marker = new Marker(this.camera, this.renderer.domElement, 1.4, 0.6, 0.2, 1.2);
 * this.marker.link(sphere);
 * marker.listen(MarkerEvents.EVENTS.DRAG_START, () => {
 *   this.orbit.enabled = false;
 * });
 * marker.listen(MarkerEvents.EVENTS.DRAG_STOP, () => {
 *   this.orbit.enabled = true;
 * });
 * this.scene.add(marker);
 */
/**
 * This is a 3D marker to move and rotate an object in the scene.
 *
 * @example
 * import { Marker, MarkerEvents } from "./marker";
 * const marker = new Marker(this.camera, this.renderer.domElement, 1.4, 0.6, 0.2, 1.2);
 * this.marker.link(sphere);
 * marker.listen(MarkerEvents.EVENTS.DRAG_START, () => {
 *   this.orbit.enabled = false;
 * });
 * marker.listen(MarkerEvents.EVENTS.DRAG_STOP, () => {
 *   this.orbit.enabled = true;
 * });
 * this.scene.add(marker);
 */
export class MarkerImpl extends FreeformControls.ControlsManager {
  private xTranslation?: TranslationGroup;
  private yTranslation?: TranslationGroup;
  private zTranslation?: TranslationGroup;
  private xRotation?: RotationGroup;
  private yRotation?: RotationGroup;
  private zRotation?: RotationGroup;

  constructor(
    camera: THREE.Camera,
    domElement: HTMLElement,
    private minRingRadius: number,
    private ringSize: number,
    private arrowRadius: number,
    private arrowLength: number
  ) {
    super(camera, domElement);
  }

  public setEnabled = (enabled: boolean) => {
    this.xTranslation?.setEnabled(enabled);
    this.yTranslation?.setEnabled(enabled);
    this.zTranslation?.setEnabled(enabled);
    this.xRotation?.setEnabled(enabled);
    this.yRotation?.setEnabled(enabled);
    this.zRotation?.setEnabled(enabled);
  };

  public link = (object: THREE.Object3D): THREE.Group => {
    const controls = this.anchor(object, {
      hideOtherHandlesOnDrag: true,
      hideOtherControlsInstancesOnDrag: false,
      highlightAxis: true,
      mode: FreeformControls.ANCHOR_MODE.INHERIT,
    });

    controls.showAll(false);
    controls.setupHandle(
      (this.xTranslation = new XTranslation(
        this.minRingRadius,
        this.arrowRadius,
        this.arrowLength
      ))
    );
    controls.setupHandle(
      (this.yTranslation = new YTranslation(
        this.minRingRadius,
        this.arrowRadius,
        this.arrowLength
      ))
    );
    controls.setupHandle(
      (this.zTranslation = new ZTranslation(
        this.minRingRadius,
        this.arrowRadius,
        this.arrowLength
      ))
    );
    controls.setupHandle(
      (this.xRotation = new XRotation(this.minRingRadius, this.ringSize))
    );
    controls.setupHandle(
      (this.yRotation = new YRotation(this.minRingRadius, this.ringSize))
    );
    controls.setupHandle(
      (this.zRotation = new ZRotation(this.minRingRadius, this.ringSize))
    );

    return controls;
  };
}

class RingFactory {
  public static createRing = (
    minRadius: number,
    maxRadius: number,
    color: number
  ): THREE.Mesh[] => {
    const sectors = 40;
    const geometry = new THREE.RingBufferGeometry(
      minRadius,
      maxRadius,
      sectors
    );

    // Assign an index to each face, either 0 or 1, used to select a materials.
    const pattern = [0, 1, 1, 0];
    for (let i = 0; i < 2 * sectors; i++) {
      geometry.addGroup(3 * i, 3, pattern[i % 4]);
    }

    // Create the materials.
    const material = [
      new THREE.MeshStandardMaterial({
        color: color,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshStandardMaterial({
        color: color,
        opacity: 0.5,
        transparent: true,
        side: THREE.DoubleSide,
      }),
    ];

    const meshes: THREE.Mesh[] = [];
    meshes.push(new THREE.Mesh(geometry, material));
    return meshes;
  };
}

/**
 * Create an arrow sitting on the origin and pointing in the direction of the y-axis.
 */
class ArrowFactory {
  public static createArrow = (
    minRingRadius: number,
    arrowRadius: number,
    arrowLength: number,
    color: number
  ): THREE.Mesh[] => {
    const radialSegments = 32;
    const material = new THREE.MeshStandardMaterial({ color: color });
    const meshes: THREE.Mesh[] = [];
    meshes.push(
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          arrowRadius,
          arrowRadius,
          arrowLength,
          radialSegments
        ).translate(0, arrowLength / 2, 0),
        material
      )
    );
    meshes.push(
      new THREE.Mesh(
        new THREE.ConeGeometry(
          2 * arrowRadius,
          2 * arrowRadius,
          radialSegments
        ).translate(0, arrowLength + arrowRadius, 0),
        material
      )
    );
    return meshes;
  };
}

abstract class RotationGroup extends FreeformControls.RotationGroup {
  protected enabled = true;
  setColor(color: string): void {
    throw new Error("Method not implemented.");
  }
  public setEnabled = (enabled: boolean) => {
    this.enabled = enabled;
  };
}

abstract class TranslationGroup extends FreeformControls.TranslationGroup {
  protected enabled = true;
  setColor(color: string): void {
    throw new Error("Method not implemented.");
  }
  public setEnabled = (enabled: boolean) => {
    this.enabled = enabled;
  };
}

/**
 * Handler to rotate the marker around the X axis.
 */
class XRotation extends RotationGroup {
  private meshes: THREE.Mesh[];

  constructor(private minRingRadius: number, private ringSize: number) {
    super();
    this.up = new THREE.Vector3(1, 0, 0);
    this.meshes = [];
    const ring = RingFactory.createRing(
      minRingRadius,
      minRingRadius + ringSize,
      0xff0000
    );
    ring.forEach((mesh) => {
      mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    });
    this.meshes.push(...ring);
    this.add(...ring);
  }

  getInteractiveObjects = (): THREE.Mesh[] => {
    if (this.enabled) {
      return [...this.meshes];
    } else {
      return [];
    }
  };
}

/**
 * Handler to rotate the marker around the Y axis.
 */
class YRotation extends RotationGroup {
  private meshes: THREE.Mesh[];
  constructor(private minRingRadius: number, private ringSize: number) {
    super();
    this.up = new THREE.Vector3(0, 1, 0);
    this.meshes = [];
    const ring = RingFactory.createRing(
      minRingRadius,
      minRingRadius + ringSize,
      0x00ff00
    );
    ring.forEach((mesh) => {
      mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    });
    this.meshes.push(...ring);
    this.add(...ring);
  }

  getInteractiveObjects = (): THREE.Mesh[] => {
    if (this.enabled) {
      return [...this.meshes];
    } else {
      return [];
    }
  };
}

/**
 * Handler to rotate the marker around the Z axis.
 */
class ZRotation extends RotationGroup {
  private meshes: THREE.Mesh[];
  constructor(private minRingRadius: number, private ringSize: number) {
    super();
    this.meshes = [];
    this.up = new THREE.Vector3(0, 0, 1);
    const ring = RingFactory.createRing(
      minRingRadius,
      minRingRadius + ringSize,
      0x0000ff
    );
    this.meshes.push(...ring);
    this.add(...ring);
  }

  getInteractiveObjects = (): THREE.Mesh[] => {
    if (this.enabled) {
      return [...this.meshes];
    } else {
      return [];
    }
  };
}

/**
 * Handler to translate the marker along the X axis.
 */
class XTranslation extends TranslationGroup {
  parallel: THREE.Vector3;
  private meshes: THREE.Mesh[];
  constructor(
    private minRingRadius: number,
    private arrowRadius: number,
    private arrowLength: number
  ) {
    super();
    this.up = new THREE.Vector3(0, 1, 0);
    this.parallel = new THREE.Vector3(1, 0, 0);

    this.meshes = [];
    const positiveArrow = ArrowFactory.createArrow(
      arrowRadius,
      arrowRadius,
      arrowLength,
      0xff0000
    );
    positiveArrow.forEach((mesh) => {
      mesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 2);
      mesh.translateOnAxis(new THREE.Vector3(0, 1, 0), minRingRadius);
    });
    this.meshes.push(...positiveArrow);
    this.add(...positiveArrow);

    const negativeArrow = ArrowFactory.createArrow(
      arrowRadius,
      arrowRadius,
      arrowLength,
      0xff0000
    );
    negativeArrow.forEach((mesh) => {
      mesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
      mesh.translateOnAxis(new THREE.Vector3(0, 1, 0), minRingRadius);
    });
    this.meshes.push(...negativeArrow);
    this.add(...negativeArrow);
  }

  getInteractiveObjects = (): THREE.Mesh[] => {
    if (this.enabled) {
      return [...this.meshes];
    } else {
      return [];
    }
  };
}

/**
 * Handler to translate the marker along the Y axis.
 */
class YTranslation extends TranslationGroup {
  parallel: THREE.Vector3;
  private meshes: THREE.Mesh[];
  constructor(
    private minRingRadius: number,
    private arrowRadius: number,
    private arrowLength: number
  ) {
    super();
    this.up = new THREE.Vector3(0, 0, 1);
    this.parallel = new THREE.Vector3(0, 1, 0);

    this.meshes = [];
    const positiveArrow = ArrowFactory.createArrow(
      arrowRadius,
      arrowRadius,
      arrowLength,
      0x00ff00
    );
    positiveArrow.forEach((mesh) => {
      mesh.translateOnAxis(new THREE.Vector3(0, 1, 0), minRingRadius);
    });
    this.meshes.push(...positiveArrow);
    this.add(...positiveArrow);

    const negativeArrow = ArrowFactory.createArrow(
      arrowRadius,
      arrowRadius,
      arrowLength,
      0x00ff00
    );
    negativeArrow.forEach((mesh) => {
      mesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI);
      mesh.translateOnAxis(new THREE.Vector3(0, 1, 0), minRingRadius);
    });
    this.meshes.push(...negativeArrow);
    this.add(...negativeArrow);
  }

  getInteractiveObjects = (): THREE.Mesh[] => {
    if (this.enabled) {
      return [...this.meshes];
    } else {
      return [];
    }
  };
}

/**
 * Handler to translate the marker along the Z axis.
 */
class ZTranslation extends TranslationGroup {
  parallel: THREE.Vector3;
  private meshes: THREE.Mesh[];
  constructor(
    private minRingRadius: number,
    private arrowRadius: number,
    private arrowLength: number
  ) {
    super();
    this.up = new THREE.Vector3(1, 0, 0);
    this.parallel = new THREE.Vector3(0, 0, 1);

    this.meshes = [];
    const positiveArrow = ArrowFactory.createArrow(
      arrowRadius,
      arrowRadius,
      arrowLength,
      0x0000ff
    );
    positiveArrow.forEach((mesh) => {
      mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
      mesh.translateOnAxis(new THREE.Vector3(0, 1, 0), minRingRadius);
    });
    this.meshes.push(...positiveArrow);
    this.add(...positiveArrow);

    const negativeArrow = ArrowFactory.createArrow(
      arrowRadius,
      arrowRadius,
      arrowLength,
      0x0000ff
    );
    negativeArrow.forEach((mesh) => {
      mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
      mesh.translateOnAxis(new THREE.Vector3(0, 1, 0), minRingRadius);
    });
    this.meshes.push(...negativeArrow);
    this.add(...negativeArrow);
  }

  getInteractiveObjects = (): THREE.Mesh[] => {
    if (this.enabled) {
      return [...this.meshes];
    } else {
      return [];
    }
  };
}

/*/////////////////////////////////////////////////////////////////////////////
 * React Three Fiber Marker.
 */

/**
 * This type merges all basic properties listed by the type "Object3DNode", all
 * properties of the "group" element and all properties which are specific to
 * this component.
 */
export type MarkerProps = ReactThreeFiber.Object3DNode<
  MarkerImpl,
  typeof MarkerImpl
> &
  JSX.IntrinsicElements["group"] & {
    // Marker properties.
    camera?: THREE.Camera;
    object?: THREE.Object3D | React.MutableRefObject<THREE.Object3D>;
    domElement?: HTMLElement;
    enabled?: boolean;
    minRingRadius?: number;
    ringSize?: number;
    arrowRadius?: number;
    arrowLength?: number;
    onDragStart?: (e?: THREE.Event) => void;
    onDragStop?: (e?: THREE.Event) => void;
  };

/**
 * A "forward ref component" automatically transfer the given ref down to a
 * subcomponent, in this case a "primitive" component.
 */
const Marker = React.forwardRef<MarkerImpl, MarkerProps>(
  (props: MarkerProps, ref) => {
    const {
      visible = true,
      enabled = true,
      object,
      children,
      minRingRadius = 1.0,
      ringSize = 0.6,
      arrowRadius = 0.2,
      arrowLength = 1.0,
      onDragStart,
      onDragStop,
      ...rest
    } = props;

    // Canvas context properties.
    const {
      camera,
      gl: { domElement },
    } = useThree();

    // Collect the properties to pass down to the marker component.
    const markerProps = { visible };

    // Collect the properties to pass down to the group of children.
    const groupProps = { ...rest };

    const marker = React.useMemo(
      () =>
        new MarkerImpl(
          camera,
          domElement,
          minRingRadius,
          ringSize,
          arrowRadius,
          arrowLength
        ),
      [camera, domElement, minRingRadius, ringSize, arrowRadius, arrowLength]
    );

    const group = React.useRef<THREE.Group>();

    // Called when the DOM has been fully loaded.
    React.useLayoutEffect(() => {
      if (object) {
        marker.link(object instanceof THREE.Object3D ? object : object.current);
        marker.setEnabled(enabled);
      } else if (group.current instanceof THREE.Object3D) {
        marker.link(group.current);
        marker.setEnabled(enabled);
      }
    }, [marker, object, enabled]);

    // Called when a drag operation starts or stops.
    React.useEffect(() => {
      if (onDragStart) {
        marker.listen(FreeformControls.EVENTS.DRAG_START, () => {
          onDragStart();
        });
      }
      if (onDragStop) {
        marker.listen(FreeformControls.EVENTS.DRAG_STOP, () => {
          onDragStop();
        });
      }
    }, [onDragStart, onDragStop, marker]);

    // Render a marker and, immediately after, a group containing all children.
    return marker ? (
      <>
        <primitive
          ref={ref}
          dispose={undefined}
          object={marker}
          {...markerProps}
        />
        <group ref={group} {...groupProps}>
          {children}
        </group>
      </>
    ) : null;
  }
);

export default Marker;
