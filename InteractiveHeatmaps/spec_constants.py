import math
from collections import defaultdict
import numpy as np
import pandas as pd
import pickle
from skimage import io
import bz2
from datetime import date
from numpy import genfromtxt
from datetime import date

# This file contains constants used in the visualization, data generation, and zone generation notebooks that are
# stored here and imported into the notebook using them so the constants needs to be defined only once.

# The number of rows and columns of the grid used to divide each scene.
ROWS = 24
COLUMNS = 32
# The number of days used for each dwell time sampling.
TIME_INTERVAL = 1
# Dimensions of the images for each area.
IMAGE_HEIGHT = 480
IMAGE_WIDTH = 640
# The dimensions of each zone.
ZONE_HEIGHT = int(IMAGE_HEIGHT/ROWS)
ZONE_LENGTH = int(IMAGE_WIDTH/COLUMNS)
# The total number of zones.
ZONE_NUM = ROWS * COLUMNS
# There are 325 days in the range the cameras are on, which is from February 20th, 2019 to January 11th, 2020.
TOTAL_DAYS = 325
# The number of days being tracked.
FRAMES = math.ceil(TOTAL_DAYS/TIME_INTERVAL)
# The number of areas being tracked.
NUM_CAMERAS = 3

# The object classes whose data is queried in the order of the visualization object type selector dropdowns.
OBJECT_CLASSES = ["pedestrian", "bicycle", "car", "bus", "truck"]
# The object classes in the alphabetical order returned by the queries.
OBJECT_CLASSES_QUERY = ["bicycle", "bus", "car", "pedestrian", "truck"]
# Capitalize each of the object classes to be displayed in the object type selector dropdown.
OBJECT_CLASSES_CAPITALIZED = [object_class.capitalize() for object_class in OBJECT_CLASSES]
# Convert the capitalized object type from user input to a lower-case version that can be used to index the data array.
OBJECT_CLASSES_CONVERTER = {OBJECT_CLASSES_CAPITALIZED[i]: OBJECT_CLASSES[i] for i in range(len(OBJECT_CLASSES))}
# The number of object types.
NUM_OBJECTS = len(OBJECT_CLASSES)

# The metrics displayed by the day heatmap.
METRICS = ['Object Count', 'Mean Dwell Time']
# The number of metrics displayed in the day heatmap.
NUM_METRICS = len(METRICS)
# The metrics displayed in the zone heatmap..
EXTENDED_METRICS = ['Object Count', 'Mean Dwell Time', 'Cumulative Count', 'Absorption Index']
# The number of metrics displayed in the zone heatmap.
NUM_EXTENDED_METRICS = len(EXTENDED_METRICS)

# The IDs of the zones constructed containing the entire area tracked by the three sensors.
AREA_IDS = [27428, 27429, 27430]
# The three areas tracked by the cameras
SCENE_IMAGE_NAMES = ['./Zehao-files/scene2.jpg', './Zehao-files/scene3.jpg', './Zehao-files/scene1.jpg']
# The arrays of numbers corresponding to the images of the areas tracked.
PROCESSED_SCENE_IMAGES = [io.imread(img_name, as_gray=True) for img_name in SCENE_IMAGE_NAMES]

# Used in the area selector dropdown for the heatmaps.
SCENES = ['Streetscape', 'Under Raincoat', 'Outside']
# Converts an area inputted from the user to a value used to index the data arrays and vice versa.
SCENE_TO_NUM = {'Streetscape': 0, 'Under Raincoat': 1, 'Outside': 2}
CAMERA_TO_SCENE = {0: 'Streetscape', 1: 'Under Raincoat', 2: 'Outside'}

# The values for the zone quality selector in the zone heatmap.
ZONE_QUALITIES = ['Highest Values', 'Lowest Values', 'Middle Values']

# The values for the display mode selector in the zone heatmap.
DISPLAY_MODES = ['Relative', 'Absolute']

# Used for displaying the labels on the y-axis of the day heatmap.
WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
# Converts each weekday to an index corresponding to if the weekday of the first day tracked (Wednesday) is assigned
# 0. This is used for manipulating indices when processing the weekday for the zone heatmap.
WEEKDAYS_TO_NUM = {WEEKDAYS[(num + 2) % len(WEEKDAYS)]: num for num in range(len(WEEKDAYS))}
# The values for the weekday selector in the zone heatmap.
WEEKDAYS_DROPDOWN = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

# The days when the sensors start and end tracking activity.
START_DATE = date(2019, 2, 20)
END_DATE = date(2020, 1, 10)

# The dates of the events that are tracked by the heatmaps.
EVENT_DATES = [date(2019, 3, 2), date(2019, 3, 31), date(2019, 6, 29), date(2019, 7, 14), date(2019, 7, 21),
               date(2019, 7, 28), date(2019, 8, 11), date(2019, 8, 15), date(2019, 8, 16), date(2019, 8, 18),
               date(2019, 8, 25), date(2019, 9, 26), date(2019, 10, 13), date(2019, 10, 20), date(2019, 11, 20) ,
               date(2019, 11, 21), date(2019, 11, 22), date(2019, 11, 23)]
NUM_EVENTS = len(EVENT_DATES)

# Stores the coordinate of the four vertices of each of the zone rectangles that is used when querying zone data.
ZONE_COORDINATES = defaultdict(list)

# Get the coordinates for the zones in each of the tracked areas.
for camera_number in range(NUM_CAMERAS):
    # Get the coordinates of a rectangular region for each pair of i and j. The top left pixel is (0, 0) and the
    # bottom right pixel is (640, 480).
    for i in range(ROWS):
        for j in range(COLUMNS):
            # The coordinates are labled in clockwise order from the bottom left corner.
            coordinates = [[ZONE_LENGTH * j, ZONE_HEIGHT * i], [ZONE_LENGTH * (j + 1), ZONE_HEIGHT * i],
                               [ZONE_LENGTH * (j + 1), ZONE_HEIGHT * (i + 1)], [ZONE_LENGTH * j, ZONE_HEIGHT * (i + 1)]]
            # Add the coordinates to the list corresponding to the area.
            ZONE_COORDINATES[CAMERA_TO_SCENE[camera_number]].append(coordinates)


