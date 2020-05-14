package com.example.game.backend.ZombiesVsPlants;

import com.example.game.R;

// A laser zombie shoots a laser beam across its lane.
public class LaserZombie extends Zombie {

    /** Creates a new laser zombie.
     *
     * @param xCoordinate the horizontal displacement of the laser zombie from the left screen edge.
     * @param yCoordinate the vertical displacement of the laser zombie from the top screen edge.
     */
    public LaserZombie(int xCoordinate, int yCoordinate) {
        super(100, 8, 0, 24, 200, xCoordinate,
                yCoordinate);
    }

    /* Sets the image of the laser zombie using its internal counter. The resulting animation will
    show the laser turret charge up as the laser zombie is ready to fire a laser beam.
    */
    public void setImageViewFromCounter() {
        if (1 <= this.getCounter() % this.getAttackDelay() && this.getCounter() %
                this.getAttackDelay() <= 6) {
            this.getImageView().setImageResource(R.drawable.laser_zombie1);
        } else if (7 <= this.getCounter() % this.getAttackDelay() && this.getCounter() %
                this.getAttackDelay() <= 12) {
            this.getImageView().setImageResource(R.drawable.laser_zombie2);
        } else if (13 <= this.getCounter() % this.getAttackDelay() && this.getCounter() %
                this.getAttackDelay() <= 18) {
            this.getImageView().setImageResource(R.drawable.laser_zombie3);
        } else {
            this.getImageView().setImageResource(R.drawable.laser_zombie4);
        }
    }
}
