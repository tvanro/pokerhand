import minimist from 'minimist';
import { CARD_SET, POKER_CATEGORY_RANKS } from './constants';
import * as utils from './utils';

const argv = minimist(process.argv.slice(2));

const cardDeck = CARD_SET.concat(CARD_SET).concat(CARD_SET).concat(CARD_SET);

const hand1 = argv.hand1.split(',').map((card) => card.trim().toUpperCase());
const hand2 = argv.hand2.split(',').map((card) => card.trim().toUpperCase());

const validDeck = (utils.takeCardsFromDeck(cardDeck, hand1) && utils.takeCardsFromDeck(cardDeck, hand2));

if (!validDeck){
  console.log();
  console.log('impossible hands, please try again');
  console.log();
}
else{
  const hand1Result = utils.getPokerCategoryRankResult(hand1);
  const hand2Result = utils.getPokerCategoryRankResult(hand2);

  // compare the categoryRank of the hands. 
  // if it is the same category --> compare the card ranks
  if(hand1Result.categoryRank === hand2Result.categoryRank) { 
    const highestHand = utils.getHighestFromEqualCategoryResults(hand1Result, hand2Result);
    if(highestHand === hand1Result) {
      utils.victory(argv.hand1);
    }
    else if (highestHand === hand2Result){
      utils.victory(argv.hand2);
    }
    else {
      console.log();
      console.log('equal, everyone wins!');
      console.log();
    }
  }
  else{
    if(hand1Result.categoryRank < hand2Result.categoryRank) {
      utils.victory(argv.hand1);
    }
    else{
      utils.victory(argv.hand2);
    }
  }
}
