import { useState } from 'react';
import './styles.css';
import GameRulesModal from './game-rules-modal/GameRulesModal';

export default function StartModal({
    onFinish,
}: {
    onFinish: (first: 'player' | 'computer') => void;
}) {
    const [stage, setStage] = useState<'start' | 'arrow' | 'rules'>('start');
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
        setTimeout(() => spinArrow(), 10);
    };

    const handleShowRules = () => {
        setStage('rules');
    };

    const handleBackFromRules = () => {
        setStage('start');
    };

    return (
        <div className="absolute inset-0 bg-black/70 flex justify-center items-center z-[1000]">
            {stage === 'start' && (
                <div className="modal">
                    <h2 className="text-3xl font-bold leading-tight">
                        Добро пожаловать в игру
                        <br />
                        <span className="highlight animate-gradient">
                            Стенка на стенку
                        </span>
                    </h2>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={handlePlayClick}
                            className="button-primary"
                        >
                            Играть
                        </button>

                        <button
                            onClick={handleShowRules}
                            className="button-primary"
                        >
                            Правила
                        </button>
                    </div>
                </div>
            )}

            {stage === 'arrow' && (
                <div className="bg-white relative flex justify-center aspect-square rounded-full w-60 p-6">
                    <div
                        className={`arrow ${spinning ? 'spinning' : ''}`}
                        style={{
                            transform: `rotate(${rotation}deg)`,
                        }}
                    >
                        <div className="arrow-gradient" />
                        <div className="arrow-bottom" />
                    </div>
                    <div className="arrow-pin" />
                </div>
            )}

            {stage === 'rules' && (
                <GameRulesModal onBack={handleBackFromRules} />
            )}
        </div>
    );
}
