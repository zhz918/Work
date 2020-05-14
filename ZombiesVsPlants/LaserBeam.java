package com.example.game.backend.ZombiesVsPlants;

import com.example.game.R;

// A laser beam is fired by laser zombies. It will damage all plants in front it.
public class LaserBeam extends Projectile {

    /** Creates a new laser beam.
     *
     * @param xCoordinate the horizontal displacement of the laser beam from the left screen edge.
     * @param yCoordinate the vertical displacement of the laser beam from the top screen edge.
     */
    LaserBeam(int xCoordinate, int yCoordinate) {
        super(1, 8, 0, 4, xCoordinate, yCoordinate);
    }

    /* A laser beam collides with a zombie as long as the zombie is in the same lane as the laser
    beam without regard to their x-coordinates.
     */
    public boolean collisionOccurred(ScreenItem screenItem) {
        return this.getLaneNumber() == screenItem.getLaneNumber();
    }

    /* Sets the image of the laser beam using its internal counter. The resulting animation will
    show the laser beam initially fire in bright red and gradually become more white.
    */
    public void setImageViewFromCounter() {
        if (this.getCounter() % 5 == 0) {
            this.getImageView().setImageResource(R.drawable.laser_beam5);
        } else if (this.getCounter() % 5 == 1) {
            this.getImageView().setImageResource(R.drawable.laser_beam4);
        } else if (this.getCounter() % 5 == 2) {
            this.getImageView().setImageResource(R.drawable.laser_beam3);
        } else if (this.getCounter() % 5 == 3) {
            this.getImageView().setImageResource(R.drawable.laser_beam2);
        } else {
            this.getImageView().setImageResource(R.drawable.laser_beam1);
        }
    }
}
