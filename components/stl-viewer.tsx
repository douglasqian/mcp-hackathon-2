"use client"

import { useEffect, useState } from "react"
import { STLLoader } from "three/examples/jsm/loaders/STLLoader"
import { Center, PerspectiveCamera } from "@react-three/drei"
import * as THREE from "three"

interface STLViewerProps {
  url: string
}

export default function STLViewer({ url }: STLViewerProps) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loader = new STLLoader()

    loader.load(
      url,
      (loadedGeometry) => {
        setGeometry(loadedGeometry)
        setError(null)
      },
      undefined,
      (err) => {
        console.error("Error loading STL:", err)
        setError("Failed to load STL file")
      },
    )

    return () => {
      // Clean up URL object when component unmounts or URL changes
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url)
      }
    }
  }, [url])

  if (error) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    )
  }

  if (!geometry) {
    return null
  }

  // Calculate bounding box to center and scale the model
  const bbox = new THREE.Box3().setFromBufferAttribute(geometry.getAttribute("position") as THREE.BufferAttribute)
  const size = new THREE.Vector3()
  bbox.getSize(size)
  const maxDim = Math.max(size.x, size.y, size.z)
  const scale = 5 / maxDim // Scale to fit in a 5x5x5 box

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <Center scale={[scale, scale, scale]}>
        <mesh geometry={geometry}>
          <meshStandardMaterial color="#6E56CF" roughness={0.5} metalness={0.5} />
        </mesh>
      </Center>
    </>
  )
}
