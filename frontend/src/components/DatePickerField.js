import { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  Popover,
  IconButton,
  Typography,
  Stack,
  Button,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function startDayOfWeek(year, month) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Monday = 0
}

function toISOString(y, m, d, time = "") {
  const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  return time ? `${dateStr}T${time}` : dateStr;
}

function parseISO(str) {
  if (!str) return null;
  const [datePart, timePart] = str.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { year: y, month: m - 1, day: d, time: timePart || "12:00" };
}

export default function DatePickerField({
  label = "Date",
  value = "",
  onChange,
  fullWidth = true,
  required = false,
  showTime = false,
  size,
  ...rest
}) {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const parsed = parseISO(value);
  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  const [viewYear, setViewYear] = useState(parsed?.year ?? todayY);
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? todayM);
  const [viewTime, setViewTime] = useState(parsed?.time ?? "12:00");

  useEffect(() => {
    if (open) {
      const p = parseISO(value);
      setViewYear(p?.year ?? todayY);
      setViewMonth(p?.month ?? todayM);
      setViewTime(p?.time ?? "12:00");
    }
  }, [open, value]);

  const total = daysInMonth(viewYear, viewMonth);
  const offset = startDayOfWeek(viewYear, viewMonth);

  function navigate(dir) {
    let m = viewMonth + dir;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth(m);
    setViewYear(y);
  }

  function pick(day) {
    onChange(toISOString(viewYear, viewMonth, day, showTime ? viewTime : ""));
    if (!showTime) setOpen(false);
  }

  function handleTimeChange(e) {
    const newTime = e.target.value;
    setViewTime(newTime);
    if (parsed) {
      onChange(toISOString(viewYear, viewMonth, parsed.day, newTime));
    }
  }

  function setToday() {
    const time = showTime ? (new Date().toTimeString().slice(0, 5)) : "";
    onChange(toISOString(todayY, todayM, todayD, time));
    setOpen(false);
  }

  function clear() {
    onChange("");
    setOpen(false);
  }

  const displayValue = value
    ? new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: showTime ? "2-digit" : undefined,
        minute: showTime ? "2-digit" : undefined,
      })
    : "";

  return (
    <>
      <TextField
        ref={anchorRef}
        label={label}
        value={displayValue}
        placeholder={showTime ? "Pick date & time" : "Pick a date"}
        fullWidth={fullWidth}
        required={required}
        size={size}
        onClick={() => setOpen(true)}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); setOpen(true); }}
              sx={{ color: "primary.main" }}
            >
              {showTime ? <AccessTimeRoundedIcon fontSize="small" /> : <CalendarTodayRoundedIcon fontSize="small" />}
            </IconButton>
          ),
          sx: { cursor: "pointer" },
        }}
        {...rest}
      />
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 2,
              borderRadius: 2,
              minWidth: 300,
              bgcolor: "background.paper",
              border: "1px solid rgba(21,94,99,0.18)",
              boxShadow: "0 16px 36px rgba(21,94,99,0.14)",
            },
          },
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1.5 }}
        >
          <IconButton size="small" onClick={() => navigate(-1)}>
            <ChevronLeftRoundedIcon />
          </IconButton>
          <Typography
            sx={{ fontWeight: 700, fontSize: "0.95rem", userSelect: "none" }}
          >
            {MONTHS[viewMonth]} {viewYear}
          </Typography>
          <IconButton size="small" onClick={() => navigate(1)}>
            <ChevronRightRoundedIcon />
          </IconButton>
        </Stack>

        {/* Day headers */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: "2px",
            mb: 0.5,
          }}
        >
          {DAYS.map((d) => (
            <Box
              key={d}
              sx={{
                textAlign: "center",
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "text.secondary",
                fontFamily: "'IBM Plex Mono', monospace",
                py: 0.3,
              }}
            >
              {d}
            </Box>
          ))}
        </Box>

        {/* Day grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: "3px",
          }}
        >
          {Array.from({ length: offset }, (_, i) => (
            <Box key={`empty-${i}`} />
          ))}
          {Array.from({ length: total }, (_, i) => {
            const day = i + 1;
            const isoDate = toISOString(viewYear, viewMonth, day);
            const isSelected = parsed?.year === viewYear && parsed?.month === viewMonth && parsed?.day === day;
            const isToday =
              viewYear === todayY &&
              viewMonth === todayM &&
              day === todayD;

            return (
              <Box
                key={day}
                onClick={() => pick(day)}
                sx={{
                  textAlign: "center",
                  py: 0.6,
                  fontSize: "0.85rem",
                  fontWeight: isSelected || isToday ? 700 : 400,
                  borderRadius: 1,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  position: "relative",
                  color: isSelected
                    ? "#fff"
                    : isToday
                    ? "primary.main"
                    : "text.primary",
                  bgcolor: isSelected
                    ? "primary.main"
                    : "transparent",
                  border: isToday && !isSelected
                    ? "1.5px solid"
                    : "1.5px solid transparent",
                  borderColor: isToday && !isSelected
                    ? "primary.main"
                    : "transparent",
                  "&:hover": {
                    bgcolor: isSelected
                      ? "primary.dark"
                      : "rgba(21,94,99,0.10)",
                  },
                }}
              >
                {day}
              </Box>
            );
          })}
        </Box>

        {/* Time Picker Section */}
        {showTime && (
          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <AccessTimeRoundedIcon fontSize="small" color="action" />
              <TextField
                type="time"
                size="small"
                value={viewTime}
                onChange={handleTimeChange}
                sx={{
                  flex: 1,
                  "& .MuiInputBase-input": {
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }
                }}
              />
            </Stack>
          </Box>
        )}

        {/* Footer */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="space-between"
          sx={{ mt: 1.5 }}
        >
          <Button
            size="small"
            startIcon={<TodayRoundedIcon />}
            onClick={setToday}
            sx={{ fontSize: "0.78rem" }}
          >
            Today
          </Button>
          <Box sx={{ flex: 1 }} />
          {showTime && (
             <Button
             variant="contained"
             size="small"
             onClick={() => setOpen(false)}
             sx={{ fontSize: "0.78rem", px: 2 }}
           >
             OK
           </Button>
          )}
          <Button
            size="small"
            color="inherit"
            onClick={clear}
            sx={{ fontSize: "0.78rem", color: "text.secondary" }}
          >
            Clear
          </Button>
        </Stack>
      </Popover>
    </>
  );
}
