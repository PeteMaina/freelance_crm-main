import { useState } from "react";
import {
  Box,
  LinearProgress,
  Typography,
  Slider,
  Stack,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

/**
 * ProgressEditor - Dual-mode project progress display & editor
 *
 * autoProgress: calculated from tasks (read-only)
 * manualProgress: user-override (editable)
 * hasActiveTasks: if true, shows auto as primary
 */
export default function ProgressEditor({
  autoProgress = 0,
  manualProgress = 0,
  hasActiveTasks = false,
  onSave,
  compact = false,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(manualProgress);

  const displayProgress = hasActiveTasks ? autoProgress : manualProgress;

  function handleSave() {
    setEditing(false);
    if (onSave) onSave(draft);
  }

  function progressColor(val) {
    if (val >= 80) return "#2F7A4A";
    if (val >= 50) return "#155E63";
    if (val >= 25) return "#A96A1C";
    return "#B44915";
  }

  if (compact) {
    return (
      <Tooltip
        arrow
        title={
          <Box sx={{ p: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {hasActiveTasks ? "Auto (from tasks)" : "Manual"}:{" "}
              {displayProgress}%
            </Typography>
            {hasActiveTasks && (
              <Typography variant="caption" display="block">
                Manual override: {manualProgress}%
              </Typography>
            )}
          </Box>
        }
      >
        <Box sx={{ minWidth: 90 }}>
          <LinearProgress
            variant="determinate"
            value={displayProgress}
            sx={{
              height: 8,
              borderRadius: 10,
              mb: 0.3,
              bgcolor: "rgba(21,94,99,0.08)",
              "& .MuiLinearProgress-bar": {
                bgcolor: progressColor(displayProgress),
                borderRadius: 10,
              },
            }}
          />
          <Stack direction="row" alignItems="center" spacing={0.3}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                fontFamily: "'IBM Plex Mono', monospace",
                color: progressColor(displayProgress),
              }}
            >
              {displayProgress}%
            </Typography>
            {hasActiveTasks && (
              <AutorenewRoundedIcon
                sx={{ fontSize: 11, color: "text.secondary" }}
              />
            )}
          </Stack>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid rgba(21,94,99,0.12)",
        bgcolor: "rgba(21,94,99,0.02)",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          Project Progress
        </Typography>
        <Stack direction="row" spacing={0.5}>
          {hasActiveTasks && (
            <Chip
              size="small"
              icon={<AutorenewRoundedIcon />}
              label={`Tasks: ${autoProgress}%`}
              variant="outlined"
              sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem" }}
            />
          )}
          <Chip
            size="small"
            icon={editing ? <CheckCircleRoundedIcon /> : <EditRoundedIcon />}
            label={editing ? "Save" : `Manual: ${manualProgress}%`}
            color={editing ? "primary" : "default"}
            variant={editing ? "filled" : "outlined"}
            onClick={editing ? handleSave : () => { setDraft(manualProgress); setEditing(true); }}
            sx={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.72rem",
              cursor: "pointer",
            }}
          />
        </Stack>
      </Stack>

      {/* Main progress bar */}
      <LinearProgress
        variant="determinate"
        value={displayProgress}
        sx={{
          height: 12,
          borderRadius: 10,
          mb: 1,
          bgcolor: "rgba(21,94,99,0.08)",
          "& .MuiLinearProgress-bar": {
            bgcolor: progressColor(displayProgress),
            borderRadius: 10,
            transition: "transform 0.4s ease",
          },
        }}
      />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            fontFamily: "'IBM Plex Mono', monospace",
            color: progressColor(displayProgress),
            fontSize: "1.1rem",
          }}
        >
          {displayProgress}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {hasActiveTasks
            ? "Auto-calculated from completed tasks"
            : "Set manually — add tasks for auto-tracking"}
        </Typography>
      </Stack>

      {/* Editing slider */}
      {editing && (
        <Box sx={{ mt: 2, px: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
            Override progress manually:
          </Typography>
          <Slider
            value={draft}
            onChange={(_, v) => setDraft(v)}
            min={0}
            max={100}
            step={5}
            valueLabelDisplay="auto"
            sx={{
              color: progressColor(draft),
              "& .MuiSlider-thumb": {
                width: 18,
                height: 18,
                "&:hover, &.Mui-focusVisible": {
                  boxShadow: "0 0 0 6px rgba(21,94,99,0.16)",
                },
              },
              "& .MuiSlider-valueLabel": {
                borderRadius: 2,
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 700,
                fontSize: "0.75rem",
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
