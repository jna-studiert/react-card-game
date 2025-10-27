import Card from '../../card/Card';
import './styles.css';

export default function CardFan({
    cards,
    isVisible,
    fanOrigin = 'middle',
    target,
}: {
    cards: number[];
    isVisible: boolean;
    fanOrigin?: 'middle' | 'side';
    target: 'player' | 'computer';
}) {
    const MAX_SPREAD = fanOrigin === 'middle' ? 180 : 120;

    const count = cards.length;
    let origin: number = 0;
    let step: number = 0;

    switch (fanOrigin) {
        case 'side':
            origin = count;
            step = Math.min(MAX_SPREAD / (count - 1), 12);
            break;
        case 'middle':
            origin = (count - 1) / 2;
            step = count > 1 ? Math.min(MAX_SPREAD / (count - 1), 12) : 0;

            break;
    }

    return (
        <div className={`fan ${isVisible ? 'visible-fan' : 'hidden-fan'}`}>
            {cards.map((card, index) => {
                const offset = index - origin;
                const angle = offset * step;

                return (
                    <div
                        className={`fan-card-wrapper w-full max-w-40 aspect-[5/7] ${
                            target === 'player' ? 'origin-top' : 'origin-bottom'
                        }`}
                        style={
                            {
                                '--angle': `${angle}deg`,
                            } as React.CSSProperties
                        }
                        key={index}
                    >
                        <Card value={card} isFrontUp={true} />
                    </div>
                );
            })}
        </div>
    );
}
