import Card from '../common/card/Card';
import type { SlotType } from '@/utils/types';

export default function SlotsRow({
    defenseSlots,
    slotRefs,
    slotsCanBeAttacked,
    attackingCard,
    target,
    onAttack,
    attackingCards,
}: {
    defenseSlots: SlotType[];
    slotRefs: React.RefObject<Record<number, HTMLDivElement>>;
    slotsCanBeAttacked?: SlotType[];
    attackingCard?: number | null;
    target: 'player' | 'computer';
    onAttack?: (slotId: number) => void;
    attackingCards: SlotType[];
}) {
    return (
        <div className="w-full flex flex-1 justify-center items-center gap-10">
            {defenseSlots.map((defenseSlot) => {
                const attackingCardInSlot = attackingCards.find(
                    (card) => card.id === defenseSlot.id
                );
                return (
                    <div
                        key={defenseSlot.id}
                        className="slot w-full max-w-40 aspect-[5/7] relative"
                        ref={(el) => {
                            if (el) slotRefs.current[defenseSlot.id] = el;
                        }}
                        onClick={() => {
                            if (
                                target === 'computer' &&
                                slotsCanBeAttacked
                                    ?.map((slot) => slot.id)
                                    .includes(defenseSlot.id) &&
                                !!defenseSlot.cardValue &&
                                onAttack
                            )
                                onAttack(defenseSlot.id);
                        }}
                    >
                        <div
                            className={`slot-status  w-full h-full ${
                                target === 'computer' && !!attackingCard
                                    ? slotsCanBeAttacked
                                          ?.map((slot) => slot.id)
                                          .includes(defenseSlot.id) &&
                                      !attackingCardInSlot
                                        ? 'for-attack'
                                        : 'not-attack'
                                    : ''
                            } ${!!attackingCardInSlot ? 'defeated' : ''}`}
                        >
                            {!!defenseSlot.cardValue && (
                                <Card
                                    key={defenseSlot.id}
                                    value={defenseSlot.cardValue}
                                    isFrontUp={true}
                                />
                            )}

                            <div className="attack-slot absolute left-0 top-0 w-full h-full z-1">
                                {!!attackingCardInSlot && (
                                    <Card
                                        key={defenseSlot.id}
                                        value={attackingCardInSlot.cardValue}
                                        isFrontUp={true}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
