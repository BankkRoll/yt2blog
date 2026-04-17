/**
 * @fileoverview Pipeline screen managing blog generation workflow with progress tracking
 * @module cli/screens/Pipeline
 */

import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import type { SetupConfig } from "./Setup.js";
import type { PipelineStep } from "../../gateway/types.js";
import { runPipeline, streamPipeline } from "../../pipeline/index.js";
import { useTheme } from "../theme/index.js";
import { ToolCall, ToolCallGroup } from "../components/ToolCall.js";
import { InfoBox } from "../components/InfoBox.js";
import { TokenUsage } from "../components/TokenUsage.js";
import { ThinkingBlock, StreamingText } from "../components/ThinkingBlock.js";

interface PipelineProps {
  config: SetupConfig;
  onComplete: (blog: string) => void;
  onError: (error: string) => void;
  settings?: Record<string, any>;
}

const STEP_DEFINITIONS = [
  {
    id: "transcript",
    label: "Fetching transcript",
    description: "Getting video captions from YouTube",
  },
  {
    id: "chunk",
    label: "Processing content",
    description: "Segmenting transcript into chunks",
  },
  {
    id: "analyze",
    label: "Analyzing topics",
    description: "Extracting key themes and insights",
  },
  {
    id: "outline",
    label: "Creating outline",
    description: "Building blog structure",
  },
  {
    id: "generate",
    label: "Writing sections",
    description: "Generating content for each section",
  },
  { id: "refine", label: "Polishing blog", description: "Final editing pass" },
];

/** Manages blog generation pipeline with step progress and streaming support. */
export function Pipeline({
  config,
  onComplete,
  onError,
  settings,
}: PipelineProps) {
  const { theme } = useTheme();
  const [steps, setSteps] = useState<PipelineStep[]>(
    STEP_DEFINITIONS.map((def) => ({
      id: def.id,
      label: def.label,
      status: "pending",
      progress: 0,
    })),
  );
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsed, setElapsed] = useState<number>(0);
  const [tokenUsage, setTokenUsage] = useState({ prompt: 0, completion: 0 });
  const [thinkingContent, setThinkingContent] = useState<string>("");
  const [streamingText, setStreamingText] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 100);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    const runStandard = async () => {
      try {
        setStartTime(Date.now());

        const result = await runPipeline({
          videoUrl: config.videoUrl,
          model: config.model,
          config: {
            style: config.style,
            sections: config.sections,
            wordCount: config.wordCount,
          },
          onStep: (step) => {
            setSteps((prev) => prev.map((s) => (s.id === step.id ? step : s)));
            if (step.status === "running") {
              setCurrentStep(step.id);
              const def = STEP_DEFINITIONS.find((d) => d.id === step.id);
              if (def) {
                setThinkingContent(def.description);
              }
            }
          },
          onTokenUsage: (usage) => {
            setTokenUsage({
              prompt: usage.promptTokens,
              completion: usage.completionTokens,
            });
          },
        });

        onComplete(result.blog);
      } catch (error) {
        onError(error instanceof Error ? error.message : "Unknown error");
      }
    };

    const runStreaming = async () => {
      try {
        setStartTime(Date.now());
        setIsStreaming(true);
        let fullText = "";

        const generator = streamPipeline({
          videoUrl: config.videoUrl,
          model: config.model,
          config: {
            style: config.style,
            sections: config.sections,
            wordCount: config.wordCount,
          },
        });

        for await (const event of generator) {
          if (event.type === "step") {
            const step = event.data as PipelineStep;
            setSteps((prev) => prev.map((s) => (s.id === step.id ? step : s)));
            if (step.status === "running") {
              setCurrentStep(step.id);
              const def = STEP_DEFINITIONS.find((d) => d.id === step.id);
              if (def) {
                setThinkingContent(def.description);
              }
            }
          } else if (event.type === "text") {
            fullText += event.data as string;
            setStreamingText(fullText);
          }
        }

        setIsStreaming(false);
        onComplete(fullText);
      } catch (error) {
        setIsStreaming(false);
        onError(error instanceof Error ? error.message : "Unknown error");
      }
    };

    if (settings?.streamOutput) {
      runStreaming();
    } else {
      runStandard();
    }
  }, [config, onComplete, onError, settings?.streamOutput]);

  const formatElapsed = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}.${Math.floor((ms % 1000) / 100)}s`;
  };

  const getToolCallStatus = (step: PipelineStep) => {
    switch (step.status) {
      case "done":
        return "success";
      case "running":
        return "running";
      case "error":
        return "error";
      default:
        return "pending";
    }
  };

  const allDone = steps.every((s) => s.status === "done");
  const hasError = steps.some((s) => s.status === "error");

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color={theme.palette.primary}>
          ◆ Generating Blog
        </Text>
        <Text color={theme.palette.textMuted}> — {formatElapsed(elapsed)}</Text>
      </Box>

      <InfoBox borderStyle="round" width={60}>
        <InfoBox.Header
          icon="📹"
          label="Video"
          description={config.videoUrl.slice(0, 40) + "..."}
        />
        <InfoBox.Row label="Model" value={config.model} />
        <InfoBox.Row label="Style" value={config.style} />
        <InfoBox.Row
          label="Target"
          value={`~${config.wordCount} words, ${config.sections} sections`}
        />
      </InfoBox>

      <Box height={1} />

      <ToolCallGroup title="Pipeline Progress">
        {steps.map((step) => {
          const def = STEP_DEFINITIONS.find((d) => d.id === step.id);
          return (
            <ToolCall
              key={step.id}
              name={step.label}
              description={def?.description}
              status={getToolCallStatus(step)}
              progress={step.progress}
              expanded={step.status === "running"}
            />
          );
        })}
      </ToolCallGroup>

      {currentStep && !allDone && !hasError && !isStreaming && (
        <Box marginTop={1}>
          <ThinkingBlock
            title="Processing"
            content={thinkingContent}
            isThinking={true}
            expanded={true}
          />
        </Box>
      )}

      {isStreaming && streamingText && (
        <Box marginTop={1} flexDirection="column">
          <Text color={theme.palette.info} bold>
            ◆ Live Generation
          </Text>
          <Box
            marginTop={1}
            borderStyle="round"
            borderColor={theme.palette.border}
            paddingX={1}
            height={10}
          >
            <StreamingText
              text={streamingText.slice(-500)}
              isStreaming={true}
            />
          </Box>
          <Text color={theme.palette.textMuted}>
            {streamingText.split(/\s+/).length} words generated...
          </Text>
        </Box>
      )}

      <Box marginTop={2}>
        {allDone ? (
          <Box>
            <Text color={theme.palette.success}>✓ </Text>
            <Text color={theme.palette.success}>
              Blog generated successfully!
            </Text>
          </Box>
        ) : hasError ? (
          <Box>
            <Text color={theme.palette.error}>✗ </Text>
            <Text color={theme.palette.error}>
              An error occurred during generation
            </Text>
          </Box>
        ) : (
          <Box>
            <Text color={theme.palette.primary}>◆ </Text>
            <Text color={theme.palette.textMuted}>
              Processing... Press q to cancel
            </Text>
          </Box>
        )}
      </Box>

      {settings?.showTokenUsage &&
        (tokenUsage.prompt > 0 || tokenUsage.completion > 0) && (
          <Box marginTop={1}>
            <TokenUsage
              promptTokens={tokenUsage.prompt}
              completionTokens={tokenUsage.completion}
              compact={true}
            />
          </Box>
        )}
    </Box>
  );
}
