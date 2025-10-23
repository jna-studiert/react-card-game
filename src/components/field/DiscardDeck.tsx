export default function DiscardDeck({
    discardDeckRef,
    discardDeck,
}: {
    discardDeckRef: React.RefObject<HTMLDivElement | null>;
    discardDeck: number[];
}) {
    return (
        <div
            ref={discardDeckRef}
            className="slot relative w-full max-w-40 aspect-[5/7]"
        >
            {!!discardDeck.length && (
                <div className="card card-back bg-amber-700" />
            )}
        </div>
    );
}
