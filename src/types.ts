export interface SlotType {
    id: number;
    isEmpty: boolean;
    cardValue: number | null;
}

export interface AnimatedCardType extends SlotType {
    startPosition: { x: number; y: number };
    targetPosition: { x: number; y: number };
    size: { width: number; height: number };
    duration: number;
    animationType: AnimationName;
}

export type AnimationName = 'deal' | 'draw' | 'attack';
