import React from 'react';
import Card from '../../common/card/Card';
import type { PlayerType } from '@/utils/types';

export default function Deck({
    deckRef,
    drawnCardRef,
    drawnCard,
    target,
    length,
}: {
    deckRef: React.RefObject<HTMLDivElement | null>;
    drawnCardRef: React.RefObject<HTMLDivElement | null>;
    drawnCard: number | null;
    target: PlayerType;
    length: number;
}) {
    return (
        <div
            className={`slot relative w-full max-w-40 aspect-[5/7] flex justify-center ${
                target === 'player' ? 'items-end' : 'items-start'
            }`}
        >
            <div className="absolute inset-0" ref={deckRef}>
                {!!length && (
                    <div className="card card-back-pattern card-back-gradient" />
                )}
            </div>

            <div
                ref={drawnCardRef}
                className={`absolute inset-0 ${
                    target === 'player' ? '-translate-y-1/2' : 'translate-y-1/2'
                }`}
            >
                {!!drawnCard && <Card value={drawnCard} isFrontUp={true} />}
            </div>

            <div
                className={`z-1 bg-black/40 text-white w-10 text-center rounded-2xl align-center ${
                    target === 'player' ? 'mb-4' : 'mt-4'
                }`}
            >
                {length}
            </div>
        </div>
    );
}
