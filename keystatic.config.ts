import { config, collection, singleton, fields } from "@keystatic/core";

export default config({
  storage: { kind: "local" },

  singletons: {
    home: singleton({
      label: "Home Page",
      path: "content/home",
      schema: {
        title: fields.text({ label: "Title" }),
        tagline: fields.text({ label: "Tagline" }),
      },
    }),

    about: singleton({
      label: "About Page",
      path: "content/about",
      schema: {
        bio: fields.markdoc({ label: "Bio" }),
        skills: fields.array(fields.text({ label: "Skill" }), {
          label: "Skills",
          itemLabel: (props) => props.value ?? "Skill",
        }),
        strengths: fields.array(fields.text({ label: "Strength" }), {
          label: "Strengths",
          itemLabel: (props) => props.value ?? "Strength",
        }),
        hobbies: fields.array(fields.text({ label: "Hobby" }), {
          label: "Hobbies",
          itemLabel: (props) => props.value ?? "Hobby",
        }),
      },
    }),

    siteSettings: singleton({
      label: "Site Settings",
      path: "content/site-settings",
      schema: {
        socialLinks: fields.array(
          fields.object({
            platform: fields.select({
              label: "Platform",
              options: [
                { label: "GitHub", value: "github" },
                { label: "Instagram", value: "instagram" },
                { label: "LinkedIn", value: "linkedin" },
              ],
              defaultValue: "github",
            }),
            url: fields.text({ label: "URL" }),
            showInFooter: fields.checkbox({
              label: "Show in footer",
              defaultValue: true,
            }),
          }),
          {
            label: "Social Links",
            itemLabel: (props) => props.fields.platform.value ?? "Link",
          }
        ),
      },
    }),
  },

  collections: {
    projects: collection({
      label: "Projects",
      slugField: "title",
      path: "content/projects/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        description: fields.text({
          label: "Description",
          multiline: true,
        }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          description: "Category tags (e.g., Game, Work, Tool, Mobile)",
          itemLabel: (props) => props.value ?? "Tag",
        }),
        image: fields.image({
          label: "Image (optional, recommended: 1200x675px, 16:9)",
          directory: "public/images/projects",
          publicPath: "/images/projects",
        }),
        imageFocus: fields.select({
          label: "Image Focus",
          description: "Which part of the image to keep visible when cropped",
          options: [
            { label: "Center", value: "center" },
            { label: "Top", value: "top" },
            { label: "Bottom", value: "bottom" },
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
          ],
          defaultValue: "center",
        }),
        externalUrl: fields.url({ label: "External URL (optional)" }),
        date: fields.date({ label: "Date" }),
        featured: fields.checkbox({
          label: "Featured",
          description: "Featured items appear first in the work list",
          defaultValue: false,
        }),
        order: fields.integer({
          label: "Order (optional)",
          description:
            "Lower numbers appear first among featured items. Leave empty for date-based sorting.",
        }),
        content: fields.markdoc({ label: "Content" }),
      },
    }),
  },
});
