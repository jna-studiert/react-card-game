import Card from '../card/Card';
import './styles.css';
import { useRef } from 'react';

interface AnimatedCardProps {
    value: number | null;
    isMoving: boolean;
    isFlipping: boolean;
    isFrontUp?: boolean;
    flyDelay?: number;
    flippingDuration?: number;
    flyDuration?: number;
    onAnimationEnd?: () => void;
    startPosition: { x: number; y: number };
    positionToMove: { x: number; y: number };
    size: { width: number; height: number };
}

export default function AnimatedCard({
    value,
    isMoving,
    isFlipping,
    isFrontUp = false,
    flyDelay = 0,
    flippingDuration = 0.6,
    flyDuration = 1,
    startPosition,
    positionToMove,
    size,
    onAnimationEnd,
}: AnimatedCardProps) {
    const hasEnded = useRef(false);

    const wrapperStyle = {
        width: `${size.width}px`,
        height: `${size.height}px`,
        left: `${startPosition.x}px`,
        top: `${startPosition.y}px`,
        '--transition-x': `${positionToMove.x}px`,
        '--transition-y': `${positionToMove.y}px`,
        '--fly-animation-duration': `${flyDuration}s`,
        '--fly-animation-delay': `${flyDelay}s`,
        '--flipping-animation-duration': `${flippingDuration}s`,
    } as React.CSSProperties;

    const handleAnimationEnd = () => {
        if (hasEnded.current) return;
        hasEnded.current = true;

        onAnimationEnd?.();
    };

    return (
        <div
            className={`card-wrapper ${isMoving ? 'fly' : ''} ${
                isFlipping ? 'flip' : ''
            }`}
            style={wrapperStyle}
            onAnimationEnd={handleAnimationEnd}
        >
            <Card value={value} isFrontUp={isFrontUp} />
        </div>
    );
}
