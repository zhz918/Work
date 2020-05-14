package com.example.game.backend.ZombiesVsPlants;

import com.example.game.R;

import java.util.Random;

// A carrot spins towards a random spot within a fixed range and stays there until it is destroyed.
public class Carrot extends Plant {

    // The number of frames that this carrot will be spinning before stopping.
    private int spinningTime;

    /** Creates a new carrot.
     *
     * @param xCoordinate the horizontal displacement of the carrot from the left screen edge.
     * @param yCoordinate the vertical displacement of the carrot from the top screen edge.
     */
    Carrot(int xCoordinate, int yCoordinate) {
        super(500, 50, -20, 10, 300,
                xCoordinate, yCoordinate);
        // The number of frames the carrot spins is a random integer from 25 to 49.
        Random random = new Random();
        spinningTime = 25 + random.nextInt(25);
    }

    /* Sets the image of the carrot using its internal counter. The resulting animation will
    show the carrot moving from the right screen edge in a spinning fashion and then stopping after
    a short amount of time. Once it has stopped, it will occasionally blink.
    */
    public void setImageViewFromCounter() {
        if (isSpinning()) {
            if (this.getCounter() % 4 == 0) {
                this.getImageView().setImageResource(R.drawable.carrot1);
            } else if (this.getCounter() % 4 == 1) {
                this.getImageView().setImageResource(R.drawable.carrot2);
            } else if (this.getCounter() % 4 == 2) {
                this.getImageView().setImageResource(R.drawable.carrot3);
            } else {
                this.getImageView().setImageResource(R.drawable.carrot4);
            }
        } else {
            if (this.getCounter() % 12 != 0) {
                this.getImageView().setImageResource(R.drawable.carrot5);
            } else {
                this.getImageView().setImageResource(R.drawable.carrot6);
            }
        }
    }

    /** Returns whether this carrot is still spinning.
     *
     * @return true is this carrot is spinning and false otherwise.
     */
    private boolean isSpinning() {
        return this.getCounter() < spinningTime;
    }

    /** Returns the default velocity determined based on whether the carrot is spinning.
     *
     * @return the default velocity of the carrot depending on whether it is spinning.
     */
    public int getDefaultVelocity() {
        if (isSpinning()) {
            return -20;
        } else {
            return 0;
        }
    }
}
