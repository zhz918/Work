from spec_constants import *
from numpy import genfromtxt

# This file generates the nested data lists used by the zone and day heatmaps. The data was pre-generated through
# querying and stored in csv files so the querying needs to be done only once.

# Load the pre-queried data for the zone heatmap.
full_data = genfromtxt("./Zehao-files/q1_full_data.csv", delimiter=',')

# Stores the data for each of the ROW x COLUMNS zones for each object type, metric, day, and area.
HEATMAP_ARRAYS = {object_class:{metric:[[np.zeros((ROWS, COLUMNS)) for i in range(NUM_CAMERAS)]
                             for j in range(FRAMES)] for metric in EXTENDED_METRICS} for object_class in OBJECT_CLASSES}

# The row number of the zone data csv file currently being processed.
current_index = 0

# Read the pre-queried metric values for each object type, metric, day, and area. The values are read in the same
# order that they were written to the zone data csv file.
for object_class in OBJECT_CLASSES:
    for metric_index in range(len(METRICS)):
        for frame in range(FRAMES):
            for camera_number in range(NUM_CAMERAS):
                # The row in the csv file to stop at.
                next_index = current_index + ROWS
                # The information for the current object type, metric, day, and area is stored in the rows from
                # current_index to next_index, including current_index but not including next_index.
                HEATMAP_ARRAYS[object_class][METRICS[metric_index]][frame][camera_number] = \
                    full_data[current_index: next_index]
                # current_index is updated to be the first row that was not read for the next iteration.
                current_index = next_index

# The following code stores the data for the metric in the zone heatmap that are not in the day heatmap.
# Load the pre-computed metric data for the metrics not loaded yet.
absorption_data = genfromtxt("./Zehao-files/absorption_index_data.csv", delimiter=',')
cumulative_count_data = genfromtxt("./Zehao-files/cumulative_count_data.csv", delimiter=',')

# The list of metric data not processed yet.
extended_metric_data = [cumulative_count_data, absorption_data]

# For each of the unprocessed metrics, store the information into the heatmap array.
for metric_index in range(len(extended_metric_data)):
    # The data array being processed.
    metric_data = extended_metric_data[metric_index]
    # The row number of the metric csv file currently being processed.
    current_metric_index = 0
    # Read the pre-computed metric data for each object type, day, and area. The values are read in the same
    # order that they were written to the metric csv file.
    for object_class in OBJECT_CLASSES:
        for frame in range(FRAMES):
            for camera_number in range(NUM_CAMERAS):
                # The row in the csv file to stop at.
                next_metric_index = current_metric_index + ROWS
                # The information for the current object type, day, and area is stored in the rows from
                # current_metric_index to next_metric_index, including current_metric_index but not including
                # next_metric_index. The metric index in EXTENDED_METRICS is two more than metric_index due to already
                # having processed the two metrics in METRICS.
                HEATMAP_ARRAYS[object_class][EXTENDED_METRICS[metric_index + 2]][frame][camera_number] = \
                    metric_data[current_metric_index: next_metric_index]
                # current_metric_index is updated to be the first row that was not read for the next iteration.
                current_metric_index = next_metric_index



# Load the pre-queried data for the day heatmap.
area_data = genfromtxt("./Zehao-files/area_csv_data.csv", delimiter=',')

# Stores the data for each object type, metric, day, and area.
AREA_DATA = {object_class:[[0 for i in range(NUM_CAMERAS)]
                             for j in range(NUM_METRICS)] for object_class in OBJECT_CLASSES}

# The row number of the day heatmap csv file currently being processed.
current_area_index = 0

# Read the pre-queried day data for each object type, day, and area. The data for each iteration is stored in a list of
# length FRAMES which stores the data for each day.
for object_class in OBJECT_CLASSES:
    for metric in range(NUM_METRICS):
        for camera_number in range(NUM_CAMERAS):
            # The information for the current object type, day, and area is stored at current_area_index in the csv
            # file.
            AREA_DATA[object_class][metric][camera_number] = area_data[current_area_index]
            # The next iteration will read the list in the next row.
            current_area_index += 1

