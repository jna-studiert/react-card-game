import { useState } from 'react';
import './styles.css';

export default function StartModal({
    onFinish,
}: {
    onFinish: (first: 'player' | 'computer') => void;
}) {
    const [stage, setStage] = useState<'start' | 'arrow'>('start');
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);

    const spinArrow = () => {
        if (spinning) return;
        setSpinning(true);

        const res = Math.random() < 0.5 ? 'player' : 'computer';
        const targetAngle = res === 'player' ? 180 : 0;

        const extraSpins = 3 * 360;
        const finalAngle = extraSpins + targetAngle;

        setRotation(finalAngle);

        setTimeout(() => {
            setSpinning(false);
            onFinish(res);
        }, 4000);
    };

    const handlePlayClick = () => {
        setStage('arrow');

        setTimeout(() => {
            spinArrow();
        }, 10);
    };

    return (
        <div className="absolute inset-0 bg-black/70 flex justify-center items-center z-[1000]">
            {stage === 'start' && (
                <div className="bg-white rounded-2xl p-8 flex flex-col gap-6 items-center">
                    <h2 className="text-3xl font-bold text-center leading-tight">
                        Добро пожаловать в игру
                        <br />
                        <span
                            className="
                                animate-gradient 
                                bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 
                                bg-clip-text text-transparent
                            "
                        >
                            Стенка на стенку
                        </span>
                    </h2>
                    <button
                        onClick={handlePlayClick}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                    >
                        Играть
                    </button>
                </div>
            )}

            {stage === 'arrow' && (
                <div className="bg-white relative flex justify-center aspect-square rounded-full w-87 p-6">
                    <div
                        className={`arrow ${spinning ? 'spinning' : ''}`}
                        style={{
                            transform: `rotate(${rotation}deg)`,
                        }}
                    >
                        <div className="arrow-top" />
                        <div className="arrow-bottom" />
                    </div>
                    <div className="arrow-pin" />
                </div>
            )}
        </div>
    );
}
