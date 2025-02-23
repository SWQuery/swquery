"use client";

import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/constants";
import axios from "axios";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { Bar } from "react-chartjs-2";
import { Card, CardContent } from "@/components/Atoms/CardComponent";
import { Navbar } from "@/components/Molecules/Navbar";
import { Info, Eye, EyeOff, Copy } from "lucide-react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

interface ChatQuantity {
  chat_date: string;
  chats_per_day: number;
}

interface UsageResponse {
  remaining_credits: number;
  total_requests: number;
  chats_per_day: ChatQuantity[];
}

ChartJS.register(Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const { publicKey } = useWallet();
  const [totalRequests, setTotalRequests] = useState(0);
  const [remainingRequests, setRemainingRequests] = useState(0);
  const [requestsPerDay, setRequestsPerDay] = useState<number[]>([]);
  const [dates, setDates] = useState<string[]>([]);

  const usedRequests = totalRequests - remainingRequests;

  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30>(7);
  const [apiKey, setApiKey] = useState<string>("");
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<
    "success" | "info" | "warning" | "error"
  >("success");

  const handleAlert = (
    message: string,
    severity: "success" | "info" | "warning" | "error"
  ) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };
  const fetchApiKey = async () => {
    if (!publicKey) return;

    try {
      const response = await axios.get(`${API_URL}/users/${publicKey.toBase58()}`, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.api_key) {
        setApiKey(response.data.api_key);
      } else {
        console.warn("⚠️ No API Key found.");
      }
    } catch (error) {
      console.error("❌ Error fetching API Key:", error);
      handleAlert("Failed to load API Key!", "error");
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get<UsageResponse>(
        `${API_URL}/users/${publicKey?.toBase58()}/usage`
      );
      
      console.log("📊 Data received:", response.data);
      
      setTotalRequests(response.data.total_requests);
      setRemainingRequests(response.data.remaining_credits);

      const formattedData = response.data.chats_per_day || [];
      setRequestsPerDay(formattedData.map((item) => item.chats_per_day));
      setDates(formattedData.map((item) => item.chat_date));
    } catch (error) {
      console.error("Error fetching usage data:", error);
      handleAlert("Failed to load dashboard data!", "error");
    }
  };

  useEffect(() => {
    fetchApiKey();
  }, [publicKey]);

  useEffect(() => {
    if (publicKey) {
      fetchDashboardData();
    }
  }, [publicKey]);

  const requestsChartData = {
    labels: dates.slice(-selectedPeriod).reverse(),
    datasets: [
      {
        label: "Requests per Day",
        data: requestsPerDay.slice(-selectedPeriod).reverse(),
        backgroundColor: "#4F46E5",
      },
    ],
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    handleAlert("API Key copied to clipboard!", "info");
  };

  const handleChangeApiKey = () => {
    const newKey = "sk-new1234567890abc";
    setApiKey(newKey);
    setIsModalOpen(false);
    handleAlert("API Key updated successfully!", "success");
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="container mx-auto p-6 flex flex-col gap-6 flex-1 mt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-white text-left">
            Dashboard
          </h1>
          <p className="text-gray-300 mt-2 text-left">
            Here you can manage all your requisitions and monitor your usage.
          </p>
        </div>

        {/* API Key Section */}
        <Card>
          <CardContent>
            <div className="flex justify-between items-center mb-4 p-6">
              <h2 className="text-xl font-semibold text-gray-300">API Key</h2>
              <Info
                size={20}
                className="text-gray-400 cursor-pointer hover:text-white"
              >
                <title>
                  Your API Key is used to authenticate requests to the backend.
                </title>
              </Info>
            </div>
            <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsKeyVisible(!isKeyVisible)}
                  className="text-gray-400 hover:text-white"
                >
                  {isKeyVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <span className="text-gray-300">
                  {isKeyVisible ? apiKey : "••••••••••••••••••••••••"}
                </span>
              </div>
              <button
                onClick={handleCopyApiKey}
                className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors"
              >
                <Copy size={16} />
                Copy
              </button>
            </div>
            {/* <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:opacity-90"
            >
              Change My API Key
            </button> */}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Requests Overview */}
          <Card>
            <CardContent>
              <div className="flex justify-between items-center mb-4 p-6">
                <h2 className="text-xl font-semibold text-gray-300">
                  Requests Overview
                </h2>
                <Info
                  size={20}
                  className="text-gray-400 cursor-pointer hover:text-white"
                >
                  <title>
                    This chart shows the percentage of used and remaining requests.
                  </title>
                </Info>
              </div>
              <div
                className="relative mx-auto"
                style={{ width: "100%", maxWidth: "300px", aspectRatio: "1" }}
              >
                <svg
                  viewBox="0 0 36 36"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path
                    d="M18 2.5
             a 15.5 15.5 0 1 1 0 31
             a 15.5 15.5 0 1 1 0 -31"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.5
             a 15.5 15.5 0 1 1 0 31
             a 15.5 15.5 0 1 1 0 -31"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="2"
                    strokeDasharray={`${(usedRequests / totalRequests) * 100}, 100`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-semibold">
                  <span className="text-lg">
                    {Number.isNaN(usedRequests) ? 0 : usedRequests}/{remainingRequests}
                  </span>
                  <span className="text-sm">Requests Used</span>
                </div>
              </div>
              <p className="text-gray-400 mt-2 text-center">
                Remaining Requests:{" "}
                <span className="text-white font-semibold">
                  {remainingRequests}
                </span>
              </p>
            </CardContent>
          </Card>

          {/* Daily Requests Chart */}
          <Card>
            <CardContent>
              <div className="flex justify-between items-center mb-4 p-6">
                <h2 className="text-xl font-semibold text-gray-300">
                  Daily Requests
                </h2>
                <Info
                  size={20}
                  className="text-gray-400 cursor-pointer hover:text-white"
                >
                  <title>
                    This chart displays the number of requests made per day in the selected period.
                  </title>
                </Info>
              </div>
              <div className="flex justify-between items-center mb-4">
                <select
                  className="bg-gray-800 text-gray-300 rounded p-2"
                  value={selectedPeriod}
                  onChange={(e) =>
                    setSelectedPeriod(Number(e.target.value) as 7 | 30)
                  }
                >
                  <option value={7}>Last 7 Days</option>
                  <option value={30}>Last 30 Days</option>
                </select>
              </div>
              <Bar 
                data={requestsChartData} 
                options={{
                  scales: {
                    y: {
                      suggestedMax: 10,
                      suggestedMin: 0
                    }
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold text-gray-300 mb-4">
              Are you sure?
            </h3>
            <p className="text-gray-400 mb-6">
              Your current API key will be invalidated.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleChangeApiKey}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:opacity-90"
              >
                Confirm
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-90"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Component */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setAlertOpen(false)}
          severity={alertSeverity}
          variant="filled"
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Dashboard;
