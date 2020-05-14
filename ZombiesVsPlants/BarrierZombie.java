package com.example.game.backend.ZombiesVsPlants;

import com.example.game.R;

// A barrier zombie prevents plants from moving past it.
public class BarrierZombie extends Zombie {

    /** Creates a new barrier zombie.
     *
     * @param xCoordinate the horizontal displacement of the zombie from the left screen edge.
     * @param yCoordinate the vertical displacement of the zombie from the top screen edge.
     */
    public BarrierZombie(int xCoordinate, int yCoordinate) {
        super(1800, 0, 0, 100, 75, xCoordinate,
                yCoordinate);
    }

    /* Sets the image of the barrier zombie using its internal counter. The resulting animation will
    show the barrier gradually breaking as the health of the barrier zombie decreases.
    */
    public void setImageViewFromCounter() {
        if (this.getHealth() <= 600) {
            this.getImageView().setImageResource(R.drawable.barrier_zombie3);
        } else if (this.getHealth() <= 1200) {
            this.getImageView().setImageResource(R.drawable.barrier_zombie2);
        } else {
            this.getImageView().setImageResource(R.drawable.barrier_zombie1);
        }
    }
}
