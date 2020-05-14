package com.example.game.backend.ZombiesVsPlants;

import android.view.View;

// A zombie can be placed on a tile to shoot at plants.
public class Zombie extends ScreenItem {

    // The cost of placing this zombie on a tile.
    private int brainsCost;
    // The view corresponding to the tile that this zombie is placed on.
    private View tileView;

    /** Creates a new zombie.
     *
     * @param health the health of the zombie.
     * @param damage the damage of the zombie.
     * @param defaultVelocity the default velocity of the zombie.
     * @param attackDelay the attack delay of the zombie in frames.
     * @param brainsCost the brain cost of placing the zombie.
     * @param xCoordinate the horizontal displacement of the zombie from the left screen edge.
     * @param yCoordinate the vertical displacement of the zombie from the top screen edge.
     */
    public Zombie(int health, int damage, int defaultVelocity, int attackDelay, int brainsCost,
                  int xCoordinate, int yCoordinate) {
        super(health, damage, defaultVelocity, attackDelay, xCoordinate, yCoordinate);
        this.brainsCost = brainsCost;
    }

    View getTileView() {
        return this.tileView;
    }

    public void setTileView(View tileView) {
        this.tileView = tileView;
    }

}
