import styles from "./Tag.module.css";

export type TagVariant = "project" | "writing" | "hobby" | "skill" | "strength";

type Props = {
  variant: TagVariant;
  children: React.ReactNode;
};

export default function Tag({ variant, children }: Props) {
  return <span className={`${styles.tag} ${styles[variant]}`}>{children}</span>;
}
