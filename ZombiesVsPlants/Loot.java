package com.example.game.backend.ZombiesVsPlants;

/*A loot is dropped when a plant is killed. The player can collect the loot by clicking on it. Once
collected, the player receives coins.
 */
public class Loot extends ScreenItem {

    // The amount of coins this loot is worth.
    private int worthInDollars;
    // The number of frames this loot will stay on screen.
    private int timeUntilDisappear;

    /** Creates a new loot.
     *
     * @param worthInDollars the amount of coins this loot is worth.
     * @param timeUntilDisappear the number of frames this loot will stay on screen.
     * @param xCoordinate the horizontal displacement of the loot from the left screen edge.
     * @param yCoordinate the vertical displacement of the loot from the top screen edge.
     */
    Loot(int worthInDollars, int timeUntilDisappear, int xCoordinate, int yCoordinate) {
        super(0, 0, 0, 1, xCoordinate, yCoordinate);
        this.worthInDollars = worthInDollars;
        this.timeUntilDisappear = timeUntilDisappear;
    }

    public int getWorthInDollars() {
        return this.worthInDollars;
    }

    int getTimeUntilDisappear() {
        return this.timeUntilDisappear;
    }

    void setTimeUntilDisappear(int timeUntilDisappear) {
        this.timeUntilDisappear = timeUntilDisappear;
    }
}
