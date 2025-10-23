import React from 'react';
import Card from '../common/Card/Card';

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
    target: 'player' | 'computer';
    length: number;
}) {
    return (
        <div className="slot relative w-full max-w-40 aspect-[5/7]">
            <div className="absolute inset-0" ref={deckRef}>
                {!!length && <div className="card card-back bg-amber-700" />}
            </div>

            <div
                ref={drawnCardRef}
                className={`absolute inset-0 ${
                    target === 'player' ? '-translate-y-1/2' : 'translate-y-1/2'
                }`}
            >
                {!!drawnCard && <Card value={drawnCard} isFrontUp={true} />}
            </div>
        </div>
    );
}
