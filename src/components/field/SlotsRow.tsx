import Card from '../common/Card/Card';
import type { SlotType } from '@/types';

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
                const attackingCardValue = attackingCards.find(
                    (card) => card.id === defenseSlot.id
                );
                return (
                    <div
                        key={defenseSlot.id}
                        className={`slot w-full max-w-40 aspect-[5/7] relative ${
                            target === 'computer' && attackingCard !== null
                                ? slotsCanBeAttacked
                                      ?.map((slot) => slot.id)
                                      .includes(defenseSlot.id) &&
                                  !attackingCardValue
                                    ? 'for-attack'
                                    : 'not-attack'
                                : ''
                        } ${!!attackingCardValue ? 'defeated' : ''}`}
                        ref={(el) => {
                            if (el) slotRefs.current[defenseSlot.id] = el;
                        }}
                        onClick={() => {
                            if (
                                target === 'computer' &&
                                slotsCanBeAttacked
                                    ?.map((slot) => slot.id)
                                    .includes(defenseSlot.id) &&
                                defenseSlot.cardValue !== null &&
                                onAttack
                            )
                                onAttack(defenseSlot.id);
                        }}
                    >
                        {defenseSlot.cardValue !== null && (
                            <Card
                                key={defenseSlot.id}
                                value={defenseSlot.cardValue}
                                isFrontUp={true}
                            />
                        )}

                        <div className="attack-slot absolute left-0 top-0 w-full h-full z-1">
                            {!!attackingCardValue && (
                                <Card
                                    key={defenseSlot.id}
                                    value={attackingCardValue.cardValue}
                                    isFrontUp={true}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
