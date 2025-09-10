import { useCallback, useEffect, useRef, useState } from 'react';
import './styles.css';
import AnimatedCard from '../common/AnimatedCard/AnimatedCard';
import StartModal from '../modal/StartModal';
import type { SlotType, AnimatedCardType } from '@/types';
import SlotsRow from './SlotsRow';
import Deck from './Deck';

const ANIMATION_SPEED = 500;

const createDeck = () => {
    const cards = [1, 2, 3, 4];
    const deck = cards.flatMap((card) => Array(4).fill(card));
    return shuffle(deck);
};

const shuffle = (array: number[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

type GamePhase =
    | 'initial'
    | 'dealing'
    | 'playerTurn'
    | 'playerAttacking'
    | 'computerTurn'
    | 'computerAttacking';

export default function Field() {
    const computerSlotRefs = useRef<Record<number, HTMLDivElement>>({});
    const computerDeckRef = useRef<HTMLDivElement>(null);
    const [computerDeck, setComputerDeck] = useState<number[]>(() =>
        createDeck()
    );
    const playerSlotRefs = useRef<Record<number, HTMLDivElement>>({});
    const playerDeckRef = useRef<HTMLDivElement>(null);
    const [playerDeck, setPlayerDeck] = useState<number[]>(() => createDeck());

    const [playerAnimatedCards, setPlayerAnimatedCards] = useState<
        AnimatedCardType[]
    >([]);
    const [computerAnimatedCards, setComputerAnimatedCards] = useState<
        AnimatedCardType[]
    >([]);

    const [playerActiveCard, setPlayerActiveCard] = useState<number | null>(
        null
    );
    const [computerActiveCard, setComputerActiveCard] = useState<number | null>(
        null
    );

    const [computerSlots, setComputerSlots] = useState<SlotType[]>(
        Array(4)
            .fill(0)
            .map((_, i) => ({
                id: i,
                isEmpty: true,
                cardValue: null,
            }))
    );

    const [playerSlots, setPlayerSlots] = useState<SlotType[]>(
        Array(4)
            .fill(0)
            .map((_, i) => ({
                id: i + 100,
                isEmpty: true,
                cardValue: null,
            }))
    );

    const [showModal, setShowModal] = useState<boolean>(true);
    const [currentTurn, setCurrentTurn] = useState<
        'player' | 'computer' | null
    >(null);

    const dealCards = useCallback(
        ({
            deck,
            setDeck,
            slots,
            setSlots,
            slotRefs,
            deckRef,
            setAnimatedCards,
            onComplete,
        }: {
            deck: number[];
            setDeck: React.Dispatch<React.SetStateAction<number[]>>;
            slots: SlotType[];
            setSlots: React.Dispatch<React.SetStateAction<SlotType[]>>;
            slotRefs: Record<number, HTMLDivElement>;
            deckRef: HTMLDivElement;
            setAnimatedCards: React.Dispatch<
                React.SetStateAction<AnimatedCardType[]>
            >;
            onComplete: () => void;
        }) => {
            if (!deckRef || Object.keys(slotRefs).length === 0) return;

            const deckRect = deckRef.getBoundingClientRect();
            const fieldRect = deckRef
                .closest('.field')
                ?.getBoundingClientRect();
            if (!fieldRect) return;

            const cardSize = {
                width: deckRef.offsetWidth,
                height: deckRef.offsetHeight,
            };

            const emptySlots = slots.filter((slot) => slot.isEmpty);
            if (!emptySlots.length) return;

            const drawnCards = deck.slice(0, emptySlots.length);
            setDeck(deck.slice(emptySlots.length));

            const newAnimatedCards = emptySlots
                .map((slot, i) => {
                    const slotRef = slotRefs[slot.id];
                    if (!slotRef) return null;
                    const slotRect = slotRef.getBoundingClientRect();

                    const startX = deckRect.left - fieldRect.left;
                    const startY = deckRect.top - fieldRect.top;

                    const endX = slotRect.left - fieldRect.left;
                    const endY = slotRect.top - fieldRect.top;

                    const translateX = endX - startX;
                    const translateY = endY - startY;

                    const distance = Math.hypot(translateX, translateY);
                    const duration = distance / ANIMATION_SPEED;

                    return {
                        ...slot,
                        cardValue: drawnCards[i],
                        startPosition: { x: startX, y: startY },
                        targetPosition: { x: translateX, y: translateY },
                        size: cardSize,
                        duration,
                        animationType: 'deal',
                    } as AnimatedCardType;
                })
                .filter(Boolean) as AnimatedCardType[];

            const maxAnimationTime = newAnimatedCards.reduce(
                (max, card, index) => {
                    const delay = (newAnimatedCards.length - index) * 0.5;
                    return Math.max(max, delay + card.duration);
                },
                0
            );

            setAnimatedCards(newAnimatedCards);

            setTimeout(() => {
                setSlots((currentSlots) =>
                    currentSlots.map((slot) => {
                        const animatedCard = newAnimatedCards.find(
                            (c) => c.id === slot.id
                        );
                        return animatedCard
                            ? {
                                  ...slot,
                                  isEmpty: false,
                                  cardValue: animatedCard.cardValue,
                              }
                            : slot;
                    })
                );
                setAnimatedCards([]);
                onComplete();
            }, maxAnimationTime * 1000 + 50);
        },
        []
    );

    const dealTopCard = useCallback(
        ({
            deck,
            setDeck,
            deckRef,
            setActiveCard,
            setAnimatedCards,
            isComputer,
            onComplete,
        }: {
            deck: number[];
            setDeck: React.Dispatch<React.SetStateAction<number[]>>;
            deckRef: HTMLDivElement;
            setActiveCard: React.Dispatch<React.SetStateAction<number | null>>;
            setAnimatedCards: React.Dispatch<
                React.SetStateAction<AnimatedCardType[]>
            >;
            isComputer: boolean;
            onComplete: () => void;
        }) => {
            if (!deckRef || deck.length === 0) return;

            const fieldRect = deckRef
                .closest('.field')
                ?.getBoundingClientRect();
            if (!fieldRect) return;

            const deckRect = deckRef.getBoundingClientRect();

            const cardSize = {
                width: deckRef.offsetWidth,
                height: deckRef.offsetHeight,
            };

            const startX = deckRect.left - fieldRect.left;
            const startY = deckRect.top - fieldRect.top;

            const translateX = 0;
            const translateY = isComputer
                ? deckRef.offsetHeight / 2
                : -deckRef.offsetHeight / 2;

            const [topCard, ...rest] = deck;
            setDeck(rest);

            const newAnimatedCard: AnimatedCardType = {
                id: Date.now(),
                isEmpty: false,
                cardValue: topCard,
                startPosition: { x: startX, y: startY },
                targetPosition: { x: translateX, y: translateY },
                size: cardSize,
                duration: 2,
                animationType: 'draw',
            };

            setAnimatedCards([newAnimatedCard]);

            setTimeout(() => {
                setActiveCard(topCard);
                setAnimatedCards([]);
                onComplete();
            }, 2000 + 50);
        },
        []
    );

    const [gamePhase, setGamePhase] = useState<GamePhase>('initial');

    useEffect(() => {
        switch (gamePhase) {
            case 'initial':
                break;
            case 'dealing':
                if (
                    !playerDeckRef.current ||
                    Object.keys(playerSlotRefs.current).length === 0
                )
                    break;
                if (
                    !computerDeckRef.current ||
                    Object.keys(computerSlotRefs.current).length === 0
                )
                    break;

                let animationsDone = 0;
                const onDealFinish = () => {
                    animationsDone++;
                    if (animationsDone === 2) {
                        setGamePhase(
                            currentTurn === 'player'
                                ? 'playerTurn'
                                : 'computerTurn'
                        );
                    }
                };

                dealCards({
                    deck: playerDeck,
                    setDeck: setPlayerDeck,
                    slots: playerSlots,
                    setSlots: setPlayerSlots,
                    slotRefs: playerSlotRefs.current,
                    deckRef: playerDeckRef.current,
                    setAnimatedCards: setPlayerAnimatedCards,
                    onComplete: onDealFinish,
                });

                dealCards({
                    deck: computerDeck,
                    setDeck: setComputerDeck,
                    slots: computerSlots,
                    setSlots: setComputerSlots,
                    slotRefs: computerSlotRefs.current,
                    deckRef: computerDeckRef.current,
                    setAnimatedCards: setComputerAnimatedCards,
                    onComplete: onDealFinish,
                });

                break;
            case 'computerTurn':
                if (
                    !computerDeckRef.current ||
                    Object.keys(computerSlotRefs.current).length === 0
                )
                    break;
                if (computerDeck.length === 0) break;

                dealTopCard({
                    deck: computerDeck,
                    setDeck: setComputerDeck,
                    deckRef: computerDeckRef.current,
                    setActiveCard: setComputerActiveCard,
                    setAnimatedCards: setComputerAnimatedCards,
                    isComputer: true,
                    onComplete: () => {
                        setCurrentTurn('player');
                        // setGamePhase('resolving');
                    },
                });
                break;
            case 'playerTurn':
                if (
                    !playerDeckRef.current ||
                    Object.keys(playerSlotRefs.current).length === 0
                )
                    break;

                if (playerDeck.length === 0) break;
                dealTopCard({
                    deck: playerDeck,
                    setDeck: setPlayerDeck,
                    deckRef: playerDeckRef.current,
                    setActiveCard: setPlayerActiveCard,
                    setAnimatedCards: setPlayerAnimatedCards,
                    isComputer: false,
                    onComplete: () => {
                        setCurrentTurn('computer');
                    },
                });

                break;
        }
    }, [gamePhase]);

    const handleStart = (first: 'player' | 'computer') => {
        setShowModal(false);
        setCurrentTurn(first);
        setGamePhase('dealing');
    };

    return (
        <div className="field flex flex-col min-h-screen p-8 gap-6 relative">
            {showModal && <StartModal onFinish={handleStart} />}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-999">
                {playerAnimatedCards.map((card, index) => (
                    <AnimatedCard
                        key={card.id}
                        value={card.cardValue}
                        startPosition={card.startPosition}
                        positionToMove={card.targetPosition}
                        isMoving={true}
                        isFlipping={true}
                        delay={
                            card.animationType === 'deal'
                                ? (playerAnimatedCards.length - index) * 0.5
                                : 0
                        }
                        duration={card.duration}
                        size={card.size}
                    />
                ))}
                {computerAnimatedCards.map((card, index) => (
                    <AnimatedCard
                        key={card.id}
                        value={card.cardValue}
                        startPosition={card.startPosition}
                        positionToMove={card.targetPosition}
                        isMoving={true}
                        isFlipping={card.animationType === 'deal'}
                        delay={
                            card.animationType === 'deal'
                                ? (computerAnimatedCards.length - index) * 0.5
                                : 0
                        }
                        duration={card.duration}
                        size={card.size}
                    />
                ))}
            </div>
            <div className="flex flex-1 flex-col justify-start items-center">
                <div className="w-full flex flex-1 justify-start items-center">
                    <Deck
                        deckRef={computerDeckRef}
                        activeCard={computerActiveCard}
                        isPlayer={false}
                        isActive={gamePhase === 'computerTurn'}
                    />
                </div>
                <SlotsRow slots={computerSlots} slotRefs={computerSlotRefs} />
            </div>
            <div className="flex flex-1 flex-col justify-start items-center">
                <SlotsRow slots={playerSlots} slotRefs={playerSlotRefs} />
                <div className="w-full flex flex-1 justify-end items-center">
                    <Deck
                        deckRef={playerDeckRef}
                        activeCard={playerActiveCard}
                        isPlayer={true}
                        isActive={gamePhase === 'playerTurn'}
                    />
                </div>
            </div>
        </div>
    );
}
