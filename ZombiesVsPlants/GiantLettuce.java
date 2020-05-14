package com.example.game.backend.ZombiesVsPlants;

import com.example.game.R;

// A giant lettuce has a high amount of health but moves slowly.
public class GiantLettuce extends Plant {

    /** Create a new giant lettuce.
     *
     * @param xCoordinate the horizontal displacement of the giant lettuce from the left screen
     *                    edge.
     * @param yCoordinate the vertical displacement of the giant lettuce from the top screen edge.
     */
    GiantLettuce(int xCoordinate, int yCoordinate) {
        super(300, 100, -4, 10, 300,
                xCoordinate, yCoordinate);
    }

    /* Sets the image of the giant lettuce using its internal counter. The resulting animation will
    show the giant lettuce leaves moving and the Lettuce blinking occasionally.
    */
    public void setImageViewFromCounter() {
        if (this.getCounter() % 12 == 0 || this.getCounter() % 12 == 1 ||
                this.getCounter() % 12 == 4
                || this.getCounter() % 12 == 5 || this.getCounter() % 12 == 8 ||
                this.getCounter() % 12 == 9) {
            this.getImageView().setImageResource(R.drawable.giant_lettuce1);
        } else if (this.getCounter() % 12 == 2 || this.getCounter() % 12 == 3 ||
                this.getCounter() % 12 == 6
                || this.getCounter() % 12 == 7 || this.getCounter() % 12 == 10) {
            this.getImageView().setImageResource(R.drawable.giant_lettuce2);
        } else {
            this.getImageView().setImageResource(R.drawable.giant_lettuce3);
        }
    }
}
