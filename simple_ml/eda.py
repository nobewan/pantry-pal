import pandas as pd
import os
import glob

DATA_FOLDER = "./data"
OUTPUT_FILE = "./data/combined_dataset.csv"

def determine_label_and_notes(filename):
    name = filename.lower()

    if "greenbanana" in name:
        # return "normal", "greenbanana"
        return "greenbanana", "normal"
    if "normal" in name:
        return "normal", "n/a"
    elif "alcohol" in name:
        return "alcohol", "n/a"
    elif "mid" in name:
        return "mid-ripe", "n/a"
    elif "ripe" in name:
        return "ripe", "n/a"
    else:
        return None, None


all_files = glob.glob(os.path.join(DATA_FOLDER, "*.csv"))
dataframes = []

for file in all_files:

    if file.endswith(OUTPUT_FILE):
        continue

    filename = os.path.basename(file)

    label, notes = determine_label_and_notes(filename)

    if label is None:
        continue

    df = pd.read_csv(file)
    df.columns = df.columns.str.strip()

    if "temp_c" in df.columns:
        df.rename(columns={"temp_c": "temperature_C"}, inplace=True)

    if "pressure_hpa" in df.columns:
        df.rename(columns={"pressure_hpa": "pressure_hPa"}, inplace=True)

    df["label"] = label
    df["notes"] = notes

    dataframes.append(df)

    print(f"Added {filename}")

combined_df = pd.concat(dataframes, ignore_index=True)

combined_df = combined_df.loc[:, ~combined_df.columns.duplicated()]

combined_df.to_csv(OUTPUT_FILE, index=False)

print("\nClean combined file saved.")
print("Final columns:", combined_df.columns.tolist())
print("Final shape:", combined_df.shape)


import pandas as pd
import matplotlib.pyplot as plt

# Load combined dataset
df = pd.read_csv("./data/combined_dataset.csv")

# If you have a timestamp column, use it
# if "timestamp" in df.columns:
#     df["timestamp"] = pd.to_datetime(df["timestamp"])
#     x_axis = "timestamp"
# else:
    # Otherwise just use index
df = df.reset_index()
x_axis = "index"

labels = df["label"].unique()

#gas plot
plt.figure()
for label in labels:
    subset = df[df["label"] == label]
    if "gas_ohms" in subset.columns:
        plt.plot(subset[x_axis], subset["gas_ohms"], label=label)
plt.yscale("log")
plt.xlabel(x_axis)
plt.ylabel("Gas Resistance")
plt.title("Gas Sensor Readings by Class")
plt.legend()
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()


#temperature
# if "temperature_C" in df.columns:
#     plt.figure()
#     for label in labels:
#         subset = df[df["label"] == label]
#         plt.plot(subset[x_axis], subset["temperature_C"], label=label)
#     plt.yscale("log")
#     plt.xlabel(x_axis)
#     plt.ylabel("Temperature (C)")
#     plt.title("Temperature by Class")
#     plt.legend()
#     plt.xticks(rotation=45)
#     plt.tight_layout()
#     plt.show()
#
#

#humidity plot

# if "humidity_percent" in df.columns:
#     plt.figure()
#     for label in labels:
#         subset = df[df["label"] == label]
#         plt.plot(subset[x_axis], subset["humidity_percent"], label=label)
#
#     plt.yscale("log")
#     plt.xlabel(x_axis)
#     plt.ylabel("Humidity (%)")
#     plt.title("Humidity by Class")
#     plt.legend()
#     plt.xticks(rotation=45)
#     plt.tight_layout()
#     plt.show()
#


###dsitribution

plt.figure()
df.boxplot(column="gas_ohms", by="label")
plt.yscale("log")
plt.title("Gas Resistance Distribution per Class")
plt.suptitle("")
plt.xlabel("Label")
plt.ylabel("Gas Resistance")
plt.show()
