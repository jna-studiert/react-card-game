import React from 'react';
import Card from '../common/Card/Card';
import type { SlotType } from '@/types';

export default function SlotsRow({
    slots,
    slotRefs,
}: {
    slots: SlotType[];
    slotRefs: React.RefObject<Record<number, HTMLDivElement>>;
}) {
    return (
        <div className="w-full flex flex-1 justify-center items-center gap-6">
            {slots.map((slot) => (
                <div
                    key={slot.id}
                    className="slot w-full max-w-52 aspect-[5/7] relative"
                    ref={(el) => {
                        if (el) slotRefs.current[slot.id] = el;
                    }}
                >
                    {!slot.isEmpty && (
                        <Card
                            key={slot.id}
                            value={slot.cardValue}
                            isFrontUp={true}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
