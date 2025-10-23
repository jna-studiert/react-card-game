import './styles.css';

interface CardProps {
    value: number | null;
    isFrontUp?: boolean;
}

const cardDetails: { [key: number]: { suit: string; color: string } } = {
    1: { suit: '♠', color: '#8B5CF6' },
    2: { suit: '♥', color: '#EC4899' },
    3: { suit: '♣', color: '#F97316' },
    4: { suit: '♦', color: '#C026D3' },
    5: { suit: '✦', color: '#A855F7' },
};

export default function Card({ value, isFrontUp = false }: CardProps) {
    const cardStyle = {
        '--basic-rotation': isFrontUp ? '180deg' : '0deg',
        color: value ? cardDetails[value].color : 'black',
    } as React.CSSProperties;

    const suit = value ? cardDetails[value].suit : '';

    return (
        <div className="card" style={cardStyle}>
            <div className="card-back bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
            <div className="card-front">
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
