package com.example.game.backend.ZombiesVsPlants;

import java.util.Random;

/* This class enables the retrieval of a spawned plant given a set of rarity values representing
the frequency of appearance of each plant type during the game.
 */
class PlantSpawnQueue {
    /* The set of rarity values for each plant. A higher rarity value means the more is more common
    to spawn. The spawn rate for each plant is directly proportional to its rarity value. */
    private int[] rarityList;
    /* The width of the screen in pixels. This is used to initialize the spawned plant to the right
    screen edge. */
    private int width;

    /** Creates a new PlantSpawnQueue.
     *
     * @param rarityList the set of rarity values for each plant. The order from lowest index to
     *                   highest index is lettuce, giant lettuce, walnut, and carrot.
     * @param width the width of the screen in pixels.
     */
    PlantSpawnQueue(int[] rarityList, int width) {
        this.rarityList = rarityList;
        this.width = width;
    }

    /** Spawns a plant according to the rarity list.
     *
     * @return the plant generated using the rarity list.
     */
    Plant spawnPlant() {
        /* Get the cumulative rarity list used to assign blocks of a single range of number to
        the plants representing their chance of spawning.
         */
        int[] cumulativeRarityList = getCumulativeRarityList();
        /* The sum of all the rarities. The range from 0 to this number is divided into blocks
        corresponding to a plant.
         */
        int rarityPool = cumulativeRarityList[cumulativeRarityList.length - 1];
        // Generate a random integer from 0 to the cumulative rarity.
        Random plantSpawnRandom = new Random();
        int plantSpawnSpinner = plantSpawnRandom.nextInt(rarityPool);
        /* For each plant type, the plant is spawned if and only if the random number generated
        falls within a block of numbers whose length is the rarity of the plant. The blocks of
        numbers are all disjoint.
         */
        // Check is a lettuce should be spawned.
        if (0 <= plantSpawnSpinner && plantSpawnSpinner < cumulativeRarityList[0]) {
            return new Lettuce(width, 0);
        } // Check if a giant lettuce should be spawned.
        else if (plantSpawnSpinner <= cumulativeRarityList[0] && plantSpawnSpinner < cumulativeRarityList[1]) {
            return new GiantLettuce(width, 0);
        } // Check if a walnut should be spawned.
        else if (plantSpawnSpinner <= cumulativeRarityList[1] && plantSpawnSpinner < cumulativeRarityList[2]) {
            return new Walnut(width, 0);
        } // The only plant type left is the carrot so a carrot is spawned.
        else {
            return new Carrot(width, 0);
        }
    }

    /* This creates a new array whose elements are the sum of the rarities of all the plants of the
    original rarity list from the first plant up to the plant in that element's position.
     */
    private int[] getCumulativeRarityList() {
        // This is used to keep track of the sum of the elements added so far.
        int count = 0;
        /* This is the array that stores the cumulative rarities up to a certain point in the
        original rarity list.
         */
        int[] cumulativeRarityList = new int[rarityList.length];
        /* For each element of the original rarity list, add it to the sum of the rarities preceding
        it. The resulting cumulative rarity is stored in the cumulative rarity array at the position
        of the element.
         */
        for (int i = 0; i <= rarityList.length - 1; i++) {
            // Add the current rarity to the running total.
            count += rarityList[i];
            // Insert the updated cumulative rarity into the cumulative rarity list.
            cumulativeRarityList[i] = count;
        }
        return cumulativeRarityList;
    }
}
