package com.example.game.backend.ZombiesVsPlants;

import android.widget.ImageView;

import java.util.ArrayList;
import java.util.Random;

// A screen item is a game object that can be created through user actions.
public class ScreenItem {

    // The amount of health the screen item has. Once this is depleted, the screen item is removed.
    private int health;
    // The damage that this screen item does.
    private int damage;
    /* The velocity is positive if the screen item moves from left to right, and is negative if it
    moves from right to left. The magnitude of the velocity is the speed at which the screen item
    object is moving.
    */
    private int currentVelocity;
    // The velocity at which the screen item normally moves at.
    private int defaultVelocity;
    // The number of frames between each attack of the screen item.
    private int attackDelay;
    // The horizontal displacement of the screen item from the left edge of the screen.
    private int xCoordinate;
    // The vertical displacement of the screen item from the bottom edge of the screen.
    private int yCoordinate;
    // The internal counter for the screen item. It is used to time its periodic actions.
    private int counter = 0;
    // The list of projectiles that this screen item has produced.
    private ArrayList<Projectile> projectileList = new ArrayList<>();
    // The screen item that this screen item was spawned from, if any.
    private ScreenItem spawnedFrom;
    // The imageView corresponding to the screen item.
    private ImageView imageView;
    /* The lane that this screen item is in. The lanes are numbered consecutively from 1 to 5 with
    lane 1 being the top lane.
     */
    private int laneNumber;
    /* This determines whether the screen item will deal damage. This is used to keep an animation
    running after a screen item has dealt damage once without it continually dealing more damage.
     */
    private boolean doesDamage = true;

    /** Create a new screen item
     *
     * @param health the health of the screen item.
     * @param damage the damage of the screen item.
     * @param defaultVelocity the velocity of the screen item.
     * @param attackDelay the attackDelay of the screen item.
     * @param xCoordinate the horizontal displacement of the screen item from the left screen edge.
     * @param yCoordinate the vertical displacement of the screen item from the top screen edge.
     */
    ScreenItem(int health, int damage, int defaultVelocity, int attackDelay, int xCoordinate, int
            yCoordinate) {
        this.health = health;
        this.damage = damage;
        this.defaultVelocity = defaultVelocity;
        this.currentVelocity = defaultVelocity;
        this.attackDelay = attackDelay;
        this.xCoordinate = xCoordinate;
        this.yCoordinate = yCoordinate;
        // The lane number is set to be a random integer from 1 to 5.
        Random random = new Random();
        this.laneNumber = random.nextInt(5) + 1;
    }

    void setHealth(int updatedHealth) {
        this.health = updatedHealth;
    }

    int getHealth() {
        return this.health;
    }

    int getDamage() {
        return this.damage;
    }

    public int getXCoordinate() {
        return this.xCoordinate;
    }

    int getYCoordinate() {
        return this.yCoordinate;
    }

    // The coordinates are set together for convenience.
    public void setCoordinates(int xCoordinate, int yCoordinate) {
        this.xCoordinate = xCoordinate;
        this.yCoordinate = yCoordinate;
    }

    int getCounter() {
        return this.counter;
    }

    void incrementCounter() {
        this.counter++;
    }

    void setSpawnedFrom(ScreenItem spawnedFrom) {
        this.spawnedFrom = spawnedFrom;
    }

    int getCurrentVelocity() {
        return this.currentVelocity;
    }

    void setCurrentVelocity(int currentVelocity) {
        this.currentVelocity = currentVelocity;
    }

    int getDefaultVelocity() {
        return this.defaultVelocity;
    }

    int getAttackDelay() {
        return this.attackDelay;
    }

    public ImageView getImageView() {
        return this.imageView;
    }

    public void setImageView(ImageView imageView) {
        this.imageView = imageView;
    }

    ArrayList<Projectile> getProjectileList() {
        return this.projectileList;
    }

    public int getLaneNumber() {
        return this.laneNumber;
    }

    public void setLaneNumber(int laneNumber) {
        this.laneNumber = laneNumber;
    }

    void setImageViewFromCounter() {
    }

    boolean getDoesDamage() {
        return this.doesDamage;
    }

    void setDoesDamage(boolean doesDamage) {
        this.doesDamage = doesDamage;
    }

    /** Returns whether this screen item has collided with another screen item.
     *
     * @param screenItem the screen item whose collision status is to be tested with this screen
     *                   item.
     * @return whether the screen item objects have collided.
     */
    boolean collisionOccurred(ScreenItem screenItem) {
        /* For two screen item objects to collide, they must first be in the same lane. It is then
        determined whether the relative ordering of the x-coordinates of the screen item objects
        have changed. A collision occurs when this change happens for the first time so during the
        frame directly before the collision frame, the relative ordering must be different from
        that of the collision frame.
         */
        // Compare the lane numbers.
        return this.getLaneNumber() == screenItem.getLaneNumber() &&
                // Test the current frame for a change in relative x-coordinate ordering.
                this.getXCoordinate() >= screenItem.getXCoordinate() &&
                // Test the previous frame for a different relative x-coordinate ordering.
                this.getXCoordinate() - this.getDefaultVelocity() < screenItem.getXCoordinate() -
                        screenItem.getDefaultVelocity();
    }

}
