import { normalizePath } from "../../../shared/normalizePath";
import log from "electron-log";
import { SqlQuery } from "../../lib/schemas";

const logger = log.scope("applaa_tag_parser");

export function getApplaaWriteTags(fullResponse: string): {
  path: string;
  content: string;
  description?: string;
}[] {
  const applaaWriteRegex = /<applaa-write([^>]*)>([\s\S]*?)<\/applaa-write>/gi;
  const pathRegex = /path="([^"]+)"/;
  const descriptionRegex = /description="([^"]+)"/;

  let match;
  const tags: { path: string; content: string; description?: string }[] = [];

  while ((match = applaaWriteRegex.exec(fullResponse)) !== null) {
    const attributesString = match[1];
    let content = match[2].trim();

    const pathMatch = pathRegex.exec(attributesString);
    const descriptionMatch = descriptionRegex.exec(attributesString);

    if (pathMatch && pathMatch[1]) {
      const path = pathMatch[1];
      const description = descriptionMatch?.[1];

      const contentLines = content.split("\n");
      if (contentLines[0]?.startsWith("```")) {
        contentLines.shift();
      }
      if (contentLines[contentLines.length - 1]?.startsWith("```")) {
        contentLines.pop();
      }
      content = contentLines.join("\n");

      tags.push({ path: normalizePath(path), content, description });
    } else {
      logger.warn(
        "Found <applaa-write> tag without a valid 'path' attribute:",
        match[0],
      );
    }
  }
  return tags;
}

export function getApplaaRenameTags(fullResponse: string): {
  from: string;
  to: string;
}[] {
  const applaaRenameRegex =
    /<applaa-rename from="([^"]+)" to="([^"]+)"[^>]*>([\s\S]*?)<\/applaa-rename>/g;
  let match;
  const tags: { from: string; to: string }[] = [];
  while ((match = applaaRenameRegex.exec(fullResponse)) !== null) {
    tags.push({
      from: normalizePath(match[1]),
      to: normalizePath(match[2]),
    });
  }
  return tags;
}

export function getApplaaDeleteTags(fullResponse: string): string[] {
  const applaaDeleteRegex =
    /<applaa-delete path="([^"]+)"[^>]*>([\s\S]*?)<\/applaa-delete>/g;
  let match;
  const paths: string[] = [];
  while ((match = applaaDeleteRegex.exec(fullResponse)) !== null) {
    paths.push(normalizePath(match[1]));
  }
  return paths;
}

export function getApplaaAddDependencyTags(fullResponse: string): string[] {
  const applaaAddDependencyRegex =
    /<applaa-add-dependency packages="([^"]+)">[^<]*<\/applaa-add-dependency>/g;
  let match;
  const packages: string[] = [];
  while ((match = applaaAddDependencyRegex.exec(fullResponse)) !== null) {
    packages.push(...match[1].split(" "));
  }
  return packages;
}

export function getApplaaChatSummaryTag(fullResponse: string): string | null {
  const applaaChatSummaryRegex =
    /<applaa-chat-summary>([\s\S]*?)<\/applaa-chat-summary>/g;
  const match = applaaChatSummaryRegex.exec(fullResponse);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

export function getApplaaExecuteSqlTags(fullResponse: string): SqlQuery[] {
  const applaaExecuteSqlRegex =
    /<applaa-execute-sql([^>]*)>([\s\S]*?)<\/applaa-execute-sql>/g;
  const descriptionRegex = /description="([^"]+)"/;
  let match;
  const queries: { content: string; description?: string }[] = [];

  while ((match = applaaExecuteSqlRegex.exec(fullResponse)) !== null) {
    const attributesString = match[1] || "";
    let content = match[2].trim();
    const descriptionMatch = descriptionRegex.exec(attributesString);
    const description = descriptionMatch?.[1];

    // Handle markdown code blocks if present
    const contentLines = content.split("\n");
    if (contentLines[0]?.startsWith("```")) {
      contentLines.shift();
    }
    if (contentLines[contentLines.length - 1]?.startsWith("```")) {
      contentLines.pop();
    }
    content = contentLines.join("\n");

    queries.push({ content, description });
  }

  return queries;
}

export function getApplaaCommandTags(fullResponse: string): string[] {
  const applaaCommandRegex =
    /<applaa-command type="([^"]+)"[^>]*><\/applaa-command>/g;
  let match;
  const commands: string[] = [];

  while ((match = applaaCommandRegex.exec(fullResponse)) !== null) {
    commands.push(match[1]);
  }

  return commands;
}

// Legacy support - keep the old function names but redirect to new ones
export const getDyadWriteTags = getApplaaWriteTags;
export const getDyadRenameTags = getApplaaRenameTags;
export const getDyadDeleteTags = getApplaaDeleteTags;
export const getDyadAddDependencyTags = getApplaaAddDependencyTags;
export const getDyadChatSummaryTag = getApplaaChatSummaryTag;
export const getDyadExecuteSqlTags = getApplaaExecuteSqlTags;
export const getDyadCommandTags = getApplaaCommandTags;
