import React, { useEffect, useRef } from 'react'

interface Point3D {
  x: number
  y: number
  z: number
  baseX: number
  baseY: number
  baseZ: number
}

interface Edge {
  p1: number
  p2: number
}

/**
 * MedicalMesh3D: A luxury, ultra-lightweight orthographic 3D lattice canvas.
 * Zero external dependencies (0 KB bundle penalty).
 * Built with pure Canvas matrix mathematics, depth shading, and buttery-smooth 60fps animation.
 * Respects prefers-reduced-motion and document visibility.
 */
export const MedicalMesh3D: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

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

    // Build 3D Icosahedron / Molecular node lattice
    const phi = (1 + Math.sqrt(5)) / 2
    const radius = 130

    const rawVertices: [number, number, number][] = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ]

    // Normalize and scale to radius
    const points: Point3D[] = rawVertices.map(([vx, vy, vz]) => {
      const len = Math.sqrt(vx * vx + vy * vy + vz * vz)
      const nx = (vx / len) * radius
      const ny = (vy / len) * radius
      const nz = (vz / len) * radius
      return {
        x: nx,
        y: ny,
        z: nz,
        baseX: nx,
        baseY: ny,
        baseZ: nz
      }
    })

    // Add internal core nodes for molecular hospital depth
    const innerRadius = radius * 0.45
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6
      points.push({
        x: Math.cos(angle) * innerRadius,
        y: Math.sin(angle) * innerRadius,
        z: 0,
        baseX: Math.cos(angle) * innerRadius,
        baseY: Math.sin(angle) * innerRadius,
        baseZ: 0
      })
    }

    // Connect edges based on proximity
    const edges: Edge[] = []
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].baseX - points[j].baseX
        const dy = points[i].baseY - points[j].baseY
        const dz = points[i].baseZ - points[j].baseZ
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist < radius * 1.15) {
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
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1
      targetRotY = nx * 0.8
      targetRotX = -ny * 0.8
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    const render = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      ctx.clearRect(0, 0, width, height)

      // Smooth damped rotation towards cursor + slow continuous ambient drift
      rotX += (targetRotX - rotX) * 0.05 + 0.0012
      rotY += (targetRotY - rotY) * 0.05 + 0.0018

      const cosX = Math.cos(rotX)
      const sinX = Math.sin(rotX)
      const cosY = Math.cos(rotY)
      const sinY = Math.sin(rotY)

      const fov = 420
      const centerX = width / 2
      const centerY = height / 2

      // Transform and project points
      const projected = points.map((p) => {
        // Y rotation
        const x1 = p.baseX * cosY + p.baseZ * sinY
        const z1 = -p.baseX * sinY + p.baseZ * cosY

        // X rotation
        const y2 = p.baseY * cosX - z1 * sinX
        const z2 = p.baseY * sinX + z1 * cosX

        // Perspective divide
        const distance = fov / (fov + z2)
        const projX = centerX + x1 * distance
        const projY = centerY + y2 * distance

        return { x: projX, y: projY, z: z2, scale: distance }
      })

      // Draw edges with depth fading (Claude warm clay / terracotta palette)
      const isDark = document.documentElement.classList.contains('dark')
      const baseStrokeR = isDark ? 224 : 180
      const baseStrokeG = isDark ? 138 : 85
      const baseStrokeB = isDark ? 104 : 47

      ctx.lineWidth = 1

      for (const edge of edges) {
        const p1 = projected[edge.p1]
        const p2 = projected[edge.p2]
        const avgZ = (p1.z + p2.z) / 2
        // Depth alpha between 0.1 and 0.4
        const alpha = Math.max(0.08, Math.min(0.45, (avgZ + radius) / (radius * 2.2)))

        ctx.strokeStyle = `rgba(${baseStrokeR}, ${baseStrokeG}, ${baseStrokeB}, ${alpha})`
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      }

      // Draw nodes with depth radii
      for (const p of projected) {
        const nodeAlpha = Math.max(0.2, Math.min(0.85, (p.z + radius) / (radius * 2)))
        const nodeRadius = Math.max(1.8, 3.2 * p.scale)

        ctx.fillStyle = `rgba(${baseStrokeR}, ${baseStrokeG}, ${baseStrokeB}, ${nodeAlpha})`
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
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  )
}
