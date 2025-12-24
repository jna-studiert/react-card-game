import CardFan from '@/components/common/animations/card-fan/CardFan';
import Card from '@/components/common/card/Card';
import type { PlayerType } from '@/utils/types';
import { useEffect, useState } from 'react';

export default function DiscardDeck({
    discardDeckRef,
    discardDeck,
    target,
}: {
    discardDeckRef: React.RefObject<HTMLDivElement | null>;
    discardDeck: number[];
    target: PlayerType;
}) {
    const [isVisible, setVisible] = useState(false);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!isVisible) return;

            if (
                discardDeckRef.current &&
                !discardDeckRef.current.contains(event.target as Node)
            ) {
                setVisible(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isVisible, discardDeckRef]);

    return (
        <div
            ref={discardDeckRef}
            className="slot relative w-full max-w-40 aspect-[5/7]"
            onClick={() => setVisible((v) => !v)}
        >
            {!!discardDeck.length && (
                <>
                    <CardFan
                        cards={discardDeck.slice(0, -1)}
                        isVisible={isVisible}
                        target={target}
                        fanOrigin={'side'}
                    />
                    <div
                        className={`discard-card-wrapper cursor-pointer ${
                            isVisible ? 'discard-flip' : ''
                        }`}
                    >
                        <Card value={discardDeck[discardDeck.length - 1]} />
                    </div>
                </>
            )}
        </div>
    );
}
