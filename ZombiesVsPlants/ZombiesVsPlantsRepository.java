package com.example.game.backend.ZombiesVsPlants;

import com.example.game.R;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

public class ZombiesVsPlantsRepository {

    public static int getZombieDrawableFromType(String zombieType) {
        switch (zombieType) {
            case "wizardZombie": return R.drawable.wizard_zombie1;
            case "laserZombie": return R.drawable.laser_zombie1;
            case "barrierZombie": return R.drawable.barrier_zombie1;
        }
        return 0;
    }

    /** Get a representative tile given a lane number. The representative tile in a lane is the
     * leftmost tile in that lane.
     * @param laneNumber the lane number whose representative tile is requested.
     * @return the ID corresponding to the representative tile.
     */
    public static int getTileFromLane (int laneNumber) {
        /* Each of the lane numbers are tested to see if it is the one requested. If it is, then the
        ID of the representative tile is returned.
         */
        // Lane 1 was requested.
        if (laneNumber == 1) {
            return R.id.tile0;
        } // Lane 2 was requested.
        else if (laneNumber == 2) {
            return R.id.tile12;
        } // Lane 3 was requested.
        else if (laneNumber == 3) {
            return R.id.tile24;
        } // Lane 4 was requested.
        else if (laneNumber == 4) {
            return R.id.tile36;
        } // The only lane left is lane 5 so this is the lane requested.
        else {
            return R.id.tile48;
        }
    }

    /** Get the lane number of a tile. There five lanes each containing twelve tiles. The lanes are
     * are number consecutively from 1 to 5 where lane 1 is the top lane.
     * @param tileId the ID of the tile whose land is requested.
     * @return the lane number of the tile.
     */
    public static int getLaneFromTile (int tileId) {
        // These arrays stored the tiles ID corresponding a lane number.
        // Stores the tiles corresponding to lane 1.
        final int[] LANE_ONE_TILES = {R.id.tile0, R.id.tile1, R.id.tile2, R.id.tile3, R.id.tile4,
                R.id.tile5, R.id.tile6, R.id.tile7, R.id.tile8, R.id.tile9, R.id.tile10,
                R.id.tile11};
        // Stores the tiles corresponding to lane 2.
        final int[] LANE_TWO_TILES = {R.id.tile12, R.id.tile13, R.id.tile14, R.id.tile15,
                R.id.tile16, R.id.tile17, R.id.tile18, R.id.tile19, R.id.tile20, R.id.tile21,
                R.id.tile22, R.id.tile23};
        // Stores the tiles corresponding to lane 3.
        final int[] LANE_THREE_TILES = {R.id.tile24, R.id.tile25, R.id.tile26, R.id.tile27,
                R.id.tile28, R.id.tile29, R.id.tile30, R.id.tile31, R.id.tile32, R.id.tile33,
                R.id.tile34, R.id.tile35};
        // Stores the tiles corresponding to lane 4.
        final int[] LANE_FOUR_TILES = {R.id.tile36, R.id.tile37, R.id.tile38, R.id.tile39,
                R.id.tile40, R.id.tile41, R.id.tile42, R.id.tile43, R.id.tile44, R.id.tile45,
                R.id.tile46, R.id.tile47};
        /* Each of the sets of tiles is searched for the ID of the requested tile. Once the tile is
        found the lane number corresponding to the set where this tile is once is returned.
         */
        // The tile requested is in lane 1.
        if (linearSearch(LANE_ONE_TILES, tileId)) {
            return 1;
        } // The tile requested is in lane 2.
        else if (linearSearch(LANE_TWO_TILES, tileId)) {
            return 2;
        } // The to;e requested is in lane 3.
        else if (linearSearch(LANE_THREE_TILES, tileId)) {
            return 3;
        } // The tile requested is in lane 4.
        else if (linearSearch(LANE_FOUR_TILES, tileId)) {
            return 4;
        } // The only lane left is lane 5 so the tile requested is in lane 5.
        else {
            return 5;
        }
    }

    /** Searches in an integer array for a search key. The array is iterated over and if the
     * requested element is found, then true is returned. Otherwise, false is returned.
     * @param intArray the array to the searched in.
     * @param searchValue the value to be searched for.
     * @return true if the value was found and false otherwise.
     */
    private static boolean linearSearch(int[] intArray, int searchValue) {
        /* Iterate over the elements of the array and compared each element to the search key. If it
        matches the search key, then it is known that the array contains the search key.
         */
        for (int element: intArray) {
            if (element == searchValue) {
                return true;
            }
        }
        /* If none of the elements searched returned true, then the search key is not the in array.
         */
        return false;
    }

    public static ArrayList<String> getZombieTypeList() {
        return new ArrayList<> (Arrays.asList("wizardZombie", "laserZombie", "barrierZombie"));
    }

    public static ArrayList<String> getPanelTypeList() {
        return new ArrayList<> (Arrays.asList("remove", "wizardZombie", "laserZombie", "barrierZombie"));
    }

    public static HashMap<String, Integer> getViewIdFromStringMap () {
        HashMap<String, Integer> viewIdFromStringMap = new HashMap<>();
        viewIdFromStringMap.put("remove", R.id.remove_zombie_panel);
        viewIdFromStringMap.put("wizardZombie", R.id.wizard_zombie_panel);
        viewIdFromStringMap.put("laserZombie", R.id.laser_zombie_panel);
        viewIdFromStringMap.put("barrierZombie", R.id.barrier_zombie_panel);
        return viewIdFromStringMap;
    }

    public static HashMap<String, Integer> getPanelDrawableFromStringMap () {
        HashMap<String, Integer> panelDrawableFromStringMap = new HashMap<>();
        panelDrawableFromStringMap.put("remove", R.drawable.remove_zombie_panel);
        panelDrawableFromStringMap.put("wizardZombie", R.drawable.wizard_zombie_panel);
        panelDrawableFromStringMap.put("laserZombie", R.drawable.laser_zombie_panel);
        panelDrawableFromStringMap.put("barrierZombie", R.drawable.barrier_zombie_panel);
        return panelDrawableFromStringMap;
    }

    public static HashMap<String, Integer> getSelectedPanelDrawableFromStringMap () {
        HashMap<String, Integer> panelDrawableFromStringMap = new HashMap<>();
        panelDrawableFromStringMap.put("remove", R.drawable.remove_zombie_selected_panel);
        panelDrawableFromStringMap.put("wizardZombie", R.drawable.wizard_zombie_selected_panel);
        panelDrawableFromStringMap.put("laserZombie", R.drawable.laser_zombie_selected_panel);
        panelDrawableFromStringMap.put("barrierZombie", R.drawable.barrier_zombie_selected_panel);
        return panelDrawableFromStringMap;
    }
}
