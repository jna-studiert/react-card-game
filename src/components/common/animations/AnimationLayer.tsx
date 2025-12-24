import type { AnimatedCardType } from '@/utils/types';
import AnimatedCard from './AnimatedCard';

function AnimatedSection({
    animatedCards,
}: {
    animatedCards: AnimatedCardType[];
}) {
    return animatedCards.map((card, index) => (
        <AnimatedCard
            key={card.id}
            value={card.cardValue}
            startPosition={card.startPosition}
            positionToMove={card.targetPosition}
            isMoving={true}
            isFlipping={card.animationType !== 'attack'}
            flyDelay={
                card.animationType === 'deal'
                    ? (animatedCards.length - index) * 0.5
                    : 0
            }
            flippingDuration={(card.duration / 3) * 4}
            isFrontUp={
                card.animationType === 'attack' ||
                card.animationType === 'discard'
            }
            userDelay={card.delay}
            flyDuration={card.duration}
            size={card.size}
            onAnimationEnd={card.onAnimationEnd}
        />
    ));
}

export default function AnimationLayer({
    playerAnimatedCards,
    computerAnimatedCards,
}: {
    playerAnimatedCards: AnimatedCardType[];
    computerAnimatedCards: AnimatedCardType[];
}) {
    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-999">
            <AnimatedSection animatedCards={computerAnimatedCards} />
            <AnimatedSection animatedCards={playerAnimatedCards} />
        </div>
    );
}
