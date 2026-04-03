export type WorkItemType = "project" | "writing" | "hobby";

export type WorkItem = {
  slug: string;
  title: string;
  description: string;
  type: WorkItemType;
  image: string | null;
  imageFocus: string;
  blurDataURL?: string;
  externalUrl: string | null;
};
