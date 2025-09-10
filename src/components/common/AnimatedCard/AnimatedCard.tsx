import Card from '../Card/Card';
import './styles.css';

interface AnimatedCardProps {
    value: number | null;
    isMoving: boolean;
    isFlipping: boolean;
    isFrontUp?: boolean;
    delay?: number;
    duration?: number;
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
    delay = 0,
    duration = 1,
    startPosition,
    positionToMove,
    size,
    onAnimationEnd,
}: AnimatedCardProps) {
    const wrapperStyle = {
        width: `${size.width}px`,
        height: `${size.height}px`,
        left: `${startPosition.x}px`,
        top: `${startPosition.y}px`,
        '--transition-x': `${positionToMove.x}px`,
        '--transition-y': `${positionToMove.y}px`,
        '--animation-duration': `${duration}s`,
        '--animation-delay': `${delay}s`,
    } as React.CSSProperties;

    return (
        <div
            className={`card-wrapper ${isMoving ? 'fly' : ''} ${
                isFlipping ? 'flip' : ''
            }`}
            style={wrapperStyle}
            onAnimationEnd={() => {
                if (onAnimationEnd) {
                    onAnimationEnd();
                }
            }}
        >
            <Card value={value} isFrontUp={isFrontUp} />
        </div>
    );
}
