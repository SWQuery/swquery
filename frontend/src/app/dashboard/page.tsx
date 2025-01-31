"use client";

import React, { useState, useEffect } from "react";
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
import { API_URL } from "@/utils/constants";

ChartJS.register(Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const [useMockData, setUseMockData] = useState(false);
  const { publicKey } = useWallet();
  const [totalRequests, setTotalRequests] = useState(0);
  const [remainingRequests, setRemainingRequests] = useState(0);
  const [requestsPerDay, setRequestsPerDay] = useState<number[]>([]);
  const [dates, setDates] = useState<string[]>([]);

  const usedTokens = totalRequests - remainingRequests;
  const totalTokens = totalRequests;

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
    if (useMockData || !publicKey) return;

    try {
      const response = await fetch(`${API_URL}/${publicKey.toBase58()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error req: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Data received", data);

      if (data.api_key) {
        setApiKey(data.api_key);
      } else {
        console.warn("No responses found.");
      }
    } catch (error) {
      console.error("Failed to load API Key:", error);
      handleAlert("Failed to load API Key!", "error");
    }
  };

  const fetchDashboardData = async () => {
    if (useMockData || !apiKey) return;

    try {
      const response = await fetch(`${API_URL}/usage`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Req error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📊 Dados recebidos:", data);

      setTotalRequests(data.total_requests || 0);
      setRemainingRequests(data.remaining_requests || 0);

      const formattedData = data.chats_per_day || [];
      setRequestsPerDay(
        formattedData.map((item: any) => item.chats_per_day || 0)
      );
      setDates(formattedData.map((item: any) => item.chat_date || ""));
    } catch (error) {
      console.error("Api data not found:", error);
      handleAlert("Failed to load dashboard data!", "error");
    }
  };

  const generateMockData = () => {
    setTotalRequests(500);
    setRemainingRequests(200);
    setRequestsPerDay(
      new Array(30).fill(0).map(() => Math.floor(Math.random() * 50 + 10))
    );
    setDates(Array.from({ length: 30 }, (_, i) => `2025-02-${i + 1}`));
  };

  useEffect(() => {
    fetchApiKey();
  }, [publicKey]);

  useEffect(() => {
    if (useMockData) {
      generateMockData();
    } else {
      fetchDashboardData();
    }
  }, [useMockData]);

  const percentageUsed = (usedTokens / totalTokens) * 100 || 0;

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

  const requestsChartData = {
    labels: dates.slice(0, selectedPeriod),
    datasets: [
      {
        label: "Requests",
        data: requestsPerDay.slice(0, selectedPeriod),
        backgroundColor: "#4F46E5",
      },
    ],
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
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:opacity-90"
            >
              Change My API Key
            </button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tokens Overview */}
          <Card>
            <CardContent>
              <div className="flex justify-between items-center mb-4 p-6">
                <h2 className="text-xl font-semibold text-gray-300">
                  Tokens Overview
                </h2>
                <Info
                  size={20}
                  className="text-gray-400 cursor-pointer hover:text-white"
                >
                  <title>
                    This chart shows the percentage of used and remaining
                    tokens.
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
                    strokeDasharray={`${percentageUsed}, 100`}
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
                    {usedTokens}/{totalTokens}
                  </span>
                  <span className="text-sm">Tokens Used</span>
                </div>
              </div>
              <p className="text-gray-400 mt-2 text-center">
                Remaining Tokens:{" "}
                <span className="text-white font-semibold">
                  {remainingRequests}
                </span>
              </p>
            </CardContent>
          </Card>

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
                    This chart displays the number of requests made in the
                    selected period.
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
              <Bar data={requestsChartData} />
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
