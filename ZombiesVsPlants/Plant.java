package com.example.game.backend.ZombiesVsPlants;

/*A plant comes from the right edge screen edge and moves left. The player must place zombies to
prevent the plant objects from reaching the left screen edge.
 */
public class Plant extends ScreenItem {

    // The amount of brains the player is rewarded when this Plant is killed.
    private int brainsWorth;

    /** Creates a new plant.
     *
     * @param health the health of this plant.
     * @param damage the damage of this plant.
     * @param defaultVelocity the default velocity of this plant.
     * @param attackDelay the attack delay of this plant in number of frames.
     * @param brainsWorth the number of brains that killing this plant rewards.
     * @param xCoordinate the horizontal displacement of the Zombie from the left screen edge.
     * @param yCoordinate the vertical displacement of the Zombie from the top screen edge.
     */
    Plant(int health, int damage, int defaultVelocity, int attackDelay, int brainsWorth,
                 int xCoordinate, int yCoordinate) {
        super(health, damage, defaultVelocity, attackDelay, xCoordinate, yCoordinate);
        this.brainsWorth = brainsWorth;
    }

    int getBrainsWorth() {
        return this.brainsWorth;
    }


}
