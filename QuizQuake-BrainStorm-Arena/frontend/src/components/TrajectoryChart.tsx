import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DifficultyTrajectoryPoint } from '../types/index.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  trajectory: DifficultyTrajectoryPoint[];
}

export const TrajectoryChart: React.FC<Props> = ({ trajectory }) => {
  if (!trajectory || trajectory.length === 0) {
    return null;
  }

  const difficultyMap: Record<string, number> = {
    Easy: 1,
    Medium: 2,
    Hard: 3,
  };

  const labels = trajectory.map(t => `Q${t.questionNumber}`);
  const numericData = trajectory.map(t => difficultyMap[t.difficulty] || 2);
  const pointColors = trajectory.map(t => (t.isCorrect ? '#22C55E' : '#EF4444'));

  const data = {
    labels,
    datasets: [
      {
        label: 'Difficulty Trajectory',
        data: numericData,
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2.5,
        tension: 0.3,
        pointBackgroundColor: pointColors,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0.5,
        max: 3.5,
        ticks: {
          stepSize: 1,
          color: '#94A3B8',
          font: { family: "'Inter', sans-serif", weight: 'bold' },
          callback: (value: number) => {
            if (value === 1) return 'EASY';
            if (value === 2) return 'MEDIUM';
            if (value === 3) return 'HARD';
            return '';
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.08)',
        },
      },
      x: {
        ticks: {
          color: '#94A3B8',
          font: { family: "'Inter', sans-serif" },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#151D32',
        titleColor: '#A78BFA',
        bodyColor: '#F8FAFC',
        borderColor: '#1F2E52',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const point = trajectory[context.dataIndex];
            const status = point.isCorrect ? '✅ Correct' : '❌ Incorrect';
            return [
              ` Level: ${point.difficulty}`,
              ` Result: ${status}`,
              ` Subtopic: ${point.subtopic}`,
            ];
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-56 sm:h-64 relative">
      <Line data={data} options={options} />
    </div>
  );
};
