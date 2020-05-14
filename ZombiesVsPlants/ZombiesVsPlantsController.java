package com.example.game.backend.ZombiesVsPlants;

import android.view.View;
import android.widget.TextView;

import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.constraintlayout.widget.ConstraintSet;

import com.example.game.R;
import com.example.game.backend.PermanentStatistics;
import com.example.game.frontend.ZombiesVsPlantsActivity;

import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.Locale;

/* This class performs all of the logic of the game such as re-positioning the screen items,
detecting collisions, spawning new screen items, and updating resource trackers.
 */
public class ZombiesVsPlantsController {
    // The number of brains the player has left.
    private int totalBrains = 1000;
    // The time the previous frame was started.
    private long previousFrameMillis;
    // The number of plants killed during the current frame;
    private int plantKillsDuringFrame;
    // The number of coins collected during the current frame;
    private int coinsCollectedDuringFrame;
    // The amount of playing time added by the current frame;
    private long playingTimeDuringFrame;
    /* The following arrays store the current zombies, plants, projectiles, and loot currently in
    play. */
    private ArrayList<Zombie> zombieList = new ArrayList<>();
    private ArrayList<Plant> plantList = new ArrayList<>();
    private ArrayList<Projectile> projectileList = new ArrayList<>();
    private ArrayList<Loot> lootList = new ArrayList<>();
    /* The following arrays store the zombies, plants, projectiles, and loot that are set to be
    removed. */
    private ArrayList<Zombie> removedZombieList = new ArrayList<>();
    private ArrayList<Plant> removedPlantList = new ArrayList<>();
    private ArrayList<Projectile> removedProjectileList = new ArrayList<>();
    private ArrayList<Loot> removedLootList = new ArrayList<>();
    // The activity that uses this controller;
    private ZombiesVsPlantsActivity activity;
    private PlantSpawnQueue plantSpawnQueue;
    // The number of frames that have passed since starting the game;
    private int counter = 0;

    private int plantsKilled = 0;
    private int coinsCollected = 0;
    private long inGameTime = 0;

    /** Creates a new ZombiesVsPlantsController by specifying a screen size, the start time, and an
        associated activity.
     * @param width the width in pixels of the screen.
     * @param startTime the time the game was started in milliseconds.
     * @param activity the activity that uses this controller.
     */

    public ZombiesVsPlantsController(int width, long startTime,
                                     ZombiesVsPlantsActivity activity, int[] plantRarityList) {
        this.previousFrameMillis = startTime;
        this.activity = activity;
        this.plantSpawnQueue = new PlantSpawnQueue(plantRarityList, width);
    }

    public ArrayList<Zombie> getZombieList() {
        return this.zombieList;
    }

    public ArrayList<Plant> getPlantList() {
        return this.plantList;
    }

    public ArrayList<Projectile> getProjectileList() {
        return this.projectileList;
    }

    public ArrayList<Loot> getLootList() {
        return this.lootList;
    }

    public int getTotalBrains() {
        return this.totalBrains;
    }

    public void setTotalBrains(int totalBrains) {
        this.totalBrains = totalBrains;
    }

    public long getTotalCoins() {
        return this.coinsCollected;
    }

    public void setTotalCoins(long totalCoins) {
        this.coinsCollected = (int)totalCoins;
    }

    public int getCoinsCollectedDuringFrame() {
        return this.coinsCollectedDuringFrame;
    }

    public void setCoinsCollectedDuringFrame(int coinsCollectedDuringFrame) {
        this.coinsCollectedDuringFrame = coinsCollectedDuringFrame;
    }

    // Updates the current frame.
    public void updateFrame() {
        // The time since the start of the game this frame occurs at.
        long currentFrameMillis = System.currentTimeMillis();
        // The time that has elapsed between this frame and the previous frame.
        playingTimeDuringFrame = currentFrameMillis - previousFrameMillis;
        // Set the previous frame to be the current frame for the next update.
        previousFrameMillis = currentFrameMillis;

        /* If the player has lost, updateFrame stops being called and the game over screen is
        displayed.*/
        if (playerLost()) {
            runGameOverSequence();
            return;
        }

        // If the number of frames specified by the spawn delay has passed, then spawn a plant.
        if (counter % 9 == 0) {
            this.activity.addPlant(plantSpawnQueue.spawnPlant());
        }
        // Check for collisions between plants and projectiles.
        runPlantProjectileCollisionSequence();
        // Update the projectile images and the removed projectiles.
        updateProjectileStatus();
        // Check for collisions between plants and zombies.
        runPlantZombieCollisionSequence();
        // Update the loot images and the removed loot.
        updateLootStatus();
        // Remove all the objects that are in the removed lists and reset these lists.
        updateObjectLists();
        // Create projectiles for each zombie according to their attack delays.
        createZombieProjectiles();
        // Update the locations of all the projectiles according to their velocity.
        updateProjectilePositions();
        // Update the location of all the plants according to their velocity.
        updatePlantPositions();
        // Update the brains and coin trackers displayed on screen.
        updateResourceTrackers();
        // Update the statistics using the events from this frame.
        updatePermanentStatistics(plantKillsDuringFrame, coinsCollectedDuringFrame,
                playingTimeDuringFrame);
        // Reset the statistic trackers to be used for the next frame.
        resetFrameStatisticCounters();
        // Update the counters for all the screen items and the controller.
        updateCounters();
    }

    /** Detects if the player has lost.
     *
     * @return if the player has lost.
     */
    private boolean playerLost() {
        /* For each plant, determine if it has crossed the left screen edge. A lost will be
        if any plant moves over the left screen edge.
         */
        for (Plant plant : plantList) {
            if (plant.getXCoordinate() < 0) {
                return true;
            }
        }
        return false;
    }

    // Determine the collisions that have occurred between the plants and projectiles.
    private void runPlantProjectileCollisionSequence() {
        // For each pair of plants and projectiles, a collision test is performed.
        for (Plant plant : plantList) {
            for (Projectile projectile : projectileList) {
                /* If the projectile has been detected to hit a plant in a previous iteration, skip
                this iteration.
                 */
                if (removedProjectileList.contains(projectile)) {
                    continue;
                }
                // This is the first time the projectile has hit a plant.
                if (projectile.collisionOccurred(plant)) {
                    // The projectile is assigned post collision status.
                    projectile.setIsPostCollision(true);
                    /* The projectile may still running its animation, in which case it will not
                    do damage. If it does still do damage, decrease the plant's health by that
                    damage.
                     */
                    if (projectile.getDoesDamage()) {
                        // The plant's health is always non-negative.
                        plant.setHealth(Math.max(0, plant.getHealth() - projectile.getDamage()));
                    }
                    // Remove this plant if it has no health left.
                    if (plant.getHealth() == 0) {
                        /* Add the number of brains this plant is worth to the brains counter.
                         */
                        this.totalBrains += plant.getBrainsWorth();
                        // Set the plant to be invisible.
                        plant.getImageView().setVisibility(View.GONE);
                        // Update the list of removed plants with this plant.
                        removedPlantList.add(plant);
                        // Run the chance of the plant dropping loot.
                        dropLoot(plant);
                        // Update the number of plant kills during this frame.
                        plantKillsDuringFrame++;
                    }
                }
            }
        }
    }

    /* Update the visibility of each projectile according to whether it has collided and the time
    since it has collided.
     */
    private void updateProjectileStatus() {
        for (Projectile projectile : projectileList) {
            // If the projectile has already collided and it has finished its animation, removed it.
            if (projectile.getIsPostCollision() && projectile.getPostCollisionCounter() ==
                    projectile.getPostCollisionTime()) {
                removedProjectileList.add(projectile);
                // Set the projectile to be invisible.
                projectile.getImageView().setVisibility(View.GONE);
            }
        }
    }

    // Determine for each plant and zombie pair whether they have collided.
    private void runPlantZombieCollisionSequence() {
        for (Plant plant : plantList) {
            for (Zombie zombie : zombieList) {
                // If the zombie has collided with a plant, the plant stops moving.
                if (zombie.collisionOccurred(plant)) {
                    plant.setCurrentVelocity(0);
                    // The plant deals damage to the zombie according to its attack delay.
                    if (plant.getCounter() % plant.getAttackDelay() == 0) {
                        // The zombie's health is always non-negative.
                        zombie.setHealth(Math.max(0, zombie.getHealth() - plant.getDamage()));
                    }
                }
                // Remove the zombie if it has no health left.
                if (zombie.getHealth() == 0) {
                    // Make the zombie invisible.
                    zombie.getImageView().setVisibility(View.GONE);
                    removedZombieList.add(zombie);
                    // Remove the pairing of the zombie to the tile it was on.
                    this.activity.getTileToZombieMap().remove(zombie.getTileView());
                }
            }
        }
    }

    // Update the image and expiry status of each loot object.
    private void updateLootStatus() {
        for (Loot loot : lootList) {
            // Remove the loot if it has stayed on screen for longer than its maximum screen time.
            int timeUntilDisappear = loot.getTimeUntilDisappear();
            // Decrement the number of frames left until the loot disappears.
            loot.setTimeUntilDisappear((Math.max(0, timeUntilDisappear - 1)));
            // If the loot has expired, make it invisible and add it to the removed loot list.
            if (loot.getTimeUntilDisappear() == 0) {
                loot.getImageView().setVisibility(View.GONE);
                removedLootList.add(loot);
            }
        }
    }


    // Update the lists containing the objects and the removed objects.
    private void updateObjectLists() {
        /* For each screen item type, remove all the elements of it that have been determined to be
        removed for the next frame using the methods called before.*/
        zombieList.removeAll(removedZombieList);
        plantList.removeAll(removedPlantList);
        projectileList.removeAll(removedProjectileList);
        lootList.removeAll(removedLootList);

        // Reset all the removed objects lists for the next frame.
        removedZombieList.clear();
        removedPlantList.clear();
        removedProjectileList.clear();
        removedLootList.clear();
    }

    // Create a projectile for each zombie on screen if the zombie's attack delay time has passed.
    private void createZombieProjectiles() {
        for (Zombie zombie : zombieList) {
            // Update the zombie with the image set for this frame in its animation cycle.
            zombie.setImageViewFromCounter();
            /* If the zombie attack delay time has passed and there is a plant in front of the
            zombie in the lane the zombie is in, create a projectile.*/
            if (zombie.getCounter() % zombie.getAttackDelay() == 0 && existsPlantInFront(zombie)) {
                Projectile projectile = new Projectile(0, 0, 0,
                        0, 0, 0);
                // If the zombie if a wizard zombie, create a small magical ball.
                if (zombie instanceof WizardZombie) {
                    projectile = new SmallMagicalBall(zombie.getXCoordinate(),
                            zombie.getYCoordinate());
                } // If the zombie is a laser zombie, create a laser beam.
                else if (zombie instanceof LaserZombie) {
                    projectile = new LaserBeam(zombie.getXCoordinate(), zombie.getYCoordinate());
                }
                // Set the projectile to be spawned from the zombie.
                projectile.setSpawnedFrom(zombie);
                // Set the lane of the projectile to the be lane of the zombie.
                projectile.setLaneNumber(zombie.getLaneNumber());
                // Add the projectile to the zombie's projectile list.
                zombie.getProjectileList().add(projectile);
                // Record the projectile in the activity to set its constraints.
                this.activity.addProjectile(projectile, zombie.getXCoordinate(),
                        zombie.getYCoordinate());
            }
        }
    }

    // Update the location of each projectile according to its velocity.
    private void updateProjectilePositions() {
        for (Projectile projectile : projectileList) {
            // Update the zombie with the image set for this frame in its animation cycle.
            projectile.setImageViewFromCounter();
            // Reset the projectile's coordinates according to its velocity.
            projectile.setCoordinates(projectile.getXCoordinate() +
                    projectile.getCurrentVelocity(), projectile.getYCoordinate());
            // Create the set of constraints for the projectile view within the screen.
            ConstraintLayout constraintLayout = this.activity.findViewById(R.id.root);
            ConstraintSet constraintSet = new ConstraintSet();
            // Copy the current layout constraints.
            constraintSet.clone(constraintLayout);
            // Constrain the projectile to the height of the lane it is in.
            constraintSet.connect(projectile.getImageView().getId(), ConstraintSet.BOTTOM,
                    ZombiesVsPlantsRepository.getTileFromLane(projectile.getLaneNumber()),
                    ConstraintSet.BOTTOM, 0);
            /* Constrain the projectile to the left side of the screen with a distance given by its
            x-coordinate.
             */
            constraintSet.connect(projectile.getImageView().getId(), ConstraintSet.LEFT, R.id.root,
                    ConstraintSet.LEFT, projectile.getXCoordinate());
            // Apply the updated constraints to the layout.
            constraintSet.applyTo(constraintLayout);
        }
    }

    // Update the locations of each plant according to its velocity.
    private void updatePlantPositions() {
        for (Plant plant : plantList) {
            // Update the plant with the image set for this frame in its animation cycle.
            plant.setImageViewFromCounter();
            // Reset the projectile's coordinates according to its velocity.
            plant.setCoordinates(plant.getXCoordinate() + plant.getCurrentVelocity(),
                    plant.getYCoordinate());
            // Reset the projectile's speed to its default for the next frame.
            plant.setCurrentVelocity(plant.getDefaultVelocity());
            // Create the set of constraints for the projectile view within the screen.
            ConstraintLayout constraintLayout = this.activity.findViewById(R.id.root);
            ConstraintSet constraintSet = new ConstraintSet();
            // Copy the current layout constraints.
            constraintSet.clone(constraintLayout);
            // Constrain the plant to the height of the lane it is in.
            constraintSet.connect(plant.getImageView().getId(), ConstraintSet.BOTTOM,
                    ZombiesVsPlantsRepository.getTileFromLane(plant.getLaneNumber()),
                    ConstraintSet.BOTTOM, 0);
            /* Constrain the plant to the left side of the screen with a distance given by its
            x-coordinate.
             */
            constraintSet.connect(plant.getImageView().getId(), ConstraintSet.LEFT, R.id.root,
                    ConstraintSet.LEFT, plant.getXCoordinate());
            // Apply the updated constraints to the layout.
            constraintSet.applyTo(constraintLayout);
        }
    }

    // Update the brains and coins displays using the updated trackers from this frame.
    private void updateResourceTrackers() {
        /* Set the text of the view corresponding to the brains and coins counters using the
        updated values.
         */
        ((TextView) this.activity.findViewById(R.id.total_brains)).setText(String.format(
                Locale.CANADA, "Brains: %d", totalBrains));
        ((TextView) this.activity.findViewById(R.id.total_money)).setText(String.format(
                Locale.CANADA, "Coins: %d", coinsCollected));
    }

    /* Update the statistics that are displayed in the main menu. The plant kill statistics is
    recorded for this game only while the total coins, current coins, and total playing time
    are recorded across all the games.
     */
    private void updatePermanentStatistics(int plantKillsDuringFrame,
                                           int coinsCollectedDuringFrame,
                                           long playingTimeDuringFrame) {
        plantsKilled += plantKillsDuringFrame;
        coinsCollected += coinsCollectedDuringFrame;
        inGameTime += playingTimeDuringFrame;
    }

    // Reset the statistic counters for the next frame.
    private void resetFrameStatisticCounters() {
        plantKillsDuringFrame = 0;
        coinsCollectedDuringFrame = 0;
        playingTimeDuringFrame = 0;
    }

    // Increment the internal counter for each screen item and the controller.
    private void updateCounters() {
        for (Plant plant : plantList) {
            plant.incrementCounter();
        }

        for (Projectile projectile : projectileList) {
            projectile.incrementCounter();
            /* If the projectile has been assigned post collision status, increment its separate
            post collision counter.
             */
            if (projectile.getIsPostCollision()) {
                projectile.incrementPostCollisionCounter();
            } /* If the projectile has collided in this frame, it will be set to do no damage from
                this point on. */
            if (projectile.getPostCollisionCounter() == 1) {
                projectile.setDoesDamage(false);
            }
        }

        for (Zombie zombie : zombieList) {
            /* If there is a plant in the same lane in front of the zombie, the zombie is active
            so its counter is updated. Otherwise, the zombie will be in recharging mode for when the
            next plant comes so its counter will be incremented until it is able to fire immediately
            when the next plant comes.
             */
            if (existsPlantInFront(zombie) || zombie.getCounter() % zombie.getAttackDelay() != 0) {
                zombie.incrementCounter();
            }
        }

        for (Loot loot : lootList) {
            // Set the loot item with the image in this frame in its animation cycle.
            loot.setImageViewFromCounter();
            loot.incrementCounter();
        }

        // Increment the controller's counter for plant spawning.
        counter++;
    }

    /** Determines if there exists a plant in front of the zombie in its same lane. If there is a
     * such a plant, then the zombie is set to start shooting.
     * @param zombie the zombie being that is being tested for if a plant exists in front of it.
     * @return if there exists a plant in front of the zombie in the lane of the zombie.
     */
    private boolean existsPlantInFront(Zombie zombie) {
        /* For each plant, if the plant is both in front of the zombie and has the same lane number
        as the number, then this plant will trigger the zombie to shoot. */
        for (Plant plant : this.plantList) {
            if (zombie.getLaneNumber() == plant.getLaneNumber() && zombie.getXCoordinate() <
                    plant.getXCoordinate()) {
                return true;
            }
        }
        return false;
    }

    /** Drop loot after each plant kill.
     *
     * @param plant the plant that has been killed and may drop loot.
     */
    private void dropLoot(Plant plant) {
        double lootSpinner = Math.random();

        // Spawn each loot type with a certain rarity.
        if (lootSpinner < 0.5) {
            /* Create a new gold coin and set it to be spawned from the plant and its lane number
            to be that of the plant it is spawned from.
             */
            GoldCoin goldCoin = new GoldCoin(plant.getXCoordinate(), plant.getYCoordinate());
            goldCoin.setSpawnedFrom(plant);
            goldCoin.setLaneNumber(plant.getLaneNumber());
            // Record the new loot in the activity.
            this.activity.addLoot(goldCoin);
        }
    }

    /** Determines if there is sufficient brains to pay for the cost of placing a zombie.
     *
     * @param zombieType the type of zombie that is being placed.
     * @return if there is sufficient brains to place the zombie.
     */
    public boolean sufficientBrains(@NotNull String zombieType) {
        /* Compare the total brains amount with the cost of the requested zombie type to determine
        if there are sufficient brains.
         */
        if (zombieType.equals("wizardZombie") && this.getTotalBrains() >= 100) {
            return true;
        } else if (zombieType.equals("laserZombie") && this.getTotalBrains() >= 200) {
            return true;
        } else if (zombieType.equals("barrierZombie") && this.getTotalBrains() >= 75) {
            return true;
        } else {
            return false;
        }
    }

    // When the player has lost, a game over screen will display.
    private void runGameOverSequence() {
        // Create a new game over text view and set its content and size.
        TextView gameOverText = new TextView(this.activity);
        gameOverText.setText("Game over");
        gameOverText.setTextSize(72);
        // Assign an ID to the text view.
        gameOverText.setId(View.generateViewId());

        // Copy the current set of constraints.
        ConstraintLayout activityLayout = this.activity.findViewById(R.id.root);
        ConstraintSet constraintSet = new ConstraintSet();
        // Add the text view to the current layout.
        activityLayout.addView(gameOverText);
        constraintSet.clone(activityLayout);
        // Make the game over text centered on the score.
        constraintSet.centerVertically(gameOverText.getId(), activityLayout.getId());
        constraintSet.centerHorizontally(gameOverText.getId(), activityLayout.getId());
        // Apply the new constraints to the layout.
        constraintSet.applyTo(activityLayout);
    }

    public int getPlantsKilled() {
        return plantsKilled;
    }

    public int getCoinsCollected() {
        return coinsCollected;
    }

    public long getInGameTime() {
        return inGameTime;
    }
}