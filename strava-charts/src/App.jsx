import {
  ComposedChart,
  Line,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";
import "./App.css";
import distance from "./assets/data/distance.json";
import altitude from "./assets/data/altitude.json";
import heartRate from "./assets/data/heartrate.json";
import time from "./assets/data/time.json";
import grade from "./assets/data/grade_smooth.json";
import { useState } from "react";
import PropTypes from "prop-types";

const START = new Date("2024-08-30T07:01:54Z");

// Get the raw chart data (exact data)
function getChartData() {
  const data = [];
  for (let i = 0; i < distance.data.length; i++) {
    data.push({
      index: i,
      distance: distance.data[i],
      altitude: altitude.data[i],
      heartRate: heartRate.data[i],
      time: time.data[i],
      grade: grade.data[i],
    });
  }
  return data;
}

// Function to aggregate data points (for display purposes)
function aggregateData(data, interval) {
  const aggregatedData = [];
  for (let i = 0; i < data.length; i += interval) {
    const chunk = data.slice(i, i + interval);
    const aggregatedPoint = {
      index: chunk[0].index,
      distance:
        chunk.reduce((sum, point) => sum + point.distance, 0) / chunk.length,
      altitude:
        chunk.reduce((sum, point) => sum + point.altitude, 0) / chunk.length,
      heartRate:
        chunk.reduce((sum, point) => sum + point.heartRate, 0) / chunk.length,
      time: chunk.reduce((sum, point) => sum + point.time, 0) / chunk.length,
      grade: chunk.reduce((sum, point) => sum + point.grade, 0) / chunk.length,
    };
    aggregatedData.push(aggregatedPoint);
  }
  return aggregatedData;
}

function convertMinutesToHHMMSS(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);
  const seconds = Math.round((minutes - Math.floor(minutes)) * 60);

  const formattedMinutes = String(remainingMinutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  // Only include hours if they are greater than 0
  if (hours > 0) {
    const formattedHours = String(hours).padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  } else {
    return `${formattedMinutes}:${formattedSeconds}`;
  }
}

function calculateStats(data, leftIndex, rightIndex) {
  const filteredData = data.slice(leftIndex, rightIndex + 1);

  // Start time and end time
  const startTime = filteredData[0].time;
  const endTime = filteredData[filteredData.length - 1].time;

  // Elapsed time in seconds
  const elapsedTime = (endTime - startTime) / 60; // Convert to minutes

  // Total distance gain in kilometers
  const totalDistance =
    (filteredData[filteredData.length - 1].distance -
      filteredData[0].distance) /
    1000; // Convert meters to kilometers

  // Pace in min/km
  const pace = elapsedTime / totalDistance;

  // Elevation gain and loss
  let elevationGain = 0;
  let elevationLoss = 0;
  for (let i = 1; i < filteredData.length; i++) {
    const deltaElevation =
      filteredData[i].altitude - filteredData[i - 1].altitude;
    if (deltaElevation > 0) {
      elevationGain += deltaElevation;
    } else {
      elevationLoss += Math.abs(deltaElevation);
    }
  }

  // Climb grade (based on elevation gain)
  const climbGrade = (elevationGain / (totalDistance * 1000)) * 100; // Convert to percentage

  // Average grade (based on elevation gain and loss)
  const averageGrade =
    ((elevationGain + elevationLoss) / (totalDistance * 1000)) * 100; // Convert to percentage

  // Average heart rate
  const averageHeartRate =
    filteredData.reduce((sum, point) => sum + point.heartRate, 0) /
    filteredData.length;

  return {
    startTime: new Date(START.getTime() + startTime * 1000),
    endTime: new Date(START.getTime() + endTime * 1000),
    elapsedTime,
    totalDistance,
    pace,
    elevationGain,
    elevationLoss,
    climbGrade,
    averageGrade,
    averageHeartRate,
  };
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Assuming elapsed time is available as part of the payload, or you need to calculate it.
    const elapsedTime = payload[0]?.payload?.time || "N/A"; // Replace with actual logic if time is not in payload

    return (
      <div
        style={{
          textAlign: "left",
          backgroundColor: "#fff",
          padding: "12px",
          border: "1px solid #ccc",
        }}
      >
        <table>
          <tbody>
            <tr>
              <th>Elapsed:</th>
              <td>{convertMinutesToHHMMSS(elapsedTime / 60)}</td>{" "}
            </tr>
            <tr>
              <th>Altitude:</th>
              <td>{payload[0].value} meters</td>
            </tr>
            <tr>
              <th>Distance:</th>
              <td>{(label / 1000).toFixed(2)} km</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number,
      payload: PropTypes.shape({
        time: PropTypes.string,
      }),
    }),
  ),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

// Use the aggregateData function to reduce the number of points for display
const interval = 100; // Adjust this value based on your needs
const rawData = getChartData(); // Exact data
const initialData = aggregateData(rawData, interval); // Aggregated data for chart

const initialState = {
  data: initialData,
  left: "dataMin",
  right: "dataMax",
  top: "dataMax+1",
  bottom: "dataMin-1",
  top2: "dataMax+20",
  bottom2: "dataMin-20",
  animation: true,
  refAreaLeftLabel: "",
  refAreaLeftIndex: null,
  refAreaRightLabel: "",
  refAreaRightIndex: null,
};

function App() {
  const [state, setState] = useState(() => ({
    ...initialState,
    stats: calculateStats(rawData, 0, rawData.length - 1), // Calculate stats using exact data
  }));

  function zoom() {
    let { refAreaLeftIndex, refAreaRightIndex } = state;

    if (refAreaLeftIndex === refAreaRightIndex || refAreaRightIndex === null) {
      setState((previous) => ({
        ...previous,
        refAreaLeftLabel: "",
        refAreaLeftIndex: null,
        refAreaRightLabel: "",
        refAreaRightIndex: null,
      }));
      return;
    }

    if (refAreaLeftIndex > refAreaRightIndex)
      [refAreaLeftIndex, refAreaRightIndex] = [
        refAreaRightIndex,
        refAreaLeftIndex,
      ];

    // Get the left and right `index` from aggregated data
    const leftIndex = data[refAreaLeftIndex].index;
    const rightIndex = data[refAreaRightIndex].index;

    // Use the `index` from raw data for accurate stats calculation
    const stats = calculateStats(rawData, leftIndex, rightIndex);

    setState((previous) => ({
      ...previous,
      refAreaLeftLabel: "",
      refAreaLeftIndex: null,
      refAreaRightLabel: "",
      refAreaRightIndex: null,
      data: initialData, // Continue showing aggregated data for performance
      left: data[refAreaLeftIndex].distance, // Distance boundaries for chart
      right: data[refAreaRightIndex].distance,
      stats, // Update the stats with exact data
    }));
  }

  function zoomOut() {
    // Reset to full data and recalculate stats from the full dataset
    const stats = calculateStats(rawData, 0, rawData.length - 1);

    setState((previous) => ({
      ...previous,
      data: initialData,
      refAreaLeftLabel: "",
      refAreaLeftIndex: null,
      refAreaRightLabel: "",
      refAreaRightIndex: null,
      left: "dataMin",
      right: "dataMax",
      stats, // Reset to full dataset stats
    }));
  }

  const { data, left, right, refAreaLeftLabel, refAreaRightLabel, stats } =
    state;

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          textAlign: "left",
          alignItems: "center",
          padding: "8px 32px", // Padding inside the grid container
        }}
      >
        <h2 style={{ margin: 0 }}>CCC by UTMB 2024</h2>

        <button type="button" className="btn update" onClick={zoomOut}>
          Zoom Out
        </button>
      </div>

      <ResponsiveContainer
        width="100%"
        height={400}
        style={{ userSelect: "none" }}
      >
        <ComposedChart
          width={800}
          height={400}
          data={data}
          onMouseDown={(e) =>
            setState((previous) => ({
              ...previous,
              refAreaLeftLabel: e.activeLabel,
              refAreaLeftIndex: e.activeTooltipIndex,
            }))
          }
          onMouseMove={(e) =>
            state.refAreaLeftIndex !== null &&
            setState((previous) => ({
              ...previous,
              refAreaRightLabel: e.activeLabel,
              refAreaRightIndex: e.activeTooltipIndex,
            }))
          }
          onMouseUp={zoom}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            allowDataOverflow
            dataKey="distance"
            domain={[left, right]}
            type="number"
          />
          <YAxis
            allowDataOverflow
            domain={["auto", "auto"]}
            type="number"
            yAxisId="1"
          />
          <YAxis
            orientation="right"
            allowDataOverflow
            domain={["auto", "auto"]}
            type="number"
            yAxisId="2"
          />

          <Tooltip
            content={<CustomTooltip />} // Use custom tooltip component
          />

          {/* Area for Elevation */}
          <Area
            yAxisId="1"
            type="natural"
            dataKey="altitude"
            stroke="none"
            fill="#d9d9d9"
            animationDuration={300}
          />

          {/* Line for Heart Rate */}
          <Line
            yAxisId="2"
            type="natural"
            dataKey="heartRate"
            stroke="#FF6347" // Red for heart rate
            dot={false} // Remove the dots
            animationDuration={300}
          />

          {refAreaLeftLabel !== null && refAreaRightLabel !== null ? (
            <ReferenceArea
              yAxisId="1"
              x1={refAreaLeftLabel}
              x2={refAreaRightLabel}
              strokeOpacity={0.3}
            />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>

      <table>
        <tbody>
          <tr>
            <td>Start Time:</td>
            <td>{stats.startTime.toLocaleString()}</td>
          </tr>
          <tr>
            <td>End Time:</td>
            <td>{stats.endTime.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Total Elapsed Time:</td>
            <td>{convertMinutesToHHMMSS(stats.elapsedTime)}</td>
          </tr>
          <tr>
            <td>Total Distance Gain:</td>
            <td>{stats.totalDistance.toFixed(2)} km</td>
          </tr>
          <tr>
            <td>Pace:</td>
            <td>{convertMinutesToHHMMSS(stats.pace)} min/km</td>
          </tr>
          <tr>
            <td>Total Elevation Gain:</td>
            <td>{stats.elevationGain.toFixed(2)} m</td>
          </tr>
          <tr>
            <td>Total Elevation Loss:</td>
            <td>{stats.elevationLoss.toFixed(2)} m</td>
          </tr>
          <tr>
            <td>Climb Grade:</td>
            <td>{stats.climbGrade.toFixed(2)} %</td>
          </tr>
          <tr>
            <td>Average Grade:</td>
            <td>{stats.averageGrade.toFixed(2)} %</td>
          </tr>
          <tr>
            <td>Average Heart Rate:</td>
            <td>{stats.averageHeartRate.toFixed(2)} bpm</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;
