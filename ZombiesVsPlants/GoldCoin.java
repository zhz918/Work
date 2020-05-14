package com.example.game.backend.ZombiesVsPlants;

import com.example.game.R;

// A gold coin is a common object dropped by plants. They spin while they are on screen.
public class GoldCoin extends Loot {

    /** Creates a new gold coin.
     *
     * @param xCoordinate the horizontal displacement of the gold coin from the left screen edge.
     * @param yCoordinate the vertical displacement of the gold coin from the top screen edge.
     */
    GoldCoin(int xCoordinate, int yCoordinate) {
        super(30,
                300, xCoordinate, yCoordinate);
    }

    /* Sets the image of the gold coin using its internal counter. The resulting animation  will
    show the rotating around its horizontally centered axis.
     */
    public void setImageViewFromCounter() {
        if (this.getCounter() % 10 == 0 || this.getCounter() % 10 == 9) {
            this.getImageView().setImageResource(R.drawable.gold_coin1);
        } else if (this.getCounter() % 10 == 1 || this.getCounter() % 10 == 8) {
            this.getImageView().setImageResource(R.drawable.gold_coin2);
        } else if (this.getCounter() % 10 == 2 || this.getCounter() % 10 == 7) {
            this.getImageView().setImageResource(R.drawable.gold_coin3);
        } else if (this.getCounter() % 10 == 3 || this.getCounter() % 10 == 6){
            this.getImageView().setImageResource(R.drawable.gold_coin4);
        } else{
            this.getImageView().setImageResource(R.drawable.gold_coin5);
        }
    }
}

