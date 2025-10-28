import './styles.css';
import StartModal from '../modal/StartModal';
import SlotsRow from './SlotsRow';
import Deck from './decks/Deck';
import AnimationLayer from '../common/animations/AnimationLayer';
import { useGameLogic } from '@/hooks/useGameLogic';
import type { SlotType } from '@/utils/types';
import DiscardDeck from './decks/DiscardDeck';
import LivePoints from './live-points/LivePoints';

interface FieldSectionProps {
    target: 'player' | 'computer';
    deckRef: React.RefObject<HTMLDivElement | null>;
    drawnCardRef: React.RefObject<HTMLDivElement | null>;
    discardDeckRef: React.RefObject<HTMLDivElement | null>;
    slotRefs: React.RefObject<Record<number, HTMLDivElement>>;
    slotsCanBeAttacked: SlotType[];
    defenseSlots: SlotType[];
    drawnCard: number | null;
    opponentDrawnCard: number | null;
    onAttack?: (slotId: number) => void;
    attackingCards: SlotType[];
    discardDeck: number[];
    length: number;
    livePoints: number;
}

function FieldSection({
    deckRef,
    drawnCardRef,
    discardDeckRef,
    slotRefs,
    defenseSlots,
    drawnCard,
    slotsCanBeAttacked,
    opponentDrawnCard,
    target,
    onAttack,
    attackingCards,
    discardDeck,
    length,
    livePoints,
}: FieldSectionProps) {
    return (
        <div
            className={`flex flex-1 justify-start items-center ${
                target === 'computer' ? 'flex-col' : 'flex-col-reverse'
            }`}
        >
            <div
                className={`w-full flex flex-1 justify-between items-center ${
                    target === 'computer' ? 'flex-row' : 'flex-row-reverse'
                }`}
            >
                <div
                    className={`flex gap-6 w-full h-full items-end ${
                        target === 'computer' ? 'flex-row' : 'flex-row-reverse'
                    }`}
                >
                    <Deck
                        deckRef={deckRef}
                        drawnCardRef={drawnCardRef}
                        drawnCard={drawnCard}
                        target={target}
                        length={length}
                    />
                    <LivePoints
                        maxLives={5}
                        lives={livePoints}
                        target={target}
                    />
                </div>
                <DiscardDeck
                    discardDeckRef={discardDeckRef}
                    discardDeck={discardDeck}
                    target={target}
                />
            </div>
            <SlotsRow
                defenseSlots={defenseSlots}
                slotRefs={slotRefs}
                slotsCanBeAttacked={slotsCanBeAttacked}
                attackingCard={opponentDrawnCard}
                target={target}
                onAttack={onAttack}
                attackingCards={attackingCards}
            />
        </div>
    );
}

export default function Field() {
    const {
        computerSlotRefs,
        computerDeckRef,
        computerDrawnCardRef,
        computerDiscardDeckRef,
        playerSlotRefs,
        playerDeckRef,
        playerDrawnCardRef,
        playerDiscardDeckRef,
        showModal,
        playerAnimatedCards,
        computerAnimatedCards,
        computerDrawnCard,
        playerDrawnCard,
        computerDefenseSlots,
        playerDefenseSlots,
        slotsCanBeAttacked,
        handleStart,
        handleAttack,
        attackingCardsInSlots,
        computerDiscardDeck,
        playerDiscardDeck,
        playerDeckLength,
        computerDeckLength,
        handleDrawPlayerCard,
        handlePlayerEndTurn,
        showEndTurnButton,
        showDrawCardButton,
        playerPoints,
        computerPoints,
    } = useGameLogic();

    return (
        <div className="field flex flex-col min-h-screen p-8 gap-10 relative">
            {showModal && <StartModal onFinish={handleStart} />}
            <AnimationLayer
                computerAnimatedCards={computerAnimatedCards}
                playerAnimatedCards={playerAnimatedCards}
            />
            <FieldSection
                target={'computer'}
                deckRef={computerDeckRef}
                drawnCardRef={computerDrawnCardRef}
                discardDeckRef={computerDiscardDeckRef}
                slotRefs={computerSlotRefs}
                defenseSlots={computerDefenseSlots}
                drawnCard={computerDrawnCard}
                opponentDrawnCard={playerDrawnCard}
                slotsCanBeAttacked={slotsCanBeAttacked}
                onAttack={(slotId) => handleAttack('player', slotId)}
                attackingCards={attackingCardsInSlots}
                discardDeck={computerDiscardDeck}
                length={computerDeckLength}
                livePoints={computerPoints}
            />
            {showDrawCardButton && (
                <button
                    onClick={handleDrawPlayerCard}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 button-primary w-48"
                >
                    Вытянуть карту
                </button>
            )}
            {showEndTurnButton && (
                <button
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 button-primary w-48"
                    onClick={handlePlayerEndTurn}
                >
                    Завершить ход
                </button>
            )}
            <FieldSection
                target={'player'}
                deckRef={playerDeckRef}
                drawnCardRef={playerDrawnCardRef}
                discardDeckRef={playerDiscardDeckRef}
                slotRefs={playerSlotRefs}
                defenseSlots={playerDefenseSlots}
                drawnCard={playerDrawnCard}
                opponentDrawnCard={computerDrawnCard}
                slotsCanBeAttacked={slotsCanBeAttacked}
                attackingCards={attackingCardsInSlots}
                discardDeck={playerDiscardDeck}
                length={playerDeckLength}
                livePoints={playerPoints}
            />
        </div>
    );
}
