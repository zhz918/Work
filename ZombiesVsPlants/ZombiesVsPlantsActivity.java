package com.example.game.frontend;

import androidx.appcompat.app.AppCompatActivity;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.constraintlayout.widget.ConstraintSet;

import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.res.Resources;
import android.os.Bundle;
import android.os.Handler;
import android.util.DisplayMetrics;
import android.view.View;
import android.widget.ImageView;

import com.example.game.R;

import com.example.game.backend.ZombiesVsPlants.ZombieFactory;
import com.example.game.backend.ZombiesVsPlants.ZombiesVsPlantsRepository;
import com.example.game.backend.ZombiesVsPlants.BarrierZombie;
import com.example.game.backend.ZombiesVsPlants.Carrot;
import com.example.game.backend.ZombiesVsPlants.GiantLettuce;
import com.example.game.backend.ZombiesVsPlants.LaserZombie;
import com.example.game.backend.ZombiesVsPlants.Lettuce;
import com.example.game.backend.ZombiesVsPlants.Loot;
import com.example.game.backend.ZombiesVsPlants.Plant;
import com.example.game.backend.ZombiesVsPlants.Projectile;
import com.example.game.backend.ZombiesVsPlants.Walnut;
import com.example.game.backend.ZombiesVsPlants.WizardZombie;
import com.example.game.backend.ZombiesVsPlants.Zombie;
import com.example.game.backend.ZombiesVsPlants.ZombiesVsPlantsController;

import org.jetbrains.annotations.NotNull;

import java.util.HashMap;

/* This activity starts up when the Zombies Vs. Plants game is launched. It displays the screen
with all the default items on it, defines the buttons, and initializes the screen item positions.
 */
public class ZombiesVsPlantsActivity extends AppCompatActivity {

    // The zombie that is currently selected through one of the panels, or null if none is selected.
    private String selectedZombie;
    // This is true if a zombie is selected using a panel and false otherwise
    private boolean panelSelected = false;
    /* This stores the pairs containing a tile and a corresponding that occupies that tile, if one
    exists.
     */
    private HashMap<View, Zombie> tileToZombieMap = new HashMap<>();
    // This represents a pause or non-pause state of the game, and is true if the game is paused.
    private boolean gamePaused = false;
    /* This is true if the player has not exited the game, and is false otherwise. It is used to
    synchronize the game timer once a player exits the game.
     */
    private boolean gameRunning = true;
    // This is true if the player has fast forwarded the game, and is false otherwise.
    private boolean fastForward = false;
    // This performs all the game logic and is called using its updateFrame method.
    private ZombiesVsPlantsController zvpController;
    /* The Handler and Runnable are paired together to function as a timer. The runnable calls
    again after it runs for a fixed number of seconds. Each time it runs, the frame is updated.
     */
    private Handler zvpTimerHandler = new Handler();
    private Runnable zvpTimerRunnable = new Runnable() {
        @Override
        public void run() {
            // The frame is updated only if the game is not paused and the user has not exited.
            if (!gamePaused && gameRunning) {
                zvpController.updateFrame();
                if (fastForward) {
                    zvpController.updateFrame();
                }
            }
            // Call itself after a fixed number of milliseconds.
            zvpTimerHandler.postDelayed(this, 20);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Get the width of the screen in pixels.
        DisplayMetrics displayMetrics = new DisplayMetrics();
        this.getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
        int width = displayMetrics.widthPixels;
        // Set the screen to be in landscape mode after it has started.
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        // Draw the default layout.
        setContentView(R.layout.activity_zombies_vs_plants);
        int[] plantRarityList = {5, 2, 2, 1};
        /* Add a controller to perform the game logic. The width used include the navigation bar
        height as that space is available once it was removed. The time that the game is started is
        also sent in to determine how long the game has run since it has started.
         */
        zvpController = new ZombiesVsPlantsController(width + getNavigationBarHeight(),
                System.currentTimeMillis(), this, plantRarityList);
        /* Add listeners to each tile on the screen that responds to when a zombie is placed on
        them. */
        addTileListeners();
        /* The following methods programmatically create the back button, pause button, restart
        button, and fast forward button.*/
        createBackButton();
        createPauseButton();
        createRestartButton();
        createFastForwardButton();
        // Programmatically create the zombie selection panels and the remove zombie panel.
        createPanels();
        // This check is to ensure that the onCreate method does not run twice.
        //https://stackoverflow.com/questions/3588682/is-it-normal-for-the-activity-oncreate-method-to-be-called-multiple-times
        if (savedInstanceState != null) {
            zvpTimerHandler.postDelayed(zvpTimerRunnable, 0);
        }

    }

    private void addTileListeners() {
        // Get the root of the layout.
        ConstraintLayout fullLayout = findViewById(R.id.root);
        /* Get all the tile views of the layout so they can be iterated to add a listener to each
        of them.
         */
        //https://stackoverflow.com/questions/7784418/get-all-child-views-inside-linearlayout-at-once
        int childCount = fullLayout.getChildCount();
        for (int i = 0; i < childCount; i++) {
            // Get the tile view that corresponds to this iteration.
            View tileView = findViewById(fullLayout.getChildAt(i).getId());
            /* Adds an onClick listener to the tile view. When the player has selected a zombie
            panel, the listener will respond if the player then clicks that tile. A zombie will then
            be added to that tile.
             */
            tileView.setOnClickListener(new View.OnClickListener() {
                public void onClick(View v) {
                    // A zombie can be added to the tile only if it is not already occupied.
                    if (!tileToZombieMap.containsKey(v))
                        /* Each of these cases represent one type of zombie that is selected. It
                        first be checked if there is enough brains to pay for the zombie. If there
                        is, then the brain cost is subtracted from the total brains and the zombie
                        is placed on the tile.
                         */
                        // Responds to a request to place a wizard zombie.
                        if (panelSelected && selectedZombie.equals("wizardZombie") &&
                                zvpController.sufficientBrains("wizardZombie")) {
                            zvpController.setTotalBrains(zvpController.getTotalBrains() - 100);
                            tileToZombieMap.put(v, addZombie(selectedZombie, v));
                        } // Responds to a request to place a laser zombie.
                        else if (panelSelected && selectedZombie.equals("laserZombie") &&
                                zvpController.sufficientBrains("laserZombie")) {
                            zvpController.setTotalBrains(zvpController.getTotalBrains() - 200);
                            tileToZombieMap.put(v, addZombie(selectedZombie, v));
                        } // Responds to a request to place a barrier zombie.
                        else if (panelSelected && selectedZombie.equals("barrierZombie") &&
                                zvpController.sufficientBrains("barrierZombie")) {
                            zvpController.setTotalBrains(zvpController.getTotalBrains() - 75);
                            tileToZombieMap.put(v, addZombie(selectedZombie, v));
                        }
                    /* If the selected panel is the zombie removal panel, then it will first be
                    checked if the chosen is occupied. If it is, then the zombie on the tile is set
                    to be invisible. The removal lis recorded in the controller and the map.
                     */
                    if (panelSelected && selectedZombie.equals("remove") &&
                            tileToZombieMap.get(v) != null) {
                        tileToZombieMap.get(v).getImageView().setVisibility(View.GONE);
                        zvpController.getZombieList().remove(tileToZombieMap.get(v));
                        tileToZombieMap.remove(v);
                    }
                }
            });
        }
    }

    // Creates the back button functionality.
    private void createBackButton() {
        final ImageView back_button = findViewById(R.id.back_button);
        /* Adds a listener to the back button. When pressed, the button leads back to the activity
        that led to the startup of the game, which is ChooseLevelActivity. The game execution stops
        and the playing time statistic stops updating after the buttons is pressed.
         */
        final ZombiesVsPlantsActivity activity = this;
        back_button.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                // Record that the game has stopped running.
                gameRunning = false;
                Intent intent = new Intent(activity, ChooseLevelActivity.class);
                intent.putExtra("ZVP_PLANTS_KILLED", zvpController.getPlantsKilled());
                intent.putExtra("ZVP_COINS", zvpController.getCoinsCollected());
                intent.putExtra("ZVP_TIME", zvpController.getInGameTime());
                intent.putExtra("SWITCH_GAME", true);
                activity.startActivity(intent);
                // Stop the game from running.
                finish();
            }
        });
    }

    // Creates the pause button functionality.
    private void createPauseButton() {
        final ImageView pause_button = findViewById(R.id.pause_button);
        /* Adds a listener to the pause button. If the game is running when it is pressed, then the
        game will stop running. If the game has stopped running through pressing this button, then
        the game will resume running.
         */
        pause_button.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                // The pause state of the game inverts every time the pause button is pressed.
                if (!gamePaused) {
                    pause_button.setImageResource(R.drawable.pause_button_selected);
                } else {
                    pause_button.setImageResource(R.drawable.pause_button);
                }
                gamePaused = !gamePaused;
            }
        });
    }

    // Creates the restart button functionality.
    private void createRestartButton() {
        final ImageView restart_button = findViewById(R.id.restart_button);

        /* Adds a listener to the restart-button. When pressed, it will restart the game with the
        brains counter reset and all game items removed.
         */
        //https://stackoverflow.com/questions/1397361/how-to-restart-activity-in-android
        restart_button.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                // Restart the activity.
                recreate();
            }
        });
    }

    // Creates the fast forward button functionality.
    private void createFastForwardButton() {
        final ImageView fast_forward_button = findViewById(R.id.fast_forward_button);
        /* Adds a listener to the fast forward button. If the game is already fast forwarded when it
        the button is clicked, the fast forward will be turned off. Otherwise, fast forward will be
        enabled. The images represented the selected and non-selected panels are set depending on
        which of the above cases occur.
         */
        fast_forward_button.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                if (!fastForward) {
                    fast_forward_button.setImageResource(R.drawable.fast_forward_button_selected);
                } else {
                    fast_forward_button.setImageResource(R.drawable.fast_forward_button);
                }
                fastForward = !fastForward;
            }
        });

    }

    /* Adds a listener to the zombie panels. If the panels is the remove zombie panel, then pressing
     it and then pressing a tile with a zombie will remove the zombie from the tile. If there were
     no zombies on the tile, then nothing happens. if the panel is a zombie selection tile, then
     pressing an empty tile will placed a zombie corresponding to the panel type. If a zombie is
     already on the tile, then nothing will happen. If the player selects another panel after
     selecting this panel then this panel becomes deactivated and the other panel activates. If the
     player presses this panel after activating it, it will become deactivated.*/
    private void createPanels() {
        for (String panelType: ZombiesVsPlantsRepository.getPanelTypeList()) {
            // The panel that is being created.
            final ImageView panel = findViewById(ZombiesVsPlantsRepository.getViewIdFromStringMap().
                    get(panelType));
            // This final version is used inside the onClick method.
            final String panelTypeFinal = panelType;
            panel.setOnClickListener(new View.OnClickListener() {
                public void onClick(View v) {
                    if (panelSelected && selectedZombie.equals("panelTypeFinal")) {
                        // No panels are selected after pressing this panel.
                        panelSelected = false;
                        // No panels are selected, which is signified with an empty string.
                        selectedZombie = "";
                        // The selected panel image is replaced with the non-selected panel image.
                        panel.setImageResource(ZombiesVsPlantsRepository.
                                getPanelDrawableFromStringMap().get(panelTypeFinal));
                    } /* Otherwise, this panel has not been selected prior to clicking it. In this
                    case, the selected panel is set to be this panel.*/
                    else {
                            // A panel has been selected so this is set true.
                            panelSelected = true;
                            /* The string key that recognizes the selection of this panel is
                            panelType. It is assigned once the panel is activated. */
                            selectedZombie = panelTypeFinal;
                            /* Set all the panels with the appropriate image after this panel
                            is selected.*/
                            for (String panelType: ZombiesVsPlantsRepository.getPanelTypeList()) {
                                // The panel selected receives the selected panel image.
                                if (panelType.equals(panelTypeFinal)) {
                                    ((ImageView) findViewById(ZombiesVsPlantsRepository.
                                            getViewIdFromStringMap().get(panelType))).
                                            setImageResource(ZombiesVsPlantsRepository.
                                                    getSelectedPanelDrawableFromStringMap().
                                                    get(panelType));
                                } // Every other panel receives the de-selected image.
                                else {
                                    ((ImageView) findViewById(ZombiesVsPlantsRepository.
                                            getViewIdFromStringMap().get(panelType))).
                                            setImageResource(ZombiesVsPlantsRepository.
                                                    getPanelDrawableFromStringMap().get(panelType));
                                }
                            }
                    }
                }
            });
        }
    }

    /** Record the addition of a zombie to the game. The resources necessary to display the zombie
     * are initialized here.
     * @param zombieType the type of zombie that is requested.
     * @param tileView the tile that the zombie is placed on.
     * @return the zombie that was added.
     */
    public Zombie addZombie(String zombieType, View tileView) {
        // The image view that stores the image displaying the zombie.
        ImageView zombieView = new ImageView(this);
        Zombie zombie = ZombieFactory.getZombie(zombieType, tileView.getLeft(), tileView.getBottom());

        if (zombie != null) {
            zombieView.setImageResource(ZombiesVsPlantsRepository.getZombieDrawableFromType(zombieType));
            // The lane of the zombie is set to the lane that corresponds to the tile it is placed.
            zombie.setLaneNumber(ZombiesVsPlantsRepository.getLaneFromTile(tileView.getId()));
            // The zombie image is stored in the Zombie object.
            zombie.setImageView(zombieView);
            // The view corresponds to the tile the zombie was placed on is stored in the Zombie object.
            zombie.setTileView(tileView);

        }

        // Set an ID for the zombie image view so that constraints can be placed on it.
        zombieView.setId(View.generateViewId());
        // Get the layout using the root.
        ConstraintLayout constraintLayout = findViewById(R.id.root);
        // Initialize an empty set of constraints.
        ConstraintSet constraintSet = new ConstraintSet();
        // Add the new zombie view to the layout.
        constraintLayout.addView(zombieView);
        // Copy the original constraints.
        constraintSet.clone(constraintLayout);
        /* Add the constraints for the zombie image view. The view is constrained to the bottom and
        left side of the tile view that the zombie is on.
         */
        constraintSet.connect(zombieView.getId(), ConstraintSet.BOTTOM, tileView.getId(),
                ConstraintSet.BOTTOM, 0);
        constraintSet.connect(zombieView.getId(), ConstraintSet.LEFT, tileView.getId(),
                ConstraintSet.LEFT, 0);
        // Apply the new constraints to the layout.
        constraintSet.applyTo(constraintLayout);
        // Record that this zombie was added to the game in the controller.
        this.zvpController.getZombieList().add(zombie);
        // Return the new zombie.
        return zombie;
    }

    /** Record the addition of a plant to the game. The resources necessary to display the plant are
     * initialized here.
     * @param plant the plant that is added.
     */
    public void addPlant(Plant plant) {
        // The image view that stores the image displaying the zombie.
        ImageView plantView = new ImageView(this);
        /* The image that is set depends on the plant that is chosen. In all cases, the image that
        corresponds to the first frame in the plant's animation cycle is set to be the first. A new
        plant of the request type is created with the x-coordinate and y-coordinate set as the
        parameters given.
         */
        // Set an ID for the plant image view so that constraints can be placed on it.
        plantView.setId(View.generateViewId());
        // Get the layout using the root.
        ConstraintLayout constraintLayout = findViewById(R.id.root);
        // Add the new plant view to the layout.
        constraintLayout.addView(plantView);
        // Record that this plant was added to the game in the controller.
        this.zvpController.getPlantList().add(plant);
        // The plant image is stored in the Plant object.
        plant.setImageView(plantView);
    }

    /** Record the addition of a projectile to the game. The resources necessary to display the
     * the projectile are initialized here.
     * @param projectile the projectile was created.
     * @param xCoordinate the x-coordinate of the projectile.
     * @param yCoordinate the y-coordinate of the projectile.
     */
    public void addProjectile(Projectile projectile, int xCoordinate, int yCoordinate) {
        // The image view that stores the image displaying the projectile.
        ImageView projectileView = new ImageView(this);
        // Set an ID for the projectile image view so that constraints can be placed on it.
        projectileView.setId(View.generateViewId());
        // Get the layout using the root.
        ConstraintLayout constraintLayout = findViewById(R.id.root);
        // Add the new projectile view to the layout.
        constraintLayout.addView(projectileView);
        // Set the coordinates of the projectile to be the parameters given.
        projectile.setCoordinates(xCoordinate, yCoordinate);
        // Record that this projectile was added to the game in the controller.
        this.zvpController.getProjectileList().add(projectile);
        // The projectile image is stored in the Projectile object.
        projectile.setImageView(projectileView);
    }

    /** Record the addition of a loot object to the game. The resources necessary to display the
     * loot object is initialized here.
     * @param loot the loot object that was added.
     */
    public void addLoot(Loot loot) {
        // The image view that stores the image displaying the loot object.
        ImageView lootView = new ImageView(this);
        /* A clone of the loot object that is final so it can be used within the onClick method of
        the loot's listener.
         */
        final Loot lootFinal = loot;
        // Set the image of the Loot object to be the first frame in its animation cycle.
        lootView.setImageResource(R.drawable.gold_coin1);
        // Set an ID for the loot image view so that constraints can be placed on it.
        lootView.setId(View.generateViewId());
        // Get the layout using the root.
        ConstraintLayout constraintLayout = findViewById(R.id.root);
        // Initialize an empty set of constraints.
        ConstraintSet constraintSet = new ConstraintSet();
        // Add the new loot view to the layout.
        constraintLayout.addView(lootView);
        // Copy the original constraints.
        constraintSet.clone(constraintLayout);
        /* Constrain the vertical displacement of the loot using a representative tile of the lane
        this loot is in. The horizontal displacement of the loot is set using its x-coordinate
        attribute.
         */
        constraintSet.connect(lootView.getId(), ConstraintSet.BOTTOM, ZombiesVsPlantsRepository.getTileFromLane(loot.getLaneNumber()), ConstraintSet.BOTTOM, 0);
        constraintSet.connect(lootView.getId(), ConstraintSet.LEFT, R.id.root, ConstraintSet.LEFT,
                loot.getXCoordinate());
        // Apply the new constraints to the layout.
        constraintSet.applyTo(constraintLayout);
        // Record that this loot object was added to the game in the controller.
        this.zvpController.getLootList().add(loot);
        // The loot image is stored in the loot object.
        loot.setImageView(lootView);
        /* An onClickListener is set to respond when the loot is clicked. When the loot is clicked
        the value of the loot is recorded using the resource trackers in the controller.
         */
        lootView.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                // Make the loot invisible once it is selected.
                v.setVisibility(View.GONE);
                // Remove the loot from the loot list of the controller.
                zvpController.getLootList().remove(lootFinal);
                // Increment the total coins by the amount of coins that this loot is worth.
                zvpController.setTotalCoins(zvpController.getTotalCoins() +
                        lootFinal.getWorthInDollars());
                /* Record the loot value for this framed to be used to update the overall
                 statistics.
                 */
                zvpController.setCoinsCollectedDuringFrame(
                        zvpController.getCoinsCollectedDuringFrame() + 30);
            }
        });
    }

    /** Get the height of the navigation bar, which is located parallel to the shorter edge of the
     * screen. The height is the length of the edge not parallel to the shorter edge of the screen.
     * @return the height of the navigation bar.
     */
    //https://stackoverflow.com/questions/20264268/how-do-i-get-the-height-and-width-of-the-android-navigation-bar-programmatically
    private int getNavigationBarHeight() {
        // Create a new object for storing display objects.
        Resources resources = getResources();
        // Get the navigation bar ID.
        int resourceId = resources.getIdentifier("navigation_bar_height", "dimen",
                "android");
        // If the ID is positive, then the navigation bar was found and its height is returned.
        if (resourceId > 0) {
            return resources.getDimensionPixelSize(resourceId);
        }
        // The navigation bar was not found.
        return 0;
    }

    public HashMap<View, Zombie> getTileToZombieMap() {
        return this.tileToZombieMap;
    }

    private void hideSystemUI() {
        // Enables regular immersive mode.
        // For "lean back" mode, remove SYSTEM_UI_FLAG_IMMERSIVE.
        // Or for "sticky immersive," replace it with SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        View decorView = getWindow().getDecorView();
        decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE
                        // Set the content to appear under the system bars so that the
                        // content doesn't resize when the system bars hide and show.
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        // Hide the nav bar and status bar
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemUI();
        }
    }

    @Override
    public void onBackPressed() {
    }
}
