package com.example.game.backend.ZombiesVsPlants;


import com.example.game.R;

// A small magical ball is fired by a wizard zombie.
public class SmallMagicalBall extends Projectile {

    /** Creates a new small magical ball.
     *
     * @param xCoordinate the horizontal displacement of the small magical ball from the left
     *                    screen edge.
     * @param yCoordinate the vertical displacement of the small magical ball from the top screen
     *                    edge.
     *
     */
    SmallMagicalBall(int xCoordinate, int yCoordinate) {
        super(1, 10, 80, 0, xCoordinate, yCoordinate);
    }

    /* Sets the image of the small magical ball using its internal counter. The resulting animation
    will show the small magical ball cycle through four colors - purple, blue, green, and red - as
    it moves.
    */
    public void setImageViewFromCounter() {
        if (this.getCounter() % 4 == 0) {
            this.getImageView().setImageResource(R.drawable.small_magical_ball_purple);
        } else if (this.getCounter() % 4 == 1) {
            this.getImageView().setImageResource(R.drawable.small_magical_ball_blue);
        } else if (this.getCounter() % 4 == 2) {
            this.getImageView().setImageResource(R.drawable.small_magical_ball_green);
        } else {
            this.getImageView().setImageResource(R.drawable.small_magical_ball_red);
        }
    }
}
