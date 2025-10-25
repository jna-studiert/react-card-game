export default function DiscardDeck({
    discardDeckRef,
    discardDeck,
    target,
}: {
    discardDeckRef: React.RefObject<HTMLDivElement | null>;
    discardDeck: number[];
    target: 'player' | 'computer';
}) {
    return (
        <div
            ref={discardDeckRef}
            className="slot relative w-full max-w-40 aspect-[5/7]"
        >
            {!!discardDeck.length && (
                <div className="card card-back bg-amber-700" />
                // <Card
                //     value={discardDeck[discardDeck.length - 1]}
                //     isFrontUp={true}
                // />
            )}
            {/* <CardFan cards={discardDeck} /> */}
        </div>
    );
}
