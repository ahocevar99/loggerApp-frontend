// utils/logUtils.ts

export type Log = {
  _id: string;
  project: {
    _id: string;
    projectName: string;
  };
  message: string;
  severity_level: string;
  createdAt: Date | string;
};

export type SortBy = "severity" | "date";
export type TimeFilter = "all" | "24h" | "1h";

const severityOrder: Record<string, number> = {
  debug: 7,
  info: 6,
  notice: 5,
  warning: 4,
  err: 3,
  crit: 2,
  alert: 1,
  emerg: 0,
};

export const filterLogs = (
  logs: Log[],
  selectedProjectId: string,
  timeFilter: TimeFilter
): Log[] => {
  const now = Date.now();

  return logs.filter((log) => {
    const logTime = new Date(log.createdAt).getTime();

    if (timeFilter === "1h" && logTime < now - 3600000) return false;
    if (timeFilter === "24h" && logTime < now - 86400000) return false;

    if (selectedProjectId !== "all" && log.project._id !== selectedProjectId) return false;

    return true;
  });
};

export const sortLogs = (logs: Log[], sortBy: SortBy): Log[] => {
  return logs.slice().sort((a, b) => {
    if (sortBy === "severity") {
      const aVal = severityOrder[a.severity_level.toLowerCase()] ?? 0;
      const bVal = severityOrder[b.severity_level.toLowerCase()] ?? 0;
      return aVal - bVal;
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
};
