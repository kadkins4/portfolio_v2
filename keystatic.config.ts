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
        intro: fields.text({
          label: "Intro",
          description: "One-line introduction shown under the tagline.",
          multiline: true,
        }),
      },
    }),

    about: singleton({
      label: "About Page",
      path: "content/about",
      schema: {
        whatIDo: fields.markdoc({ label: "What I Do" }),
        howIGotHere: fields.markdoc({ label: "How I Got Here" }),
        outsideOfCode: fields.markdoc({ label: "Outside of Code" }),
        skills: fields.array(fields.text({ label: "Skill" }), {
          label: "Skills",
          itemLabel: (props) => props.value ?? "Skill",
        }),
        shelf: fields.array(
          fields.object({
            title: fields.text({ label: "Title" }),
            caption: fields.text({ label: "Caption", multiline: true }),
            emoji: fields.text({
              label: "Emoji",
              description: "A single emoji shown on the card.",
            }),
            accent: fields.select({
              label: "Accent color",
              options: [
                { label: "Pink", value: "pink" },
                { label: "Amber", value: "amber" },
                { label: "Cyan", value: "cyan" },
                { label: "Lavender", value: "lavender" },
                { label: "Green", value: "green" },
              ],
              defaultValue: "cyan",
            }),
          }),
          {
            label: "Shelf (life outside the code)",
            description: "Polaroid cards on the About page.",
            itemLabel: (props) => props.fields.title.value ?? "Card",
          }
        ),
      },
    }),

    resume: singleton({
      label: "Resume / Career Log",
      path: "content/resume",
      schema: {
        summary: fields.text({ label: "Summary", multiline: true }),
        bio: fields.text({
          label: "Site bio (resume ticket)",
          description: "Generated from resume.source.yaml — do not hand-edit.",
          multiline: true,
        }),
        resumePdf: fields.text({
          label: "Downloadable PDF path",
          description: "Path under /public. Keep in sync with the file there.",
        }),
        careerStart: fields.text({
          label: "Career start (YYYY-MM)",
          description: "Generated from resume.source.yaml — do not hand-edit.",
        }),
        status: fields.text({
          label: "Availability status",
          description: "Generated from resume.source.yaml — do not hand-edit.",
        }),
        updated: fields.text({
          label: "Last updated (YYYY.MM)",
          description: "Stamped by the resume sync — do not hand-edit.",
        }),
        skillGroups: fields.array(
          fields.object({
            label: fields.text({ label: "Group label" }),
            accent: fields.select({
              label: "Accent",
              options: [
                { label: "Cyan", value: "cyan" },
                { label: "Amber", value: "amber" },
                { label: "Pink", value: "pink" },
                { label: "Lavender", value: "lavender" },
                { label: "Green", value: "green" },
              ],
              defaultValue: "cyan",
            }),
            items: fields.array(fields.text({ label: "Skill" }), {
              label: "Skills",
              itemLabel: (p) => p.value ?? "Skill",
            }),
          }),
          {
            label: "Skill groups (resume ticket)",
            description:
              "Generated from resume.source.yaml — do not hand-edit.",
            itemLabel: (p) => p.fields.label.value ?? "Group",
          }
        ),
        experience: fields.array(
          fields.object({
            org: fields.text({ label: "Organization" }),
            role: fields.text({ label: "Role" }),
            period: fields.text({ label: "Period (e.g. Mar 2022 – Apr 2026)" }),
            detail: fields.text({
              label: "Context / products",
              multiline: true,
            }),
            highlights: fields.array(fields.text({ label: "Highlight" }), {
              label: "Highlights",
              itemLabel: (props) => props.value ?? "Highlight",
            }),
            tech: fields.array(fields.text({ label: "Tech" }), {
              label: "Tech",
              itemLabel: (props) => props.value ?? "Tech",
            }),
          }),
          {
            label: "Experience (engineering)",
            itemLabel: (props) =>
              `${props.fields.org.value ?? "Role"} — ${props.fields.role.value ?? ""}`,
          }
        ),
        earlier: fields.array(
          fields.object({
            org: fields.text({ label: "Organization" }),
            role: fields.text({ label: "Role" }),
            period: fields.text({ label: "Period" }),
            detail: fields.text({ label: "Detail", multiline: true }),
          }),
          {
            label: "Earlier experience",
            itemLabel: (props) =>
              `${props.fields.org.value ?? "Role"} — ${props.fields.role.value ?? ""}`,
          }
        ),
        education: fields.array(
          fields.object({
            school: fields.text({ label: "School" }),
            credential: fields.text({ label: "Credential" }),
            year: fields.text({ label: "Year" }),
          }),
          {
            label: "Education",
            itemLabel: (props) => props.fields.school.value ?? "School",
          }
        ),
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
        heroVideo: fields.file({
          label:
            "Hero Video (optional, short muted mp4 loop; image becomes the poster)",
          directory: "public/videos/projects",
          publicPath: "/videos/projects",
        }),
        externalUrl: fields.url({ label: "External URL (optional)" }),
        date: fields.date({ label: "Date" }),
        featured: fields.checkbox({
          label: "Featured",
          description: "Featured items appear first in the projects list",
          defaultValue: false,
        }),
        order: fields.integer({
          label: "Order (optional)",
          description:
            "Lower numbers appear first among featured items. Leave empty for date-based sorting.",
        }),
        district: fields.select({
          label: "District",
          description:
            "Neon-city category (sets the accent color + grouping). Auto derives it from the slug/tags.",
          options: [
            { label: "Auto (derive from slug)", value: "auto" },
            { label: "Sports", value: "sports" },
            { label: "Games", value: "games" },
            { label: "Tools", value: "tools" },
            { label: "Client Web", value: "client-web" },
          ],
          defaultValue: "auto",
        }),
        content: fields.markdoc({ label: "Content" }),
      },
    }),

    notes: collection({
      label: "Notes",
      slugField: "title",
      path: "content/notes/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        summary: fields.text({ label: "Summary", multiline: true }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (props) => props.value ?? "Tag",
        }),
        side: fields.select({
          label: "Side",
          description:
            "Which panel this note belongs to. Defaults to Craft; tag as Life to move it to the human side.",
          options: [
            { label: "Craft (cyan)", value: "craft" },
            { label: "Life (amber)", value: "life" },
          ],
          defaultValue: "craft",
        }),
        date: fields.date({ label: "Date" }),
        featured: fields.checkbox({
          label: "Featured",
          description: "Featured items appear first in the studio list",
          defaultValue: false,
        }),
        order: fields.integer({
          label: "Order (optional)",
          description:
            "Lower numbers appear first among featured items. Leave empty for date-based sorting.",
        }),
        image: fields.image({
          label: "Image (optional)",
          directory: "public/images/notes",
          publicPath: "/images/notes",
        }),
        sourcePath: fields.text({
          label: "Source path (managed by sync — do not edit)",
        }),
        content: fields.markdoc({ label: "Content" }),
      },
    }),
  },
});
