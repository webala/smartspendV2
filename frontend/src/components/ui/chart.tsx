import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  type: "line" | "bar";
  data: ChartData<"line" | "bar">;
  options?: ChartOptions<"line" | "bar">;
  className?: string;
}

export function Chart({ type, data, options, className }: ChartProps) {
  const ChartComponent = type === "line" ? Line : Bar;

  return (
    <div className={className}>
      <ChartComponent data={data} options={options} />
    </div>
  );
}
