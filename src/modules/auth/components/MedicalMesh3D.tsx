import React, { useEffect, useRef } from 'react'

interface Point3D {
  x: number
  y: number
  z: number
}

interface Edge {
  p1: number
  p2: number
}

export interface MedicalMesh3DProps {
  className?: string
  radius?: number
  scale?: number
}

/**
 * MedicalMesh3D: Luxury orthographic 3D lattice canvas.
 * Zero external dependencies (0 KB bundle penalty).
 * Built with pure Canvas matrix mathematics, depth shading, and buttery-smooth 60fps animation.
 */
export const MedicalMesh3D: React.FC<MedicalMesh3DProps> = ({
  className = '',
  radius,
  scale = 1
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let animationFrameId: number
    let width = 0
    let height = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    // Build unit 3D Icosahedron & molecular core lattice
    const phi = (1 + Math.sqrt(5)) / 2
    const rawVertices: [number, number, number][] = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ]

    const unitPoints: Point3D[] = rawVertices.map(([vx, vy, vz]) => {
      const len = Math.sqrt(vx * vx + vy * vy + vz * vz)
      return { x: vx / len, y: vy / len, z: vz / len }
    })

    // Add internal core nodes for hospital molecular depth
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6
      unitPoints.push({ x: Math.cos(angle) * 0.45, y: Math.sin(angle) * 0.45, z: 0 })
    }

    // Connect edges based on normalized proximity (< 1.15)
    const edges: Edge[] = []
    for (let i = 0; i < unitPoints.length; i++) {
      for (let j = i + 1; j < unitPoints.length; j++) {
        const dx = unitPoints[i].x - unitPoints[j].x
        const dy = unitPoints[i].y - unitPoints[j].y
        const dz = unitPoints[i].z - unitPoints[j].z
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 1.15) {
          edges.push({ p1: i, p2: j })
        }
      }
    }

    let rotX = 0.2
    let rotY = 0.3
    let targetRotX = 0.2
    let targetRotY = 0.3

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return
      targetRotY = (((e.clientX - rect.left) / rect.width) * 2 - 1) * 0.8
      targetRotX = -(((e.clientY - rect.top) / rect.height) * 2 - 1) * 0.8
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    const render = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      ctx.clearRect(0, 0, width, height)

      // Damped rotation + slow continuous drift
      rotX += (targetRotX - rotX) * 0.05 + 0.0012
      rotY += (targetRotY - rotY) * 0.05 + 0.0018

      const cosX = Math.cos(rotX)
      const sinX = Math.sin(rotX)
      const cosY = Math.cos(rotY)
      const sinY = Math.sin(rotY)

      // Responsive generous radius: scaled ~2x bigger than original (260px vs 130px)
      const activeRadius = (radius ?? (width && height ? Math.max(220, Math.min(320, Math.min(width, height) * 0.34)) : 260)) * scale
      const fov = activeRadius * 3.2
      const centerX = width / 2
      const centerY = height / 2

      // Project vertices
      const projected = unitPoints.map((p) => {
        const bx = p.x * activeRadius
        const by = p.y * activeRadius
        const bz = p.z * activeRadius
        const x1 = bx * cosY + bz * sinY
        const z1 = -bx * sinY + bz * cosY
        const y2 = by * cosX - z1 * sinX
        const z2 = by * sinX + z1 * cosX
        const dist = fov / (fov + z2)
        return { x: centerX + x1 * dist, y: centerY + y2 * dist, z: z2, scale: dist }
      })

      const isDark = document.documentElement.classList.contains('dark')
      const strokeR = isDark ? 224 : 180
      const strokeG = isDark ? 138 : 85
      const strokeB = isDark ? 104 : 47

      ctx.lineWidth = Math.max(1, 1.25 * scale)

      // Render edges
      for (const edge of edges) {
        const p1 = projected[edge.p1]
        const p2 = projected[edge.p2]
        const avgZ = (p1.z + p2.z) / 2
        const alpha = Math.max(0.08, Math.min(0.48, (avgZ + activeRadius) / (activeRadius * 2.2)))
        ctx.strokeStyle = `rgba(${strokeR}, ${strokeG}, ${strokeB}, ${alpha})`
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      }

      // Render nodes
      for (const p of projected) {
        const nodeAlpha = Math.max(0.2, Math.min(0.88, (p.z + activeRadius) / (activeRadius * 2)))
        const nodeRadius = Math.max(2.2, 4.0 * p.scale)
        ctx.fillStyle = `rgba(${strokeR}, ${strokeG}, ${strokeB}, ${nodeAlpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, nodeRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [radius, scale])

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  )
}
