export interface SlotType {
    id: number;
    cardValue: number | null;
}

export interface AnimatedCardType extends SlotType {
    startPosition: { x: number; y: number };
    targetPosition: { x: number; y: number };
    size: { width: number; height: number };
    duration: number;
    animationType: CardAnimationType;
    onAnimationEnd?: () => void;
}

export type CardAnimationType = 'deal' | 'draw' | 'attack' | 'discard';

export interface AnimationCoordinates {
    startPosition: { x: number; y: number };
    targetPosition: { x: number; y: number };
    size: { width: number; height: number };
    duration: number;
}

export interface AnimationConfig {
    startRef: HTMLDivElement;
    endRef?: HTMLDivElement;
    target?: 'player' | 'computer';
    animationType: CardAnimationType;
    animationSpeed?: number;
}
