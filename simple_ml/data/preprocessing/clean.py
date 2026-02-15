import pandas as pd
import os

# 1. List of all 7 files to process
file_list = [
    'Arduino Log.xlsx',
    'log2.xlsx',
    'log3.xlsx',
    'log4.xlsx',
    'log5.xlsx',
    'alcohol6.xlsx',
    'rndmlog.xlsx'
]

for file_name in file_list:
    # Check if the file exists in the folder
    if os.path.exists(file_name):
        print(f"Processing {file_name}...")

        # Load the Excel file (assuming data is in the first sheet)
        df_raw = pd.read_excel(file_name, header=None)

        # Clean the text: strip spaces and replace commas with spaces
        # This fixes the '12280,' issue and ensures a clean split
        clean_series = df_raw[0].astype(str).str.strip().str.replace(',', ' ')

        # Split the single column into multiple columns based on whitespace
        df = clean_series.str.split(expand=True)

        # Grab only the first 5 columns to match your variables
        df = df.iloc[:, :5]
        df.columns = ['timestamp', 'temperature_C', 'pressure_hPa', 'humidity_percent', 'gas_ohms']

        # Remove any rows that are actually just the column headers
        df = df[df['timestamp'].astype(str).str.lower() != 'timestamp']

        # Convert all columns to numeric, making errors NaN
        for col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

        # Drop rows that are empty or couldn't be converted
        df = df.dropna(subset=['temperature_C'])

        # Convert timestamp to integer to remove '.0'
        df['timestamp'] = df['timestamp'].astype(int)

        # 2. Save as an individual CSV
        output_name = f"cleaned_{file_name.replace('.xlsx', '.csv')}"
        df.to_csv(output_name, index=False)
        print(f"Successfully created: {output_name}")

    else:
        print(f"Skipping {file_name}: File not found.")

print("\nAll files have been cleaned individually!")