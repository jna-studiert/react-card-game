import './styles.css';

interface CardProps {
    value: number | null;
    isFrontUp?: boolean;
}

export default function Card({ value, isFrontUp = false }: CardProps) {
    const cardStyle = {
        '--basic-rotation': isFrontUp ? '180deg' : '0deg',
    } as React.CSSProperties;

    return (
        <div className="card" style={cardStyle}>
            <div className="card-back bg-amber-700" />
            <div className="card-front">
                <div className="card-value">{value}</div>
                <div className="card-suit">♥</div>
            </div>
        </div>
    );
}
