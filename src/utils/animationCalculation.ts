import type { AnimationCoordinates, AnimationConfig } from '@/utils/types';

export const calculateAnimationCoordinates = (
    config: AnimationConfig
): AnimationCoordinates => {
    const {
        startRef,
        endRef,
        target = 'player',
        animationType,
        animationSpeed = 800,
    } = config;

    const fieldRect = startRef.closest('.field')?.getBoundingClientRect();
    if (!fieldRect) {
        throw new Error('Field element not found');
    }

    const startRect = startRef.getBoundingClientRect();
    const cardSize = {
        width: startRef.offsetWidth,
        height: startRef.offsetHeight,
    };

    const startX = startRect.left - fieldRect.left;
    const startY = startRect.top - fieldRect.top;

    let targetX = 0;
    let targetY = 0;
    let distance = 0;

    switch (animationType) {
        case 'deal':
            if (endRef) {
                const endRect = endRef.getBoundingClientRect();
                targetX = endRect.left - fieldRect.left;
                targetY = endRect.top - fieldRect.top;

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
                duration: 0.8,
            };
    }

    throw new Error('Invalid animation configuration');
};
