"use client";

/**
 * Sanity Studio configuration — the editing dashboard embedded at /studio.
 * Singletons are enforced via the custom desk structure; create/delete actions
 * for them are hidden so the editor only ever edits the one document.
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes, SINGLETONS } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

export default defineConfig({
  name: "fitizens",
  title: "FITIZENS Content",
  projectId: projectId || "missing-project-id",
  dataset,
  basePath: "/studio",
  plugins: [
    // Presentation = live preview of the real site with click-to-edit overlays.
    presentationTool({
      previewUrl: {
        previewMode: { enable: "/api/draft-mode/enable" },
      },
    }),
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  schema: { types: schemaTypes },
  document: {
    // Hide "create new" / "delete" for singletons.
    actions: (prev, { schemaType }) =>
      (SINGLETONS as readonly string[]).includes(schemaType)
        ? prev.filter(({ action }) => action !== "duplicate" && action !== "delete" && action !== "unpublish")
        : prev,
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global"
        ? prev.filter((t) => !(SINGLETONS as readonly string[]).includes(t.templateId))
        : prev,
  },
});
