"""
import os
import snowflake.connector
from dotenv import load_dotenv

load_dotenv()

snowflake_user = os.getenv("NOBEWAN")
snowflake_password = os.getenv("Frieren052802006")
snowflake_account = os.getenv("XIB90717")
snowflake_warehouse = os.getenv("COMPUTE_WH")
snowflake_database = os.getenv("SNOWFLAKE_DATABASE")
snowflake_schema = os.getenv("PUBLIC")

try:
    conn = snowflake.connector.connect(
        user=snowflake_user,
        password=snowflake_password,
        account=snowflake_account,
        warehouse=snowflake_warehouse,
        database=snowflake_database,
        schema=snowflake_schema
    )
    print("Connection established!")
    cur = conn.cursor()

    # Code for uploading data will go here

except snowflake.connector.errors.Error as e:
    print(f"Error connecting to Snowflake: {e}")
finally:
    if 'conn' in locals():
        cur.close()
        conn.close()
        print("Connection closed.")

file_path = '/backend/bme688_lo_csv'
stage_name = 'my_stage'
try:
    cur.execute(f"PUT file://{file_path} @{stage_name} auto_compress=true")
    print("File uploaded to stage!")
except Exception as e:
    print(f"Error uploading file: {e}")
"""