/**
 * @fileoverview Interactive model selector with search, filtering, and sorting
 * @module cli/components/ModelSelector
 */

import { Box, Text, useInput } from "ink";
import { useEffect, useMemo, useState } from "react";
import { GatewayModel, getAvailableModels } from "../../gateway/index.js";

import { useTheme } from "../theme/index.js";

type SortOption = "name" | "provider" | "price-asc" | "price-desc" | "context";
type ProviderFilter = "all" | string;

interface ModelSelectorProps {
  onSelect: (modelId: string) => void;
  onCancel?: () => void;
  defaultModel?: string;
  showPricing?: boolean;
}

function formatPrice(price?: number): string {
  if (price === undefined || price === null) return "-";
  const perMillion = price * 1000000;
  if (perMillion < 0.01) return "<$0.01/M";
  if (perMillion < 1) return `$${perMillion.toFixed(2)}/M`;
  return `$${perMillion.toFixed(1)}/M`;
}

function formatContext(context?: number): string {
  if (!context) return "-";
  if (context >= 1000000) return `${(context / 1000000).toFixed(1)}M`;
  return `${Math.round(context / 1000)}K`;
}

/** Interactive model picker with search, filtering, and custom model input. */
export function ModelSelector({
  onSelect,
  onCancel,
  defaultModel,
  showPricing = true,
}: ModelSelectorProps) {
  const { theme } = useTheme();
  const [models, setModels] = useState<GatewayModel[]>([]);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<"list" | "search" | "custom">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [filterProvider, setFilterProvider] = useState<ProviderFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function loadModels() {
      setLoading(true);
      const fetchedModels = await getAvailableModels();
      setModels(fetchedModels);
      setLoading(false);
    }
    loadModels();
  }, []);

  const providers = useMemo(() => {
    const unique = [...new Set(models.map((m) => m.provider).filter(Boolean))];
    return unique.sort();
  }, [models]);

  const filteredModels = useMemo(() => {
    let result = [...models];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.id.toLowerCase().includes(query) ||
          m.name.toLowerCase().includes(query) ||
          m.provider?.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query),
      );
    }

    if (filterProvider !== "all") {
      result = result.filter((m) => m.provider === filterProvider);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "provider":
          return (a.provider || "").localeCompare(b.provider || "");
        case "price-asc":
          return (a.pricing?.input || 0) - (b.pricing?.input || 0);
        case "price-desc":
          return (b.pricing?.input || 0) - (a.pricing?.input || 0);
        case "context":
          return (b.contextWindow || 0) - (a.contextWindow || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [models, searchQuery, filterProvider, sortBy]);

  useEffect(() => {
    if (selectedIndex >= filteredModels.length) {
      setSelectedIndex(Math.max(0, filteredModels.length - 1));
    }
  }, [filteredModels.length, selectedIndex]);

  useEffect(() => {
    if (defaultModel && filteredModels.length > 0) {
      const idx = filteredModels.findIndex((m) => m.id === defaultModel);
      if (idx >= 0) setSelectedIndex(idx);
    }
  }, [defaultModel, filteredModels]);

  const maxVisible = 10;
  const startIndex = Math.max(0, selectedIndex - Math.floor(maxVisible / 2));
  const visibleModels = filteredModels.slice(
    startIndex,
    startIndex + maxVisible,
  );

  useInput((input, key) => {
    if (key.escape) {
      if (mode === "search") {
        setMode("list");
        setSearchQuery("");
      } else if (mode === "custom") {
        setMode("list");
        setCustomInput("");
      } else if (showFilters) {
        setShowFilters(false);
      } else if (onCancel) {
        onCancel();
      }
      return;
    }

    if (mode === "search") {
      if (key.return) {
        setMode("list");
      } else if (key.backspace || key.delete) {
        setSearchQuery((prev) => prev.slice(0, -1));
      } else if (input && !key.ctrl && !key.meta) {
        setSearchQuery((prev) => prev + input);
      }
      return;
    }

    if (mode === "custom") {
      if (key.return && customInput.trim()) {
        onSelect(customInput.trim());
      } else if (key.backspace || key.delete) {
        setCustomInput((prev) => prev.slice(0, -1));
      } else if (input && !key.ctrl && !key.meta) {
        setCustomInput((prev) => prev + input);
      }
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(filteredModels.length - 1, prev + 1));
    } else if (key.return) {
      if (filteredModels[selectedIndex]) {
        onSelect(filteredModels[selectedIndex].id);
      }
    } else if (input === "/" || input === "s") {
      setMode("search");
      setSearchQuery("");
    } else if (input === "c") {
      setMode("custom");
      setCustomInput("");
    } else if (input === "f") {
      setShowFilters((prev) => !prev);
    } else if (input === "1") {
      setSortBy("name");
    } else if (input === "2") {
      setSortBy("provider");
    } else if (input === "3") {
      setSortBy("price-asc");
    } else if (input === "4") {
      setSortBy("price-desc");
    } else if (input === "5") {
      setSortBy("context");
    } else if (key.tab && showFilters) {
      const currentIdx = providers.indexOf(filterProvider);
      const nextIdx = (currentIdx + 1) % (providers.length + 1);
      setFilterProvider(nextIdx === 0 ? "all" : providers[nextIdx - 1]);
    }
  });

  if (loading) {
    return (
      <Box flexDirection="column">
        <Text color={theme.palette.primary}>Loading models...</Text>
        <Text color={theme.palette.textDim}>Fetching from AI Gateway</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color={theme.palette.primary}>
          Select Model
        </Text>
        <Text color={theme.palette.textMuted}>
          {" "}
          — {filteredModels.length} available
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color={theme.palette.textDim}>
          {mode === "search"
            ? "Type to search • Enter to confirm • Esc to cancel"
            : mode === "custom"
              ? "Enter model string (provider/model) • Esc to cancel"
              : "↑↓ Navigate • Enter Select • / Search • c Custom • f Filters"}
        </Text>
      </Box>

      {mode === "search" && (
        <Box marginBottom={1}>
          <Text color={theme.palette.primary}>Search: </Text>
          <Text>{searchQuery}</Text>
          <Text color={theme.palette.primary}>█</Text>
        </Box>
      )}

      {mode === "list" && searchQuery && (
        <Box marginBottom={1}>
          <Text color={theme.palette.info}>
            Filtering: "{searchQuery}" ({filteredModels.length} results)
          </Text>
        </Box>
      )}

      {mode === "custom" && (
        <Box marginBottom={1} flexDirection="column">
          <Text color={theme.palette.warning}>Custom Model String:</Text>
          <Box>
            <Text color={theme.palette.primary}>❯ </Text>
            <Text>{customInput}</Text>
            <Text color={theme.palette.primary}>█</Text>
          </Box>
          <Text color={theme.palette.textDim}>
            Example: openai/gpt-4o, anthropic/claude-sonnet-4,
            groq/llama-3.3-70b
          </Text>
        </Box>
      )}

      {showFilters && mode === "list" && (
        <Box
          marginBottom={1}
          borderStyle="single"
          borderColor={theme.palette.border}
          paddingX={1}
          flexDirection="column"
        >
          <Text bold color={theme.palette.primary}>
            Filters & Sort
          </Text>

          <Box marginTop={1}>
            <Text color={theme.palette.textMuted}>Provider: </Text>
            <Text
              color={
                filterProvider === "all"
                  ? theme.palette.primary
                  : theme.palette.text
              }
            >
              {filterProvider === "all" ? "[All]" : filterProvider}
            </Text>
            <Text color={theme.palette.textDim}> (Tab to cycle)</Text>
          </Box>

          <Box marginTop={1}>
            <Text color={theme.palette.textMuted}>Sort: </Text>
            <Text
              color={
                sortBy === "name"
                  ? theme.palette.primary
                  : theme.palette.textDim
              }
            >
              [1]Name{" "}
            </Text>
            <Text
              color={
                sortBy === "provider"
                  ? theme.palette.primary
                  : theme.palette.textDim
              }
            >
              [2]Provider{" "}
            </Text>
            <Text
              color={
                sortBy === "price-asc"
                  ? theme.palette.primary
                  : theme.palette.textDim
              }
            >
              [3]Price↑{" "}
            </Text>
            <Text
              color={
                sortBy === "price-desc"
                  ? theme.palette.primary
                  : theme.palette.textDim
              }
            >
              [4]Price↓{" "}
            </Text>
            <Text
              color={
                sortBy === "context"
                  ? theme.palette.primary
                  : theme.palette.textDim
              }
            >
              [5]Context
            </Text>
          </Box>
        </Box>
      )}

      {mode === "list" && (
        <Box marginBottom={1}>
          <Box width={3}>
            <Text color={theme.palette.textDim}> </Text>
          </Box>
          <Box width={30}>
            <Text color={theme.palette.textDim} bold>
              Model
            </Text>
          </Box>
          <Box width={12}>
            <Text color={theme.palette.textDim} bold>
              Provider
            </Text>
          </Box>
          {showPricing && (
            <>
              <Box width={12}>
                <Text color={theme.palette.textDim} bold>
                  Input
                </Text>
              </Box>
              <Box width={12}>
                <Text color={theme.palette.textDim} bold>
                  Output
                </Text>
              </Box>
            </>
          )}
          <Box width={8}>
            <Text color={theme.palette.textDim} bold>
              Context
            </Text>
          </Box>
        </Box>
      )}

      {mode === "list" && (
        <Box flexDirection="column">
          {startIndex > 0 && (
            <Text color={theme.palette.textDim}> ↑ {startIndex} more</Text>
          )}

          {visibleModels.map((model, idx) => {
            const actualIndex = startIndex + idx;
            const isSelected = actualIndex === selectedIndex;

            return (
              <Box key={model.id}>
                <Box width={3}>
                  <Text
                    color={
                      isSelected ? theme.palette.primary : theme.palette.text
                    }
                  >
                    {isSelected ? "❯ " : "  "}
                  </Text>
                </Box>
                <Box width={30}>
                  <Text
                    color={
                      isSelected ? theme.palette.primary : theme.palette.text
                    }
                    bold={isSelected}
                  >
                    {model.name.slice(0, 28)}
                  </Text>
                </Box>
                <Box width={12}>
                  <Text color={theme.palette.textMuted}>
                    {model.provider?.slice(0, 10)}
                  </Text>
                </Box>
                {showPricing && (
                  <>
                    <Box width={12}>
                      <Text color={theme.palette.success}>
                        {formatPrice(model.pricing?.input)}
                      </Text>
                    </Box>
                    <Box width={12}>
                      <Text color={theme.palette.warning}>
                        {formatPrice(model.pricing?.output)}
                      </Text>
                    </Box>
                  </>
                )}
                <Box width={8}>
                  <Text color={theme.palette.info}>
                    {formatContext(model.contextWindow)}
                  </Text>
                </Box>
              </Box>
            );
          })}

          {startIndex + maxVisible < filteredModels.length && (
            <Text color={theme.palette.textDim}>
              {" "}
              ↓ {filteredModels.length - startIndex - maxVisible} more
            </Text>
          )}
        </Box>
      )}

      {mode === "list" && filteredModels.length === 0 && (
        <Box>
          <Text color={theme.palette.warning}>
            No models found. Try a different search or press 'c' for custom
            input.
          </Text>
        </Box>
      )}

      {mode === "list" && filteredModels[selectedIndex] && (
        <Box
          marginTop={1}
          borderStyle="round"
          borderColor={theme.palette.border}
          paddingX={1}
          flexDirection="column"
        >
          <Text bold color={theme.palette.primary}>
            {filteredModels[selectedIndex].name}
          </Text>
          <Text color={theme.palette.textDim}>
            ID: {filteredModels[selectedIndex].id}
          </Text>
          {filteredModels[selectedIndex].description && (
            <Text color={theme.palette.textMuted}>
              {filteredModels[selectedIndex].description}
            </Text>
          )}
          {filteredModels[selectedIndex].maxOutputTokens && (
            <Text color={theme.palette.textMuted}>
              Max output:{" "}
              {formatContext(filteredModels[selectedIndex].maxOutputTokens)}{" "}
              tokens
            </Text>
          )}
        </Box>
      )}

      {showPricing && mode === "list" && (
        <Box marginTop={1}>
          <Text color={theme.palette.textDim}>
            Prices per 1M tokens • /M = per million
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default ModelSelector;
