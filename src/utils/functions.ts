import type { SlotType } from './types';

export const createDeck = (numberOfCards: number) => {
    const cards = Array.from({ length: numberOfCards }, (_, i) => i + 1);
    const deck = cards.flatMap((card) => Array(4).fill(card));
    return shuffle(deck);
};

export const shuffle = (array: number[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

export const checkCanAttack = (slots: SlotType[], activeCardValue: number) => {
    return activeCardValue === 1
        ? slots.filter((slot) => slot.cardValue === 5)
        : slots.filter(
              (slot) => !!slot.cardValue && slot.cardValue < activeCardValue
          );
};
