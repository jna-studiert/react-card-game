import './styles.css';
import StartModal from '../modal/StartModal';
import SlotsRow from './SlotsRow';
import Deck from './Deck';
import AnimationLayer from './AnimationLayer';
import { useGameLogic } from '@/hooks/useGameLogic';
import type { SlotType } from '@/types';
import DiscardDeck from './DiscardDeck';

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
                <Deck
                    deckRef={deckRef}
                    drawnCardRef={drawnCardRef}
                    drawnCard={drawnCard}
                    target={target}
                    length={length}
                />
                <DiscardDeck
                    discardDeckRef={discardDeckRef}
                    discardDeck={discardDeck}
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
        slotsPlayerCanAttack,
        slotsComputerCanAttack,
        handleStart,
        handlePlayerAttack,
        attackingCardsInSlots,
        computerDiscardDeck,
        playerDiscardDeck,
        playerDeckLength,
        computerDeckLength,
        gamePhase,
        handleDrawCard,
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
                slotsCanBeAttacked={slotsPlayerCanAttack}
                onAttack={handlePlayerAttack}
                attackingCards={attackingCardsInSlots}
                discardDeck={computerDiscardDeck}
                length={computerDeckLength}
            />
            {gamePhase === 'playerTurn_draw' && !playerDrawnCard && (
                <button
                    onClick={handleDrawCard}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 
                   bg-amber-500 hover:bg-amber-600 text-black font-bold 
                   py-2 px-6 rounded-2xl shadow-lg transition active:scale-95"
                >
                    Вытянуть карту
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
                slotsCanBeAttacked={slotsComputerCanAttack}
                attackingCards={attackingCardsInSlots}
                discardDeck={playerDiscardDeck}
                length={playerDeckLength}
            />
        </div>
    );
}
