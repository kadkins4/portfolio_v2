import { config, collection, singleton, fields } from "@keystatic/core";

export default config({
  storage: { kind: "local" },

  singletons: {
    home: singleton({
      label: "Home Page",
      path: "content/home",
      schema: {
        badge: fields.text({ label: "Badge text", defaultValue: "Available for work" }),
        headline: fields.text({ label: "Headline" }),
        subheading: fields.text({ label: "Subheading", multiline: true }),
      },
    }),

    about: singleton({
      label: "About Page",
      path: "content/about",
      schema: {
        bio: fields.markdoc({ label: "Bio" }),
        skills: fields.array(
          fields.text({ label: "Skill" }),
          { label: "Skills", itemLabel: (props) => props.value ?? "Skill" }
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
                { label: "Reddit", value: "reddit" },
                { label: "LinkedIn", value: "linkedin" },
                { label: "Email", value: "email" },
              ],
              defaultValue: "github",
            }),
            url: fields.text({ label: "URL / email address" }),
            showInFooter: fields.checkbox({ label: "Show in footer", defaultValue: true }),
            showInContact: fields.checkbox({ label: "Show on contact page", defaultValue: true }),
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
        description: fields.text({ label: "Description", multiline: true }),
        tags: fields.array(
          fields.text({ label: "Tag" }),
          { label: "Tags", itemLabel: (props) => props.value ?? "Tag" }
        ),
        date: fields.date({ label: "Date" }),
        featured: fields.checkbox({ label: "Featured on home page", defaultValue: false }),
        liveUrl: fields.url({ label: "Live URL (optional)" }),
        repoUrl: fields.url({ label: "Repo URL (optional)" }),
        coverImage: fields.image({
          label: "Cover image (optional)",
          directory: "public/images/projects",
          publicPath: "/images/projects",
        }),
        content: fields.markdoc({ label: "Content" }),
      },
    }),

    posts: collection({
      label: "Blog Posts",
      slugField: "title",
      path: "content/posts/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        excerpt: fields.text({ label: "Excerpt", multiline: true }),
        date: fields.date({ label: "Date" }),
        tags: fields.array(
          fields.text({ label: "Tag" }),
          { label: "Tags", itemLabel: (props) => props.value ?? "Tag" }
        ),
        coverImage: fields.image({
          label: "Cover image (optional)",
          directory: "public/images/posts",
          publicPath: "/images/posts",
        }),
        content: fields.markdoc({ label: "Content" }),
      },
    }),
  },
});
