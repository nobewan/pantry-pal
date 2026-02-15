import dash
from dash import html, dcc
import plotly.graph_objects as go
from datetime import datetime

app = dash.Dash(__name__)
server = app.server

# -----------------------------
# Placeholder figures
# -----------------------------
empty_fig = go.Figure()
empty_fig.update_layout(
    template="plotly_white",
    xaxis_title="Time",
    yaxis_title="Value",
    margin=dict(l=40, r=20, t=40, b=40)
)

# -----------------------------
# Layout
# -----------------------------
app.layout = html.Div(
    style={"padding": "20px", "fontFamily": "Arial"},
    children=[

        # =========================
        # WEATHER + IRRADIANCE
        # =========================
        html.H2("🌤 Weather & Irradiance"),

        html.Div(
            style={
                "display": "flex",
                "justifyContent": "space-between",
                "marginBottom": "10px"
            },
            children=[
                html.Div(f"🕒 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                         id="current-time"),
                html.Div("📍 Location: [Select / Auto]",
                         id="location-text")
            ]
        ),

        html.Div(
            style={"display": "flex", "gap": "20px"},
            children=[

                # ---- Weather table ----
                html.Div(
                    style={
                        "width": "25%",
                        "border": "1px solid #ccc",
                        "padding": "10px"
                    },
                    children=[
                        html.H4("Weather"),
                        html.Ul([
                            html.Li("Temperature: -- °C"),
                            html.Li("Humidity: -- %"),
                            html.Li("Wind Speed: -- m/s"),
                            html.Li("Cloud Cover: -- %"),
                        ], id="weather-table")
                    ]
                ),

                # ---- Irradiance plot ----
                html.Div(
                    style={"width": "75%"},
                    children=[
                        dcc.Graph(
                            id="irradiance-plot",
                            figure=empty_fig
                        )
                    ]
                )
            ]
        ),

        html.Hr(),

        # =========================
        # SOLAR PRODUCTION
        # =========================
        html.H2("☀️ Solar Production Data (PVLib)"),

        html.Div(
            style={"display": "flex", "gap": "20px"},
            children=[

                # ---- Sensor / array list ----
                html.Div(
                    style={
                        "width": "25%",
                        "border": "1px solid #ccc",
                        "padding": "10px"
                    },
                    children=[
                        html.H4("Arrays / Sensors"),
                        dcc.Checklist(
                            id="pv-array-list",
                            options=[
                                {"label": "Field 1", "value": "f1"},
                                {"label": "Field 2", "value": "f2"},
                                {"label": "Field 3", "value": "f3"},
                                {"label": "Lot 10", "value": "l10"},
                            ],
                            value=["f1"]
                        )
                    ]
                ),

                # ---- PV plot area ----
                html.Div(
                    style={"width": "75%"},
                    children=[

                        # Controls
                        html.Div(
                            style={
                                "display": "flex",
                                "justifyContent": "flex-end",
                                "gap": "10px",
                                "marginBottom": "10px"
                            },
                            children=[
                                dcc.Dropdown(
                                    id="time-period",
                                    options=[
                                        {"label": "Daily", "value": "day"},
                                        {"label": "Weekly", "value": "week"},
                                        {"label": "Monthly", "value": "month"},
                                    ],
                                    value="day",
                                    style={"width": "150px"}
                                ),
                                dcc.DatePickerSingle(
                                    id="date-picker",
                                    date=datetime.today()
                                )
                            ]
                        ),

                        dcc.Graph(
                            id="solar-production-plot",
                            figure=empty_fig
                        )
                    ]
                )
            ]
        )
    ]
)

# -----------------------------
# Run
# -----------------------------
if __name__ == "__main__":
    app.run_server(debug=True)