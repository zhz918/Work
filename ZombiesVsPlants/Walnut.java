package com.example.game.backend.ZombiesVsPlants;

import com.example.game.R;

/* A walnut becomes angry after some losing some amount of its health. When it is angry, it moves
faster.
 */
public class Walnut extends Plant {

    /** Creates a new walnut.
     *
     * @param xCoordinate the horizontal displacement of the walnut from the left screen edge.
     * @param yCoordinate the vertical displacement of the walnut from the top screen edge.
     */
    Walnut(int xCoordinate, int yCoordinate) {
        super(200, 50, -3, 10, 250, xCoordinate,
                yCoordinate);
    }

    /* Sets the image of the walnut using its internal counter. The resulting animation will
    show the walnut blinking occasionally when it is not angry. When it is angry, its colour will
    cycle through shades of red and will blink occasionally.
    */
    public void setImageViewFromCounter() {

        if (this.isNotAngry()) {
            if (!(this.getCounter() % 12 == 11)) {
                this.getImageView().setImageResource(R.drawable.walnut1);
            } else {
                this.getImageView().setImageResource(R.drawable.walnut2);
            }
        } else {
            if (this.getCounter() % 9 == 0 || this.getCounter() % 9 == 8) {
                this.getImageView().setImageResource(R.drawable.walnut_angry1);
            } else if (this.getCounter() % 9 == 1 || this.getCounter() % 9 == 7) {
                this.getImageView().setImageResource(R.drawable.walnut_angry2);
            } else if (this.getCounter() % 9 == 2 || this.getCounter() % 9 == 6) {
                this.getImageView().setImageResource(R.drawable.walnut_angry3);
            } else if (this.getCounter() % 9 == 3 || this.getCounter() % 9 == 5) {
                this.getImageView().setImageResource(R.drawable.walnut_angry4);
            } else {
                this.getImageView().setImageResource(R.drawable.walnut_angry5);
            }
        }
    }

    /** Returns the default velocity determined based on whether the walnut is angry.
     *
     * @return the default velocity of the walnut depending on whether it is angry.
     */
    public int getDefaultVelocity() {
        if (this.isNotAngry()) {
            return -3;
        } else {
            return -10;
        }
    }

    /** Returns whether the walnut is angry.
     *
     * @return true if the walnut is not angry and false otherwise.
     */
    private boolean isNotAngry() {
        // If the health of the walnut falls below half its total health, then it becomes angry.
        return this.getHealth() > 100;
    }

}
