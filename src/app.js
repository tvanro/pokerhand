var minimist = require('minimist');

const argv = minimist(process.argv.slice(2));

// value are ranks from https://en.wikipedia.org/wiki/List_of_poker_hand_categories#Hand_categories
const POKER_CATEGORY_RANKS = {
  FOUR_OF_A_KIND  : 2,
  FULL_HOUSE      : 3,
  STRAIGHT        : 5,
  THREE_OF_A_KIND : 6,
  TWO_PAIR        : 7,
  ONE_PAIR        : 8,
  HIGH_CARD       : 9,
};

const cardSet = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
const cardDeck = cardSet.concat(cardSet).concat(cardSet).concat(cardSet);

const hand1 = argv.hand1.split(',').map((card) => card.trim().toUpperCase());
const hand2 = argv.hand2.split(',').map((card) => card.trim().toUpperCase());

const validDeck = (takeCardsFromDeck(cardDeck, hand1) && takeCardsFromDeck(cardDeck, hand2));

if (!validDeck){
  console.log('impossible hands, please try again');
}
else{
  const hand1Rank = getPokerCategoryRankResult(hand1);
  const hand2Rank = getPokerCategoryRankResult(hand2);

  console.log(hand1Rank);
  console.log(hand2Rank);

  if(hand1Rank.categoryRank === hand2Rank.categoryRank) { 
    const highestHand = getHighestFromEqualCategoryResults(hand1Rank, hand2Rank);
    if(highestHand === hand1Rank) {
      victory(hand1);
    }
    else if (highestHand === hand2Rank){
      victory(hand2);
    }
    else {
      console.log('equal, everyone wins!');
    }
  }
  else{
    if(hand1Rank.categoryRank < hand2Rank.categoryRank) {
      victory(hand1);
    }
    else{
      victory(hand2);
    }
  }

}

function takeCardsFromDeck(cardDeck, hand) {
  let isValid = (hand.length === 5);
  hand.forEach((card) => {
    const index = cardDeck.indexOf(card);
    if (index > -1) {
      cardDeck.splice(index, 1);
    }
    else{
      isValid = false;
    }
  });
  return isValid;
}

function getPokerCategoryRankResult(hand) {
  // map hand to ranks and order ascending (highest rank is 0, lowest rank is 12);
  const handRanks = hand.map((card) => cardSet.indexOf(card)).sort((a, b) => {return a - b;});
  let categoryRank = {};
  let cardCount;
  let quatroRanks = [];
  let tripleRanks = [];
  let pairRanks = [];
  let isStraigth = true;
  let prev = -1;

  for (i = 0; i < handRanks.length; i++) { 
    const cardRank = handRanks[i];
    cardCount = handRanks.filter((item) => item === cardRank).length;

    // if FOUR_OF_A_KIND, no need to check the rest... 
    if (cardCount === 4) {
      quatroRanks.push(cardRank);
      break;
    }

    if (cardCount === 3 && tripleRanks.indexOf(cardRank) === -1) {
      tripleRanks.push(cardRank);
    } else if (cardCount === 2 && pairRanks.indexOf(cardRank) === -1) {
      pairRanks.push(cardRank);
    }

    if(isStraigth && prev > -1) {
      isStraigth = (prev + 1 === cardRank);
    }
    prev = cardRank;
  }

  // check for FOUR_OF_A_KIND
  if (cardCount === 4) {
    return { categoryRank: POKER_CATEGORY_RANKS.FOUR_OF_A_KIND, cardRank: quatroRanks[0] };
  }
  // check for FULL_HOUSE
  if (tripleRanks.length && pairRanks.length) {
    return { categoryRank: POKER_CATEGORY_RANKS.FULL_HOUSE, tripleRank: tripleRanks[0], pairRank: pairRanks[0] }; 
  }
  // check for STRAIGHT
  if (isStraigth) {
    return { categoryRank: POKER_CATEGORY_RANKS.STRAIGHT, cardRank: handRanks[0] }; 
  }
  // check for THREE_OF_A_KIND
  if (tripleRanks.length) {
    return { categoryRank: POKER_CATEGORY_RANKS.THREE_OF_A_KIND, tripleRank: tripleRanks[0], kickers: handRanks.filter((item) => item !== tripleRanks[0]) }; 
  }
  // check for TWO_PAIR
  if (pairRanks.length === 2) {
    return { categoryRank: POKER_CATEGORY_RANKS.TWO_PAIR, pairRanks: pairRanks, kickers: handRanks.filter((item) => item !== pairRanks[0] && item !== pairRanks[1]) }; 
  }
  // check for ONE_PAIR
  if (pairRanks.length === 1) {
    return { categoryRank: POKER_CATEGORY_RANKS.ONE_PAIR, pairRank: pairRanks[0], kickers: handRanks.filter((item) => item !== pairRanks[0]) }; 
  }

  // nothing matches --> HIGH_CARD
  return { categoryRank: POKER_CATEGORY_RANKS.HIGH_CARD, cardRank: handRanks[0], kickers: handRanks.filter((item) => item !== handRanks[0]) }; 
}

function getHighestFromEqualCategoryResults(hand1Result, hand2Result) {
  switch (hand1Result.categoryRank) {
    case POKER_CATEGORY_RANKS.FOUR_OF_A_KIND:
    case POKER_CATEGORY_RANKS.STRAIGHT: {
      if (hand1Result.cardRank === hand2Result.cardRank) {
        return null;
      } else {
        return (hand1Result.cardRank < hand2Result.cardRank) ? hand1Result : hand2Result;
      }
    }
    case POKER_CATEGORY_RANKS.FULL_HOUSE: {
      if (hand1Result.tripleRank === hand2Result.tripleRank) {
        if (hand1Result.pairRank === hand2Result.pairRank) {
          return null;
        }
        else {
          return (hand1Result.pairRank < hand2Result.pairRank) ? hand1Result : hand2Result;
        }
      }
      else{
        return (hand1Result.tripleRank < hand2Result.tripleRank) ? hand1Result : hand2Result;
      }
    }
    case POKER_CATEGORY_RANKS.THREE_OF_A_KIND: {
      if (hand1Result.tripleRank === hand2Result.tripleRank) { 
        if(hand1Result.kickers[0] === hand2Result.kickers[0]) {
          if(hand1Result.kickers[1] === hand2Result.kickers[1]) {
            return null;
          } else {
            return (hand1Result.kickers[1] < hand2Result.kickers[1]) ? hand1Result : hand2Result;
          }
        } else {
          return (hand1Result.kickers[0] < hand2Result.kickers[0]) ? hand1Result : hand2Result;
        }
      }
      else {
        return (hand1Result.tripleRank < hand2Result.tripleRank) ? hand1Result : hand2Result;
      }
    }
    case POKER_CATEGORY_RANKS.TWO_PAIR: {
      if(hand1Result.pairRanks[0] === hand2Result.pairRanks[0]) {
        if(hand1Result.pairRanks[1] === hand2Result.pairRanks[1]){
          if(hand1Result.kickers[0] === hand2Result.kickers[0]) {
            return null;
          } else {
            return (hand1Result.kickers[0] < hand2Result.kickers[0]) ? hand1Result : hand2Result;
          }
        } else {
          return (hand1Result.pairRanks[1] < hand2Result.pairRanks[1]) ? hand1Result : hand2Result;
        }
      } else {
        return (hand1Result.pairRanks[0] < hand2Result.pairRanks[0]) ? hand1Result : hand2Result;
      }
    }
    case POKER_CATEGORY_RANKS.ONE_PAIR: {
      if(hand1Result.pairRank === hand2Result.pairRank) {
        if(hand1Result.kickers[0] === hand2Result.kickers[0]) {
          if(hand1Result.kickers[1] === hand2Result.kickers[1]) {
            if(hand1Result.kickers[2] === hand2Result.kickers[2]) {
              return null;
            } else {
              return (hand1Result.kickers[2] < hand2Result.kickers[2]) ? hand1Result : hand2Result;
            }
          } else {
            return (hand1Result.kickers[1] < hand2Result.kickers[1]) ? hand1Result : hand2Result;
          }
        } else {
          return (hand1Result.kickers[0] < hand2Result.kickers[0]) ? hand1Result : hand2Result;
        }
      } else {
        return (hand1Result.pairRank < hand2Result.pairRank) ? hand1Result : hand2Result;
      }
    }
    case POKER_CATEGORY_RANKS.HIGH_CARD: {
      if(hand1Result.cardRank === hand2Result.cardRank) {
        if(hand1Result.kickers[0] === hand2Result.kickers[0]) {
          if(hand1Result.kickers[1] === hand2Result.kickers[1]) {
            if(hand1Result.kickers[2] === hand2Result.kickers[2]) {
              if(hand1Result.kickers[3] === hand2Result.kickers[3]) {
                if(hand1Result.kickers[4] === hand2Result.kickers[4]) {
                  return null;
                } else {
                  return (hand1Result.kickers[4] < hand2Result.kickers[4]) ? hand1Result : hand2Result;
                }
              } else {
                return (hand1Result.kickers[3] < hand2Result.kickers[3]) ? hand1Result : hand2Result;
              }
            } else {
              return (hand1Result.kickers[2] < hand2Result.kickers[2]) ? hand1Result : hand2Result;
            }
          } else {
            return (hand1Result.kickers[1] < hand2Result.kickers[1]) ? hand1Result : hand2Result;
          }
        } else {
          return (hand1Result.kickers[0] < hand2Result.kickers[0]) ? hand1Result : hand2Result;
        }
      } else {
        return (hand1Result.cardRank < hand2Result.cardRank) ? hand1Result : hand2Result;
      }
    }
    default:
      return null;
  }
}

function victory(hand){
  console.log(`${hand} is the stronger hand!`);
}

console.log(argv);
