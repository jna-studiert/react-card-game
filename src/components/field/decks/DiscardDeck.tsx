import CardFan from '@/components/common/animations/card-fan/CardFan';
import Card from '@/components/common/card/Card';
import { useState } from 'react';

export default function DiscardDeck({
    discardDeckRef,
    discardDeck,
    target,
}: {
    discardDeckRef: React.RefObject<HTMLDivElement | null>;
    discardDeck: number[];
    target: 'player' | 'computer';
}) {
    const [visible, setVisible] = useState(false);

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
                        isVisible={visible}
                        fanOrigin={target === 'computer' ? 'right' : 'left'}
                    />
                    <div
                        className={`discard-card-wrapper ${
                            visible ? 'discard-flip' : ''
                        }`}
                    >
                        <Card value={discardDeck[discardDeck.length - 1]} />
                    </div>
                </>
            )}
        </div>
    );
}
