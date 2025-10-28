import { useState, useRef, useEffect } from 'react';
import type { SlotType, AnimatedCardType } from '@/utils/types';
import { checkCanAttack, createDeck } from '@/utils/functions';
import { calculateAnimationCoordinates } from '@/utils/animationCalculation';

type GamePhase =
    | 'dealing'
    | 'playerTurn_draw'
    | 'playerTurn_attack'
    | 'playerTurn_end'
    | 'computerTurn_draw'
    | 'computerTurn_attack'
    | 'computerTurn_end'
    | 'resolveTurn'
    | 'gameOver';

const MAX_POINTS = 5;

export const useGameLogic = () => {
    const computerSlotRefs = useRef<Record<number, HTMLDivElement>>({});
    const computerDeckRef = useRef<HTMLDivElement>(null);
    const computerDrawnCardRef = useRef<HTMLDivElement>(null);
    const computerDiscardDeckRef = useRef<HTMLDivElement>(null);

    const playerSlotRefs = useRef<Record<number, HTMLDivElement>>({});
    const playerDeckRef = useRef<HTMLDivElement>(null);
    const playerDrawnCardRef = useRef<HTMLDivElement>(null);
    const playerDiscardDeckRef = useRef<HTMLDivElement>(null);

    const [computerDeck, setComputerDeck] = useState<number[]>(() =>
        createDeck(5)
    );
    const [playerDeck, setPlayerDeck] = useState<number[]>(() => createDeck(5));

    const [playerAnimatedCards, setPlayerAnimatedCards] = useState<
        AnimatedCardType[]
    >([]);
    const [computerAnimatedCards, setComputerAnimatedCards] = useState<
        AnimatedCardType[]
    >([]);

    const [playerDrawnCard, setPlayerDrawnCard] = useState<number | null>(null);
    const [computerDrawnCard, setComputerDrawnCard] = useState<number | null>(
        null
    );

    const [computerDefenseSlots, setComputerSlots] = useState<SlotType[]>(
        Array(3)
            .fill(0)
            .map((_, i) => ({ id: i, cardValue: null }))
    );
    const [playerDefenseSlots, setPlayerSlots] = useState<SlotType[]>(
        Array(3)
            .fill(0)
            .map((_, i) => ({ id: i + 100, cardValue: null }))
    );

    const [slotsCanBeAttacked, setSlotsCanBeAttacked] = useState<SlotType[]>(
        []
    );

    const [playerDiscardDeck, setPlayerDiscardDeck] = useState<number[]>([]);
    const [computerDiscardDeck, setComputerDiscardDeck] = useState<number[]>(
        []
    );

    const [attackingCardsInSlots, setAttackingCardsInSlots] = useState<
        SlotType[]
    >([]);

    const [showModal, setShowModal] = useState<boolean>(true);
    const [showEndTurnButton, setShowEndTurnButton] = useState<boolean>(false);
    const [showDrawCardButton, setShowDrawCardButton] =
        useState<boolean>(false);

    const [playerPoints, setPlayerPoints] = useState<number>(MAX_POINTS);
    const [computerPoints, setComputerPoints] = useState<number>(MAX_POINTS);

    const [gamePhase, setGamePhase] = useState<GamePhase>('dealing');

    useEffect(() => {
        console.log('playerPoints ', playerPoints);
    }, [playerPoints]);
    useEffect(() => {
        console.log('computerPoints ', computerPoints);
    }, [computerPoints]);

    const handleStart = (first: 'player' | 'computer') => {
        setShowModal(false);
        setGamePhase(
            first === 'player' ? 'playerTurn_draw' : 'computerTurn_draw'
        );
        setShowDrawCardButton(first === 'player');
    };

    const dealCards = (target: 'player' | 'computer'): Promise<void> => {
        return new Promise((resolve) => {
            const {
                deck,
                setDeck,
                slots,
                setSlots,
                slotRefs,
                deckRef,
                setAnimatedCards,
            } =
                target === 'player'
                    ? {
                          deck: playerDeck,
                          setDeck: setPlayerDeck,
                          slots: playerDefenseSlots,
                          setSlots: setPlayerSlots,
                          slotRefs: playerSlotRefs.current,
                          deckRef: playerDeckRef.current,
                          setAnimatedCards: setPlayerAnimatedCards,
                      }
                    : {
                          deck: computerDeck,
                          setDeck: setComputerDeck,
                          slots: computerDefenseSlots,
                          setSlots: setComputerSlots,
                          slotRefs: computerSlotRefs.current,
                          deckRef: computerDeckRef.current,
                          setAnimatedCards: setComputerAnimatedCards,
                      };

            if (!deckRef || Object.keys(slotRefs).length === 0) {
                resolve();
                return;
            }

            const emptySlots = slots.filter((slot) => !slot.cardValue);
            if (!emptySlots.length) {
                resolve();
                return;
            }

            const drawnCards = deck.slice(0, emptySlots.length);
            setDeck(deck.slice(emptySlots.length));

            const newAnimatedCards = emptySlots
                .map((slot, i) => {
                    const slotRef = slotRefs[slot.id];
                    if (!slotRef) return null;

                    try {
                        const coordinates = calculateAnimationCoordinates({
                            startRef: deckRef,
                            endRef: slotRef,
                            animationType: 'deal',
                        });

                        return {
                            ...slot,
                            cardValue: drawnCards[i],
                            startPosition: coordinates.startPosition,
                            targetPosition: coordinates.targetPosition,
                            size: coordinates.size,
                            duration: coordinates.duration,
                            animationType: 'deal',
                        } as AnimatedCardType;
                    } catch (error) {
                        console.error(
                            'Error calculating animation coordinates:',
                            error
                        );
                        return null;
                    }
                })
                .filter(Boolean) as AnimatedCardType[];

            if (newAnimatedCards.length === 0) {
                resolve();
                return;
            }

            let completedCount = 0;

            setAnimatedCards(
                newAnimatedCards.map((card) => ({
                    ...card,
                    onAnimationEnd: () => {
                        completedCount++;
                        if (completedCount === newAnimatedCards.length) {
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
                            resolve();
                        }
                    },
                }))
            );
        });
    };

    const drawCard = (target: 'player' | 'computer'): Promise<number> => {
        return new Promise((resolve) => {
            const { deck, setDeck, deckRef, setDrawnCard, setAnimatedCards } =
                target === 'player'
                    ? {
                          deck: playerDeck,
                          setDeck: setPlayerDeck,
                          deckRef: playerDeckRef.current,
                          setDrawnCard: setPlayerDrawnCard,
                          setAnimatedCards: setPlayerAnimatedCards,
                      }
                    : {
                          deck: computerDeck,
                          setDeck: setComputerDeck,
                          deckRef: computerDeckRef.current,
                          setDrawnCard: setComputerDrawnCard,
                          setAnimatedCards: setComputerAnimatedCards,
                      };

            if (!deckRef || deck.length === 0) {
                resolve(-1);
                return;
            }

            const [topCard, ...rest] = deck;
            setDeck(rest);

            try {
                const coordinates = calculateAnimationCoordinates({
                    startRef: deckRef,
                    target: target,
                    animationType: 'draw',
                });

                const newAnimatedCard: AnimatedCardType = {
                    id: Date.now(),
                    cardValue: topCard,
                    startPosition: coordinates.startPosition,
                    targetPosition: coordinates.targetPosition,
                    size: coordinates.size,
                    duration: coordinates.duration,
                    animationType: 'draw',
                    onAnimationEnd: () => {
                        setDrawnCard(topCard);
                        setAnimatedCards([]);
                        resolve(topCard);
                    },
                };

                setAnimatedCards([newAnimatedCard]);
            } catch (error) {
                console.error(
                    'Error calculating animation coordinates:',
                    error
                );
                resolve(-1);
            }
        });
    };

    const handleDrawCard = async (target: 'player' | 'computer') => {
        setShowDrawCardButton(false);

        const { drawnCard, defenseSlots, attackGamePhase } =
            target === 'player'
                ? {
                      drawnCard: await drawCard('player'),
                      defenseSlots: computerDefenseSlots,
                      attackGamePhase: 'playerTurn_attack' as GamePhase,
                  }
                : {
                      drawnCard: await drawCard('computer'),
                      defenseSlots: playerDefenseSlots,
                      attackGamePhase: 'computerTurn_attack' as GamePhase,
                  };

        const availableDefenseSlots = defenseSlots.filter(
            ({ id: defenseCardId }) =>
                !attackingCardsInSlots.some(
                    ({ id: attackingCardId }) =>
                        attackingCardId === defenseCardId
                )
        );

        if (drawnCard === -1) {
            target === 'player'
                ? setShowEndTurnButton(true)
                : setGamePhase('computerTurn_end');
            return;
        }

        const canAttackArray = checkCanAttack(availableDefenseSlots, drawnCard);

        if (!!canAttackArray.length) {
            setSlotsCanBeAttacked(canAttackArray);
            setGamePhase(attackGamePhase);
        } else {
            target === 'player'
                ? setShowEndTurnButton(true)
                : setGamePhase('computerTurn_end');
        }
    };

    const handleAttack = (
        target: 'player' | 'computer',
        targetSlotId?: number
    ) => {
        const {
            drawnCard,
            drawnCardRef,
            defenseSlots,
            slotRefs,
            setAnimatedCards,
            setDrawnCard,
            nextDrawPhase,
        } =
            target === 'player'
                ? {
                      drawnCard: playerDrawnCard,
                      drawnCardRef: playerDrawnCardRef,
                      defenseSlots: computerDefenseSlots,
                      slotRefs: computerSlotRefs,
                      setAnimatedCards: setPlayerAnimatedCards,
                      setDrawnCard: setPlayerDrawnCard,
                      nextDrawPhase: 'playerTurn_draw' as GamePhase,
                  }
                : {
                      drawnCard: computerDrawnCard,
                      drawnCardRef: computerDrawnCardRef,
                      defenseSlots: playerDefenseSlots,
                      slotRefs: playerSlotRefs,
                      setAnimatedCards: setComputerAnimatedCards,
                      setDrawnCard: setComputerDrawnCard,
                      nextDrawPhase: 'computerTurn_draw' as GamePhase,
                  };

        if (
            !drawnCard ||
            !drawnCardRef.current ||
            slotsCanBeAttacked.length === 0
        )
            return;

        const targetSlot =
            target === 'player'
                ? defenseSlots.find((s) => s.id === targetSlotId)
                : slotsCanBeAttacked.reduce((prev, curr) =>
                      prev.cardValue! > curr.cardValue! ? prev : curr
                  );

        if (!targetSlot || !targetSlot.cardValue) return;

        const attackSlotRef = slotRefs.current[targetSlot.id];
        if (!attackSlotRef) return;

        const attackCard = drawnCard;

        setSlotsCanBeAttacked([]);
        setDrawnCard(null);

        const attackCoordinates = calculateAnimationCoordinates({
            startRef: drawnCardRef.current,
            endRef: attackSlotRef,
            animationType: 'deal',
        });

        const animatedAttackCard: AnimatedCardType = {
            id: Date.now() + 1,
            cardValue: attackCard,
            ...attackCoordinates,
            animationType: 'attack',
            onAnimationEnd: () => {
                const newAttackingCards = [
                    ...attackingCardsInSlots,
                    { id: targetSlot.id, cardValue: attackCard },
                ];

                setAttackingCardsInSlots(newAttackingCards);
                setAnimatedCards([]);

                if (newAttackingCards.length >= playerDefenseSlots.length)
                    target === 'player'
                        ? setShowEndTurnButton(true)
                        : setGamePhase('computerTurn_end');
                else setGamePhase(nextDrawPhase);
            },
        };
        setAnimatedCards([animatedAttackCard]);
    };

    const handlePlayerEndTurn = () => {
        setShowEndTurnButton(false);
        setGamePhase('playerTurn_end');
    };

    const handleEndTurn = (target: 'player' | 'computer') => {
        let completedCount = 0;

        const {
            drawnCard,
            drawnCardRef,
            attackerDeckRef,
            defenderDeckRef,
            discardDeckRef,
            setAttackerDeck,
            setDefenderDeck,
            setDiscardDeck,
            setDrawnCard,
            setDefenderSlots,
            defenseSlots,
            slotRefs,
            setAnimatedCards,
            setAttackerPoints,
            setDefenderPoints,
        } =
            target === 'player'
                ? {
                      drawnCard: playerDrawnCard,
                      drawnCardRef: playerDrawnCardRef.current,
                      attackerDeckRef: playerDeckRef.current,
                      defenderDeckRef: computerDeckRef.current,
                      discardDeckRef: playerDiscardDeckRef.current,
                      setAttackerDeck: setPlayerDeck,
                      setDefenderDeck: setComputerDeck,
                      setDiscardDeck: setPlayerDiscardDeck,
                      setDrawnCard: setPlayerDrawnCard,
                      defenseSlots: computerDefenseSlots,
                      slotRefs: computerSlotRefs,
                      setDefenderSlots: setComputerSlots,
                      setAnimatedCards: setPlayerAnimatedCards,
                      setDefenderPoints: setComputerPoints,
                      setAttackerPoints: setPlayerPoints,
                  }
                : {
                      drawnCard: computerDrawnCard,
                      drawnCardRef: computerDrawnCardRef.current,
                      attackerDeckRef: computerDeckRef.current,
                      defenderDeckRef: playerDeckRef.current,
                      discardDeckRef: computerDiscardDeckRef.current,
                      setAttackerDeck: setComputerDeck,
                      setDefenderDeck: setPlayerDeck,
                      setDiscardDeck: setComputerDiscardDeck,
                      setDrawnCard: setComputerDrawnCard,
                      defenseSlots: playerDefenseSlots,
                      slotRefs: playerSlotRefs,
                      setDefenderSlots: setPlayerSlots,
                      setAnimatedCards: setComputerAnimatedCards,
                      setDefenderPoints: setPlayerPoints,
                      setAttackerPoints: setComputerPoints,
                  };

        if (attackingCardsInSlots.length === defenseSlots.length) {
            setDefenderPoints((prev) => prev - 1);
        }

        const cardsToDiscard: number[] = [];
        const cardsToAttackerDeck: number[] = [];

        let allAnimatedCards: AnimatedCardType[] = [];

        if (drawnCard) {
            if (!attackingCardsInSlots.length) {
                setAttackerPoints((prev) => prev - 1);
            }
            const coordinates = calculateAnimationCoordinates({
                startRef: drawnCardRef!,
                endRef: defenderDeckRef!,
                animationType: 'deal',
            });

            const toDefenderCard: AnimatedCardType = {
                id: Date.now(),
                cardValue: drawnCard,
                ...coordinates,
                animationType: 'discard',
                size: coordinates.size,
                duration: coordinates.duration,
            };

            allAnimatedCards.push(toDefenderCard);
            setDrawnCard(null);
        }

        const defeatedAnimatedCards: AnimatedCardType[] = attackingCardsInSlots
            .map((attackingCard) => {
                const defenseCard = defenseSlots.find(
                    (defense) => defense.id === attackingCard.id
                );
                if (!defenseCard) return null;

                const slotRef = slotRefs.current[defenseCard.id];
                if (!slotRef) return null;

                cardsToAttackerDeck.push(defenseCard.cardValue!);

                const coordinates = calculateAnimationCoordinates({
                    startRef: slotRef,
                    endRef: attackerDeckRef!,
                    animationType: 'deal',
                });

                return {
                    id: Date.now() + Math.random(),
                    cardValue: defenseCard.cardValue,
                    ...coordinates,
                    animationType: 'discard',
                } as AnimatedCardType;
            })
            .filter(Boolean) as AnimatedCardType[];

        allAnimatedCards.push(...defeatedAnimatedCards);

        const attackingAnimatedCards = attackingCardsInSlots
            .map((card) => {
                const slotRef = slotRefs.current[card.id];
                if (!slotRef) return null;

                cardsToDiscard.push(card.cardValue!);

                const coordinates = calculateAnimationCoordinates({
                    startRef: slotRef,
                    endRef: discardDeckRef!,
                    animationType: 'deal',
                });

                return {
                    id: Date.now() + Math.random(),
                    cardValue: card.cardValue,
                    ...coordinates,
                    animationType: 'discard',
                } as AnimatedCardType;
            })
            .filter(Boolean) as AnimatedCardType[];

        allAnimatedCards.push(...attackingAnimatedCards);

        const totalAnimations = allAnimatedCards.length;

        if (totalAnimations === 0) {
            if (cardsToDiscard.length > 0 || cardsToAttackerDeck.length > 0) {
                setDiscardDeck((prev) => [...prev, ...cardsToDiscard]);
                setAttackerDeck((prev) => [...prev, ...cardsToAttackerDeck]);
            }
            return;
        }

        setAttackingCardsInSlots([]);

        const defeatedSlotIds = attackingCardsInSlots.map((c) => c.id);
        setDefenderSlots((prev) =>
            prev.map((card) => {
                if (defeatedSlotIds.includes(card.id)) card.cardValue = null;
                return card;
            })
        );

        const combinedAnimatedCards = allAnimatedCards.map((card) => {
            return {
                ...card,
                onAnimationEnd: () => {
                    completedCount++;

                    if (completedCount === totalAnimations) {
                        if (drawnCard) {
                            setDefenderDeck((prev) => [...prev, drawnCard]);
                        }

                        setDiscardDeck((prev) => [...prev, ...cardsToDiscard]);

                        setAttackerDeck((prev) => [
                            ...prev,
                            ...cardsToAttackerDeck,
                        ]);

                        setAnimatedCards([]);
                        dealCards(
                            target === 'player' ? 'computer' : 'player'
                        ).then(() =>
                            setGamePhase(
                                target === 'player'
                                    ? 'computerTurn_draw'
                                    : 'playerTurn_draw'
                            )
                        );
                    }
                },
            };
        });

        setAnimatedCards(combinedAnimatedCards);
    };

    useEffect(() => {
        const handleGamePhase = async () => {
            switch (gamePhase) {
                case 'dealing':
                    await Promise.all([
                        dealCards('player'),
                        dealCards('computer'),
                    ]);
                    break;
                case 'playerTurn_draw':
                    setShowDrawCardButton(true);
                    break;
                case 'playerTurn_end':
                    handleEndTurn('player');
                    break;
                case 'computerTurn_draw':
                    setShowDrawCardButton(false);
                    setTimeout(() => handleDrawCard('computer'), 1000);
                    break;
                case 'computerTurn_attack':
                    setTimeout(() => handleAttack('computer'), 1000);
                    break;
                case 'computerTurn_end':
                    setTimeout(() => handleEndTurn('computer'), 1000);
                    break;
                case 'resolveTurn':
                    break;
            }
        };

        handleGamePhase();
    }, [gamePhase]);

    return {
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
        playerDiscardDeck,
        computerDiscardDeck,
        playerDeckLength: playerDeck.length,
        computerDeckLength: computerDeck.length,
        handleDrawPlayerCard: () => handleDrawCard('player'),
        showEndTurnButton,
        handlePlayerEndTurn,
        showDrawCardButton,
        playerPoints,
        computerPoints,
    };
};
