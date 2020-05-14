package com.example.game.backend.ZombiesVsPlants;


public class ZombieFactory {

    public static Zombie getZombie(String zombieType, int xCoordinate, int yCoordinate) {
        switch (zombieType) {
            case "wizardZombie": return new WizardZombie(xCoordinate, yCoordinate);
            case "laserZombie": return new LaserZombie(xCoordinate, yCoordinate);
            case "barrierZombie": return new BarrierZombie(xCoordinate, yCoordinate);
        }
        return null;
    }
}
