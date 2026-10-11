import React, { lazy, Suspense, Component, type ReactNode } from 'react';
import { useWebGLSupport } from '@/hooks/useWebGLSupport';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { StaticHeroFallback } from './StaticHeroFallback';

const HeroScene = lazy(() => import('./HeroScene'));

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ThreeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('3D Hero rendering error, falling back to static depth:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function LazyHero3D(): JSX.Element {
  const isWebGLSupported = useWebGLSupport();
  const prefersReducedMotion = useReducedMotion();

  if (!isWebGLSupported || prefersReducedMotion) {
    return <StaticHeroFallback />;
  }

  return (
    <ThreeErrorBoundary fallback={<StaticHeroFallback />}>
      <Suspense fallback={<StaticHeroFallback />}>
        <HeroScene />
      </Suspense>
    </ThreeErrorBoundary>
  );
}

export default LazyHero3D;
