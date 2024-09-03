import {
  LineChart,
  Line,
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
import { useState } from "react";

// combine distance into X Axis and altitude into Y Axis
function getChartData() {
  const data = [];
  for (let i = 0; i < distance.data.length; i++) {
    data.push({
      index: i,
      distance: distance.data[i],
      altitude: altitude.data[i],
      heartRate: heartRate.data[i],
    });
  }
  return data;
}

// Function to aggregate data points
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
    };
    aggregatedData.push(aggregatedPoint);
  }
  return aggregatedData;
}

// Use the aggregateData function to reduce the number of points
const interval = 100; // Adjust this value based on your needs
const initialData = aggregateData(getChartData(), interval);
console.log("=>(App.jsx:30) initialData", initialData);

const getAxisYDomain = (from, to, ref, offset) => {
  const refData = initialData.slice(from - 1, to);
  let [bottom, top] = [refData[0][ref], refData[0][ref]];
  refData.forEach((d) => {
    if (d[ref] > top) top = d[ref];
    if (d[ref] < bottom) bottom = d[ref];
  });

  return [(bottom | 0) - offset, (top | 0) + offset];
};

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
  const [state, setState] = useState({
    ...initialState,
  });
  console.log("=>(App.jsx:85) state", state);

  function zoom() {
    let { refAreaLeftIndex, refAreaRightIndex } = state;
    const { data } = state;

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

    // xAxis domain
    if (refAreaLeftIndex > refAreaRightIndex)
      [refAreaLeftIndex, refAreaRightIndex] = [
        refAreaRightIndex,
        refAreaLeftIndex,
      ];

    // yAxis domain
    const [bottom, top] = getAxisYDomain(
      refAreaLeftIndex,
      refAreaRightIndex,
      "altitude",
      1,
    );
    const [bottom2, top2] = getAxisYDomain(
      refAreaLeftIndex,
      refAreaRightIndex,
      "heartRate",
      50,
    );

    setState((previous) => ({
      ...previous,
      refAreaLeftLabel: "",
      refAreaLeftIndex: null,
      refAreaRightLabel: "",
      refAreaRightIndex: null,
      data: data.slice(),
      left: refAreaLeftIndex,
      right: refAreaRightIndex,
      bottom,
      top,
      bottom2,
      top2,
    }));
  }

  function zoomOut() {
    const { data } = state;
    setState((previous) => ({
      ...previous,
      data: data.slice(),
      refAreaLeftLabel: "",
      refAreaLeftIndex: null,
      refAreaRightLabel: "",
      refAreaRightIndex: null,
      left: "dataMin",
      right: "dataMax",
      top: "dataMax+1",
      bottom: "dataMin",
      top2: "dataMax+50",
      bottom2: "dataMin+50",
    }));
  }

  const {
    data,
    left,
    right,
    refAreaLeftLabel,
    refAreaLeftIndex,
    refAreaRightLabel,
    refAreaRightIndex,
    top,
    bottom,
    top2,
    bottom2,
  } = state;

  return (
    <div
      className="highlight-bar-charts"
      style={{ userSelect: "none", width: "100%" }}
    >
      <button type="button" className="btn update" onClick={zoomOut}>
        Zoom Out
      </button>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
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
            dataKey="index"
            domain={[left, right]}
            type="number"
          />
          <YAxis
            allowDataOverflow
            domain={[bottom, top]}
            type="number"
            yAxisId="1"
          />
          <YAxis
            orientation="right"
            allowDataOverflow
            domain={[bottom2, top2]}
            type="number"
            yAxisId="2"
          />
          <Tooltip />
          <Line
            yAxisId="1"
            type="natural"
            dataKey="altitude"
            stroke="#8884d8"
            animationDuration={300}
          />
          <Line
            yAxisId="2"
            type="natural"
            dataKey="heartRate"
            stroke="#82ca9d"
            animationDuration={300}
          />

          {refAreaLeftIndex !== null && refAreaRightIndex !== null ? (
            <ReferenceArea
              yAxisId="1"
              x1={refAreaLeftLabel}
              x2={refAreaRightLabel}
              strokeOpacity={0.3}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;
