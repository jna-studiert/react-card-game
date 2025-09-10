import React from 'react';
import Card from '../common/Card/Card';

export default function Deck({
    deckRef,
    activeCard,
    isPlayer,
    isActive,
}: {
    deckRef: React.RefObject<HTMLDivElement | null>;
    activeCard: number | null;
    isPlayer: boolean;
    isActive: boolean;
}) {
    return (
        <div className="slot relative w-full max-w-52 aspect-[5/7]">
            <div
                className={`absolute inset-0 ${isActive ? 'deck-active' : ''}`}
                ref={deckRef}
            >
                <div className="card card-back bg-amber-700" />
            </div>

            {!!activeCard && (
                <div
                    className={`absolute inset-0 ${
                        isPlayer ? '-translate-y-1/2' : 'translate-y-1/2'
                    }`}
                >
                    <Card value={activeCard} isFrontUp={isPlayer} />
                </div>
            )}
        </div>
    );
}
