package com.example.game.backend.ZombiesVsPlants;

import com.example.game.R;

// A lettuce has low health but moves quickly.
public class Lettuce extends Plant {

    /** Creates a new lettuce.
     *
     * @param xCoordinate the horizontal displacement of the lettuce from the left screen edge.
     * @param yCoordinate the vertical displacement of the lettuce from the top screen edge.
     */
    Lettuce(int xCoordinate, int yCoordinate) {
        super(100, 50, -7, 10, 50, xCoordinate,
                yCoordinate);
    }

    /* Sets the image of the lettuce using its internal counter. The resulting animation will show
    the lettuce leaves moving and the lettuce blinking occasionally.
     */
    public void setImageViewFromCounter() {
        if (this.getCounter() % 12 == 0 || this.getCounter() % 12 == 1 ||
                this.getCounter() % 12 == 4
                || this.getCounter() % 12 == 5 || this.getCounter() % 12 == 8 ||
                this.getCounter() % 12 == 9) {
            this.getImageView().setImageResource(R.drawable.lettuce1);
        } else if (this.getCounter() % 12 == 2 || this.getCounter() % 12 == 3 ||
                this.getCounter() % 12 == 6
                || this.getCounter() % 12 == 7 || this.getCounter() % 12 == 10) {
            this.getImageView().setImageResource(R.drawable.lettuce2);
        } else {
            this.getImageView().setImageResource(R.drawable.lettuce3);
        }
    }
}
