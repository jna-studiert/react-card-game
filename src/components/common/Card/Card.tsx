import './styles.css';

interface CardProps {
    value: number | null;
    isFrontUp?: boolean;
}

const cardDetails: { [key: number]: { suit: string; colorClass: string } } = {
    1: { suit: '♠', colorClass: 'text-purple-500' },
    2: { suit: '♥', colorClass: 'text-pink-500' },
    3: { suit: '♣', colorClass: 'text-orange-500' },
    4: { suit: '♦', colorClass: 'text-fuchsia-500' },
    5: { suit: '✦', colorClass: 'text-violet-500' },
};

export default function Card({ value, isFrontUp = false }: CardProps) {
    const cardStyle = {
        '--basic-rotation': isFrontUp ? '180deg' : '0deg',
    } as React.CSSProperties;

    const suit = value ? cardDetails[value].suit : '';

    const colorClass = value ? cardDetails[value].colorClass : 'text-black';

    return (
        <div className="card" style={cardStyle}>
            <div className="card-back bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
            <div className={`card-front ${colorClass}`}>
                <div className="card-corner top-left">
                    <div className="card-value-small">{value}</div>
                    <div className="card-suit-small">{suit}</div>
                </div>

                <div className="card-suit-main">{suit}</div>

                <div className="card-corner bottom-right">
                    <div className="card-value-small">{value}</div>
                    <div className="card-suit-small">{suit}</div>
                </div>
            </div>
        </div>
    );
}
