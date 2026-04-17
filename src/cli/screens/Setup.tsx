/**
 * @fileoverview Setup wizard for configuring blog generation options
 * @module cli/screens/Setup
 */

import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "../theme/index.js";
import {
  DEFAULT_MODEL,
  getStyleInfo,
  BLOG_STYLES,
} from "../../prompts/styles.js";
import { InfoBox } from "../components/InfoBox.js";
import { ModelSelector } from "../components/ModelSelector.js";

const STYLES = BLOG_STYLES;

const PROVIDER_ENV_VARS: Record<string, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  google: "GOOGLE_API_KEY",
  groq: "GROQ_API_KEY",
};

/** Configuration returned by the setup wizard. */
export interface SetupConfig {
  videoUrl: string;
  model: string;
  style: string;
  sections: number;
  wordCount: number;
  byok?: Record<string, string>;
}

interface SetupProps {
  onComplete: (config: SetupConfig) => void;
  defaultModel?: string;
}

/** Setup wizard guiding user through configuration steps. */
export function Setup({ onComplete, defaultModel }: SetupProps) {
  const { theme } = useTheme();
  const [step, setStep] = useState<
    "url" | "model" | "style" | "sections" | "wordCount" | "apiKey"
  >("url");
  const [config, setConfig] = useState<SetupConfig>({
    videoUrl: "",
    model: defaultModel || DEFAULT_MODEL,
    style: "seo",
    sections: 5,
    wordCount: 1500,
    byok: {},
  });
  const [inputValue, setInputValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hasGatewayKey, setHasGatewayKey] = useState(false);
  const [hasProviderKey, setHasProviderKey] = useState(false);

  useEffect(() => {
    const gatewayKey = process.env.AI_GATEWAY_API_KEY;
    const provider = config.model?.split("/")[0];
    const providerEnvVar = PROVIDER_ENV_VARS[provider];
    const providerKey = providerEnvVar ? process.env[providerEnvVar] : null;

    setHasGatewayKey(!!gatewayKey);
    setHasProviderKey(!!providerKey);
  }, [config.model]);

  const getStepStatus = (stepName: string): "done" | "active" | "pending" => {
    const stepOrder = [
      "url",
      "model",
      "style",
      "sections",
      "wordCount",
      "apiKey",
    ];
    const currentIndex = stepOrder.indexOf(step);
    const stepIndex = stepOrder.indexOf(stepName);

    if (stepIndex < currentIndex) return "done";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  const getStepIcon = (stepName: string) => {
    const status = getStepStatus(stepName);
    if (status === "done") return { icon: "●", color: theme.palette.success };
    if (status === "active") return { icon: "◇", color: theme.palette.primary };
    return { icon: "○", color: theme.palette.textDim };
  };

  useInput((input, key) => {
    if (step === "model") {
      return;
    }

    if (step === "url" || step === "apiKey") {
      if (key.return) {
        if (step === "url") {
          if (inputValue.trim()) {
            setConfig((prev) => ({ ...prev, videoUrl: inputValue.trim() }));
            setInputValue("");
            setStep("model");
          }
        } else if (step === "apiKey") {
          const provider = config.model?.split("/")[0];
          if (inputValue.trim() && provider) {
            const updatedConfig = {
              ...config,
              byok: { ...config.byok, [provider]: inputValue.trim() },
            };
            onComplete(updatedConfig);
          }
        }
      } else if (key.backspace || key.delete) {
        setInputValue((prev) => prev.slice(0, -1));
      } else if (input && !key.ctrl && !key.meta) {
        setInputValue((prev) => prev + input);
      }
    } else {
      if (key.upArrow) {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        if (step === "style") {
          setSelectedIndex((prev) => Math.min(STYLES.length - 1, prev + 1));
        }
      } else if (key.leftArrow) {
        if (step === "sections") {
          setConfig((prev) => ({
            ...prev,
            sections: Math.max(3, (prev.sections || 5) - 1),
          }));
        } else if (step === "wordCount") {
          setConfig((prev) => ({
            ...prev,
            wordCount: Math.max(500, (prev.wordCount || 1500) - 100),
          }));
        }
      } else if (key.rightArrow) {
        if (step === "sections") {
          setConfig((prev) => ({
            ...prev,
            sections: Math.min(10, (prev.sections || 5) + 1),
          }));
        } else if (step === "wordCount") {
          setConfig((prev) => ({
            ...prev,
            wordCount: Math.min(5000, (prev.wordCount || 1500) + 100),
          }));
        }
      } else if (key.return) {
        if (step === "style") {
          setConfig((prev) => ({ ...prev, style: STYLES[selectedIndex] }));
          setStep("sections");
        } else if (step === "sections") {
          setStep("wordCount");
        } else if (step === "wordCount") {
          if (hasGatewayKey || hasProviderKey) {
            onComplete(config);
          } else {
            setStep("apiKey");
          }
        }
      }
    }
  });

  const provider = config.model?.split("/")[0];
  const providerEnvVar =
    PROVIDER_ENV_VARS[provider] || `${provider?.toUpperCase()}_API_KEY`;

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color={theme.palette.primary}>
          ◆ Setup
        </Text>
        <Text color={theme.palette.textMuted}>
          {" "}
          — Configure your blog generation
        </Text>
      </Box>

      <Box marginBottom={1}>
        {hasGatewayKey ? (
          <Box>
            <Text backgroundColor={theme.palette.success} color="black">
              {" "}
              ✓{" "}
            </Text>
            <Text color={theme.palette.success}>
              {" "}
              AI_GATEWAY_API_KEY detected
            </Text>
          </Box>
        ) : hasProviderKey ? (
          <Box>
            <Text backgroundColor={theme.palette.success} color="black">
              {" "}
              ✓{" "}
            </Text>
            <Text color={theme.palette.success}>
              {" "}
              {providerEnvVar} detected
            </Text>
          </Box>
        ) : (
          <Box>
            <Text backgroundColor={theme.palette.warning} color="black">
              {" "}
              !{" "}
            </Text>
            <Text color={theme.palette.warning}>
              {" "}
              No API key found (will prompt)
            </Text>
          </Box>
        )}
      </Box>

      <StepRow
        icon={getStepIcon("url")}
        label="YouTube URL"
        hint={step === "url" ? "paste video URL" : undefined}
      >
        {step === "url" ? (
          <Box>
            <Text color={theme.palette.primary}>❯ </Text>
            <Text>{inputValue || ""}</Text>
            <Text color={theme.palette.primary}>█</Text>
            {!inputValue && (
              <Text color={theme.palette.textDim}>
                {" "}
                https://youtube.com/watch?v=...
              </Text>
            )}
          </Box>
        ) : config.videoUrl ? (
          <Text color={theme.palette.textMuted}>
            {config.videoUrl.slice(0, 50)}...
          </Text>
        ) : null}
      </StepRow>

      {config.videoUrl && <Connector color={theme.palette.textDim} />}

      {(step === "model" || config.videoUrl) && (
        <>
          <StepRow
            icon={getStepIcon("model")}
            label="Model"
            hint={step === "model" ? "↑↓ /, c custom" : undefined}
          >
            {step === "model" ? (
              <Box marginTop={1}>
                <ModelSelector
                  defaultModel={config.model}
                  showPricing={true}
                  onSelect={(modelId) => {
                    setConfig((prev) => ({ ...prev, model: modelId }));
                    setSelectedIndex(0);
                    setStep("style");
                  }}
                />
              </Box>
            ) : getStepStatus("model") === "done" ? (
              <Text color={theme.palette.textMuted}>{config.model}</Text>
            ) : null}
          </StepRow>
          {getStepStatus("model") === "done" && (
            <Connector color={theme.palette.textDim} />
          )}
        </>
      )}

      {(step === "style" || getStepStatus("style") === "done") && (
        <>
          <StepRow
            icon={getStepIcon("style")}
            label="Blog Style"
            hint={step === "style" ? "↑↓ select" : undefined}
          >
            {step === "style" ? (
              <Box flexDirection="column">
                {STYLES.map((style, i) => {
                  const info = getStyleInfo(style);
                  return (
                    <Box key={style}>
                      <Text
                        color={
                          i === selectedIndex
                            ? theme.palette.primary
                            : theme.palette.text
                        }
                      >
                        {i === selectedIndex ? "❯ " : "  "}
                        {info.name}
                      </Text>
                      <Text color={theme.palette.textDim}>
                        {" "}
                        — {info.description}
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            ) : getStepStatus("style") === "done" ? (
              <Text color={theme.palette.textMuted}>
                {getStyleInfo(config.style).name}
              </Text>
            ) : null}
          </StepRow>
          {getStepStatus("style") === "done" && (
            <Connector color={theme.palette.textDim} />
          )}
        </>
      )}

      {(step === "sections" || getStepStatus("sections") === "done") && (
        <>
          <StepRow
            icon={getStepIcon("sections")}
            label="Sections"
            hint={step === "sections" ? "←→ adjust" : undefined}
          >
            {step === "sections" ? (
              <Box>
                <Text color={theme.palette.primary}>◀ </Text>
                <Text bold color={theme.palette.text}>
                  {config.sections}
                </Text>
                <Text color={theme.palette.primary}> ▶</Text>
                <Text color={theme.palette.textDim}> sections</Text>
              </Box>
            ) : getStepStatus("sections") === "done" ? (
              <Text color={theme.palette.textMuted}>
                {config.sections} sections
              </Text>
            ) : null}
          </StepRow>
          {getStepStatus("sections") === "done" && (
            <Connector color={theme.palette.textDim} />
          )}
        </>
      )}

      {(step === "wordCount" || getStepStatus("wordCount") === "done") && (
        <>
          <StepRow
            icon={getStepIcon("wordCount")}
            label="Word Count"
            hint={step === "wordCount" ? "←→ adjust (±100)" : undefined}
          >
            {step === "wordCount" ? (
              <Box>
                <Text color={theme.palette.primary}>◀ </Text>
                <Text bold color={theme.palette.text}>
                  {config.wordCount}
                </Text>
                <Text color={theme.palette.primary}> ▶</Text>
                <Text color={theme.palette.textDim}> words</Text>
              </Box>
            ) : getStepStatus("wordCount") === "done" ? (
              <Text color={theme.palette.textMuted}>
                ~{config.wordCount} words
              </Text>
            ) : null}
          </StepRow>
        </>
      )}

      {step === "apiKey" && (
        <>
          <Connector color={theme.palette.textDim} />
          <StepRow
            icon={{ icon: "◇", color: theme.palette.warning }}
            label="API Key Required"
          >
            <Box flexDirection="column">
              <Text color={theme.palette.textMuted}>
                Enter your {provider} API key:
              </Text>
              <Box marginTop={1}>
                <Text color={theme.palette.primary}>❯ </Text>
                <Text>{inputValue ? "•".repeat(inputValue.length) : ""}</Text>
                <Text color={theme.palette.primary}>█</Text>
              </Box>
              <Box marginTop={1}>
                <Text color={theme.palette.info}>ℹ </Text>
                <Text color={theme.palette.textDim}>
                  Set {providerEnvVar} or AI_GATEWAY_API_KEY in .env instead
                </Text>
              </Box>
            </Box>
          </StepRow>
        </>
      )}

      {step !== "url" && config.videoUrl && (
        <Box marginTop={2}>
          <InfoBox borderStyle="round" width={55}>
            <InfoBox.Header icon="📝" label="Preview" />
            <InfoBox.Divider />
            <InfoBox.Row
              label="Video"
              value={config.videoUrl.slice(0, 35) + "..."}
            />
            <InfoBox.Row label="Model" value={config.model} />
            <InfoBox.Row
              label="Style"
              value={getStyleInfo(config.style).name}
            />
            <InfoBox.Row
              label="Output"
              value={`${config.sections} sections, ~${config.wordCount} words`}
            />
          </InfoBox>
        </Box>
      )}
    </Box>
  );
}

function StepRow({
  icon,
  label,
  hint,
  children,
}: {
  icon: { icon: string; color: string };
  label: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <Box flexDirection="column">
      <Box>
        <Text color={icon.color}>{icon.icon}</Text>
        <Text color={icon.color} bold={icon.icon === "◇"}>
          {" "}
          {label}
        </Text>
        {hint && <Text color="gray"> ({hint})</Text>}
      </Box>
      {children && (
        <Box marginLeft={2} flexDirection="column">
          {children}
        </Box>
      )}
    </Box>
  );
}

function Connector({ color }: { color: string }) {
  return (
    <Box paddingLeft={0}>
      <Text color={color}>│</Text>
    </Box>
  );
}
