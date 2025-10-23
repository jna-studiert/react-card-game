import type { AnimationCoordinates, AnimationConfig } from '@/types';

export const calculateAnimationCoordinates = (
    config: AnimationConfig
): AnimationCoordinates => {
    const {
        startRef,
        endRef,
        target = 'player',
        animationType,
        animationSpeed = 500,
    } = config;

    const fieldRect = startRef.closest('.field')?.getBoundingClientRect();
    if (!fieldRect) {
        throw new Error('Field element not found');
    }

    const deckRect = startRef.getBoundingClientRect();
    const cardSize = {
        width: startRef.offsetWidth,
        height: startRef.offsetHeight,
    };

    const startX = deckRect.left - fieldRect.left;
    const startY = deckRect.top - fieldRect.top;

    let targetX = 0;
    let targetY = 0;
    let distance = 0;

    switch (animationType) {
        case 'deal':
            if (endRef) {
                const slotRect = endRef.getBoundingClientRect();
                targetX = slotRect.left - fieldRect.left;
                targetY = slotRect.top - fieldRect.top;

                const translateX = targetX - startX;
                const translateY = targetY - startY;

                distance = Math.hypot(translateX, translateY);

                return {
                    startPosition: { x: startX, y: startY },
                    targetPosition: { x: translateX, y: translateY },
                    size: cardSize,
                    duration: distance / animationSpeed,
                };
            }
            break;
        case 'draw':
            targetY =
                target === 'computer'
                    ? startRef.offsetHeight / 2
                    : -startRef.offsetHeight / 2;

            distance = Math.abs(targetY);

            return {
                startPosition: { x: startX, y: startY },
                targetPosition: { x: 0, y: targetY },
                size: cardSize,
                duration: 1.2,
            };
    }

    throw new Error('Invalid animation configuration');
};
