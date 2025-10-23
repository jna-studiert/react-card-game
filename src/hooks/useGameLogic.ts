import { useState, useRef, useEffect } from 'react';
import type { SlotType, AnimatedCardType } from '@/types';
import { checkCanAttack, createDeck } from '@/utils/functions';
import { calculateAnimationCoordinates } from '@/utils/animationCalculation';

type GamePhase =
    | 'dealing'
    | 'playerTurn_draw'
    | 'playerTurn_attack'
    | 'playerTurn_end'
    | 'computerTurn_draw'
    | 'computerTurn_attack'
    | 'resolveTurn'
    | 'gameOver';

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

    const [slotsPlayerCanAttack, setSlotsPlayerCanAttack] = useState<
        SlotType[]
    >([]);
    const [slotsComputerCanAttack, setSlotsComputerCanAttack] = useState<
        SlotType[]
    >([]);

    const [playerDiscardDeck, setPlayerDiscardDeck] = useState<number[]>([]);
    const [computerDiscardDeck, setComputerDiscardDeck] = useState<number[]>(
        []
    );

    const [attackingCardsInSlots, setAttackingCardsInSlots] = useState<
        SlotType[]
    >([]);

    const [showModal, setShowModal] = useState<boolean>(true);

    const [gamePhase, setGamePhase] = useState<GamePhase>('dealing');

    const handleStart = (first: 'player' | 'computer') => {
        setShowModal(false);
        setGamePhase(
            first === 'player' ? 'playerTurn_draw' : 'computerTurn_draw'
        );
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

            const emptySlots = slots.filter((slot) => slot.cardValue === null);
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

    const dealTopCard = (target: 'player' | 'computer'): Promise<number> => {
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

    const handleDrawCard = async () => {
        if (gamePhase !== 'playerTurn_draw' || playerDrawnCard !== null) return;

        const drawnCard = await dealTopCard('player');
        if (drawnCard === -1) {
            setGamePhase('playerTurn_end');
            return;
        }

        const availableComputerDefenseSlots = computerDefenseSlots.filter(
            ({ id: computerId }) =>
                !attackingCardsInSlots.some(
                    ({ id: attackingId }) => attackingId === computerId
                )
        );

        const canAttackArray = checkCanAttack(
            availableComputerDefenseSlots,
            drawnCard
        );

        if (!!canAttackArray.length) {
            setSlotsPlayerCanAttack(canAttackArray);
            setGamePhase('playerTurn_attack');
        } else {
            setGamePhase('playerTurn_end');
        }
    };

    const handlePlayerAttack = (targetSlotId: number) => {
        if (gamePhase !== 'playerTurn_attack' || playerDrawnCard === null)
            return;
        const targetSlot = computerDefenseSlots.find(
            (s) => s.id === targetSlotId
        );
        const attackSlotRef = computerSlotRefs.current[targetSlotId];
        if (!targetSlot || targetSlot.cardValue === null || !attackSlotRef)
            return;

        const attackCard = playerDrawnCard;

        setSlotsPlayerCanAttack([]);
        setPlayerDrawnCard(null);

        const attackCoordinates = calculateAnimationCoordinates({
            startRef: playerDrawnCardRef.current!,
            endRef: attackSlotRef,
            animationType: 'deal',
        });

        const animatedAttackCard: AnimatedCardType = {
            id: Date.now(),
            cardValue: attackCard,
            ...attackCoordinates,
            animationType: 'attack',
            onAnimationEnd: () => {
                const newAttackingCards = [
                    ...attackingCardsInSlots,
                    { id: targetSlot.id, cardValue: attackCard },
                ];

                setAttackingCardsInSlots(newAttackingCards);
                setPlayerAnimatedCards([]);
                setGamePhase(
                    newAttackingCards.length >= computerDefenseSlots.length
                        ? 'playerTurn_end'
                        : 'playerTurn_draw'
                );
            },
        };
        setPlayerAnimatedCards([animatedAttackCard]);
    };

    const handlePlayerEnd = () => {
        let completedCount = 0;

        const cardsToPlayerDiscard: number[] = [];
        const cardsToPlayerDeck: number[] = [];

        let allAnimatedCards: AnimatedCardType[] = [];

        if (playerDrawnCard) {
            const coordinates = calculateAnimationCoordinates({
                startRef: playerDrawnCardRef.current!,
                endRef: computerDeckRef.current!,
                animationType: 'deal',
            });

            const playerReturnCard: AnimatedCardType = {
                id: Date.now(),
                cardValue: playerDrawnCard,
                ...coordinates,
                animationType: 'discard',
                size: coordinates.size,
                duration: coordinates.duration,
            };

            allAnimatedCards.push(playerReturnCard);
            setPlayerDrawnCard(null);
        }

        const defeatedAnimatedCards: AnimatedCardType[] = attackingCardsInSlots
            .map((attackingCard) => {
                const defenseCard = computerDefenseSlots.find(
                    (defense) => defense.id === attackingCard.id
                );
                if (!defenseCard) return null;

                const slotRef = computerSlotRefs.current[defenseCard.id];
                if (!slotRef) return null;

                cardsToPlayerDeck.push(defenseCard.cardValue!);

                const coordinates = calculateAnimationCoordinates({
                    startRef: slotRef,
                    endRef: playerDeckRef.current!,
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
                const slotRef = computerSlotRefs.current[card.id];
                if (!slotRef) return null;

                cardsToPlayerDiscard.push(card.cardValue!);

                const coordinates = calculateAnimationCoordinates({
                    startRef: slotRef,
                    endRef: playerDiscardDeckRef.current!,
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
            if (
                cardsToPlayerDiscard.length > 0 ||
                cardsToPlayerDeck.length > 0
            ) {
                setPlayerDiscardDeck((prev) => [
                    ...prev,
                    ...cardsToPlayerDiscard,
                ]);
                setPlayerDeck((prev) => [...prev, ...cardsToPlayerDeck]);
            }
            return;
        }

        setAttackingCardsInSlots([]);
        const defeatedSlotIds = attackingCardsInSlots.map((c) => c.id);
        setComputerSlots((prev) =>
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
                        if (playerDrawnCard) {
                            setComputerDeck((prev) => [
                                ...prev,
                                playerDrawnCard,
                            ]);
                        }

                        setPlayerDiscardDeck((prev) => [
                            ...prev,
                            ...cardsToPlayerDiscard,
                        ]);

                        setPlayerDeck((prev) => [
                            ...prev,
                            ...cardsToPlayerDeck,
                        ]);

                        setPlayerAnimatedCards([]);
                        dealCards('computer').then(() =>
                            setGamePhase('computerTurn_draw')
                        );
                    }
                },
            };
        });

        setPlayerAnimatedCards(combinedAnimatedCards);
    };

    //TO DO
    const handleComputerAttack = () => {
        if (
            computerDrawnCard === null ||
            !computerDrawnCardRef.current ||
            slotsComputerCanAttack.length === 0
        )
            return;
        const targetSlot = slotsComputerCanAttack.reduce((prev, curr) =>
            prev.cardValue! < curr.cardValue! ? prev : curr
        );
        const attackSlotRef = playerSlotRefs.current[targetSlot.id];
        if (!attackSlotRef) return;

        const attackCard = computerDrawnCard;

        setSlotsComputerCanAttack([]);
        setComputerDrawnCard(null);

        const attackCoordinates = calculateAnimationCoordinates({
            startRef: computerDrawnCardRef.current,
            endRef: attackSlotRef,
            animationType: 'deal',
        });
        const animatedAttackCard: AnimatedCardType = {
            id: Date.now() + 1,
            cardValue: attackCard,
            ...attackCoordinates,
            animationType: 'attack',
            onAnimationEnd: () => {
                setAttackingCardsInSlots((prev) => [
                    ...prev,
                    { id: targetSlot.id, cardValue: attackCard },
                ]);
                setComputerAnimatedCards([]);
                setGamePhase('resolveTurn');
            },
        };
        setComputerAnimatedCards([animatedAttackCard]);
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

                case 'playerTurn_end':
                    handlePlayerEnd();
                    break;
                case 'computerTurn_draw':
                    await dealTopCard('computer');
                    break;

                case 'computerTurn_attack':
                    setTimeout(handleComputerAttack, 1000);
                    break;

                case 'resolveTurn':
                    break;
            }
        };

        handleGamePhase();
    }, [gamePhase]);

    useEffect(() => {
        console.log('gamePhase ', gamePhase);
    }, [gamePhase]);
    useEffect(() => {
        console.log('playerDeck ', playerDeck);
    }, [playerDeck]);
    useEffect(() => {
        console.log('computerDeck ', computerDeck);
    }, [computerDeck]);
    useEffect(() => {
        console.log('computerDiscardDeck ', computerDiscardDeck);
    }, [computerDiscardDeck]);
    useEffect(() => {
        console.log('playerDiscardDeck ', playerDiscardDeck);
    }, [playerDiscardDeck]);

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
        gamePhase,
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
        handleComputerAttack,
        attackingCardsInSlots,
        playerDiscardDeck,
        computerDiscardDeck,
        playerDeckLength: playerDeck.length,
        computerDeckLength: computerDeck.length,
        handleDrawCard,
    };
};
