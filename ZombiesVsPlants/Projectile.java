package com.example.game.backend.ZombiesVsPlants;

// A projectile can be produced from a zombie to damage plants.
public class Projectile extends ScreenItem {

    /* Whether this projectile has already collided. If it has collided, it may still need to run
    an animation sequence so this is used to record that state.
     */
    private boolean isPostCollision;
    // The amount of time the projectile stays in the post collision state.
    private int postCollisionTime;
    // The counter that increments each frame in which the projectile is in post collision state.
    private int postCollisionCounter;

    /** Creates a new projectile.
     *
     * @param health the health of the projectile.
     * @param damage the damage of the projectile.
     * @param defaultVelocity the default velocity of the projectile.
     * @param postCollisionTime the time the projectile stays after it collides in number of frames.
     * @param xCoordinate the horizontal displacement of the projectile from the left screen edge.
     * @param yCoordinate the vertical displacement of the projectile from the top screen edge.
     */
    Projectile(int health, int damage, int defaultVelocity, int postCollisionTime,
               int xCoordinate, int yCoordinate) {
        super(health, damage, defaultVelocity, 0, xCoordinate, yCoordinate);
        this.postCollisionTime = postCollisionTime;
    }

    int getPostCollisionCounter() {
        return this.postCollisionCounter;
    }

    boolean getIsPostCollision() {
        return this.isPostCollision;
    }

    void setIsPostCollision(boolean isPostCollision) {
        this.isPostCollision = isPostCollision;
    }

    // Increments the post collision counter once the a frame has passed.
    void incrementPostCollisionCounter() {
        this.postCollisionCounter++;
    }

    int getPostCollisionTime() {
        return this.postCollisionTime;
    }
}
