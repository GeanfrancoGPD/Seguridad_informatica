import React, { useMemo } from "react";
import { Box, Text, useStdout } from "ink";

export function ProTable({
  data,
  selected = 0,
  page = 0,
  totalPages = 1,
  pageSize = 10,
}) {
  const { stdout } = useStdout();
  const terminalWidth = stdout.columns || 100;
  const terminalHeight = stdout.rows || 30;

  if (!data || data.length === 0) {
    return <Text>No data</Text>;
  }

  const headers = Object.keys(data[0]);

  // Auto column width
  const colWidths = useMemo(() => {
    return headers.map((header) => {
      const maxContent = Math.max(
        header.length,
        ...data.map((row) => String(row[header]).length),
      );
      return maxContent + 2;
    });
  }, [data]);

  // Scroll real vertical
  const visibleRows = terminalHeight - 8;
  const scrollOffset = selected >= visibleRows ? selected - visibleRows + 1 : 0;

  const visibleData = data.slice(scrollOffset, scrollOffset + visibleRows);

  const horizontalLine =
    "┌" + colWidths.map((w) => "─".repeat(w)).join("┬") + "┐";

  const middleLine = "├" + colWidths.map((w) => "─".repeat(w)).join("┼") + "┤";

  const bottomLine = "└" + colWidths.map((w) => "─".repeat(w)).join("┴") + "┘";

  const renderRow = (row, isHeader = false, isSelected = false) => {
    return (
      "│" +
      headers
        .map((header, i) => {
          const content = isHeader ? header : String(row[header]);
          return content.padEnd(colWidths[i], " ");
        })
        .join("│") +
      "│"
    );
  };

  return (
    <Box flexDirection="column">
      <Text color="yellow">
        Page {page + 1}/{totalPages}
      </Text>
      <Text color="gray">{horizontalLine}</Text>
      <Text bold color="cyan">
        {renderRow(null, true)}
      </Text>
      <Text color="gray">{middleLine}</Text>

      {visibleData.map((row, i) => {
        const realIndex = i + scrollOffset;
        const isSelected = realIndex === selected;

        return (
          <Text
            key={realIndex}
            backgroundColor={isSelected ? "blue" : undefined}
            color={isSelected ? "white" : undefined}
          >
            {renderRow(row, false)}
          </Text>
        );
      })}

      <Text color="gray">{bottomLine}</Text>

      <Box marginTop={1}>
        <Text color="yellow">
          | ↑ ↓ Scroll | ← → Pages | Enter Select | / search | Esc Clear
        </Text>
      </Box>
    </Box>
  );
}
