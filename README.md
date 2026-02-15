# **Project name: Pantry Pal**

# **WHY WE MADE IT**
We wanted to find how to detect food spoilage using a gas sensor in real time so you'll know what food has gone bad before you even open the door.

# **HOW WE MADE IT**
   #### **Website**: Used to display the data
   - Frontend: ReactJS and TailwindCSS to display our data that it fetches from the backend to make our dashboard
   - Backend: Node.js + Express fetches data that we stored using Snowsight (Snowflake Web Interface)
   #### **Hardware**: Used to gather the data
   - Raspberry Pi 4: Connected to gas sensor, LCD display, and camera
   - Arduino: Connected to gas sensor for same purpose and to check accuracy of results.
   - BME 688 Gas sensor: Humidity, temperature, and gas resistance metrics; detect VOCS emitted during food spoilage
   - LCD Display: Shows all metrics and status of food


# **HOW CAN YOU USE IT**
For website run: 

1. **Run node.js**:
   - cd backend
   - node server.js
2. **Run frontend**
   - cd frontend
   - npm run dev




