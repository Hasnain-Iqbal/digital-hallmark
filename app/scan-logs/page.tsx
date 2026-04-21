"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import AuthGuard from "../../components/AuthGuard";
import { Sidebar } from "../../components/Sidebar";
import { useAuth } from "../../components/AuthProvider";
import { log } from "util";

type FirestoreTimestamp = { seconds: number; nanoseconds: number };

interface ScanLog {
  id: string;
  deviceName: string;
  email: string;
  phoneNumber: string;
  whoScanned: string;
  productName?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  time?: string | FirestoreTimestamp;
}

function formatTimestamp(value?: string | FirestoreTimestamp) {
  if (!value) return "Unknown";
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? value
      : parsed.toLocaleString();
  }
  return new Date(value.seconds * 1000).toLocaleString();
}

export default function ScanLogsPage() {
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { logout } = useAuth();
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;  
  const currentLogs = logs.slice(startIndex, endIndex);  
  const goToPage = (page: number) => {
  setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  const goToPrevious = () => goToPage(currentPage - 1);
  const goToNext = () => goToPage(currentPage + 1);
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const snapshot = await getDocs(collection(db, "digilusData"));

        const logList: any = snapshot.docs
        .map((doc) => {
            const data = doc.data();

            if (!data?.lastScanned) return null;

            const scan = data.lastScanned;

            return {
            id: doc.id,

            // from lastScanned
            deviceName: scan.deviceName || "—",
            email: scan.email || "—",
            phoneNumber: scan.phoneNumber || "—",
            whoScanned: scan.whoScanned || "—",
            time: scan.time,

            // ✅ from root level (IMPORTANT FIX)
            productName: data.product_name || "—",
            locationName: data.location || "—",
            latitude: data.latitude,
            longitude: data.longitude,
            };
        })
        .filter(Boolean)
          .sort((a:any, b:any) => {
            const getTime = (value?: any) => {
              if (!value) return 0;
              if (typeof value === "string") return new Date(value).getTime();
              return value.seconds * 1000;
            };
            return getTime(b.time) - getTime(a.time);
          });

        setLogs(logList);
      } catch (err) {
        console.error("Error fetching scan logs:", err);
        setError("Unable to load scan logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
        <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
          <Sidebar />

          <main className="space-y-8">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6">
              <div className="flex justify-between items-center">
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                  Scan Logs
                </p>
                <button
                  onClick={() => void logout()}
                  className="rounded-full bg-slate-700 px-5 py-2 text-sm hover:bg-slate-600"
                >
                  Sign out
                </button>
              </div>
            </section>

            {error && (
              <div className="rounded-xl border border-red-800 bg-red-950/20 p-4 text-red-400">
                {error}
              </div>
            )}

            <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6">
              <div className="mb-6 flex justify-between items-center">
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                  All Scan Logs
                </p>
                <span className="text-xs text-slate-400">
                  {logs.length} records
                </span>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
                <table className="min-w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900 text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Scanned By</th>
                      <th className="px-6 py-4">Device</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-6 py-4">Date, Time</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-800 rounded" /></td>
                          <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-800 rounded" /></td>
                          <td className="px-6 py-4"><div className="h-4 w-28 bg-slate-800 rounded" /></td>
                          <td className="px-6 py-4"><div className="h-4 w-28 bg-slate-800 rounded" /></td>
                          <td className="px-6 py-4"><div className="h-4 w-36 bg-slate-800 rounded" /></td>
                        </tr>
                      ))
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-slate-400">
                          No scan logs found.
                        </td>
                      </tr>
                    ) : (
                      currentLogs.map((log) => (
                        <tr key={log.id} className="border-t border-slate-800 hover:bg-slate-900/70">
                          <td className="px-6 py-4 text-white">{log.productName}</td>
                          <td className="px-6 py-4">
                            {log.latitude && log.longitude ? (
                                <a
                                href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:underline"
                                >
                                {log.locationName}
                                </a>
                            ) : (
                                log.locationName || "—"
                            )}
                          </td>
                          <td className="px-6 py-4">{log.whoScanned}</td>
                          <td className="px-6 py-4 text-white">{log.deviceName}</td>
                          <td className="px-6 py-4">{log.email}</td>
                          <td className="px-6 py-4">{log.phoneNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatTimestamp(log.time)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                    Showing {startIndex + 1} to {Math.min(endIndex, logs.length)} of {logs.length} records
                    </div>

                    <div className="flex items-center gap-2">
                    <button
                        onClick={goToPrevious}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNumber =
                            Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;

                        if (pageNumber > totalPages) return null;

                        return (
                            <button
                            key={pageNumber}
                            onClick={() => goToPage(pageNumber)}
                            className={`px-3 py-2 text-sm rounded-lg ${
                                currentPage === pageNumber
                                ? "bg-cyan-500 text-slate-950"
                                : "border border-slate-700 text-slate-300 hover:bg-slate-800"
                            }`}
                            >
                            {pageNumber}
                            </button>
                        );
                        })}
                    </div>

                    <button
                        onClick={goToNext}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                    >
                        Next
                    </button>
                    </div>
                </div>
                )}
            </section>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}