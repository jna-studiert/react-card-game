import type { AnimatedCardType } from '@/types';
import AnimatedCard from '../common/AnimatedCard/AnimatedCard';

export default function AnimationLayer({
    playerAnimatedCards,
    computerAnimatedCards,
}: {
    playerAnimatedCards: AnimatedCardType[];
    computerAnimatedCards: AnimatedCardType[];
}) {
    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-999">
            {playerAnimatedCards.map((card, index) => (
                <AnimatedCard
                    key={card.id}
                    value={card.cardValue}
                    startPosition={card.startPosition}
                    positionToMove={card.targetPosition}
                    isMoving={true}
                    isFlipping={card.animationType !== 'attack'}
                    flyDelay={
                        card.animationType === 'deal'
                            ? (playerAnimatedCards.length - index) * 0.5
                            : 0
                    }
                    flippingDuration={(card.duration / 3) * 4}
                    isFrontUp={
                        card.animationType === 'attack' ||
                        card.animationType === 'discard'
                    }
                    flyDuration={card.duration}
                    size={card.size}
                    onAnimationEnd={card.onAnimationEnd}
                />
            ))}
            {computerAnimatedCards.map((card, index) => (
                <AnimatedCard
                    key={card.id}
                    value={card.cardValue}
                    startPosition={card.startPosition}
                    positionToMove={card.targetPosition}
                    isMoving={true}
                    isFlipping={card.animationType !== 'attack'}
                    flyDelay={
                        card.animationType === 'deal'
                            ? (computerAnimatedCards.length - index) * 0.5
                            : 0
                    }
                    flippingDuration={(card.duration / 3) * 4}
                    isFrontUp={
                        card.animationType === 'attack' ||
                        card.animationType === 'discard'
                    }
                    flyDuration={card.duration}
                    size={card.size}
                    onAnimationEnd={card.onAnimationEnd}
                />
            ))}
        </div>
    );
}
