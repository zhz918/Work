package com.example.game.backend.ZombiesVsPlants;

import com.example.game.R;

// A wizard zombie shoots small magical balls that can change colors while in flight.
public class WizardZombie extends Zombie {

    /** Creates a new wizard zombie.
     *
     * @param xCoordinate the horizontal displacement of the wizard zombie from the left screen
     *                    edge.
     * @param yCoordinate the vertical displacement of the wizard zombie from the top screen edge.
     */
    public WizardZombie(int xCoordinate, int yCoordinate) {
        super(100, 10, 0, 10, 100,
                xCoordinate, yCoordinate);
    }

    /* Sets the image of the wizard zombie using its internal counter. The resulting animation will
    show the wizard zombie moving its stick downwards whenever it fires a small magical ball.
    */
    public void setImageViewFromCounter() {
        if (this.getCounter() % this.getAttackDelay() == 1 || this.getCounter() %
                this.getAttackDelay() == 2) {
            this.getImageView().setImageResource(R.drawable.wizard_zombie2);
        } else {
            this.getImageView().setImageResource(R.drawable.wizard_zombie1);
        }
    }

}
