export type CardAnimationType = 'deal' | 'draw' | 'attack' | 'discard';

export type GameModalMode = 'start' | 'rules' | 'result' | 'pause' | null;

export type PlayerType = 'computer' | 'player';

export const MAX_POINTS = 2;

export interface AnimatedCardType extends SlotType {
    startPosition: { x: number; y: number };
    targetPosition: { x: number; y: number };
    size: { width: number; height: number };
    duration: number;
    animationType: CardAnimationType;
    delay?: number;
    onAnimationEnd?: () => void;
}

export interface SlotType {
    id: number;
    cardValue: number | null;
}

export interface AnimationCoordinates {
    startPosition: { x: number; y: number };
    targetPosition: { x: number; y: number };
    size: { width: number; height: number };
    duration: number;
    delay: number;
}

export interface AnimationConfig {
    startRef: HTMLDivElement;
    endRef?: HTMLDivElement;
    target?: PlayerType;
    animationType: CardAnimationType;
    animationSpeed?: number;
    animationDelay?: number;
}
