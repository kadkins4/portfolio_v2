import styles from "./Tag.module.css";

export type TagVariant = "default" | "skill" | "strength";

type Props = {
  variant?: TagVariant;
  children: React.ReactNode;
};

export default function Tag({ variant = "default", children }: Props) {
  return <span className={`${styles.tag} ${styles[variant]}`}>{children}</span>;
}
