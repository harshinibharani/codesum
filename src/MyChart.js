import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

import Typography from '@mui/material/Typography';
// Register the chart components we need to use
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function MyChart() {
  // Generate labels for the past five days
  const generateLastFiveDays = () => {
    const dates = [];
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]); // Formats the date as 'YYYY-MM-DD'
    }
    return dates;
  };

  const [chartData, setChartData] = useState({
    labels: generateLastFiveDays(),
    datasets: [{
      label: 'Past 5 days user interaction',
      data: new Array(5).fill(0), // Initialize data with zeros
      backgroundColor: [
        'rgba(75, 192, 192, 0.5)'
      ],
      borderWidth: 1
    }]
  });

  const options = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Function to fetch data from the server
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:4000/summaryUsage');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log("Fetched data:", data); // Log the fetched data

      // Map fetched data to chart data format
      const dataMap = new Map(data.map(item => [item._id, item.count]));
      const updatedData = chartData.labels.map(label => dataMap.get(label) || 0);

      setChartData(prev => ({
        ...prev,
        datasets: [{
          ...prev.datasets[0],
          data: updatedData
        }]
      }));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array means this effect runs only once after the initial render

  return (
    <div>
      <Typography variant="h4" gutterBottom>User Interactions Over the Past 5 Days</Typography>
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default MyChart;