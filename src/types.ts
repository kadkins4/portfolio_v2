export type WorkItem = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  image: string | null;
  imageFocus: string;
  blurDataURL?: string;
  externalUrl: string | null;
};
