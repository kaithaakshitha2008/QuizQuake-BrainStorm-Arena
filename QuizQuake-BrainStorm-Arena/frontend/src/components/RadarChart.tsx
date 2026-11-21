import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { TopicDiagnostic } from '../types/index.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface Props {
  topics: TopicDiagnostic[];
  onSelectTopic?: (topicName: string) => void;
}

export const RadarChart: React.FC<Props> = ({ topics, onSelectTopic }) => {
  const labels = topics.map(t => t.topic);
  const dataValues = topics.map(t => t.accuracy);

  const data = {
    labels,
    datasets: [
      {
        label: 'Topic Mastery (%)',
        data: dataValues,
        backgroundColor: 'rgba(139, 92, 246, 0.25)',
        borderColor: 'rgba(59, 130, 246, 0.9)',
        borderWidth: 2.5,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#06B6D4',
        pointHoverBorderColor: '#ffffff',
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.12)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.08)',
        },
        pointLabels: {
          color: '#E2E8F0',
          font: {
            size: 12,
            weight: 'bold',
            family: "'Inter', sans-serif",
          },
        },
        ticks: {
          color: '#94A3B8',
          backdropColor: 'transparent',
          min: 0,
          max: 100,
          stepSize: 20,
          font: {
            size: 10,
          },
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#151D32',
        titleColor: '#60A5FA',
        bodyColor: '#F8FAFC',
        borderColor: '#1F2E52',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context: any) => ` Mastery: ${context.raw}%`,
        },
      },
    },
    onClick: (_event: any, elements: any[]) => {
      if (elements && elements.length > 0 && onSelectTopic) {
        const index = elements[0].index;
        onSelectTopic(labels[index]);
      }
    },
  };

  return (
    <div className="w-full h-72 sm:h-80 md:h-96 relative flex items-center justify-center">
      <Radar data={data} options={options} />
    </div>
  );
};
