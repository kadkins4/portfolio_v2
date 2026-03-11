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
    work: collection({
      label: "Work",
      slugField: "title",
      path: "content/work/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        description: fields.text({
          label: "Description",
          multiline: true,
        }),
        type: fields.select({
          label: "Type",
          options: [
            { label: "Project", value: "project" },
            { label: "Writing", value: "writing" },
            { label: "Hobby", value: "hobby" },
          ],
          defaultValue: "project",
        }),
        image: fields.image({
          label: "Image (optional, recommended: 1200x675px, 16:9)",
          directory: "public/images/work",
          publicPath: "/images/work",
        }),
        externalUrl: fields.url({ label: "External URL (optional)" }),
        date: fields.date({ label: "Date" }),
        content: fields.markdoc({ label: "Content" }),
      },
    }),
  },
});
